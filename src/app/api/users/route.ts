import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getServerUserContext, hasPermission } from '@/lib/auth/server-permissions';

export async function GET(request: Request) {
    try {
        const ctx = await getServerUserContext(request);
        if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!hasPermission(ctx, 'staff', 'settings')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) {
            console.error('Error fetching users:', error);
            return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
        }

        const mappedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
        }));

        return NextResponse.json({ users: mappedUsers });
    } catch (error) {
        console.error('Error in users API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
