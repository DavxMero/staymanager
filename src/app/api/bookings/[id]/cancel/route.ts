import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { canManageBookings, getServerUserContext, ownsReservation } from '@/lib/auth/server-permissions';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
);

const CANCELLABLE_STATUSES = ['pending', 'confirmed'];

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
                { error: 'Anda tidak memiliki akses untuk membatalkan reservasi ini' },
                { status: 403 },
            );
        }

        if (!CANCELLABLE_STATUSES.includes(reservation.status)) {
            return NextResponse.json(
                { error: `Reservasi berstatus "${reservation.status}" tidak dapat dibatalkan` },
                { status: 400 },
            );
        }

        let reason: string | null = null;
        try {
            const body = await request.json();
            if (typeof body?.reason === 'string' && body.reason.trim()) {
                reason = body.reason.trim();
            }
        } catch {
            // empty body is fine
        }

        // .in() guards against a concurrent status change between read and write
        const { data: updated, error } = await supabase
            .from('reservations')
            .update({
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                cancelled_by: ctx.userId,
                cancellation_reason: reason,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .in('status', CANCELLABLE_STATUSES)
            .select()
            .maybeSingle();

        if (error) {
            console.error('[bookings/cancel] update error:', error);
            return NextResponse.json({ error: 'Gagal membatalkan reservasi' }, { status: 500 });
        }
        if (!updated) {
            return NextResponse.json(
                { error: 'Status reservasi berubah, silakan muat ulang' },
                { status: 400 },
            );
        }

        return NextResponse.json({ success: true, reservation: updated });
    } catch (err) {
        console.error('[bookings/cancel] unexpected:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
