"use client"
import { Navbar } from "@/components/navbar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { RotateCcwIcon, UserIcon } from "lucide-react"

const LINES = [
  { text: "Hello! I'm your Day 1 guide." },
  {
    text: "Enzymes are helper proteins. They speed up reactions without being used up.",
  },
  {
    text: "A substrate is the molecule an enzyme works on. It has to fit the enzyme's active site.",
  },
  {
    text: "Your task: drag the substrate piece into the matching enzyme pocket.",
    taskMode: true,
    highlightTask: true,
  },
  {
    text: "Great job! You formed the enzyme-substrate complex.",
    completion: true,
  },
  {
    text: "Congratulations! You've reached the end of this activity.",
    ending: true,
  },
]

const TYPING_MS = 18
const BUBBLE_TRANSITION_MS = 180
const BUBBLE_START_PX = 220
const BUBBLE_GROW_MS = 360
const BUBBLE_MAX_PX = 640
const BUBBLE_SIDE_PADDING_PX = 32
const BUBBLE_EXTRA_PX = 10
const BUBBLE_MIN_PX = 220
const NODE_SIZE = 90
const ENZYME_SIZE = 118
const SUBSTRATE_RADIUS = NODE_SIZE / 2
const ENZYME_RADIUS = ENZYME_SIZE / 2
const CONTACT_GAP = 4
const CONNECT_DISTANCE = SUBSTRATE_RADIUS + ENZYME_RADIUS + 10
const SNAP_CENTER_DISTANCE = SUBSTRATE_RADIUS + ENZYME_RADIUS - CONTACT_GAP
const TASK_LINE_INDEX = 3
const SUCCESS_LINE_INDEX = 4
const END_LINE_INDEX = LINES.length - 1

