"use client"

import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "About", href: "#about" },
  { label: "Modules", href: "#modules" },
  { label: "Mentors", href: "#mentors" },
  { label: "Contact", href: "#contact" },
]

function NavLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      nativeButton={false}
      render={<Link href={href} />}
      className={cn(
        "rounded-full px-4 text-sm text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </Button>
  )
}

function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-[#f5f5f0]/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-12">
        <div className="flex min-w-0 flex-1 items-center">
          <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
            SciTrek
          </span>
        </div>

        <div className="hidden flex-1 items-center justify-center gap-1 sm:flex">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/login" />}
            className="hidden rounded-full px-5 text-sm sm:inline-flex"
          >
            Log in
          </Button>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="shrink-0 sm:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right" className="gap-0 p-0">
              <SheetHeader className="border-b border-border p-4 text-left">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 p-4">
                {navItems.map((item) => (
                  <SheetClose
                    key={item.href}
                    render={
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        nativeButton={false}
                        render={<Link href={item.href} />}
                      />
                    }
                  >
                    {item.label}
                  </SheetClose>
                ))}
                <Separator className="my-2" />
                <SheetClose
                  render={
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      nativeButton={false}
                      render={<Link href="/login" />}
                    />
                  }
                >
                  Log in
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

export { Navbar }
