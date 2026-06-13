'use client'

import React, { useState, useMemo } from 'react'
import {
  Eye,
  Search,
  CalendarRange,
  X,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { formatCurrency as formatCurrencyCompat } from '@/lib/database-compatibility'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Invoice } from '@/types'

const invoiceAmount = (inv: Invoice) => Number(inv.total_amount ?? inv.amount ?? 0)

interface SortConfig {
  key: keyof Invoice | null
  direction: 'asc' | 'desc'
}

const statusVariants: Record<string, string> = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

export function EnhancedInvoicesTable({
  invoices,
  onViewInvoice
}: {
  invoices: Invoice[]
  onViewInvoice: (invoice: Invoice) => void
}) {
  const SAMPLE_SIZE = 10

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [appliedRange, setAppliedRange] = useState<{ from: string; to: string } | null>(null)

  const applyDateRange = () => {
    if (dateFrom && dateTo) setAppliedRange({ from: dateFrom, to: dateTo })
  }

  const clearDateRange = () => {
    setDateFrom('')
    setDateTo('')
    setAppliedRange(null)
  }

  const baseInvoices = useMemo(() => {
    if (appliedRange) {
      return invoices.filter(invoice => {
        if (!invoice.created_at) return false
        const d = new Date(invoice.created_at)
        return d >= new Date(`${appliedRange.from}T00:00:00`) && d <= new Date(`${appliedRange.to}T23:59:59`)
      })
    }
    return invoices.slice(0, SAMPLE_SIZE)
  }, [invoices, appliedRange])

  const filteredAndSortedInvoices = useMemo(() => {
    const filtered = baseInvoices.filter(invoice => {
      const matchesSearch =
        invoice.id.toString().includes(searchTerm) ||
        (invoice.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.reservation_id || '').toString().includes(searchTerm) ||
        invoiceAmount(invoice).toString().includes(searchTerm)

      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter

      return matchesSearch && matchesStatus
    })

    if (sortConfig.key) {
      const sortKey = sortConfig.key
      filtered.sort((a, b) => {
        const aVal = a[sortKey] ?? ''
        const bVal = b[sortKey] ?? ''
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [baseInvoices, searchTerm, statusFilter, sortConfig])

  const requestSort = (key: keyof Invoice) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (column: keyof Invoice) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === 'asc' ?
        <SortAsc className="ml-2 h-4 w-4" /> :
        <SortDesc className="ml-2 h-4 w-4" />
    }
    return <SortAsc className="ml-2 h-4 w-4 text-muted-foreground" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>
              {appliedRange
                ? `Invoices from ${appliedRange.from} to ${appliedRange.to}`
                : `Showing the ${SAMPLE_SIZE} most recent invoices — pick a date range to load more`}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-10 w-full md:w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                aria-label="From date"
                className="w-[150px]"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="date"
                aria-label="To date"
                className="w-[150px]"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={applyDateRange}
                disabled={!dateFrom || !dateTo}
              >
                <CalendarRange className="mr-2 h-4 w-4" />
                Load Range
              </Button>
              {appliedRange && (
                <Button variant="ghost" size="icon" onClick={clearDateRange} aria-label="Clear date range">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => requestSort('id')}>
                  <div className="flex items-center">
                    Invoice ID
                    {getSortIcon('id')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('invoice_number')}>
                  <div className="flex items-center">
                    Invoice No.
                    {getSortIcon('invoice_number')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('created_at')}>
                  <div className="flex items-center">
                    Date
                    {getSortIcon('created_at')}
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => requestSort('total_amount')}>
                  <div className="flex items-center justify-end">
                    Amount
                    {getSortIcon('total_amount')}
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedInvoices.length > 0 ? (
                filteredAndSortedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">#{invoice.id}</TableCell>
                    <TableCell className="font-mono text-xs">{invoice.invoice_number || '—'}</TableCell>
                    <TableCell>{invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrencyCompat(invoiceAmount(invoice))}</TableCell>
                    <TableCell>
                      <Badge className={statusVariants[invoice.status] || statusVariants.pending}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onViewInvoice(invoice)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No invoices found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedInvoices.length > 0 && (
          <div className="flex items-center justify-between py-4">
            <p className="text-sm text-muted-foreground">
              {appliedRange
                ? `Showing ${filteredAndSortedInvoices.length} invoice(s) in selected range`
                : `Showing ${filteredAndSortedInvoices.length} of ${invoices.length} invoices (latest ${SAMPLE_SIZE})`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
