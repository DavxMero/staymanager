'use client'

/**
 * Rooms & Housekeeping Management System
 * 
 * ROOM MANAGEMENT: Original logic preserved, no changes
 * - Uses base_price column as per original design
 * - All existing room CRUD operations unchanged
 * - Room status management unchanged
 * 
 * HOUSEKEEPING ADDITIONS (New):
 * 1. Daily Tasks System:
 *    - Create daily cleaning tasks for available rooms
 *    - Tasks are created on-demand with "Create Daily Tasks" button
 *    - Prevents duplicate daily tasks for the same room on the same day
 * 
 * 2. Database Functions Added:
 *    - run_daily_housekeeping_tasks(): Creates daily tasks
 *    - create_checkout_cleaning_task(): Creates checkout tasks
 *    - get_housekeeping_task_summary(): Statistics
 * 
 * 3. Task Types:
 *    - daily: Routine daily cleaning for available rooms
 *    - checkout: Deep cleaning after guest checkout  
 *    - deep: Deep cleaning maintenance
 *    - special: Special requests
 */

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Edit,
  Trash2,
  Filter,
  Sparkles,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Building,
  Search,
  Star,
  RefreshCw
} from "lucide-react"
import { Room } from "@/types"
import { supabase } from "@/lib/supabaseClient"
import { transformRoomsQuery, formatCurrency as formatCurrencyCompat } from "@/lib/database-compatibility"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

// Types
interface HousekeepingTask {
  id: number
  created_at: string
  room_id: number
  room_number: string
  staff_id?: number
  assigned_to: string
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  task_type: 'daily' | 'deep' | 'checkout' | 'checkin' | 'maintenance' | 'special' | 'inspection'
  title?: string
  description?: string
  notes?: string
  completed_at?: string
  scheduled_at?: string
  due_date?: string
  estimated_duration: number // in minutes
  actual_duration?: number // in minutes
}

interface StaffMember {
  id: number
  employee_id?: string
  full_name: string
  role: 'housekeeper' | 'senior-housekeeper' | 'housekeeping-supervisor' | 'maintenance' | 'manager'
  status: 'available' | 'busy' | 'on-break' | 'off-duty' | 'on-leave'
  phone?: string
  email?: string
  is_active: boolean
}

const statusVariants = {
  available: "bg-green-100 text-green-800",
  occupied: "bg-red-100 text-red-800",
  reserved: "bg-purple-100 text-purple-800",
  cleaning: "bg-yellow-100 text-yellow-800",
  maintenance: "bg-blue-100 text-blue-800",
  'out-of-order': "bg-gray-100 text-gray-800",
}

