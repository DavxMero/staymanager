"use client"

import * as React from "react"
import {
  Bot,
  Building,
  Calendar,
  ChevronRight,
  CreditCard,
  Home,
  LineChart,
  Settings,
  Users,
  UserCog,
  Utensils,
  ConciergeBell,
  BedDouble,
  DollarSign,
  Package,
  BrainCircuit,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { usePermissions, hasPermission } from "@/lib/hooks/usePermissions"
import { useBranding } from "@/lib/hooks/useBranding"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, User, ChevronUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

const PERMISSION_MAP: Record<string, string> = {
  'Rooms': 'rooms',
  'Occupancy': 'occupancy',
  'Guest Management': 'guests',
  'Guest Facilities': 'chatbot',
  'Staff': 'staff',
  'Financial': 'billing',
  'Operations': 'operations',
  'Logistics & Inventory': 'operations',
  'Reports': 'reports',
  'Chatbot': 'chatbot',
  'Settings': 'settings',
};

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Rooms",
    url: "/rooms",
    icon: Building,
  },
  {
    title: "Occupancy",
    url: "/occupancy",
    icon: BedDouble,
  },
  {
    title: "Guest Management",
    url: "/guests",
    icon: Users,
  },
  {
    title: "Guest Facilities",
    url: "/guest-facilities",
    icon: ConciergeBell,
  },
  {
    title: "Staff",
    url: "/staff",
    icon: UserCog,
  },
  {
    title: "Financial",
    url: "/financial",
    icon: CreditCard,
  },
  {
    title: "Operations",
    icon: Package,
    items: [
      {
        title: "Logistics & Inventory",
        url: "/logistics",
        icon: Package,
      },
    ],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: LineChart,
  },
  {
    title: "Chatbot",
    url: "/chatbot",
    icon: Bot,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({})
  const [mounted, setMounted] = React.useState(false)
  const [user, setUser] = React.useState<any>(null)
  const [userRoles, setUserRoles] = React.useState<string[]>([])
  const [isGuestCheckedIn, setIsGuestCheckedIn] = React.useState(false)
  const { permissions, loading, roles } = usePermissions()
  const { branding } = useBranding()
  const supabase = createClient()

  React.useEffect(() => {
    setMounted(true)

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: userRolesData } = await supabase
          .from('user_roles')
          .select('role:roles(name, display_name)')
          .eq('user_id', user.id)

        if (userRolesData) {
          setUserRoles(userRolesData.map((ur: any) => ur.role.display_name))

          const isGuestOnly = userRolesData.length === 1 && (userRolesData[0]?.role as any)?.name === 'guest'
          if (isGuestOnly) {
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

              setIsGuestCheckedIn(!!reservation)
            }
          } else {
            setIsGuestCheckedIn(true)
          }
        }
      }
    }

    fetchUser()
  }, [supabase])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setUserRoles([])

      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/login'
    }
  }

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const visibleItems = React.useMemo(() => {
    if (loading) return []
    if (permissions.includes('*')) return items

    return items.filter(item => {
      // Guest Facilities: hide for guests who aren't checked-in
      if (item.title === 'Guest Facilities' && !isGuestCheckedIn) {
        return false
      }

      const requiredPermission = PERMISSION_MAP[item.title]
      if (!requiredPermission) return true

      const hasAccess = hasPermission(permissions, requiredPermission)

      if (item.items) {
        const filteredSubItems = item.items.filter(subItem => {
          const subPermission = PERMISSION_MAP[subItem.title]
          return !subPermission || hasPermission(permissions, subPermission)
        })

        if (filteredSubItems.length > 0) {
          return { ...item, items: filteredSubItems }
        }
        return false
      }

      return hasAccess
    })
  }, [loading, permissions, isGuestCheckedIn])

  const isSubMenuActive = (subItems: any[]) => {
    return subItems.some((subItem: any) => pathname === subItem.url)
  }

  React.useEffect(() => {
    if (!mounted) return

    const initialOpenMenus: Record<string, boolean> = {}
    visibleItems.forEach(item => {
      if (item.items && isSubMenuActive(item.items)) {
        initialOpenMenus[item.title] = true
      }
    })

    if (Object.keys(initialOpenMenus).length > 0) {
      setOpenMenus(prev => ({
        ...prev,
        ...initialOpenMenus
      }))
    }
  }, [mounted, pathname, visibleItems])

  if (loading) {
    return (
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 py-3 text-2xl font-bold">
            {branding.brandLogoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={branding.brandLogoUrl}
                alt={branding.brandName}
                className="size-10 object-contain"
              />
            ) : (
              <Building className="size-10" />
            )}
            <span>{branding.brandName}</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-2 space-y-2">
            {/* User Profile Card */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-auto py-3 px-3 hover:bg-accent"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-semibold truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                      {userRoles.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {userRoles.slice(0, 2).map((role, index) => (
                            <Badge key={index} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="end"
                  className="w-56"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  {hasPermission(permissions, 'settings') && (
                    <DropdownMenuItem asChild>
                      <Link href="/roles" className="cursor-pointer">
                        <UserCog className="mr-2 h-4 w-4" />
                        Role Management
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* App Version & Theme Toggle */}
            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
              <span>{branding.brandName} v0.1.0</span>
              <ModeToggle />
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 py-3 text-2xl font-bold">
          {branding.brandLogoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={branding.brandLogoUrl}
              alt={branding.brandName}
              className="size-10 object-contain"
            />
          ) : (
            <Building className="size-10" />
          )}
          <span>{branding.brandName}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                if (item.items) {
                  const hasActiveSubItem = isSubMenuActive(item.items)
                  const isMenuOpen = openMenus[item.title] || false

                  return (
                    <Collapsible
                      key={item.title}
                      open={isMenuOpen}
                      onOpenChange={() => toggleMenu(item.title)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={hasActiveSubItem}
                            className="w-full justify-between h-9 px-2 text-sm font-medium"
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-5 w-5" />
                              <span className="text-sm font-semibold">{item.title}</span>
                            </div>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.url}
                                  className="h-8 px-4 ml-2 text-xs"
                                >
                                  <Link href={subItem.url} className="flex items-center gap-2">
                                    <subItem.icon className="h-4 w-4 opacity-70" />
                                    <span className="text-xs font-medium">{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className="h-9 px-2 text-sm font-medium"
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-semibold">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 space-y-2">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto py-3 px-3 hover:bg-accent"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-sm font-semibold truncate">
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                    {userRoles.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {userRoles.slice(0, 2).map((role, index) => (
                          <Badge key={index} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-56"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                {hasPermission(permissions, 'settings') && (
                  <DropdownMenuItem asChild>
                    <Link href="/roles" className="cursor-pointer">
                      <UserCog className="mr-2 h-4 w-4" />
                      Role Management
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    handleLogout()
                  }}
                  className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* App Version & Theme Toggle */}
          <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
            <span>{branding.brandName} v0.1.0</span>
            <ModeToggle />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
