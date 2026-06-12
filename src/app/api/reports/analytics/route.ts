import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { startOfMonth, endOfMonth, format, subMonths, parseISO, startOfDay, endOfDay } from 'date-fns'
import { getServerUserContext, hasPermission } from '@/lib/auth/server-permissions'

export async function GET(request: NextRequest) {
  try {
    const ctx = await getServerUserContext(request)
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(ctx, 'reports', 'dashboard')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || format(startOfMonth(new Date()), 'yyyy-MM-dd')
    const endDate = searchParams.get('endDate') || format(endOfMonth(new Date()), 'yyyy-MM-dd')
    const roomType = searchParams.get('roomType') || 'all'

        
    let revenueQuery = supabase
      .from('invoices')
      .select(`
        total_amount,
        status,
        created_at,
        reservation_id
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate + ' 23:59:59')

    const { data: rawInvoicesData, error: invoicesError } = await revenueQuery

    let invoicesData = rawInvoicesData || []

    
    if (roomType !== 'all' && invoicesData.length > 0) {
      const { data: filteredRes, error: filteredResErr } = await supabase
        .from('reservations')
        .select('id, rooms!inner(type)')
        .eq('rooms.type', roomType)
        .in('id', invoicesData.map(i => i.reservation_id).filter(id => id != null))
        
      if (!filteredResErr && filteredRes) {
        const validResIds = new Set(filteredRes.map(r => r.id))
        invoicesData = invoicesData.filter(i => validResIds.has(i.reservation_id))
      }
    }

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError)
    }

    let reservationsQuery = supabase
      .from('reservations')
      .select(`
        *,
        guests(full_name, email, phone),
        rooms(number, type, base_price, status)
      `)
      .gte('check_in', startDate)
      .lte('check_out', endDate)

    if (roomType !== 'all') {
      reservationsQuery = reservationsQuery.eq('rooms.type', roomType)
    }

    const { data: reservationsData, error: reservationsError } = await reservationsQuery

    if (reservationsError) {
      console.error('Error fetching reservations:', reservationsError)
    }

    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .order('number')

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError)
    }

    const { data: roomServiceData, error: roomServiceError } = await supabase
      .from('room_service_requests')
      .select('*')
      .gte('requested_at', startDate)
      .lte('requested_at', endDate + ' 23:59:59')
      .order('requested_at', { ascending: false })

    if (roomServiceError && roomServiceError.code !== '42P01') {
      console.error('Error fetching room service requests:', roomServiceError)
    }

    const { data: housekeepingData, error: housekeepingError } = await supabase
      .from('housekeeping_tasks')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate + ' 23:59:59')
      .order('created_at', { ascending: false })

    if (housekeepingError && housekeepingError.code !== '42P01') {
      console.error('Error fetching housekeeping tasks:', housekeepingError)
    }

    const { data: billingItemsData, error: billingItemsError } = await supabase
      .from('billing_items')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate + ' 23:59:59')

    if (billingItemsError && billingItemsError.code !== '42P01') {
      console.error('Error fetching billing items:', billingItemsError)
    }

    const sixMonthsAgo = format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd')

    const { data: trendInvoicesData, error: trendInvoicesError } = await supabase
      .from('invoices')
      .select('total_amount, status, created_at')
      .gte('created_at', sixMonthsAgo)

    if (trendInvoicesError) {
      console.error('Error fetching trend invoices:', trendInvoicesError)
    }

    const { data: trendReservationsData, error: trendReservationsError } = await supabase
      .from('reservations')
      .select('check_in, check_out, status, created_at')
      .not('status', 'in', '("cancelled","no_show")')
      .gte('check_out', sixMonthsAgo)

    if (trendReservationsError) {
      console.error('Error fetching trend reservations:', trendReservationsError)
    }

    const analytics = calculateAnalytics({
      invoices: invoicesData || [],
      reservations: reservationsData || [],
      rooms: roomsData || [],
      roomService: roomServiceData || [],
      housekeeping: housekeepingData || [],
      billingItems: billingItemsData || [],
      trendInvoices: trendInvoicesData || [],
      trendReservations: trendReservationsData || [],
      startDate,
      endDate
    })

    return NextResponse.json({
      success: true,
      data: analytics,
      dateRange: { startDate, endDate },
      filters: { roomType }
    })

  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function overlapNights(checkIn: string, checkOut: string, rangeStart: Date, rangeEnd: Date): number {
  const start = new Date(checkIn) > rangeStart ? new Date(checkIn) : rangeStart
  const end = new Date(checkOut) < rangeEnd ? new Date(checkOut) : rangeEnd
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
  return Math.max(0, nights)
}

function calculateAnalytics(data: any) {
  const { invoices, reservations, rooms, roomService, housekeeping, billingItems, trendInvoices, trendReservations, startDate, endDate } = data

  const totalRevenue = invoices.reduce((sum: number, invoice: any) => {
    return sum + (invoice.status === 'paid' ? (invoice.total_amount || 0) : 0)
  }, 0)

  const totalBookings = reservations.length
  const totalRooms = rooms.length

  const occupiedRooms = rooms.filter((room: any) => room.status === 'occupied').length

  const periodStart = startOfDay(parseISO(startDate))
  const periodEnd = endOfDay(parseISO(endDate))
  const periodDays = Math.max(1, Math.round((periodEnd.getTime() - periodStart.getTime()) / 86400000))
  const activeReservations = reservations.filter((res: any) => !['cancelled', 'no_show'].includes(res.status))
  const occupiedRoomNights = activeReservations.reduce(
    (sum: number, res: any) => sum + overlapNights(res.check_in, res.check_out, periodStart, periodEnd),
    0
  )
  const currentOccupancyRate = totalRooms > 0
    ? Math.min(100, (occupiedRoomNights / (totalRooms * periodDays)) * 100)
    : 0

  const revenueByRoomType = rooms.reduce((acc: any, room: any) => {
    if (!acc[room.type]) {
      acc[room.type] = { revenue: 0, bookings: 0 }
    }

    const roomReservations = reservations.filter((res: any) => res.room_id === room.id)
    const roomRevenue = roomReservations.reduce((sum: number, res: any) => sum + (res.total_amount || 0), 0)

    acc[room.type].revenue += roomRevenue
    acc[room.type].bookings += roomReservations.length

    return acc
  }, {})

  const monthlyRevenue = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i)
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfDay(endOfMonth(monthDate))
    const monthStartStr = format(monthStart, 'yyyy-MM-dd')
    const monthEndStr = format(monthEnd, 'yyyy-MM-dd')
    const daysInMonth = Math.round((monthEnd.getTime() - monthStart.getTime()) / 86400000) + 1

    const monthInvoices = trendInvoices.filter((inv: any) => {
      const invDate = format(new Date(inv.created_at), 'yyyy-MM-dd')
      return invDate >= monthStartStr && invDate <= monthEndStr && inv.status === 'paid'
    })

    const monthBookings = trendReservations.filter((res: any) => {
      const resDate = format(new Date(res.created_at), 'yyyy-MM-dd')
      return resDate >= monthStartStr && resDate <= monthEndStr
    })

    const monthRoomNights = trendReservations.reduce(
      (sum: number, res: any) => sum + overlapNights(res.check_in, res.check_out, monthStart, monthEnd),
      0
    )

    monthlyRevenue.push({
      month: format(monthDate, 'MMM'),
      revenue: monthInvoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0),
      bookings: monthBookings.length,
      adr: monthBookings.length > 0
        ? monthInvoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0) / monthBookings.length
        : 0,
      occupancy: totalRooms > 0
        ? Math.min(100, Math.round((monthRoomNights / (totalRooms * daysInMonth)) * 1000) / 10)
        : 0
    })
  }

  const checkInOutData = []
  const rangeAnchor = endOfDay(parseISO(endDate))
  for (let i = 6; i >= 0; i--) {
    const date = new Date(rangeAnchor)
    date.setDate(date.getDate() - i)
    const dateStr = format(date, 'yyyy-MM-dd')

    const checkIns = reservations.filter((res: any) =>
      format(new Date(res.check_in), 'yyyy-MM-dd') === dateStr
    ).length

    const checkOuts = reservations.filter((res: any) =>
      format(new Date(res.check_out), 'yyyy-MM-dd') === dateStr
    ).length

    checkInOutData.push({
      date: format(date, 'dd MMM'),
      checkIns,
      checkOuts
    })
  }

  const roomServiceStats = {
    total: roomService.length,
    pending: roomService.filter((req: any) => req.status === 'pending').length,
    inProgress: roomService.filter((req: any) => req.status === 'in-progress').length,
    completed: roomService.filter((req: any) => req.status === 'completed').length,
    byType: roomService.reduce((acc: any, req: any) => {
      acc[req.service_type] = (acc[req.service_type] || 0) + 1
      return acc
    }, {}),
    byPriority: roomService.reduce((acc: any, req: any) => {
      acc[req.priority] = (acc[req.priority] || 0) + 1
      return acc
    }, {})
  }

  const housekeepingStats = {
    total: housekeeping.length,
    pending: housekeeping.filter((task: any) => task.status === 'pending').length,
    inProgress: housekeeping.filter((task: any) => task.status === 'in-progress').length,
    completed: housekeeping.filter((task: any) => task.status === 'completed').length,
    averageTime: housekeeping
      .filter((task: any) => task.actual_duration)
      .reduce((sum: number, task: any) => sum + (task.actual_duration || 0), 0) /
      Math.max(1, housekeeping.filter((task: any) => task.actual_duration).length)
  }

  const roomIssues = buildRoomIssues(housekeeping)

  const adr = totalBookings > 0 ? totalRevenue / totalBookings : 0
  const revpar = totalRooms > 0 ? totalRevenue / totalRooms : 0

  return {
    summary: {
      totalRevenue,
      totalBookings,
      currentOccupancyRate,
      adr,
      revpar,
      totalRooms,
      occupiedRooms
    },
    revenueData: monthlyRevenue,
    roomTypeRevenue: Object.keys(revenueByRoomType).map(type => ({
      name: type,
      value: revenueByRoomType[type].bookings,
      revenue: revenueByRoomType[type].revenue,
      color: getColorForRoomType(type)
    })),
    checkInOutData,
    roomServiceStats,
    housekeepingStats,
    roomIssues,
    billingItems: billingItems || []
  }
}

function getColorForRoomType(type: string): string {
  const colors: { [key: string]: string } = {
    'Presidential': '#8884d8',
    'Suite': '#82ca9d',
    'Deluxe': '#ffc658',
    'Standard': '#ff7300'
  }
  return colors[type] || '#0088fe'
}

function buildRoomIssues(housekeeping: any[]) {
  const maintenanceTasks = housekeeping.filter(task => task.task_type === 'maintenance')

  return maintenanceTasks.slice(0, 10).map(task => ({
    id: task.id,
    room: `Room ${task.room_id}`,
    issue: task.description || task.title || "Maintenance required",
    priority: task.priority || 'medium',
    status: task.status,
    reportedBy: "Housekeeping",
    reportedAt: task.created_at,
    assignedTo: task.assigned_to || "Maintenance Team",
    estimatedFix: task.due_date
  }))
}
