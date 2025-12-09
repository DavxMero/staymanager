'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
    id: string;
    email: string;
    full_name?: string;
    created_at: string;
}

interface Role {
    id: string;
    name: string;
    display_name: string;
    description: string;
}

interface UserWithRoles extends User {
    user_roles: Array<{
        role: Role;
    }>;
}

export default function RolesManagementPage() {
    const [users, setUsers] = useState<UserWithRoles[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch all users from API route (server-side)
            const usersResponse = await fetch('/api/users');
            if (!usersResponse.ok) {
                throw new Error('Failed to fetch users');
            }
            const { users: allUsers } = await usersResponse.json();

            // Fetch all users with their roles
            const { data: usersData, error: usersError } = await supabase
                .from('user_roles')
                .select(`
                    user_id,
                    role:roles(*)
                `);

            if (usersError) throw usersError;

            // Fetch all available roles
            const { data: rolesData, error: rolesError } = await supabase
                .from('roles')
                .select('*')
                .order('display_name');

            if (rolesError) throw rolesError;

            // Create a map of user roles
            const userRolesMap: Record<string, Array<{ role: Role }>> = {};
            usersData?.forEach((ur: any) => {
                if (!userRolesMap[ur.user_id]) {
                    userRolesMap[ur.user_id] = [];
                }
                userRolesMap[ur.user_id].push({ role: ur.role });
            });

            // Combine all users with their roles
            const usersWithRoles = allUsers.map((user: any) => ({
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                created_at: user.created_at,
                user_roles: userRolesMap[user.id] || [],
            }));

            setUsers(usersWithRoles);
            setRoles(rolesData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load users and roles',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const assignRole = async (userId: string, roleName: string) => {
        try {
            const role = roles.find(r => r.name === roleName);
            if (!role) return;

            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('user_roles')
                .insert({
                    user_id: userId,
                    role_id: role.id,
                    assigned_by: user?.id,
                });

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Role assigned successfully',
            });

            fetchData();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to assign role',
                variant: 'destructive',
            });
        }
    };

    const removeRole = async (userId: string, roleId: string) => {
        try {
            const { error } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId)
                .eq('role_id', roleId);

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Role removed successfully',
            });

            fetchData();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to remove role',
                variant: 'destructive',
            });
        }
    };

    const getRoleBadgeColor = (roleName: string) => {
        const colors: Record<string, string> = {
            super_admin: 'bg-red-500 hover:bg-red-600',
            manager: 'bg-purple-500 hover:bg-purple-600',
            front_desk: 'bg-blue-500 hover:bg-blue-600',
            housekeeping: 'bg-green-500 hover:bg-green-600',
            finance: 'bg-yellow-500 hover:bg-yellow-600',
            guest: 'bg-gray-500 hover:bg-gray-600',
        };
        return colors[roleName] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Shield className="h-8 w-8" />
                        Role Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage user roles and permissions
                    </p>
                </div>
            </div>

            {/* Roles Legend */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Roles</CardTitle>
                    <CardDescription>
                        Role descriptions and permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roles.map(role => (
                            <div key={role.id} className="border rounded-lg p-4">
                                <Badge className={getRoleBadgeColor(role.name)}>
                                    {role.display_name}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {role.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>User Roles</CardTitle>
                    <CardDescription>
                        Assign and manage roles for each user
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Current Roles</TableHead>
                                <TableHead>Assign Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {user.full_name || user.email}
                                            </span>
                                            {user.full_name && (
                                                <span className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground font-mono">
                                                ID: {user.id.substring(0, 8)}...
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {user.user_roles.length === 0 ? (
                                                <Badge variant="outline">No roles</Badge>
                                            ) : (
                                                user.user_roles.map(ur => (
                                                    <Badge
                                                        key={ur.role.id}
                                                        className={getRoleBadgeColor(ur.role.name)}
                                                    >
                                                        {ur.role.display_name}
                                                    </Badge>
                                                ))
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            onValueChange={(value) => assignRole(user.id, value)}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Add role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles
                                                    .filter(
                                                        role =>
                                                            !user.user_roles.some(ur => ur.role.id === role.id)
                                                    )
                                                    .map(role => (
                                                        <SelectItem key={role.id} value={role.name}>
                                                            {role.display_name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {user.user_roles.map(ur => (
                                                <Button
                                                    key={ur.role.id}
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeRole(user.id, ur.role.id)}
                                                    title={`Remove ${ur.role.display_name}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
