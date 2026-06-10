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
  RefreshCw,
  ImageIcon,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { toast } from 'sonner'
import { Room } from "@/types"
import { supabase } from "@/lib/supabaseClient"
import { transformRoomsQuery, formatCurrency as formatCurrencyCompat } from "@/lib/database-compatibility"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

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
  estimated_duration: number
  actual_duration?: number
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

const statusVariants: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  occupied: "bg-red-100 text-red-800",
  reserved: "bg-purple-100 text-purple-800",
  cleaning: "bg-yellow-100 text-yellow-800",
  maintenance: "bg-blue-100 text-blue-800",
  'out-of-order': "bg-gray-100 text-gray-800",
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [roomNumber, setRoomNumber] = useState("")
  const [roomType, setRoomType] = useState("")
  const [roomPrice, setRoomPrice] = useState("")
  const [roomStatus, setRoomStatus] = useState<string>("available")
  const [roomImageUrl, setRoomImageUrl] = useState<string>("")
  const [roomImages, setRoomImages] = useState<string[]>([])
  const [roomAmenities, setRoomAmenities] = useState<string[]>([])
  const [customAmenityInput, setCustomAmenityInput] = useState("")
  const [roomBedConfig, setRoomBedConfig] = useState<string>("")
  const [imageUploading, setImageUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingRoom, setIsDeletingRoom] = useState(false)
  const [isSavingTask, setIsSavingTask] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)

  const [customRoomTypes, setCustomRoomTypes] = useState<string[]>([])
  const [typeImagesByName, setTypeImagesByName] = useState<Record<string, string[]>>({})
  const [typeMetaByName, setTypeMetaByName] = useState<Record<string, {
    amenities: string[];
    max_occupancy: number | null;
    room_size: number | null;
    bed_configuration: string | null;
    description: string | null;
    view_type: string | null;
  }>>({})
  // Detail viewer state — Dialog dengan carousel + amenities untuk staff lihat info kamar lengkap
  const [viewRoom, setViewRoom] = useState<Room | null>(null)
  const [viewCarouselIndex, setViewCarouselIndex] = useState(0)
  const [isAddingCustomType, setIsAddingCustomType] = useState(false)
  const [newCustomType, setNewCustomType] = useState("")

  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [floorFilter, setFloorFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  const [tasks, setTasks] = useState<HousekeepingTask[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [filteredTasks, setFilteredTasks] = useState<HousekeepingTask[]>([])
  const [loading, setLoading] = useState(true)

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<HousekeepingTask | null>(null)

  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const [taskRoomId, setTaskRoomId] = useState<number | null>(null)
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [taskStatus, setTaskStatus] = useState<'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'failed'>('pending')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent' | 'critical'>('medium')
  const [taskType, setTaskType] = useState<'daily' | 'deep' | 'checkout' | 'checkin' | 'maintenance' | 'special' | 'inspection'>('daily')
  const [notes, setNotes] = useState<string>('')
  const [estimatedDuration, setEstimatedDuration] = useState<number>(30)

  const applyFilters = useCallback(() => {
    let result = [...rooms]

    if (typeFilter !== "all") {
      result = result.filter(room => room.type === typeFilter)
    }

    if (floorFilter !== "all") {
      result = result.filter(room => room.floor === parseInt(floorFilter))
    }

    if (statusFilter !== "all") {
      result = result.filter(room => room.status === statusFilter)
    }

    setFilteredRooms(result)
  }, [rooms, typeFilter, floorFilter, statusFilter])

  const fetchRooms = async () => {
    try {
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('number')

      if (roomsError) {
        console.error('Rooms fetch error:', roomsError)
        if (roomsError.message?.includes('row-level security')) {
          throw new Error('Permission denied: You do not have permission to view rooms. Please check your user role.')
        }
        throw roomsError
      }

      console.log('Rooms data fetched:', roomsData)

      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('room_id, status')
        .in('status', ['confirmed', 'checked-in'])

      if (reservationsError) {
        console.error('Reservations fetch error:', reservationsError)
        if (reservationsError.message?.includes('row-level security')) {
          throw new Error('Permission denied: You do not have permission to view reservations.')
        }
        throw reservationsError
      }

      const occupiedRoomIds = new Set(
        reservationsData.map(reservation => reservation.room_id)
      )

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

      if ((err as Error).message?.includes('row-level security')) {
        setError('Permission denied: ' + (err as Error).message)
      } else {
        setError('Failed to fetch rooms: ' + (err as Error).message)
      }
    }
  }

  const fetchTypeImages = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_room_types')
        .select('name, images, amenities, max_occupancy, room_size, bed_configuration, description, view_type')
      if (error) throw error
      const imageMap: Record<string, string[]> = {}
      const metaMap: typeof typeMetaByName = {}
      for (const row of (data || []) as Array<{
        name: string;
        images: unknown;
        amenities: unknown;
        max_occupancy: number | null;
        room_size: number | null;
        bed_configuration: string | null;
        description: string | null;
        view_type: string | null;
      }>) {
        if (Array.isArray(row.images)) {
          imageMap[row.name] = (row.images as string[]).filter((u) => typeof u === 'string')
        }
        metaMap[row.name] = {
          amenities: Array.isArray(row.amenities) ? (row.amenities as string[]) : [],
          max_occupancy: row.max_occupancy ?? null,
          room_size: row.room_size ?? null,
          bed_configuration: row.bed_configuration ?? null,
          description: row.description ?? null,
          view_type: row.view_type ?? null,
        }
      }
      setTypeImagesByName(imageMap)
      setTypeMetaByName(metaMap)
    } catch (err) {
      console.error('Error fetching custom_room_types:', err)
    }
  }

  useEffect(() => {
    const fetchAllData = async () => {
      await fetchRooms()
      await fetchHousekeepingData()
      await fetchTypeImages()
      loadCustomRoomTypes()
    }
    fetchAllData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

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


  const handleRoomCheckout = async (roomId: string, roomNumber: string) => {
    if (!confirm(`Confirm checkout for Room ${roomNumber}?`)) return false

    try {
      const { data: reservations, error: findError } = await supabase
        .from('reservations')
        .select('id')
        .eq('room_id', roomId)
        .in('status', ['confirmed', 'checked-in'])
        .limit(1)

      if (findError) throw findError

      if (reservations && reservations.length > 0) {
        const { error: updateError } = await supabase
          .from('reservations')
          .update({
            status: 'completed',
            actual_check_out: new Date().toISOString()
          })
          .eq('id', reservations[0].id)

        if (updateError) throw updateError
      }

      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'cleaning' })
        .eq('id', roomId)

      if (roomError) throw roomError

      console.log(`Room ${roomNumber} checked out successfully`)
      toast.success(`Room ${roomNumber} checked out`)
      await fetchRooms()
      await fetchHousekeepingData()
      return true
    } catch (err) {
      console.error('Error during checkout:', err)
      setError('Failed to checkout: ' + (err as Error).message)
      toast.error('Checkout failed', { description: (err as Error).message })
      return false
    }
  }

  const handleRoomCheckin = async (roomId: string, roomNumber: string) => {
    try {
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

      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'checked-in',
          actual_check_in: new Date().toISOString()
        })
        .eq('id', reservation.id)

      if (updateError) throw updateError

      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', roomId)

      if (roomError) throw roomError

      console.log(`Room ${roomNumber} checked in successfully`)
      toast.success(`Room ${roomNumber} checked in`)
      await fetchRooms()
      await fetchHousekeepingData()
      return true
    } catch (err) {
      console.error('Error during checkin:', err)
      setError('Failed to checkin: ' + (err as Error).message)
      toast.error('Check-in failed', { description: (err as Error).message })
      return false
    }
  }

  const handleRoomBooking = async (roomId: string, roomNumber: string, roomPrice: number) => {
    try {
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

      let guestId: number | null = null

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

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          room_id: roomId,
          guest_id: guestId,
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

  const handleMaintenanceComplete = async (roomId: string, roomNumber: string) => {
    if (!confirm(`Mark maintenance complete for Room ${roomNumber}?`)) return false

    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status: 'available' })
        .eq('id', roomId)

      if (error) throw error

      console.log(`Room ${roomNumber} maintenance completed`)
      toast.success(`Room ${roomNumber} marked as available`)
      await fetchRooms()
      await fetchHousekeepingData()
      return true
    } catch (err) {
      console.error('Error completing maintenance:', err)
      setError('Failed to complete maintenance: ' + (err as Error).message)
      toast.error('Failed to complete maintenance', { description: (err as Error).message })
      return false
    }
  }

  const handleAddRoom = () => {
    setCurrentRoom(null)
    setRoomNumber("")
    setRoomType("")
    setRoomPrice("")
    setRoomStatus("available")
    setRoomImageUrl("")
    setRoomImages([])
    setRoomAmenities([])
    setCustomAmenityInput("")
    setRoomBedConfig("")
    setIsAddingCustomType(false)
    setNewCustomType('')
    setError(null)
    setIsDialogOpen(true)
  }

  const handleEditRoom = (room: Room) => {
    setCurrentRoom(room)
    setRoomNumber(room.number)
    setRoomType(room.type)
    setRoomPrice((((Number(room.price) || Number(room.base_price) || 0) || room.base_price || 0) || room.base_price || 0).toString())
    setRoomStatus(room.status || "available")
    setRoomImageUrl(room.image_url || "")
    // Backward compat: kalau images[] kosong tapi image_url ada → migrasi seed dari kolom lama
    const existing = Array.isArray(room.images) ? room.images.filter(Boolean) : []
    setRoomImages(existing.length > 0 ? existing : (room.image_url ? [room.image_url] : []))
    // Amenities di-resolve dari custom_room_types berdasarkan tipe (shared across rooms of same type)
    const meta = typeMetaByName[room.type]
    setRoomAmenities(meta?.amenities && meta.amenities.length > 0 ? [...meta.amenities] : [])
    setCustomAmenityInput("")
    setRoomBedConfig(meta?.bed_configuration || "")
    setIsAddingCustomType(false)
    setNewCustomType('')
    setError(null)
    setIsDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be < 5MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('File format must be JPEG, PNG, or WebP')
      return
    }

    setImageUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (currentRoom?.id) formData.append('roomId', String(currentRoom.id))

      const res = await fetch('/api/rooms/upload-image', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setRoomImages((prev) => [...prev, data.url])
      // Backward compat: kalau ini foto pertama, isi juga image_url biar tampilan lama tetap jalan
      setRoomImageUrl((prev) => prev || data.url)
      toast.success('Image uploaded successfully')
    } catch (err) {
      setError('Failed to upload image: ' + (err as Error).message)
      toast.error('Failed to upload image', { description: (err as Error).message })
    } finally {
      setImageUploading(false)
      // Reset input so user bisa pilih file yang sama lagi kalau perlu
      e.target.value = ''
    }
  }

  const handleSaveRoom = async () => {
    setIsSaving(true)
    try {
      if (currentRoom) {
        const { data, error } = await supabase
          .from('rooms')
          .update({
            number: roomNumber,
            type: roomType,
            base_price: parseFloat(roomPrice),
            floor: roomNumber ? parseInt(roomNumber.charAt(0)) : null,
            status: roomStatus,
            image_url: roomImages[0] || roomImageUrl || null,
            images: roomImages,
          })
          .eq('id', currentRoom.id)
          .select()

        if (error) {
          console.error('Update room error:', error)
          throw error
        }

        console.log('Room updated:', data)
      } else {
        const { data, error } = await supabase
          .from('rooms')
          .insert({
            number: roomNumber,
            type: roomType,
            base_price: parseFloat(roomPrice),
            floor: roomNumber ? parseInt(roomNumber.charAt(0)) : null,
            status: roomStatus,
            image_url: roomImages[0] || roomImageUrl || null,
            images: roomImages,
          })
          .select()

        if (error) {
          console.error('Insert room error:', error)
          throw error
        }

        console.log('Room inserted:', data)
      }

      // Update amenities + bed_configuration di custom_room_types (shared per type)
      if (roomType) {
        const meta = typeMetaByName[roomType]
        const amenitiesChanged = JSON.stringify(meta?.amenities || []) !== JSON.stringify(roomAmenities)
        const bedChanged = (meta?.bed_configuration || "") !== roomBedConfig
        if (amenitiesChanged || bedChanged) {
          const { error: ctErr } = await supabase
            .from('custom_room_types')
            .update({
              amenities: roomAmenities,
              bed_configuration: roomBedConfig || null,
            })
            .eq('name', roomType)
          if (ctErr) console.error('Update custom_room_types error:', ctErr)
        }
      }

      await fetchRooms()
      await fetchTypeImages() // refresh typeMetaByName setelah save
      setIsDialogOpen(false)
      toast.success(currentRoom ? 'Room updated successfully' : 'Room added successfully')
    } catch (err) {
      console.error('Error saving room:', err)
      console.error('Error details:', {
        message: (err as Error).message,
        name: (err as Error).name,
        stack: (err as Error).stack
      })

      if ((err as Error).message?.includes('row-level security')) {
        setError('Permission denied: You do not have permission to modify rooms. Please check your user role.')
        toast.error('Permission denied', { description: 'You do not have permission to modify rooms.' })
      } else {
        setError('Failed to save room: ' + (err as Error).message)
        toast.error('Failed to save room', { description: (err as Error).message })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    setIsDeletingRoom(true)
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)

      if (error) {
        console.error('Delete room error:', error)
        if (error.message?.includes('row-level security')) {
          throw new Error('Permission denied: You do not have permission to delete rooms.')
        }
        throw error
      }

      toast.success('Room deleted successfully')
      await fetchRooms()
    } catch (err) {
      console.error('Error deleting room:', err)
      console.error('Error details:', {
        message: (err as Error).message,
        name: (err as Error).name,
        stack: (err as Error).stack
      })

      if ((err as Error).message?.includes('row-level security')) {
        setError('Permission denied: ' + (err as Error).message)
        toast.error('Permission denied', { description: (err as Error).message })
      } else {
        setError('Failed to delete room: ' + (err as Error).message)
        toast.error('Failed to delete room', { description: (err as Error).message })
      }
    } finally {
      setIsDeletingRoom(false)
    }
  }

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return
    await handleDeleteRoom(String(roomToDelete.id))
    setRoomToDelete(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const applyTaskFilters = useCallback(() => {
    let result = [...tasks]

    result = result.filter(task => task.status !== 'completed')

    if (taskStatusFilter !== 'all') {
      result = result.filter(task => task.status === taskStatusFilter)
    }

    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter)
    }

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

  const isTableMissingError = (error: any): boolean => {
    if (!error) return false

    return (
      error.message?.includes('relation') && error.message?.includes('does not exist') ||
      error.code === '42P01' ||
      error.code === 'PGRST102' ||
      Object.keys(error).length === 0 ||
      JSON.stringify(error) === '{}'
    )
  }

  const fetchHousekeepingData = async () => {
    try {
      setLoading(true)
      setError(null)

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
      console.info('Housekeeping data fetch completed with warnings. This is normal if housekeeping features are not yet configured.')
    } finally {
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
        toast.success('Daily tasks created', { description: result.message })
      } else {
        throw new Error(result.error || 'Failed to create daily tasks')
      }
    } catch (err) {
      console.error('Error creating daily tasks:', err)
      setError(`Failed to create daily tasks: ${(err as Error).message}`)
      toast.error('Failed to create daily tasks', { description: (err as Error).message })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCheckoutTask = async (roomId: string) => {
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
        toast.success('Checkout cleaning task created', { description: result.message })
      } else {
        throw new Error(result.error || 'Failed to create checkout cleaning task')
      }
    } catch (err) {
      console.error('Error creating checkout cleaning task:', err)
      setError(`Failed to create checkout cleaning task: ${(err as Error).message}`)
      toast.error('Failed to create checkout cleaning task', { description: (err as Error).message })
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
    setIsSavingTask(true)
    try {
      if (!taskRoomId) {
        setError('Please select a room')
        setIsSavingTask(false)
        return
      }

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
            title: taskType.charAt(0).toUpperCase() + taskType.slice(1) + ` - Room ${rooms.find(r => String(r.id) === String(taskRoomId))?.number}`,
            description: notes || `${taskType} task for room ${rooms.find(r => String(r.id) === String(taskRoomId))?.number}`,
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
            title: taskType.charAt(0).toUpperCase() + taskType.slice(1) + ` - Room ${rooms.find(r => String(r.id) === String(taskRoomId))?.number}`,
            description: notes || `${taskType} task for room ${rooms.find(r => String(r.id) === String(taskRoomId))?.number}`,
            notes,
            estimated_duration: estimatedDuration,
            created_by: 'manual'
          })

        if (error) throw error
      }

      await fetchHousekeepingData()
      setIsTaskDialogOpen(false)
      resetTaskForm()
      toast.success(editingTask ? 'Task updated successfully' : 'Task created successfully')
    } catch (err) {
      console.error('Error saving task:', err)
      const errorMessage = (err as Error)?.message || 'Unknown error'
      if (errorMessage.includes('relation "housekeeping_tasks" does not exist')) {
        setError('Housekeeping system not set up. Please set up the database first.')
        toast.error('Housekeeping system not set up', { description: 'Please set up the database first.' })
      } else {
        setError(`Failed to save task: ${errorMessage}`)
        toast.error('Failed to save task', { description: errorMessage })
      }
    } finally {
      setIsSavingTask(false)
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
      toast.success('Task deleted')
      await fetchHousekeepingData()
    } catch (err) {
      console.error('Error deleting task:', err)
      setError('Failed to delete task: ' + (err as Error).message)
      toast.error('Failed to delete task', { description: (err as Error).message })
    }
  }

  const handleMarkAsComplete = async (id: number) => {
    try {
      const { data: taskData, error: fetchError } = await supabase
        .from('housekeeping_tasks')
        .select('room_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const { error: updateTaskError } = await supabase
        .from('housekeeping_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateTaskError) throw updateTaskError

      if (taskData && taskData.room_id) {
        const { error: updateRoomError } = await supabase
          .from('rooms')
          .update({ status: 'available' })
          .eq('id', taskData.room_id)

        if (updateRoomError) throw updateRoomError
      }

      await fetchHousekeepingData()
      await fetchRooms()
      toast.success('Task marked as complete')

    } catch (err) {
      console.error('Error completing task:', err)
      setError('Failed to complete task: ' + (err as Error).message)
      toast.error('Failed to complete task', { description: (err as Error).message })
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

  useEffect(() => {
    applyTaskFilters()
  }, [applyTaskFilters])

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

          {/* Rooms Grid — auto-rows-fr memastikan semua row punya tinggi sama (max tinggi card) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {(() => {
              // Build per-type image fallback dari rooms lain: kalau Room 305 Presidential
              // belum punya foto, ambil dari kamar Presidential lain yang sudah ada foto.
              const firstImageByType: Record<string, string> = {}
              for (const r of rooms) {
                if (r.image_url && !firstImageByType[r.type]) {
                  firstImageByType[r.type] = r.image_url
                }
              }
              return filteredRooms.map((room) => {
              // Build gallery: room-level images > legacy image_url > type-level images > borrow from sibling
              const roomImgs = Array.isArray(room.images) ? room.images.filter((u): u is string => typeof u === 'string' && Boolean(u)) : []
              const typeImages = typeImagesByName[room.type] || []
              const galleryRaw = [...roomImgs, room.image_url || '', ...typeImages, firstImageByType[room.type] || ''].filter(Boolean) as string[]
              const gallery = Array.from(new Set(galleryRaw))
              const meta = typeMetaByName[room.type]
              const amenities = meta?.amenities && meta.amenities.length > 0 ? meta.amenities : []
              const statusKey = (room.status || "available") as "available"|"occupied"|"reserved"|"cleaning"|"maintenance"|"out-of-order"
              const statusLabel = room.status ? room.status.charAt(0).toUpperCase() + room.status.slice(1) : 'Available'

              return (
              <Card key={room.id} className="overflow-hidden h-full flex flex-col">
                {/* Mini carousel hero */}
                <DashboardRoomCarousel
                  gallery={gallery}
                  alt={`Room ${room.number}`}
                  statusBadge={
                    <Badge className={`absolute top-2 right-2 ${statusVariants[statusKey]}`}>
                      {statusLabel}
                    </Badge>
                  }
                />

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Room {room.number}
                    {room.floor && (
                      <span className="block text-xs text-muted-foreground">
                        Floor {room.floor}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="text-2xl font-bold">{room.type}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrencyCompat((((Number(room.price) || Number(room.base_price) || 0) || room.base_price || 0) || room.base_price || 0))} per night
                  </p>

                  {/* Bed config + description */}
                  {meta?.bed_configuration && (
                    <p className="text-xs text-muted-foreground mt-1.5">🛏 {meta.bed_configuration}</p>
                  )}
                  {meta?.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{meta.description}</p>
                  )}

                  {/* Amenities preview (max 5 chips + "+N more") */}
                  {amenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {amenities.slice(0, 5).map((a) => (
                        <span
                          key={a}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                        >
                          {a}
                        </span>
                      ))}
                      {amenities.length > 5 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                          +{amenities.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-3 text-sm text-muted-foreground">
                    <span className="font-medium">Status:</span> {statusLabel} (Auto-managed)
                  </div>

                  {/* Room Actions — pushed to bottom for consistent alignment across cards */}
                  <div className="flex mt-auto pt-4 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => { setViewRoom(room); setViewCarouselIndex(0) }}
                    >
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Detail
                    </Button>
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
                      onClick={() => setRoomToDelete(room)}
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
                        onClick={() => handleMaintenanceComplete(String(room.id), room.number)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          '✅ '
                        )}
                        Done Maintenance
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
              )
            })
            })()}
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
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
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
                    <Button onClick={handleSaveTask} disabled={isSavingTask}>
                      {isSavingTask ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingTask ? 'Update Task' : 'Create Task'
                      )}
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

            <div className="grid gap-3">
              <Label htmlFor="roomImage" className="text-sm font-medium">
                Room Photos <span className="text-xs text-muted-foreground font-normal">(upload multiple — swipe in gallery)</span>
              </Label>

              {roomImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {roomImages.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="relative aspect-square rounded-lg overflow-hidden border bg-muted group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-medium">
                          Main
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setRoomImages((prev) => prev.filter((_, i) => i !== idx))
                          if (idx === 0) setRoomImageUrl(roomImages[1] || "")
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove photo ${idx + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label
                htmlFor="roomImage"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                {imageUploading ? (
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                ) : (
                  <>
                    <Plus className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-sm text-muted-foreground">
                      {roomImages.length > 0 ? 'Add more photos' : 'Click to select photo'}
                    </span>
                    <span className="text-xs text-muted-foreground/70 mt-0.5">JPEG / PNG / WebP, max 5MB</span>
                  </>
                )}
              </label>
              <input
                id="roomImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={imageUploading}
                className="hidden"
              />
              {error && error.includes('image') && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Bed Configuration (per tipe) */}
            <div className="grid gap-2">
              <Label htmlFor="roomBed" className="text-sm font-medium">
                Bed Configuration{' '}
                <span className="text-xs text-muted-foreground font-normal">(per type — applies to all rooms of this type)</span>
              </Label>
              <Select value={roomBedConfig} onValueChange={setRoomBedConfig}>
                <SelectTrigger id="roomBed" className="h-10">
                  <SelectValue placeholder="Select bed type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="King Bed">King Bed</SelectItem>
                  <SelectItem value="Queen Bed">Queen Bed</SelectItem>
                  <SelectItem value="Twin Bed">Twin Bed (2 single)</SelectItem>
                  <SelectItem value="Double Bed">Double Bed</SelectItem>
                  <SelectItem value="Single Bed">Single Bed</SelectItem>
                  <SelectItem value="Bunk Bed">Bunk Bed (stacked)</SelectItem>
                  <SelectItem value="Sofa Bed">Sofa Bed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amenities (per tipe) */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">
                Amenities{' '}
                <span className="text-xs text-muted-foreground font-normal">(per type — applies to all rooms of this type)</span>
              </Label>
              {(() => {
                const COMMON_AMENITIES = [
                  'WiFi', 'AC', 'TV', 'Mini Bar', 'Hot Water', 'Hairdryer',
                  'Coffee Maker', 'Safety Box', 'Bathtub', 'Shower', 'Iron',
                  'Telephone', 'Refrigerator', 'Balcony', 'City View', 'Sea View',
                  'Mountain View', 'Breakfast', 'Pool Access', 'Gym Access',
                ];
                const toggle = (a: string) => {
                  setRoomAmenities((prev) =>
                    prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
                  );
                };
                const customs = roomAmenities.filter((a) => !COMMON_AMENITIES.includes(a));
                const addCustom = () => {
                  const v = customAmenityInput.trim();
                  if (!v) return;
                  if (!roomAmenities.includes(v)) setRoomAmenities((prev) => [...prev, v]);
                  setCustomAmenityInput("");
                };
                return (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_AMENITIES.map((a) => {
                        const selected = roomAmenities.includes(a);
                        return (
                          <button
                            key={a}
                            type="button"
                            onClick={() => toggle(a)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              selected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-background border-input hover:bg-muted'
                            }`}
                          >
                            {a}
                          </button>
                        );
                      })}
                    </div>

                    {customs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {customs.map((a) => (
                          <span
                            key={a}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                          >
                            {a}
                            <button
                              type="button"
                              onClick={() => toggle(a)}
                              className="ml-1 hover:text-red-600"
                              aria-label={`Remove ${a}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Input
                        value={customAmenityInput}
                        onChange={(e) => setCustomAmenityInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustom();
                          }
                        }}
                        placeholder="Custom amenity (e.g. Jacuzzi)"
                        className="h-9 text-sm"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addCustom}>
                        Add
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1 sm:flex-none"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRoom}
              className="flex-1 sm:flex-none"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                currentRoom ? "Update Room" : "Add Room"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Room Confirmation Dialog — double verification */}
      <Dialog open={!!roomToDelete} onOpenChange={(open) => !open && setRoomToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-center text-xl">
              Delete Room?
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              Are you sure you want to delete this room? This action cannot be undone and may affect related reservation data.
            </DialogDescription>
          </DialogHeader>

          {roomToDelete && (
            <div className="my-2 rounded-lg border bg-muted/50 p-4">
              <div className="grid gap-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Number:</span>
                  <span className="font-semibold">{roomToDelete.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-semibold">{roomToDelete.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-semibold">
                    {formatCurrencyCompat(Number(roomToDelete.price) || Number(roomToDelete.base_price) || 0)}/night
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold capitalize">{roomToDelete.status || 'available'}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setRoomToDelete(null)}
              className="flex-1"
              disabled={isDeletingRoom}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteRoom}
              className="flex-1"
              disabled={isDeletingRoom}
            >
              {isDeletingRoom ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Yes, Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Detail Viewer — carousel + amenities + specs (read-only) */}
      <Dialog open={!!viewRoom} onOpenChange={(open) => { if (!open) { setViewRoom(null); setViewCarouselIndex(0) } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{viewRoom ? `Room ${viewRoom.number} — ${viewRoom.type}` : ''}</DialogTitle>
            <DialogDescription>Full room details with photo gallery and amenities</DialogDescription>
          </DialogHeader>
          {viewRoom && (() => {
            const meta = typeMetaByName[viewRoom.type] || { amenities: [], max_occupancy: null, room_size: null, bed_configuration: null, description: null, view_type: null }
            const roomImgs = Array.isArray(viewRoom.images) ? viewRoom.images.filter(Boolean) : []
            const typeImgs = typeImagesByName[viewRoom.type] || []
            const gallery: string[] = Array.from(new Set([
              ...roomImgs,
              viewRoom.image_url || '',
              ...typeImgs,
            ].filter(Boolean) as string[]))
            const amenities = meta.amenities && meta.amenities.length > 0 ? meta.amenities : []
            const idx = Math.min(viewCarouselIndex, Math.max(0, gallery.length - 1))
            return (
              <>
                {/* Carousel */}
                <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {gallery.length > 0 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={idx}
                      src={gallery[idx]}
                      alt={`${viewRoom.type} ${viewRoom.number} - ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => gallery.length > 1 && setViewCarouselIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                    disabled={gallery.length <= 1}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-900 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => gallery.length > 1 && setViewCarouselIndex((i) => (i + 1) % gallery.length)}
                    disabled={gallery.length <= 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-900 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {gallery.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {gallery.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setViewCarouselIndex(i)}
                          className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/60'}`}
                          aria-label={`Go to image ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  <Badge className={`absolute top-3 right-3 ${statusVariants[(viewRoom.status || 'available') as keyof typeof statusVariants]}`}>
                    {(viewRoom.status || 'available').charAt(0).toUpperCase() + (viewRoom.status || 'available').slice(1)}
                  </Badge>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {viewRoom.type}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Room {viewRoom.number}
                        {viewRoom.floor != null && ` · Floor ${viewRoom.floor}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrencyCompat(Number(viewRoom.price) || Number(viewRoom.base_price) || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">per night</div>
                    </div>
                  </div>

                  {meta.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {meta.description}
                    </p>
                  )}

                  {/* Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="text-xs text-muted-foreground">Type</div>
                      <div className="text-sm font-medium">{viewRoom.type}</div>
                    </div>
                    {meta.max_occupancy && (
                      <div>
                        <div className="text-xs text-muted-foreground">Capacity</div>
                        <div className="text-sm font-medium">{meta.max_occupancy} guests</div>
                      </div>
                    )}
                    {meta.room_size && (
                      <div>
                        <div className="text-xs text-muted-foreground">Size</div>
                        <div className="text-sm font-medium">{meta.room_size} m²</div>
                      </div>
                    )}
                    {meta.bed_configuration && (
                      <div>
                        <div className="text-xs text-muted-foreground">Bed</div>
                        <div className="text-sm font-medium">{meta.bed_configuration}</div>
                      </div>
                    )}
                    {meta.view_type && (
                      <div>
                        <div className="text-xs text-muted-foreground">View</div>
                        <div className="text-sm font-medium">{meta.view_type}</div>
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Amenities {amenities.length === 0 && <span className="text-xs font-normal text-muted-foreground">(not configured in Room Type)</span>}
                    </h4>
                    {amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {amenities.map((a) => (
                          <span
                            key={a}
                            className="text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 px-2.5 py-1 rounded-full"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Configure amenities in Room Types admin to display hot water, hairdryer, WiFi, etc.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => { setViewRoom(null); setViewCarouselIndex(0) }}
                      className="flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        const r = viewRoom
                        setViewRoom(null)
                        setViewCarouselIndex(0)
                        if (r) handleEditRoom(r)
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Room
                    </Button>
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// Mini-carousel untuk hero image di dashboard card. Stateful local index.
function DashboardRoomCarousel({
  gallery,
  alt,
  statusBadge,
}: {
  gallery: string[]
  alt: string
  statusBadge: React.ReactNode
}) {
  const [idx, setIdx] = useState(0)
  const safeIdx = gallery.length === 0 ? 0 : idx % gallery.length

  if (gallery.length === 0) {
    return (
      <div className="relative w-full h-56 bg-muted flex items-center justify-center shrink-0">
        <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
        {statusBadge}
      </div>
    )
  }

  return (
    <div className="relative w-full h-56 bg-muted shrink-0 group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={safeIdx}
        src={gallery[safeIdx]}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-200"
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          gallery.length > 1 && setIdx((i) => (i - 1 + gallery.length) % gallery.length)
        }}
        disabled={gallery.length <= 1}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-900 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          gallery.length > 1 && setIdx((i) => (i + 1) % gallery.length)
        }}
        disabled={gallery.length <= 1}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-900 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next image"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      {gallery.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {gallery.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${i === safeIdx ? 'w-5 bg-white' : 'w-1 bg-white/60'}`}
            />
          ))}
        </div>
      )}
      {statusBadge}
    </div>
  )
}