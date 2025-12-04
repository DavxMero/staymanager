"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function GlobalSidebarTrigger({ className }: { className?: string }) {
    const pathname = usePathname()

    // Hide sidebar trigger on chatbot page as it has its own custom trigger
    if (pathname === "/chatbot") return null

    return <SidebarTrigger className={className} />
}
