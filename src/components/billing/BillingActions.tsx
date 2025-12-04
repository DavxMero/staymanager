import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus,
  Eye,
  Download,
  Edit
} from 'lucide-react';

interface BillingActionsProps {
  onAddInvoice: () => void;
  onEditInvoice: (invoiceId: number) => void;
  onViewInvoice: (invoiceId: number) => void;
  onDownloadInvoice: (invoiceId: number) => void;
}

export function BillingActions({ 
  onAddInvoice,
  onEditInvoice,
  onViewInvoice,
  onDownloadInvoice
}: BillingActionsProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Billing & Invoicing</h1>
        <p className="text-muted-foreground">Manage invoices and payments</p>
      </div>
      <Button onClick={onAddInvoice}>
        <Plus className="mr-2 h-4 w-4" />
        New Invoice
      </Button>
    </div>
  );
}