"use client"

import * as React from "react"
import { DialogContent as BaseDialogContent } from "./dialog"
import { cn } from "@/lib/utils"

interface ScrollableDialogContentProps extends React.ComponentProps<typeof BaseDialogContent> {
  showScrollbar?: boolean
}

/**
 * Enhanced DialogContent with invisible scrollbar by default
 * Perfect for forms and long content in dialogs
 */
export function ScrollableDialogContent({
  className,
  showScrollbar = false,
  children,
  ...props
}: ScrollableDialogContentProps) {
  return (
    <BaseDialogContent
      className={cn(
        // Add invisible-scrollbar class unless showScrollbar is true
        !showScrollbar && "invisible-scrollbar",
        className
      )}
      {...props}
    >
      {children}
    </BaseDialogContent>
  )
}

/**
 * Wrapper component for scrollable areas within dialogs
 */
export function DialogScrollArea({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-y-auto max-h-full invisible-scrollbar",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { DialogScrollArea as DialogScroll }