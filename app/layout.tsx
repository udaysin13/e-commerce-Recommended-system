import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'FluxCart AI Commerce',
  description:
    'FluxCart is an AI-powered ecommerce recommendation platform with personalized product discovery and streamlined checkout.',
  generator: 'FluxCart',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: '!border-border !bg-slate-950 !text-slate-50',
              description: '!text-slate-300',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
