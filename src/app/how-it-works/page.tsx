import { PublicNav } from '@/components/layout/public-nav';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserPlus, Wallet, Rocket, TrendingUp, RefreshCcw } from 'lucide-react';

export const metadata = {
  title: 'How It Works | NexaRise',
  description: 'Step-by-step guide to starting with NexaRise.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      icon: UserPlus,
      title: 'Step 1: Create Account',
      desc: 'Register for free using a sponsor referral code. Your sponsor will guide you through the process and help you build your network.',
    },
    {
      icon: Wallet,
      title: 'Step 2: Add Funds',
      desc: 'Deposit funds into your secure NexaRise wallet. We support multiple payment methods including USDT, Bank Transfers, and UPI.',
    },
    {
      icon: Rocket,
      title: 'Step 3: Activate Plan',
      desc: 'Choose an investment amount between $5 and $1,000. Your principal is locked in, and your daily ROI begins generating immediately.',
    },
    {
      icon: TrendingUp,
      title: 'Step 4: Earn & Grow',
      desc: 'Receive your 1.0% daily ROI automatically. Share your referral link to build your downline and earn up to 10 levels of commissions.',
    },
    {
      icon: RefreshCcw,
      title: 'Step 5: Withdraw or Transfer',
      desc: 'Withdraw your earnings to your external crypto/bank account, or transfer them instantly to other members via P2P (2% fee).',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />

      <main className="flex-grow py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
            <p className="text-xl text-muted-foreground">Five simple steps to start earning with NexaRise.</p>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/50 before:to-transparent">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-background bg-primary/20 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute md:relative left-0 md:left-auto md:mx-auto z-10">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Card className="w-[calc(100%-5rem)] md:w-[calc(50%-2.5rem)] ml-auto md:ml-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.desc}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          <div className="mt-20 text-center bg-card border rounded-2xl p-10 shadow-sm">
            <h3 className="text-2xl font-bold mb-4">Ready to take the first step?</h3>
            <p className="text-muted-foreground mb-8">Join our community and start your journey to financial freedom.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">Register Now</Button>
              </Link>
              <Link href="/faq">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">Read FAQ</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
