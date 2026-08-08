import { PublicNav } from '@/components/layout/public-nav';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Income Plan | NexaRise',
  description: 'Learn about the 4 powerful earning mechanisms at NexaRise.',
};

export default function IncomePlanPage() {
  const levelIncomes = [
    { level: 1, percent: '10%', requirement: '1 Direct Referral' },
    { level: 2, percent: '3%', requirement: '2 Direct Referrals' },
    { level: 3, percent: '2%', requirement: '3 Direct Referrals' },
    { level: 4, percent: '1%', requirement: '4 Direct Referrals' },
    { level: 5, percent: '1%', requirement: '5 Direct Referrals' },
    { level: 6, percent: '1%', requirement: '6 Direct Referrals' },
    { level: 7, percent: '0.5%', requirement: '7 Direct Referrals' },
    { level: 8, percent: '0.5%', requirement: '8 Direct Referrals' },
    { level: 9, percent: '0.5%', requirement: '9 Direct Referrals' },
    { level: 10, percent: '0.5%', requirement: '10 Direct Referrals' },
  ];

  const achievementRewards = [
    { rank: 'Star', volume: '$1,000', reward: '$25' },
    { rank: 'Bronze', volume: '$5,000', reward: '$125' },
    { rank: 'Silver', volume: '$10,000', reward: '$250' },
    { rank: 'Gold', volume: '$25,000', reward: '$625' },
    { rank: 'Platinum', volume: '$50,000', reward: '$1,250' },
    { rank: 'Diamond', volume: '$100,000', reward: '$2,500' },
    { rank: 'Blue Diamond', volume: '$250,000', reward: '$6,250' },
    { rank: 'Black Diamond', volume: '$500,000', reward: '$12,500' },
    { rank: 'Crown', volume: '$1,000,000', reward: '$25,000' },
    { rank: 'Crown Ambassador', volume: '$5,000,000', reward: '$100,000' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />

      <main className="flex-grow py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">NexaRise Income Plan</h1>
            <p className="text-xl text-muted-foreground">Four powerful ways to build your wealth.</p>
          </div>

          <div className="space-y-12">
            {/* 1. Daily ROI */}
            <section>
              <Card>
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="text-2xl text-primary">1. Daily Self ROI</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-lg mb-4">
                    Earn a consistent, automated return on your active investment packages.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Daily Return:</strong> 1.0% per day</li>
                    <li><strong>Duration:</strong> 200 Days</li>
                    <li><strong>Total Return:</strong> 200% (Includes Principal)</li>
                    <li><strong>Investment Range:</strong> $5.00 to $1,000.00</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* 2. Level Income */}
            <section>
              <Card>
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="text-2xl text-primary">2. Level Referral Commission</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-lg mb-4">
                    Earn instant commissions when your team members make an investment. Build deep to unlock up to 10 levels of commissions.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 font-semibold">Level</th>
                          <th className="py-3 px-4 font-semibold">Commission</th>
                          <th className="py-3 px-4 font-semibold">Qualification Requirement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {levelIncomes.map((item) => (
                          <tr key={item.level} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="py-3 px-4">Level {item.level}</td>
                            <td className="py-3 px-4 font-bold text-green-500">{item.percent}</td>
                            <td className="py-3 px-4 text-muted-foreground">{item.requirement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 3. Achievement Rewards */}
            <section>
              <Card>
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="text-2xl text-primary">3. Achievement Rewards</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-lg mb-4">
                    Hit business volume milestones across your entire downline to unlock one-time cash bonuses.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievementRewards.map((reward, i) => (
                      <div key={i} className="flex justify-between items-center p-4 border rounded-lg bg-muted/20">
                        <div>
                          <p className="font-bold">{reward.rank}</p>
                          <p className="text-sm text-muted-foreground">Volume: {reward.volume}</p>
                        </div>
                        <div className="text-xl font-bold text-primary">
                          {reward.reward}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 4. P2P Wallet Transfer */}
            <section>
              <Card>
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="text-2xl text-primary">4. Instant P2P Wallet Transfers</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-lg mb-4">
                    Move your funds instantly between NexaRise members. Use your Main Wallet balance to help new members activate their accounts instantly.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Speed:</strong> Instant, zero-delay processing</li>
                    <li><strong>Transfer Fee:</strong> Only 2% flat fee</li>
                    <li><strong>Convenience:</strong> Bypass external crypto network fees and delays</li>
                  </ul>
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-6">Start Building Your Empire Today</h3>
            <Link href="/register">
              <Button size="lg" className="px-12 py-6 text-lg rounded-full">
                Register Now
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
