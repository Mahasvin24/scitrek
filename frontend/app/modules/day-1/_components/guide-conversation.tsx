"use client"

import { RotateCcwIcon, UserIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { DialogueLine } from "../_lib/dialogue"

type GuideConversationProps = {
  bubbleGrowMs: number
  bubbleHint: string
  bubbleVisible: boolean
  bubbleWidthPx: number
  currentLine: DialogueLine
  isTyping: boolean
  measureHintRef: React.RefObject<HTMLSpanElement | null>
  measureLineRef: React.RefObject<HTMLSpanElement | null>
  onAdvance: () => void
  onRestart: () => void
  typedText: string
}

function GuideConversation({
  bubbleGrowMs,
  bubbleHint,
  bubbleVisible,
  bubbleWidthPx,
  currentLine,
  isTyping,
  measureHintRef,
  measureLineRef,
  onAdvance,
  onRestart,
  typedText,
}: GuideConversationProps) {
  return (
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
            transitionDuration: `${bubbleGrowMs}ms`,
          }}
          onClick={onAdvance}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              onAdvance()
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

            <p className="mt-1 text-xs text-muted-foreground/80">{bubbleHint}</p>
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
        onClick={onRestart}
      >
        <RotateCcwIcon aria-hidden />
        Restart activity
      </Button>
    </div>
  )
}

export { GuideConversation }

