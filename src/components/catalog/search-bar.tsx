"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div
        className={`flex items-center gap-3 rounded-2xl border px-5 py-3.5 transition-all duration-200 ${
          focused
            ? "border-foreground/20 bg-background shadow-lg shadow-primary/[0.04]"
            : "border-border bg-secondary/60"
        }`}
      >
        <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products, brands, categories..."
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted-foreground/10 text-muted-foreground transition-colors hover:bg-muted-foreground/20"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      {focused && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-background p-3 shadow-xl">
          <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Popular searches
          </p>
          <div className="flex flex-wrap gap-2">
            {["Headphones", "Watches", "Speakers", "Keyboards"].map((term) => (
              <button
                key={term}
                className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setQuery(term)
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
