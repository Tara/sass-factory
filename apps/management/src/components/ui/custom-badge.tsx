'use client'

import * as React from "react"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"

export type BadgeVariant = 'default' | 'success' | 'destructive'

export type CustomBadgeVariant = 
  | "success"  // for completed shows
  | "warning"  // for scheduled shows
  | "info"     // for upcoming shows
  | "default"  // fallback
  | "muted"    // for past shows

interface CustomBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant | CustomBadgeVariant
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant | CustomBadgeVariant, string> = {
  default: "bg-zinc-900/90 hover:bg-zinc-900 text-white",
  success: "bg-green-500/90 hover:bg-green-500 text-white",
  destructive: "bg-red-500/90 hover:bg-red-500 text-white",
  warning: "bg-yellow-500/90 hover:bg-yellow-500 text-white",
  info: "bg-blue-500/90 hover:bg-blue-500 text-white",
  muted: "bg-zinc-500/90 hover:bg-zinc-500 text-white"
}

export function CustomBadge({ 
  variant = "default", 
  className,
  children,
  ...props 
}: CustomBadgeProps) {
  return (
    <Badge
      className={cn(
        variantStyles[variant],
        "backdrop-blur-sm shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  )
} 