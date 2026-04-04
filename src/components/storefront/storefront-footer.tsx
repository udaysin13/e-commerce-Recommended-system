"use client"

import Link from "next/link"
import { Instagram, Linkedin, Twitter } from "lucide-react"

const footerGroups = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/wishlist", label: "Saved items" },
      { href: "/cart", label: "Bag" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/orders", label: "Track order" },
      { href: "/profile", label: "Account" },
      { href: "/", label: "Shipping & returns" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/", label: "Our story" },
      { href: "/", label: "Journal" },
      { href: "/", label: "Contact" },
    ],
  },
]

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://twitter.com", label: "Twitter", icon: Twitter },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
]

export function StorefrontFooter() {
  return (
    <footer className="mt-20 border-t border-border/80 bg-[#f2ebe1]">
      <div className="page-shell py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow">FluxCart AI</p>
            <h2 className="mt-4 max-w-lg font-serif text-4xl leading-none tracking-tight text-foreground">
              A recommendation-first marketplace that explains every suggestion.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Built to make personalization understandable through premium presentation, stable commerce flows,
              and clear recommendation reasoning.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="market-button-secondary h-11 w-11 rounded-full px-0"
                  aria-label={item.label}
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                  {group.title}
                </h3>
                <div className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block text-sm text-foreground/80 transition hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 FluxCart. All rights reserved.</p>
          <p>Secure checkout. Clear delivery timelines. Helpful support.</p>
        </div>
      </div>
    </footer>
  )
}
