import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/images/nexarise-emblem.png" alt="NexaRise Logo" className="h-6 w-6 object-contain shrink-0" />
              <span className="font-bold text-lg tracking-tight">NexaRise</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect. Grow. Prosper.
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Next-generation network marketing platform designed to build wealth securely and transparently.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/income-plan" className="text-muted-foreground hover:text-foreground transition-colors">Income Plan</Link></li>
              <li><Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link></li>
              <li><Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors">Register</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/risk-disclosure" className="text-muted-foreground hover:text-foreground transition-colors">Risk Disclosure</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© 2026 NexaRise. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
