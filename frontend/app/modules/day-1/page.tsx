"use client"

import { Navbar } from "@/components/navbar"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"

import { GuideConversation } from "./_components/guide-conversation"
import { EnzymeSimulation } from "./_components/enzyme-simulation"
import { useDialogueFlow } from "./_hooks/useDialogueFlow"
import { useSimulationState } from "./_hooks/useSimulationState"

export default function ModulesPage() {
  const [mounted, setMounted] = useState(false)
  const simulation = useSimulationState(mounted)
  const dialogue = useDialogueFlow(simulation.isConnected)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function onGlobalKeyDown(event: KeyboardEvent) {
      if (event.repeat) return
      if (event.code !== "Space") return
      event.preventDefault()
      dialogue.goToNextLine()
    }

    window.addEventListener("keydown", onGlobalKeyDown)
    return () => window.removeEventListener("keydown", onGlobalKeyDown)
  }, [dialogue])

  function onRestart() {
    dialogue.restartToBeginning()
    simulation.resetSimulation()
  }

  return (
    !mounted ? (
      <main className="flex min-h-svh flex-col bg-[#f5f5f0]">
        <Navbar />
        <section className="mx-auto w-full max-w-6xl px-8 pb-10 pt-24">
          <div className="space-y-4">
            <h1 className="font-heading text-3xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Day 1: Enymes
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Loading activity...
            </p>
          </div>
        </section>
      </main>
    ) : (
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

        <GuideConversation
          bubbleGrowMs={dialogue.bubbleGrowMs}
          bubbleHint={dialogue.bubbleHint}
          bubbleVisible={dialogue.bubbleVisible}
          bubbleWidthPx={dialogue.bubbleWidthPx}
          currentLine={dialogue.currentLine}
          isTyping={dialogue.isTyping}
          measureHintRef={dialogue.measureHintRef}
          measureLineRef={dialogue.measureLineRef}
          onAdvance={dialogue.goToNextLine}
          onRestart={onRestart}
          typedText={dialogue.typedText}
        />

        <EnzymeSimulation
          enzymePos={simulation.enzymePos}
          isConnected={simulation.isConnected}
          isDragging={simulation.isDragging}
          onSubstratePointerDown={(event) =>
            simulation.onSubstratePointerDown(event, {
              canInteractExperiment: dialogue.canInteractExperiment,
              isEndingLine: dialogue.isEndingLine,
            })
          }
          onSubstratePointerMove={simulation.onSubstratePointerMove}
          onSubstratePointerUp={simulation.onSubstratePointerUp}
          panelRef={simulation.panelRef}
          substratePos={simulation.substratePos}
        />
      </section>
    </main>
    )
  )
}

