'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface GuestReservationState {
  reservation_id: number | null;
  guest_id: number | null;
  room_id: number | null;
  room_number: string | null;
  check_in: string | null;
  check_out: string | null;
  loading: boolean;
  error: string | null;
}

export function useGuestReservation(): GuestReservationState {
  const [state, setState] = useState<GuestReservationState>({
    reservation_id: null,
    guest_id: null,
    room_id: null,
    room_number: null,
    check_in: null,
    check_out: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchGuestReservation() {
      try {
        const supabase = createClient();
        
        // 1. Get current logged in user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('User not authenticated');
        }

        // 2. Get guest record matching user_id
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (guestError || !guestData) {
          if (isMounted) {
            setState(prev => ({
              ...prev,
              loading: false,
              error: 'No guest profile linked to this account.',
            }));
          }
          return;
        }

        // 3. Get active reservation for this guest
        const { data: reservationData, error: reservationError } = await supabase
          .from('reservations')
          .select(`
            id,
            guest_id,
            room_id,
            check_in,
            check_out,
            rooms (number)
          `)
          .eq('guest_id', guestData.id)
          .eq('status', 'checked-in')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (reservationError || !reservationData) {
          if (isMounted) {
            setState(prev => ({
              ...prev,
              loading: false,
              error: 'No active checked-in reservation found.',
            }));
          }
          return;
        }

        if (isMounted) {
          setState({
            reservation_id: reservationData.id,
            guest_id: reservationData.guest_id,
            room_id: reservationData.room_id,
            room_number: (reservationData.rooms as any)?.number || 'Unknown',
            check_in: reservationData.check_in,
            check_out: reservationData.check_out,
            loading: false,
            error: null,
          });
        }
      } catch (err: any) {
        console.error('Error fetching guest reservation:', err);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: err.message,
          }));
        }
      }
    }

    fetchGuestReservation();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
