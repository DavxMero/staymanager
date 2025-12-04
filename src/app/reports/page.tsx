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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts"
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Mail,
  BarChart3,
  PieChart as PieChartIcon,
  FileBarChart,
  CalendarDays,
  UserCheck,
  UserX,
  MessageSquare,
  Wrench,
  Target,
  Crown,
  Heart,
  RefreshCw,
  Loader2
} from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { 
  formatReportCurrency, 
  formatPercentage,
  calculateGrowthRate,
  getPeriodComparisonText
} from "@/lib/reportingUtils"

// Chart colors
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088fe']

// Interface for analytics data
interface AnalyticsData {
  summary: {
    totalRevenue: number
    totalBookings: number
    currentOccupancyRate: number
    adr: number
    revpar: number
    totalRooms: number
    occupiedRooms: number
  }
  revenueData: any[]
  roomTypeRevenue: any[]
  checkInOutData: any[]
  roomServiceStats: any
  housekeepingStats: any
  guestReviews: any[]
  roomIssues: any[]
  billingItems: any[]
}

export default function ReportsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })
  const [roomTypeFilter, setRoomTypeFilter] = useState('all')
  const { toast } = useToast()

  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        roomType: roomTypeFilter
      })
      
      const response = await fetch(`/api/reports/analytics?${params}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch analytics data')
      }
      
      if (result.success) {
        setAnalyticsData(result.data)
        console.log('Analytics data loaded:', result.data)
      } else {
        throw new Error(result.error || 'Failed to load analytics data')
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
      toast({
        variant: "destructive",
        title: "Error Loading Data",
        description: "Failed to fetch analytics data. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange, roomTypeFilter])

  // Handle date range changes
  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
  }

  // Handle export functionality
  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      toast({
        title: "Export Started",
        description: `Generating ${type.toUpperCase()} report...`,
      })
      
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: type,
          data: analyticsData,
          dateRange,
          filters: { roomType: roomTypeFilter }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Export Complete!",
          description: `${result.message} - File: ${result.filename}`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'Failed to export report',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading Analytics Data...</p>
          <p className="text-sm text-muted-foreground">Fetching reports from database</p>
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
            Error loading reports: {error}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={fetchAnalyticsData} className="mr-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="p-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No analytics data available. Please check your database connection.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': 
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-800'
    if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
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
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Real-time hotel performance insights from your StayManager database
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
            <DialogContent className="invisible-scrollbar">
              <DialogHeader>
                <DialogTitle>Report Filters</DialogTitle>
                <DialogDescription>
                  Customize your reports with specific date ranges and criteria
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="roomType">Room Type</Label>
                  <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Room Types</SelectItem>
                      <SelectItem value="Presidential">Presidential Suite</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                      <SelectItem value="Deluxe">Deluxe</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button className="gap-2" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          
          <Button className="gap-2" variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full -translate-y-8 translate-x-8 opacity-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatReportCurrency(analyticsData.summary.totalRevenue)}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">Real-time data</span>
                <span className="text-muted-foreground ml-1">from database</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full -translate-y-8 translate-x-8 opacity-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {analyticsData.summary.totalBookings.toLocaleString()}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-blue-600 font-medium">{analyticsData.summary.totalRooms} rooms</span>
                <span className="text-muted-foreground ml-1">in hotel</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full -translate-y-8 translate-x-8 opacity-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
              <Target className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {formatPercentage(analyticsData.summary.currentOccupancyRate)}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <Users className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-purple-600 font-medium">{analyticsData.summary.occupiedRooms} occupied</span>
                <span className="text-muted-foreground ml-1">right now</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full -translate-y-8 translate-x-8 opacity-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Daily Rate</CardTitle>
              <Crown className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {formatReportCurrency(analyticsData.summary.adr)}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <DollarSign className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-orange-600 font-medium">RevPAR:</span>
                <span className="text-muted-foreground ml-1">{formatReportCurrency(analyticsData.summary.revpar)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Reports Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="checkinout" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Check In/Out</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Reviews</span>
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Room Issues</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Revenue Trend */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Revenue & Booking Trends
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
                    <Download className="h-4 w-4 mr-1" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('excel')}>
                    <Download className="h-4 w-4 mr-1" /> Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={analyticsData.revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" tickFormatter={(value) => formatReportCurrency(value).replace('Rp ', 'Rp')} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatReportCurrency(value as number) : value,
                        name === 'revenue' ? 'Revenue' : 'Bookings'
                      ]}
                    />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                    <Area yAxisId="right" type="monotone" dataKey="bookings" stroke="#82ca9d" fillOpacity={1} fill="url(#colorBookings)" name="Bookings" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Room Type Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-purple-600" />
                  Room Type Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.roomTypeRevenue}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.roomTypeRevenue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} bookings`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {analyticsData.roomTypeRevenue.map((room, index) => (
                    <div key={room.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: room.color || COLORS[index % COLORS.length] }} />
                        <span className="text-sm font-medium">{room.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatReportCurrency(room.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="h-5 w-5 text-green-600" />
                  Quick Report Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Room Service Requests</div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Total Requests</span>
                    <Badge variant="secondary">{analyticsData.roomServiceStats.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm">Pending</span>
                    <Badge className="bg-orange-100 text-orange-800">{analyticsData.roomServiceStats.pending}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm">In Progress</span>
                    <Badge className="bg-blue-100 text-blue-800">{analyticsData.roomServiceStats.inProgress}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm">Completed</span>
                    <Badge className="bg-green-100 text-green-800">{analyticsData.roomServiceStats.completed}</Badge>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Housekeeping Tasks</div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Total Tasks</span>
                    <Badge variant="secondary">{analyticsData.housekeepingStats.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm">Pending</span>
                    <Badge className="bg-orange-100 text-orange-800">{analyticsData.housekeepingStats.pending}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm">In Progress</span>
                    <Badge className="bg-blue-100 text-blue-800">{analyticsData.housekeepingStats.inProgress}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm">Completed</span>
                    <Badge className="bg-green-100 text-green-800">{analyticsData.housekeepingStats.completed}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Financial Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Financial Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Total Revenue</Label>
                    <div className="text-2xl font-bold text-green-600">
                      {formatReportCurrency(analyticsData.summary.totalRevenue)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Revenue per Room</Label>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatReportCurrency(analyticsData.summary.revpar)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Average Daily Rate</Label>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatReportCurrency(analyticsData.summary.adr)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Occupancy Rate</Label>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatPercentage(analyticsData.summary.currentOccupancyRate)}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Room Occupancy</span>
                    <span className="text-sm text-muted-foreground">{analyticsData.summary.occupiedRooms}/{analyticsData.summary.totalRooms} rooms</span>
                  </div>
                  <Progress value={analyticsData.summary.currentOccupancyRate} className="w-full" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Revenue Growth</span>
                    <span className="text-sm text-muted-foreground">vs last period</span>
                  </div>
                  <Progress value={75} className="w-full" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Service Quality</span>
                    <span className="text-sm text-muted-foreground">{formatPercentage((analyticsData.roomServiceStats.completed / Math.max(1, analyticsData.roomServiceStats.total)) * 100)} completion rate</span>
                  </div>
                  <Progress value={(analyticsData.roomServiceStats.completed / Math.max(1, analyticsData.roomServiceStats.total)) * 100} className="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  Key Financial Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Total Revenue</p>
                    <p className="text-lg font-bold text-green-600">{formatReportCurrency(analyticsData.summary.totalRevenue)}</p>
                  </div>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Room Service Revenue</p>
                    <p className="text-lg font-bold text-blue-600">{analyticsData.billingItems.length} items</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Service Efficiency</p>
                    <p className="text-lg font-bold text-purple-600">{formatPercentage((analyticsData.housekeepingStats.completed / Math.max(1, analyticsData.housekeepingStats.total)) * 100)}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Total Bookings</p>
                    <p className="text-lg font-bold text-orange-600">{analyticsData.summary.totalBookings.toLocaleString()}</p>
                  </div>
                  <Users className="h-5 w-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Check In/Out Tab */}
        <TabsContent value="checkinout" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Check-in/out Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  Daily Check-In & Check-Out Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={analyticsData.checkInOutData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="checkIns" fill="#8884d8" name="Check-ins" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="checkOuts" fill="#82ca9d" name="Check-outs" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Check-in Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  Check-In Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">On-Time Check-ins</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">87%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Early Check-ins</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">23%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Late Check-ins</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">15%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <UserX className="h-5 w-5 text-red-600" />
                    <span className="font-medium">No-Shows</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">3.2%</span>
                </div>
              </CardContent>
            </Card>

            {/* Check-out Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-orange-600" />
                  Check-Out Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">On-Time Check-outs</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">92%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Late Check-outs</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">8%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Guest Satisfaction</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">4.7/5</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Return Guests</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">34%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Reviews Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">4.6</div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{analyticsData.guestReviews.length}</div>
                  <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">87%</div>
                  <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Recommendation Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">2.3</div>
                  <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Days Response Time</p>
                </CardContent>
              </Card>
            </div>

            {/* Reviews List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Recent Guest Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] invisible-scrollbar">
                  <div className="space-y-4">
                    {analyticsData.guestReviews.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: review.id * 0.1 }}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-lg">{review.guest}</div>
                            <div className="text-sm text-muted-foreground">Room {review.room} • {format(new Date(review.date), 'dd MMM yyyy')}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <Badge className={getRatingColor(review.rating)}>
                              {review.category}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {review.comment}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Room Issues Tab */}
        <TabsContent value="issues" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Issues Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {analyticsData.roomIssues.filter((issue: any) => issue.priority === 'high' || issue.priority === 'urgent').length}
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">High Priority Issues</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analyticsData.roomIssues.filter((issue: any) => issue.status === 'in-progress').length}
                  </div>
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {analyticsData.roomIssues.filter((issue: any) => issue.status === 'completed').length}
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">24h</div>
                  <Wrench className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                </CardContent>
              </Card>
            </div>

            {/* Issues Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  Room Maintenance Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Est. Fix</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.roomIssues.map((issue: any) => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-medium">{issue.room}</TableCell>
                        <TableCell>{issue.issue}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(issue.priority)}>
                            {issue.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{issue.assignedTo}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {issue.estimatedFix ? format(new Date(issue.estimatedFix), 'dd MMM, HH:mm') : 'TBD'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <Toaster />
    </motion.div>
  )
}