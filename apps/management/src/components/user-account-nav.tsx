"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useAuthUser } from "@/lib/hooks/useAuthUser"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EditProfileDialog } from "@/components/auth/edit-profile-dialog"

export function UserAccountNav() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user, isLoading } = useAuthUser()
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/signin")
    router.refresh()
  }

  if (isLoading || !user) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src={user.user_metadata.avatar_url} />
            <AvatarFallback>
              {user.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user.user_metadata.full_name && (
                <p className="font-medium">{user.user_metadata.full_name}</p>
              )}
              {user.email && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer" 
            onClick={() => setIsEditProfileOpen(true)}
          >
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600 cursor-pointer" 
            onClick={handleSignOut}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={user}
      />
    </>
  )
} 