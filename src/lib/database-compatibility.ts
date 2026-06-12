import { Room, Guest, Reservation } from '@/types'


export function mapDatabaseRoom(dbRoom: any): Room {
  return {
    ...dbRoom,
    price: dbRoom.base_price || dbRoom.price || 0,
    status: dbRoom.status || 'available',
    amenities: dbRoom.amenities || [],
    accessibility_features: dbRoom.accessibility_features || [],
    house_rules: dbRoom.house_rules || [],
    images: Array.isArray(dbRoom.images) ? dbRoom.images : [],
  }
}


export function mapDatabaseGuest(dbGuest: any): Guest {
  return {
    ...dbGuest,
    email: dbGuest.email || undefined,
    phone: dbGuest.phone || undefined,
    preferences: dbGuest.preferences ? JSON.stringify(dbGuest.preferences) : undefined,
    stay_history: dbGuest.stay_history || undefined,
  }
}


export function mapDatabaseReservation(dbReservation: any): Reservation {
  return {
    ...dbReservation,
    check_in: dbReservation.check_in_date || dbReservation.check_in,
    check_out: dbReservation.check_out_date || dbReservation.check_out,
    guests_count: dbReservation.total_guests || dbReservation.guests_count || 1,
    status: mapReservationStatus(dbReservation.status),
    total_amount: dbReservation.total_amount || 0,
  }
}


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


export function transformRoomsQuery(rooms: any[]): Room[] {
  return rooms.map(mapDatabaseRoom)
}


export function transformGuestsQuery(guests: any[]): Guest[] {
  return guests.map(mapDatabaseGuest)
}


export function transformReservationsQuery(reservations: any[]): Reservation[] {
  return reservations.map(mapDatabaseReservation)
}


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


export function safeNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}


export function getRoomPrice(room: any, date?: Date): number {
  if (!room) return 0

  const basePrice = safeNumber(room.base_price || room.price)

  if (!date) return basePrice

  const isWeekend = date.getDay() === 0 || date.getDay() === 6

  const isHoliday = false

  if (isHoliday && room.holiday_price) {
    return safeNumber(room.holiday_price, basePrice)
  }

  if (isWeekend && room.weekend_price) {
    return safeNumber(room.weekend_price, basePrice)
  }

  return basePrice
}
