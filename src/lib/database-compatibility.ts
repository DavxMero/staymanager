// Database Compatibility Layer
// Maps new database schema to existing application interfaces

import { Room, Guest, Reservation } from '@/types'

/**
 * Maps database room data to application Room interface
 * Handles field name changes from old to new schema
 */
export function mapDatabaseRoom(dbRoom: any): Room {
  return {
    ...dbRoom,
    // Map base_price to price for backward compatibility
    price: dbRoom.base_price || dbRoom.price || 0,
    // Ensure status includes new values
    status: dbRoom.status || 'available',
    // Handle array fields
    amenities: dbRoom.amenities || [],
    accessibility_features: dbRoom.accessibility_features || [],
    house_rules: dbRoom.house_rules || [],
    images: Array.isArray(dbRoom.images) ? dbRoom.images : [],
  }
}

/**
 * Maps database guest data to application Guest interface
 */
export function mapDatabaseGuest(dbGuest: any): Guest {
  return {
    ...dbGuest,
    // Handle optional fields
    email: dbGuest.email || undefined,
    phone: dbGuest.phone || undefined,
    preferences: dbGuest.preferences ? JSON.stringify(dbGuest.preferences) : undefined,
    stay_history: dbGuest.stay_history || undefined,
  }
}

/**
 * Maps database reservation data to application Reservation interface
 * Handles field name changes (check_in_date -> check_in, etc.)
 */
export function mapDatabaseReservation(dbReservation: any): Reservation {
  return {
    ...dbReservation,
    // Map new field names to old interface
    check_in: dbReservation.check_in_date || dbReservation.check_in,
    check_out: dbReservation.check_out_date || dbReservation.check_out,
    guests_count: dbReservation.total_guests || dbReservation.guests_count || 1,
    // Handle status mapping
    status: mapReservationStatus(dbReservation.status),
    // Use total_amount
    total_amount: dbReservation.total_amount || 0,
  }
}

/**
 * Maps new reservation status values to old interface
 */
function mapReservationStatus(status: string): 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' {
  switch (status) {
    case 'completed':
      return 'checked-out'
    case 'no-show':
      return 'cancelled'
    default:
      return status as any
  }
}

/**
 * Helper to transform database results for rooms query
 */
export function transformRoomsQuery(rooms: any[]): Room[] {
  return rooms.map(mapDatabaseRoom)
}

/**
 * Helper to transform database results for guests query
 */
export function transformGuestsQuery(guests: any[]): Guest[] {
  return guests.map(mapDatabaseGuest)
}

/**
 * Helper to transform database results for reservations query
 */
export function transformReservationsQuery(reservations: any[]): Reservation[] {
  return reservations.map(mapDatabaseReservation)
}

/**
 * Format currency for Indonesian Rupiah
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rp 0'
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Safe number conversion - prevents NaN
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

/**
 * Get room price based on date and room type
 * Implements pricing logic for base_price, weekend_price, holiday_price
 */
export function getRoomPrice(room: any, date?: Date): number {
  if (!room) return 0
  
  const basePrice = safeNumber(room.base_price || room.price)
  
  if (!date) return basePrice
  
  // Check if weekend (Saturday = 6, Sunday = 0)
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  
  // TODO: Implement holiday checking logic based on your needs
  const isHoliday = false
  
  if (isHoliday && room.holiday_price) {
    return safeNumber(room.holiday_price, basePrice)
  }
  
  if (isWeekend && room.weekend_price) {
    return safeNumber(room.weekend_price, basePrice)
  }
  
  return basePrice
}