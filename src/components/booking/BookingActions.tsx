'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Ban, RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BookingActionsProps {
  bookingId: string
  status: string
  guestName?: string
  
  onStatusChange?: (newStatus: string) => void
}

async function postBookingAction(bookingId: string, action: 'cancel' | 'restore', body?: object) {
  const res = await fetch(`/api/bookings/${bookingId}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export function BookingActions({ bookingId, status, guestName, onStatusChange }: BookingActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const canCancel = status === 'confirmed' || status === 'pending'
  const canRestore = status === 'cancelled'

  const handleRestore = async () => {
    setLoading(true)
    try {
      await postBookingAction(bookingId, 'restore')
      onStatusChange?.('confirmed')
      toast.success('Booking restored')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to restore booking')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setLoading(true)
    try {
      await postBookingAction(bookingId, 'cancel', reason.trim() ? { reason: reason.trim() } : {})
      onStatusChange?.('cancelled')
      setConfirmOpen(false)
      setReason('')
      toast.success('Booking cancelled', {
        duration: 6000,
        action: { label: 'Undo', onClick: () => void handleRestore() },
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel booking')
    } finally {
      setLoading(false)
    }
  }

  if (!canCancel && !canRestore) return null

  return (
    <>
      {canCancel && (
        <Button
          variant="outline"
          size="sm"
          className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
          disabled={loading}
          onClick={(e) => {
            e.stopPropagation()
            setConfirmOpen(true)
          }}
        >
          <Ban className="mr-1 h-4 w-4" />
          Cancel Booking
        </Button>
      )}
      {canRestore && (
        <Button
          variant="outline"
          size="sm"
          className="border-green-300 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/40"
          disabled={loading}
          onClick={(e) => {
            e.stopPropagation()
            void handleRestore()
          }}
        >
          {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-1 h-4 w-4" />}
          {loading ? 'Restoring...' : 'Restore'}
        </Button>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Cancel Booking?</DialogTitle>
            <DialogDescription>
              {guestName ? `The booking for ${guestName} ` : 'This booking '}
              will be cancelled and the room will become available again. You can restore it
              as long as the room has not been booked by another guest.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="cancel-reason">Cancellation reason (optional)</Label>
            <Input
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. plans changed"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={loading}>
              Go Back
            </Button>
            <Button variant="destructive" onClick={() => void handleCancel()} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : 'Yes, Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
