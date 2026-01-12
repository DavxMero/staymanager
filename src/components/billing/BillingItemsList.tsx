import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Download,
  Edit
} from 'lucide-react';
import { BillingItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

const statusVariants = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
};

interface BillingItemsListProps {
  billingItems: BillingItem[];
  onEditItem: (item: BillingItem) => void;
  onViewItem: (item: BillingItem) => void;
  onDownloadItem: (item: BillingItem) => void;
}

export function BillingItemsList({ 
  billingItems, 
  onEditItem,
  onViewItem,
  onDownloadItem
}: BillingItemsListProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Items</CardTitle>
        <CardDescription>All billing item records</CardDescription>
      </CardHeader>
      <CardContent>
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
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(item.total_price)}</div>
                        <Badge className={statusVariants[item.status]}>
                          {item.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => onViewItem(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onDownloadItem(item)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onEditItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {billingItems.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No billing items found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}