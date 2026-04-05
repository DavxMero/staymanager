'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { usePermissions, hasPermission } from '@/lib/hooks/usePermissions'
import { createClient } from '@/lib/supabase/client'

const ROUTE_PERMISSION_MAP: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/rooms': 'rooms',
  '/occupancy': 'occupancy',
  '/guests': 'guests',
  '/staff': 'staff',
  '/financial': 'billing',
  '/billing': 'billing',
  '/logistics': 'operations',
  '/reports': 'reports',
  '/roles': 'settings',
  '/expenses': 'billing',
}

const GUEST_ALLOWED_ROUTES = ['/chatbot', '/settings', '/dashboard']
const PUBLIC_ROUTES = ['/login', '/signup', '/auth/callback', '/chatbot']

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { permissions, roles, loading } = usePermissions()
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (loading) return

    const checkAccess = async () => {
      const isPublicRoute = PUBLIC_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + '/')
      )

      if (isPublicRoute) {
        setAuthorized(true)
        setChecking(false)
        return
      }

      if (permissions.length === 0 && roles.length === 0) {
        router.replace('/login')
        return
      }

      if (permissions.includes('*')) {
        setAuthorized(true)
        setChecking(false)
        return
      }

      const isGuestOnly = roles.length === 1 && roles[0] === 'guest'

      if (isGuestOnly) {
        if (pathname.startsWith('/guest-facilities')) {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            const { data: guestData } = await supabase
              .from('guests')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle()

            if (guestData) {
              const { data: reservation } = await supabase
                .from('reservations')
                .select('id')
                .eq('guest_id', guestData.id)
                .eq('status', 'checked-in')
                .limit(1)
                .maybeSingle()

              if (reservation) {
                setAuthorized(true)
                setChecking(false)
                return
              }
            }
          }

          router.replace('/chatbot')
          return
        }

        const isAllowed = GUEST_ALLOWED_ROUTES.some(route =>
          pathname === route || pathname.startsWith(route + '/')
        )

        if (!isAllowed) {
          router.replace('/chatbot')
          return
        }

        setAuthorized(true)
        setChecking(false)
        return
      }

      const matchedRoute = Object.keys(ROUTE_PERMISSION_MAP).find(route =>
        pathname === route || pathname.startsWith(route + '/')
      )

      if (matchedRoute) {
        const requiredPermission = ROUTE_PERMISSION_MAP[matchedRoute]
        if (!hasPermission(permissions, requiredPermission)) {
          router.replace('/dashboard')
          return
        }
      }

      setAuthorized(true)
      setChecking(false)
    }

    checkAccess()
  }, [pathname, permissions, roles, loading, router])

  if (loading || checking) {
    if (PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
      return <>{children}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Checking access...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
