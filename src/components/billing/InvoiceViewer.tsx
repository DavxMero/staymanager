'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Receipt,
  Download,
  Printer,
  Mail,
  Building,
  Calendar,
  User,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react'
import { Invoice, Reservation, Guest, Room } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'

interface InvoiceViewerProps {
  invoice: Invoice | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDownload?: (invoice: Invoice) => void
}

export function InvoiceViewer({ 
  invoice, 
  isOpen, 
  onOpenChange,
  onDownload 
}: InvoiceViewerProps) {
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [guest, setGuest] = useState<Guest | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (invoice && isOpen) {
      fetchRelatedData()
    }
  }, [invoice, isOpen])

  const fetchRelatedData = async () => {
    if (!invoice) return
    
    setLoading(true)
    try {
      // Fetch reservation
      const { data: reservationData } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', invoice.reservation_id)
        .single()

      if (reservationData) {
        setReservation(reservationData)
        
        // Fetch guest and room data
        const [guestRes, roomRes] = await Promise.all([
          supabase.from('guests').select('*').eq('id', reservationData.guest_id).single(),
          supabase.from('rooms').select('*').eq('id', reservationData.room_id).single()
        ])
        
        if (guestRes.data) setGuest(guestRes.data)
        if (roomRes.data) setRoom(roomRes.data)
      }
    } catch (error) {
      console.error('Error fetching related data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (invoice && onDownload) {
      onDownload(invoice)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!invoice) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            <span>Invoice #{invoice.id}</span>
          </DialogTitle>
          <DialogDescription>
            Preview and manage invoice details
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-muted-foreground">Loading invoice details...</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Invoice Header */}
            <Card className="print:shadow-none print:border-none">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hotel Info */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      <h2 className="text-xl font-bold text-gray-900">StayManager Hotel</h2>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3" />
                        <span>Jl. Hotel Indonesia No. 123, Jakarta</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3" />
                        <span>+62 21 1234 5678</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3" />
                        <span>info@staymanager.com</span>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Info */}
                  <div className="space-y-2">
                    <div className="text-right">
                      <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
                      <p className="text-lg font-medium text-blue-600">#{invoice.id}</p>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <div>
                        <span className="text-muted-foreground">Invoice Date:</span>
                        <span className="ml-2 font-medium">
                          {invoice.created_at ? format(new Date(invoice.created_at), 'MMM dd, yyyy') : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="ml-2 font-medium">
                          {invoice.due_date ? format(new Date(invoice.due_date), 'MMM dd, yyyy') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bill To & Reservation Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bill To */}
              <Card className="print:shadow-none print:border-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">BILL TO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {guest ? (
                    <>
                      <p className="font-medium text-lg">{guest.full_name}</p>
                      {guest.email && <p className="text-sm text-muted-foreground">{guest.email}</p>}
                      {guest.phone && <p className="text-sm text-muted-foreground">{guest.phone}</p>}
                      {guest.address && <p className="text-sm text-muted-foreground">{guest.address}</p>}
                    </>
                  ) : (
                    <p className="text-muted-foreground">Guest information not available</p>
                  )}
                </CardContent>
              </Card>

              {/* Reservation Details */}
              <Card className="print:shadow-none print:border-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">RESERVATION DETAILS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Reservation ID:</span>
                    <span className="font-medium">#{reservation?.id || invoice.reservation_id}</span>
                    
                    <span className="text-muted-foreground">Room:</span>
                    <span className="font-medium">Room {room?.number || 'N/A'}</span>
                    
                    <span className="text-muted-foreground">Check-in:</span>
                    <span className="font-medium">
                      {reservation?.check_in ? format(new Date(reservation.check_in), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                    
                    <span className="text-muted-foreground">Check-out:</span>
                    <span className="font-medium">
                      {reservation?.check_out ? format(new Date(reservation.check_out), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Invoice Items */}
            <Card className="print:shadow-none print:border-none">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Invoice Items</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Items Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Description</th>
                          <th className="text-right p-3 font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">
                                {invoice.description || 'Hotel Services & Accommodation'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Reservation #{invoice.reservation_id}
                                {room && ` - Room ${room.number}`}
                              </p>
                            </div>
                          </td>
                          <td className="p-3 text-right font-medium">
                            {formatCurrency(invoice.amount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-2xl">{formatCurrency(invoice.amount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            {invoice.status === 'paid' && (
              <Card className="bg-green-50 border-green-200 print:shadow-none print:border-none">
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-2 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Payment Received</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    This invoice has been fully paid. Thank you for your payment!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Terms */}
            <Card className="print:shadow-none print:border-none">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Terms & Conditions</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Payment is due within 30 days of invoice date</p>
                  <p>• Late payment charges may apply for overdue invoices</p>
                  <p>• All rates are in Indonesian Rupiah (IDR)</p>
                  <p>• For any questions regarding this invoice, please contact us</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <DialogFooter className="print:hidden flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={handlePrint} className="flex items-center space-x-2">
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
          <Button onClick={handleDownload} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}