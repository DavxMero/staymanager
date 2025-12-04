import React from 'react';
import { BillingItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdditionalBillsListProps {
  billingItems: BillingItem[];
  onItemUpdate?: (id: number, updates: Partial<BillingItem>) => void;
  editable?: boolean;
  onPayItem?: (item: BillingItem) => void;
}

const categoryLabels: Record<string, string> = {
  food: 'Food & Beverage',
  beverage: 'Beverage',
  service: 'Services',
  misc: 'Miscellaneous'
};

export function AdditionalBillsList({ 
  billingItems, 
  onItemUpdate,
  editable = false,
  onPayItem
}: AdditionalBillsListProps) {
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

  const totalAmount = billingItems.reduce((sum, item) => sum + item.total_price, 0);
  const unpaidAmount = billingItems
    .filter(item => item.status === 'pending')
    .reduce((sum, item) => sum + item.total_price, 0);

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
                  {editable && item.status === 'pending' && onPayItem ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onPayItem(item)}
                    >
                      Pay Now
                    </Button>
                  ) : (
                    <>
                      {editable ? (
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as 'pending' | 'paid')}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                        </select>
                      ) : (
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="border-t pt-3 mt-2 space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">Total Amount:</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Unpaid Amount:</span>
          <span className="text-red-600 font-medium">{formatCurrency(unpaidAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Paid Amount:</span>
          <span className="text-green-600 font-medium">{formatCurrency(totalAmount - unpaidAmount)}</span>
        </div>
      </div>
    </div>
  );
}