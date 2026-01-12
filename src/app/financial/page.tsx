'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    Calendar,
    Plus,
    Search,
    Filter,
    Download,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    FileText,
    PieChart
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"
import { formatCurrency } from "@/lib/utils"

interface Expense {
    id: number
    expense_date: string
    category: string
    subcategory?: string
    amount: number
    description: string
    vendor?: string
    payment_method: string
    status: string
    notes?: string
    created_at: string
}

interface Payment {
    id: string
    amount: number
    payment_method: string
    payment_date: string
    status: string
    transaction_id?: string
    notes?: string
    reservation?: {
        guest_name: string
        booking_id: string
    }
}

interface POSTransaction {
    id: number
    transaction_number: string
    total_amount: number
    payment_method: string
    transaction_date: string
    status: string
    transaction_type: string
    guest_name?: string
}

export default function FinancialPage() {
    const [activeTab, setActiveTab] = useState("overview")
    const [isLoading, setIsLoading] = useState(true)

    const [expenses, setExpenses] = useState<Expense[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [posTransactions, setPosTransactions] = useState<POSTransaction[]>([])

    const [totalIncome, setTotalIncome] = useState(0)
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [netProfit, setNetProfit] = useState(0)

    const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
    const [newExpense, setNewExpense] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'supplies',
        amount: '',
        description: '',
        vendor: '',
        payment_method: 'cash',
        notes: ''
    })

    useEffect(() => {
        fetchFinancialData()
    }, [])

    const fetchFinancialData = async () => {
        setIsLoading(true)
        try {
            const { data: expensesData, error: expensesError } = await supabase
                .from('expenses')
                .select('*')
                .order('expense_date', { ascending: false })

            if (expensesError) console.error('Error fetching expenses:', expensesError)

            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select(`
          *,
          reservation:reservations(guest_name, booking_id)
        `)
                .eq('status', 'completed')
                .order('payment_date', { ascending: false })

            if (paymentsError) console.error('Error fetching payments:', paymentsError)

            const { data: posData, error: posError } = await supabase
                .from('pos_transactions')
                .select('*')
                .eq('status', 'completed')
                .order('transaction_date', { ascending: false })

            if (posError) console.error('Error fetching POS transactions:', posError)

            const loadedExpenses = expensesData || []
            const loadedPayments = paymentsData || []
            const loadedPos = posData || []

            setExpenses(loadedExpenses)
            setPayments(loadedPayments)
            setPosTransactions(loadedPos)

            const expTotal = loadedExpenses.reduce((sum, item) => sum + Number(item.amount), 0)
            const payTotal = loadedPayments.reduce((sum, item) => sum + Number(item.amount), 0)
            const posTotal = loadedPos.reduce((sum, item) => sum + Number(item.total_amount), 0)

            const incTotal = payTotal + posTotal

            setTotalExpenses(expTotal)
            setTotalIncome(incTotal)
            setNetProfit(incTotal - expTotal)

        } catch (error) {
            console.error('Error loading financial data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateExpense = async () => {
        try {
            const { error } = await supabase
                .from('expenses')
                .insert({
                    expense_date: newExpense.date,
                    category: newExpense.category,
                    amount: Number(newExpense.amount),
                    description: newExpense.description,
                    vendor: newExpense.vendor,
                    payment_method: newExpense.payment_method,
                    status: 'paid',
                    notes: newExpense.notes
                })

            if (error) throw error

            setIsExpenseDialogOpen(false)
            setNewExpense({
                date: new Date().toISOString().split('T')[0],
                category: 'supplies',
                amount: '',
                description: '',
                vendor: '',
                payment_method: 'cash',
                notes: ''
            })

            fetchFinancialData()

        } catch (error: any) {
            alert('Failed to create expense: ' + error.message)
        }
    }

    return (
        <div className="space-y-6 p-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
                    <p className="text-muted-foreground">Manage your property's cash flow, income, and expenses.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                    <Button onClick={() => setIsExpenseDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
                        <MinusCircleIcon className="mr-2 h-4 w-4" />
                        Record Expense
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">
                            Total Income
                        </CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(totalIncome)}</div>
                        <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800 dark:text-red-300">
                            Total Expenses
                        </CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700 dark:text-red-400">{formatCurrency(totalExpenses)}</div>
                        <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                            +4.5% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            Net Profit
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{formatCurrency(netProfit)}</div>
                        <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                            Net Margin: {totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="income">Income History</TabsTrigger>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>
                                    Latest financial activities from all sources.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Combine and sort latest 5 items */}
                                        {[
                                            ...payments.map(p => ({
                                                id: p.id,
                                                desc: `Payment from ${p.reservation?.guest_name || 'Guest'}`,
                                                type: 'income',
                                                date: p.payment_date,
                                                amount: p.amount
                                            })),
                                            ...expenses.map(e => ({
                                                id: e.id,
                                                desc: e.description,
                                                type: 'expense',
                                                date: e.expense_date,
                                                amount: e.amount
                                            }))
                                        ]
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .slice(0, 5)
                                            .map((item, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-medium">{item.desc}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={item.type === 'income' ? 'default' : 'destructive'} className={item.type === 'income' ? 'bg-green-600' : 'bg-red-600'}>
                                                            {item.type === 'income' ? 'Income' : 'Expense'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{format(new Date(item.date), 'dd MMM yyyy')}</TableCell>
                                                    <TableCell className={`text-right font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Expense Breakdown</CardTitle>
                                <CardDescription>
                                    Spending by category
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Simple category grouping */}
                                    {Object.entries(expenses.reduce((acc, curr) => {
                                        acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount)
                                        return acc
                                    }, {} as Record<string, number>))
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([cat, amount], i) => (
                                            <div key={i} className="flex items-center">
                                                <div className="w-full space-y-1">
                                                    <div className="flex justify-between text-sm font-medium">
                                                        <span className="capitalize">{cat}</span>
                                                        <span>{formatCurrency(amount)}</span>
                                                    </div>
                                                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                                                        <div
                                                            className="h-2 rounded-full bg-red-500"
                                                            style={{ width: `${(amount / totalExpenses) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    {expenses.length === 0 && (
                                        <p className="text-center text-muted-foreground py-8">No expense data yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Income Tab */}
                <TabsContent value="income" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Income History</CardTitle>
                            <CardDescription>
                                All incoming payments from reservations and POS.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{format(new Date(payment.payment_date), 'dd MMM yyyy HH:mm')}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Reservation</span>
                                                    <span className="text-xs text-muted-foreground">{payment.reservation?.guest_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{payment.transaction_id || '-'}</TableCell>
                                            <TableCell className="capitalize">{payment.payment_method}</TableCell>
                                            <TableCell className="text-right font-medium text-green-600">
                                                +{formatCurrency(payment.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {posTransactions.map((pos) => (
                                        <TableRow key={pos.id}>
                                            <TableCell>{format(new Date(pos.transaction_date), 'dd MMM yyyy HH:mm')}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">POS Sale</span>
                                                    <span className="text-xs text-muted-foreground">{pos.transaction_type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{pos.transaction_number}</TableCell>
                                            <TableCell className="capitalize">{pos.payment_method}</TableCell>
                                            <TableCell className="text-right font-medium text-green-600">
                                                +{formatCurrency(pos.total_amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Expenses Tab */}
                <TabsContent value="expenses" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setIsExpenseDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Expense
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Operational Expenses</CardTitle>
                            <CardDescription>
                                Track daily operational costs and spending.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.map((expense) => (
                                        <TableRow key={expense.id}>
                                            <TableCell>{format(new Date(expense.expense_date), 'dd MMM yyyy')}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {expense.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{expense.description}</TableCell>
                                            <TableCell>{expense.vendor || '-'}</TableCell>
                                            <TableCell className="capitalize">{expense.payment_method}</TableCell>
                                            <TableCell className="text-right font-medium text-red-600">
                                                -{formatCurrency(expense.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {expenses.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No expenses recorded yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Expense Dialog */}
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Record New Expense</DialogTitle>
                        <DialogDescription>
                            Enter details for the operational expense.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={newExpense.date}
                                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500">Rp</span>
                                    <Input
                                        id="amount"
                                        type="number"
                                        className="pl-9"
                                        placeholder="0"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={newExpense.category}
                                onValueChange={(val) => setNewExpense({ ...newExpense, category: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="supplies">Supplies & Amenities</SelectItem>
                                    <SelectItem value="maintenance">Maintenance & Repairs</SelectItem>
                                    <SelectItem value="utilities">Utilities (Listrik/Air/Wifi)</SelectItem>
                                    <SelectItem value="food">Food & Beverage Cost</SelectItem>
                                    <SelectItem value="staff">Staff & Salary</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="e.g. Beli sabun mandi 1 karton"
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vendor">Vendor / Toko (Optional)</Label>
                                <Input
                                    id="vendor"
                                    placeholder="e.g. Toko Makmur"
                                    value={newExpense.vendor}
                                    onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment_method">Payment Method</Label>
                                <Select
                                    value={newExpense.payment_method}
                                    onValueChange={(val) => setNewExpense({ ...newExpense, payment_method: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="card">Company Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Additional notes..."
                                value={newExpense.notes}
                                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateExpense} disabled={!newExpense.amount || !newExpense.description}>
                            Save Expense
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function MinusCircleIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
        </svg>
    )
}
