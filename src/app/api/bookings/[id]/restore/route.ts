import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { canManageBookings, getServerUserContext, ownsReservation } from '@/lib/auth/server-permissions';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
);

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const ctx = await getServerUserContext(request);
        if (!ctx) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: reservation } = await supabase
            .from('reservations')
            .select('id, status, guest_email')
            .eq('id', id)
            .maybeSingle();

        if (!reservation) {
            return NextResponse.json({ error: 'Reservasi tidak ditemukan' }, { status: 404 });
        }

        if (!canManageBookings(ctx) && !ownsReservation(ctx, reservation.guest_email)) {
            return NextResponse.json(
                { error: 'Anda tidak memiliki akses untuk memulihkan reservasi ini' },
                { status: 403 },
            );
        }

        if (reservation.status !== 'cancelled') {
            return NextResponse.json(
                { error: `Hanya reservasi berstatus "cancelled" yang dapat dipulihkan (saat ini "${reservation.status}")` },
                { status: 400 },
            );
        }

        const { data: updated, error } = await supabase
            .from('reservations')
            .update({
                status: 'confirmed',
                cancelled_at: null,
                cancelled_by: null,
                cancellation_reason: null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('status', 'cancelled')
            .select()
            .maybeSingle();

        if (error) {
            // GiST exclusion constraint no_overlap_active_reservations:
            // the room was rebooked while this reservation was cancelled
            if (error.code === '23P01') {
                return NextResponse.json(
                    { error: 'Kamar sudah dipesan tamu lain pada tanggal tersebut — reservasi tidak dapat dipulihkan' },
                    { status: 409 },
                );
            }
            console.error('[bookings/restore] update error:', error);
            return NextResponse.json({ error: 'Gagal memulihkan reservasi' }, { status: 500 });
        }
        if (!updated) {
            return NextResponse.json(
                { error: 'Status reservasi berubah, silakan muat ulang' },
                { status: 400 },
            );
        }

        return NextResponse.json({ success: true, reservation: updated });
    } catch (err) {
        console.error('[bookings/restore] unexpected:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