type Point = { x: number; y: number }

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
  const panelRef = useRef<HTMLDivElement | null>(null)
  const hasInitializedSimulationRef = useRef(false)
  const dragOffsetRef = useRef<Point>({ x: 0, y: 0 })
  const activePointerIdRef = useRef<number | null>(null)
  const lastBlockedToastAtRef = useRef<number>(0)
  const [panelSize, setPanelSize] = useState({ width: 0, height: 0 })
  const [substratePos, setSubstratePos] = useState<Point>({ x: 120, y: 140 })
  const [enzymePos, setEnzymePos] = useState<Point>({ x: 360, y: 130 })
  const [isDragging, setIsDragging] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const currentLine = LINES[lineIndex]
  const isTaskLine = lineIndex === TASK_LINE_INDEX
  const isEndingLine = lineIndex === END_LINE_INDEX
  const canInteractExperiment = isTaskLine || isEndingLine
  const typedText = currentLine.text.slice(0, typedCount)
  const isTyping = typedCount < currentLine.text.length
  const bubbleHint = isTaskLine && !isConnected
    ? "Complete the experiment to continue"
    : isEndingLine
      ? "Use Restart activity to start over"
      : "Tap bubble to continue"

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
    const panel = panelRef.current
    if (!panel) return

    const update = () => {
      const rect = panel.getBoundingClientRect()
      setPanelSize({ width: rect.width, height: rect.height })

      if (!hasInitializedSimulationRef.current) {
        setSubstratePos({
          x: rect.width * 0.22,
          y: rect.height * 0.62,
        })
        setEnzymePos({
          x: rect.width * 0.74,
          y: rect.height * 0.44,
        })
        setIsConnected(false)
        hasInitializedSimulationRef.current = true
      }
    }

    const ro = new ResizeObserver(update)
    ro.observe(panel)
    update()
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (isDragging || panelSize.width === 0) return

    const interval = window.setInterval(() => {
      if (isConnected) {
        setEnzymePos((prev) => {
          const nextEnzyme = {
            x: clamp(
              prev.x + randomShift(),
              ENZYME_SIZE / 2,
              panelSize.width - ENZYME_SIZE / 2,
            ),
            y: clamp(
              prev.y + randomShift(),
              ENZYME_SIZE / 2,
              panelSize.height - ENZYME_SIZE / 2,
            ),
          }

          setSubstratePos({
            x: clamp(
              nextEnzyme.x - SNAP_CENTER_DISTANCE,
              NODE_SIZE / 2,
              panelSize.width - NODE_SIZE / 2,
            ),
            y: clamp(
              nextEnzyme.y,
              NODE_SIZE / 2,
              panelSize.height - NODE_SIZE / 2,
            ),
          })

          return nextEnzyme
        })
        return
      }

      setSubstratePos((prev) => ({
        x: clamp(prev.x + randomShift(), NODE_SIZE / 2, panelSize.width - NODE_SIZE / 2),
        y: clamp(prev.y + randomShift(), NODE_SIZE / 2, panelSize.height - NODE_SIZE / 2),
      }))
      setEnzymePos((prev) => ({
        x: clamp(
          prev.x + randomShift(),
          ENZYME_SIZE / 2,
          panelSize.width - ENZYME_SIZE / 2,
        ),
        y: clamp(
          prev.y + randomShift(),
          ENZYME_SIZE / 2,
          panelSize.height - ENZYME_SIZE / 2,
        ),
      }))
    }, 1700)

    return () => window.clearInterval(interval)
  }, [isDragging, isConnected, panelSize.height, panelSize.width])

  useEffect(() => {
    const lineWidth = measureLineRef.current?.getBoundingClientRect().width ?? BUBBLE_MIN_PX
    const hintWidth = measureHintRef.current?.getBoundingClientRect().width ?? 0
    const desired = Math.max(lineWidth, hintWidth) + BUBBLE_SIDE_PADDING_PX + BUBBLE_EXTRA_PX
    const viewportMax = typeof window !== "undefined" ? window.innerWidth - 120 : BUBBLE_MAX_PX
    const nextTarget = Math.min(BUBBLE_MAX_PX, viewportMax, desired)
    setBubbleTargetPx(Math.max(BUBBLE_MIN_PX, nextTarget))
  }, [currentLine.text])

  useEffect(() => {
    if (isConnected && lineIndex === TASK_LINE_INDEX) {
      swapBubbleLine(SUCCESS_LINE_INDEX)
    }
  }, [isConnected, lineIndex])

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
    if (lineIndex === TASK_LINE_INDEX && !isConnected) {
      return
    }
    if (isEndingLine) {
      return
    }
    const nextLine = (lineIndex + 1) % LINES.length
    swapBubbleLine(nextLine)
  }

  useEffect(() => {
    function onGlobalKeyDown(event: KeyboardEvent) {
      if (event.repeat) return
      if (event.code !== "Space") return
      event.preventDefault()
      goToNextLine()
    }

    window.addEventListener("keydown", onGlobalKeyDown)
    return () => window.removeEventListener("keydown", onGlobalKeyDown)
  }, [goToNextLine])

  function replayTyping() {
    swapBubbleLine(0)
    resetSimulation()
  }

  function resetSimulation() {
    if (panelSize.width === 0) return
    setSubstratePos({
      x: panelSize.width * 0.22,
      y: panelSize.height * 0.62,
    })
    setEnzymePos({
      x: panelSize.width * 0.74,
      y: panelSize.height * 0.44,
    })
    setIsConnected(false)
    setIsDragging(false)
  }

  function onSubstratePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (!canInteractExperiment || !panelRef.current) {
      maybeShowBlockedInteractionToast()
      return
    }
    if (isEndingLine && isConnected) {
      setIsConnected(false)
    }
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    activePointerIdRef.current = event.pointerId
    const panelRect = panelRef.current.getBoundingClientRect()
    const pointerX = event.clientX - panelRect.left
    const pointerY = event.clientY - panelRect.top
    dragOffsetRef.current = {
      x: pointerX - substratePos.x,
      y: pointerY - substratePos.y,
    }
    setIsDragging(true)
  }

  function onSubstratePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (
      !isDragging ||
      !panelRef.current ||
      activePointerIdRef.current !== event.pointerId
    ) {
      return
    }

    const panelRect = panelRef.current.getBoundingClientRect()
    const pointerX = event.clientX - panelRect.left
    const pointerY = event.clientY - panelRect.top
    const nextX = pointerX - dragOffsetRef.current.x
    const nextY = pointerY - dragOffsetRef.current.y

    setSubstratePos({
      x: clamp(nextX, NODE_SIZE / 2, panelRect.width - NODE_SIZE / 2),
      y: clamp(nextY, NODE_SIZE / 2, panelRect.height - NODE_SIZE / 2),
    })
  }

  function onSubstratePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    if (!isDragging || activePointerIdRef.current !== event.pointerId) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    activePointerIdRef.current = null
    setIsDragging(false)

    const dx = substratePos.x - enzymePos.x
    const dy = substratePos.y - enzymePos.y
    const distance = Math.hypot(dx, dy)

    if (distance <= CONNECT_DISTANCE) {
      setIsConnected(true)
      setSubstratePos({
        x: enzymePos.x - SNAP_CENTER_DISTANCE,
        y: enzymePos.y,
      })
    }
  }

  function maybeShowBlockedInteractionToast() {
    const now = Date.now()
    if (now - lastBlockedToastAtRef.current < 1800) return
    lastBlockedToastAtRef.current = now
    toast.info("You can interact with the experiment once the guide reaches the task step.")
  }

  return (
    <main className="flex min-h-svh flex-col bg-[#f5f5f0]">
      <Navbar />

      <section className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col px-8 pb-10 pt-24">
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
                  {currentLine.highlightTask && typedText.startsWith("Your task") ? (
                    <>
                      Your{" "}
                      <span className="rounded bg-[#fff3bf] px-1 font-semibold text-foreground">
                        task
                      </span>
                      {typedText.slice("Your task".length)}
                    </>
                  ) : (
                    typedText
                  )}
                  {isTyping && (
                    <span
                      className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-foreground/70 align-middle animate-pulse"
                      aria-hidden
                    />
                  )}
                </p>

                <p className="mt-1 text-xs text-muted-foreground/80">
                  {bubbleHint}
                </p>
              </CardContent>
            </Card>
            <div className="pointer-events-none absolute -z-10 opacity-0" aria-hidden>
              <span ref={measureLineRef} className="text-sm leading-relaxed whitespace-nowrap">
                {currentLine.text}
              </span>
              <span
                ref={measureHintRef}
                className="mt-1 block text-xs whitespace-nowrap"
              >
                {bubbleHint}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            onClick={replayTyping}
          >
            <RotateCcwIcon aria-hidden />
            Restart activity
          </Button>
        </div>

        <Card className="mt-6 flex flex-1 min-h-0 flex-col gap-0 rounded-3xl border-0 bg-[#eeede8] p-2 ring-1 ring-foreground/10">
          <CardContent
            ref={panelRef}
            className="relative flex-1 min-h-0 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_20%_20%,#ffffff_0%,#f7f6f2_60%,#eeede8_100%)] p-4"
          >
            {isConnected && (
              <div className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                Connected! Enzyme-substrate complex formed.
              </div>
            )}

            <div
              className="pointer-events-none absolute h-1 rounded-full bg-[#5a8ee0]/60 transition-all duration-300"
              style={{
                left: Math.min(substratePos.x, enzymePos.x),
                top: substratePos.y,
                width: Math.abs(enzymePos.x - substratePos.x),
                opacity: isConnected ? 1 : 0,
              }}
            />

            <button
              type="button"
              onPointerDown={onSubstratePointerDown}
              onPointerMove={onSubstratePointerMove}
              onPointerUp={onSubstratePointerUp}
              onPointerCancel={onSubstratePointerUp}
              className="absolute z-20 flex size-[90px] items-center justify-center rounded-[44%] border border-[#5a8ee0]/35 bg-[#b8d4f4] px-2 text-sm font-semibold text-[#1a3a8a] shadow-sm transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#5a8ee0]/40"
              style={{
                left: substratePos.x - NODE_SIZE / 2,
                top: substratePos.y - NODE_SIZE / 2,
                transition: isDragging
                  ? "transform 120ms ease-out"
                  : "left 1600ms linear, top 1600ms linear, transform 120ms ease-out",
              }}
            >
              <span
                className="pointer-events-none absolute -right-1.5 top-1/2 size-4 -translate-y-1/2 rounded-full bg-[#b8d4f4] ring-1 ring-[#5a8ee0]/35"
                aria-hidden
              />
              Substrate
            </button>

            <div
              className="absolute z-10 flex items-center justify-center rounded-[44%] border border-[#3a9e7b]/35 bg-[#b8f4d8] px-2 text-sm font-semibold text-[#1a5c3a] shadow-sm transition-transform"
              style={{
                width: ENZYME_SIZE,
                height: ENZYME_SIZE,
                left: enzymePos.x - ENZYME_SIZE / 2,
                top: enzymePos.y - ENZYME_SIZE / 2,
                transition: "left 1600ms linear, top 1600ms linear, transform 120ms ease-out",
              }}
            >
              <span
                className="pointer-events-none absolute left-1 top-1/2 size-5 -translate-y-1/2 rounded-full bg-[#f7f6f2] ring-1 ring-[#3a9e7b]/20"
                aria-hidden
              />
              Enzyme
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function randomShift() {
  return (Math.random() - 0.5) * 26
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

