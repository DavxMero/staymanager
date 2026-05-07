'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Printer, 
  Plus, 
  CreditCard,
  Building,
  User,
  Calendar,
  Loader2
} from 'lucide-react'
import { formatCurrency as formatCurrencyCompat } from '@/lib/database-compatibility'
import { AddBillingItemForm } from '@/components/billing/AddBillingItemForm'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabaseClient'
import { Invoice, Reservation, BillingItem } from '@/types'

interface InvoiceDetailClientProps {
  invoice: Invoice
  reservation: any // Reservation + joined guests/rooms
  initialBillingItems: BillingItem[]
}

export function InvoiceDetailClient({ invoice, reservation, initialBillingItems }: InvoiceDetailClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<BillingItem[]>(initialBillingItems)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(invoice)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Status Badge Colors
  const statusColors = {
    paid: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    overdue: "bg-red-100 text-red-800 border-red-200"
  }

  const handleAddItems = async (newItems: Omit<BillingItem, 'id' | 'created_at'>[]) => {
    setIsProcessing(true)
    try {
      // 1. Insert items into database
      const { data: insertedItems, error: insertError } = await supabase
        .from('billing_items')
        .insert(newItems)
        .select('*')
      
      if (insertError) throw insertError

      // 2. Calculate new totals
      const newItemsTotal = newItems.reduce((sum, item) => sum + item.total_price, 0)
      const newSubtotal = currentInvoice.subtotal + newItemsTotal
      const newTotal = newSubtotal + currentInvoice.tax_amount - currentInvoice.discount_amount

      // 3. Update invoice in database
      const { data: updatedInvoice, error: updateError } = await supabase
        .from('invoices')
        .update({ 
          subtotal: newSubtotal,
          total_amount: newTotal,
          amount: newTotal // Keep UI alias synced
        })
        .eq('id', currentInvoice.id)
        .select()
        .single()
      
      if (updateError) throw updateError

      // 4. Update UI State
      setItems([...(insertedItems as BillingItem[]), ...items])
      setCurrentInvoice(updatedInvoice)
      setIsAddingItem(false)
    } catch (error) {
      console.error('Failed to add items:', error)
      alert('Failed to add items to invoice. See console for details.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleMarkAsPaid = async () => {
    if (confirm("Are you sure you want to mark this invoice as paid?")) {
      setIsProcessing(true)
      try {
        const { data: updatedInvoice, error } = await supabase
          .from('invoices')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', currentInvoice.id)
          .select()
          .single()
        
        if (error) throw error
        setCurrentInvoice(updatedInvoice)

        // Also update reservation payment status
        if (reservation?.id) {
          await supabase.from('reservations').update({ payment_status: 'paid' }).eq('id', reservation.id)
        }
      } catch (error) {
        console.error('Failed to mark as paid:', error)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 print:pb-0"
    >
      {/* Header Actions - hidden in print mode */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" className="gap-2" onClick={() => router.push('/billing')}>
          <ArrowLeft className="h-4 w-4" /> Back to Billing
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print Invoice
          </Button>
          {currentInvoice.status !== 'paid' && (
            <Button 
              className="gap-2 bg-green-600 hover:bg-green-700" 
              onClick={handleMarkAsPaid}
              disabled={isProcessing}
            >
              <CreditCard className="h-4 w-4" /> Mark as Paid
            </Button>
          )}
        </div>
      </div>

      {/* Main Invoice Card */}
      <Card className="print:shadow-none print:border-none print:m-0">
        <CardHeader className="flex flex-col md:flex-row justify-between border-b pb-6 space-y-4 md:space-y-0">
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Invoice #{currentInvoice.id}
              </CardTitle>
              <Badge className={statusColors[currentInvoice.status as keyof typeof statusColors] || "bg-gray-100"}>
                {currentInvoice.status.toUpperCase()}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4" /> Issued: {new Date(currentInvoice.created_at || '').toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="text-left md:text-right">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">StayManager Hotel</h3>
            <p className="text-sm text-gray-500">123 Hospitality Ave, Suite 100<br/>Business District<br/>contact@staymanager.com</p>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-8">
          {/* Guest & Reservation Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <User className="h-4 w-4" /> Billed To
              </h4>
              <div>
                <p className="font-bold text-lg">{reservation?.guest_name || 'Walk-in Guest'}</p>
                {reservation?.guests?.email && <p className="text-gray-600 dark:text-gray-400">{reservation.guests.email}</p>}
                {reservation?.guests?.phone && <p className="text-gray-600 dark:text-gray-400">{reservation.guests.phone}</p>}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Building className="h-4 w-4" /> Reservation Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Booking ID:</div>
                <div className="font-medium">{reservation?.booking_id}</div>
                <div className="text-gray-500">Room:</div>
                <div className="font-medium">#{reservation?.rooms?.number} ({reservation?.rooms?.type})</div>
                <div className="text-gray-500">Check In:</div>
                <div className="font-medium">{reservation?.check_in}</div>
                <div className="text-gray-500">Check Out:</div>
                <div className="font-medium">{reservation?.check_out}</div>
              </div>
            </div>
          </div>

          {/* Billing Items Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between print:hidden">
              <h3 className="text-xl font-semibold">Itemized Charges</h3>
              {currentInvoice.status !== 'paid' && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsAddingItem(true)}>
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              )}
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-center">Category</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* Base Room Charge - Injected from Reservation */}
                  {reservation && (
                    <tr className="bg-white dark:bg-slate-950">
                      <td className="px-4 py-4 font-medium">Accommodation (Room Rate)</td>
                      <td className="px-4 py-4 text-center"><Badge variant="outline">Room</Badge></td>
                      <td className="px-4 py-4 text-right">1</td>
                      <td className="px-4 py-4 text-right">{formatCurrencyCompat(reservation.room_total)}</td>
                      <td className="px-4 py-4 text-right font-medium">{formatCurrencyCompat(reservation.room_total)}</td>
                    </tr>
                  )}
                  
                  {/* Additional Items */}
                  {items.map((item) => (
                    <tr key={item.id} className="bg-white dark:bg-slate-950">
                      <td className="px-4 py-3">{item.item_name || item.description}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="secondary" className="capitalize">{item.category}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatCurrencyCompat(item.unit_price)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrencyCompat(item.total_price)}</td>
                    </tr>
                  ))}
                  
                  {items.length === 0 && !reservation && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No items found on this invoice.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end print:pt-8">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrencyCompat(currentInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium">{formatCurrencyCompat(currentInvoice.tax_amount)}</span>
              </div>
              {currentInvoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatCurrencyCompat(currentInvoice.discount_amount)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total Due</span>
                <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                  {formatCurrencyCompat(currentInvoice.total_amount)}
                </span>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="sm:max-w-[600px] print:hidden">
          <DialogHeader>
            <DialogTitle>Add Billing Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p>Processing items...</p>
              </div>
            ) : (
              <AddBillingItemForm 
                reservationId={reservation?.id?.toString() || currentInvoice.reservation_id}
                onAddItem={handleAddItems}
                onCancel={() => setIsAddingItem(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
