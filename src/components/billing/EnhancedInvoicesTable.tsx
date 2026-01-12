'use client'

import React, { useState, useMemo } from 'react'
import {
  Eye,
  Download,
  Edit,
  MoreHorizontal,
  Search,
  Filter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface Invoice {
  id: number
  reservation_id: number
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  due_date?: string
  created_at: string
}

interface SortConfig {
  key: keyof Invoice | null
  direction: 'asc' | 'desc'
}

const statusVariants = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

export function EnhancedInvoicesTable({
  invoices,
  onViewInvoice,
  onDownloadInvoice,
  onEditInvoice
}: {
  invoices: Invoice[]
  onViewInvoice: (invoice: Invoice) => void
  onDownloadInvoice: (invoice: Invoice) => void
  onEditInvoice: (invoice: Invoice) => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })

  const filteredAndSortedInvoices = useMemo(() => {
    const filtered = invoices.filter(invoice => {
      const matchesSearch =
        invoice.id.toString().includes(searchTerm) ||
        invoice.reservation_id.toString().includes(searchTerm) ||
        invoice.amount.toString().includes(searchTerm)

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
  }, [invoices, searchTerm, statusFilter, sortConfig])

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
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>Manage and track all billing records</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-10 w-full md:w-64"
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
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
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
                <TableHead className="cursor-pointer" onClick={() => requestSort('reservation_id')}>
                  <div className="flex items-center">
                    Reservation
                    {getSortIcon('reservation_id')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('created_at')}>
                  <div className="flex items-center">
                    Date
                    {getSortIcon('created_at')}
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => requestSort('amount')}>
                  <div className="flex items-center justify-end">
                    Amount
                    {getSortIcon('amount')}
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
                    <TableCell>Reservation #{invoice.reservation_id}</TableCell>
                    <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrencyCompat(invoice.amount)}</TableCell>
                    <TableCell>
                      <Badge className={statusVariants[invoice.status]}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewInvoice(invoice)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditInvoice(invoice)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDownloadInvoice(invoice)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
              Showing {filteredAndSortedInvoices.length} of {invoices.length} invoices
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
