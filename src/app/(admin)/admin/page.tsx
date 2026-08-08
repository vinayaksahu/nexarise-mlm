import { Card, CardContent } from '@/components/ui/card'

const adminStats = [
  { label: 'Total Users', value: '0', icon: '👥' },
  { label: 'Active Users', value: '0', icon: '✅' },
  { label: 'Total Investment', value: '$0', icon: '💰' },
  { label: 'Active Investment', value: '$0', icon: '🔥' },
  { label: 'Total Deposits', value: '$0', icon: '📥' },
  { label: 'Pending Deposits', value: '0', icon: '⏳' },
  { label: 'Total Withdrawals', value: '$0', icon: '📤' },
  { label: 'Pending Withdrawals', value: '0', icon: '⏳' },
  { label: 'ROI Distributed', value: '$0', icon: '📈' },
  { label: 'Level Income', value: '$0', icon: '🏆' },
  { label: 'Rewards Paid', value: '$0', icon: '🎁' },
  { label: 'Total Business', value: '$0', icon: '💎' },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-muted text-sm mt-1">System overview and management</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {adminStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
