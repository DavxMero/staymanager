import { supabase } from '@/lib/supabaseClient';

interface Room {
  id: number;
  number: string;
  type: string;
  status: string;
  price: number;
  floor?: number;
}

interface Guest {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

interface Reservation {
  id: number;
  guest_id: number;
  room_id: number;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  status: string;
  total_amount: number;
  rooms?: {
    number: string;
    type: string;
  };
}

interface RoomDetails {
  id: number;
  number: string;
  type: string;
  status: string;
  price: number;
  floor?: number;
  description?: string;
  capacity: number;
}

export async function getAvailableRooms(checkInDate: string, checkOutDate: string, floor?: number, roomType?: string): Promise<Room[]> {
  try {
    let query = supabase
      .from('rooms')
      .select('*')
      .order('number');

    if (floor !== undefined) {
      query = query.eq('floor', floor);
    }
    
    if (roomType) {
      query = query.eq('type', roomType);
    }

    const { data: allRooms, error: roomsError } = await query;

    if (roomsError) throw roomsError;
    
    const { data: conflictingReservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('room_id')
      .lt('check_in', checkOutDate)
      .gt('check_out', checkInDate)
      .in('status', ['pending', 'confirmed', 'checked-in']);

    if (reservationsError) throw reservationsError;
    
    const conflictingRoomIds = conflictingReservations.map(res => res.room_id);
    
    const availableRooms = allRooms.filter(room => 
      room.status === 'available' && !conflictingRoomIds.includes(room.id)
    );
    
    return availableRooms.filter(room => 
      room.id && room.number && room.type && room.status && typeof room.price === 'number'
    ) as Room[];
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    return [];
  }
}

export async function searchGuests(query: string): Promise<Guest[]> {
  try {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    
    return data.filter(guest => 
      guest.id && guest.full_name
    ).map(guest => ({
      id: guest.id,
      name: guest.full_name,
      email: guest.email,
      phone: guest.phone
    })) as Guest[];
  } catch (error) {
    console.error('Error searching guests:', error);
    return [];
  }
}

export async function getUpcomingReservations(): Promise<Reservation[]> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        guests(full_name, email, phone),
        rooms (number, type)
      `)
      .gte('check_in', new Date().toISOString().split('T')[0])
      .order('check_in')
      .limit(10);

    if (error) throw error;
    
    const transformedData = data.map(res => ({
      ...res,
      guest_name: res.guests?.full_name || 'Unknown Guest',
      guest_email: res.guests?.email || null,
      guest_phone: res.guests?.phone || null
    }));
    
    return transformedData.filter(res => 
      res.id && res.guest_id && res.room_id && res.guest_name && res.check_in && res.check_out && res.status
    ) as Reservation[];
  } catch (error) {
    console.error('Error fetching upcoming reservations:', error);
    return [];
  }
}

export async function getRoomDetails(roomId: number): Promise<RoomDetails | null> {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) throw error;
    
    if (data && data.id && data.number && data.type && data.status) {
      return data as RoomDetails;
    }
    return null;
  } catch (error) {
    console.error('Error fetching room details:', error);
    return null;
  }
}

export async function getGuestReservations(guestId: number): Promise<Reservation[]> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        guests(full_name, email, phone),
        rooms (number, type, price)
      `)
      .eq('guest_id', guestId)
      .order('check_in', { ascending: false });

    if (error) throw error;
    
    const transformedData = data.map(res => ({
      ...res,
      guest_name: res.guests?.full_name || 'Unknown Guest',
      guest_email: res.guests?.email || null,
      guest_phone: res.guests?.phone || null
    }));
    
    return transformedData.filter(res => 
      res.id && res.guest_id && res.room_id && res.guest_name && res.check_in && res.check_out && res.status
    ) as Reservation[];
  } catch (error) {
    console.error('Error fetching guest reservations:', error);
    return [];
  }
}