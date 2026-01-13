"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/useAuth"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"

interface SubRoute {
  href: string
  label: string
  description: string
}

interface Route {
  href?: string
  label: string
  staffOnly?: boolean
  subRoutes?: SubRoute[]
}

export function MainNav() {
  const pathname = usePathname()
  const { session } = useAuth()
  const isStaff = session?.isStaff

  const routes: Route[] = [
    {
      href: "/",
      label: "Home",
    },
    {
      label: "Availability",
      subRoutes: [
        {
          href: "/availability",
          label: "Member Availability",
          description: "Manage your personal availability"
        },
        {
          href: "/availability/team",
          label: "Team Availability",
          description: "View team-wide availability"
        }
      ]
    },
    {
      href: "/venues",
      label: "Venues",
      staffOnly: true
    },
    {
      href: "/shows",
      label: "Shows",
      staffOnly: true
    },
    {
      href: "/members",
      label: "Members",
      staffOnly: true
    }
  ]

  const filteredRoutes = routes.filter(route => !route.staffOnly || isStaff)

  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <NavigationMenu>
        <NavigationMenuList>
          {filteredRoutes.map((route) => (
            <NavigationMenuItem key={route.label}>
              {route.subRoutes ? (
                <>
                  <NavigationMenuTrigger
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname.startsWith(route.href || "") ? "text-black dark:text-white" : "text-muted-foreground"
                    )}
                  >
                    {route.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[200px] gap-3 p-4">
                      {route.subRoutes.map((subRoute) => (
                        <NavigationMenuLink
                          key={subRoute.href}
                          href={subRoute.href}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            pathname === subRoute.href ? "bg-accent" : ""
                          )}
                        >
                          <div className="text-sm font-medium">{subRoute.label}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {subRoute.description}
                          </p>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </>
              ) : (
                <Link
                  href={route.href!}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === route.href ? "text-black dark:text-white" : "text-muted-foreground"
                  )}
                >
                  {route.label}
                </Link>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
} 