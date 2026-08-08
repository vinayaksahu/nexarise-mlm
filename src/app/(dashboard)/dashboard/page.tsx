import { Card, CardContent } from '@/components/ui/card'

const stats = [
  { label: 'Total Balance', value: '$0.00', icon: '💰', color: 'from-primary to-indigo-400' },
  { label: 'Total Investment', value: '$0.00', icon: '📈', color: 'from-emerald-500 to-teal-400' },
  { label: 'Active Investment', value: '$0.00', icon: '🔥', color: 'from-orange-500 to-amber-400' },
  { label: "Today's ROI", value: '$0.00', icon: '⚡', color: 'from-cyan-500 to-blue-400' },
  { label: "Today's Level Income", value: '$0.00', icon: '🏆', color: 'from-purple-500 to-violet-400' },
  { label: 'Total Income', value: '$0.00', icon: '💎', color: 'from-pink-500 to-rose-400' },
  { label: 'Total Withdrawals', value: '$0.00', icon: '📤', color: 'from-slate-500 to-gray-400' },
  { label: 'Team Members', value: '0', icon: '👥', color: 'from-teal-500 to-emerald-400' },
  { label: 'Direct Referrals', value: '0', icon: '🔗', color: 'from-blue-500 to-indigo-400' },
  { label: 'Strong Leg', value: '$0.00', icon: '💪', color: 'from-green-500 to-emerald-400' },
  { label: 'Weak Leg', value: '$0.00', icon: '📊', color: 'from-amber-500 to-yellow-400' },
  { label: 'Next Reward', value: '$200', icon: '🎁', color: 'from-rose-500 to-pink-400' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Welcome back! Here's your overview.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={stat.label} className="relative overflow-hidden" style={{ animationDelay: `${i * 50}ms` }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
            <CardContent className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} opacity-20`} />
              </div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Transactions Placeholder */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
          <div className="text-center py-8 text-muted">
            <p className="text-4xl mb-2">📋</p>
            <p>No transactions yet</p>
            <p className="text-xs mt-1">Your recent transactions will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