export default function RoomsPage() {
  // Room management state
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [roomNumber, setRoomNumber] = useState("")
  const [roomType, setRoomType] = useState("")
  const [roomPrice, setRoomPrice] = useState("")
  const [roomStatus, setRoomStatus] = useState<string>("available")
  const [error, setError] = useState<string | null>(null)

  // Custom room type states
  const [customRoomTypes, setCustomRoomTypes] = useState<string[]>([])
  const [isAddingCustomType, setIsAddingCustomType] = useState(false)
  const [newCustomType, setNewCustomType] = useState("")

  // Room filter states
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [floorFilter, setFloorFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Housekeeping state
  const [tasks, setTasks] = useState<HousekeepingTask[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [filteredTasks, setFilteredTasks] = useState<HousekeepingTask[]>([])
  const [loading, setLoading] = useState(true)

  // Housekeeping form states
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<HousekeepingTask | null>(null)

  // Housekeeping filter states
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Housekeeping form fields
  const [taskRoomId, setTaskRoomId] = useState<number | null>(null)
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [taskStatus, setTaskStatus] = useState<'pending' | 'in-progress' | 'completed' | 'cancelled'>('pending')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [taskType, setTaskType] = useState<'daily' | 'deep' | 'checkout' | 'special'>('daily')
  const [notes, setNotes] = useState<string>('')
  const [estimatedDuration, setEstimatedDuration] = useState<number>(30)

  const applyFilters = useCallback(() => {
    let result = [...rooms]

    // Filter by room type
    if (typeFilter !== "all") {
      result = result.filter(room => room.type === typeFilter)
    }

    // Filter by floor
    if (floorFilter !== "all") {
      result = result.filter(room => room.floor === parseInt(floorFilter))
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(room => room.status === statusFilter)
    }

    setFilteredRooms(result)
  }, [rooms, typeFilter, floorFilter, statusFilter])

  const fetchRooms = async () => {
    try {
      // Fetch all rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('number')

      if (roomsError) {
        console.error('Rooms fetch error:', roomsError)
        // Handle specific RLS error
        if (roomsError.message?.includes('row-level security')) {
          throw new Error('Permission denied: You do not have permission to view rooms. Please check your user role.')
        }
        throw roomsError
      }

      console.log('Rooms data fetched:', roomsData)

      // Fetch current reservations to check room occupancy
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('room_id, status')
        .in('status', ['confirmed', 'checked-in'])

      if (reservationsError) {
        console.error('Reservations fetch error:', reservationsError)
        // Handle specific RLS error
        if (reservationsError.message?.includes('row-level security')) {
          throw new Error('Permission denied: You do not have permission to view reservations.')
        }
        throw reservationsError
      }

      // Create a set of occupied room IDs
      const occupiedRoomIds = new Set(
        reservationsData.map(reservation => reservation.room_id)
      )

      // Update room status based on reservations
      const updatedRooms = roomsData.map(room => {
        if (occupiedRoomIds.has(room.id)) {
          return { ...room, status: 'occupied' }
        }
        return room
      })

      setRooms(transformRoomsQuery(updatedRooms))
    } catch (err) {
      console.error('Error fetching rooms:', err)
      console.error('Error details:', {
        message: (err as Error).message,
        name: (err as Error).name,
        stack: (err as Error).stack
      })

      // Handle specific RLS error
      if ((err as Error).message?.includes('row-level security')) {
        setError('Permission denied: ' + (err as Error).message)
      } else {
        setError('Failed to fetch rooms: ' + (err as Error).message)
      }
    }
  }

  useEffect(() => {
    const fetchAllData = async () => {
      await fetchRooms()
      await fetchHousekeepingData()
      loadCustomRoomTypes()
    }
    fetchAllData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // Custom room type management functions
  const loadCustomRoomTypes = () => {
    try {
      const savedTypes = localStorage.getItem('customRoomTypes')
      if (savedTypes) {
        const types = JSON.parse(savedTypes)
        setCustomRoomTypes(types)
      }
    } catch (error) {
      console.error('Error loading custom room types:', error)
    }
  }

  const saveCustomRoomTypes = (types: string[]) => {
    try {
      localStorage.setItem('customRoomTypes', JSON.stringify(types))
      setCustomRoomTypes(types)
    } catch (error) {
      console.error('Error saving custom room types:', error)
    }
  }

  const handleAddCustomRoomType = () => {
    const trimmedType = newCustomType.trim()
    if (!trimmedType) {
      setError('Please enter a room type name')
      return
    }

    // Check if type already exists (case insensitive)
    const allExistingTypes = [...getDefaultRoomTypes(), ...customRoomTypes]
    if (allExistingTypes.some(type => type.toLowerCase() === trimmedType.toLowerCase())) {
      setError('This room type already exists')
      return
    }

    const updatedTypes = [...customRoomTypes, trimmedType]
    saveCustomRoomTypes(updatedTypes)
    setRoomType(trimmedType)
    setNewCustomType('')
    setIsAddingCustomType(false)
    setError(null)
  }

  const getDefaultRoomTypes = () => {
    return ['Standard', 'Deluxe', 'Suite', 'Presidential']
  }

  const getAllRoomTypes = () => {
    return [...getDefaultRoomTypes(), ...customRoomTypes]
  }

  // Real booking system functions

  const handleRoomCheckout = async (roomId: number, roomNumber: string) => {
    if (!confirm(`Confirm checkout for Room ${roomNumber}?`)) return false

    try {
      // Find and complete the current reservation
      const { data: reservations, error: findError } = await supabase
        .from('reservations')
        .select('id')
        .eq('room_id', roomId)
        .in('status', ['confirmed', 'checked-in'])
        .limit(1)

      if (findError) throw findError

      if (reservations && reservations.length > 0) {
        // Update reservation status to checked-out
        const { error: updateError } = await supabase
          .from('reservations')
          .update({
            status: 'completed',
            actual_check_out: new Date().toISOString()
          })
          .eq('id', reservations[0].id)

        if (updateError) throw updateError
      }

      // Set room status to cleaning (this will trigger HIGH priority task creation)
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'cleaning' })
        .eq('id', roomId)

      if (roomError) throw roomError

      console.log(`Room ${roomNumber} checked out successfully`)
      await fetchRooms()
      await fetchHousekeepingData()
      return true
    } catch (err) {
      console.error('Error during checkout:', err)
      setError('Failed to checkout: ' + (err as Error).message)
      return false
    }
  }

  const handleRoomCheckin = async (roomId: number, roomNumber: string) => {
    try {
      // Check room status first
      const { data: roomData, error: roomStatusError } = await supabase
        .from('rooms')
        .select('status')
        .eq('id', roomId)
        .single()

      if (roomStatusError) throw roomStatusError

      if (roomData.status === 'maintenance' || roomData.status === 'out-of-order') {
        setError(`Cannot check-in Room ${roomNumber}: Room is under maintenance or out of order`)
        return false
      }

      // Find pending/confirmed reservation for this room
      const { data: reservations, error: findError } = await supabase
        .from('reservations')
        .select('id, guest_name, check_in_date')
        .eq('room_id', roomId)
        .in('status', ['confirmed'])
        .order('check_in_date', { ascending: true })
        .limit(1)

      if (findError) throw findError

      if (!reservations || reservations.length === 0) {
        setError(`No confirmed reservation found for Room ${roomNumber}`)
        return false
      }

      const reservation = reservations[0]

      if (!confirm(`Confirm check-in for ${reservation.guest_name} in Room ${roomNumber}?`)) {
        return false
      }

      // Update reservation status to checked-in
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'checked-in',
          actual_check_in: new Date().toISOString()
        })
        .eq('id', reservation.id)

      if (updateError) throw updateError

      // Set room status to occupied
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', roomId)

      if (roomError) throw roomError

      console.log(`Room ${roomNumber} checked in successfully`)
      await fetchRooms()
      await fetchHousekeepingData()
      return true
    } catch (err) {
      console.error('Error during checkin:', err)
      setError('Failed to checkin: ' + (err as Error).message)
      return false
    }
  }

  const handleRoomBooking = async (roomId: number, roomNumber: string, roomPrice: number) => {
    try {
      // Check room status first
      const { data: roomData, error: roomStatusError } = await supabase
        .from('rooms')
        .select('status')
        .eq('id', roomId)
        .single()

      if (roomStatusError) throw roomStatusError

      if (roomData.status === 'maintenance' || roomData.status === 'out-of-order') {
        setError(`Cannot book Room ${roomNumber}: Room is under maintenance or out of order`)
        return false
      }

      // Show booking dialog
      const guestName = prompt('Enter guest name for booking:')
      if (!guestName) return false

      const guestPhone = prompt('Enter guest phone number:')
      if (!guestPhone) return false

      const nights = prompt('Number of nights:', '1')
      const numberOfNights = parseInt(nights || '1')
      if (numberOfNights < 1) {
        setError('Number of nights must be at least 1')
        return false
      }

      const checkinDate = new Date()
      const checkoutDate = new Date(checkinDate)
      checkoutDate.setDate(checkoutDate.getDate() + numberOfNights)

      // --- GUEST MANAGEMENT INTEGRATION ---
      let guestId: number | null = null

      // 1. Try to find existing guest
      let query = supabase.from('guests').select('id')
      if (guestPhone) {
        query = query.eq('phone', guestPhone)
      } else {
        query = query.eq('name', guestName)
      }

      const { data: existingGuests } = await query.limit(1)

      if (existingGuests && existingGuests.length > 0) {
        guestId = existingGuests[0].id
      } else {
        // 2. Create new guest
        const { data: newGuest, error: createGuestError } = await supabase
          .from('guests')
          .insert({
            name: guestName,
            phone: guestPhone,
            identification_type: 'KTP',
            identification_number: '-',
            nationality: 'Indonesia'
          })
          .select('id')
          .single()

        if (!createGuestError) {
          guestId = newGuest.id
        }
      }
      // ------------------------------------

      // Create reservation with correct field names
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          room_id: roomId,
          guest_id: guestId, // Link guest
          guest_name: guestName,
          guest_phone: guestPhone,
          check_in_date: checkinDate.toISOString(),
          check_out_date: checkoutDate.toISOString(),
          room_rate: roomPrice,
          room_total: roomPrice * numberOfNights,
          total_amount: roomPrice * numberOfNights,
          status: 'confirmed',
          payment_status: 'pending',
          adults: 1,
          children: 0
        })
        .select()
        .single()

      if (reservationError) throw reservationError

      // Set room status to reserved
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'reserved' })
        .eq('id', roomId)

      if (roomError) throw roomError

      alert(`Booking confirmed!\n\nGuest: ${guestName}\nRoom: ${roomNumber}\nNights: ${numberOfNights}\nTotal: ${formatCurrencyCompat(roomPrice * numberOfNights)}`)

      console.log(`Room ${roomNumber} booked successfully for ${guestName}`)
      await fetchRooms()
      await fetchHousekeepingData()
      return true
    } catch (err) {
      console.error('Error during booking:', err)
      setError('Failed to create booking: ' + (err as Error).message)
      return false
    }
  }

  const handleMaintenanceComplete = async (roomId: number, roomNumber: string) => {
    if (!confirm(`Mark maintenance complete for Room ${roomNumber}?`)) return false

    try {
      // Set room status to available
      const { error } = await supabase
        .from('rooms')
        .update({ status: 'available' })
        .eq('id', roomId)

      if (error) throw error

      console.log(`Room ${roomNumber} maintenance completed`)
      await fetchRooms()
      await fetchHousekeepingData()
      return true
    } catch (err) {
      console.error('Error completing maintenance:', err)
      setError('Failed to complete maintenance: ' + (err as Error).message)
      return false
    }
  }

  const handleAddRoom = () => {
    setCurrentRoom(null)
    setRoomNumber("")
    setRoomType("")
    setRoomPrice("")
    setRoomStatus("available")
    setIsAddingCustomType(false)
    setNewCustomType('')
    setError(null)
    setIsDialogOpen(true)
  }

  const handleEditRoom = (room: Room) => {
    setCurrentRoom(room)
    setRoomNumber(room.number)
    setRoomType(room.type)
    setRoomPrice(room.price.toString())
    setRoomStatus(room.status || "available")
    setIsAddingCustomType(false)
    setNewCustomType('')
    setError(null)
    setIsDialogOpen(true)
  }

  const handleSaveRoom = async () => {
    try {
      if (currentRoom) {
        // Edit existing room
        const { data, error } = await supabase
          .from('rooms')
          .update({
            number: roomNumber,
            type: roomType,
            base_price: parseFloat(roomPrice),
            floor: roomNumber ? parseInt(roomNumber.charAt(0)) : null,
            status: roomStatus
          })
          .eq('id', currentRoom.id)
          .select()

        if (error) {
          console.error('Update room error:', error)
          throw error
        }

        console.log('Room updated:', data)
      } else {
        // Add new room
        const { data, error } = await supabase
          .from('rooms')
          .insert({
            number: roomNumber,
            type: roomType,
            base_price: parseFloat(roomPrice),
            floor: roomNumber ? parseInt(roomNumber.charAt(0)) : null,
            status: roomStatus
          })
          .select()

        if (error) {
          console.error('Insert room error:', error)
          throw error
        }

        console.log('Room inserted:', data)
      }

      // Refresh the room list
      await fetchRooms()
      setIsDialogOpen(false)
    } catch (err) {
      console.error('Error saving room:', err)
      console.error('Error details:', {
        message: (err as Error).message,
        name: (err as Error).name,
        stack: (err as Error).stack
      })

      // Handle specific RLS error
      if ((err as Error).message?.includes('row-level security')) {
        setError('Permission denied: You do not have permission to modify rooms. Please check your user role.')
      } else {
        setError('Failed to save room: ' + (err as Error).message)
      }
    }
  }

  const handleDeleteRoom = async (roomId: number) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)

      if (error) {
        console.error('Delete room error:', error)
        // Handle specific RLS error
        if (error.message?.includes('row-level security')) {
          throw new Error('Permission denied: You do not have permission to delete rooms.')
        }
        throw error
      }

      // Refresh the room list
      await fetchRooms()
    } catch (err) {
      console.error('Error deleting room:', err)
      console.error('Error details:', {
        message: (err as Error).message,
        name: (err as Error).name,
        stack: (err as Error).stack
      })

      // Handle specific RLS error
      if ((err as Error).message?.includes('row-level security')) {
        setError('Permission denied: ' + (err as Error).message)
      } else {
        setError('Failed to delete room: ' + (err as Error).message)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Housekeeping functions
  const applyTaskFilters = useCallback(() => {
    let result = [...tasks]

    // Filter out completed tasks (hide completed from view)
    result = result.filter(task => task.status !== 'completed')

    // Status filter
    if (taskStatusFilter !== 'all') {
      result = result.filter(task => task.status === taskStatusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter)
    }

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(task =>
        task.room_number.toLowerCase().includes(term) ||
        task.assigned_to.toLowerCase().includes(term) ||
        (task.notes && task.notes.toLowerCase().includes(term))
      )
    }

    setFilteredTasks(result)
  }, [tasks, taskStatusFilter, priorityFilter, searchTerm])

  // Utility function to check if error indicates missing table
  const isTableMissingError = (error: any): boolean => {
    if (!error) return false

    // Check for various indicators that table doesn't exist
    return (
      error.message?.includes('relation') && error.message?.includes('does not exist') ||
      error.code === '42P01' || // PostgreSQL: undefined_table
      error.code === 'PGRST102' || // PostgREST: table not found
      Object.keys(error).length === 0 || // Empty error object
      JSON.stringify(error) === '{}' // Stringified empty object
    )
  }

  const fetchHousekeepingData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch tasks with room information via JOIN
      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from('housekeeping_tasks')
          .select(`
            *,
            rooms!housekeeping_tasks_room_id_fkey(
              number
            )
          `)
          .order('created_at', { ascending: false })

        if (tasksError) {
          if (isTableMissingError(tasksError)) {
            console.info('Housekeeping: Table not found, using empty task list. This is normal for new installations.')
            setTasks([])
          } else {
            console.warn('Housekeeping tasks query issue:', {
              message: tasksError.message || 'Unknown error',
              code: tasksError.code || 'No error code',
              details: tasksError.details || 'No details'
            })
            setTasks([])
          }
        } else {
          // Transform tasks to include room_number from JOIN
          const transformedTasks = (tasksData || []).map(task => ({
            ...task,
            room_number: task.rooms?.number || 'Unknown',
            assigned_to: task.assigned_to || 'Unassigned'
          }))
          setTasks(transformedTasks)
          console.log(`Loaded ${transformedTasks.length} housekeeping tasks`)
        }
      } catch (tasksError) {
        console.error('Error fetching tasks:', {
          error: tasksError,
          message: tasksError instanceof Error ? tasksError.message : 'Unknown error',
          type: typeof tasksError
        })
        setTasks([])
      }

      // Fetch real staff data
      try {
        const { data: staffData, error: staffError } = await supabase
          .from('staff_members')
          .select('*')
          .eq('is_active', true)
          .order('full_name')

        if (staffError) {
          if (isTableMissingError(staffError)) {
            console.info('Staff management: Table not found, using empty staff list. This is normal for new installations.')
            setStaff([])
          } else {
            console.warn('Staff members query issue:', {
              message: staffError.message || 'Unknown error',
              code: staffError.code || 'No error code',
              details: staffError.details || 'No details'
            })
            setStaff([])
          }
        } else {
          setStaff(staffData || [])
          console.log(`Loaded ${(staffData || []).length} staff members`)
        }
      } catch (staffErr) {
        console.error('Error fetching staff:', {
          error: staffErr,
          message: staffErr instanceof Error ? staffErr.message : 'Unknown error',
          type: typeof staffErr
        })
        setStaff([])
      }
    } catch (err) {
      console.error('Error fetching housekeeping data:', err)
      // Don't show error to user if it's just missing tables - this is expected in new setups
      console.info('Housekeeping data fetch completed with warnings. This is normal if housekeeping features are not yet configured.')
    } finally {
      // Final status summary
      console.info(`Data fetch complete - Tasks: ${tasks.length}, Staff: ${staff.length}`)
      setLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setLoading(true)
      await fetchRooms()
      await fetchHousekeepingData()
      console.log('Synchronization completed')
    } catch (err) {
      console.error('Error during sync:', err)
      setError('Failed to synchronize data')
    } finally {
      setLoading(false)
    }
  }

  const handleDailyTasks = async () => {
    try {
      setLoading(true)
      console.log('Creating daily housekeeping tasks...')

      const response = await fetch('/api/housekeeping/daily-maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        console.log(`Daily tasks created: ${result.message}`)
        await fetchHousekeepingData()
        const detailMessage = result.details ? `\n\nDetail: ${result.details}` : ''
        alert(`Daily Tasks berhasil dibuat!\n${result.message}${detailMessage}`)
      } else {
        throw new Error(result.error || 'Failed to create daily tasks')
      }
    } catch (err) {
      console.error('Error creating daily tasks:', err)
      setError(`Failed to create daily tasks: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCheckoutTask = async (roomId: number) => {
    try {
      setLoading(true)
      console.log(`Creating checkout cleaning task for room ${roomId}...`)

      const response = await fetch('/api/housekeeping/checkout-cleaning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId })
      })

      const result = await response.json()

      if (result.success) {
        console.log(`Checkout cleaning task created: ${result.message}`)
        await fetchHousekeepingData()
        alert(`Checkout Cleaning Task berhasil dibuat!\n${result.message}`)
      } else {
        throw new Error(result.error || 'Failed to create checkout cleaning task')
      }
    } catch (err) {
      console.error('Error creating checkout cleaning task:', err)
      setError(`Failed to create checkout cleaning task: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetTaskForm = () => {
    setTaskRoomId(null)
    setAssignedTo('')
    setTaskStatus('pending')
    setPriority('medium')
    setTaskType('daily')
    setNotes('')
    setEstimatedDuration(30)
    setEditingTask(null)
  }

  const handleAddTask = () => {
    resetTaskForm()
    setIsTaskDialogOpen(true)
  }

  const handleEditTask = (task: HousekeepingTask) => {
    setEditingTask(task)
    setTaskRoomId(task.room_id)
    setAssignedTo(task.assigned_to)
    setTaskStatus(task.status)
    setPriority(task.priority)
    setTaskType(task.task_type)
    setNotes(task.notes || '')
    setEstimatedDuration(task.estimated_duration)
    setIsTaskDialogOpen(true)
  }

  const handleSaveTask = async () => {
    try {
      if (!taskRoomId) {
        setError('Please select a room')
        return
      }

      // Find staff_id if a staff member is selected
      const selectedStaff = assignedTo ? staff.find(s => s.full_name === assignedTo) : null
      const staff_id = selectedStaff ? selectedStaff.id : null

      if (editingTask) {
        const { error } = await supabase
          .from('housekeeping_tasks')
          .update({
            room_id: taskRoomId,
            staff_id: staff_id,
            assigned_to: assignedTo || '',
            status: taskStatus,
            priority,
            task_type: taskType,
            title: taskType.charAt(0).toUpperCase() + taskType.slice(1) + ` - Room ${rooms.find(r => r.id === taskRoomId)?.number}`,
            description: notes || `${taskType} task for room ${rooms.find(r => r.id === taskRoomId)?.number}`,
            notes,
            estimated_duration: estimatedDuration
          })
          .eq('id', editingTask.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('housekeeping_tasks')
          .insert({
            room_id: taskRoomId,
            staff_id: staff_id,
            assigned_to: assignedTo || '',
            status: taskStatus,
            priority,
            task_type: taskType,
            title: taskType.charAt(0).toUpperCase() + taskType.slice(1) + ` - Room ${rooms.find(r => r.id === taskRoomId)?.number}`,
            description: notes || `${taskType} task for room ${rooms.find(r => r.id === taskRoomId)?.number}`,
            notes,
            estimated_duration: estimatedDuration,
            created_by: 'manual'
          })

        if (error) throw error
      }

      await fetchHousekeepingData()
      setIsTaskDialogOpen(false)
      resetTaskForm()
    } catch (err) {
      console.error('Error saving task:', err)
      const errorMessage = (err as Error)?.message || 'Unknown error'
      if (errorMessage.includes('relation "housekeeping_tasks" does not exist')) {
        setError('Housekeeping system not set up. Please set up the database first.')
      } else {
        setError(`Failed to save task: ${errorMessage}`)
      }
    }
  }

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchHousekeepingData()
    } catch (err) {
      console.error('Error deleting task:', err)
      setError('Failed to delete task: ' + (err as Error).message)
    }
  }

  const handleMarkAsComplete = async (id: number) => {
    try {
      // 1. Get the task details first to know which room to update
      const { data: taskData, error: fetchError } = await supabase
        .from('housekeeping_tasks')
        .select('room_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // 2. Update task status to completed
      const { error: updateTaskError } = await supabase
        .from('housekeeping_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateTaskError) throw updateTaskError

      // 3. Update room status to available
      if (taskData && taskData.room_id) {
        const { error: updateRoomError } = await supabase
          .from('rooms')
          .update({ status: 'available' })
          .eq('id', taskData.room_id)

        if (updateRoomError) throw updateRoomError
      }

      // 4. Refresh data
      await fetchHousekeepingData()
      await fetchRooms() // Refresh rooms to reflect status change

    } catch (err) {
      console.error('Error completing task:', err)
      setError('Failed to complete task: ' + (err as Error).message)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'daily': return <Clock className="h-4 w-4" />
      case 'deep': return <Sparkles className="h-4 w-4" />
      case 'checkout': return <CheckCircle className="h-4 w-4" />
      case 'special': return <Star className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTaskTypeName = (taskType: string) => {
    switch (taskType) {
      case 'daily': return 'Daily Cleaning'
      case 'deep': return 'Deep Cleaning'
      case 'checkout': return 'Check-out Cleaning'
      case 'special': return 'Special Request'
      default: return taskType
    }
  }

  // Apply task filters
  useEffect(() => {
    applyTaskFilters()
  }, [applyTaskFilters])

  // Calculate statistics
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
    urgentTasks: tasks.filter(t => t.priority === 'urgent').length,
    availableStaff: staff.filter(s => s.status === 'available').length,
    availableRooms: rooms.filter(r => r.status === 'available').length,
    cleaningRooms: rooms.filter(r => r.status === 'cleaning').length
  }

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0

  // Get unique room types and floors for filters
  const roomTypes = [...new Set([...rooms.map(room => room.type), ...getAllRoomTypes()])]
  const floors = [...new Set(rooms.map(room => room.floor))].filter(f => f !== undefined && f !== null).sort((a, b) => (a as number) - (b as number))

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4"
      >
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
          <button
            className="mt-2 bg-red-700 text-white px-4 py-2 rounded"
            onClick={fetchRooms}
          >
            Retry
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8 text-blue-600" />
            Rooms & Housekeeping
          </h1>
          <p className="text-muted-foreground">Manage your property rooms and housekeeping tasks</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Data
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-red-500">&times;</span>
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
            <p className="text-xs text-muted-foreground">All rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableRooms}</div>
            <p className="text-xs text-muted-foreground">Ready for guests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cleaning</CardTitle>
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cleaningRooms}</div>
            <p className="text-xs text-muted-foreground">Being cleaned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">Housekeeping tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">{completionRate}% rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Staff</CardTitle>
            <User className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableStaff}</div>
            <p className="text-xs text-muted-foreground">Ready to work</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Rooms
          </TabsTrigger>
          <TabsTrigger value="housekeeping" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Housekeeping
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Staff
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Room Management</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button onClick={handleAddRoom}>
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </Button>
            </div>
          </div>

          {/* Room Filters */}
          {showFilters && (
            <Card className="border-2 border-dashed border-border bg-muted/30 dark:bg-muted/10">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-semibold">Filter Rooms</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <span className="sr-only">Close filters</span>
                    <span className="text-lg">&times;</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Room Type Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="typeFilter" className="text-sm font-medium">
                      Room Type
                    </Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger id="typeFilter" className="h-10 bg-background">
                        <SelectValue placeholder="All Types">
                          {typeFilter === "all" ? "All Types" : typeFilter}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {roomTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Floor Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="floorFilter" className="text-sm font-medium">
                      Floor
                    </Label>
                    <Select value={floorFilter} onValueChange={setFloorFilter}>
                      <SelectTrigger id="floorFilter" className="h-10 bg-background">
                        <SelectValue placeholder="All Floors">
                          {floorFilter === "all" ? "All Floors" : `Floor ${floorFilter}`}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Floors</SelectItem>
                        {floors.map(floor => (
                          <SelectItem key={floor} value={floor.toString()}>
                            Floor {floor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="roomStatusFilter" className="text-sm font-medium">
                      Status
                    </Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="roomStatusFilter" className="h-10 bg-background">
                        <SelectValue placeholder="All Statuses">
                          {statusFilter === "all" ? "All Statuses" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="available">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Available
                          </div>
                        </SelectItem>
                        <SelectItem value="occupied">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            Occupied
                          </div>
                        </SelectItem>
                        <SelectItem value="cleaning">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            Cleaning
                          </div>
                        </SelectItem>
                        <SelectItem value="maintenance">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            Maintenance
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filter Actions and Results */}
                <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTypeFilter("all")
                      setFloorFilter("all")
                      setStatusFilter("all")
                    }}
                    className="h-9 px-3 text-sm font-medium"
                  >
                    <span className="mr-1">🔄</span>
                    Clear Filters
                  </Button>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span>Showing <strong className="text-foreground">{filteredRooms.length}</strong> of <strong className="text-foreground">{rooms.length}</strong> rooms</span>
                    </div>

                    {(typeFilter !== "all" || floorFilter !== "all" || statusFilter !== "all") && (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="text-primary font-medium text-xs">Filtered</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Room {room.number}
                    {room.floor && (
                      <span className="block text-xs text-muted-foreground">
                        Floor {room.floor}
                      </span>
                    )}
                  </CardTitle>
                  <Badge className={statusVariants[room.status || 'available']}>
                    {room.status ? room.status.charAt(0).toUpperCase() + room.status.slice(1) : 'Available'}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{room.type}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrencyCompat(room.price)} per night
                  </p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <span className="font-medium">Status:</span> {room.status ? room.status.charAt(0).toUpperCase() + room.status.slice(1) : 'Available'} (Auto-managed)
                  </div>

                  {/* Room Actions */}
                  <div className="flex mt-4 space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRoom(room)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRoom(room.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Maintenance Action Only */}
                  {room.status === 'maintenance' && (
                    <div className="mt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs px-2 py-1 h-6 bg-blue-100 text-blue-800 hover:bg-blue-200"
                        onClick={() => handleMaintenanceComplete(room.id, room.number)}
                        disabled={loading}
                      >
                        ✅ Done Maintenance
                      </Button>
                    </div>
                  )}

                  {/* Status Indicators */}
                  {room.status === 'cleaning' && (
                    <div className="mt-3 text-xs text-orange-600 font-medium flex items-center gap-1">
                      🧹 Being cleaned (HIGH priority)
                    </div>
                  )}
                  {room.status === 'occupied' && (
                    <div className="mt-3 text-xs text-green-600 font-medium flex items-center gap-1">
                      🏠 Guest staying
                    </div>
                  )}
                  {room.status === 'reserved' && (
                    <div className="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1">
                      📅 Reserved
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="housekeeping" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Housekeeping Tasks</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDailyTasks}
                disabled={loading}
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Create Daily Tasks
              </Button>
              <Dialog open={isTaskDialogOpen} onOpenChange={(open) => {
                setIsTaskDialogOpen(open)
                if (!open) resetTaskForm()
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                    <DialogDescription>
                      {editingTask ? 'Edit the housekeeping task' : 'Add a new housekeeping task for a room'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="room" className="text-right">Room</Label>
                      <Select value={taskRoomId?.toString() || ""} onValueChange={(value) => setTaskRoomId(parseInt(value))}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map(room => (
                            <SelectItem key={room.id} value={room.id.toString()}>
                              Room {room.number} ({room.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Assigned To</Label>
                      <Select value={assignedTo} onValueChange={setAssignedTo}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select staff" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.filter(s => s.status !== 'off-duty' && s.status !== 'on-leave').map(staffMember => (
                            <SelectItem key={staffMember.id} value={staffMember.full_name}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${staffMember.status === 'available' ? 'bg-green-500' :
                                  staffMember.status === 'busy' ? 'bg-yellow-500' :
                                    staffMember.status === 'on-break' ? 'bg-blue-500' : 'bg-gray-500'
                                  }`}></div>
                                {staffMember.full_name}
                                {staffMember.employee_id && (
                                  <span className="text-xs text-muted-foreground">({staffMember.employee_id})</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Status</Label>
                      <Select value={taskStatus} onValueChange={(value: HousekeepingTask['status']) => setTaskStatus(value)}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Priority</Label>
                      <Select value={priority} onValueChange={(value: HousekeepingTask['priority']) => setPriority(value)}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Task Type</Label>
                      <Select value={taskType} onValueChange={(value: HousekeepingTask['task_type']) => setTaskType(value)}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily Cleaning</SelectItem>
                          <SelectItem value="deep">Deep Cleaning</SelectItem>
                          <SelectItem value="checkout">Check-out Cleaning</SelectItem>
                          <SelectItem value="special">Special Request</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Duration (min)</Label>
                      <Input
                        type="number"
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 0)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Notes</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="col-span-3"
                        placeholder="Special instructions or notes"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveTask}>
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Task Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Table */}
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Task Type</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            Room {task.room_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTaskTypeIcon(task.task_type)}
                            {getTaskTypeName(task.task_type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {task.assigned_to || 'Unassigned'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ') : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.estimated_duration} min</TableCell>
                        <TableCell>{format(new Date(task.created_at), 'dd MMM yyyy', { locale: localeId })}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {task.status !== 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsComplete(task.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTask(task)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Sparkles className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {searchTerm || taskStatusFilter !== 'all' || priorityFilter !== 'all'
                              ? 'No tasks match your filters'
                              : 'No housekeeping tasks found'}
                          </p>
                          {!searchTerm && taskStatusFilter === 'all' && priorityFilter === 'all' && (
                            <Button onClick={handleAddTask} size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Task
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Staff Availability</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${member.status === 'available' ? 'bg-green-500' :
                          member.status === 'busy' ? 'bg-yellow-500' :
                            member.status === 'on-break' ? 'bg-blue-500' :
                              member.status === 'on-leave' ? 'bg-purple-500' : 'bg-gray-500'
                          }`}></div>
                      </div>
                      <div>
                        <h3 className="font-medium">{member.full_name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground capitalize">{member.role ? member.role.replace('-', ' ') : 'Staff'}</p>
                          {member.employee_id && (
                            <span className="text-xs text-muted-foreground">({member.employee_id})</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        member.status === 'available' ? 'bg-green-100 text-green-800' :
                          member.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                            member.status === 'on-break' ? 'bg-blue-100 text-blue-800' :
                              member.status === 'on-leave' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                      }
                    >
                      {member.status ? member.status.charAt(0).toUpperCase() + member.status.slice(1).replace('-', ' ') : 'Unknown'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Room Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold">
              {currentRoom ? "Edit Room" : "Add New Room"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {currentRoom ? "Edit the room details" : "Create a new room for your property"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <Label htmlFor="roomNumber" className="text-sm font-medium">
                Room Number
              </Label>
              <Input
                id="roomNumber"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Enter room number"
                className="h-10"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="roomType" className="text-sm font-medium">
                Room Type
              </Label>

              {isAddingCustomType ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newCustomType}
                      onChange={(e) => setNewCustomType(e.target.value)}
                      placeholder="Enter custom room type"
                      className="h-10 flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustomRoomType()}
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomRoomType}
                      className="h-10 px-4"
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddingCustomType(false)
                        setNewCustomType('')
                        setError(null)
                      }}
                      className="h-10 px-4"
                    >
                      Cancel
                    </Button>
                  </div>
                  {error && error.includes('room type') && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                </div>
              ) : (
                <Select
                  value={roomType}
                  onValueChange={(value) => {
                    if (value === "__add_custom__") {
                      setIsAddingCustomType(true)
                    } else {
                      setRoomType(value)
                    }
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Default room types */}
                    <div className="text-xs text-muted-foreground px-2 py-1 font-medium">Default Types</div>
                    {getDefaultRoomTypes().map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}

                    {/* Custom room types */}
                    {customRoomTypes.length > 0 && (
                      <>
                        <div className="text-xs text-muted-foreground px-2 py-1 font-medium border-t mt-1 pt-1">Custom Types</div>
                        {customRoomTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </>
                    )}

                    {/* Add custom option */}
                    <div className="border-t mt-1 pt-1">
                      <SelectItem value="__add_custom__" className="text-blue-600 font-medium">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add Custom Type
                        </div>
                      </SelectItem>
                    </div>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="roomPrice" className="text-sm font-medium">
                Price per Night (Rp)
              </Label>
              <Input
                id="roomPrice"
                type="number"
                value={roomPrice}
                onChange={(e) => setRoomPrice(e.target.value)}
                placeholder="Enter price in Rupiah"
                className="h-10"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="roomStatus" className="text-sm font-medium">
                Room Status
              </Label>
              <Select value={roomStatus} onValueChange={setRoomStatus}>
                <SelectTrigger id="roomStatus" className="h-10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="out-of-order">Out of Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRoom}
              className="flex-1 sm:flex-none"
            >
              {currentRoom ? "Update Room" : "Add Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}