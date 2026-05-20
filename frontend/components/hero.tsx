"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const tabs = ["Students", "Mentors", "Teachers"]

const allOrbs = {
    Students: [
        { color: "radial-gradient(circle at 40% 35%, #a8d8c8, #3a9e7b, #1a5c3a)", name: "Chemistry" },
        { color: "radial-gradient(circle at 40% 35%, #c8e0b8, #6aaa44, #2a5a10)", name: "Cell Biology" },
        { color: "radial-gradient(circle at 38% 32%, #b8d4f4, #5a8ee0, #1a3a8a, #0a1a50)", name: "Bioinformatics" },
        { color: "radial-gradient(circle at 40% 35%, #f4d4a0, #d4882a, #7a4010)", name: "Biochemistry" },
        { color: "radial-gradient(circle at 40% 35%, #e8b8d4, #c45090, #7a1050)", name: "Genetics" },
    ],
    Mentors: [
        { color: "radial-gradient(circle at 40% 35%, #d4c8f4, #7a60d4, #2a1a8a)", name: "Train" },
        { color: "radial-gradient(circle at 40% 35%, #b8d8f4, #4a90d4, #1a4a8a)", name: "Facilitate" },
        { color: "radial-gradient(circle at 38% 32%, #f4e8b8, #d4b040, #7a6010, #3a2a00)", name: "Lead" },
        { color: "radial-gradient(circle at 40% 35%, #b8f4d8, #40d490, #107a50)", name: "Mentor" },
        { color: "radial-gradient(circle at 40% 35%, #f4b8c8, #d44070, #7a1030)", name: "Inspire" },
    ],
    Teachers: [
        { color: "radial-gradient(circle at 40% 35%, #f4d4b8, #d49060, #7a4010)", name: "Novice" },
        { color: "radial-gradient(circle at 40% 35%, #b8e8d8, #40c4a0, #107a60)", name: "Intermediate" },
        { color: "radial-gradient(circle at 38% 32%, #c8b8f4, #8060e0, #2a0a8a, #100040)", name: "Expert" },
        { color: "radial-gradient(circle at 40% 35%, #f4f0b8, #d4c840, #7a7010)", name: "Coach" },
        { color: "radial-gradient(circle at 40% 35%, #b8d4f4, #4a80d4, #1a3a8a)", name: "Lead" },
    ],
}

const tabMeta: Record<string, { label: string; description: string; featuredDesc: string }> = {
    Students: {
        label: "Inquiry-Based Modules",
        description: "NGSS-aligned, 5 sessions each",
        featuredDesc: "Analyze real genomic data like a researcher",
    },
    Mentors: {
        label: "Undergraduate Mentors",
        description: "280+ UCSB students facilitating modules",
        featuredDesc: "Facilitate small groups through experiments",
    },
    Teachers: {
        label: "Professional Development",
        description: "Apprenticeship model over 3 years",
        featuredDesc: "Teach independently and support others",
    },
}

const SLOT_SIZES    = [112, 152, 208, 152, 112]
const SLOT_OPACITIES = [0.35, 0.6, 1.0, 0.6, 0.35]
const GAP = 28
const NUM_SLOTS = 5
const PAUSE_MS = 3000
const TRANSITION_MS = 700


const ORB_CAROUSEL_FLOOR_PAD = 36
const ORB_LABEL_BAND_PX = 68
const ORB_SPHERE_TO_LABEL_GAP = 16

function buildSlots(containerWidth: number) {
    const totalWidth = SLOT_SIZES.reduce((a, b) => a + b, 0) + GAP * (NUM_SLOTS - 1)
    const startX = (containerWidth - totalWidth) / 2
    return SLOT_SIZES.map((size, i) => ({
        size,
        opacity: SLOT_OPACITIES[i],
        cx: startX + SLOT_SIZES.slice(0, i).reduce((a, b) => a + b, 0) + GAP * i + size / 2,
    }))
}

