"use client"

import { FormEvent, useState } from "react"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorText, setErrorText] = useState("")

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setErrorText("")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const body = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(body.error ?? "Login failed")
      }
      window.location.href = "/admin"
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f6fb] px-4">
      <section className="w-full max-w-md rounded-2xl border border-[#d4deec] bg-white p-6 shadow-[0_8px_24px_rgba(8,20,42,0.06)]">
        <h1 className="text-2xl font-black text-[#142438]">Admin Login</h1>
        <p className="mt-1 text-sm text-[#506178]">Sign in to access product management.</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-[#20354c]">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-lg border border-[#cfd9e7] px-3 py-2 text-sm outline-none"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-[#20354c]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-[#cfd9e7] px-3 py-2 text-sm outline-none"
              required
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[#193d63] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {errorText ? <p className="mt-3 text-sm font-semibold text-[#9a2d2d]">{errorText}</p> : null}
      </section>
    </main>
  )
}
