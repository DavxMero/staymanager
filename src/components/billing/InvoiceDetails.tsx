import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Download,
  Edit
} from 'lucide-react';
import { Invoice, Reservation, Guest, Room } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface InvoiceDetailsProps {
  invoice: Invoice;
  reservation: Reservation | undefined;
  guest: Guest | undefined;
  room: Room | undefined;
  onEditInvoice: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onDownloadInvoice: (invoice: Invoice) => void;
}

const statusVariants = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
};

export function InvoiceDetails({ 
  invoice, 
  reservation, 
  guest, 
  room,
  onEditInvoice,
  onViewInvoice,
  onDownloadInvoice
}: InvoiceDetailsProps) {
  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Invoice #{invoice.id}</CardTitle>
          <Badge className={statusVariants[invoice.status]}>
            {invoice.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
          </Badge>
        </div>
        <CardDescription>
          {guest ? guest.full_name : `Guest #${invoice.reservation_id}`} • 
          Room {room ? room.number : `Room #${reservation?.room_id}`} • 
          {reservation ? format(new Date(reservation.check_in), "MMM dd") : ''} - 
          {reservation ? format(new Date(reservation.check_out), "MMM dd") : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium">{guest?.full_name || `Guest #${invoice.reservation_id}`}</p>
            <p className="text-xs text-muted-foreground">{guest?.email || ''}</p>
          </div>
          <div className="text-sm">
            <p>
              {reservation ? format(new Date(reservation.check_in), "MMM dd, yyyy") : ''} - 
              {reservation ? format(new Date(reservation.check_out), "MMM dd, yyyy") : ''}
            </p>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-medium">
              {formatCurrency(invoice.amount)}
            </span>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onViewInvoice(invoice)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onDownloadInvoice(invoice)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onEditInvoice(invoice)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}