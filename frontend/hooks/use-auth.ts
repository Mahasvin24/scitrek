"use client"

import { useCallback, useEffect, useState } from "react"

import { fetchMe } from "@/lib/api"
import { AUTH_CHANGE_EVENT, clearToken, getToken } from "@/lib/auth"

export function useAuth() {
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUsername(null)
      setLoading(false)
      return
    }

    try {
      const data = await fetchMe(token)
      setUsername(data.username)
    } catch {
      clearToken()
      setUsername(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    function onAuthChange() {
      setLoading(true)
      refresh()
    }

    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange)
    window.addEventListener("storage", onAuthChange)

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange)
      window.removeEventListener("storage", onAuthChange)
    }
  }, [refresh])

  const logout = useCallback(() => {
    clearToken()
    setUsername(null)
    setLoading(false)
  }, [])

  return { username, loading, logout }
}
