import React, { useState } from 'react';
import { BillingItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
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

interface PayBillingItemFormProps {
  item: BillingItem;
  onPay: (item: BillingItem, paymentMethod: string, notes: string) => void;
  onCancel: () => void;
}

export function PayBillingItemForm({ item, onPay, onCancel }: PayBillingItemFormProps) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPay(item, paymentMethod, notes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-lg p-4 bg-muted">
        <h3 className="font-medium mb-2">Billing Item Details</h3>
        <div className="space-y-1 text-sm">
          <p><strong>Description:</strong> {item.description}</p>
          <p><strong>Quantity:</strong> {item.quantity}</p>
          <p><strong>Unit Price:</strong> {formatCurrency(item.unit_price)}</p>
          <p className="font-medium"><strong>Total Amount:</strong> {formatCurrency(item.total_price)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="debit_card">Debit Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="e_wallet">E-Wallet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes (optional)"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Pay {formatCurrency(item.total_price)}
        </Button>
      </div>
    </form>
  );
}