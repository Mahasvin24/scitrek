"use client"
import { Navbar } from "@/components/navbar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { MessageSquareTextIcon, RotateCcwIcon, UserIcon } from "lucide-react"

export default function ModulesPage() {
  return (
    <main className="flex min-h-svh flex-col bg-[#f5f5f0]">
      <Navbar />

      <section className="mx-auto w-full max-w-6xl px-8 pb-16 pt-24">
        <div className="space-y-4">
          <h1 className="font-heading text-3xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Day 1: Enymes
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Short bit of information about this module.
          </p>
        </div>

        <Separator className="my-10 bg-foreground/10" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar size="lg" className="mt-1">
              <AvatarFallback className="bg-white text-muted-foreground">
                <UserIcon className="size-5" aria-hidden />
              </AvatarFallback>
            </Avatar>

            <Card className="w-[min(34rem,calc(100vw-6rem))] border-0 bg-white/80 shadow-sm ring-1 ring-foreground/10">
              <CardContent className="relative px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <MessageSquareTextIcon className="size-4 text-muted-foreground" aria-hidden />
                  <span className="font-medium">Hello!</span>
                </div>
                <div className="absolute -left-1 top-4 size-3 rotate-45 bg-white/80 ring-1 ring-foreground/10" />
              </CardContent>
            </Card>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            onClick={() => {
              // Stub for now — the animation will be added later.
            }}
          >
            <RotateCcwIcon aria-hidden />
            Replay animation
          </Button>
        </div>
      </section>
    </main>
  )
}

