import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Create Supabase admin client with service role
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

        // Create regular client to check current user permissions
        const { createClient: createServerClient } = await import('@/lib/supabase/server');
        const supabase = await createServerClient();

        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has admin permissions
        const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role:roles(name)')
            .eq('user_id', currentUser.id);

        const isAdmin = userRoles?.some((ur: any) =>
            ['super_admin', 'manager'].includes(ur.role.name)
        );

        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch all users using admin API
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) {
            console.error('Error fetching users:', error);
            return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
        }

        // Map users to simpler format
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
