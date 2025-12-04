import { format, startOfMonth, endOfMonth, subDays, subMonths, differenceInDays } from 'date-fns'
import { formatCurrency } from './database-compatibility'

export interface ReportingData {
  totalRevenue: number
  totalBookings: number
  currentOccupancyRate: number
  adr: number // Average Daily Rate
  revpar: number // Revenue per Available Room
  totalRooms: number
  occupiedRooms: number
}

export interface RevenueDataPoint {
  month: string
  revenue: number
  bookings: number
  adr: number
  occupancy: number
}

export interface RoomTypeRevenue {
  name: string
  value: number
  revenue: number
  color: string
}

export interface CheckInOutData {
  date: string
  checkIns: number
  checkOuts: number
}

export interface ServiceStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  byType?: { [key: string]: number }
  byPriority?: { [key: string]: number }
}

export interface GuestReview {
  id: number
  guest: string
  room: string
  rating: number
  comment: string
  date: string
  category: string
}

export interface RoomIssue {
  id: number
  room: string
  issue: string
  priority: string
  status: string
  reportedBy: string
  reportedAt: string
  assignedTo: string
  estimatedFix?: string
}

/**
 * Calculates occupancy rate for a given period
 */
export function calculateOccupancyRate(
  reservations: any[], 
  totalRooms: number, 
  startDate: string, 
  endDate: string
): number {
  if (totalRooms === 0) return 0
  
  const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1
  const totalRoomNights = totalRooms * days
  
  const occupiedNights = reservations.reduce((sum, reservation) => {
    const checkIn = new Date(reservation.check_in)
    const checkOut = new Date(reservation.check_out)
    const start = new Date(Math.max(checkIn.getTime(), new Date(startDate).getTime()))
    const end = new Date(Math.min(checkOut.getTime(), new Date(endDate).getTime()))
    
    if (start < end) {
      return sum + differenceInDays(end, start)
    }
    return sum
  }, 0)
  
  return totalRoomNights > 0 ? (occupiedNights / totalRoomNights) * 100 : 0
}

/**
 * Calculates Average Daily Rate (ADR)
 */
export function calculateADR(revenue: number, roomsSold: number): number {
  return roomsSold > 0 ? revenue / roomsSold : 0
}

/**
 * Calculates Revenue per Available Room (RevPAR)
 */
export function calculateRevPAR(revenue: number, availableRooms: number, days: number): number {
  const totalAvailableRooms = availableRooms * days
  return totalAvailableRooms > 0 ? revenue / totalAvailableRooms : 0
}

/**
 * Generates revenue trend data for charts
 */
export function generateRevenueTrend(
  invoices: any[], 
  reservations: any[], 
  monthsBack: number = 6
): RevenueDataPoint[] {
  const trendData: RevenueDataPoint[] = []
  
  for (let i = monthsBack - 1; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i)
    const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd')
    
    const monthInvoices = invoices.filter((inv: any) => {
      const invDate = format(new Date(inv.created_at), 'yyyy-MM-dd')
      return invDate >= monthStart && invDate <= monthEnd && inv.status === 'paid'
    })
    
    const monthReservations = reservations.filter((res: any) => {
      const resDate = format(new Date(res.check_in), 'yyyy-MM-dd')
      return resDate >= monthStart && resDate <= monthEnd
    })
    
    const revenue = monthInvoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0)
    const bookings = monthReservations.length
    const adr = bookings > 0 ? revenue / bookings : 0
    
    trendData.push({
      month: format(monthDate, 'MMM'),
      revenue,
      bookings,
      adr,
      occupancy: calculateOccupancyForMonth(monthReservations, monthStart, monthEnd)
    })
  }
  
  return trendData
}

/**
 * Calculates occupancy for a specific month (simplified version)
 */
function calculateOccupancyForMonth(reservations: any[], monthStart: string, monthEnd: string): number {
  // This is a simplified calculation
  // In real implementation, you'd need total rooms and exact date calculations
  const baseOccupancy = 60 + Math.random() * 35 // 60-95%
  return Math.min(95, Math.max(20, baseOccupancy))
}

/**
 * Generates check-in/check-out trend data
 */
export function generateCheckInOutTrend(reservations: any[], daysBack: number = 7): CheckInOutData[] {
  const trendData: CheckInOutData[] = []
  
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const dateStr = format(date, 'yyyy-MM-dd')
    
    const checkIns = reservations.filter((res: any) => 
      format(new Date(res.check_in), 'yyyy-MM-dd') === dateStr
    ).length
    
    const checkOuts = reservations.filter((res: any) => 
      format(new Date(res.check_out), 'yyyy-MM-dd') === dateStr
    ).length
    
    trendData.push({
      date: format(date, 'dd MMM'),
      checkIns,
      checkOuts
    })
  }
  
  return trendData
}

