"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/useAuth"

export function MainNav() {
  const pathname = usePathname()
  const { session } = useAuth()
  const isStaff = session?.isStaff

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/availability",
      label: "Availability",
      active: pathname === "/availability",
    },
    ...(isStaff ? [
      {
        href: "/venues",
        label: "Venues",
        active: pathname === "/venues",
      },
      {
        href: "/shows",
        label: "Shows",
        active: pathname === "/shows",
      },
    ] : [])
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-black dark:text-white" : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
} 