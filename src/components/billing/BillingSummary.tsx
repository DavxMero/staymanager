import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CreditCard, 
  Banknote, 
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BillingSummaryProps {
  totalRevenue: number;
  pendingPayments: number;
  overdueAmount: number;
}

export function BillingSummary({ 
  totalRevenue, 
  pendingPayments, 
  overdueAmount 
}: BillingSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(pendingPayments)}</div>
          <p className="text-xs text-muted-foreground">
            {pendingPayments.toLocaleString()} invoices pending
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(overdueAmount)}</div>
          <p className="text-xs text-muted-foreground">
            {overdueAmount.toLocaleString()} invoice overdue
          </p>
        </CardContent>
      </Card>
    </div>
  );
}