'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from './profile-settings'
import { HotelSettings } from './hotel-settings'
import { AISettings } from './ai-settings'
import { usePermissions, hasPermission } from '@/lib/hooks/usePermissions'
import { User, Building, Bot, CreditCard, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { permissions, loading } = usePermissions()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const canManageSettings = hasPermission(permissions, 'settings')
  const canManageBilling = hasPermission(permissions, 'billing')

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[600px] lg:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>

          {canManageSettings && (
            <TabsTrigger value="hotel" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Hotel
            </TabsTrigger>
          )}

          {canManageSettings && (
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI
            </TabsTrigger>
          )}

          {canManageBilling && (
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings />
        </TabsContent>

        {canManageSettings && (
          <>
            <TabsContent value="hotel" className="space-y-6">
              <HotelSettings />
            </TabsContent>
            <TabsContent value="ai" className="space-y-6">
              <AISettings />
            </TabsContent>
          </>
        )}

        {canManageBilling && (
          <TabsContent value="billing" className="space-y-6">
            <div className="flex items-center justify-center h-[200px] border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">Billing settings coming soon...</p>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}