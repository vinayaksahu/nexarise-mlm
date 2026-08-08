import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true, username: true, role: true },
  })

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header user={user} />
        <main className="flex-1 pt-4 lg:pt-6 pb-24 lg:pb-6 px-3 sm:px-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
