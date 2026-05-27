import Link from "next/link"

import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const modules = [
  {
    day: "Day 1",
    title: "Enzymes and Substrates",
    description: "Interactive fit-and-bind simulation with guided dialogue.",
    href: "/modules/day-1",
    status: "Available",
  },
  {
    day: "Day 2",
    title: "Reaction Rates",
    description: "Explore how temperature shifts enzyme performance.",
    href: "",
    status: "Coming soon",
  },
  {
    day: "Day 3",
    title: "pH and Activity",
    description: "Test enzyme behavior across acidic and basic ranges.",
    href: "",
    status: "Coming soon",
  },
  {
    day: "Day 4",
    title: "Inhibitors",
    description: "Compare competitive and non-competitive inhibition.",
    href: "",
    status: "Coming soon",
  },
  {
    day: "Day 5",
    title: "Cellular Pathways",
    description: "Follow enzyme chains inside a simple metabolic map.",
    href: "",
    status: "Coming soon",
  },
  {
    day: "Day 6",
    title: "Capstone Challenge",
    description: "Apply all concepts in a final simulation puzzle.",
    href: "",
    status: "Coming soon",
  },
]

export default function ModulesIndexPage() {
  return (
    <main className="flex min-h-svh flex-col bg-[#f5f5f0]">
      <Navbar />
      <section className="mx-auto w-full max-w-6xl px-8 pb-12 pt-24">
        <div className="space-y-4">
          <h1 className="font-heading text-4xl font-normal tracking-tight text-foreground sm:text-5xl">
            Modules
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Progress through daily biology activities.
          </p>
        </div>

        <Separator className="my-8 bg-foreground/10" />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const isAvailable = Boolean(module.href)

            return (
              <Card
                key={module.day}
                className="rounded-2xl border-0 bg-[#eeede8] ring-1 ring-foreground/10"
              >
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="secondary">{module.day}</Badge>
                    <span className="text-xs text-muted-foreground">{module.status}</span>
                  </div>
                  <CardTitle className="font-heading text-xl font-medium">
                    {module.title}
                  </CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent />
                <CardFooter>
                  {isAvailable ? (
                    <Button
                      size="sm"
                      className="rounded-full"
                      nativeButton={false}
                      render={<Link href={module.href} />}
                    >
                      Open module
                    </Button>
                  ) : (
                    <Button size="sm" className="rounded-full" disabled>
                      Locked
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>
    </main>
  )
}