function easeInOut(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const CAPTION_TRANSITION =
    "transition-[opacity,transform] duration-1000 ease-out motion-reduce:transition-none"

function OrbItem({
    orb, cx, size, opacity, bottom, isFeatured, featuredDesc,
}: {
    orb: { color: string; name: string }
    cx: number
    size: number
    opacity: number
    bottom: number
    isFeatured: boolean
    featuredDesc: string
}) {
    // Bottom-align sphere bases on one line; label band sits on the floor so size doesn’t shove the ball up.
    const orbBottom = bottom + ORB_LABEL_BAND_PX + ORB_SPHERE_TO_LABEL_GAP

    return (
        <>
            <div
                className="absolute rounded-full"
                style={{
                    left: cx - size / 2,
                    bottom: orbBottom,
                    width: size,
                    height: size,
                    background: orb.color,
                    opacity,
                }}
            />
            <div
                className="pointer-events-none absolute min-h-[4.25rem] w-[min(22rem,calc(100vw-2rem))]"
                style={{
                    left: cx,
                    bottom,
                    transform: "translateX(-50%)",
                    opacity,
                }}
            >
                <div
                    className={cn(
                        "absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center",
                        CAPTION_TRANSITION,
                        isFeatured
                            ? "translate-y-0 opacity-100"
                            : "pointer-events-none translate-y-2 opacity-0",
                    )}
                    aria-hidden={!isFeatured}
                >
                    <div className="text-sm font-medium whitespace-nowrap text-foreground">
                        {orb.name} ↗
                    </div>
                    <div className="w-full text-xs leading-snug text-muted-foreground">
                        {featuredDesc}
                    </div>
                </div>
                <span
                    className={cn(
                        "absolute inset-0 flex items-center justify-center px-2 text-center text-xs whitespace-nowrap text-foreground/60",
                        CAPTION_TRANSITION,
                        isFeatured
                            ? "pointer-events-none -translate-y-1 opacity-0"
                            : "translate-y-0 opacity-100",
                    )}
                    aria-hidden={isFeatured}
                >
                    {orb.name}
                </span>
            </div>
        </>
    )
}

function Hero() {
    const [activeTab, setActiveTab] = useState<keyof typeof allOrbs>("Students")
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = useState(900)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const ro = new ResizeObserver(() => setContainerWidth(el.offsetWidth))
        ro.observe(el)
        setContainerWidth(el.offsetWidth)
        return () => ro.disconnect()
    }, [])

    const slots = buildSlots(containerWidth)

    const orderRef = useRef([0, 1, 2, 3, 4])
    const [order, setOrder] = useState([0, 1, 2, 3, 4])
    const [progress, setProgress] = useState(0)

    const phaseRef = useRef<"pause" | "transition">("pause")
    const phaseStartRef = useRef<number | null>(null)
    const rafRef = useRef<number | null>(null)

    const resetCarousel = () => {
        orderRef.current = [0, 1, 2, 3, 4]
        setOrder([0, 1, 2, 3, 4])
        setProgress(0)
        phaseRef.current = "pause"
        phaseStartRef.current = null
    }

    useEffect(() => {
        const tick = (time: number) => {
            if (phaseStartRef.current === null) phaseStartRef.current = time
            const elapsed = time - phaseStartRef.current

            if (phaseRef.current === "pause") {
                if (elapsed >= PAUSE_MS) {
                    phaseRef.current = "transition"
                    phaseStartRef.current = time
                }
                setProgress(0)
            } else {
                const t = Math.min(elapsed / TRANSITION_MS, 1)
                setProgress(easeInOut(t))

                if (t >= 1) {
                    const next = [...orderRef.current.slice(1), orderRef.current[0]]
                    orderRef.current = next
                    setOrder([...next])
                    setProgress(0)
                    phaseRef.current = "pause"
                    phaseStartRef.current = time
                }
            }

            rafRef.current = requestAnimationFrame(tick)
        }

        rafRef.current = requestAnimationFrame(tick)
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    }, [activeTab])

    const orbs = allOrbs[activeTab]
    const meta = tabMeta[activeTab]
    const orbHeight =
        Math.max(...SLOT_SIZES) +
        ORB_CAROUSEL_FLOOR_PAD +
        ORB_LABEL_BAND_PX +
        ORB_SPHERE_TO_LABEL_GAP +
        40

    // Off-screen anchor points
    const leftEdgeCx  = slots[0].cx - slots[0].size / 2 - GAP - SLOT_SIZES[0] / 2
    const rightEdgeCx = slots[NUM_SLOTS - 1].cx + slots[NUM_SLOTS - 1].size / 2 + GAP + SLOT_SIZES[0] / 2

    return (
        <section className="min-h-svh bg-[#f5f5f0] px-8 pb-20 pt-32">
            <div className="mx-auto max-w-6xl">

                <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
                    <h1 className="font-heading max-w-xl text-5xl font-normal leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                        Where biology
                        <br />
                        meets data
                    </h1>

                    <div className="flex max-w-sm flex-col gap-8 lg:pb-2">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            SciTrek brings hands-on bioinformatics, chemistry, and biology
                            into K–12 classrooms. Students sequence DNA, analyze real data,
                            and think like scientists — guided by UCSB undergraduate mentors.
                        </p>
                        <div className="flex items-center gap-3">
                            <Button
                                size="lg"
                                className="rounded-full px-6 text-white border-0 hover:opacity-90 transition-opacity"
                                style={{
                                    background: "linear-gradient(135deg, #1a3a8a 0%, #5a8ee0 40%, #3a9e7b 100%)",
                                    boxShadow: "0 2px 20px rgba(90, 142, 224, 0.4)",
                                }}
                                onClick={() => router.push("/signup")}
                            >
                                Sign up
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-full border-0 bg-transparent px-6 text-foreground hover:opacity-80 transition-opacity"
                                style={{
                                    background: "linear-gradient(#f5f5f0, #f5f5f0) padding-box, linear-gradient(135deg, #5a8ee0, #3a9e7b, #c45090) border-box",
                                    border: "1.5px solid transparent",
                                }}
                                onClick={() => router.push("#modules")}
                            >
                                Learn more
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-20 rounded-2xl bg-[#eeede8] p-8">
                    <div className="mb-8 flex items-center gap-2 text-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab as keyof typeof allOrbs)
                                    resetCarousel()
                                }}
                                className={`rounded-full px-4 py-1.5 transition-all ${
                                    activeTab === tab
                                        ? "bg-white font-medium text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                        <div className="ml-auto text-right">
                            <div className="font-medium text-foreground">{meta.label}</div>
                            <div className="text-xs text-muted-foreground">{meta.description}</div>
                        </div>
                    </div>

                    <div
                        ref={containerRef}
                        className="relative w-full overflow-hidden"
                        style={{ height: orbHeight }}
                    >
                        {(() => {
                            const items: React.ReactNode[] = []
                            const incomingOrbIdx = order[0]

                            for (let slotIdx = 0; slotIdx < NUM_SLOTS; slotIdx++) {
                                const orbIdx = order[slotIdx]
                                const orb = orbs[orbIdx]
                                const fromSlot = slots[slotIdx]

                                let toCx: number
                                let toSize: number
                                let toOpacity: number

                                if (slotIdx === 0) {
                                    toCx = leftEdgeCx
                                    toSize = SLOT_SIZES[0]
                                    toOpacity = 0
                                } else {
                                    const toSlot = slots[slotIdx - 1]
                                    toCx = toSlot.cx
                                    toSize = toSlot.size
                                    toOpacity = toSlot.opacity
                                }

                                const cx =
                                    fromSlot.cx + (toCx - fromSlot.cx) * progress
                                const size =
                                    fromSlot.size + (toSize - fromSlot.size) * progress
                                const opacity =
                                    fromSlot.opacity +
                                    (toOpacity - fromSlot.opacity) * progress

                                items.push(
                                    <OrbItem
                                        key={`slot-${slotIdx}`}
                                        orb={orb}
                                        cx={cx}
                                        size={size}
                                        opacity={opacity}
                                        bottom={ORB_CAROUSEL_FLOOR_PAD}
                                        isFeatured={slotIdx === 2 && progress < 0.15}
                                        featuredDesc={meta.featuredDesc}
                                    />,
                                )
                            }

                            if (progress > 0) {
                                const toSlot = slots[NUM_SLOTS - 1]
                                const cx =
                                    rightEdgeCx + (toSlot.cx - rightEdgeCx) * progress
                                const size =
                                    SLOT_SIZES[0] +
                                    (toSlot.size - SLOT_SIZES[0]) * progress
                                const opacity = 0 + toSlot.opacity * progress

                                items.push(
                                    <OrbItem
                                        key="incoming"
                                        orb={orbs[incomingOrbIdx]}
                                        cx={cx}
                                        size={size}
                                        opacity={opacity}
                                        bottom={ORB_CAROUSEL_FLOOR_PAD}
                                        isFeatured={false}
                                        featuredDesc=""
                                    />,
                                )
                            }

                            return items
                        })()}
                    </div>
                </div>
            </div>
        </section>
    )
}

export { Hero }