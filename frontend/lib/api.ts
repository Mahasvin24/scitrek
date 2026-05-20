const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data.detail === "string") return data.detail
    if (Array.isArray(data.detail)) {
      return data.detail.map((d: { msg?: string }) => d.msg ?? "Error").join(", ")
    }
  } catch {
    /* ignore */
  }
  return res.statusText || "Request failed"
}

export async function fetchPublicKey(): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/public-key`)
  if (!res.ok) throw new ApiError("Could not load encryption key", res.status)
  const data = await res.json()
  return data.public_key as string
}

export async function register(
  username: string,
  encryptedPassword: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: encryptedPassword }),
  })
  if (!res.ok) throw new ApiError(await parseError(res), res.status)
}

export async function login(
  username: string,
  encryptedPassword: string,
): Promise<{ access_token: string; token_type: string }> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: encryptedPassword }),
  })
  if (!res.ok) throw new ApiError(await parseError(res), res.status)
  return res.json()
}

export async function fetchMe(token: string): Promise<{ username: string }> {
  const res = await fetch(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new ApiError(await parseError(res), res.status)
  return res.json()
}
