const TOKEN_KEY = "scitrek_token"

export const AUTH_CHANGE_EVENT = "scitrek-auth-change"

function notifyAuthChange() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  notifyAuthChange()
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  notifyAuthChange()
}
