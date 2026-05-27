"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ApiError, fetchPublicKey, login, register } from "@/lib/api"
import { setToken } from "@/lib/auth"
import { encryptPassword } from "@/lib/crypto"
import { cn } from "@/lib/utils"

const gradientButtonClass =
  "h-11 w-full rounded-full border-0 text-white hover:opacity-90 transition-opacity"

const gradientButtonStyle = {
  background: "linear-gradient(135deg, #1a3a8a 0%, #5a8ee0 40%, #3a9e7b 100%)",
  boxShadow: "0 2px 20px rgba(90, 142, 224, 0.4)",
}

const fieldInputClass =
  "h-11 rounded-xl border-white/60 bg-white px-3.5 text-base shadow-sm focus-visible:border-[#5a8ee0]/50 focus-visible:ring-[#5a8ee0]/25 dark:border-input dark:bg-card"

type AuthFormProps = {
  mode: "login" | "signup"
}

function readInputValue(event: React.ChangeEvent<HTMLInputElement>) {
  return event.currentTarget.value
}

function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const isSignup = mode === "signup"
  const formTitle = isSignup ? "Create your account" : "Sign in"
  const formDescription = isSignup
    ? "Choose a username and a secure password."
    : "Enter your username and password."
  const submitLabel = isSignup ? "Create account" : "Sign in"
  const alternateHref = isSignup ? "/login" : "/signup"
  const alternatePrompt = isSignup ? "Already have an account?" : "New to SciTrek?"
  const alternateAction = isSignup ? "Sign in" : "Create an account"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters")
      return
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    if (isSignup && password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const publicKey = await fetchPublicKey()
      const encryptedPassword = await encryptPassword(password, publicKey)

      if (isSignup) {
        await register(username.trim(), encryptedPassword)
        toast.success("Account created. You can sign in now.")
        router.push("/login")
      } else {
        const { access_token } = await login(username.trim(), encryptedPassword)
        setToken(access_token)
        toast.success("Signed in successfully")
        router.push("/modules/day-1")
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <header className="mb-8 space-y-2">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">
          {formTitle}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {formDescription}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="username" className="text-foreground/90">
            Username
          </Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            required
            minLength={3}
            placeholder="your.username"
            value={username}
            onChange={(e) => setUsername(readInputValue(e))}
            className={fieldInputClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground/90">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={8}
            placeholder={isSignup ? "At least 8 characters" : "Your password"}
            value={password}
            onChange={(e) => setPassword(readInputValue(e))}
            className={fieldInputClass}
          />
        </div>

        {isSignup && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground/90">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(readInputValue(e))}
              className={fieldInputClass}
            />
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className={cn(gradientButtonClass, "mt-2")}
          style={gradientButtonStyle}
        >
          {loading ? "Please wait…" : submitLabel}
        </Button>
      </form>

      <Separator className="my-8 bg-foreground/10" />

      <p className="text-center text-sm text-muted-foreground">
        {alternatePrompt}{" "}
        <Link
          href={alternateHref}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {alternateAction}
        </Link>
      </p>
    </div>
  )
}

export { AuthForm }
