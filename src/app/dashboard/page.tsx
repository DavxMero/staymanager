'use client'

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { 
  Building, 
  Calendar, 
  CreditCard, 
  Users,
  TrendingUp,
  TrendingDown,
  Bed,
  UserCheck,
  Clock,
  DollarSign,
  Activity,
  Bell,
  Coffee,
  Star,
  Wifi,
  Car,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertTriangle,
  BarChart as BarChartIcon
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Reservation, Guest, Room } from "@/types"
import HotelChatbot from "@/components/chatbot/HotelChatbot"
import { transformRoomsQuery, transformGuestsQuery, transformReservationsQuery, formatCurrency as formatCurrencyCompat } from "@/lib/database-compatibility"
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns'
import { getBadgeColor } from '@/lib/badge-colors'

// Color schemes for charts
const CHART_COLORS = {
  primary: '#3B82F6',
  success: '#10B981', 
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1'
}

const ROOM_COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6']

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    totalRooms: 0,
    totalGuests: 0,
    totalReservations: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    pendingPayments: 0
  })
  
  const [roomStatus, setRoomStatus] = useState([
    { name: "Available", value: 0, color: CHART_COLORS.success },
    { name: "Occupied", value: 0, color: CHART_COLORS.danger },
    { name: "Cleaning", value: 0, color: CHART_COLORS.warning },
    { name: "Maintenance", value: 0, color: CHART_COLORS.primary },
  ])
  
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [billingData, setBillingData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🚀 Starting comprehensive dashboard data fetch...')
      
      // Fetch all data in parallel for better performance
      const [roomsResult, guestsResult, reservationsResult, billingResult] = await Promise.allSettled([
        supabase.from('rooms').select('*'),
        supabase.from('guests').select('*'),
        supabase.from('reservations').select('*').order('created_at', { ascending: false }),
        supabase.from('billing_items').select('*').eq('status', 'pending')
      ])
      
      // Process rooms data
      let rooms: Room[] = []
      if (roomsResult.status === 'fulfilled' && !roomsResult.value.error) {
        const roomsData = roomsResult.value.data || []
        rooms = transformRoomsQuery(roomsData)
      }
      
      // Process guests data
      let guests: Guest[] = []
      if (guestsResult.status === 'fulfilled' && !guestsResult.value.error) {
        const guestsData = guestsResult.value.data || []
        guests = transformGuestsQuery(guestsData)
      }
      
      // Process reservations data
      let reservations: Reservation[] = []
      if (reservationsResult.status === 'fulfilled' && !reservationsResult.value.error) {
        const reservationsData = reservationsResult.value.data || []
        reservations = transformReservationsQuery(reservationsData)
      }
      
      // Process billing data
      let billingItems: any[] = []
      if (billingResult.status === 'fulfilled' && !billingResult.value.error) {
        billingItems = billingResult.value.data || []
      }
      
      // Calculate room statistics
      const roomStats = {
        available: rooms.filter(r => r.status === 'available' || !r.status).length,
        occupied: rooms.filter(r => r.status === 'occupied').length,
        cleaning: rooms.filter(r => r.status === 'cleaning').length,
        maintenance: rooms.filter(r => r.status === 'maintenance').length,
      }
      
      // Update room status for pie chart
      setRoomStatus([
        { name: "Available", value: roomStats.available, color: CHART_COLORS.success },
        { name: "Occupied", value: roomStats.occupied, color: CHART_COLORS.danger },
        { name: "Cleaning", value: roomStats.cleaning, color: CHART_COLORS.warning },
        { name: "Maintenance", value: roomStats.maintenance, color: CHART_COLORS.primary },
      ])
      
      // Calculate revenue from billing items
      const totalRevenue = billingItems.reduce((sum, item) => sum + (item.total_price || 0), 0)
      const pendingPayments = billingItems.length
      
      // Calculate today's check-ins/check-outs
      const today = new Date().toISOString().split('T')[0]
      const todayCheckIns = reservations.filter(r => 
        r.check_in?.startsWith(today) || r.status === 'checked-in'
      ).length
      const todayCheckOuts = reservations.filter(r => 
        r.check_out?.startsWith(today) || r.status === 'checked-out'
      ).length
      
      // Update main dashboard data
      const occupancyRate = rooms.length > 0 ? Math.round((roomStats.occupied / rooms.length) * 100) : 0
      
      setDashboardData({
        totalRooms: rooms.length,
        totalGuests: guests.length,
        totalReservations: reservations.length,
        totalRevenue,
        occupancyRate,
        todayCheckIns,
        todayCheckOuts,
        pendingPayments
      })
      
      // Generate weekly occupancy data
      const weekStart = startOfWeek(new Date())
      const weekEnd = endOfWeek(new Date())
      const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })
      
      const weeklyOccupancy = daysOfWeek.map(day => ({
        day: format(day, 'EEE'),
        occupancy: Math.floor(Math.random() * 100), // Mock data for now
        revenue: Math.floor(Math.random() * 1000000),
        checkins: Math.floor(Math.random() * 10)
      }))
      
      setWeeklyData(weeklyOccupancy)
      
      // Recent activities with better formatting
      const activities = reservations.slice(0, 5).map((res, index) => {
        const guest = guests.find(g => g.id === res.guest_id)
        const room = rooms.find(r => r.id === res.room_id)
        
        return {
          id: res.id || index,
          guest_name: guest?.full_name || 'Guest',
          room_number: room?.number || 'Room',
          action: res.status || 'New reservation',
          time: res.created_at ? format(new Date(res.created_at), 'HH:mm') : 'Recent',
          type: res.status || 'reservation'
        }
      })
      
      setRecentActivities(activities)
      
      // Billing category data
      const billingCategories = billingItems.reduce((acc, item) => {
        const category = item.category || 'other'
        acc[category] = (acc[category] || 0) + (item.total_price || 0)
        return acc
      }, {})
      
      const billingChartData = Object.entries(billingCategories).map(([category, amount]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount: amount as number
      }))
      
      setBillingData(billingChartData)
      
      setLastUpdated(new Date())
      console.log('✅ Dashboard data fetch completed successfully')
      
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err)
      setError(`Failed to load dashboard: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Use formatCurrencyCompat from database-compatibility instead of local function

  const StatCard = ({ title, value, icon: Icon, trend, change, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
            <Icon className={`h-4 w-4 ${color} text-opacity-80`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          {change && (
            <div className="flex items-center pt-1">
              {trend === "up" ? (
                <ArrowUp className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs ml-1 ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
                {change}
              </span>
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4"
      >
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="h-5 w-5" />
              <strong className="font-bold">Dashboard Error</strong>
            </div>
            <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
            <Button 
              className="mt-4 bg-red-600 hover:bg-red-700"
              onClick={fetchDashboardData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-muted-foreground">Loading your property data...</p>
          </div>
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🏨 Hotel Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of your property performance</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-2 text-sm text-muted-foreground"
        >
          <Clock className="h-4 w-4" />
          <span>Last updated: {format(lastUpdated, 'HH:mm:ss')}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </motion.div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Rooms"
          value={dashboardData.totalRooms}
          icon={Building}
          trend="up"
          change="+2"
          color="text-blue-600"
        />
        
        <StatCard
          title="Occupancy Rate"
          value={`${dashboardData.occupancyRate}%`}
          icon={Bed}
          trend={dashboardData.occupancyRate > 70 ? "up" : "down"}
          change={`${dashboardData.occupancyRate > 70 ? '+' : '-'}${Math.abs(dashboardData.occupancyRate - 70)}%`}
          color="text-green-600"
        />
        
        <StatCard
          title="Today's Revenue"
          value={formatCurrencyCompat(dashboardData.totalRevenue)}
          icon={DollarSign}
          trend="up"
          change="+15%"
          color="text-purple-600"
        />
        
        <StatCard
          title="Active Guests"
          value={dashboardData.totalGuests}
          icon={Users}
          trend={dashboardData.totalGuests > 10 ? "up" : "down"}
          change={`${dashboardData.totalGuests > 10 ? '+' : '-'}${Math.abs(dashboardData.totalGuests - 10)}`}
          color="text-orange-600"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <span>Today's Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Check-ins</span>
                  <Badge className={getBadgeColor('success')}>
                    {dashboardData.todayCheckIns}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Check-outs</span>
                  <Badge className={getBadgeColor('info')}>
                    {dashboardData.todayCheckOuts}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Payments</span>
                  <Badge className={getBadgeColor('warning')}>
                    {dashboardData.pendingPayments}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <span>Room Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roomStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roomStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} rooms`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {roomStatus.map((status, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span className="text-xs text-muted-foreground">
                      {status.name}: {status.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                <span>Recent Activities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={activity.id || index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.guest_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.action} • Room {activity.room_number}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activities</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Performance Chart */}
      {weeklyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChartIcon className="h-5 w-5 text-green-600" />
                <span>Weekly Performance</span>
              </CardTitle>
              <CardDescription>Occupancy and revenue trends for this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="day" 
                      className="text-xs fill-muted-foreground"
                    />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="occupancy"
                      stroke={CHART_COLORS.primary}
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.3}
                      name="Occupancy %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <Link href="/rooms">
                  <Building className="h-6 w-6" />
                  <span className="text-sm">Manage Rooms</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <Link href="/occupancy">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">View Calendar</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <Link href="/guests">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Guest List</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <Link href="/billing">
                  <CreditCard className="h-6 w-6" />
                  <span className="text-sm">Billing</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* AI Chatbot for Staff */}
      <HotelChatbot 
        userContext={{ 
          type: 'staff', 
          staffRole: 'admin' 
        }}
        position="bottom-right"
      />
    </motion.div>
  )
}
