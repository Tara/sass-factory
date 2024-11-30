"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserAccountNav } from "@/components/user-account-nav"

const navItems = [
  {
    href: "/",
    label: "Dashboard"
  },
  {
    href: "/shows",
    label: "Shows"
  },
  {
    href: "/venues",
    label: "Venues"
  },
  {
    href: "/members",
    label: "Members"
  }
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="flex w-full items-center">
      <nav className="flex items-center space-x-4 lg:space-x-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto">
        <UserAccountNav />
      </div>
    </div>
  )
} 