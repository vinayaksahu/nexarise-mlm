import { PublicNav } from '@/components/layout/public-nav';
import { PublicFooter } from '@/components/layout/public-footer';
import { AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Risk Disclosure | NexaRise',
};

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />

      <main className="flex-grow py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
            <h1 className="text-4xl font-bold">Risk Disclosure</h1>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-10 text-yellow-700 dark:text-yellow-400">
            <p className="font-semibold text-lg">Important Notice</p>
            <p className="mt-2">Participation in network marketing and digital investments involves significant risk of loss and is not suitable for everyone. Please read the following carefully.</p>
          </div>

          <section className="space-y-6 prose prose-slate dark:prose-invert max-w-none">
            <div>
              <h2 className="text-2xl font-semibold mb-3">1. No Guarantees of Profit</h2>
              <p className="text-muted-foreground">
                While NexaRise aims to provide consistent 1.0% daily returns based on system algorithms and network growth, there are no absolute guarantees of profit. System payouts depend on continuous network health and prevailing market conditions.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">2. Digital Asset Volatility</h2>
              <p className="text-muted-foreground">
                If funding your account using cryptocurrency (e.g., USDT, Bitcoin), understand that digital assets can be highly volatile. Fluctuations in the underlying asset's value outside the platform may affect the real-world value of your portfolio.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">3. Personal Responsibility</h2>
              <p className="text-muted-foreground">
                You are solely responsible for evaluating the merits and risks associated with the use of our platform. Do not invest money that you cannot afford to lose. We strongly advise consulting with a certified financial advisor before participating.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">4. Regulatory Risks</h2>
              <p className="text-muted-foreground">
                Network marketing and digital asset platforms exist in a changing regulatory landscape. Future regulatory actions by global authorities could impact the operation of the NexaRise platform. You agree to bear the risk of any regulatory changes.
              </p>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
