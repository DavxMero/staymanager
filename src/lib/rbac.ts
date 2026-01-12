import { createClient } from '@/lib/supabase/server';

export type RoleName = 'super_admin' | 'manager' | 'front_desk' | 'housekeeping' | 'finance' | 'guest';

export interface Role {
    id: string;
    name: RoleName;
    display_name: string;
    description: string;
    permissions: string[];
    created_at: string;
    updated_at: string;
}

export interface UserRole {
    id: string;
    user_id: string;
    role_id: string;
    assigned_by: string | null;
    assigned_at: string;
    role: Role;
}

/**
 * Get all roles for a user
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('user_roles')
        .select(`
      *,
      role:roles(*)
    `)
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user roles:', error);
        return [];
    }

    return data as unknown as UserRole[];
}

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, roleName: RoleName): Promise<boolean> {
    const roles = await getUserRoles(userId);
    return roles.some(ur => ur.role.name === roleName);
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(userId: string, roleNames: RoleName[]): Promise<boolean> {
    const roles = await getUserRoles(userId);
    return roles.some(ur => roleNames.includes(ur.role.name));
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
    const roles = await getUserRoles(userId);

    if (roles.some(ur => ur.role.name === 'super_admin')) {
        return true;
    }

    return roles.some(ur => {
        const permissions = ur.role.permissions || [];
        return permissions.includes('*') || permissions.includes(permission);
    });
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
    const roles = await getUserRoles(userId);

    if (roles.some(ur => ur.role.name === 'super_admin')) {
        return ['*'];
    }

    const allPermissions = new Set<string>();
    roles.forEach(ur => {
        const permissions = ur.role.permissions || [];
        permissions.forEach(p => allPermissions.add(p));
    });

    return Array.from(allPermissions);
}

/**
 * Assign a role to a user
 */
export async function assignRole(userId: string, roleName: RoleName, assignedBy?: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

    if (roleError || !role) {
        return { success: false, error: 'Role not found' };
    }

    const { error } = await supabase
        .from('user_roles')
        .insert({
            user_id: userId,
            role_id: role.id,
            assigned_by: assignedBy || null,
        });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Remove a role from a user
 */
export async function removeRole(userId: string, roleName: RoleName): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

    if (roleError || !role) {
        return { success: false, error: 'Role not found' };
    }

    const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', role.id);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get role-based navigation items
 */
export function getNavigationForRole(permissions: string[]): string[] {
    if (permissions.includes('*')) {
        return ['dashboard', 'rooms', 'occupancy', 'guests', 'staff', 'financial', 'operations', 'reports', 'chatbot', 'settings'];
    }

    return permissions;
}
