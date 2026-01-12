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
import { Deposit } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface DepositFormProps {
  reservationId: number;
  onAddDeposit: (deposit: Omit<Deposit, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  defaultAmount?: number;
  isLocked?: boolean;
}

export function DepositForm({ reservationId, onAddDeposit, onCancel, defaultAmount = 0, isLocked = false }: DepositFormProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAddDeposit({
      reservation_id: reservationId,
      amount: isLocked && defaultAmount > 0 ? defaultAmount : amount,
      payment_method: paymentMethod,
      status: 'collected',
      notes
    });
  };

  React.useEffect(() => {
    if (defaultAmount > 0) {
      setAmount(defaultAmount);
    }
  }, [defaultAmount]);

  React.useEffect(() => {
    if (isLocked && defaultAmount > 0) {
      setAmount(defaultAmount);
    }
  }, [isLocked, defaultAmount]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Deposit Amount (Rp)</Label>
        <Input
          id="deposit-amount"
          type="number"
          min="0"
          value={amount}
          onChange={(e) => {
            if (!isLocked) {
              setAmount(Math.max(0, parseInt(e.target.value) || 0));
            }
          }}
          required
          readOnly={isLocked}
          className={isLocked ? "bg-gray-100 cursor-not-allowed" : ""}
        />
        {amount > 0 && (
          <div className="text-sm text-muted-foreground">
            {formatCurrency(amount)}
            {isLocked && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Locked
              </span>
            )}
          </div>
        )}
        {isLocked && (
          <div className="text-xs text-muted-foreground">
            * This deposit amount is fixed and cannot be changed
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="debit_card">Debit Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={amount <= 0 || !paymentMethod}>
          Add Deposit
        </Button>
      </div>
    </form>
  );
}