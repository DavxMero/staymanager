'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Edit,
  Trash2,
  Phone,
  Mail,
  User,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  BedDouble,
  AlertTriangle,
  DollarSign
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Guest } from "@/types"
import { supabase } from "@/lib/supabaseClient"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { GuestReservationDialog } from "@/components/dialogs"
import { PhoneInput } from "@/components/ui/phone-input"

interface Booking {
  id: string
  booking_id?: string
  check_in: string
  check_out: string
  status: string
  payment_status?: string
  total_amount?: number
  total_price?: number
  room_rate?: number
  room_total?: number
  guest_name?: string
  guest_phone?: string
  guest_email?: string
  guest_id?: number
  room_id: string
  adults?: number
  children?: number
  breakfast_included?: boolean
  breakfast_pax?: number
  breakfast_rate?: number
  breakfast_total?: number
  actual_check_in?: string
  actual_check_out?: string
  rooms?: {
    room_number: string
    type: string
  } | null
}

interface Payment {
  id: string
  reservation_id: string
  amount: number
  payment_method: string
  payment_date: string
  transaction_id?: string
}

interface GuestWithBooking extends Guest {
  currentBooking?: Booking
  payments?: Payment[]
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestWithBooking[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false)
  const [currentGuest, setCurrentGuest] = useState<GuestWithBooking | null>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'history'>('all')

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [paymentType, setPaymentType] = useState<'checkin' | 'checkout'>('checkin')
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [depositRefund, setDepositRefund] = useState(true)
  const [penaltyAmount, setPenaltyAmount] = useState(0)
  const DEPOSIT_AMOUNT = 100000

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    try {
      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select('*')
        .order('full_name')

      if (guestsError) {
        console.error('Error fetching guests table:', guestsError)

        let errorMessage = `Database error: ${guestsError.message}. `;

        if (guestsError.code === 'PGRST116') {
          errorMessage += `Table 'guests' doesn't exist. Please run COMPLETE_FRESH_DATABASE.sql in Supabase SQL Editor to set up the database.`;
        } else if (guestsError.message?.includes('relation') && guestsError.message?.includes('does not exist')) {
          errorMessage += `Database tables not found. Please run COMPLETE_FRESH_DATABASE.sql in Supabase SQL Editor to create all required tables.`;
        } else {
          errorMessage += `Check your Supabase connection and ensure the database is set up correctly.`;
        }

        setError(errorMessage);
        throw guestsError;
      }

      if (!guestsData || guestsData.length === 0) {
        console.log('No guests found in database')
        setGuests([])
        return
      }

      console.log(`Found ${guestsData.length} guests, fetching bookings...`)

      const guestsWithBookings = await Promise.all(
        guestsData.map(async (guest) => {
          try {
            const { data: reservationsData, error: reservationsError } = await supabase
              .from('reservations')
              .select(`
                id,
                booking_id,
                check_in,
                check_out,
                status,
                payment_status,
                total_amount,
                total_price,
                room_rate,
                guest_name,
                guest_phone,
                guest_email,
                room_id,
                guest_id,
                adults,
                children
              `)
              .eq('guest_id', guest.id)
              .order('created_at', { ascending: false })
              .limit(1)

            if (reservationsError) {
              console.error('Error fetching reservation for guest:', guest.full_name, reservationsError)
            }

            const currentBooking = reservationsData?.[0] ? {
              ...reservationsData[0]
            } : null

            if (currentBooking) {
              const { data: roomData, error: roomError } = await supabase
                .from('rooms')
                .select('number, type')
                .eq('id', currentBooking.room_id)
                .single()

              if (roomError) {
                console.error('Error fetching room for booking:', currentBooking.id, roomError)
              }

              const mappedRoomData = roomData ? {
                room_number: roomData.number,
                type: roomData.type
              } : null

              const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('*')
                .eq('reservation_id', currentBooking.id)
                .order('payment_date', { ascending: false })

              if (paymentsError) {
                console.error('Error fetching payments for booking:', currentBooking.id, paymentsError)
              }

              return {
                ...guest,
                currentBooking: {
                  ...currentBooking,
                  rooms: mappedRoomData
                },
                payments: paymentsData || []
              }
            }

            return guest
          } catch (innerErr) {
            console.error('Error processing guest:', guest.id, innerErr)
            return guest
          }
        })
      )

      console.log(`Successfully loaded ${guestsWithBookings.length} guests with booking data`)
      setGuests(guestsWithBookings)
    } catch (err: unknown) {
      console.error('Error fetching guests:', err)

      let errorMessage = 'Failed to fetch guests. '
      if (err instanceof Error) {
        errorMessage += err.message + '. '
      }
      if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'PGRST116') {
        errorMessage += 'Table might not exist. Run setup-guests-database.sql in Supabase SQL Editor.'
      } else {
        errorMessage += 'Check console for details or run setup-guests-database.sql to create tables.'
      }

