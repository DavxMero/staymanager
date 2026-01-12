'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ModernBillingDashboard } from "@/components/billing/ModernBillingDashboard"
import { PaymentProcessing } from "@/components/billing/PaymentProcessing"
import { EnhancedInvoicesTable } from "@/components/billing/EnhancedInvoicesTable"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Download, CreditCard } from "lucide-react"
import { Invoice } from "@/types"
import { supabase } from "@/lib/supabaseClient"
import { formatCurrency as formatCurrencyCompat } from "@/lib/database-compatibility"

export default function ModernBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const [isAddInvoiceDialogOpen, setIsAddInvoiceDialogOpen] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  
  const [reservationId, setReservationId] = useState("")
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState<"paid" | "pending" | "overdue">("pending")
  
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [pendingPayments, setPendingPayments] = useState(0)
  const [overdueAmount, setOverdueAmount] = useState(0)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setInvoices(data)
      
      const totalRev = data.reduce((sum, invoice) => sum + (invoice.status === 'paid' ? invoice.amount : 0), 0)
      const pendingPay = data.reduce((sum, invoice) => sum + (invoice.status === 'pending' ? invoice.amount : 0), 0)
      const overdueAmt = data.reduce((sum, invoice) => sum + (invoice.status === 'overdue' ? invoice.amount : 0), 0)
      
      setTotalRevenue(totalRev)
      setPendingPayments(pendingPay)
      setOverdueAmount(overdueAmt)
    } catch (err) {
      console.error('Error fetching invoices:', err)
      setError('Failed to fetch invoices')
    }
  }

  const handleAddInvoice = () => {
    setReservationId("")
    setAmount("")
    setStatus("pending")
    setIsAddInvoiceDialogOpen(true)
  }

  const handleSaveInvoice = async () => {
    try {
      const { error } = await supabase
        .from('invoices')
        .insert({
          reservation_id: parseInt(reservationId),
          amount: parseFloat(amount),
          status: status,
          due_date: new Date().toISOString().split('T')[0]
        })
      
      if (error) throw error
      
      await fetchInvoices()
      setIsAddInvoiceDialogOpen(false)
    } catch (err) {
      console.error('Error saving invoice:', err)
      setError(err instanceof Error ? err.message : 'Failed to save invoice')
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    console.log("Viewing invoice:", invoice)
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    console.log("Downloading invoice:", invoice)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    console.log("Editing invoice:", invoice)
  }

  const handleProcessPayment = (amount: number) => {
    setPaymentAmount(amount)
    setIsPaymentProcessing(true)
  }

  const handlePaymentComplete = (method: string) => {
    console.log(`Payment of ${formatCurrencyCompat(paymentAmount)} completed via ${method}`)
    fetchInvoices()
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4"
      >
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            className="mt-2 bg-red-700 text-white px-4 py-2 rounded"
            onClick={fetchInvoices}
          >
            Retry
          </button>
        </div>
      </motion.div>
    )
  }

  if (isPaymentProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <PaymentProcessing 
          amount={paymentAmount} 
          onPaymentComplete={handlePaymentComplete}
          onBack={() => setIsPaymentProcessing(false)}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ModernBillingDashboard 
        totalRevenue={totalRevenue}
        pendingPayments={pendingPayments}
        overdueAmount={overdueAmount}
        invoices={invoices.slice(0, 5)}
      />
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleAddInvoice} className="gap-2">
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Reports
        </Button>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => handleProcessPayment(1500000)}
        >
          <CreditCard className="h-4 w-4" />
          Process Payment
        </Button>
      </div>
      
      {/* Enhanced Invoices Table */}
      <EnhancedInvoicesTable 
        invoices={invoices}
        onViewInvoice={handleViewInvoice}
        onDownloadInvoice={handleDownloadInvoice}
        onEditInvoice={handleEditInvoice}
      />
      
      {/* Add Invoice Dialog */}
      <Dialog open={isAddInvoiceDialogOpen} onOpenChange={setIsAddInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new invoice
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reservationId">Reservation ID</Label>
              <Input
                id="reservationId"
                type="number"
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
                placeholder="Enter reservation ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Rp)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in Rupiah"
              />
              {amount && (
                <div className="text-sm text-muted-foreground">
                  {formatCurrencyCompat(parseFloat(amount))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as "paid" | "pending" | "overdue")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddInvoiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveInvoice}
              disabled={!reservationId || !amount || parseFloat(amount) <= 0}
            >
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}