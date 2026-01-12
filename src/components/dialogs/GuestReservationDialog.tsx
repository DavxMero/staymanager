"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabaseClient"
import { CalendarIcon, Loader2, User, BedDouble, CreditCard, CheckCircle2, Minus, Plus, Calendar as CalendarIconLucide, Utensils, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { PhoneInput } from "@/components/ui/phone-input"

interface Room {
  id: string
  number: string
  type: string
  base_price: number
  status: string
}

interface GuestReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  mode?: 'guest' | 'reservation' | 'walkin'
  preselectedRoomId?: string | number
}

export function GuestReservationDialog({
  open,
  onOpenChange,
  onSuccess,
  mode = 'guest',
  preselectedRoomId
}: GuestReservationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [roomsLoading, setRoomsLoading] = useState(false)

  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")

  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [breakfastIncluded, setBreakfastIncluded] = useState(false)
  const [breakfastPax, setBreakfastPax] = useState(0)
  const [notes, setNotes] = useState("")

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer' | 'credit-card'>('cash')
  const [paymentAmount, setPaymentAmount] = useState(0)

  const [totalAmount, setTotalAmount] = useState(0)
  const [roomTotal, setRoomTotal] = useState(0)
  const [breakfastTotal, setBreakfastTotal] = useState(0)
  const [numberOfNights, setNumberOfNights] = useState(0)

  const BREAKFAST_RATE = 50000
  const DEPOSIT_AMOUNT = 100000

  useEffect(() => {
    if (open) {
      fetchRooms()
      if (preselectedRoomId) {
        setSelectedRoom(String(preselectedRoomId))
      }
    }
  }, [open, preselectedRoomId])

  useEffect(() => {
    if (checkInDate && checkOutDate && selectedRoom) {
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      setNumberOfNights(nights)

      const room = rooms.find(r => r.id === selectedRoom)
      if (room) {
        const roomCost = room.base_price * nights
        setRoomTotal(roomCost)

        const breakfastCost = breakfastIncluded ? breakfastPax * BREAKFAST_RATE * nights : 0
        setBreakfastTotal(breakfastCost)

        const total = roomCost + breakfastCost + DEPOSIT_AMOUNT
        setTotalAmount(total)

        if (paymentAmount === 0) {
          setPaymentAmount(total)
        }
      }
    } else {
      setNumberOfNights(0)
      setRoomTotal(0)
      setBreakfastTotal(0)
      setTotalAmount(0)
    }
  }, [checkInDate, checkOutDate, selectedRoom, breakfastIncluded, breakfastPax, rooms])

  const fetchRooms = async () => {
    setRoomsLoading(true)
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('status', 'available')
        .order('number')

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setRoomsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const finalGuestName = guestName.trim()
      const finalGuestEmail = guestEmail.trim() || null
      const finalGuestPhone = guestPhone.trim() || null

      let guestId: number

      const orFilter = [
        finalGuestEmail ? `email.eq.${finalGuestEmail}` : '',
        finalGuestPhone ? `phone.eq.${finalGuestPhone}` : '',
      ].filter(Boolean).join(',')

      let existingGuest = null

      if (orFilter) {
        const { data, error: guestSearchError } = await supabase
          .from('guests')
          .select('id')
          .or(orFilter)
          .limit(1)

        if (guestSearchError) {
          console.error('Error searching for guest:', guestSearchError)
          throw new Error(`Error searching for guest: ${guestSearchError.message}`)
        }
        if (data && data.length > 0) {
          existingGuest = data[0]
        }
      }

      if (existingGuest) {
        guestId = existingGuest.id

        const { error: guestUpdateError } = await supabase
          .from('guests')
          .update({
            full_name: finalGuestName,
            email: finalGuestEmail,
            phone: finalGuestPhone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', guestId)

        if (guestUpdateError) {
          console.error('Error updating guest:', guestUpdateError)
          throw new Error(`Error updating guest: ${guestUpdateError.message}`)
        }
      } else {
        const { data: newGuest, error: guestError } = await supabase
          .from('guests')
          .insert({
            full_name: finalGuestName,
            email: finalGuestEmail,
            phone: finalGuestPhone,
          })
          .select('id')
          .single()

        if (guestError) {
          console.error('Error creating guest:', guestError)
          throw new Error(`Error creating guest: ${guestError.message}`)
        }
        guestId = newGuest.id
      }

      const bookingId = `BK-${Date.now()}`
      const reservationData = {
        booking_id: bookingId,
        guest_id: guestId,
        room_id: selectedRoom,
        guest_name: finalGuestName,
        guest_phone: finalGuestPhone,
        guest_email: finalGuestEmail,
        check_in: checkInDate?.toISOString().split('T')[0],
        check_out: checkOutDate?.toISOString().split('T')[0],
        room_rate: roomTotal / numberOfNights,
        room_total: roomTotal,
        total_amount: totalAmount,
        total_price: totalAmount,
        guest_count: adults + children,
        status: mode === 'walkin' ? 'checked-in' : 'confirmed',
        payment_status: paymentAmount >= totalAmount ? 'paid' : (paymentAmount > 0 ? 'partial' : 'pending'),
        breakfast_included: breakfastIncluded,
        breakfast_pax: breakfastPax,
        breakfast_price: BREAKFAST_RATE,
        breakfast_total: breakfastTotal,
        adults,
        children,
        actual_check_in: mode === 'walkin' ? new Date().toISOString() : null,
        notes: notes
      }

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert(reservationData)
        .select('id')
        .single()

      if (reservationError) {
        console.error('Reservation insert error details:', reservationError, reservationData)
        throw new Error(`Error creating reservation: ${reservationError.message}`)
      }

      if (paymentAmount > 0) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            reservation_id: reservation.id,
            amount: paymentAmount,
            payment_method: paymentMethod,
            payment_date: new Date().toISOString(),
            transaction_id: `TRX-${Date.now()}-${paymentMethod.toUpperCase()}`
          })

        if (paymentError) {
          console.error('Error creating payment:', paymentError)
          throw new Error(`Error creating payment: ${paymentError.message}`)
        }
      }

      const newRoomStatus = mode === 'walkin' ? 'occupied' : 'occupied'
      const { error: roomUpdateError } = await supabase
        .from('rooms')
        .update({ status: newRoomStatus })
        .eq('id', selectedRoom)

      if (roomUpdateError) {
        console.error('Error updating room status:', roomUpdateError)
        throw new Error(`Error updating room status: ${roomUpdateError.message}`)
      }

      resetForm()
      onOpenChange(false)
      if (onSuccess) onSuccess()

    } catch (error) {
      const err = error as Error
      console.error('Error creating reservation:', err.message)
      alert(`Failed to create reservation: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setGuestName("")
    setGuestEmail("")
    setGuestPhone("")
    setSelectedRoom(null)
    setCheckInDate(undefined)
    setCheckOutDate(undefined)
    setAdults(1)
    setChildren(0)
    setBreakfastIncluded(false)
    setBreakfastPax(0)
    setPaymentMethod('cash')
    setPaymentAmount(0)
    setNotes("")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const isValid = guestName && guestPhone && selectedRoom && checkInDate && checkOutDate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl flex items-center gap-2">
            {mode === 'walkin' ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <BedDouble className="h-6 w-6 text-blue-600" />}
            {mode === 'walkin' ? 'Walk-in Check In' : 'New Reservation'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'walkin' ? 'Process a new walk-in guest check-in' : 'Create a new reservation for a guest'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-8">

          {/* Guest Information */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              Guest Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">Full Name *</Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter guest name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestPhone">Phone Number *</Label>
                <PhoneInput
                  id="guestPhone"
                  value={guestPhone}
                  onChange={setGuestPhone}
                  placeholder="812-3456-7890"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="guestEmail">Email Address</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="guest@example.com (optional)"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Booking Details */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <CalendarIconLucide className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              Booking Details
            </h4>

            <div className="space-y-2">
              <Label>Select Room *</Label>
              <Select
                value={selectedRoom ?? undefined}
                onValueChange={(value) => setSelectedRoom(value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose a room" />
                </SelectTrigger>
                <SelectContent>
                  {roomsLoading ? (
                    <SelectItem value="loading" disabled>Loading rooms...</SelectItem>
                  ) : rooms.length === 0 ? (
                    <SelectItem value="none" disabled>No available rooms</SelectItem>
                  ) : (
                    rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.number} - {room.type} - {formatCurrency(room.base_price)}/night
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Check-in Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-11 w-full justify-start text-left font-normal",
                        !checkInDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkInDate ? format(checkInDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={setCheckInDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Check-out Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-11 w-full justify-start text-left font-normal",
                        !checkOutDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOutDate ? format(checkOutDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={setCheckOutDate}
                      initialFocus
                      disabled={(date) => checkInDate ? date <= checkInDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Adults</Label>
                <Input
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label>Children</Label>
                <Input
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Breakfast Options */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Utensils className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              Breakfast Options
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="breakfast"
                  checked={breakfastIncluded}
                  onCheckedChange={(checked) => {
                    setBreakfastIncluded(!!checked)
                    if (!checked) setBreakfastPax(1)
                    else setBreakfastPax(adults + children)
                  }}
                />
                <Label htmlFor="breakfast" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Include breakfast ({formatCurrency(BREAKFAST_RATE)} per person per day)
                </Label>
              </div>

              {breakfastIncluded && (
                <div className="ml-6 space-y-2">
                  <Label>Number of Breakfast Portions</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setBreakfastPax(Math.max(1, breakfastPax - 1))}
                      disabled={breakfastPax <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-12 text-center font-medium">{breakfastPax}</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setBreakfastPax(breakfastPax + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Breakfast total: {formatCurrency(breakfastTotal)} ({breakfastPax} portions × {numberOfNights} nights)
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Payment & Summary */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              Payment & Summary
            </h4>

            <Card className="bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-semibold text-slate-800 dark:text-gray-200">Reservation Total</Label>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 dark:text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Room ({numberOfNights} nights)</span>
                      <span>{formatCurrency(roomTotal)}</span>
                    </div>
                    {breakfastIncluded && (
                      <div className="flex justify-between">
                        <span>Breakfast ({breakfastPax} pax × {numberOfNights} days)</span>
                        <span>{formatCurrency(breakfastTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Security Deposit (Refundable)</span>
                      <span>{formatCurrency(DEPOSIT_AMOUNT)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={(value: any) => setPaymentMethod(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="qris">QRIS</SelectItem>
                          <SelectItem value="transfer">Bank Transfer</SelectItem>
                          <SelectItem value="credit-card">Credit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Initial Payment Amount</Label>
                      <Input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Special Requests / Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests, dietary requirements, or notes..."
              rows={3}
              className="resize-none"
            />
          </div>

        </div>

        <DialogFooter className="p-6 pt-2 border-t bg-gray-50 dark:bg-gray-900/50">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              mode === 'walkin' ? 'Check In Guest' : 'Confirm Reservation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )
}