      setError(errorMessage)
    }
  }

  const handleAddGuest = () => {
    setIsReservationDialogOpen(true)
  }

  const handleEditGuest = (guest: GuestWithBooking) => {
    setCurrentGuest(guest)
    setFullName(guest.full_name)
    setEmail(guest.email || "")
    setPhone(guest.phone || "")
    setIsViewMode(false)
    setIsDialogOpen(true)
  }

  const handleViewGuest = (guest: GuestWithBooking) => {
    setCurrentGuest(guest)
    setFullName(guest.full_name)
    setEmail(guest.email || "")
    setPhone(guest.phone || "")
    setIsViewMode(true)
    setIsDialogOpen(true)
  }

  const handleSaveGuest = async () => {
    try {
      if (currentGuest) {
        const { error } = await supabase
          .from('guests')
          .update({
            full_name: fullName,
            email: email,
            phone: phone
          })
          .eq('id', currentGuest.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('guests')
          .insert({
            full_name: fullName,
            email: email,
            phone: phone
          })

        if (error) throw error
      }

      await fetchGuests()
      setIsDialogOpen(false)
    } catch (err) {
      console.error('Error saving guest:', err)
      setError('Failed to save guest')
    }
  }

  const handleDeleteGuest = async (guest: GuestWithBooking) => {
    if (!window.confirm(`Are you sure you want to delete ${guest.full_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', guest.id)

      if (error) {
        throw error
      }

      setGuests(prevGuests => prevGuests.filter(g => g.id !== guest.id));

    } catch (err: any) {
      console.error('Error deleting guest:', err)
      setError(`Failed to delete guest: ${err.message}. Make sure there are no related records (like reservations) that prevent deletion.`)
    }
  }

  const handleCheckInClick = (guest: GuestWithBooking) => {
    if (!guest.currentBooking) return
    setCurrentGuest(guest)
    setPaymentType('checkin')
    setPaymentAmount(guest.currentBooking.total_amount || 0)
    setPaymentMethod('cash')
    setIsPaymentDialogOpen(true)
  }

  const handleCheckOutClick = (guest: GuestWithBooking) => {
    if (!guest.currentBooking) return
    setCurrentGuest(guest)
    setPaymentType('checkout')

    const totalPaid = guest.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const remaining = Math.max(0, (guest.currentBooking.total_amount || 0) - totalPaid)

    setPaymentAmount(remaining)
    setPaymentMethod('cash')
    setDepositRefund(true)
    setPenaltyAmount(0)
    setIsPaymentDialogOpen(true)
  }

  const processPaymentAndAction = async () => {
    if (!currentGuest?.currentBooking) return

    setProcessingPayment(true)
    try {
      let finalPaymentAmount = paymentAmount
      if (paymentType === 'checkout') {
        finalPaymentAmount = Math.max(0, paymentAmount - (depositRefund ? DEPOSIT_AMOUNT : 0) + penaltyAmount)
      }

      if (finalPaymentAmount > 0) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            reservation_id: currentGuest.currentBooking.id,
            amount: finalPaymentAmount,
            payment_method: paymentMethod,
            payment_date: new Date().toISOString(),
            transaction_id: `TRX-${Date.now()}-${paymentMethod.toUpperCase()}`
          })

        if (paymentError) throw paymentError
      }

      if (paymentType === 'checkin') {
        const { error: reservationError } = await supabase
          .from('reservations')
          .update({
            status: 'checked-in',
            actual_check_in: new Date().toISOString(),
            payment_status: paymentAmount >= (currentGuest.currentBooking.total_amount || 0) ? 'paid' : 'partial'
          })
          .eq('id', currentGuest.currentBooking.id)

        if (reservationError) throw reservationError

        const { error: roomError } = await supabase
          .from('rooms')
          .update({ status: 'occupied' })
          .eq('id', currentGuest.currentBooking.room_id)

        if (roomError) throw roomError

      } else {
        const { error: reservationError } = await supabase
          .from('reservations')
          .update({
            status: 'checked-out',
            actual_check_out: new Date().toISOString(),
            payment_status: 'paid'
          })
          .eq('id', currentGuest.currentBooking.id)

        if (reservationError) throw reservationError

        const { error: roomError } = await supabase
          .from('rooms')
          .update({ status: 'cleaning' })
          .eq('id', currentGuest.currentBooking.room_id)

        if (roomError) throw roomError
      }

      await fetchGuests()
      setIsPaymentDialogOpen(false)

    } catch (err: any) {
      console.error('Error processing action:', err)
      setError(`Action failed: ${err.message}`)
    } finally {
      setProcessingPayment(false)
    }
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
            onClick={() => { setError(null); fetchGuests(); }}
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
          <h1 className="text-3xl font-bold">Guest Management</h1>
          <p className="text-muted-foreground">Manage guest profiles and information</p>
        </div>
        <Button onClick={handleAddGuest}>
          <Plus className="mr-2 h-4 w-4" />
          Add Guest
        </Button>
      </div>

      {/* Guests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Tamu</CardTitle>
          <CardDescription>Kelola data tamu hotel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Cari tamu atau nomor kamar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value: 'all' | 'active' | 'history') => setFilterStatus(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tamu</SelectItem>
                <SelectItem value="active">Sedang Menginap</SelectItem>
                <SelectItem value="history">Riwayat (Checkout)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            {guests
              .filter((guest) => {
                const booking = guest.currentBooking
                const isCheckedOut = booking?.status === 'checked-out' || booking?.status === 'completed'
                const matchesSearch =
                  guest.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  guest.phone?.includes(searchTerm) ||
                  booking?.rooms?.room_number.toLowerCase().includes(searchTerm.toLowerCase())

                if (!matchesSearch) return false

                if (filterStatus === 'active') return !isCheckedOut && booking
                if (filterStatus === 'history') return isCheckedOut

                return true
              })
              .map((guest) => {
                const booking = guest.currentBooking
                const room = booking?.rooms
                const totalPayment = guest.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
                const isPaid = totalPayment >= (booking?.total_amount || 0)
                const isCheckedOut = booking?.status === 'checked-out'

                return (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800"
                    onClick={() => handleViewGuest(guest)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Avatar */}
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>

                        {/* Guest Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{guest.full_name}</h3>
                            {room && (
                              <span className="text-sm text-muted-foreground">
                                • {room.type} • Kamar {room.room_number}
                              </span>
                            )}
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="mr-2 h-4 w-4" />
                              {guest.phone || "No phone"}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="mr-2 h-4 w-4" />
                              {guest.email || "No email"}
                            </div>
                          </div>

                          {/* Booking & Payment Info */}
                          {booking && (
                            <div className="grid grid-cols-3 gap-6 mt-4">
                              {/* Dates */}
                              <div>
                                <p className="text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">Tanggal</p>
                                <div className="flex items-center text-sm text-muted-foreground mb-1">
                                  <Calendar className="mr-1 h-4 w-4 text-blue-500" />
                                  In: {new Date(booking.check_in).toLocaleDateString('id-ID')}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="mr-1 h-4 w-4 text-red-500" />
                                  Out: {new Date(booking.check_out).toLocaleDateString('id-ID')}
                                </div>
                              </div>

                              {/* Payment */}
                              <div>
                                <p className="text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">Pembayaran</p>
                                <div className="text-sm text-muted-foreground">
                                  {guest.payments && guest.payments.length > 0 ? (
                                    <>
                                      {guest.payments[0].payment_method || 'Cash'}
                                      <div className="text-xs">
                                        {Math.ceil((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24))} malam
                                      </div>
                                    </>
                                  ) : (
                                    'Belum bayar'
                                  )}
                                </div>
                              </div>

                              {/* Total */}
                              <div>
                                <p className="text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">Total Biaya</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {formatCurrency(booking.total_amount || 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(booking.room_rate || 0)}/malam × {Math.ceil((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24))} malam
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="flex gap-2">
                          {isCheckedOut ? (
                            <Badge className="bg-gray-500">Check Out</Badge>
                          ) : (
                            <Badge className="bg-blue-500">Check In</Badge>
                          )}
                          {isPaid ? (
                            <Badge className="bg-green-500">Lunas</Badge>
                          ) : (
                            <Badge variant="destructive">Belum Lunas</Badge>
                          )}
                        </div>

                        <div className="flex gap-2 mt-2">
                          {!isCheckedOut && (
                            <Button
                              size="sm"
                              className={booking?.status === 'confirmed' ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (booking?.status === 'confirmed') {
                                  handleCheckInClick(guest)
                                } else {
                                  handleCheckOutClick(guest)
                                }
                              }}
                            >
                              {booking?.status === 'confirmed' ? 'Check In' : 'Checkout Tamu'}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditGuest(guest)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteGuest(guest)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Guest Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? "Detail Tamu" : currentGuest ? "Edit Tamu" : "Tambah Tamu Baru"}
            </DialogTitle>
            <DialogDescription>
              {isViewMode ? "Informasi lengkap tamu, booking, dan pembayaran" : currentGuest ? "Edit data tamu" : "Buat profil tamu baru"}
            </DialogDescription>
          </DialogHeader>

          {isViewMode && currentGuest ? (
            <Tabs defaultValue="guest" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="guest">
                  <User className="mr-2 h-4 w-4" />
                  Data Tamu
                </TabsTrigger>
                <TabsTrigger value="booking">
                  <BedDouble className="mr-2 h-4 w-4" />
                  Detail Booking
                </TabsTrigger>
                <TabsTrigger value="payment">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pembayaran
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Data Tamu */}
              <TabsContent value="guest" className="space-y-4 mt-4">
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nama Lengkap</Label>
                    <p className="text-lg font-semibold mt-1">{currentGuest.full_name}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <div className="flex items-center mt-1">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{currentGuest.email || "Tidak ada email"}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">No. Telepon</Label>
                      <div className="flex items-center mt-1">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{currentGuest.phone || "Tidak ada no. telepon"}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ID Tamu</Label>
                    <p className="text-sm mt-1 font-mono">#{currentGuest.id}</p>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Detail Booking */}
              <TabsContent value="booking" className="space-y-4 mt-4">
                {currentGuest.currentBooking ? (
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Reservation ID</Label>
                        <p className="text-lg font-semibold mt-1">#{currentGuest.currentBooking.id}</p>
                      </div>
                      <Badge className={currentGuest.currentBooking.status === 'checked-out' ? 'bg-gray-500' : 'bg-green-500'}>
                        {currentGuest.currentBooking.status === 'checked-out' ? 'Checked Out' : 'Active'}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Check In</Label>
                        <div className="flex items-center mt-1">
                          <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                          <p className="text-sm font-medium">
                            {new Date(currentGuest.currentBooking.check_in).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Check Out</Label>
                        <div className="flex items-center mt-1">
                          <Calendar className="mr-2 h-4 w-4 text-red-500" />
                          <p className="text-sm font-medium">
                            {new Date(currentGuest.currentBooking.check_out).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Kamar</Label>
                        <div className="flex items-center mt-1">
                          <BedDouble className="mr-2 h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {currentGuest.currentBooking.rooms?.room_number || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tipe Kamar</Label>
                        <p className="text-sm font-medium mt-1">
                          {currentGuest.currentBooking.rooms?.type || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Jumlah Tamu</Label>
                        <p className="text-sm font-medium mt-1">
                          {currentGuest.currentBooking.adults || 1} orang
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Durasi Menginap</Label>
                      <div className="flex items-center mt-1">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {Math.ceil((new Date(currentGuest.currentBooking.check_out).getTime() - new Date(currentGuest.currentBooking.check_in).getTime()) / (1000 * 60 * 60 * 24))} malam
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Total Harga</Label>
                      <p className="text-3xl font-bold text-blue-600 mt-1">
                        {formatCurrency(currentGuest.currentBooking.total_amount || 0)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BedDouble className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Tidak ada booking aktif</p>
                  </div>
                )}
              </TabsContent>

              {/* Tab 3: Pembayaran */}
              <TabsContent value="payment" className="space-y-4 mt-4">
                {currentGuest.payments && currentGuest.payments.length > 0 ? (
                  <div className="space-y-4">
                    {/* Payment Summary */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Total Pembayaran</Label>
                          <p className="text-3xl font-bold text-green-600 mt-1">
                            {formatCurrency(currentGuest.payments.reduce((sum, p) => sum + (p.amount || 0), 0))}
                          </p>
                        </div>
                        <Badge className="bg-green-500 text-lg px-4 py-2">
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Lunas
                        </Badge>
                      </div>

                      {currentGuest.currentBooking && (
                        <>
                          <Separator className="my-4" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Tagihan</span>
                            <span className="font-semibold">{formatCurrency(currentGuest.currentBooking.total_amount || 0)}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">Sudah Dibayar</span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(currentGuest.payments.reduce((sum, p) => sum + (p.amount || 0), 0))}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium">Sisa</span>
                            <span className="font-bold text-lg">
                              {formatCurrency(Math.max(0, (currentGuest.currentBooking.total_amount || 0) - currentGuest.payments.reduce((sum, p) => sum + (p.amount || 0), 0)))}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Payment History */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Riwayat Pembayaran</Label>
                      {currentGuest.payments.map((payment, index) => (
                        <div key={payment.id || index} className="border rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">Pembayaran #{index + 1}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(payment.payment_date).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(payment.amount || 0)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center">
                              <CreditCard className="mr-1 h-4 w-4 text-muted-foreground" />
                              <span>{payment.payment_method || 'Cash'}</span>
                            </div>
                            {payment.transaction_id && (
                              <div className="flex items-center">
                                <span className="text-muted-foreground">ID: {payment.transaction_id}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <XCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Belum ada pembayaran</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    className="pl-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan alamat email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <div className="relative">
                  <PhoneInput
                    id="phone"
                    value={phone}
                    onChange={setPhone}
                    placeholder="812-3456-7890"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {isViewMode ? "Tutup" : "Batal"}
            </Button>
            {!isViewMode && (
              <Button onClick={handleSaveGuest}>
                {currentGuest ? "Update Tamu" : "Tambah Tamu"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment & Action Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {paymentType === 'checkin' ? 'Check In Guest' : 'Check Out Guest'}
            </DialogTitle>
            <DialogDescription>
              {paymentType === 'checkin'
                ? 'Process payment and check in the guest.'
                : 'Settle remaining balance and check out.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Total Tagihan (Room + Deposit)</Label>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(currentGuest?.currentBooking?.total_amount || 0)}
              </div>
            </div>

            {paymentType === 'checkout' && (
              <>
                <div className="space-y-4 border p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Security Deposit Management
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="depositRefund"
                        checked={depositRefund}
                        onCheckedChange={(checked) => setDepositRefund(!!checked)}
                      />
                      <Label htmlFor="depositRefund" className="text-sm font-medium leading-none">
                        Refund Deposit ({formatCurrency(DEPOSIT_AMOUNT)})
                      </Label>
                    </div>

                    {!depositRefund && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        <AlertTriangle className="h-4 w-4" />
                        Deposit will be forfeited/kept.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="penaltyAmount">Penalty / Additional Charges (Optional)</Label>
                  <Input
                    id="penaltyAmount"
                    type="number"
                    value={penaltyAmount}
                    onChange={(e) => setPenaltyAmount(parseInt(e.target.value) || 0)}
                    placeholder="e.g. Lost Key, Damage"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add extra charges for damages or violations.
                  </p>
                </div>

                <div className="space-y-2 p-3 bg-slate-100 dark:bg-slate-800 rounded">
                  <div className="flex justify-between text-sm">
                    <span>Outstanding Balance:</span>
                    <span>{formatCurrency(paymentAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Deposit Refund:</span>
                    <span className={depositRefund ? "text-green-600" : "text-muted-foreground"}>
                      {depositRefund ? `-${formatCurrency(DEPOSIT_AMOUNT)}` : "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Penalty/Charges:</span>
                    <span className="text-red-600">+{formatCurrency(penaltyAmount)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Net Payable:</span>
                    <span>
                      {formatCurrency(Math.max(0, paymentAmount - (depositRefund ? DEPOSIT_AMOUNT : 0) + penaltyAmount))}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">
                {paymentType === 'checkout' ? 'Amount to Collect' : 'Jumlah Pembayaran (POS)'}
              </Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentType === 'checkout'
                  ? Math.max(0, paymentAmount - (depositRefund ? DEPOSIT_AMOUNT : 0) + penaltyAmount)
                  : paymentAmount
                }
                onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                disabled={paymentType === 'checkout'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                  <SelectItem value="transfer">Transfer Bank</SelectItem>
                  <SelectItem value="credit-card">Kartu Kredit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processPaymentAndAction} disabled={processingPayment}>
              {processingPayment ? 'Processing...' : (
                paymentType === 'checkin' ? 'Confirm Check In' : 'Confirm Check Out'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* New Modular Reservation Dialog */}
      <GuestReservationDialog
        open={isReservationDialogOpen}
        onOpenChange={setIsReservationDialogOpen}
        onSuccess={() => {
          fetchGuests()
        }}
        mode="reservation"
      />
    </motion.div>
  )
}