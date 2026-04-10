"use client";

import Link from "next/link";
import { useState } from "react";
import { authenticateUser } from "../lib/api";

const demoAccounts = [
  { email: "alice@example.com", password: "alice123" },
  { email: "bob@example.com", password: "bob123" },
];

export default function LoginClient() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: demoAccounts[0].email,
    password: demoAccounts[0].password,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authenticateUser({
        mode,
        email: form.email.trim(),
        password: form.password,
      });

      if (typeof window !== "undefined") {
        window.localStorage.setItem("shopwise-user", JSON.stringify(response.user));
      }

      setSuccess(response.message || (mode === "login" ? "Login successful" : "Signup successful"));
    } catch (submitError) {
      setError(submitError.message || "Unable to complete authentication.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-8 text-white shadow-xl sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-200">
            Account Access
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
            Login to keep your recommendations personal.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-blue-100/90">
            Use one of the demo accounts below or create a new account. Your activity helps the
            recommendation engine tailor products more closely to your interests.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setMode("login");
                  setForm(account);
                  setError("");
                  setSuccess("");
                }}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 text-left transition hover:bg-white/15"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Demo account</p>
                <p className="mt-3 font-semibold text-white">{account.email}</p>
                <p className="mt-1 text-sm text-blue-100/80">{account.password}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                mode === "login" ? "bg-blue-600 text-white" : "text-slate-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setSuccess("");
              }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                mode === "signup" ? "bg-blue-600 text-white" : "text-slate-700"
              }`}
            >
              Sign up
            </button>
          </div>

          <h2 className="mt-6 text-3xl font-bold text-slate-900">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {mode === "login"
              ? "Sign in to continue exploring personalized product suggestions."
              : "Create a new account and start building your recommendation profile."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your password"
                required
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            &larr; Back to home
          </Link>
        </section>
      </div>
    </main>
  );
}
