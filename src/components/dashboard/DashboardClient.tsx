'use client'

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import {
  CalendarCheck,
  Users,
  BedDouble,
  ChevronRight,
  ChefHat,
  Wrench,
  Sparkles,
  Utensils,
  ConciergeBell,
  ClipboardList,
  Clock,
  ClipboardCheck,
  X,
  ExternalLink,
  Zap,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Room, Reservation, GuestFacilityRequest } from "@/types"
import { formatCurrency } from "@/lib/utils"

function OccupancyRing({ percentage }: { percentage: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-[130px] h-[130px] flex items-center justify-center flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          className="stroke-white/20"
          strokeWidth="10"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          className="stroke-white"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-manrope)' }}>
          {percentage}%
        </span>
      </div>
    </div>
  )
}

interface DashboardClientProps {
  initialRooms: Room[]
  initialReservations: Reservation[]
  initialFacilityRequests: GuestFacilityRequest[]
  initialStaffCount: { total: number; active: number }
  userName: string
  isGuest: boolean
  brandingName: string
}

export function DashboardClient({
  initialRooms,
  initialReservations,
  initialFacilityRequests,
  initialStaffCount,
  userName,
  isGuest,
  brandingName
}: DashboardClientProps) {
  const supabase = createClient()
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [facilityRequests, setFacilityRequests] = useState<GuestFacilityRequest[]>(initialFacilityRequests)
  const [staffCount] = useState(initialStaffCount)

  // Thesis survey banner state — REMOVE AFTER DATA COLLECTION COMPLETE
  const [surveyBannerVisible, setSurveyBannerVisible] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = window.localStorage.getItem('staymanager:thesis-survey-dismissed')
    if (!dismissed) setSurveyBannerVisible(true)
  }, [])
  const dismissSurveyBanner = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('staymanager:thesis-survey-dismissed', '1')
    }
    setSurveyBannerVisible(false)
  }

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "MORNING"
    if (hour < 17) return "AFTERNOON"
    return "EVENING"
  }, [])

  useEffect(() => {
    // Burst event (mis. check-in = beberapa mutasi beruntun) di-debounce
    // supaya hanya satu refetch per tabel, bukan satu per event
    const timers: Record<string, ReturnType<typeof setTimeout> | null> = {
      reservations: null,
      facilities: null,
    }
    const debounced = (key: 'reservations' | 'facilities', fn: () => void) => {
      const t = timers[key]
      if (t) clearTimeout(t)
      timers[key] = setTimeout(() => { timers[key] = null; fn() }, 400)
    }

    // Satu channel (satu websocket join) untuk ketiga tabel
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
        // More efficient update: do not refetch all rooms, just update the payload
        if (payload.eventType === 'UPDATE') {
          setRooms(prev => prev.map(r => r.id === payload.new.id ? payload.new as Room : r))
        } else if (payload.eventType === 'INSERT') {
          setRooms(prev => [...prev, payload.new as Room])
        } else if (payload.eventType === 'DELETE') {
          setRooms(prev => prev.filter(r => r.id !== payload.old.id))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        debounced('reservations', () => {
          supabase.from('reservations').select('*, guests(full_name), rooms(number)').order('created_at', { ascending: false }).limit(10).then(({ data }) => {
            if (data) setReservations(data as Reservation[])
          })
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_facility_requests' }, () => {
        debounced('facilities', () => {
          supabase.from('guest_facility_requests').select('*').order('created_at', { ascending: false }).limit(10).then(({ data }) => {
            if (data) setFacilityRequests(data as GuestFacilityRequest[])
          })
        })
      })
      .subscribe()

    return () => {
      Object.values(timers).forEach(t => { if (t) clearTimeout(t) })
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const { totalRooms, occupiedRooms, availableRooms, maintenanceRooms, cleaningRooms } = useMemo(() => {
    const counts = { totalRooms: rooms.length, occupiedRooms: 0, availableRooms: 0, maintenanceRooms: 0, cleaningRooms: 0 }
    for (const r of rooms) {
      if (r.status === 'occupied' || r.status === 'reserved') counts.occupiedRooms++
      else if (r.status === 'available') counts.availableRooms++
      else if (r.status === 'maintenance') counts.maintenanceRooms++
      if (r.status === 'cleaning') counts.cleaningRooms++
    }
    return counts
  }, [rooms])
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  const derivedRoomTypes = useMemo(() => {
    const typeMap = new Map<string, { name: string; rooms: any[]; totalPrice: number; image: string; description: string; amenities: string[]; maxOccupancy: number }>()
    rooms.forEach((room: any) => {
      const typeName = room.type || 'Standard'
      if (!typeMap.has(typeName)) {
        typeMap.set(typeName, {
          name: typeName,
          rooms: [],
          totalPrice: 0,
          image: '',
          description: room.description || `Experience comfortable stay in our ${typeName} room with premium facilities designed for your ultimate relaxation.`,
          amenities: room.amenities || ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar'],
          maxOccupancy: room.max_occupancy || 2
        })
      }
      const entry = typeMap.get(typeName)!
      entry.rooms.push(room)
      entry.totalPrice += room.base_price || 0
      if (!entry.image && room.image_url) entry.image = room.image_url
    })

    return Array.from(typeMap.values()).map(entry => ({
      name: entry.name,
      avgPrice: entry.rooms.length > 0 ? Math.round(entry.totalPrice / entry.rooms.length) : 0,
      roomCount: entry.rooms.length,
      image: entry.image,
      availableCount: entry.rooms.filter((r: any) => r.status === 'available').length,
      description: entry.description,
      amenities: entry.amenities,
      maxOccupancy: entry.maxOccupancy
    }))
  }, [rooms])

  const todayCheckins = reservations.filter(r => {
    const checkIn = new Date(r.check_in)
    const today = new Date()
    return checkIn.toDateString() === today.toDateString() && (r.status === 'confirmed' || r.status === 'checked-in')
  }).length

  const housekeepingStatus = cleaningRooms > 3 ? 'Busy' : 'On Track'
  const maintenanceStatus = maintenanceRooms > 2 ? 'Busy' : maintenanceRooms > 0 ? 'Active' : 'On Track'

  const recentActivities = useMemo(() => {
    const activities: { id: string; icon: React.ReactNode; title: string; time: string; timestamp: Date }[] = []

    reservations.slice(0, 3).forEach(res => {
      const guestName = (res.guests as { full_name?: string })?.full_name || 'Guest'
      const roomNum = (res.rooms as { number?: string })?.number || '—'
      const timeAgo = getTimeAgo(res.created_at || '')
      const timestamp = new Date(res.created_at || '')

      if (res.status === 'checked-in') {
        activities.push({
          id: `res-${res.id}`,
          icon: <BedDouble className="h-4 w-4" />,
          title: `Room ${roomNum} Checked-in – ${guestName}`,
          time: timeAgo,
          timestamp
        })
      } else if (res.status === 'confirmed') {
        activities.push({
          id: `res-${res.id}`,
          icon: <CalendarCheck className="h-4 w-4" />,
          title: `Reservation confirmed – ${guestName}`,
          time: timeAgo,
          timestamp
        })
      }
    })

    facilityRequests.slice(0, 3).forEach(req => {
      const roomNum = (req.rooms as { number?: string })?.number || req.room_id || '—'
      const timeAgo = getTimeAgo(req.created_at || '')
      const timestamp = new Date(req.created_at || '')

      if (req.service_type === 'food-order') {
        activities.push({
          id: `fac-${req.id}`,
          icon: <Utensils className="h-4 w-4" />,
          title: `Food order – Room ${roomNum}`,
          time: timeAgo,
          timestamp
        })
      } else {
        activities.push({
          id: `fac-${req.id}`,
          icon: <ConciergeBell className="h-4 w-4" />,
          title: `${req.service_type.replace(/-/g, ' ')} request – Room ${roomNum}`,
          time: timeAgo,
          timestamp
        })
      }
    })

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    return activities.slice(0, 4)
  }, [reservations, facilityRequests])

  const fallbackActivities = [
    { id: 'fb-1', icon: <BedDouble className="h-4 w-4" />, title: 'No recent activity', time: 'just now' },
  ]

  const displayActivities = recentActivities.length > 0 ? recentActivities : fallbackActivities

  const operationalItems = [
    {
      label: "Housekeeping",
      status: housekeepingStatus,
      statusColor: housekeepingStatus === 'On Track'
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
      icon: <Sparkles className="h-4 w-4 text-foreground/60" />,
    },
    {
      label: "Kitchen Capacity",
      status: occupiedRooms > totalRooms * 0.7 ? 'Busy' : 'Normal',
      statusColor: occupiedRooms > totalRooms * 0.7
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
      icon: <ChefHat className="h-4 w-4 text-foreground/60" />,
    },
    {
      label: "Maintenance",
      status: maintenanceStatus,
      statusColor: maintenanceStatus === 'Busy'
        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
        : maintenanceStatus === 'Active'
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      icon: <Wrench className="h-4 w-4 text-foreground/60" />,
    },
  ]

  const propertyHighlights = [
    { title: "Spa & Wellness", description: "Spa treatments to rejuvenate and revive your senses with premium services.", image: "/images/dashboard/spa-wellness.webp" },
    { title: "Fine Dining", description: "Gourmet dishes are prepared with a great attention to detail and quality.", image: "/images/dashboard/fine-dining.webp" },
    { title: "Concierge Services", description: "Concierge Services include accompanying guests and personalized assistance.", image: "/images/dashboard/concierge-services.webp" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } }
  }

  return (
    <div
      className="min-h-screen -m-4 p-6 bg-[#f7f9fc] dark:bg-[#111318]"
      style={{ fontFamily: 'var(--font-plus-jakarta), var(--font-geist-sans), sans-serif' }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1400px] mx-auto space-y-6"
      >
        {/* Hero Banner */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '280px' }}>
            <Image
              src="/images/dashboard/hero-banner.webp"
              alt="Hotel Resort"
              fill
              sizes="(max-width: 768px) 100vw, 1400px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#002f6f]/75 via-[#1A468F]/55 to-[#002f6f]/30" />
            <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center" style={{ minHeight: '280px' }}>
              <p
                className="text-white/85 text-xs font-semibold tracking-[0.2em] mb-2"
                style={{ fontFamily: 'var(--font-plus-jakarta)' }}
              >
                {greeting}, {userName || 'GUEST'}
              </p>
              <h1
                className="text-white text-3xl md:text-5xl font-bold mb-4 leading-tight"
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                Welcome to {brandingName}
              </h1>
              <p
                className="text-white/85 text-sm md:text-base max-w-lg mb-6"
                style={{ fontFamily: 'var(--font-plus-jakarta)' }}
              >
                Your property is currently at <strong>{occupancyRate}%</strong> occupancy.{' '}
                <strong>{todayCheckins}</strong> guests are scheduled for check-in today.
              </p>
              {!isGuest && (
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="rounded-full px-6 py-5 text-sm font-semibold shadow-lg bg-[#FFB400] hover:bg-[#E5A200] text-[#002f6f]"
                    style={{ fontFamily: 'var(--font-plus-jakarta)' }}
                  >
                    <Link href="/occupancy?quickAction=checkin">
                      <Zap className="mr-2 h-4 w-4" />
                      Check-in Cepat
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="rounded-full px-6 py-5 text-sm font-semibold shadow-lg bg-[#002f6f] hover:bg-[#001d47] text-white"
                    style={{ fontFamily: 'var(--font-plus-jakarta)' }}
                  >
                    <Link href="/reports">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      View Daily Briefing
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Thesis Survey Banner — REMOVE AFTER DATA COLLECTION COMPLETE */}
        {surveyBannerVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative rounded-2xl border border-[#1A468F]/15 dark:border-[#afc6ff]/15 bg-[#d8e2ff]/40 dark:bg-[#1A468F]/15 p-5 md:p-6"
          >
            <button
              type="button"
              onClick={dismissSurveyBanner}
              aria-label="Tutup banner"
              className="absolute top-3 right-3 p-1.5 rounded-lg text-[#1A468F] dark:text-[#afc6ff] hover:bg-[#d8e2ff] dark:hover:bg-[#1A468F]/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col md:flex-row md:items-center gap-4 pr-8">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#d8e2ff] dark:bg-[#1A468F]/30 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-[#1A468F] dark:text-[#afc6ff]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-base md:text-lg font-bold text-[#002f6f] dark:text-white mb-1"
                  style={{ fontFamily: 'var(--font-manrope)' }}
                >
                  Bantu Penelitian Skripsi StayManager
                </h3>
                <p
                  className="text-sm text-[#1A468F] dark:text-[#afc6ff]/90"
                  style={{ fontFamily: 'var(--font-plus-jakarta)' }}
                >
                  Isi kuesioner singkat (5 menit) untuk evaluasi sistem. Feedback Anda sangat berarti untuk perbaikan StayManager.
                </p>
              </div>
              <Button
                asChild
                className="flex-shrink-0 rounded-full px-5 py-5 text-sm font-semibold shadow-sm bg-[#002f6f] hover:bg-[#001d47] text-white"
                style={{ fontFamily: 'var(--font-plus-jakarta)' }}
              >
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSezJ-8p5Xux47lfWOiifdcQTzIIuk6rs0-ZJVfpx7FLPnl54A/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Isi Kuesioner
                  <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-70" />
                </a>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Check Availability */}
              <motion.div variants={itemVariants} className="h-full">
                <Link href={isGuest ? "/chatbot" : "/rooms"} className="block h-full">
                  <div className="p-6 h-full rounded-2xl bg-white dark:bg-[#1c1f26] shadow-[0_2px_12px_rgba(0,47,111,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:shadow-lg transition-all duration-300 cursor-pointer group" style={{ minHeight: '160px' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-[10px] bg-[#d8e2ff] dark:bg-[#1A468F]/30">
                        <CalendarCheck className="h-5 w-5 text-[#1A468F] dark:text-[#afc6ff]" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-[#1A468F] dark:group-hover:text-[#afc6ff] transition-colors" />
                    </div>
                    <h3
                      className="text-lg font-bold mb-1 text-foreground"
                      style={{ fontFamily: 'var(--font-manrope)' }}
                    >
                      Check Availability
                    </h3>
                    <p
                      className="text-sm text-muted-foreground"
                      style={{ fontFamily: 'var(--font-plus-jakarta)' }}
                    >
                      Instant real-time room status and seasonal pricing
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {availableRooms} rooms available
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* View Occupancy */}
              <motion.div variants={itemVariants} className="h-full">
                <Link href={isGuest ? "/chatbot" : "/occupancy"} className="block h-full">
                  <div
                    className="p-6 h-full rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #1A468F 0%, #002f6f 100%)',
                      minHeight: '160px',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 pt-2">
                        <h3
                          className="text-lg font-bold text-white mb-1"
                          style={{ fontFamily: 'var(--font-manrope)' }}
                        >
                          View Occupancy
                        </h3>
                        <p className="text-sm text-white/80 mb-3" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                          {occupiedRooms} of {totalRooms} rooms occupied
                        </p>
                        <span className="text-xs text-white/65" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                          {cleaningRooms > 0 && `${cleaningRooms} cleaning`}
                          {cleaningRooms > 0 && maintenanceRooms > 0 && ' · '}
                          {maintenanceRooms > 0 && `${maintenanceRooms} maintenance`}
                        </span>
                      </div>
                      <OccupancyRing percentage={occupancyRate} />
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Daily Property Highlights */}
            <motion.div variants={itemVariants}>
              <h2
                className="text-xl font-bold mb-4 text-foreground"
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                Daily Property Highlights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {propertyHighlights.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="group cursor-pointer"
                  >
                    <div className="overflow-hidden rounded-xl shadow-[0_2px_12px_rgba(0,47,111,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] h-full flex flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 bg-white dark:bg-[#1c1f26] flex-1">
                        <h4
                          className="font-bold text-sm mb-1 text-foreground"
                          style={{ fontFamily: 'var(--font-manrope)' }}
                        >
                          {item.title}
                        </h4>
                        <p
                          className="text-xs leading-relaxed line-clamp-2 text-muted-foreground"
                          style={{ fontFamily: 'var(--font-plus-jakarta)' }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Recent Guest Activities */}
            <motion.div variants={itemVariants}>
              <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1f26] shadow-[0_2px_12px_rgba(0,47,111,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between mb-5">
                  <h3
                    className="font-bold text-base text-foreground"
                    style={{ fontFamily: 'var(--font-manrope)' }}
                  >
                    Recent Guest Activities
                  </h3>
                  <Link
                    href={isGuest ? "/chatbot" : "/guests"}
                    className="text-xs font-medium hover:underline text-[#1A468F] dark:text-[#afc6ff]"
                    style={{ fontFamily: 'var(--font-plus-jakarta)' }}
                  >
                    See All
                  </Link>
                </div>
                <div className="space-y-4">
                  {displayActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-0.5 rounded-lg bg-[#f2f4f7] dark:bg-[#2a2d35]">
                        <span className="text-[#1A468F] dark:text-[#afc6ff]">{activity.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate text-foreground"
                          style={{ fontFamily: 'var(--font-plus-jakarta)' }}
                        >
                          {activity.title}
                        </p>
                        <p
                          className="text-xs flex items-center gap-1 text-muted-foreground"
                          style={{ fontFamily: 'var(--font-plus-jakarta)' }}
                        >
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Operational Status */}
            <motion.div variants={itemVariants} className="flex-1 flex">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1f26] shadow-[0_2px_12px_rgba(0,47,111,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] flex-1 flex flex-col justify-center">
                <h3
                  className="font-bold text-base mb-5 text-foreground"
                  style={{ fontFamily: 'var(--font-manrope)' }}
                >
                  Operational Status
                </h3>
                <div className="space-y-4">
                  {operationalItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f2f4f7] dark:bg-[#2a2d35]">
                          {item.icon}
                        </div>
                        <span
                          className="text-sm font-medium text-foreground"
                          style={{ fontFamily: 'var(--font-plus-jakarta)' }}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Staff Shifts */}
                <div className="mt-5 pt-5 flex items-center justify-between border-t border-[#f2f4f7] dark:border-[#2a2d35]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f2f4f7] dark:bg-[#2a2d35]">
                      <Users className="h-4 w-4 text-foreground/60" />
                    </div>
                    <span
                      className="text-sm font-medium text-foreground"
                      style={{ fontFamily: 'var(--font-plus-jakarta)' }}
                    >
                      Staff Shifts
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e0e3e6] text-[#434751] dark:bg-[#2a2d35] dark:text-[#c3c6d3]">
                    {staffCount.total > 0 ? `${staffCount.active} / ${staffCount.total} Active` : 'No Staff'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Featured Room Types */}
        {derivedRoomTypes.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-xl font-bold text-foreground tracking-tight"
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                Featured Room Types
              </h2>
              {!isGuest && (
                <Link
                  href="/rooms"
                  className="text-sm font-medium hover:text-[#1A468F] dark:hover:text-[#afc6ff] text-foreground/70 transition-colors flex items-center gap-1"
                  style={{ fontFamily: 'var(--font-plus-jakarta)' }}
                >
                  Manage Rooms <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {derivedRoomTypes.map((rt) => {
                const roomImage = rt.image || '/images/dashboard/hero-banner.webp'
                return (
                  <div
                    key={rt.name}
                    className="group h-full"
                  >
                    <div className="flex flex-col w-full h-full rounded-[20px] overflow-hidden bg-white dark:bg-[#15171c] border border-gray-200/80 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,47,111,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.15)] transition-all duration-500 ease-out relative">
                      {/* Image Area */}
                      <div className="relative h-[220px] overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {rt.image ? (
                          <Image
                            src={roomImage}
                            alt={rt.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-[0.25,1,0.5,1]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BedDouble className="h-10 w-10 text-foreground/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-t-[20px] z-10 pointer-events-none" />
                      </div>

                      {/* Content Area */}
                      <div className="p-6 flex flex-col flex-grow">
                        <h3
                          className="font-bold text-[1.15rem] leading-tight text-foreground mb-1"
                          style={{ fontFamily: 'var(--font-manrope)' }}
                        >
                          {rt.name}
                        </h3>

                        <p className="text-[13px] text-foreground/60 mb-7 font-medium tracking-wide flex items-center gap-1.5" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                          IDR {formatCurrency(rt.avgPrice).replace('Rp', '').trim()} <span className="opacity-60 font-normal">/ night</span>
                        </p>

                        <div className="mt-auto">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                className="w-full h-auto rounded-full py-[14px] text-[13px] font-semibold transition-all duration-300 bg-white dark:bg-[#1c1f26] border border-gray-200/80 dark:border-white/10 text-foreground shadow-sm hover:shadow-md hover:border-[#1A468F]/30 dark:hover:border-[#afc6ff]/30 hover:bg-gray-50 dark:hover:bg-[#252830] group/btn"
                                variant="ghost"
                                style={{
                                  fontFamily: 'var(--font-plus-jakarta)'
                                }}
                              >
                                <span className="relative z-10 transition-colors duration-300 group-hover/btn:text-[#1A468F] dark:group-hover/btn:text-[#afc6ff]">View Details</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white dark:bg-[#15171c] border-x-0 sm:border-x sm:rounded-[24px]">
                              <DialogHeader className="sr-only">
                                <DialogTitle>{rt.name} Details</DialogTitle>
                                <DialogDescription>Details and booking for {rt.name}</DialogDescription>
                              </DialogHeader>
                              <div className="relative h-[300px] w-full bg-gray-100 dark:bg-gray-800">
                                {rt.image ? (
                                  <Image
                                    src={roomImage}
                                    alt={rt.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 700px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <BedDouble className="h-16 w-16 text-foreground/10" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                <div className="absolute bottom-6 left-6 right-6 text-white flex justify-between items-end">
                                  <div>
                                    <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                                      {rt.name}
                                    </h2>
                                    <p className="text-white/80 text-sm flex items-center gap-2" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                                      <Users className="w-4 h-4" /> Max {rt.maxOccupancy} Guests
                                      <span className="hidden sm:inline"> • {rt.availableCount} Rooms Available</span>
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-white/75 uppercase tracking-wider mb-0.5" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>Starting from</p>
                                    <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>IDR {formatCurrency(rt.avgPrice).replace('Rp', '').trim()}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="p-6">
                                <div className="mb-6">
                                  <h4 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>Room Description</h4>
                                  <p className="text-foreground/90 leading-relaxed text-sm" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                                    {rt.description}
                                  </p>
                                </div>

                                <div className="mb-8">
                                  <h4 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-3" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>Amenities & Features</h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    {rt.amenities.map((amenity: string, idx: number) => (
                                      <div key={idx} className="flex items-center gap-2 text-sm text-foreground/80 bg-[#f7f9fc] dark:bg-[#1c1f26] px-3 py-2.5 rounded-xl border border-gray-100 dark:border-white/5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1A468F] dark:bg-[#afc6ff]" />
                                        {amenity}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex gap-3">
                                  <Link href={isGuest ? '/chatbot' : '/rooms'} className="flex-1">
                                    <Button className="w-full h-auto rounded-full py-[16px] bg-[#1A468F] hover:bg-[#002f6f] text-white font-semibold transition-colors" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                                      {isGuest ? 'Ask Chatbot to Book' : 'Manage Rooms'}
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

function getTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}
