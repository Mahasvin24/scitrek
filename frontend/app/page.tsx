import { Hero } from "@/components/hero"
import { Navbar } from "@/components/navbar"

export default function Page() {
  return (
    <main className="flex flex-col">
      <Navbar />
      <Hero />
    </main>
  )
}