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
import { ChevronLeft, ChevronRight, Info } from "lucide-react"
import { Room } from "@/types"
import { supabase } from "@/lib/supabaseClient"
import { transformRoomsQuery, formatCurrency as formatCurrencyCompat } from "@/lib/database-compatibility"
import { format, addDays, subDays, eachDayOfInterval, isSameDay, parseISO, differenceInDays } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { cn, toLocalDateString } from "@/lib/utils"
import { PhoneInput } from "@/components/ui/phone-input"
import { adminFetchCalendarReservations, adminFetchGuestHistory, adminFetchActiveReservations, adminFetchCheckoutData, adminFetchCheckinReservations, adminFetchHousekeepingStaff } from "./actions"

const statusVariants: Record<string, string> = {
  available: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  occupied: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  reserved: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  cleaning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  maintenance: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  'out-of-order': "bg-red-200 text-red-900 dark:bg-red-900/30 dark:text-red-200 border border-red-300 dark:border-red-700",
}

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

  const [depositRefund, setDepositRefund] = useState(true)
  const [depositAmount, setDepositAmount] = useState<number>(0)

  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [cashReceived, setCashReceived] = useState<number>(0)
  const [changeAmount, setChangeAmount] = useState<number>(0)

  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [checkoutInvoice, setCheckoutInvoice] = useState<any>(null)

  const DEPOSIT_AMOUNT = 100000

  useEffect(() => {
    if (open && room) {
      fetchCheckoutData()
    }
  }, [open, room]) // eslint-disable-line react-hooks/exhaustive-deps

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
      const { reservation: reservationData, unpaidBills: bills } = await adminFetchCheckoutData(String(room.id))

      setReservation(reservationData)
      setDepositAmount(DEPOSIT_AMOUNT)

      setUnpaidBills(bills)

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
        discount_amount: refundAmount,
        total_amount: Math.max(0, paymentAmount - refundAmount + depositForfeit),
        status: 'paid',
        payment_method: paymentData.method || 'no_payment',
        payment_reference: paymentData.transaction_id || null,
        issue_date: toLocalDateString(new Date()),
        due_date: toLocalDateString(new Date()),
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

  const processCheckoutPayment = async (method: string, amount: number) => {
    setPaymentLoading(true)
    try {
      if (method === 'cash' && cashReceived < amount) {
        throw new Error(`Insufficient cash. Received: ${formatCurrencyCompat(cashReceived)}, Required: ${formatCurrencyCompat(amount)}`)
      }

      console.log(`Processing checkout payment: ${formatCurrencyCompat(amount)} via ${method}`)

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

  const handleCheckout = async () => {
    if (!reservation || !room) return

    setLoading(true)
    setError("")

    try {
      let paymentResult = null

      
      if (reservation.status === 'overdue') {
        const hasLateFee = unpaidBills.some(b => b.category === 'late_fee');
        if (!hasLateFee) {
          const daysLate = Math.max(1, differenceInDays(new Date(), new Date(reservation.check_out)))
          await supabase.from('billing_items').insert({
            reservation_id: reservation.id,
            room_id: room.id,
            guest_id: reservation.guest_id,
            item_name: 'Late Check-out Fee',
            description: `Keterlambatan checkout ${daysLate} hari`,
            category: 'late_fee',
            quantity: daysLate,
            unit_price: reservation.room_rate,
            total_price: daysLate * reservation.room_rate,
            service_date: new Date().toISOString(),
            status: 'pending',
            added_by: null
          })
          await fetchCheckoutData()
          return 
        }
      }

      const finalAmount = paymentAmount - (depositRefund ? depositAmount : 0)
      if (unpaidBills.length > 0 && finalAmount > 0) {
        if (!paymentMethod) {
          setError('Please select a payment method for unpaid bills')
          setLoading(false)
          return
        }
        paymentResult = await processCheckoutPayment(paymentMethod, finalAmount)
      }

      if (unpaidBills.length > 0) {
        const { error: billingError } = await supabase
          .from('billing_items')
          .update({ status: 'paid' })
          .in('id', unpaidBills.map(bill => bill.id))

        if (billingError) throw billingError
      }

      const { error: reservationError } = await supabase
        .from('reservations')
        .update({
          status: 'checked-out',
          actual_check_out: new Date().toISOString()
        })
        .eq('id', reservation.id)

      if (reservationError) throw reservationError

      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'cleaning' })
        .eq('id', room.id)

      if (roomError) throw roomError

      const invoice = await createCheckoutInvoice(paymentResult || { method: 'no_payment', transaction_id: null })
      setCheckoutInvoice(invoice)

      setCheckoutSuccess(true)

    } catch (err) {
      console.error('Checkout error:', err)
      setError('Checkout failed: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

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

  if (checkoutSuccess && checkoutInvoice) {
    return (
      <Dialog open={open} onOpenChange={(openState) => {
        if (!openState) {
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

            <div className="text-center text-sm text-slate-600 dark:text-gray-300">
              <p>🧹 Room status updated to &quot;Cleaning&quot;</p>
              <p>📋 Checkout invoice saved to billing records</p>
              <p>{checkoutInvoice.deposit_refund ? '💰 Please process deposit refund' : '⚠️ Security deposit has been forfeited'}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

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

            {reservation?.status !== 'checked-out' ? (
              <>

            {reservation?.status === 'overdue' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/25 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm mb-4">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>
                  Tamu ini melewati tanggal check-out ({format(new Date(reservation.check_out), 'dd MMM yyyy')}).
                  Late fee akan dihitung dan ditambahkan ke billing.
                </span>
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
                      <div><span className="font-medium">No. KTP:</span> {reservation?.guest_phone}</div>
                      {reservation?.guest_email && <div><span className="font-medium">Email:</span> {reservation?.guest_email}</div>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-800 dark:text-gray-100">Stay Information</h3>
                    <div className="text-sm space-y-1">
                      <div><span className="font-medium">Room:</span> {room?.number} ({room?.type})</div>
                      <div><span className="font-medium">Check-in:</span> {reservation?.check_in ? format(new Date(reservation.check_in), 'dd MMM yyyy') : ''}</div>
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
                              <div className="text-sm text-slate-600 dark:text-gray-300">
                                {bill.category} • {format(new Date(bill.service_date), 'dd MMM yyyy')} • Qty: {bill.quantity}
                              </div>
                            </div>
                            <div className="font-semibold text-red-600 dark:text-red-300">
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
                      <p className="text-green-700 dark:text-green-300">
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
            </>
            ) : (
              <div className="bg-slate-800 text-slate-100 p-6 rounded-lg mb-4 text-center border overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-1">Room Checked Out</h3>
                <p className="text-slate-300 text-sm">
                  This reservation has already been successfully checked out from the database. No further action is required.
                </p>
              </div>
            )}
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

  const [existingPayments, setExistingPayments] = useState<any[]>([])
  const [totalPaidAmount, setTotalPaidAmount] = useState(0)

  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>('')

  const [paymentLoading, setPaymentLoading] = useState(false)

  const [cashReceived, setCashReceived] = useState<number>(0)
  const [changeAmount, setChangeAmount] = useState<number>(0)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [invoiceData, setInvoiceData] = useState<any>(null)

  const DEPOSIT_AMOUNT = 100000

  const calculateWalkInNights = (checkoutDate: Date) => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const checkoutStart = new Date(checkoutDate)
    checkoutStart.setHours(0, 0, 0, 0)
    return Math.max(1, differenceInDays(checkoutStart, todayStart))
  }

  const [walkInName, setWalkInName] = useState("")
  const [walkInPhone, setWalkInPhone] = useState("")
  const [walkInEmail, setWalkInEmail] = useState("")
  const [walkInCheckoutDate, setWalkInCheckoutDate] = useState<Date>(addDays(new Date(), 1))
  const [walkInNights, setWalkInNights] = useState(1)

  const [walkInIncludeBreakfast, setWalkInIncludeBreakfast] = useState(false)
  const [walkInBreakfastQuantity, setWalkInBreakfastQuantity] = useState(1)
  const BREAKFAST_PRICE = 50000

  useEffect(() => {
    if (open && room) {
      fetchReservations()
    }
  }, [open, room])

  useEffect(() => {
    if (open) {
      const tomorrow = new Date()
      tomorrow.setHours(0, 0, 0, 0)
      tomorrow.setDate(tomorrow.getDate() + 1)
      setWalkInCheckoutDate(tomorrow)
    }
  }, [open])

  const currentTotal = useMemo(() => {
    if (!room) return 0

    if (isWalkIn) {
      const roomTotal = (((Number(room.price) || Number(room.base_price) || 0) || room.base_price || 0) || room.base_price || 0) * walkInNights
      const breakfastTotal = walkInIncludeBreakfast ? (BREAKFAST_PRICE * walkInBreakfastQuantity * walkInNights) : 0
      return roomTotal + breakfastTotal + DEPOSIT_AMOUNT
    } else if (selectedReservation) {
      const reservationTotal = (selectedReservation.total_amount || (((Number(room.price) || Number(room.base_price) || 0) || room.base_price || 0) || room.base_price || 0)) + DEPOSIT_AMOUNT
      const remainingAmount = Math.max(0, reservationTotal - totalPaidAmount)
      return remainingAmount
    }

    return 0
  }, [isWalkIn, room, walkInNights, walkInIncludeBreakfast, walkInBreakfastQuantity, selectedReservation, DEPOSIT_AMOUNT, totalPaidAmount])

  useEffect(() => {
    if (isWalkIn && room && walkInCheckoutDate) {
      const nights = calculateWalkInNights(walkInCheckoutDate)
      setWalkInNights(nights)
    }
  }, [walkInCheckoutDate, isWalkIn, room])

  useEffect(() => {
    if (paymentMethod === 'cash' && cashReceived > 0) {
      const change = Math.max(0, cashReceived - currentTotal)
      setChangeAmount(change)
    } else {
      setChangeAmount(0)
    }
  }, [cashReceived, currentTotal, paymentMethod])

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

      const data = await adminFetchCheckinReservations(String(room.id))

      console.log(`Found ${data?.length || 0} reservations for room ${room.number}`)

      setReservations(data || [])
      if (data && data.length > 0) {
        const firstReservation = data[0]
        setSelectedReservation(firstReservation)
        setIsWalkIn(false)

        await fetchExistingPayments(firstReservation.id)
      } else {
        setIsWalkIn(true)
        setExistingPayments([])
        setTotalPaidAmount(0)
      }
      setError('')
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


  const createInvoice = async (paymentData: any) => {
    try {
      const invoiceNumber = `INV-${Date.now()}`
      let roomTotal = 0
      let breakfastTotal = 0

      if (isWalkIn) {
        roomTotal = room ? (((Number(room.price) || Number(room.base_price) || 0) || room.base_price || 0) || room.base_price || 0) * walkInNights : 0
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
        tax_amount: 0,
        service_charge: 0,
        discount_amount: 0,
        total_amount: roomTotal + breakfastTotal + DEPOSIT_AMOUNT,
        status: 'paid',
        payment_method: paymentData.method,
        payment_reference: paymentData.transaction_id,
        issue_date: toLocalDateString(new Date()),
        due_date: toLocalDateString(new Date()),
        paid_at: new Date().toISOString(),
        notes: `Check-in payment - Room ${room?.number}`,
        created_by: null
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

  const processPayment = async (method: string, amount: number) => {
    setPaymentLoading(true)
    try {
      if (method === 'cash' && cashReceived < amount) {
        throw new Error(`Insufficient cash. Received: ${formatCurrencyCompat(cashReceived)}, Required: ${formatCurrencyCompat(amount)}`)
      }

      console.log(`Processing payment: ${formatCurrencyCompat(amount)} via ${method}`)

      await new Promise(resolve => setTimeout(resolve, 2000))

      const paymentResponse = {
        success: true,
        transaction_id: `PAY-${Date.now()}`,
        amount: amount,
        method: method,
        timestamp: new Date().toISOString(),
        cash_received: method === 'cash' ? cashReceived : null,
        change_amount: method === 'cash' ? changeAmount : null,
        reservationId: null
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
      const paymentResponse = await processPayment(paymentMethod, currentTotal)

      let reservationId = null
      let guestId = null

      if (isWalkIn) {
        if (!walkInName.trim() || !walkInPhone.trim()) {
          throw new Error("Please fill in guest name and phone")
        }

        let existingGuestId = null
        const conditions = []
        if (walkInEmail.trim()) conditions.push(`email.eq.${walkInEmail.trim()}`)
        if (walkInPhone.trim()) conditions.push(`id_number.eq.${walkInPhone.trim()}`)

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
              id_number: walkInPhone.trim()
            })
            .select('id')
            .single()

          if (createGuestError) throw createGuestError
          guestId = newGuest.id
        }

        const checkInDate = new Date()
        const checkInStart = new Date(checkInDate); checkInStart.setHours(0, 0, 0, 0)
        const minCheckout = new Date(checkInStart); minCheckout.setDate(minCheckout.getDate() + 1)
        const effectiveCheckoutDate = walkInCheckoutDate > minCheckout ? walkInCheckoutDate : minCheckout
        const effectiveNights = Math.max(1, walkInNights)
        const roomTotal = (((Number(room.price) || Number(room.base_price) || 0) || room.base_price || 0) || room.base_price || 0) * effectiveNights
        const breakfastTotal = walkInIncludeBreakfast ? (BREAKFAST_PRICE * walkInBreakfastQuantity * effectiveNights) : 0
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
            check_in: toLocalDateString(checkInDate),
            check_out: toLocalDateString(effectiveCheckoutDate),
            room_rate: (((Number(room.price) || Number(room.base_price) || 0) || room.base_price || 0) || room.base_price || 0),
            room_total: roomTotal,
            total_amount: currentTotal,
            total_price: currentTotal,
            room_number: room.number,
            room_type: room.type,
            guest_count: 1,
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
        if (!selectedReservation) {
          throw new Error("Please select a reservation")
        }

        const { error: updateError } = await supabase
          .from('reservations')
          .update({
            status: 'checked-in',
            actual_check_in: new Date().toISOString(),
            payment_status: 'paid',
            room_number: room.number,
            room_type: room.type
          })
          .eq('id', selectedReservation.id)

        if (updateError) throw updateError
        reservationId = selectedReservation.id
        guestId = selectedReservation.guest_id
      }

      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', room.id)

      if (roomError) throw roomError

      const invoice = await createInvoice({
        ...paymentResponse,
        reservationId,
        guestId
      })

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          reservation_id: reservationId,
          amount: currentTotal,
          payment_method: paymentMethod,
          payment_date: new Date().toISOString(),
          status: 'completed',
          transaction_id: paymentResponse.transaction_id,
          notes: `Check-in payment - Room ${room?.number}`
        })

      if (paymentError) {
        console.error('Error creating payment record:', paymentError)
      }

      setInvoiceData(invoice)
      setPaymentSuccess(true)

    } catch (error: any) {
      console.error('Payment failed:', error)
      const errDetail = error?.message || error?.error_description || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      setError('Payment failed: ' + errDetail)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleCheckin = async () => {
    if (!room) return

    if (!showPayment) {
      if (isWalkIn && (!walkInName.trim() || !walkInPhone.trim())) {
        setError("Nama tamu dan No. KTP wajib diisi")
        return
      }
      if (!isWalkIn && !selectedReservation) {
        setError("Pilih reservasi terlebih dahulu")
        return
      }
      setShowPayment(true)
    }
  }

  if (paymentSuccess && invoiceData) {
    return (
      <Dialog open={open} onOpenChange={(openState) => {
        if (!openState) {
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

            <div className="text-center text-sm text-slate-600 dark:text-gray-300">
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
            Check-in guest to {room?.type} room - {room?.price ? formatCurrencyCompat((((Number(room.price) || Number(room.base_price) || 0) || room.base_price || 0) || room.base_price || 0)) : ''} per night
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
                    <p className="text-sm text-slate-600 dark:text-gray-300">Floor {room?.floor || 'N/A'}</p>
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
                    disabled={reservations.length > 0}
                  >
                    Walk-in Guest
                  </Button>
                </div>
              </div>

              {!isWalkIn ? (
                <div className="space-y-4">
                  {reservations.length > 0 ? (
                    <div className="space-y-4">
                      <Label>Guest with Reservation</Label>
                      <Card className="bg-slate-300 dark:bg-gray-800 border-slate-400 dark:border-gray-600">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-gray-200">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-600 dark:text-gray-300" />
                              <span className="font-medium">Guest:</span> <span className="font-semibold">{selectedReservation?.guest_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-slate-600 dark:text-gray-300" />
                              <span className="font-medium">No. KTP:</span> {selectedReservation?.guest_phone}
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
                        <CreditCard className="h-4 w-4" />
                        No. KTP *
                      </Label>
                      <Input
                        id="walkInPhone"
                        value={walkInPhone}
                        onChange={(e) => setWalkInPhone(e.target.value)}
                        placeholder="Masukkan nomor KTP"
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
                            <span className="font-medium">{room ? formatCurrencyCompat((((Number(room.price) || Number(room.base_price) || 0) || room.base_price || 0) || room.base_price || 0)) : ''}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Room total ({walkInNights} nights):</span>
                            <span className="font-semibold">{room ? formatCurrencyCompat((((Number(room.price) || Number(room.base_price) || 0) || room.base_price || 0) || room.base_price || 0) * walkInNights) : ''}</span>
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
                          {room && formatCurrencyCompat((((Number(room.price) || Number(room.base_price) || 0) || room.base_price || 0) || room.base_price || 0) * walkInNights)}
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
                                  Math.ceil(currentTotal / 50000) * 50000,
                                  Math.ceil(currentTotal / 100000) * 100000,
                                  Math.ceil(currentTotal / 500000) * 500000,
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

function GuestHistoryDialog({ reservation, open, onOpenChange }: {
  reservation: any
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [history, setHistory] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [billingItems, setBillingItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && reservation) fetchHistory()
  }, [open, reservation])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const { history: historyData, payments: paymentsData, billingItems: billingData } = await adminFetchGuestHistory(reservation.guest_id, reservation.id)

      setHistory(historyData)
      setPayments(paymentsData)
      setBillingItems(billingData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-100 dark:bg-black border-slate-300 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>Guest History & Details</DialogTitle>
          <DialogDescription>
            Information about guest reservations and history
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg mb-2">Guest Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-gray-200">
                    <div><strong>Name:</strong> {reservation?.guest_name}</div>
                    <div><strong>No. KTP:</strong> {reservation?.guest_phone || '-'}</div>
                    <div><strong>Email:</strong> {reservation?.guest_email || '-'}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg mb-2">Current Stay Detail</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-gray-200 mb-4">
                    <div><strong>Check In (Actual):</strong> {reservation?.actual_check_in ? format(new Date(reservation.actual_check_in), 'dd MMM yyyy HH:mm') : '-'}</div>
                    <div><strong>Check Out (Actual):</strong> {reservation?.actual_check_out ? format(new Date(reservation.actual_check_out), 'dd MMM yyyy HH:mm') : '-'}</div>
                  </div>

                  <h4 className="font-medium mt-4 mb-2">Billing Items</h4>
                  <table className="w-full text-sm text-left border rounded">
                    <thead className="bg-slate-100 dark:bg-gray-800 border-b">
                      <tr>
                        <th className="py-2 px-3">Item</th>
                        <th className="py-2 px-3">Qty</th>
                        <th className="py-2 px-3">Total</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingItems.length > 0 ? billingItems.map((b, i) => (
                        <tr key={i} className="border-b dark:border-gray-700">
                          <td className="py-2 px-3">{b.item_name}</td>
                          <td className="py-2 px-3">{b.quantity}</td>
                          <td className="py-2 px-3">{b.total_price}</td>
                          <td className="py-2 px-3">{b.status}</td>
                        </tr>
                      )) : <tr><td colSpan={4} className="py-2 px-3 text-center">No additional bills</td></tr>}
                    </tbody>
                  </table>

                  <h4 className="font-medium mt-4 mb-2">Payments</h4>
                  <table className="w-full text-sm text-left border rounded">
                    <thead className="bg-slate-100 dark:bg-gray-800 border-b">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Method</th>
                        <th className="py-2 px-3">Amount</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length > 0 ? payments.map((p, i) => (
                        <tr key={i} className="border-b dark:border-gray-700">
                          <td className="py-2 px-3">{format(new Date(p.payment_date), 'dd MMM yyyy HH:mm')}</td>
                          <td className="py-2 px-3">{p.payment_method}</td>
                          <td className="py-2 px-3">{p.amount}</td>
                          <td className="py-2 px-3">{p.status}</td>
                        </tr>
                      )) : <tr><td colSpan={4} className="py-2 px-3 text-center">No payments found</td></tr>}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg mb-2">Past Visits (Last 10)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border rounded">
                      <thead className="bg-slate-100 dark:bg-gray-800 border-b">
                        <tr>
                          <th className="py-2 px-3">Room</th>
                          <th className="py-2 px-3">In</th>
                          <th className="py-2 px-3">Out</th>
                          <th className="py-2 px-3">Total</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map(h => (
                          <tr key={h.id} className="border-b dark:border-gray-700">
                            <td className="py-2 px-3">{h.room_number || '-'} ({h.room_type || '-'})</td>
                            <td className="py-2 px-3">{h.check_in}</td>
                            <td className="py-2 px-3">{h.check_out}</td>
                            <td className="py-2 px-3">{h.total_amount}</td>
                            <td className="py-2 px-3">
                              <Badge variant="outline">{h.status}</Badge>
                            </td>
                          </tr>
                        ))}
                        {history.length === 0 && (
                          <tr><td colSpan={5} className="py-2 px-3 text-center">No past visits</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CalendarBookingDialog({ room, date, open, onOpenChange, onReservationComplete }: {
  room: Room | null
  date: Date | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReservationComplete: () => void
}) {
  const [guestName, setGuestName] = useState("")
  const [guestIdNumber, setGuestIdNumber] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [checkoutDate, setCheckoutDate] = useState<Date>(addDays(new Date(), 1))
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open && date) {
      setCheckoutDate(addDays(date, 1))
      setGuestName("")
      setGuestIdNumber("")
      setGuestEmail("")
      setAdults(1)
      setChildren(0)
      setError("")
    }
  }, [open, date])

  const nights = date && checkoutDate ? Math.max(1, differenceInDays(checkoutDate, date)) : 1
  const roomRate = room ? (Number(room.price) || Number(room.base_price) || 0) : 0
  const totalAmount = roomRate * nights

  const handleCreateReservation = async () => {
    if (!room || !date) return
    if (!guestName.trim() || !guestIdNumber.trim()) {
      setError("Nama tamu dan No. KTP wajib diisi")
      return
    }
    setLoading(true)
    setError("")

    try {
      let guestId = null
      const { data: existingGuest } = await supabase
        .from('guests')
        .select('id')
        .eq('id_number', guestIdNumber.trim())
        .maybeSingle()

      if (existingGuest) {
        guestId = existingGuest.id
      } else {
        const { data: newGuest, error: guestError } = await supabase
          .from('guests')
          .insert({
            full_name: guestName.trim(),
            id_number: guestIdNumber.trim(),
            email: guestEmail.trim() || null
          })
          .select('id')
          .single()

        if (guestError) throw guestError
        guestId = newGuest.id
      }

      const bookingId = `BK-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      const { error: resError } = await supabase
        .from('reservations')
        .insert({
          booking_id: bookingId,
          room_id: room.id,
          guest_id: guestId,
          guest_name: guestName.trim(),
          guest_phone: guestIdNumber.trim(),
          guest_email: guestEmail.trim() || null,
          check_in: format(date, 'yyyy-MM-dd'),
          check_out: format(checkoutDate, 'yyyy-MM-dd'),
          room_rate: roomRate,
          room_total: totalAmount,
          total_amount: totalAmount,
          total_price: totalAmount,
          room_number: room.number,
          room_type: room.type,
          guest_count: adults + children,
          adults,
          children,
          status: 'confirmed',
          payment_status: 'pending',
          breakfast_included: false,
          breakfast_pax: 0,
          breakfast_price: 0,
          breakfast_total: 0,
        })

      if (resError) throw resError

      onReservationComplete()
      onOpenChange(false)
    } catch (err) {
      console.error('Error creating reservation:', err)
      setError('Gagal membuat reservasi: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-slate-100 dark:bg-black border-slate-300 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-white">
            <Calendar className="h-6 w-6 text-blue-600" />
            Reservasi Baru — Kamar {room?.number}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-gray-300">
            Buat reservasi untuk {date ? format(date, 'dd MMMM yyyy', { locale: localeId }) : ''} — {room?.type} ({formatCurrencyCompat(roomRate)}/malam)
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[65vh] pr-2">
          <div className="space-y-6 py-4">
            {/* Guest Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nama Tamu *
                </Label>
                <Input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Nama lengkap tamu" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  No. KTP *
                </Label>
                <Input value={guestIdNumber} onChange={e => setGuestIdNumber(e.target.value)} placeholder="Masukkan nomor KTP" className="h-11" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="email@contoh.com (opsional)" className="h-11" />
              </div>
            </div>

            {/* Stay Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Check-in</Label>
                <div className="h-11 px-3 py-2 bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md flex items-center font-medium text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd MMM yyyy') : ''}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Check-out</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-11 w-full justify-start text-left font-normal border-slate-300 dark:border-gray-600")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(checkoutDate, 'dd MMM yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50">
                    <CalendarComponent
                      mode="single"
                      selected={checkoutDate}
                      onSelect={(d) => d && setCheckoutDate(d)}
                      disabled={(d) => d <= (date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Durasi Menginap</Label>
                <div className="h-11 px-3 py-2 bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md flex items-center justify-center font-bold text-lg">
                  {nights} malam
                </div>
              </div>
            </div>

            {/* Guest Count */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dewasa</Label>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1}><Minus className="h-4 w-4" /></Button>
                  <div className="h-9 w-12 flex items-center justify-center bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md font-bold">{adults}</div>
                  <Button type="button" variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => setAdults(adults + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Anak-anak</Label>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0}><Minus className="h-4 w-4" /></Button>
                  <div className="h-9 w-12 flex items-center justify-center bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md font-bold">{children}</div>
                  <Button type="button" variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => setChildren(children + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <Card className="bg-slate-200 dark:bg-gray-700 border-slate-300 dark:border-gray-600">
              <CardContent className="pt-3 pb-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tarif per malam:</span>
                    <span className="font-medium">{formatCurrencyCompat(roomRate)}</span>
                  </div>
                  <hr className="border-slate-300 dark:border-gray-500" />
                  <div className="flex justify-between font-bold text-lg text-blue-600 dark:text-blue-400">
                    <span>Total ({nights} malam):</span>
                    <span>{formatCurrencyCompat(totalAmount)}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-400">* Pembayaran dilakukan saat check-in</p>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-700 dark:text-red-300">
                {error}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Batal</Button>
          <Button
            onClick={handleCreateReservation}
            disabled={loading || !guestName.trim() || !guestIdNumber.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Memproses...
              </div>
            ) : (
              "Buat Reservasi"
            )}
          </Button>
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

  // Calendar State
  const [calendarStartDate, setCalendarStartDate] = useState(new Date())
  const [calendarReservations, setCalendarReservations] = useState<any[]>([])
  
  const fetchCalendarReservations = async (startDate: Date) => {
    try {
      // Fetch -1 day to +14 days to cover full spans
      const endDate = addDays(startDate, 14)
      const data = await adminFetchCalendarReservations(format(subDays(startDate, 1), 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))
      
      setCalendarReservations(data)
    } catch (err) {
      console.error('Error fetching calendar reservations:', err)
    }
  }

  useEffect(() => {
    fetchCalendarReservations(calendarStartDate)
  }, [calendarStartDate])

  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [floorFilter, setFloorFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false)
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [selectedHistoryReservation, setSelectedHistoryReservation] = useState<any>(null)
  const [calendarBookingDialogOpen, setCalendarBookingDialogOpen] = useState(false)
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(null)
  const [housekeepingStaff, setHousekeepingStaff] = useState<any[]>([])

  // Cleaning confirmation dialog state
  const [cleaningDialogRoom, setCleaningDialogRoom] = useState<Room | null>(null)
  const [cleaningAssignedTo, setCleaningAssignedTo] = useState<string>("")
  const [cleaningSubmitting, setCleaningSubmitting] = useState(false)

  const handleConfirmRoomCleaned = async () => {
    if (!cleaningDialogRoom) return
    setCleaningSubmitting(true)
    try {
      const { error: updateErr } = await supabase
        .from('rooms')
        .update({ status: 'available' })
        .eq('id', cleaningDialogRoom.id)
      if (updateErr) throw updateErr

      // Try to log who cleaned (best-effort — silently skip if table/cols differ)
      if (cleaningAssignedTo) {
        try {
          await supabase.from('housekeeping_tasks').insert({
            room_id: cleaningDialogRoom.id,
            assigned_to: cleaningAssignedTo,
            status: 'completed',
            task_type: 'checkout',
            title: `Cleaning kamar ${cleaningDialogRoom.number}`,
            completed_at: new Date().toISOString(),
          })
        } catch (logErr) {
          // Logging failure is non-fatal — room status is already updated
          console.warn('Housekeeping task log failed (non-fatal):', logErr)
        }
      }

      await fetchRooms()
      setCleaningDialogRoom(null)
      setCleaningAssignedTo("")
    } catch (err) {
      console.error('Error marking room clean:', err)
      setError('Gagal menandai kamar bersih: ' + (err as Error).message)
    } finally {
      setCleaningSubmitting(false)
    }
  }

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

      const reservationsData = await adminFetchActiveReservations()

      const occupiedRoomIds = new Set(
        reservationsData.filter((r: any) => r.status === 'checked-in').map((r: any) => r.room_id)
      )
      const reservedRoomIds = new Set(
        reservationsData.filter((r: any) => r.status === 'confirmed').map((r: any) => r.room_id)
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

  const handleCheckout = (room: Room) => {
    setSelectedRoom(room)
    setCheckoutDialogOpen(true)
  }

  const handleCheckoutComplete = async () => {
    await fetchRooms()
    await fetchCalendarReservations(calendarStartDate)
  }

  const fetchRoomsCallback = useCallback(fetchRooms, [])
  const fetchCalendarReservationsCallback = useCallback(() => fetchCalendarReservations(calendarStartDate), [calendarStartDate])

  useEffect(() => {
    const channel = supabase
      .channel('occupancy-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reservations',
      }, () => {
        fetchRoomsCallback()
        fetchCalendarReservationsCallback()
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'payments',
      }, () => {
        fetchRoomsCallback()
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms',
      }, () => {
        fetchRoomsCallback()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [calendarStartDate, fetchRoomsCallback, fetchCalendarReservationsCallback])

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staff = await adminFetchHousekeepingStaff()
        setHousekeepingStaff(staff)
      } catch (err) {
        console.error('Error fetching housekeeping staff:', err)
      }
    }
    fetchStaff()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

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

            {/* GLOBAL ROOM FILTERS */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Room Occupancy & Management</h2>
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <Card className="mb-8">
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

      {/* 7-DAY OCCUPANCY CALENDAR */}
      <div className="space-y-4 mt-8 mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Occupancy Calendar</h2>
            <Badge variant="outline" className="ml-2 bg-slate-100 text-slate-800 dark:bg-gray-800 dark:text-gray-300 border-slate-200 dark:border-gray-700">7 Days</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn("h-10 border-slate-200 dark:border-gray-700 text-slate-800 dark:text-gray-200", !calendarStartDate && "text-muted-foreground")}
                >
                  <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                  {format(calendarStartDate, "dd MMM yyyy", { locale: localeId })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50">
                <CalendarComponent
                  mode="single"
                  selected={calendarStartDate}
                  onSelect={(date) => date && setCalendarStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => setCalendarStartDate(subDays(calendarStartDate, 14))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="h-8 px-3 rounded-md font-medium text-sm" onClick={() => setCalendarStartDate(new Date())}>
                Today
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => setCalendarStartDate(addDays(calendarStartDate, 14))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Card className="overflow-hidden border-slate-200 dark:border-gray-800 shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px] p-0">
              <div className="flex border-b border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/50 p-4 pb-3">
                <div className="w-48 flex-shrink-0 font-semibold text-slate-500 uppercase tracking-wider text-xs flex items-center">Room</div>
                <div className="flex-grow grid gap-2" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                  {eachDayOfInterval({ start: calendarStartDate, end: addDays(calendarStartDate, 13) }).map((date, i) => (
                    <div key={i} className={`text-center py-1 rounded-md ${isSameDay(date, new Date()) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'text-slate-600 dark:text-gray-400'}`}>
                      <div className="text-[10px] uppercase tracking-wider font-semibold">{format(date, 'EEE')}</div>
                      <div className="text-base font-bold">{format(date, 'dd')}</div>
                      <div className="text-[9px] font-medium opacity-70">{format(date, 'MMM')}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-gray-800 p-4">
                {filteredRooms.map(room => (
                  <div key={room.id} className="flex items-center py-2 hover:bg-slate-50 dark:hover:bg-gray-900/50 transition-colors rounded-lg group">
                    <div className="w-48 flex-shrink-0 pl-2">
                      <div className="font-bold text-slate-800 dark:text-gray-200 text-base flex items-center gap-2">
                        {room.number}
                        {room.status === 'maintenance' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                        {room.status === 'cleaning' && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded animate-pulse">🧹 CLEANING</span>}
                      </div>
                      <div className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded inline-block mt-1">{room.type}</div>
                    </div>
                    <div className="flex-grow grid gap-2 h-12" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                      {eachDayOfInterval({ start: calendarStartDate, end: addDays(calendarStartDate, 13) }).map((date, i) => {
                        const d = new Date(date);
                        d.setHours(0,0,0,0);
                        const KNOWN_STATUSES = new Set(['confirmed', 'checked-in', 'overdue', 'checked-out'])
                        const matchingReservations = calendarReservations.filter(r => {
                          if (r.room_id !== room.id) return false;
                          // Skip legacy reservations with unknown/null status (causes long gray phantom rows)
                          if (!r.status || !KNOWN_STATUSES.has(r.status)) return false;
                          if (!r.check_in || !r.check_out) return false;
                          const ci = new Date(r.check_in); ci.setHours(0,0,0,0);
                          const co = new Date(r.check_out); co.setHours(0,0,0,0);
                          if (isNaN(ci.getTime()) || isNaN(co.getTime())) return false;
                          return d >= ci && d <= co;
                        })
                        const statusPriority: Record<string, number> = { 'checked-in': 0, 'overdue': 1, 'confirmed': 2, 'checked-out': 3 }
                        const reservation = matchingReservations.sort((a, b) => (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99))[0] || null
                        
                        return (
                          <div 
                            key={i} 
                            onClick={() => {
                              setSelectedRoom(room)
                              if (reservation) {
                                if (reservation.status === 'confirmed') setCheckinDialogOpen(true)
                                else if (reservation.status === 'checked-in' || reservation.status === 'overdue') setCheckoutDialogOpen(true)
                                else if (reservation.status === 'checked-out') {
                                  setSelectedHistoryReservation(reservation)
                                  setHistoryDialogOpen(true)
                                }
                              } else {
                                if (room.status === 'cleaning') return
                                const clickedDate = new Date(date)
                                clickedDate.setHours(0,0,0,0)
                                const today = new Date()
                                today.setHours(0,0,0,0)
                                if (clickedDate.getTime() === today.getTime()) {
                                  setCheckinDialogOpen(true)
                                } else if (clickedDate > today) {
                                  setCalendarSelectedDate(clickedDate)
                                  setCalendarBookingDialogOpen(true)
                                }
                              }
                            }}
                            className={cn(
                              "h-full rounded-md flex flex-col justify-center text-xs overflow-hidden cursor-pointer border transition-all duration-200 shadow-sm relative group-hover:border-slate-300 dark:group-hover:border-gray-600",
                              reservation ? (
                                reservation.status === 'overdue' ? 'bg-red-100 border-red-400 text-red-900 dark:bg-red-900/40 dark:border-red-600 dark:text-red-100 ring-1 ring-red-400 animate-pulse' :
                                reservation.status === 'checked-in' ? 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100 hover:shadow dark:bg-red-900/25 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/40' :
                                reservation.status === 'confirmed' ? 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100 hover:shadow dark:bg-purple-900/25 dark:border-purple-800 dark:text-purple-200 dark:hover:bg-purple-900/40' :
                                reservation.status === 'checked-out' ? 'bg-slate-200 border-slate-300 text-slate-600 hover:bg-slate-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 opacity-60' :
                                'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                              ) : room.status === 'cleaning' ? "bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700 p-0" : "bg-transparent border-dashed border-slate-200 dark:border-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 dark:hover:text-blue-300 group-hover:border-solid text-transparent"
                            )}
                          >
                            {reservation ? (
                              <div className="px-1 text-left w-full relative z-10 flex flex-col items-center justify-center">
                                <span className="block font-semibold truncate text-[9px] w-full text-center">{reservation.guest_name?.split(' ')[0]}</span>
                                <div className="flex gap-0.5 items-center">
                                  {isSameDay(new Date(reservation.check_in), date) && <span className="bg-white/60 dark:bg-black/40 px-0.5 rounded-[3px] text-[8px] font-bold">IN</span>}
                                  {isSameDay(new Date(reservation.check_out), date) && <span className="bg-white/60 dark:bg-black/40 px-0.5 rounded-[3px] text-[8px] font-bold">OUT</span>}
                                </div>
                              </div>
                            ) : room.status === 'cleaning' ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCleaningDialogRoom(room)
                                  setCleaningAssignedTo("")
                                }}
                                title="Klik untuk tandai sudah dibersihkan"
                                className="flex flex-col items-center justify-center h-full w-full bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 cursor-pointer transition-colors group/clean"
                              >
                                <span className="text-base group-hover/clean:scale-125 transition-transform">🧹</span>
                                <span className="text-[7px] font-bold text-yellow-800 dark:text-yellow-200 opacity-0 group-hover/clean:opacity-100 transition-opacity">Bersihkan</span>
                              </button>
                            ) : (
                              <div className="flex items-center justify-center h-full w-full opacity-0 hover:opacity-100 transition-opacity">
                                <Plus className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-gray-900/50 border-t border-slate-200 dark:border-gray-800 p-3 flex gap-6 text-xs text-slate-600 dark:text-gray-400 justify-center">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-purple-500"></div> Booked (Confirmed)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div> In-House (Checked-In)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400 opacity-60"></div> Checked-Out</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-200 animate-pulse"></div> Overdue</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm border border-dashed border-slate-300 dark:border-gray-700"></div> Available</div>
            <div className="ml-4 flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> Paid</div>
            <div className="flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-orange-500" /> Pending</div>
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-600 dark:text-gray-400">Room Status Grid</h2>
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
              <Badge className={statusVariants[(room.status || "available") as "available"|"occupied"|"reserved"|"cleaning"|"maintenance"|"out-of-order"]}>
                {room.status ? room.status.charAt(0).toUpperCase() + room.status.slice(1) : 'Available'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{room.type}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrencyCompat((((Number(room.price) || Number(room.base_price) || 0) || room.base_price || 0) || room.base_price || 0))} per night
              </p>

              {/* Occupancy Actions */}
              <div className="mt-4 space-y-3">
                <div className="flex space-x-2 flex-wrap gap-2">
                  {room.status === 'available' && (
                    <>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50"
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
                      className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50"
                      onClick={() => handleCheckout(room)}
                    >
                      🚪 Check-out
                    </Button>
                  )}
                  {room.status === 'reserved' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50"
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
                  <div className="space-y-2">
                    <div className="text-xs font-medium flex items-start gap-2 bg-amber-50 dark:bg-amber-900/25 border border-amber-300 dark:border-amber-600 p-3 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <div className="text-amber-800 dark:text-amber-200 font-bold">⚠️ WAJIB DIBERSIHKAN</div>
                        <div className="text-amber-700 dark:text-amber-300 mt-0.5">Kamar belum siap untuk check-in baru</div>
                      </div>
                    </div>
                    {housekeepingStaff.length > 0 && (
                      <div className="text-xs text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-gray-800 p-2 rounded flex items-center gap-1">
                        👷 Housekeeping: {housekeepingStaff.map(s => s.full_name).join(', ')}
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCleaningDialogRoom(room)
                        setCleaningAssignedTo("")
                      }}
                    >
                      ✅ Tandai Sudah Bersih
                    </Button>
                  </div>
                )}
                {room.status === 'maintenance' && (
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1 bg-blue-50 dark:bg-blue-900/25 p-2 rounded">
                    🔧 Under maintenance - Temporary repair needed
                  </div>
                )}
                {room.status === 'out-of-order' && (
                  <div className="text-xs text-red-700 dark:text-red-300 font-medium flex items-center gap-1 bg-red-50 dark:bg-red-900/25 p-2 rounded border border-red-200 dark:border-red-700">
                    🚫 OUT OF ORDER - Major repair/renovation required
                    <span className="text-xs text-red-600 dark:text-red-300 ml-2">
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
        onCheckinComplete={async () => { await fetchRooms(); await fetchCalendarReservations(calendarStartDate); }}
      />

      {/* Checkout Dialog */}
      <CheckoutDialog
        room={selectedRoom}
        open={checkoutDialogOpen}
        onOpenChange={setCheckoutDialogOpen}
        onCheckoutComplete={handleCheckoutComplete}
      />
      {/* History Dialog */}
      <GuestHistoryDialog
        reservation={selectedHistoryReservation}
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
      />

      {/* Calendar Booking Dialog */}
      <CalendarBookingDialog
        room={selectedRoom}
        date={calendarSelectedDate}
        open={calendarBookingDialogOpen}
        onOpenChange={setCalendarBookingDialogOpen}
        onReservationComplete={async () => {
          await fetchRooms()
          await fetchCalendarReservations(calendarStartDate)
        }}
      />

      {/* Mark as Cleaned Dialog — with assignee picker */}
      <Dialog
        open={!!cleaningDialogRoom}
        onOpenChange={(open) => {
          if (!open) {
            setCleaningDialogRoom(null)
            setCleaningAssignedTo("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/40">
              <span className="text-2xl">🧹</span>
            </div>
            <DialogTitle className="text-center text-xl">
              Tandai Kamar Sudah Dibersihkan?
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              Setelah dikonfirmasi, status kamar akan berubah menjadi <strong>Tersedia</strong> dan siap untuk check-in tamu baru.
            </DialogDescription>
          </DialogHeader>

          {cleaningDialogRoom && (
            <div className="my-2 rounded-lg border bg-muted/50 p-4 space-y-3">
              <div className="grid gap-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nomor Kamar:</span>
                  <span className="font-semibold">{cleaningDialogRoom.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipe:</span>
                  <span className="font-semibold">{cleaningDialogRoom.type}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="cleaning-assignee" className="text-sm font-medium">
                  Dibersihkan oleh <span className="text-muted-foreground font-normal">(opsional)</span>
                </Label>
                <Select
                  value={cleaningAssignedTo}
                  onValueChange={setCleaningAssignedTo}
                >
                  <SelectTrigger id="cleaning-assignee">
                    <SelectValue placeholder="Pilih staff housekeeping..." />
                  </SelectTrigger>
                  <SelectContent>
                    {housekeepingStaff.length === 0 ? (
                      <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                        Belum ada staff housekeeping terdaftar
                      </div>
                    ) : (
                      housekeepingStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.full_name}
                          {staff.role && <span className="text-muted-foreground text-xs ml-2">({staff.role})</span>}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Pencatatan ini membantu audit trail housekeeping. Anda dapat mengonfirmasi tanpa memilih staff.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCleaningDialogRoom(null)
                setCleaningAssignedTo("")
              }}
              disabled={cleaningSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirmRoomCleaned}
              disabled={cleaningSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {cleaningSubmitting ? "Memproses..." : "✅ Konfirmasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
