import Link from "next/link"
import { SearchX } from "lucide-react"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-12">
      <div className="glass-panel premium-ring w-full rounded-[2rem] p-8 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500/15 text-indigo-200">
          <SearchX className="h-8 w-8" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
          Not Found
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
          We couldn&apos;t find that page.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The product or route you requested may have moved, expired, or never existed.
        </p>
        <Link
          href="/"
          className="premium-button mt-8 inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-400 hover:shadow-[0_18px_42px_rgba(99,102,241,0.35)]"
        >
          Back to storefront
        </Link>
      </div>
    </main>
  )
}
