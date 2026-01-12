'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Receipt,
  User,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Invoice, Reservation, Guest, Room } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { addDays, format } from 'date-fns'

interface AddInvoiceFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAddInvoice: (invoice: Omit<Invoice, 'id' | 'created_at'>) => void
}

export function AddInvoiceForm({
  isOpen,
  onOpenChange,
  onAddInvoice
}: AddInvoiceFormProps) {
  const [formData, setFormData] = useState({
    reservation_id: '',
    amount: '',
    due_date: '',
    status: 'pending' as 'paid' | 'pending' | 'overdue'
  })

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      fetchData()
      const defaultDueDate = format(addDays(new Date(), 7), 'yyyy-MM-dd')
      setFormData(prev => ({ ...prev, due_date: defaultDueDate }))
    }
  }, [isOpen])

  const fetchData = async () => {
    try {
      const [reservationsRes, guestsRes, roomsRes] = await Promise.all([
        supabase.from('reservations').select('*').order('created_at', { ascending: false }),
        supabase.from('guests').select('*').order('full_name'),
        supabase.from('rooms').select('*').order('number')
      ])

      if (reservationsRes.data) setReservations(reservationsRes.data)
      if (guestsRes.data) setGuests(guestsRes.data)
      if (roomsRes.data) setRooms(roomsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.reservation_id) {
      newErrors.reservation_id = 'Please select a reservation'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Please select a due date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const invoiceData: Omit<Invoice, 'id' | 'created_at'> = {
        reservation_id: parseInt(formData.reservation_id),
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        status: formData.status
      }

      await onAddInvoice(invoiceData)

      setFormData({
        reservation_id: '',
        amount: '',
        due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        status: 'pending'
      })
      setErrors({})
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedReservation = reservations.find(r => r.id === parseInt(formData.reservation_id))
  const selectedGuest = selectedReservation ? guests.find(g => g.id === selectedReservation.guest_id) : null
  const selectedRoom = selectedReservation ? rooms.find(r => r.id === selectedReservation.room_id) : null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            <span>Create New Invoice</span>
          </DialogTitle>
          <DialogDescription>
            Generate a new invoice for a reservation
          </DialogDescription>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Reservation Selection */}
          <div className="space-y-2">
            <Label htmlFor="reservation" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Reservation *</span>
            </Label>
            <Select
              value={formData.reservation_id}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, reservation_id: value }))
                setErrors(prev => ({ ...prev, reservation_id: '' }))
              }}
            >
              <SelectTrigger className={errors.reservation_id ? 'border-red-300' : ''}>
                <SelectValue placeholder="Select a reservation" />
              </SelectTrigger>
              <SelectContent>
                {reservations.map((reservation) => {
                  const guest = guests.find(g => g.id === reservation.guest_id)
                  const room = rooms.find(r => r.id === reservation.room_id)
                  return (
                    <SelectItem key={reservation.id} value={reservation.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {guest?.full_name || `Guest #${reservation.guest_id}`} - Room {room?.number || reservation.room_id}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Reservation #{reservation.id} • {reservation.status}
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.reservation_id && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.reservation_id}</span>
              </p>
            )}
          </div>

          {/* Reservation Details Preview */}
          {selectedReservation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Reservation Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Guest:</span>
                    <p className="font-medium">{selectedGuest?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Room:</span>
                    <p className="font-medium">Room {selectedRoom?.number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Check-in:</span>
                    <p className="font-medium">{selectedReservation.check_in || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium capitalize">{selectedReservation.status || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Amount (IDR) *</span>
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1"
              placeholder="Enter amount in Rupiah"
              value={formData.amount}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, amount: e.target.value }))
                setErrors(prev => ({ ...prev, amount: '' }))
              }}
              className={errors.amount ? 'border-red-300' : ''}
            />
            {formData.amount && !errors.amount && (
              <p className="text-sm text-muted-foreground flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>{formatCurrency(parseFloat(formData.amount))}</span>
              </p>
            )}
            {errors.amount && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.amount}</span>
              </p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_date" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Due Date *</span>
            </Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, due_date: e.target.value }))
                setErrors(prev => ({ ...prev, due_date: '' }))
              }}
              className={errors.due_date ? 'border-red-300' : ''}
            />
            {errors.due_date && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.due_date}</span>
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>


        </motion.form>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.reservation_id || !formData.amount}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Receipt className="h-4 w-4" />
            )}
            <span>{loading ? 'Creating...' : 'Create Invoice'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
