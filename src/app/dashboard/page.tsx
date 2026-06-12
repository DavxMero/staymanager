import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard/DashboardClient"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Dashboard - StayManager",
  description: "StayManager Property Dashboard",
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  let isGuest = true
  let brandingName = "Harmoni Retreat"
  let userName = "Guest"

  if (user) {

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, role_type')
      .eq('id', user.id)
      .single()

    isGuest = profile?.role_type === 'guest'
    brandingName = isGuest ? "Harmoni Retreat" : "StayManager Dashboard"
    userName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest'
  }

  const [
    { data: rooms },
    { data: reservations },
    { data: facilityRequests },
    { data: staffRes }
  ] = await Promise.all([
    supabase.from('rooms').select('*').order('number', { ascending: true }),
    supabase.from('reservations')
      .select('*, guests(full_name), rooms(number)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('guest_facility_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('profiles').select('id, full_name, role')
  ])

  const safeRooms = rooms || []
  const safeReservations = reservations || []
  const safeFacilityRequests = facilityRequests || []
  const safeStaffRes = staffRes || []

  const staffCount = {
    total: safeStaffRes.length,
    active: Math.max(0, safeStaffRes.length - 2)
  }

  return (
    <DashboardClient
      initialRooms={safeRooms}
      initialReservations={safeReservations}
      initialFacilityRequests={safeFacilityRequests}
      initialStaffCount={staffCount}
      userName={userName}
      isGuest={isGuest}
      brandingName={brandingName}
    />
  )
}
