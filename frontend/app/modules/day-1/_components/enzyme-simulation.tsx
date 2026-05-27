"use client"

import { Card } from "@/components/ui/card"
import {
  ENZYME_SIZE,
  NODE_SIZE,
  type Point,
} from "../_hooks/useSimulationState"

type EnzymeSimulationProps = {
  enzymePos: Point
  isConnected: boolean
  isDragging: boolean
  onSubstratePointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void
  onSubstratePointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void
  onSubstratePointerUp: (event: React.PointerEvent<HTMLButtonElement>) => void
  panelRef: React.RefObject<HTMLDivElement | null>
  substratePos: Point
}

function EnzymeSimulation({
  enzymePos,
  isConnected,
  isDragging,
  onSubstratePointerDown,
  onSubstratePointerMove,
  onSubstratePointerUp,
  panelRef,
  substratePos,
}: EnzymeSimulationProps) {
  return (
    <Card className="mt-6 flex flex-1 min-h-0 flex-col gap-0 rounded-3xl border-0 bg-[#eeede8] p-2 ring-1 ring-foreground/10">
      <div
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
      </div>
    </Card>
  )
}

export { EnzymeSimulation }

