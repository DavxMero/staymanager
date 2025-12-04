'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
  Plus,
  Eye,
  Download,
  CreditCard,
  Banknote,
  Wallet,
  Edit
} from "lucide-react"
import { Invoice, BillingItem, Reservation, Guest, Room } from "@/types"
import { supabase } from "@/lib/supabaseClient"
import { billingItemsApi } from "@/lib/billingApi"
import { UnpaidBillingsList } from "@/components/billing/UnpaidBillingsList"
import { AddBillingItemForm } from "@/components/billing/AddBillingItemForm"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PendingPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddingBillingItem, setIsAddingBillingItem] = useState(false)
  const [unpaidBillings, setUnpaidBillings] = useState<BillingItem[]>([])
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState<"paid" | "pending" | "overdue">("pending")
  const [reservationId, setReservationId] = useState("")

  useEffect(() => {
    Promise.all([
      fetchInvoices(),
      fetchReservations(),
      fetchGuests(),
      fetchRooms()
    ])
  }, [])

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('status', 'pending') // Only fetch pending invoices
        .order('created_at', { ascending: false })

      if (error) throw error

      setInvoices(data)
    } catch (err) {
      console.error('Error fetching pending invoices:', err)
      setError('Failed to fetch pending invoices')
    }
  }

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setReservations(data)
    } catch (err) {
      console.error('Error fetching reservations:', err)
    }
  }

  const fetchGuests = async () => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('full_name')

      if (error) throw error

      setGuests(data || [])
    } catch (err) {
      console.error('Error fetching guests:', err)
    }
  }

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number')

      if (error) throw error

      setRooms(data || [])
    } catch (err) {
      console.error('Error fetching rooms:', err)
    }
  }

  const fetchUnpaidBillings = async (reservationId: number) => {
    try {
      const billings = await billingItemsApi.getUnpaidByReservationId(reservationId)
      setUnpaidBillings(billings)
    } catch (err) {
      console.error('Error fetching unpaid billings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch unpaid billings')
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsDialogOpen(true)
    // Fetch unpaid billings for this invoice's reservation
    fetchUnpaidBillings(invoice.reservation_id)
  }

  const handleAddBillingItem = async (billingItems: Omit<BillingItem, 'id' | 'created_at'>[]) => {
    try {
      // Add all billing items
      for (const item of billingItems) {
        await billingItemsApi.create(item)
      }
      // Refresh unpaid billings
      await fetchUnpaidBillings(selectedInvoice?.reservation_id || 0)
      setIsAddingBillingItem(false)
    } catch (err) {
      console.error('Error adding billing items:', err)
      setError(err instanceof Error ? err.message : 'Failed to add billing items')
    }
  }

  const handleUpdateBillingItem = async (id: number, updates: Partial<BillingItem>) => {
    try {
      await billingItemsApi.update(id, updates)
      // Refresh unpaid billings
      await fetchUnpaidBillings(selectedInvoice?.reservation_id || 0)
    } catch (err) {
      console.error('Error updating billing item:', err)
      setError(err instanceof Error ? err.message : 'Failed to update billing item')
    }
  }

  const getPendingInvoices = () => {
    return invoices.filter(invoice => invoice.status === 'pending')
  }

  const getTotalPendingAmount = () => {
    return getPendingInvoices().reduce((sum, invoice) => sum + invoice.amount, 0)
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pending Payments</h1>
          <p className="text-muted-foreground">Manage pending invoices and payments</p>
        </div>
        <Link href="/billing">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Billing
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payments Overview</CardTitle>
          <CardDescription>
            {getPendingInvoices().length} pending invoices totaling {formatCurrency(getTotalPendingAmount())}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getPendingInvoices().map((invoice) => {
              const reservation = reservations.find(r => r.id === invoice.reservation_id)
              const guest = guests.find(g => g.id === reservation?.guest_id)
              const room = rooms.find(r => r.id === reservation?.room_id)

              return (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Invoice #{invoice.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {guest ? guest.full_name : `Guest #${reservation?.guest_id}`} •
                      Room {room ? room.number : `#${reservation?.room_id}`} •
                      Due: {invoice.due_date ? format(new Date(invoice.due_date), "MMM dd, yyyy") : 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="font-medium">
                      {formatCurrency(invoice.amount)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              )
            })}

            {getPendingInvoices().length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No pending payments found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              View and manage pending invoice #{selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium">Invoice Information</h3>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const reservation = reservations.find(r => r.id === selectedInvoice.reservation_id)
                    const guest = guests.find(g => g.id === reservation?.guest_id)
                    const room = rooms.find(r => r.id === reservation?.room_id)
                    return `${guest ? guest.full_name : 'Guest #' + selectedInvoice.reservation_id} • Room ${room ? room.number : 'Room #' + selectedInvoice.reservation_id}`
                  })()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Amount: {formatCurrency(selectedInvoice.amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Due Date: {selectedInvoice.due_date ? format(new Date(selectedInvoice.due_date), "MMM dd, yyyy") : 'N/A'}
                </p>
                <Badge className="bg-yellow-100 text-yellow-800 mt-2">
                  Pending
                </Badge>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Unpaid Billings</h3>
                  <Button
                    size="sm"
                    onClick={() => setIsAddingBillingItem(true)}
                    disabled={isAddingBillingItem}
                  >
                    Add Item
                  </Button>
                </div>

                {isAddingBillingItem ? (
                  <div className="mb-4 p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Add New Billing Item</h4>
                    <AddBillingItemForm
                      reservationId={selectedInvoice.reservation_id}
                      onAddItem={handleAddBillingItem}
                      onCancel={() => setIsAddingBillingItem(false)}
                    />
                  </div>
                ) : null}

                {unpaidBillings.length > 0 ? (
                  <UnpaidBillingsList
                    billingItems={unpaidBillings}
                    onItemUpdate={handleUpdateBillingItem}
                    editable={true}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No unpaid billings for this reservation
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}