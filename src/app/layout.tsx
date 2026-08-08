import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: {
    default: 'NexaRise — Connect. Grow. Prosper.',
    template: '%s | NexaRise',
  },
  description: 'NexaRise is a premium investment platform. Build your network, earn daily ROI, and grow together.',
  keywords: ['investment', 'ROI', 'network', 'growth', 'income'],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
