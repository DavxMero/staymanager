'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Banknote,
  Wallet,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  Search,
  Download,
  Plus,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react'
import { formatCurrency as formatCurrencyCompat } from '@/lib/database-compatibility'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Invoice {
  id: number
  reservation_id: number
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  due_date?: string
  created_at: string
}

interface FinancialData {
  totalRevenue: number
  pendingPayments: number
  overdueAmount: number
  collectionRate: number
}

interface ChartData {
  name: string
  value: number
}

const statusVariants = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444']

export function ModernBillingDashboard({
  totalRevenue,
  pendingPayments,
  overdueAmount,
  invoices
}: {
  totalRevenue: number
  pendingPayments: number
  overdueAmount: number
  invoices: Invoice[]
}) {
  const totalOutstanding = pendingPayments + overdueAmount
  const collectionRate = totalRevenue > 0 ? ((totalRevenue / (totalRevenue + totalOutstanding)) * 100) : 0

  // Mock data for charts
  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ]

  const paymentStatusData = [
    { name: 'Paid', value: totalRevenue },
    { name: 'Pending', value: pendingPayments },
    { name: 'Overdue', value: overdueAmount },
  ]

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "text-blue-600",
    bgColor = "bg-blue-50 dark:bg-blue-900/20",
    trend,
    subtitle,
    delay = 0
  }: {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    bgColor?: string;
    trend?: string;
    subtitle?: string;
    delay?: number;
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="h-full"
      >
        <Card className="h-full hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={`p-2 rounded-lg ${bgColor}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center pt-1">
                {trend.startsWith('+') ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs ml-1 ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {trend}
                </span>
                <span className="text-xs text-muted-foreground ml-1">from last month</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Invoicing</h1>
          <p className="text-muted-foreground">Manage invoices, payments, and financial overview</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrencyCompat(totalRevenue)}
          icon={DollarSign}
          color="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/20"
          trend="+12%"
          subtitle="Payments received"
          delay={0.1}
        />

        <StatCard
          title="Pending Payments"
          value={formatCurrencyCompat(pendingPayments)}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-50 dark:bg-yellow-900/20"
          subtitle="Awaiting payment"
          delay={0.2}
        />

        <StatCard
          title="Overdue Amount"
          value={formatCurrencyCompat(overdueAmount)}
          icon={AlertTriangle}
          color="text-red-600"
          bgColor="bg-red-50 dark:bg-red-900/20"
          subtitle="Requires attention"
          trend={overdueAmount > 0 ? "+5%" : "0%"}
          delay={0.3}
        />

        <StatCard
          title="Collection Rate"
          value={`${collectionRate.toFixed(1)}%`}
          icon={Wallet}
          color="text-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
          subtitle="Payment success rate"
          trend={collectionRate > 80 ? "+2%" : "-1%"}
          delay={0.4}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Monthly revenue trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [formatCurrencyCompat(Number(value)), 'Amount']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Payment Status
            </CardTitle>
            <CardDescription>Distribution of payment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrencyCompat(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Process Payment</h3>
                <p className="text-sm text-muted-foreground">Record a new payment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Add Invoice</h3>
                <p className="text-sm text-muted-foreground">Create a new invoice</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Export Data</h3>
                <p className="text-sm text-muted-foreground">Download reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>All billing records</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search invoices..." className="pl-10 w-full md:w-64" />
              </div>
              <Select defaultValue="all">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Reservation</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
