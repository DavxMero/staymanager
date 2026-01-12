'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UserPermissions {
    permissions: string[];
    roles: string[];
    loading: boolean;
}

/**
 * Hook to get current user's permissions
 */
export function usePermissions(): UserPermissions {
    const [state, setState] = useState<UserPermissions>({
        permissions: [],
        roles: [],
        loading: true,
    });

    useEffect(() => {
        const fetchPermissions = async () => {
            const supabase = createClient();

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setState({ permissions: [], roles: [], loading: false });
                return;
            }

            const { data: userRoles } = await supabase
                .from('user_roles')
                .select(`
          role:roles(
            name,
            permissions
          )
        `)
                .eq('user_id', user.id);

            if (!userRoles || userRoles.length === 0) {
                setState({ permissions: [], roles: [], loading: false });
                return;
            }

            const roles = userRoles.map((ur: any) => ur.role.name);
            const allPermissions = new Set<string>();

            userRoles.forEach((ur: any) => {
                const perms = ur.role.permissions || [];
                perms.forEach((p: string) => allPermissions.add(p));
            });

            setState({
                permissions: Array.from(allPermissions),
                roles,
                loading: false,
            });
        };

        fetchPermissions();
    }, []);

    return state;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(permissions: string[], permission: string): boolean {
    return permissions.includes('*') || permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(permissions: string[], requiredPermissions: string[]): boolean {
    if (permissions.includes('*')) return true;
    return requiredPermissions.some(p => permissions.includes(p));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(permissions: string[], requiredPermissions: string[]): boolean {
    if (permissions.includes('*')) return true;
    return requiredPermissions.every(p => permissions.includes(p));
}
