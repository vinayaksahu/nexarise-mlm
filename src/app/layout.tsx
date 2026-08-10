import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

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
    <html lang="en" className={inter.className} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var suppress = function(e) {
                  var r = e && (e.reason || e.error);
                  var msg = String((r && (r.message || r)) || e.message || '');
                  var code = r && r.code;
                  if (code === 4001 || msg.includes('wallet') || msg.includes('account') || msg.includes('MetaMask') || msg.includes('unhandledRejection')) {
                    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
                    if (e.stopPropagation) e.stopPropagation();
                    if (e.preventDefault) e.preventDefault();
                    return true;
                  }
                };
                window.addEventListener('unhandledrejection', suppress, true);
                window.addEventListener('error', suppress, true);
                var _err = console.error;
                console.error = function() {
                  var msg = String(arguments[0] || '');
                  if (msg.includes('4001') || msg.includes('wallet must has at least one account')) return;
                  _err.apply(console, arguments);
                };
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