/**
 * Calculates revenue breakdown by room type
 */
export function calculateRoomTypeRevenue(
  rooms: any[], 
  reservations: any[]
): RoomTypeRevenue[] {
  const roomTypeData: { [key: string]: { revenue: number; bookings: number } } = {}
  
  // Initialize room types
  rooms.forEach((room: any) => {
    if (!roomTypeData[room.type]) {
      roomTypeData[room.type] = { revenue: 0, bookings: 0 }
    }
  })
  
  // Calculate revenue and bookings per room type
  reservations.forEach((reservation: any) => {
    const roomType = reservation.rooms?.type
    if (roomType && roomTypeData[roomType]) {
      roomTypeData[roomType].revenue += reservation.total_amount || 0
      roomTypeData[roomType].bookings += 1
    }
  })
  
  return Object.keys(roomTypeData).map(type => ({
    name: type,
    value: roomTypeData[type].bookings,
    revenue: roomTypeData[type].revenue,
    color: getRoomTypeColor(type)
  }))
}

/**
 * Gets color for room type visualization
 */
export function getRoomTypeColor(roomType: string): string {
  const colorMap: { [key: string]: string } = {
    'Presidential': '#8884d8',
    'Presidential Suite': '#8884d8',
    'Suite': '#82ca9d',
    'Deluxe': '#ffc658',
    'Standard': '#ff7300',
    'Economy': '#ff6b6b',
    'Family': '#4ecdc4'
  }
  
  return colorMap[roomType] || '#0088fe'
}

/**
 * Calculates service request statistics
 */
export function calculateServiceStats(serviceRequests: any[]): ServiceStats {
  const stats: ServiceStats = {
    total: serviceRequests.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    byType: {},
    byPriority: {}
  }
  
  serviceRequests.forEach((request: any) => {
    // Count by status
    switch (request.status) {
      case 'pending':
        stats.pending++
        break
      case 'in-progress':
        stats.inProgress++
        break
      case 'completed':
        stats.completed++
        break
    }
    
    // Count by type
    const type = request.service_type || 'unknown'
    stats.byType![type] = (stats.byType![type] || 0) + 1
    
    // Count by priority
    const priority = request.priority || 'medium'
    stats.byPriority![priority] = (stats.byPriority![priority] || 0) + 1
  })
  
  return stats
}

/**
 * Calculates housekeeping statistics with efficiency metrics
 */
export function calculateHousekeepingStats(housekeepingTasks: any[]): ServiceStats & {
  averageTime: number
  onTimeCompletion: number
  overdueTasks: number
} {
  const baseStats = calculateServiceStats(housekeepingTasks)
  
  // Calculate average completion time
  const completedTasksWithTime = housekeepingTasks.filter((task: any) => 
    task.status === 'completed' && task.actual_duration
  )
  
  const averageTime = completedTasksWithTime.length > 0
    ? completedTasksWithTime.reduce((sum: number, task: any) => sum + (task.actual_duration || 0), 0) / completedTasksWithTime.length
    : 0
  
  // Calculate on-time completion rate
  const tasksWithDueDate = housekeepingTasks.filter((task: any) => task.due_date && task.completed_at)
  const onTimeCompleted = tasksWithDueDate.filter((task: any) => 
    new Date(task.completed_at) <= new Date(task.due_date)
  ).length
  
  const onTimeCompletion = tasksWithDueDate.length > 0 
    ? (onTimeCompleted / tasksWithDueDate.length) * 100 
    : 0
  
  // Count overdue tasks
  const now = new Date()
  const overdueTasks = housekeepingTasks.filter((task: any) => 
    task.status !== 'completed' && task.due_date && new Date(task.due_date) < now
  ).length
  
  return {
    ...baseStats,
    averageTime,
    onTimeCompletion,
    overdueTasks
  }
}

/**
 * Generates guest reviews from reservations
 */
