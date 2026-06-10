"use server"

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function adminFetchCalendarReservations(startDateStr: string, endDateStr: string) {
    const { data, error } = await supabaseAdmin
        .from('reservations')
        .select('id, room_id, guest_id, guest_name, guest_phone, guest_email, check_in, check_out, actual_check_in, actual_check_out, status, payment_status, total_amount, room_rate')
        .gte('check_out', startDateStr)
        .lte('check_in', endDateStr)
        .not('status', 'eq', 'cancelled')
        
    if (error) {
        console.error("Admin fetch calendar error:", error)
        return []
    }
    return data || []
}

export async function adminFetchGuestHistory(guestId: string, reservationId: string) {
    try {
        const { data: historyData } = await supabaseAdmin
            .from('reservations')
            .select('id, booking_id, room_number, room_type, check_in, check_out, actual_check_in, actual_check_out, total_amount, payment_status, status')
            .eq('guest_id', guestId)
            .order('check_in', { ascending: false })
            .limit(10)

        const { data: paymentsData } = await supabaseAdmin
            .from('payments')
            .select('amount, payment_method, payment_date, status, transaction_id')
            .eq('reservation_id', reservationId)
            .order('payment_date', { ascending: true })

        const { data: billingData } = await supabaseAdmin
            .from('billing_items')
            .select('item_name, category, quantity, unit_price, total_price, service_date, status')
            .eq('reservation_id', reservationId)
            
        return {
            history: historyData || [],
            payments: paymentsData || [],
            billingItems: billingData || []
        }
    } catch (e) {
        console.error("Admin fetch history error:", e)
        return { history: [], payments: [], billingItems: [] }
    }
}

export async function adminFetchActiveReservations() {
    const { data, error } = await supabaseAdmin
        .from('reservations')
        .select('room_id, status')
        .in('status', ['confirmed', 'checked-in'])
        
    if (error) {
        console.error("Admin fetch active reservations error:", error)
        return []
    }
    return data || []
}

export async function adminFetchCheckoutData(roomId: string | number) {
    try {
        const { data, error: reservationError } = await supabaseAdmin
            .from('reservations')
            .select('*')
            .eq('room_id', roomId)
            .in('status', ['checked-in', 'overdue', 'checked-out'])
            .order('created_at', { ascending: false })

        if (reservationError) throw reservationError
        
        // Prioritize active reservations: checked-in > overdue > checked-out
        const statusPriority: Record<string, number> = { 'checked-in': 0, 'overdue': 1, 'checked-out': 2 }
        const sorted = (data || []).sort((a: any, b: any) => (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99))
        const reservationData = sorted[0];
        if (!reservationData) {
            throw new Error('No active reservation found for this room')
        }

        const { data: billingData, error: billingError } = await supabaseAdmin
            .from('billing_items')
            .select('*')
            .eq('reservation_id', reservationData.id)
            .eq('status', 'pending')
            .order('service_date', { ascending: false })

        if (billingError) {
            console.error('Error fetching billing items:', billingError)
        }

        return {
            reservation: reservationData,
            unpaidBills: billingData || []
        }
    } catch (e) {
        console.error("Admin fetch checkout data error:", e)
        throw e;
    }
}

export async function adminFetchCheckinReservations(roomId: string | number) {
    try {
        const { data, error } = await supabaseAdmin
            .from('reservations')
            .select('*')
            .eq('room_id', roomId)
            .eq('status', 'confirmed')
            .order('check_in', { ascending: true })

        if (error) throw error
        return data || []
    } catch (e) {
        console.error("Admin fetch checkin reservations error:", e)
        throw e;
    }
}

export async function adminFetchCancelledReservations(roomId: string | number) {
    const { data, error } = await supabaseAdmin
        .from('reservations')
        .select('*')
        .eq('room_id', roomId)
        .eq('status', 'cancelled')
        .order('check_in', { ascending: true })
        .limit(5)

    if (error) {
        console.error("Admin fetch cancelled reservations error:", error)
        return []
    }
    return data || []
}

export async function adminFetchHousekeepingStaff() {
    try {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, role, department')
            .or('role.ilike.%housekeeping%,department.ilike.%housekeeping%,role.ilike.%cleaning%,role.ilike.%housekeeper%')

        if (error) {
            console.error("Admin fetch housekeeping staff error:", error)
            return []
        }
        return data || []
    } catch (e) {
        console.error("Admin fetch housekeeping staff error:", e)
        return []
    }
}
