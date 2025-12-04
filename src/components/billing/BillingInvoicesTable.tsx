import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Download,
  Edit
} from 'lucide-react';
import { Invoice } from '@/types';
import { formatCurrency } from '@/lib/utils';

const statusVariants = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
};

interface BillingInvoicesTableProps {
  invoices: Invoice[];
  onEditInvoice: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onDownloadInvoice: (invoice: Invoice) => void;
}

export function BillingInvoicesTable({ 
  invoices, 
  onEditInvoice,
  onViewInvoice,
  onDownloadInvoice
}: BillingInvoicesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>All billing records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Invoice #{invoice.id}</div>
                <div className="text-sm text-muted-foreground">
                  Reservation #{invoice.reservation_id} • {invoice.due_date}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                  <Badge className={statusVariants[invoice.status]}>
                    {invoice.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onViewInvoice(invoice)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDownloadInvoice(invoice)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEditInvoice(invoice)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}