"use client"

import { useEffect, useRef, useState } from "react"

import {
  DAY1_LINES,
  END_LINE_INDEX,
  SUCCESS_LINE_INDEX,
  TASK_LINE_INDEX,
  type DialogueLine,
} from "../_lib/dialogue"

const TYPING_MS = 18
const BUBBLE_TRANSITION_MS = 180
const BUBBLE_START_PX = 220
const BUBBLE_GROW_MS = 360
const BUBBLE_MAX_PX = 640
const BUBBLE_SIDE_PADDING_PX = 32
const BUBBLE_EXTRA_PX = 10
const BUBBLE_MIN_PX = 220

export function useDialogueFlow(isConnected: boolean) {
  const [lineIndex, setLineIndex] = useState(0)
  const [typedCount, setTypedCount] = useState(0)
  const [bubbleVisible, setBubbleVisible] = useState(true)
  const [bubbleWidthPx, setBubbleWidthPx] = useState(BUBBLE_START_PX)
  const [bubbleTargetPx, setBubbleTargetPx] = useState(BUBBLE_START_PX)

  const swapTimeoutRef = useRef<number | null>(null)
  const growTimeoutRef = useRef<number | null>(null)
  const measureLineRef = useRef<HTMLSpanElement | null>(null)
  const measureHintRef = useRef<HTMLSpanElement | null>(null)

  const currentLine = DAY1_LINES[lineIndex] as DialogueLine
  const isTaskLine = lineIndex === TASK_LINE_INDEX
  const isEndingLine = lineIndex === END_LINE_INDEX
  const canInteractExperiment = isTaskLine || isEndingLine
  const typedText = currentLine.text.slice(0, typedCount)
  const isTyping = typedCount < currentLine.text.length
  const bubbleHint =
    isTaskLine && !isConnected
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
      if (swapTimeoutRef.current) window.clearTimeout(swapTimeoutRef.current)
      if (growTimeoutRef.current) window.clearTimeout(growTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const lineWidth = measureLineRef.current?.getBoundingClientRect().width ?? BUBBLE_MIN_PX
    const hintWidth = measureHintRef.current?.getBoundingClientRect().width ?? 0
    const desired = Math.max(lineWidth, hintWidth) + BUBBLE_SIDE_PADDING_PX + BUBBLE_EXTRA_PX
    const viewportMax = window.innerWidth - 120
    const nextTarget = Math.min(BUBBLE_MAX_PX, viewportMax, desired)
    setBubbleTargetPx(Math.max(BUBBLE_MIN_PX, nextTarget))
  }, [currentLine.text, bubbleHint])

  useEffect(() => {
    if (isConnected && lineIndex === TASK_LINE_INDEX) {
      swapBubbleLine(SUCCESS_LINE_INDEX)
    }
  }, [isConnected, lineIndex])

  useEffect(() => {
    if (!bubbleVisible) return
    if (growTimeoutRef.current) window.clearTimeout(growTimeoutRef.current)
    growTimeoutRef.current = window.setTimeout(() => {
      setBubbleWidthPx(bubbleTargetPx)
      growTimeoutRef.current = null
    }, 30)
  }, [bubbleVisible, bubbleTargetPx])

  function swapBubbleLine(nextLineIndex: number) {
    if (swapTimeoutRef.current) window.clearTimeout(swapTimeoutRef.current)
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
    if (lineIndex === TASK_LINE_INDEX && !isConnected) return
    if (isEndingLine) return
    const nextLine = (lineIndex + 1) % DAY1_LINES.length
    swapBubbleLine(nextLine)
  }

  function restartToBeginning() {
    swapBubbleLine(0)
  }

  return {
    bubbleGrowMs: BUBBLE_GROW_MS,
    bubbleHint,
    bubbleVisible,
    bubbleWidthPx,
    canInteractExperiment,
    currentLine,
    goToNextLine,
    isEndingLine,
    isTaskLine,
    isTyping,
    measureHintRef,
    measureLineRef,
    restartToBeginning,
    typedText,
  }
}

