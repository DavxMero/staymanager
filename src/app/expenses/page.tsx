'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DollarSign,
  Plus,
  Filter,
  Download,
  Edit,
  Trash2,
  Receipt,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Repeat,
  RefreshCw,
  Loader2
} from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Expense } from "@/types"

// Expense categories with colors
const EXPENSE_CATEGORIES = [
  { value: 'utilities', label: 'Utilities', color: 'bg-blue-100 text-blue-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
  { value: 'supplies', label: 'Supplies', color: 'bg-green-100 text-green-800' },
  { value: 'staff', label: 'Staff', color: 'bg-purple-100 text-purple-800' },
  { value: 'marketing', label: 'Marketing', color: 'bg-pink-100 text-pink-800' },
  { value: 'food', label: 'Food & Beverage', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'cleaning', label: 'Cleaning', color: 'bg-teal-100 text-teal-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
]

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-orange-100 text-orange-800' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyTotal: 0,
    pendingApproval: 0,
    topCategory: ''
  })

  const { toast } = useToast()

  // Form state for new/edit expense
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    subcategory: '',
    payment_method: '',
    receipt_url: '',
    supplier: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'pending',
    notes: '',
    recurring: false,
    recurring_period: 'monthly'
  })

  // Fetch expenses from API
  const fetchExpenses = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        category: filters.category,
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate
      })

      const response = await fetch(`/api/expenses?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch expenses')
      }

      if (result.success) {
        setExpenses(result.data)
        calculateStats(result.data)
      } else {
        throw new Error(result.error || 'Failed to load expenses')
      }
    } catch (err) {
      console.error('Error fetching expenses:', err)
      setError(err instanceof Error ? err.message : 'Failed to load expenses')
      toast({
        variant: "destructive",
        title: "Error Loading Expenses",
        description: "Failed to fetch expense data. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const calculateStats = (expenseData: Expense[]) => {
    const total = expenseData.reduce((sum, expense) => sum + expense.amount, 0)
    const pending = expenseData.filter(e => e.status === 'pending').length

    // Calculate monthly total (current month)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyExpenses = expenseData.filter(expense => {
      const expenseDate = new Date(expense.expense_date)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })
    const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    // Find top category
    const categoryTotals = expenseData.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    // Safe reduce with check for empty array
    const categoryEntries = Object.entries(categoryTotals)
    const topCategory = categoryEntries.length > 0
      ? categoryEntries.reduce((a, b) =>
        categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b
      )[0]
      : ''

    setStats({
      totalExpenses: total,
      monthlyTotal,
      pendingApproval: pending,
      topCategory
    })
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (!formData.description || !formData.amount || !formData.category || !formData.payment_method) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields.",
        })
        return
      }

      const method = editingExpense ? 'PUT' : 'POST'
      const endpoint = '/api/expenses'

      const payload = editingExpense
        ? { ...formData, id: editingExpense.id }
        : formData

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save expense')
      }

      if (result.success) {
        toast({
          title: editingExpense ? "Expense Updated" : "Expense Added",
          description: result.message,
        })

        // Reset form and close dialog
        resetForm()
        setIsAddDialogOpen(false)
        setEditingExpense(null)

        // Refresh data
        fetchExpenses()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error saving expense:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save expense',
      })
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete expense')
      }

      if (result.success) {
        toast({
          title: "Expense Deleted",
          description: result.message,
        })
        fetchExpenses()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete expense',
      })
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      subcategory: '',
      payment_method: '',
      receipt_url: '',
      supplier: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'pending',
      notes: '',
      recurring: false,
      recurring_period: 'monthly'
    })
  }

  // Handle edit
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      subcategory: expense.subcategory || '',
      payment_method: expense.payment_method,
      receipt_url: expense.receipt_url || '',
      supplier: expense.supplier || '',
      date: expense.expense_date,
      status: expense.status,
      notes: expense.notes || '',
      recurring: expense.recurring || false,
      recurring_period: expense.recurring_period || 'monthly'
    })
    setIsAddDialogOpen(true)
  }

  // Get category info
  const getCategoryInfo = (category: string) => {
    return EXPENSE_CATEGORIES.find(cat => cat.value === category) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]
  }

  // Get status info
  const getStatusInfo = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchExpenses()
  }, [filters])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading Expenses...</p>
          <p className="text-sm text-muted-foreground">Fetching expense data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            Error loading expenses: {error}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={fetchExpenses} className="mr-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto py-8 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            Hotel Expenses
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Track and manage hotel operational expenses
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Expenses</DialogTitle>
                <DialogDescription>
                  Filter expenses by category, status, and date range
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="filterCategory">Category</Label>
                  <Select value={filters.category} onValueChange={(value) =>
                    setFilters(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filterStatus">Status</Label>
                  <Select value={filters.status} onValueChange={(value) =>
                    setFilters(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {STATUS_OPTIONS.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) {
              setEditingExpense(null)
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </DialogTitle>
                <DialogDescription>
                  {editingExpense ? 'Update expense details' : 'Record a new hotel expense'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    placeholder="Enter expense description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select value={formData.payment_method} onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, payment_method: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    placeholder="Optional subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    placeholder="Supplier name"
                    value={formData.supplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="receipt_url">Receipt URL</Label>
                  <Input
                    id="receipt_url"
                    placeholder="https://..."
                    value={formData.receipt_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, receipt_url: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={formData.recurring}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, recurring: checked }))}
                  />
                  <Label htmlFor="recurring">Recurring expense</Label>
                  {formData.recurring && (
                    <Select value={formData.recurring_period} onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, recurring_period: value }))
                    }>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false)
                  setEditingExpense(null)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full -translate-y-8 translate-x-8 opacity-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              <DollarSign className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {formatCurrency(stats.totalExpenses)}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600 font-medium">{expenses.length} items</span>
                <span className="text-muted-foreground ml-1">recorded</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full -translate-y-8 translate-x-8 opacity-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <Calendar className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(stats.monthlyTotal)}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-blue-600 font-medium">Current month</span>
                <span className="text-muted-foreground ml-1">spending</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full -translate-y-8 translate-x-8 opacity-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
              <Clock className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats.pendingApproval}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <Clock className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-orange-600 font-medium">items</span>
                <span className="text-muted-foreground ml-1">awaiting approval</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full -translate-y-8 translate-x-8 opacity-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Category</CardTitle>
              <FileText className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 capitalize">
                {stats.topCategory || 'N/A'}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">highest</span>
                <span className="text-muted-foreground ml-1">spending category</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              Expense Records
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => {
                const categoryInfo = getCategoryInfo(expense.category)
                const statusInfo = getStatusInfo(expense.status)

                return (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {format(new Date(expense.expense_date), 'dd MMM yyyy')}
                      {expense.recurring && (
                        <Repeat className="h-3 w-3 inline ml-1 text-blue-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        {expense.supplier && (
                          <p className="text-sm text-muted-foreground">{expense.supplier}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryInfo.color}>
                        {categoryInfo.label}
                      </Badge>
                      {expense.subcategory && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {expense.subcategory}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {expense.payment_method.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {expense.receipt_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(expense.receipt_url, '_blank')}
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {expenses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No expenses found</p>
              <p className="text-sm">Add your first expense to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Toaster />
    </motion.div>
  )
}