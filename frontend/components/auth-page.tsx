import Link from "next/link"

import { AuthForm } from "@/components/auth-form"
import { Navbar } from "@/components/navbar"

const copy = {
  login: {
    title: "Welcome back",
    lead: "Sign in to pick up where you left off with SciTrek modules and mentoring tools.",
  },
  signup: {
    title: "Join SciTrek",
    lead: "Create an account to access inquiry-based biology modules built for students, mentors, and teachers.",
    bullets: [
      "NGSS-aligned, hands-on modules",
      "Real genomic and lab datasets",
      "Guided by UCSB undergraduate mentors",
    ],
  },
} as const

type AuthPageProps = {
  mode: "login" | "signup"
}

function AuthPage({ mode }: AuthPageProps) {
  const isSignup = mode === "signup"
  const content = copy[mode]

  return (
    <main className="flex min-h-svh flex-col bg-[#f5f5f0]">
      <Navbar />
      <section className="mx-auto w-full max-w-6xl px-8 pb-16 pt-24">
        <Link
          href="/"
          className="font-heading mb-6 inline-flex w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to home
        </Link>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div className="max-w-lg space-y-6">
            <h1 className="font-heading text-4xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              {content.title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {content.lead}
            </p>
            {isSignup && "bullets" in content && (
              <ul className="space-y-3 text-sm text-foreground/80">
                {content.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full"
                      style={{
                        background:
                          "linear-gradient(135deg, #1a3a8a, #5a8ee0, #3a9e7b)",
                      }}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl bg-[#eeede8] p-8 shadow-sm sm:p-10">
            <AuthForm mode={mode} />
          </div>
        </div>
      </section>
    </main>
  )
}

export { AuthPage }
