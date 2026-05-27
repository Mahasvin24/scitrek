"use client"
import { Navbar } from "@/components/navbar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useEffect, useRef, useState } from "react"

import { RotateCcwIcon, UserIcon } from "lucide-react"

const LINES = [
  "Hello! I am your Day 1 guide.",
  "Today we are exploring how enzymes speed reactions.",
  "Tap again and we will start the first mini activity.",
]

const TYPING_MS = 18
const BUBBLE_TRANSITION_MS = 180
const BUBBLE_START_PX = 220
const BUBBLE_GROW_MS = 360
const BUBBLE_MAX_PX = 640
const BUBBLE_SIDE_PADDING_PX = 32
const BUBBLE_EXTRA_PX = 10
const BUBBLE_MIN_PX = 220

export default function ModulesPage() {
  const [lineIndex, setLineIndex] = useState(0)
  const [typedCount, setTypedCount] = useState(0)
  const [bubbleVisible, setBubbleVisible] = useState(true)
  const [bubbleWidthPx, setBubbleWidthPx] = useState(BUBBLE_START_PX)
  const [bubbleTargetPx, setBubbleTargetPx] = useState(BUBBLE_START_PX)
  const swapTimeoutRef = useRef<number | null>(null)
  const growTimeoutRef = useRef<number | null>(null)
  const measureLineRef = useRef<HTMLSpanElement | null>(null)
  const measureHintRef = useRef<HTMLSpanElement | null>(null)

  const currentLine = LINES[lineIndex]
  const typedText = currentLine.slice(0, typedCount)
  const isTyping = typedCount < currentLine.length

  useEffect(() => {
    if (!isTyping) return

    const timeout = window.setTimeout(() => {
      setTypedCount((prev) => prev + 1)
    }, TYPING_MS)

    return () => window.clearTimeout(timeout)
  }, [isTyping, typedCount])

  useEffect(() => {
    return () => {
      if (swapTimeoutRef.current) {
        window.clearTimeout(swapTimeoutRef.current)
      }
      if (growTimeoutRef.current) {
        window.clearTimeout(growTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const lineWidth = measureLineRef.current?.getBoundingClientRect().width ?? BUBBLE_MIN_PX
    const hintWidth = measureHintRef.current?.getBoundingClientRect().width ?? 0
    const desired = Math.max(lineWidth, hintWidth) + BUBBLE_SIDE_PADDING_PX + BUBBLE_EXTRA_PX
    const viewportMax = typeof window !== "undefined" ? window.innerWidth - 120 : BUBBLE_MAX_PX
    const nextTarget = Math.min(BUBBLE_MAX_PX, viewportMax, desired)
    setBubbleTargetPx(Math.max(BUBBLE_MIN_PX, nextTarget))
  }, [currentLine])

  useEffect(() => {
    if (!bubbleVisible) return

    if (growTimeoutRef.current) {
      window.clearTimeout(growTimeoutRef.current)
    }

    // Wait one frame after reveal, then animate growth to target size.
    growTimeoutRef.current = window.setTimeout(() => {
      setBubbleWidthPx(bubbleTargetPx)
      growTimeoutRef.current = null
    }, 30)
  }, [bubbleVisible, bubbleTargetPx])

  function swapBubbleLine(nextLineIndex: number) {
    if (swapTimeoutRef.current) {
      window.clearTimeout(swapTimeoutRef.current)
    }
    if (growTimeoutRef.current) {
      window.clearTimeout(growTimeoutRef.current)
      growTimeoutRef.current = null
    }

    setBubbleVisible(false)
    swapTimeoutRef.current = window.setTimeout(() => {
      setLineIndex(nextLineIndex)
      setTypedCount(0)
      setBubbleWidthPx(BUBBLE_START_PX)
      setBubbleVisible(true)
      swapTimeoutRef.current = null
    }, BUBBLE_TRANSITION_MS)
  }

  function goToNextLine() {
    const nextLine = (lineIndex + 1) % LINES.length
    swapBubbleLine(nextLine)
  }

  function replayTyping() {
    swapBubbleLine(lineIndex)
  }

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
            <div className="flex flex-col items-center gap-2 pt-1">
              <Avatar size="lg">
                <AvatarFallback className="bg-white text-muted-foreground">
                  <UserIcon className="size-5" aria-hidden />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium tracking-wide text-muted-foreground">
                Guide
              </span>
            </div>

            <Card
              className="relative max-w-[min(40rem,calc(100vw-8rem))] overflow-visible rounded-2xl border-0 bg-white shadow-md ring-1 ring-foreground/10 transition-[width,box-shadow] hover:shadow-lg"
              style={{
                width: `${bubbleWidthPx}px`,
                transitionDuration: `${BUBBLE_GROW_MS}ms`,
              }}
              onClick={goToNextLine}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  goToNextLine()
                }
              }}
              aria-label="Next dialogue line"
            >
              <span
                className="absolute -left-2 top-5 size-4 rotate-45 rounded-[2px] bg-white ring-1 ring-foreground/10"
                aria-hidden
              />
              <CardContent
                className={`px-4 py-3 transition-all duration-200 ${
                  bubbleVisible
                    ? "scale-100 opacity-100"
                    : "pointer-events-none scale-90 opacity-0"
                }`}
              >
                <p
                  key={lineIndex}
                  className="text-sm leading-relaxed text-foreground motion-safe:animate-in motion-safe:fade-in-0"
                >
                  {typedText}
                  {isTyping && (
                    <span
                      className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-foreground/70 align-middle animate-pulse"
                      aria-hidden
                    />
                  )}
                </p>

                <p className="mt-1 text-xs text-muted-foreground/80">
                  Tap bubble to continue
                </p>
              </CardContent>
            </Card>
            <div className="pointer-events-none absolute -z-10 opacity-0" aria-hidden>
              <span ref={measureLineRef} className="text-sm leading-relaxed whitespace-nowrap">
                {currentLine}
              </span>
              <span
                ref={measureHintRef}
                className="mt-1 block text-xs whitespace-nowrap"
              >
                Tap bubble to continue
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            onClick={replayTyping}
          >
            <RotateCcwIcon aria-hidden />
            Replay animation
          </Button>
        </div>
      </section>
    </main>
  )
}

