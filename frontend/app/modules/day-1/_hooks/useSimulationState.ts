"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export type Point = { x: number; y: number }

export const NODE_SIZE = 90
export const ENZYME_SIZE = 118
const SUBSTRATE_RADIUS = NODE_SIZE / 2
const ENZYME_RADIUS = ENZYME_SIZE / 2
const CONTACT_GAP = 4
const CONNECT_DISTANCE = SUBSTRATE_RADIUS + ENZYME_RADIUS + 10
const SNAP_CENTER_DISTANCE = SUBSTRATE_RADIUS + ENZYME_RADIUS - CONTACT_GAP

export function useSimulationState(enabled = true) {
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

  useEffect(() => {
    if (!enabled) return
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
  }, [enabled])

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

  function resetSimulation() {
    setIsConnected(false)
    setIsDragging(false)

    if (panelSize.width === 0) {
      setSubstratePos({ x: 120, y: 140 })
      setEnzymePos({ x: 360, y: 130 })
      return
    }

    setSubstratePos({
      x: panelSize.width * 0.22,
      y: panelSize.height * 0.62,
    })
    setEnzymePos({
      x: panelSize.width * 0.74,
      y: panelSize.height * 0.44,
    })
  }

  function onSubstratePointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    options: { canInteractExperiment: boolean; isEndingLine: boolean },
  ) {
    const { canInteractExperiment, isEndingLine } = options
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

  return {
    enzymePos,
    isConnected,
    isDragging,
    onSubstratePointerDown,
    onSubstratePointerMove,
    onSubstratePointerUp,
    panelRef,
    resetSimulation,
    substratePos,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function randomShift() {
  return (Math.random() - 0.5) * 26
}