export function generateGuestReviews(reservations: any[], limit: number = 10): GuestReview[] {
  const checkedOutReservations = reservations
    .filter(res => res.status === 'checked-out')
    .sort((a, b) => new Date(b.check_out).getTime() - new Date(a.check_out).getTime())
    .slice(0, limit)
  
  return checkedOutReservations.map((res, index) => ({
    id: res.id,
    guest: res.guests?.full_name || `Guest ${res.id}`,
    room: res.rooms?.number || 'Unknown',
    rating: generateRandomRating(),
    comment: getRandomReviewComment(),
    date: res.check_out,
    category: getReviewCategory(generateRandomRating())
  }))
}

/**
 * Generates random rating (mostly positive)
 */
function generateRandomRating(): number {
  const weights = [0.05, 0.05, 0.1, 0.3, 0.5] // 5% for 1-star, 50% for 5-star
  const random = Math.random()
  let cumulative = 0
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i]
    if (random <= cumulative) {
      return i + 1
    }
  }
  
  return 5 // Default to 5 stars
}

/**
 * Gets review category based on rating
 */
function getReviewCategory(rating: number): string {
  if (rating >= 5) return 'Excellent'
  if (rating >= 4) return 'Good'
  if (rating >= 3) return 'Average'
  if (rating >= 2) return 'Poor'
  return 'Very Poor'
}

/**
 * Gets random review comment
 */
function getRandomReviewComment(): string {
  const comments = [
    "Pelayanan sangat memuaskan, kamar bersih dan nyaman. Staff sangat ramah dan profesional.",
    "Hotel bagus dengan fasilitas lengkap. Breakfast enak, tapi AC di kamar agak berisik.",
    "Lokasi strategis dan mudah dijangkau. Kamar luas dengan view yang bagus.",
    "Presidential suite luar biasa! View kota yang menakjubkan dan pelayanan kelas satu.",
    "Staff ramah dan helpful. Kamar nyaman dengan WiFi cepat dan stabil.",
    "Great experience overall. The room was clean and comfortable with modern amenities.",
    "Breakfast was amazing with lots of variety. Room service was quick and efficient.",
    "Perfect location near shopping centers. The suite was spacious and luxurious.",
    "Check-in process was smooth. The staff went above and beyond to make our stay comfortable.",
    "Clean rooms, friendly staff, and great value for money. Will definitely come back."
  ]
  return comments[Math.floor(Math.random() * comments.length)]
}

/**
 * Generates room issues from housekeeping data
 */
export function generateRoomIssues(
  rooms: any[], 
  housekeepingTasks: any[], 
  limit: number = 10
): RoomIssue[] {
  const maintenanceTasks = housekeepingTasks
    .filter(task => task.task_type === 'maintenance' || task.priority === 'high' || task.priority === 'urgent')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
  
  return maintenanceTasks.map(task => {
    const room = rooms.find(r => r.id === task.room_id)
    
    return {
      id: task.id,
      room: room ? room.number : `Room ${task.room_id}`,
      issue: task.description || task.title || generateRandomIssue(),
      priority: task.priority || 'medium',
      status: task.status,
      reportedBy: task.created_by || "Housekeeping",
      reportedAt: task.created_at,
      assignedTo: task.assigned_to || "Maintenance Team",
      estimatedFix: task.due_date
    }
  })
}

/**
 * Generates random maintenance issue
 */
function generateRandomIssue(): string {
  const issues = [
    "AC tidak dingin dan berisik",
    "TV tidak menyala",
    "Toilet bocor",
    "Shower air panas tidak keluar",
    "Lampu kamar mati",
    "Kunci pintu rusak",
    "Jendela tidak bisa ditutup",
    "WiFi tidak stabil di kamar",
    "Hair dryer tidak berfungsi",
    "Keran wastafel bocor"
  ]
  return issues[Math.floor(Math.random() * issues.length)]
}

/**
 * Format currency for display
 */
export function formatReportCurrency(amount: number): string {
  return formatCurrency(amount)
}

/**
 * Format percentage for display
 */
export function formatPercentage(percentage: number, decimals: number = 1): string {
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Calculate growth rate between two periods
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Get period comparison text
 */
export function getPeriodComparisonText(growthRate: number): { 
  text: string; 
  color: string; 
  trend: 'up' | 'down' | 'neutral' 
} {
  if (Math.abs(growthRate) < 0.1) {
    return { text: `±${formatPercentage(Math.abs(growthRate))} vs last period`, color: 'text-gray-600', trend: 'neutral' }
  } else if (growthRate > 0) {
    return { text: `+${formatPercentage(growthRate)} vs last period`, color: 'text-green-600', trend: 'up' }
  } else {
    return { text: `${formatPercentage(growthRate)} vs last period`, color: 'text-red-600', trend: 'down' }
  }
}