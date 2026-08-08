import { PublicNav } from '@/components/layout/public-nav';
import { PublicFooter } from '@/components/layout/public-footer';

export const metadata = {
  title: 'Terms of Service | NexaRise',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />

      <main className="flex-grow py-16">
        <div className="container mx-auto px-4 max-w-4xl prose prose-slate dark:prose-invert">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last Updated: August 2026</p>

          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using the NexaRise platform, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">2. User Accounts</h2>
              <p className="text-muted-foreground">
                To use certain features of the platform, you must register for an account. You agree to provide accurate information and keep it updated. Users are restricted to one account per individual.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">3. Investments and Earnings</h2>
              <p className="text-muted-foreground">
                NexaRise provides a network marketing and investment platform. All stated ROI (Return on Investment) percentages are targets and subject to system performance. Past performance is not indicative of future results.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">4. Network Rules</h2>
              <p className="text-muted-foreground">
                Spamming, manipulation of the referral system, or creation of dummy accounts to game the commission structure will result in immediate account termination and forfeiture of funds.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">5. Platform Modifications</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice.
              </p>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
