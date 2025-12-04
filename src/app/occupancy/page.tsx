'use client'

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Calendar,
  Filter,
  CheckCircle,
  Users,
  Building,
  RefreshCw,


  DollarSign,
  Phone,
  CreditCard,
  Mail,
  User,

  Utensils,
  Plus,
  Minus,
  Download,
  AlertTriangle,

} from "lucide-react"
import { Room } from "@/types"
import { supabase } from "@/lib/supabaseClient"
import { transformRoomsQuery, formatCurrency as formatCurrencyCompat } from "@/lib/database-compatibility"
import { format, addDays } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { PhoneInput } from "@/components/ui/phone-input"

const statusVariants = {
  available: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  occupied: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  reserved: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  cleaning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  maintenance: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  'out-of-order': "bg-red-200 text-red-900 dark:bg-red-900/30 dark:text-red-200 border border-red-300 dark:border-red-700",
}

// Checkout Dialog Component
interface CheckoutDialogProps {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckoutComplete: () => void
}

interface UnpaidBill {
  id: number
  description: string
  category: string
  quantity: number
  unit_price: number
  total_price: number
  service_date: string
  status: string
}

function CheckoutDialog({ room, open, onOpenChange, onCheckoutComplete }: CheckoutDialogProps) {
  const [reservation, setReservation] = useState<any>(null)
  const [unpaidBills, setUnpaidBills] = useState<UnpaidBill[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Security deposit management
  const [depositRefund, setDepositRefund] = useState(true) // Default: refund deposit
  const [depositAmount, setDepositAmount] = useState<number>(0)

  // Payment states for unpaid bills
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Cash POS states
  const [cashReceived, setCashReceived] = useState<number>(0)
  const [changeAmount, setChangeAmount] = useState<number>(0)

  // Success states
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [checkoutInvoice, setCheckoutInvoice] = useState<any>(null)

  const DEPOSIT_AMOUNT = 100000 // Standard deposit amount

  useEffect(() => {
    if (open && room) {
      fetchCheckoutData()
    }
  }, [open, room]) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate change for cash payments
  useEffect(() => {
    if (paymentMethod === 'cash' && cashReceived > 0) {
      const change = Math.max(0, cashReceived - paymentAmount)
      setChangeAmount(change)
    } else {
      setChangeAmount(0)
    }
  }, [cashReceived, paymentAmount, paymentMethod])

  const fetchCheckoutData = async () => {
    if (!room) return

    setLoading(true)
    setError("")

    try {
      // Fetch current reservation for this room
      const { data: reservationData, error: reservationError } = await supabase
        .from('reservations')
        .select('*')
        .eq('room_id', room.id)
        .eq('status', 'checked-in')
        .single()

      if (reservationError) {
        if (reservationError.code === 'PGRST116') {
          throw new Error('No active reservation found for this room')
        }
        throw reservationError
      }

      setReservation(reservationData)
      setDepositAmount(DEPOSIT_AMOUNT) // Set standard deposit amount

      // Fetch unpaid billing items for this reservation
      const { data: billingData, error: billingError } = await supabase
        .from('billing_items')
        .select('*')
        .eq('reservation_id', reservationData.id)
        .eq('status', 'pending')
        .order('service_date', { ascending: false })

      if (billingError) {
        console.error('Error fetching billing items:', billingError)
        // Continue even if billing fetch fails
      }

      const bills = billingData || []
      setUnpaidBills(bills)

      // Calculate total unpaid amount
      const totalUnpaid = bills.reduce((sum, bill) => sum + bill.total_price, 0)
      setPaymentAmount(totalUnpaid)

      console.log('Checkout data loaded:', {
        reservation: reservationData,
        unpaidBills: bills,
        totalUnpaid
      })

    } catch (err) {
      console.error('Error fetching checkout data:', err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Create checkout invoice
  const createCheckoutInvoice = async (paymentData: any) => {
    try {
      const invoiceNumber = `INV-OUT-${Date.now()}`
      const refundAmount = depositRefund ? depositAmount : 0
      const depositForfeit = depositRefund ? 0 : depositAmount

      const invoiceData = {
        invoice_number: invoiceNumber,
        reservation_id: reservation.id,
        guest_id: null,
        subtotal: paymentAmount,
        tax_amount: 0,
        service_charge: 0,
        discount_amount: refundAmount, // Deposit refund as "discount"
        total_amount: Math.max(0, paymentAmount - refundAmount + depositForfeit),
        status: 'paid',
        payment_method: paymentData.method || 'no_payment',
        payment_reference: paymentData.transaction_id || null,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        paid_at: new Date().toISOString(),
        notes: `Checkout - Room ${room?.number} | Deposit ${depositRefund ? 'Refunded' : 'Forfeited'}`,
        created_by: null
      }

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single()

      if (error) throw error

      return {
        ...invoice,
        guest_name: reservation.guest_name,
        room_number: room?.number,
        room_type: room?.type,
        unpaid_bills: unpaidBills,
        deposit_amount: depositAmount,
        deposit_refund: depositRefund,
        refund_amount: refundAmount,
        forfeit_amount: depositForfeit,
        cash_received: paymentData.method === 'cash' ? cashReceived : null,
        change_amount: paymentData.method === 'cash' ? changeAmount : null
      }
    } catch (error) {
      console.error('Error creating checkout invoice:', error)
      throw error
    }
  }

  // Print checkout invoice
  const printCheckoutInvoice = (invoiceData: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Checkout Invoice ${invoiceData.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .checkout-info { margin: 20px 0; background: #f0f8ff; padding: 15px; border-left: 4px solid #007bff; }
          .guest-info { margin: 20px 0; background: #f5f5f5; padding: 15px; }
          .line-items { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .line-items th, .line-items td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .line-items th { background-color: #f2f2f2; }
          .deposit-section { margin: 20px 0; padding: 15px; border: 2px solid #28a745; background: #d4edda; }
          .forfeit-section { margin: 20px 0; padding: 15px; border: 2px solid #dc3545; background: #f8d7da; }
          .total-section { margin: 20px 0; text-align: right; }
          .total-line { margin: 5px 0; }
          .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
          .thank-you { margin: 30px 0; text-align: center; background: #e8f5e8; padding: 20px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏨 StayManager Hotel</h1>
          <p>Checkout Invoice</p>
        </div>
        
        <div class="checkout-info">
          <strong>🚪 Checkout Information:</strong><br>
          Invoice #: ${invoiceData.invoice_number}<br>
          Date: ${new Date().toLocaleDateString()}<br>
          Time: ${new Date().toLocaleTimeString()}<br>
          Room: ${invoiceData.room_number} (${invoiceData.room_type})
        </div>
        
        <div class="guest-info">
          <strong>👤 Guest Information:</strong><br>
          Name: ${invoiceData.guest_name}<br>
          Check-out: ${new Date().toLocaleDateString()}<br>
          Status: <span style="color: blue;">CHECKED OUT</span>
        </div>
        
        ${invoiceData.unpaid_bills.length > 0 ? `
        <h3>📋 Additional Charges</h3>
        <table class="line-items">
          <thead>
            <tr>
              <th>Description</th>
              <th>Date</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.unpaid_bills.map((bill: UnpaidBill) => `
            <tr>
              <td>${bill.description}</td>
              <td>${new Date(bill.service_date).toLocaleDateString()}</td>
              <td>${bill.quantity}</td>
              <td>${formatCurrencyCompat(bill.unit_price)}</td>
              <td>${formatCurrencyCompat(bill.total_price)}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<div class="thank-you"><h3>✨ No Additional Charges</h3><p>Thank you for keeping your stay simple and clean!</p></div>'}
        
        ${invoiceData.deposit_refund ? `
        <div class="deposit-section">
          <strong>✅ Security Deposit Refund:</strong><br>
          Original Deposit: ${formatCurrencyCompat(invoiceData.deposit_amount)}<br>
          Room Condition: <strong>Good - Refund Approved</strong><br>
          Refund Amount: <strong>${formatCurrencyCompat(invoiceData.refund_amount)}</strong>
        </div>
        ` : `
        <div class="forfeit-section">
          <strong>⚠️ Security Deposit Forfeited:</strong><br>
          Original Deposit: ${formatCurrencyCompat(invoiceData.deposit_amount)}<br>
          Room Condition: <strong>Damages - Deposit Forfeited</strong><br>
          Forfeited Amount: <strong>${formatCurrencyCompat(invoiceData.forfeit_amount)}</strong>
        </div>
        `}
        
        <div class="total-section">
          ${invoiceData.unpaid_bills.length > 0 ? `<div class="total-line">Additional Charges: ${formatCurrencyCompat(invoiceData.subtotal)}</div>` : ''}
          ${invoiceData.deposit_refund ? `<div class="total-line" style="color: green;">Deposit Refund: -${formatCurrencyCompat(invoiceData.refund_amount)}</div>` : `<div class="total-line" style="color: red;">Deposit Forfeited: +${formatCurrencyCompat(invoiceData.forfeit_amount)}</div>`}
          <div class="total-line grand-total">Final Amount: ${formatCurrencyCompat(Math.abs(invoiceData.total_amount))}</div>
          ${invoiceData.total_amount < 0 ? '<p style="color: green; font-weight: bold;">Amount to be refunded to guest</p>' : ''}
          ${invoiceData.total_amount > 0 ? '<p style="color: red; font-weight: bold;">Amount collected from guest</p>' : ''}
        </div>
        
        ${invoiceData.cash_received ? `
        <div class="payment-info">
          <strong>💳 Payment Information:</strong><br>
          Method: ${invoiceData.payment_method.toUpperCase()}<br>
          Amount Paid: ${formatCurrencyCompat(invoiceData.cash_received)}<br>
          Change: ${formatCurrencyCompat(invoiceData.change_amount)}<br>
          Transaction ID: ${invoiceData.payment_reference}
        </div>
        ` : ''}
        
        <div class="thank-you">
          <h2>🙏 Thank You for Staying with Us!</h2>
          <p>We hope you enjoyed your stay and look forward to welcoming you back soon.</p>
          <p><strong>Safe travels! ✈️</strong></p>
        </div>
        
        <div class="footer">
          <p>Checked out on ${new Date().toLocaleString()}</p>
          <p>StayManager Hotel Management System</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  // Process checkout payment
  const processCheckoutPayment = async (method: string, amount: number) => {
    setPaymentLoading(true)
    try {
      // Validate cash payment
      if (method === 'cash' && cashReceived < amount) {
        throw new Error(`Insufficient cash. Received: ${formatCurrencyCompat(cashReceived)}, Required: ${formatCurrencyCompat(amount)}`)
      }

      console.log(`Processing checkout payment: ${formatCurrencyCompat(amount)} via ${method}`)

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      return {
        success: true,
        transaction_id: `PAY-OUT-${Date.now()}`,
        amount: amount,
        method: method,
        timestamp: new Date().toISOString(),
        cash_received: method === 'cash' ? cashReceived : null,
        change_amount: method === 'cash' ? changeAmount : null
      }
    } catch (error) {
      console.error('Checkout payment failed:', error)
      throw new Error(error instanceof Error ? error.message : 'Payment processing failed')
    } finally {
      setPaymentLoading(false)
    }
  }

  // Handle checkout process
  const handleCheckout = async () => {
    if (!reservation || !room) return

    setLoading(true)
    setError("")

    try {
      let paymentResult = null

      // Process payment only if there are unpaid bills AND amount > 0 after deposit calculation
      const finalAmount = paymentAmount - (depositRefund ? depositAmount : 0)
      if (unpaidBills.length > 0 && finalAmount > 0) {
        if (!paymentMethod) {
          setError('Please select a payment method for unpaid bills')
          setLoading(false)
          return
        }
        paymentResult = await processCheckoutPayment(paymentMethod, finalAmount)
      }

      // Update unpaid bills to paid
      if (unpaidBills.length > 0) {
        const { error: billingError } = await supabase
          .from('billing_items')
          .update({ status: 'paid' })
          .in('id', unpaidBills.map(bill => bill.id))

        if (billingError) throw billingError
      }

      // Update reservation to completed
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({
          status: 'checked-out',
          actual_check_out: new Date().toISOString()
        })
        .eq('id', reservation.id)

      if (reservationError) throw reservationError

      // Update room status to cleaning
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'cleaning' })
        .eq('id', room.id)

      if (roomError) throw roomError

      // Create checkout invoice
      const invoice = await createCheckoutInvoice(paymentResult || { method: 'no_payment', transaction_id: null })
      setCheckoutInvoice(invoice)

      // Show success screen
      setCheckoutSuccess(true)

    } catch (err) {
      console.error('Checkout error:', err)
      setError('Checkout failed: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading && !checkoutSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-slate-100 dark:bg-black border-slate-300 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle>Loading Checkout Data...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Success screen
  if (checkoutSuccess && checkoutInvoice) {
    return (
      <Dialog open={open} onOpenChange={(openState) => {
        if (!openState) {
          // Reset states
          setCheckoutSuccess(false)
          setCheckoutInvoice(null)
          onCheckoutComplete()
          onOpenChange(false)
        }
      }}>
        <DialogContent className="max-w-3xl bg-slate-100 dark:bg-black border-slate-300 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
              <CheckCircle className="h-6 w-6" />
              Checkout Completed!
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-gray-300">
              Guest has been successfully checked out from Room {room?.number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Checkout Summary */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Guest:</span>
                        <span className="font-semibold">{checkoutInvoice.guest_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Room:</span>
                        <span className="font-semibold">{checkoutInvoice.room_number} ({checkoutInvoice.room_type})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Invoice #:</span>
                        <span className="font-semibold">{checkoutInvoice.invoice_number}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Unpaid Bills:</span>
                        <span className="font-semibold">{checkoutInvoice.unpaid_bills.length} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Deposit Status:</span>
                        <span className={`font-semibold ${checkoutInvoice.deposit_refund ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                          {checkoutInvoice.deposit_refund ? 'Refunded' : 'Forfeited'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Final Amount:</span>
                        <span className={`font-bold text-lg ${checkoutInvoice.total_amount < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                          {checkoutInvoice.total_amount < 0 ? '-' : '+'}{formatCurrencyCompat(Math.abs(checkoutInvoice.total_amount))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => printCheckoutInvoice(checkoutInvoice)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Print Checkout Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCheckoutSuccess(false)
                  setCheckoutInvoice(null)
                  onCheckoutComplete()
                  onOpenChange(false)
                }}
              >
                Close
              </Button>
            </div>

            <div className="text-center text-sm text-slate-600 dark:text-gray-400">
              <p>🧹 Room status updated to &quot;Cleaning&quot;</p>
              <p>📋 Checkout invoice saved to billing records</p>
              <p>{checkoutInvoice.deposit_refund ? '💰 Please process deposit refund' : '⚠️ Security deposit has been forfeited'}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Main checkout dialog continues...
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-100 dark:bg-black border-slate-300 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-white">
            <CheckCircle className="h-6 w-6 text-slate-600 dark:text-gray-300" />
            Checkout Room {room?.number}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-gray-300">
            Process checkout for {reservation?.guest_name} from {room?.type} room
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] pr-2">
          <div className="space-y-6 py-4">
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Guest & Room Info */}
            <Card className="bg-slate-200 dark:bg-gray-900 border-slate-300 dark:border-gray-700">
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-800 dark:text-gray-100">Guest Information</h3>
                    <div className="text-sm space-y-1">
                      <div><span className="font-medium">Name:</span> {reservation?.guest_name}</div>
                      <div><span className="font-medium">Phone:</span> {reservation?.guest_phone}</div>
                      {reservation?.guest_email && <div><span className="font-medium">Email:</span> {reservation?.guest_email}</div>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-800 dark:text-gray-100">Stay Information</h3>
                    <div className="text-sm space-y-1">
                      <div><span className="font-medium">Room:</span> {room?.number} ({room?.type})</div>
                      <div><span className="font-medium">Check-in:</span> {reservation?.check_in_date ? format(new Date(reservation.check_in_date), 'dd MMM yyyy') : ''}</div>
                      <div><span className="font-medium">Check-out:</span> {format(new Date(), 'dd MMM yyyy')} (Today)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unpaid Bills Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Additional Charges
              </h3>

              {unpaidBills.length > 0 ? (
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                        <CreditCard className="h-4 w-4" />
                        <span className="font-medium">Outstanding Bills ({unpaidBills.length} items)</span>
                      </div>

                      <div className="space-y-2">
                        {unpaidBills.map((bill) => (
                          <div key={bill.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded border">
                            <div>
                              <div className="font-medium">{bill.description}</div>
                              <div className="text-sm text-slate-600 dark:text-gray-400">
                                {bill.category} • {format(new Date(bill.service_date), 'dd MMM yyyy')} • Qty: {bill.quantity}
                              </div>
                            </div>
                            <div className="font-semibold text-red-600 dark:text-red-400">
                              {formatCurrencyCompat(bill.total_price)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center p-3 bg-red-100 dark:bg-red-900/40 rounded font-semibold">
                        <span>Total Outstanding:</span>
                        <span className="text-lg text-red-700 dark:text-red-300">{formatCurrencyCompat(paymentAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                  <CardContent className="pt-6 pb-6">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600 dark:text-green-400" />
                      <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                        ✨ No Additional Charges
                      </h4>
                      <p className="text-green-700 dark:text-green-400">
                        Great! This guest has no unpaid bills. Ready for checkout.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Security Deposit Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Security Deposit Management
              </h3>

              <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-orange-800 dark:text-orange-300">Security Deposit Amount:</span>
                      <span className="font-bold text-lg text-orange-800 dark:text-orange-300">
                        {formatCurrencyCompat(depositAmount)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-medium text-orange-800 dark:text-orange-300">Room Condition Assessment:</Label>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="depositRefund"
                            checked={depositRefund}
                            onCheckedChange={(checked) => setDepositRefund(!!checked)}
                          />
                          <Label htmlFor="depositRefund" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            ✅ Room is in good condition - <strong>Refund deposit to guest</strong>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="depositForfeit"
                            checked={!depositRefund}
                            onCheckedChange={(checked) => setDepositRefund(!checked)}
                          />
                          <Label htmlFor="depositForfeit" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            ⚠️ Room has damages - <strong>Forfeit deposit</strong>
                          </Label>
                        </div>
                      </div>

                      {depositRefund ? (
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 rounded">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">Deposit will be refunded: {formatCurrencyCompat(depositAmount)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded">
                          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="font-medium">Deposit will be forfeited due to damages</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Section - Only show if there are unpaid bills and final amount > 0 */}
            {unpaidBills.length > 0 && (paymentAmount - (depositRefund ? depositAmount : 0)) > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Required
                </h3>

                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {/* Payment Calculation */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Outstanding bills:</span>
                          <span className="font-medium">{formatCurrencyCompat(paymentAmount)}</span>
                        </div>
                        {depositRefund && (
                          <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span>Less: Deposit refund:</span>
                            <span className="font-medium">-{formatCurrencyCompat(depositAmount)}</span>
                          </div>
                        )}
                        <hr className="border-yellow-300 dark:border-yellow-600" />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Amount to collect:</span>
                          <span className="text-yellow-700 dark:text-yellow-300">
                            {formatCurrencyCompat(Math.max(0, paymentAmount - (depositRefund ? depositAmount : 0)))}
                          </span>
                        </div>
                      </div>

                      {/* Payment Method Selection */}
                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={(value) => {
                          setPaymentMethod(value)
                          if (value !== 'cash') {
                            setCashReceived(0)
                            setChangeAmount(0)
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">💵 Cash</SelectItem>
                            <SelectItem value="card">💳 Credit/Debit Card</SelectItem>
                            <SelectItem value="transfer">🏦 Bank Transfer</SelectItem>
                            <SelectItem value="qris">📱 QRIS</SelectItem>
                            <SelectItem value="ewallet">📱 E-Wallet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Cash POS Interface for Checkout */}
                      {paymentMethod === 'cash' && (
                        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                          <CardContent className="pt-4">
                            <h5 className="font-semibold text-green-800 dark:text-green-300 mb-3">💰 Cash Payment</h5>

                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded border">
                                <span className="font-medium">Amount to Collect:</span>
                                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                  {formatCurrencyCompat(Math.max(0, paymentAmount - (depositRefund ? depositAmount : 0)))}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <Label>Cash Received</Label>
                                <Input
                                  type="number"
                                  value={cashReceived || ''}
                                  onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                                  placeholder="Enter cash received"
                                  className="h-12 text-lg font-medium text-center"
                                  min={0}
                                />
                              </div>

                              {cashReceived > 0 && (
                                <div className="space-y-2">
                                  {cashReceived < Math.max(0, paymentAmount - (depositRefund ? depositAmount : 0)) ? (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
                                      <div className="flex justify-between items-center text-red-700 dark:text-red-300">
                                        <span className="font-medium">⚠️ Insufficient Cash:</span>
                                        <span className="font-bold">
                                          Short: {formatCurrencyCompat(Math.max(0, paymentAmount - (depositRefund ? depositAmount : 0)) - cashReceived)}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-600 rounded">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium text-green-700 dark:text-green-300">✅ Change to Return:</span>
                                        <span className="text-xl font-bold text-green-700 dark:text-green-300">
                                          {formatCurrencyCompat(changeAmount)}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Final Summary */}
            <Card className="bg-slate-300 dark:bg-gray-800 border-slate-400 dark:border-gray-600">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Checkout Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Unpaid bills:</span>
                    <span>{unpaidBills.length > 0 ? formatCurrencyCompat(paymentAmount) : 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security deposit:</span>
                    <span className={depositRefund ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {depositRefund ? 'Will be refunded' : 'Will be forfeited'}
                    </span>
                  </div>
                  {unpaidBills.length > 0 && (
                    <>
                      <hr className="border-slate-400 dark:border-gray-600" />
                      <div className="flex justify-between font-bold text-base">
                        <span>Net amount:</span>
                        <span className={Math.max(0, paymentAmount - (depositRefund ? depositAmount : 0)) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                          {Math.max(0, paymentAmount - (depositRefund ? depositAmount : 0)) > 0
                            ? `Collect: ${formatCurrencyCompat(Math.max(0, paymentAmount - (depositRefund ? depositAmount : 0)))}`
                            : `Refund: ${formatCurrencyCompat(Math.abs(paymentAmount - (depositRefund ? depositAmount : 0)))}`
                          }
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={
              loading ||
              (unpaidBills.length > 0 &&
                Math.max(0, paymentAmount - (depositRefund ? depositAmount : 0)) > 0 &&
                (!paymentMethod || (paymentMethod === 'cash' && cashReceived < Math.max(0, paymentAmount - (depositRefund ? depositAmount : 0)))))
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing Checkout...
              </div>
            ) : (
              `Complete Checkout`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Check-in Dialog Component  
interface CheckinDialogProps {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckinComplete: () => void
}

function CheckinDialog({ room, open, onOpenChange, onCheckinComplete }: CheckinDialogProps) {
  const [reservations, setReservations] = useState<any[]>([])
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [isWalkIn, setIsWalkIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Track existing payments for selected reservation
  const [existingPayments, setExistingPayments] = useState<any[]>([])
  const [totalPaidAmount, setTotalPaidAmount] = useState(0)

  // Payment processing states
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>('')

  const [paymentLoading, setPaymentLoading] = useState(false)

  // POS system states for cash payments
  const [cashReceived, setCashReceived] = useState<number>(0)
  const [changeAmount, setChangeAmount] = useState<number>(0)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [invoiceData, setInvoiceData] = useState<any>(null)

  // Deposit requirement - 100k IDR
  const DEPOSIT_AMOUNT = 100000

  // Calculate nights for walk-in guests
  const calculateWalkInNights = (checkoutDate: Date) => {
    const today = new Date()
    const diffTime = checkoutDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays) // Minimum 1 night
  }

  // Walk-in guest details
  const [walkInName, setWalkInName] = useState("")
  const [walkInPhone, setWalkInPhone] = useState("")
  const [walkInEmail, setWalkInEmail] = useState("")
  const [walkInCheckoutDate, setWalkInCheckoutDate] = useState<Date>(addDays(new Date(), 1))
  const [walkInNights, setWalkInNights] = useState(1)

  // Breakfast options for walk-in
  const [walkInIncludeBreakfast, setWalkInIncludeBreakfast] = useState(false)
  const [walkInBreakfastQuantity, setWalkInBreakfastQuantity] = useState(1)
  const BREAKFAST_PRICE = 50000 // IDR per breakfast

  useEffect(() => {
    if (open && room) {
      fetchReservations()
    }
  }, [open, room])

  // Calculate total payment dynamically to avoid state sync issues
  const currentTotal = useMemo(() => {
    if (!room) return 0

    if (isWalkIn) {
      const roomTotal = room.price * walkInNights
      const breakfastTotal = walkInIncludeBreakfast ? (BREAKFAST_PRICE * walkInBreakfastQuantity * walkInNights) : 0
      return roomTotal + breakfastTotal + DEPOSIT_AMOUNT
    } else if (selectedReservation) {
      const reservationTotal = (selectedReservation.total_amount || room.price) + DEPOSIT_AMOUNT
      // Subtract any payments already made (e.g., from chatbot bookings)
      const remainingAmount = Math.max(0, reservationTotal - totalPaidAmount)
      return remainingAmount
    }

    return 0
  }, [isWalkIn, room, walkInNights, walkInIncludeBreakfast, walkInBreakfastQuantity, selectedReservation, DEPOSIT_AMOUNT, totalPaidAmount])

  // Update nights when walk-in checkout date changes
  useEffect(() => {
    if (isWalkIn && room && walkInCheckoutDate) {
      const nights = calculateWalkInNights(walkInCheckoutDate)
      setWalkInNights(nights)
    }
  }, [walkInCheckoutDate, isWalkIn, room])

  // Calculate change when cash received changes
  useEffect(() => {
    if (paymentMethod === 'cash' && cashReceived > 0) {
      const change = Math.max(0, cashReceived - currentTotal)
      setChangeAmount(change)
    } else {
      setChangeAmount(0)
    }
  }, [cashReceived, currentTotal, paymentMethod])

  // Fetch existing payments for a reservation
  const fetchExistingPayments = async (reservationId: string) => {
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('reservation_id', reservationId)
        .order('payment_date', { ascending: false })

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError)
        setExistingPayments([])
        setTotalPaidAmount(0)
        return
      }

      const payments = paymentsData || []
      const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)

      console.log(`Found ${payments.length} existing payments totaling ${totalPaid} for reservation`)
      setExistingPayments(payments)
      setTotalPaidAmount(totalPaid)
    } catch (err) {
      console.error('Error fetching existing payments:', err)
      setExistingPayments([])
      setTotalPaidAmount(0)
    }
  }

  const fetchReservations = async () => {
    if (!room) {
      console.log('No room selected, skipping reservation fetch')
      return
    }

    try {
      console.log(`Fetching reservations for room ${room.id} (${room.number})`)

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('room_id', room.id)
        .eq('status', 'confirmed')
        .order('check_in', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log(`Found ${data?.length || 0} reservations for room ${room.number}`)

      setReservations(data || [])
      if (data && data.length > 0) {
        // Auto-select first reservation
        const firstReservation = data[0]
        setSelectedReservation(firstReservation)
        setIsWalkIn(false)

        // Fetch existing payments for this reservation
        await fetchExistingPayments(firstReservation.id)
      } else {
        // Only allow walk-in if no reservations exist
        setIsWalkIn(true)
        setExistingPayments([])
        setTotalPaidAmount(0)
      }
      setError('') // Clear any previous errors
    } catch (err) {
      console.error('Error fetching reservations:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        roomId: room?.id,
        roomNumber: room?.number,
        errorObject: err
      })
      setError('Failed to fetch reservations: ' + (err instanceof Error ? err.message : 'Unknown error'))
      setReservations([])
      setIsWalkIn(true)
    }
  }



  // Create invoice and save to database
  const createInvoice = async (paymentData: any) => {
    try {
      const invoiceNumber = `INV-${Date.now()}`
      let roomTotal = 0
      let breakfastTotal = 0

      if (isWalkIn) {
        roomTotal = room ? room.price * walkInNights : 0
        breakfastTotal = walkInIncludeBreakfast ? (BREAKFAST_PRICE * walkInBreakfastQuantity * walkInNights) : 0
      } else if (selectedReservation) {
        roomTotal = selectedReservation.total_amount || 0
        breakfastTotal = 0
      }

      const invoiceData = {
        invoice_number: invoiceNumber,
        reservation_id: paymentData.reservationId,
        guest_id: isWalkIn ? paymentData.guestId : selectedReservation?.guest_id,
        subtotal: roomTotal + breakfastTotal,
        tax_amount: 0, // Add tax calculation if needed
        service_charge: 0,
        discount_amount: 0,
        total_amount: roomTotal + breakfastTotal + DEPOSIT_AMOUNT,
        status: 'paid',
        payment_method: paymentData.method,
        payment_reference: paymentData.transaction_id,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        paid_at: new Date().toISOString(),
        notes: `Check-in payment - Room ${room?.number}`,
        created_by: null // Add user ID when auth is implemented
      }

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single()

      if (error) {
        console.error('Error creating invoice:', error)
        throw error
      }

      return {
        ...invoice,
        guest_name: isWalkIn ? walkInName : selectedReservation?.guest_name,
        room_number: room?.number,
        room_type: room?.type,
        nights: isWalkIn ? walkInNights : (selectedReservation ? calculateWalkInNights(new Date(selectedReservation.check_out)) : 1),
        room_rate: room?.price,
        room_total: roomTotal,
        breakfast_included: isWalkIn ? walkInIncludeBreakfast : false,
        breakfast_quantity: isWalkIn ? walkInBreakfastQuantity : 0,
        breakfast_total: breakfastTotal,
        deposit_amount: DEPOSIT_AMOUNT,
        cash_received: paymentData.method === 'cash' ? cashReceived : null,
        change_amount: paymentData.method === 'cash' ? changeAmount : null
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw error
    }
  }

  // Print invoice function
  const printInvoice = (invoiceData: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceData.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .invoice-details { margin: 20px 0; }
          .guest-info { margin: 20px 0; background: #f5f5f5; padding: 15px; }
          .line-items { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .line-items th, .line-items td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .line-items th { background-color: #f2f2f2; }
          .total-section { margin: 20px 0; text-align: right; }
          .total-line { margin: 5px 0; }
          .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
          .payment-info { margin: 20px 0; background: #e8f5e8; padding: 15px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏨 StayManager Hotel</h1>
          <p>Payment Invoice</p>
        </div>
        
        <div class="invoice-details">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <strong>Invoice #:</strong> ${invoiceData.invoice_number}<br>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Time:</strong> ${new Date().toLocaleTimeString()}
            </div>
            <div>
              <strong>Room:</strong> ${invoiceData.room_number}<br>
              <strong>Type:</strong> ${invoiceData.room_type}<br>
              <strong>Status:</strong> <span style="color: green;">PAID</span>
            </div>
          </div>
        </div>

        <div class="guest-info">
          <strong>👤 Guest Information:</strong><br>
          Name: ${invoiceData.guest_name}<br>
          Check-in: ${new Date().toLocaleDateString()}<br>
          Check-out: ${new Date(invoiceData.checkout_date || Date.now()).toLocaleDateString()}<br>
          Nights: ${invoiceData.nights}
        </div>

        <table class="line-items">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Room Charge (${invoiceData.room_type})</td>
              <td>${invoiceData.nights} nights</td>
              <td>${formatCurrencyCompat(invoiceData.room_rate)}</td>
              <td>${formatCurrencyCompat(invoiceData.room_total)}</td>
            </tr>
            ${invoiceData.breakfast_included ? `
            <tr>
              <td>Breakfast</td>
              <td>${invoiceData.breakfast_quantity} × ${invoiceData.nights}</td>
              <td>${formatCurrencyCompat(BREAKFAST_PRICE)}</td>
              <td>${formatCurrencyCompat(invoiceData.breakfast_total)}</td>
            </tr>
            ` : ''}
            <tr style="background-color: #fff3cd;">
              <td><strong>Security Deposit</strong></td>
              <td>1</td>
              <td>${formatCurrencyCompat(DEPOSIT_AMOUNT)}</td>
              <td>${formatCurrencyCompat(DEPOSIT_AMOUNT)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-line">Subtotal: ${formatCurrencyCompat(invoiceData.subtotal)}</div>
          <div class="total-line">Security Deposit: ${formatCurrencyCompat(DEPOSIT_AMOUNT)}</div>
          <div class="total-line grand-total">Total Amount: ${formatCurrencyCompat(invoiceData.total_amount)}</div>
        </div>

        <div class="payment-info">
          <strong>💳 Payment Information:</strong><br>
          Method: ${invoiceData.payment_method.toUpperCase()}<br>
          ${invoiceData.cash_received ? `
            Amount Paid: ${formatCurrencyCompat(invoiceData.cash_received)}<br>
            Change: ${formatCurrencyCompat(invoiceData.change_amount)}<br>
          ` : ''}
          Transaction ID: ${invoiceData.payment_reference}<br>
          Status: <strong style="color: green;">PAID</strong>
        </div>

        <div class="footer">
          <p>⚠️ Security deposit will be refunded upon checkout (subject to room condition)</p>
          <p>Thank you for staying with us! • Printed on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  // Payment processing API
  const processPayment = async (method: string, amount: number) => {
    setPaymentLoading(true)
    try {
      // Validate cash payment
      if (method === 'cash' && cashReceived < amount) {
        throw new Error(`Insufficient cash. Received: ${formatCurrencyCompat(cashReceived)}, Required: ${formatCurrencyCompat(amount)}`)
      }

      // Simulate payment API call
      console.log(`Processing payment: ${formatCurrencyCompat(amount)} via ${method}`)

      // Mock payment API response
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In real implementation, call your payment gateway API here
      const paymentResponse = {
        success: true,
        transaction_id: `PAY-${Date.now()}`,
        amount: amount,
        method: method,
        timestamp: new Date().toISOString(),
        cash_received: method === 'cash' ? cashReceived : null,
        change_amount: method === 'cash' ? changeAmount : null,
        reservationId: null // Will be set after check-in
      }

      console.log('Payment successful:', paymentResponse)
      return paymentResponse
    } catch (error) {
      console.error('Payment failed:', error)
      throw new Error(error instanceof Error ? error.message : 'Payment processing failed')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!paymentMethod || currentTotal <= 0) {
      setError('Please select payment method and verify amount')
      return
    }

    if (!room) return

    setPaymentLoading(true)
    setError("")

    try {
      // 1. Process Payment
      const paymentResponse = await processPayment(paymentMethod, currentTotal)

      // 2. Perform Check-in
      let reservationId = null
      let guestId = null

      if (isWalkIn) {
        // Create walk-in reservation and check-in
        if (!walkInName.trim() || !walkInPhone.trim()) {
          throw new Error("Please fill in guest name and phone")
        }

        // Check/Create Guest
        let existingGuestId = null
        const conditions = []
        if (walkInEmail.trim()) conditions.push(`email.eq.${walkInEmail.trim()}`)
        if (walkInPhone.trim()) conditions.push(`phone.eq.${walkInPhone.trim()}`)

        if (conditions.length > 0) {
          const { data: existingGuest } = await supabase
            .from('guests')
            .select('id')
            .or(conditions.join(','))
            .maybeSingle()

          if (existingGuest) existingGuestId = existingGuest.id
        }

        if (existingGuestId) {
          guestId = existingGuestId
        } else {
          const { data: newGuest, error: createGuestError } = await supabase
            .from('guests')
            .insert({
              full_name: walkInName.trim(),
              email: walkInEmail.trim() || null,
              phone: walkInPhone.trim()
            })
            .select('id')
            .single()

          if (createGuestError) throw createGuestError
          guestId = newGuest.id
        }

        const checkInDate = new Date()
        const roomTotal = room.price * walkInNights
        const breakfastTotal = walkInIncludeBreakfast ? (BREAKFAST_PRICE * walkInBreakfastQuantity * walkInNights) : 0
        const bookingId = `BK-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

        const { data: reservation, error: reservationError } = await supabase
          .from('reservations')
          .insert({
            booking_id: bookingId,
            room_id: room.id,
            guest_id: guestId,
            guest_name: walkInName.trim(),
            guest_phone: walkInPhone.trim(),
            guest_email: walkInEmail.trim() || null,
            check_in: checkInDate.toISOString().split('T')[0],
            check_out: walkInCheckoutDate.toISOString().split('T')[0],
            room_rate: room.price,
            room_total: roomTotal,
            total_amount: currentTotal,
            status: 'checked-in',
            payment_status: 'paid',
            actual_check_in: checkInDate.toISOString(),
            breakfast_included: walkInIncludeBreakfast,
            breakfast_pax: walkInIncludeBreakfast ? walkInBreakfastQuantity : 0,
            breakfast_price: walkInIncludeBreakfast ? BREAKFAST_PRICE : 0,
            breakfast_total: breakfastTotal,
            adults: 1,
            children: 0
          })
          .select()
          .single()

        if (reservationError) throw reservationError
        reservationId = reservation.id
      } else {
        // Check-in existing reservation
        if (!selectedReservation) {
          throw new Error("Please select a reservation")
        }

        const { error: updateError } = await supabase
          .from('reservations')
          .update({
            status: 'checked-in',
            actual_check_in: new Date().toISOString(),
            payment_status: 'paid'
          })
          .eq('id', selectedReservation.id)

        if (updateError) throw updateError
        reservationId = selectedReservation.id
        guestId = selectedReservation.guest_id
      }

      // Update room status
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', room.id)

      if (roomError) throw roomError

      // 3. Create Invoice
      const invoice = await createInvoice({
        ...paymentResponse,
        reservationId,
        guestId
      })

      // 4. Create Payment Record (for Guests Page)
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          reservation_id: reservationId,
          amount: currentTotal,
          payment_method: paymentMethod,
          payment_date: new Date().toISOString(),
          transaction_id: paymentResponse.transaction_id
        })

      if (paymentError) {
        console.error('Error creating payment record:', paymentError)
        // Don't throw here, as the main flow (reservation + invoice) succeeded
      }

      // 4. Show Success
      setInvoiceData(invoice)
      setPaymentSuccess(true)

    } catch (error) {
      console.error('Payment failed:', error)
      setError('Payment failed: ' + (error as Error).message)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleCheckin = async () => {
    if (!room) return

    // Show payment dialog first
    if (!showPayment) {
      setShowPayment(true)
      return
    }

    setLoading(true)
    setError("")

    try {
      if (isWalkIn) {
        // Create walk-in reservation and check-in
        if (!walkInName.trim() || !walkInPhone.trim()) {
          setError("Please fill in guest name and phone")
          return
        }

        // 1. Check/Create Guest
        let guestId = null
        const conditions = []
        if (walkInEmail.trim()) conditions.push(`email.eq.${walkInEmail.trim()}`)
        if (walkInPhone.trim()) conditions.push(`phone.eq.${walkInPhone.trim()}`)

        if (conditions.length > 0) {
          const { data: existingGuest } = await supabase
            .from('guests')
            .select('id')
            .or(conditions.join(','))
            .maybeSingle()

          if (existingGuest) guestId = existingGuest.id
        }

        if (!guestId) {
          const { data: newGuest, error: createGuestError } = await supabase
            .from('guests')
            .insert({
              full_name: walkInName.trim(),
              email: walkInEmail.trim() || null,
              phone: walkInPhone.trim()
            })
            .select('id')
            .single()

          if (createGuestError) throw createGuestError
          guestId = newGuest.id
        }

        const checkInDate = new Date()
        const roomTotal = room.price * walkInNights
        const breakfastTotal = walkInIncludeBreakfast ? (BREAKFAST_PRICE * walkInBreakfastQuantity * walkInNights) : 0
        const bookingId = `BK-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

        const { data: reservation, error: reservationError } = await supabase
          .from('reservations')
          .insert({
            booking_id: bookingId,
            room_id: room.id,
            guest_id: guestId,
            guest_name: walkInName.trim(),
            guest_phone: walkInPhone.trim(),
            guest_email: walkInEmail.trim() || null,
            check_in: checkInDate.toISOString().split('T')[0], // DATE format
            check_out: walkInCheckoutDate.toISOString().split('T')[0], // DATE format
            room_rate: room.price,
            room_total: roomTotal,
            total_amount: currentTotal,
            status: 'checked-in',
            payment_status: 'pending',
            actual_check_in: checkInDate.toISOString(),
            breakfast_included: walkInIncludeBreakfast,
            breakfast_pax: walkInIncludeBreakfast ? walkInBreakfastQuantity : 0,
            breakfast_price: walkInIncludeBreakfast ? BREAKFAST_PRICE : 0,
            breakfast_total: breakfastTotal,
            adults: 1,
            children: 0
          })
          .select()
          .single()

        if (reservationError) throw reservationError
      } else {
        // Check-in existing reservation
        if (!selectedReservation) {
          setError("Please select a reservation")
          return
        }

        const { error: updateError } = await supabase
          .from('reservations')
          .update({
            status: 'checked-in',
            actual_check_in: new Date().toISOString()
          })
          .eq('id', selectedReservation.id)

        if (updateError) throw updateError
      }

      // Update room status to occupied
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', room.id)

      if (roomError) throw roomError

      console.log(`Room ${room.number} checked in successfully`)
      onCheckinComplete()
      onOpenChange(false)
    } catch (err) {
      console.error('Error during check-in:', err)
      setError('Failed to check-in: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Payment success screen
  if (paymentSuccess && invoiceData) {
    return (
      <Dialog open={open} onOpenChange={(openState) => {
        if (!openState) {
          // Reset all states when closing
          setPaymentSuccess(false)
          setInvoiceData(null)
          setShowPayment(false)
          setPaymentMethod('')
          setCashReceived(0)
          setChangeAmount(0)
          onCheckinComplete()
          onOpenChange(false)
        }
      }}>
        <DialogContent className="max-w-2xl bg-slate-100 dark:bg-black border-slate-300 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-green-600 dark:text-green-400">
              <CheckCircle className="h-6 w-6" />
              Payment Successful!
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-gray-300">
              Check-in completed for Room {room?.number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Success Summary */}
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Guest:</span>
                    <span className="font-semibold">{invoiceData.guest_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Room:</span>
                    <span className="font-semibold">{invoiceData.room_number} ({invoiceData.room_type})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Invoice #:</span>
                    <span className="font-semibold">{invoiceData.invoice_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Payment Method:</span>
                    <span className="font-semibold uppercase">{invoiceData.payment_method}</span>
                  </div>
                  {invoiceData.cash_received && (
                    <>
                      <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
                        <span className="font-medium">Cash Received:</span>
                        <span className="font-semibold">{formatCurrencyCompat(invoiceData.cash_received)}</span>
                      </div>
                      <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                        <span className="font-medium">Change Given:</span>
                        <span className="font-semibold">{formatCurrencyCompat(invoiceData.change_amount || 0)}</span>
                      </div>
                    </>
                  )}
                  <hr className="border-green-200 dark:border-green-700" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total Paid:</span>
                    <span className="font-bold text-xl text-green-600 dark:text-green-400">
                      {formatCurrencyCompat(invoiceData.total_amount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => printInvoice(invoiceData)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Print Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPaymentSuccess(false)
                  setInvoiceData(null)
                  setShowPayment(false)
                  onCheckinComplete()
                  onOpenChange(false)
                }}
              >
                Close
              </Button>
            </div>

            <div className="text-center text-sm text-slate-600 dark:text-gray-400">
              <p>✨ Room status has been updated to "Occupied"</p>
              <p>📋 Invoice has been saved to billing records</p>
              <p>🔄 You can view this invoice in the Billing page</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-slate-100 dark:bg-black border-slate-300 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-white">
            <CheckCircle className="h-6 w-6 text-slate-600 dark:text-gray-300" />
            Check-in Room {room?.number}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-gray-300">
            Check-in guest to {room?.type} room - {room?.price ? formatCurrencyCompat(room.price) : ''} per night
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] pr-2">
          <div className="space-y-6 py-4">

            {/* Room Info */}
            <Card className="bg-slate-200 dark:bg-gray-900 border-slate-300 dark:border-gray-700">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-gray-100">Room {room?.number}</h3>
                    <p className="text-slate-700 dark:text-gray-200">{room?.type}</p>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Floor {room?.floor || 'N/A'}</p>
                  </div>
                  <Badge className="bg-slate-300 dark:bg-gray-700 text-slate-800 dark:text-gray-200 border-slate-400 dark:border-gray-600">Ready for Check-in</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Guest Type Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-800 dark:text-white">Guest Information</h4>
                <div className="flex gap-2">
                  <Button
                    variant={!isWalkIn ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsWalkIn(false)}
                    disabled={reservations.length === 0}
                  >
                    With Reservation
                  </Button>
                  <Button
                    variant={isWalkIn ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsWalkIn(true)}
                    disabled={reservations.length > 0} // Disable walk-in if reservation exists
                  >
                    Walk-in Guest
                  </Button>
                </div>
              </div>

              {!isWalkIn ? (
                // Existing reservation
                <div className="space-y-4">
                  {reservations.length > 0 ? (
                    <div className="space-y-4">
                      <Label>Guest with Reservation</Label>
                      <Card className="bg-slate-300 dark:bg-gray-800 border-slate-400 dark:border-gray-600">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-gray-200">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                              <span className="font-medium">Guest:</span> <span className="font-semibold">{selectedReservation?.guest_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                              <span className="font-medium">Phone:</span> {selectedReservation?.guest_phone}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                              <span className="font-medium">Check-in:</span> {selectedReservation ? format(new Date(selectedReservation.check_in), 'dd MMM yyyy') : ''}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                              <span className="font-medium">Check-out:</span> {selectedReservation ? format(new Date(selectedReservation.check_out), 'dd MMM yyyy') : ''}
                            </div>
                            <div className="md:col-span-2 flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                              <span className="font-medium">Room Total:</span> <span className="font-semibold text-lg">{selectedReservation ? formatCurrencyCompat(selectedReservation.total_amount) : ''}</span>
                            </div>
                            <div className="md:col-span-2 flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              <span className="font-medium">Deposit Required:</span> <span className="font-semibold text-lg text-orange-600 dark:text-orange-400">{formatCurrencyCompat(DEPOSIT_AMOUNT)}</span>
                            </div>
                            <div className="md:col-span-2 flex items-center gap-2 p-2 bg-slate-400 dark:bg-gray-700 rounded-lg">
                              <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <span className="font-bold text-green-700 dark:text-green-300">Total Payment:</span> <span className="font-bold text-xl text-green-700 dark:text-green-300">{selectedReservation ? formatCurrencyCompat(selectedReservation.total_amount + DEPOSIT_AMOUNT) : ''}</span>
                            </div>
                            {selectedReservation?.guest_email && (
                              <div className="md:col-span-2 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                                <span className="font-medium">Email:</span> {selectedReservation.guest_email}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No confirmed reservations</p>
                      <p className="text-sm">Switch to Walk-in Guest to check-in without reservation</p>
                    </div>
                  )}
                </div>
              ) : (
                // Walk-in guest
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="walkInName" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Guest Full Name *
                      </Label>
                      <Input
                        id="walkInName"
                        value={walkInName}
                        onChange={(e) => setWalkInName(e.target.value)}
                        placeholder="Enter guest name"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="walkInPhone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number *
                      </Label>
                      <PhoneInput
                        id="walkInPhone"
                        value={walkInPhone}
                        onChange={setWalkInPhone}
                        placeholder="812-3456-7890"
                        className="h-11"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="walkInEmail" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <Input
                        id="walkInEmail"
                        type="email"
                        value={walkInEmail}
                        onChange={(e) => setWalkInEmail(e.target.value)}
                        placeholder="guest@example.com (optional)"
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Stay Details for Walk-in */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-slate-800 dark:text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Stay Details
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Check-in Date</Label>
                        <div className="h-11 px-3 py-2 bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md flex items-center font-medium">
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(new Date(), 'dd MMM yyyy')}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-gray-400">Today (immediate check-in)</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Check-out Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "h-11 w-full justify-start text-left font-normal border-slate-300 dark:border-gray-600",
                                !walkInCheckoutDate && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {walkInCheckoutDate ? format(walkInCheckoutDate, 'dd MMM yyyy') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={walkInCheckoutDate}
                              onSelect={(date) => date && setWalkInCheckoutDate(date)}
                              disabled={(date) => date <= new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>Number of Nights</Label>
                        <div className="h-11 px-3 py-2 bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md flex items-center justify-center font-bold text-lg">
                          {walkInNights} {walkInNights === 1 ? 'night' : 'nights'}
                        </div>
                      </div>
                    </div>

                    {/* Breakfast Options for Walk-in */}
                    <div className="space-y-4">
                      <h5 className="font-medium text-slate-800 dark:text-white flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        Breakfast Options
                      </h5>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="walkInBreakfast"
                            checked={walkInIncludeBreakfast}
                            onCheckedChange={(checked) => {
                              setWalkInIncludeBreakfast(!!checked)
                              if (!checked) setWalkInBreakfastQuantity(1)
                            }}
                          />
                          <Label htmlFor="walkInBreakfast" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Include breakfast ({formatCurrencyCompat(BREAKFAST_PRICE)} per person per day)
                          </Label>
                        </div>

                        {walkInIncludeBreakfast && (
                          <div className="ml-6 space-y-3">
                            <Label className="text-sm font-medium">Number of Breakfast Portions</Label>
                            <div className="flex items-center space-x-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0 border-slate-300 dark:border-gray-600"
                                onClick={() => setWalkInBreakfastQuantity(Math.max(1, walkInBreakfastQuantity - 1))}
                                disabled={walkInBreakfastQuantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <div className="w-16 text-center">
                                <div className="h-9 px-3 py-2 bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md flex items-center justify-center font-bold text-lg">
                                  {walkInBreakfastQuantity}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0 border-slate-300 dark:border-gray-600"
                                onClick={() => setWalkInBreakfastQuantity(walkInBreakfastQuantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-gray-800 p-2 rounded">
                              💡 Breakfast total: <span className="font-medium">{formatCurrencyCompat(BREAKFAST_PRICE * walkInBreakfastQuantity * walkInNights)}</span> ({walkInBreakfastQuantity} portion{walkInBreakfastQuantity > 1 ? 's' : ''} × {walkInNights} night{walkInNights > 1 ? 's' : ''})
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Walk-in Total Summary */}
                    <Card className="bg-slate-200 dark:bg-gray-700 border-slate-300 dark:border-gray-600">
                      <CardContent className="pt-3 pb-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Room rate per night:</span>
                            <span className="font-medium">{room ? formatCurrencyCompat(room.price) : ''}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Room total ({walkInNights} nights):</span>
                            <span className="font-semibold">{room ? formatCurrencyCompat(room.price * walkInNights) : ''}</span>
                          </div>
                          {walkInIncludeBreakfast && (
                            <div className="flex justify-between text-blue-600 dark:text-blue-400">
                              <span>Breakfast ({walkInBreakfastQuantity} × {walkInNights}):</span>
                              <span className="font-semibold">+ {formatCurrencyCompat(BREAKFAST_PRICE * walkInBreakfastQuantity * walkInNights)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-orange-600 dark:text-orange-400">
                            <span>Security deposit:</span>
                            <span className="font-semibold">+ {formatCurrencyCompat(DEPOSIT_AMOUNT)}</span>
                          </div>
                          <hr className="border-slate-300 dark:border-gray-500" />
                          <div className="flex justify-between font-bold text-lg text-green-600 dark:text-green-400">
                            <span>Total payment:</span>
                            <span>{room ? formatCurrencyCompat(currentTotal) : ''}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Processing Section */}
            {showPayment && (
              <Card className="bg-slate-300 dark:bg-gray-800 border-slate-400 dark:border-gray-600">
                <CardContent className="pt-4">
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Processing
                  </h4>

                  <div className="space-y-4">
                    {/* Existing Payments Section (for reservations with prior payments) */}
                    {!isWalkIn && existingPayments.length > 0 && (
                      <div className="space-y-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <h5 className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Payments Received
                        </h5>
                        {existingPayments.map((payment, idx) => (
                          <div key={payment.id || idx} className="flex justify-between items-center text-sm">
                            <span className="text-green-700 dark:text-green-400">
                              {new Date(payment.payment_date).toLocaleDateString()} - {payment.payment_method}
                            </span>
                            <span className="font-semibold text-green-700 dark:text-green-400">
                              {formatCurrencyCompat(payment.amount)}
                            </span>
                          </div>
                        ))}
                        <hr className="border-green-200 dark:border-green-700" />
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-green-800 dark:text-green-300">Total Paid:</span>
                          <span className="text-lg text-green-800 dark:text-green-300">
                            {formatCurrencyCompat(totalPaidAmount)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Payment Breakdown */}
                    <div className="space-y-2 p-3 bg-slate-200 dark:bg-gray-700 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Room Amount:</span>
                        <span className="font-semibold">
                          {room && formatCurrencyCompat(room.price * walkInNights)}
                        </span>
                      </div>
                      {isWalkIn && walkInIncludeBreakfast && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-blue-600 dark:text-blue-400">Breakfast:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrencyCompat(BREAKFAST_PRICE * walkInBreakfastQuantity * walkInNights)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-orange-600 dark:text-orange-400">Security Deposit:</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          {formatCurrencyCompat(DEPOSIT_AMOUNT)}
                        </span>
                      </div>
                      <hr className="border-slate-300 dark:border-gray-600" />
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">Total Payment:</span>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrencyCompat(currentTotal)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-gray-400 mt-2">
                        * Deposit will be refunded after check-out (subject to room condition)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={(value) => {
                        setPaymentMethod(value)
                        // Reset cash values when changing payment method
                        if (value !== 'cash') {
                          setCashReceived(0)
                          setChangeAmount(0)
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">💵 Cash (POS System)</SelectItem>
                          <SelectItem value="card">💳 Credit/Debit Card</SelectItem>
                          <SelectItem value="transfer">🏦 Bank Transfer</SelectItem>
                          <SelectItem value="qris">📱 QRIS</SelectItem>
                          <SelectItem value="ewallet">📱 E-Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Cash POS Interface */}
                    {paymentMethod === 'cash' && (
                      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
                        <CardContent className="pt-4">
                          <h5 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
                            💰 Cash POS System
                          </h5>

                          <div className="space-y-4">
                            {/* Amount to Pay */}
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                              <span className="font-medium">Amount to Pay:</span>
                              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrencyCompat(currentTotal)}
                              </span>
                            </div>

                            {/* Cash Received Input */}
                            <div className="space-y-2">
                              <Label htmlFor="cashReceived">Cash Received</Label>
                              <Input
                                id="cashReceived"
                                type="number"
                                value={cashReceived || ''}
                                onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                                placeholder="Enter amount received"
                                className="h-12 text-lg font-medium text-center"
                                min={0}
                              />
                            </div>

                            {/* Quick Amount Buttons */}
                            <div className="space-y-2">
                              <Label>Quick Amounts</Label>
                              <div className="grid grid-cols-3 gap-2">
                                {Array.from(new Set([
                                  Math.ceil(currentTotal / 50000) * 50000, // Round up to nearest 50k
                                  Math.ceil(currentTotal / 100000) * 100000, // Round up to nearest 100k
                                  Math.ceil(currentTotal / 500000) * 500000, // Round up to nearest 500k
                                ])).map((amount) => (
                                  <Button
                                    key={amount}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCashReceived(amount)}
                                    className="text-xs"
                                  >
                                    {formatCurrencyCompat(amount)}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Change Calculation */}
                            {cashReceived > 0 && (
                              <div className="space-y-2">
                                {cashReceived < currentTotal ? (
                                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                    <div className="flex justify-between items-center text-red-700 dark:text-red-300">
                                      <span className="font-medium">⚠️ Insufficient Cash:</span>
                                      <span className="font-bold">
                                        Short: {formatCurrencyCompat(currentTotal - cashReceived)}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-green-700 dark:text-green-300">✅ Change to Return:</span>
                                      <span className="text-xl font-bold text-green-700 dark:text-green-300">
                                        {formatCurrencyCompat(changeAmount)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowPayment(false)}
                        disabled={paymentLoading}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handlePayment}
                        disabled={!paymentMethod || paymentLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {paymentLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </div>
                        ) : (
                          `Pay ${formatCurrencyCompat(currentTotal)}`
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading || paymentLoading}>
            Cancel
          </Button>
          {!showPayment ? (
            <Button
              onClick={handleCheckin}
              disabled={loading || (!isWalkIn && !selectedReservation) || (isWalkIn && (!walkInName.trim() || !walkInPhone.trim()))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </Button>
          ) : (
            <Button
              onClick={handlePayment}
              disabled={!paymentMethod || paymentLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {paymentLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing Payment...
                </div>
              ) : (
                `Complete Check-in - ${formatCurrencyCompat(currentTotal)}`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function OccupancyPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [floorFilter, setFloorFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Dialog states
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false)
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)

  const applyFilters = useCallback(() => {
    let result = [...rooms]

    if (typeFilter !== "all") {
      result = result.filter(room => room.type === typeFilter)
    }

    if (floorFilter !== "all") {
      result = result.filter(room => room.floor === parseInt(floorFilter))
    }

    if (statusFilter !== "all") {
      result = result.filter(room => room.status === statusFilter)
    }

    setFilteredRooms(result)
  }, [rooms, typeFilter, floorFilter, statusFilter])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('number')

      if (roomsError) throw roomsError

      // Update room status based on current reservations
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('room_id, status')
        .in('status', ['confirmed', 'checked-in'])

      if (reservationsError) throw reservationsError

      const occupiedRoomIds = new Set(
        reservationsData.filter(r => r.status === 'checked-in').map(r => r.room_id)
      )
      const reservedRoomIds = new Set(
        reservationsData.filter(r => r.status === 'confirmed').map(r => r.room_id)
      )

      const updatedRooms = roomsData.map(room => {
        if (occupiedRoomIds.has(room.id)) {
          return { ...room, status: 'occupied' }
        } else if (reservedRoomIds.has(room.id)) {
          return { ...room, status: 'reserved' }
        }
        return room
      })

      const transformedRooms = transformRoomsQuery(updatedRooms)
      setRooms(transformedRooms)
    } catch (err) {
      console.error('Error fetching rooms:', err)
      setError('Failed to fetch rooms: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Open checkout dialog for occupied rooms
  const handleCheckout = (room: Room) => {
    setSelectedRoom(room)
    setCheckoutDialogOpen(true)
  }

  // Handle checkout completion
  const handleCheckoutComplete = async () => {
    await fetchRooms()
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // Get unique room types and floors for filters
  const roomTypes = [...new Set(rooms.map(room => room.type))]
  const floors = [...new Set(rooms.map(room => room.floor))].filter(f => f !== undefined && f !== null).sort((a, b) => (a as number) - (b as number))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate statistics
  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter(r => r.status === 'available').length,
    occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
    reservedRooms: rooms.filter(r => r.status === 'reserved').length,
    cleaningRooms: rooms.filter(r => r.status === 'cleaning').length,
  }

  const occupancyRate = stats.totalRooms > 0
    ? Math.round(((stats.occupiedRooms + stats.reservedRooms) / stats.totalRooms) * 100)
    : 0

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
            onClick={fetchRooms}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            Occupancy Management
          </h1>
          <p className="text-muted-foreground">Manage room bookings, check-ins, and check-outs</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchRooms}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">All rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableRooms}</div>
            <p className="text-xs text-muted-foreground">Ready for booking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupiedRooms}</div>
            <p className="text-xs text-muted-foreground">Guests staying</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reservedRooms}</div>
            <p className="text-xs text-muted-foreground">Confirmed bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">Current occupancy</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Room Occupancy</h2>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="typeFilter">Room Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="typeFilter">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {roomTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="floorFilter">Floor</Label>
                <Select value={floorFilter} onValueChange={setFloorFilter}>
                  <SelectTrigger id="floorFilter">
                    <SelectValue placeholder="All Floors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Floors</SelectItem>
                    {floors.map(floor => (
                      <SelectItem key={floor} value={floor.toString()}>Floor {floor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="statusFilter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="statusFilter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setTypeFilter("all")
                  setFloorFilter("all")
                  setStatusFilter("all")
                }}
              >
                Clear Filters
              </Button>
              <div className="text-sm text-muted-foreground">
                Showing {filteredRooms.length} of {rooms.length} rooms
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Room {room.number}
                {room.floor && (
                  <span className="block text-xs text-muted-foreground">
                    Floor {room.floor}
                  </span>
                )}
              </CardTitle>
              <Badge className={statusVariants[room.status || 'available']}>
                {room.status ? room.status.charAt(0).toUpperCase() + room.status.slice(1) : 'Available'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{room.type}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrencyCompat(room.price)} per night
              </p>

              {/* Occupancy Actions */}
              <div className="mt-4 space-y-3">
                <div className="flex space-x-2 flex-wrap gap-2">
                  {room.status === 'available' && (
                    <>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300"
                        onClick={() => {
                          setSelectedRoom(room)
                          setCheckinDialogOpen(true)
                        }}
                      >
                        🏠 Check-in
                      </Button>
                    </>
                  )}

                  {/* Out of Order - No actions available */}
                  {room.status === 'out-of-order' && (
                    <div className="text-xs text-red-600 dark:text-red-400 italic">
                      ⚠️ Room unavailable - undergoing major repairs
                    </div>
                  )}
                  {room.status === 'occupied' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300"
                      onClick={() => handleCheckout(room)}
                    >
                      🚪 Check-out
                    </Button>
                  )}
                  {room.status === 'reserved' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                      onClick={() => {
                        setSelectedRoom(room)
                        setCheckinDialogOpen(true)
                      }}
                    >
                      🏠 Check-in Guest
                    </Button>
                  )}
                </div>

                {/* Status Info */}
                {room.status === 'cleaning' && (
                  <div className="text-xs text-orange-600 font-medium flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                    🧹 Being cleaned - HIGH priority task active
                  </div>
                )}
                {room.status === 'maintenance' && (
                  <div className="text-xs text-blue-600 font-medium flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    🔧 Under maintenance - Temporary repair needed
                  </div>
                )}
                {room.status === 'out-of-order' && (
                  <div className="text-xs text-red-700 font-medium flex items-center gap-1 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                    🚫 OUT OF ORDER - Major repair/renovation required
                    <span className="text-xs text-red-600 dark:text-red-400 ml-2">
                      Cannot be booked until fixed
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>



      {/* Check-in Dialog */}
      <CheckinDialog
        room={selectedRoom}
        open={checkinDialogOpen}
        onOpenChange={setCheckinDialogOpen}
        onCheckinComplete={fetchRooms}
      />

      {/* Checkout Dialog */}
      <CheckoutDialog
        room={selectedRoom}
        open={checkoutDialogOpen}
        onOpenChange={setCheckoutDialogOpen}
        onCheckoutComplete={handleCheckoutComplete}
      />
    </motion.div>
  )
}
