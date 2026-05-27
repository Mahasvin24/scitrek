"use client"

import Link from "next/link"
import { LogOutIcon, UserIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

function NavUserAvatar({ className }: { className?: string }) {
  return (
    <Avatar size="sm" className={className}>
      <AvatarFallback className="bg-white text-muted-foreground">
        <UserIcon className="size-4" aria-hidden />
      </AvatarFallback>
    </Avatar>
  )
}

type NavUserProps = {
  username: string | null
  loading: boolean
  onLogout: () => void
}

function NavUserDesktop({ username, loading, onLogout }: NavUserProps) {
  if (loading) {
    return (
      <div
        className="hidden h-8 w-24 animate-pulse rounded-full bg-foreground/10 sm:block"
        aria-hidden
      />
    )
  }

  if (!username) {
    return (
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/login" />}
        className="hidden rounded-full px-5 text-sm sm:inline-flex"
      >
        Log in
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="hidden h-9 max-w-48 gap-2 rounded-full px-2 sm:inline-flex"
            aria-label={`Account menu for ${username}`}
          />
        }
      >
        <NavUserAvatar />
        <span className="truncate text-sm font-medium">{username}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal text-foreground">
            {username}
          </DropdownMenuLabel>
          <DropdownMenuItem
            variant="destructive"
            onClick={onLogout}
            className="cursor-pointer"
          >
            <LogOutIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavUserMobile({
  username,
  loading,
  onLogout,
  className,
}: NavUserProps & { className?: string }) {
  if (loading) {
    return null
  }

  if (!username) {
    return (
      <SheetClose
        render={
          <Button
            variant="ghost"
            className={cn("w-full justify-start", className)}
            nativeButton={false}
            render={<Link href="/login" />}
          />
        }
      >
        Log in
      </SheetClose>
    )
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-3 px-2 py-1">
        <NavUserAvatar />
        <span className="truncate text-sm font-medium text-foreground">
          {username}
        </span>
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start text-destructive hover:text-destructive"
        onClick={onLogout}
      >
        <LogOutIcon />
        Log out
      </Button>
    </div>
  )
}

export { NavUserDesktop, NavUserMobile }
