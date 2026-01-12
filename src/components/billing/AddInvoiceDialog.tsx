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
import { Invoice } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface AddInvoiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddInvoice: (invoice: Omit<Invoice, 'id' | 'created_at'>) => void;
}

export function AddInvoiceDialog({ isOpen, onOpenChange, onAddInvoice }: AddInvoiceDialogProps) {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'paid' | 'pending' | 'overdue'>('pending');
  const [reservationId, setReservationId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAddInvoice({
      reservation_id: parseInt(reservationId),
      amount: parseFloat(amount),
      status,
      due_date: dueDate,
    });
    
    setAmount('');
    setStatus('pending');
    setReservationId('');
    setDueDate('');
    onOpenChange(false);
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!reservationId || !amount || !dueDate || parseFloat(amount) <= 0}>
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}