import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Invoice } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface AddInvoiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddInvoice: (invoice: Omit<Invoice, 'id' | 'created_at'>) => void | Promise<void>;
}

export function AddInvoiceDialog({ isOpen, onOpenChange, onAddInvoice }: AddInvoiceDialogProps) {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'paid' | 'pending' | 'overdue'>('pending');
  const [reservationId, setReservationId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const amountNum = parseFloat(amount);
      await onAddInvoice({
        reservation_id: reservationId,
        amount: amountNum,
        subtotal: amountNum,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: amountNum,
        status,
        due_date: dueDate || undefined,
        invoice_number: undefined,
        service_charge: undefined,
        payment_method: undefined,
        payment_reference: undefined,
        issue_date: undefined,
        paid_at: undefined,
        notes: undefined,
        updated_at: undefined,
        created_by: undefined,
        guest_id: undefined,
      });

      toast.success('Invoice created');
      setAmount('');
      setStatus('pending');
      setReservationId('');
      setDueDate('');
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to create invoice', { description: (err as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a reservation
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reservationId">Reservation ID</Label>
            <Input
              id="reservationId"
              type="number"
              value={reservationId}
              onChange={(e) => setReservationId(e.target.value)}
              placeholder="Enter reservation ID"
              required
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
              required
            />
            {amount && (
              <div className="text-sm text-muted-foreground">
                {formatCurrency(parseFloat(amount))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as 'paid' | 'pending' | 'overdue')}>
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

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !reservationId || !amount || !dueDate || parseFloat(amount) <= 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}