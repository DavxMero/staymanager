import React from 'react';
import { BillingItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface UnpaidBillingsListProps {
  billingItems: BillingItem[];
  onItemUpdate?: (id: number, updates: Partial<BillingItem>) => void;
  editable?: boolean;
}

export function UnpaidBillingsList({ 
  billingItems, 
  onItemUpdate,
  editable = false 
}: UnpaidBillingsListProps) {
  const handleStatusChange = (id: number, status: 'pending' | 'paid') => {
    if (onItemUpdate) {
      onItemUpdate(id, { status });
    }
  };

  // Group items by category
  const groupedItems = billingItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, BillingItem[]>);

  const categoryLabels: Record<string, string> = {
    food: 'Food & Beverage',
    beverage: 'Beverage',
    service: 'Services',
    misc: 'Miscellaneous'
  };

  const totalAmount = billingItems.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <div className="space-y-4">
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-2 font-medium">
            {categoryLabels[category] || category}
          </div>
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{item.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unit_price)}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="font-medium">{formatCurrency(item.total_price)}</div>
                  {editable && (
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as 'pending' | 'paid')}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  )}
                  {item.status === 'paid' && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Paid
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="border-t pt-3 mt-2">
        <div className="flex justify-between font-bold text-lg">
          <span>Total Unpaid:</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}