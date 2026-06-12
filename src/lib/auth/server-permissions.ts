import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';


const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
);

export interface ServerUserContext {
    userId: string;
    email: string | null;
    permissions: string[];
    roles: string[];
}


export async function getServerUserContext(request?: Request): Promise<ServerUserContext | null> {
    let userId: string | null = null;
    let email: string | null = null;

    const authHeader = request?.headers.get('authorization');
    if (authHeader?.toLowerCase().startsWith('bearer ')) {
        const { data, error } = await serviceClient.auth.getUser(authHeader.slice(7).trim());
        if (!error && data.user) {
            userId = data.user.id;
            email = data.user.email ?? null;
        }
    }

    if (!userId) {
        try {
            const ssr = await createServerSupabase();
            const { data: { user } } = await ssr.auth.getUser();
            if (user) {
                userId = user.id;
                email = user.email ?? null;
            }
        } catch {
        }
    }

    if (!userId) return null;

    const { data: userRoles } = await serviceClient
        .from('user_roles')
        .select('role:roles(name, permissions)')
        .eq('user_id', userId);

    const roles: string[] = [];
    const permissions = new Set<string>();
    for (const ur of (userRoles ?? []) as unknown as Array<{ role: { name: string; permissions: string[] | null } | null }>) {
        if (!ur.role) continue;
        roles.push(ur.role.name);
        for (const p of ur.role.permissions ?? []) permissions.add(p);
    }

    return { userId, email, permissions: Array.from(permissions), roles };
}


export function hasPermission(ctx: ServerUserContext, ...perms: string[]): boolean {
    if (ctx.permissions.includes('*')) return true;
    return perms.some((p) => ctx.permissions.includes(p));
}


export function canManageBookings(ctx: ServerUserContext): boolean {
    return (
        ctx.permissions.includes('*') ||
        ctx.permissions.includes('occupancy') ||
        ctx.permissions.includes('guests')
    );
}


export function ownsReservation(ctx: ServerUserContext, guestEmail: string | null): boolean {
    return Boolean(ctx.email && guestEmail && guestEmail.toLowerCase() === ctx.email.toLowerCase());
}
