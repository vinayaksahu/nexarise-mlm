import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true, username: true, role: true },
  })

  if (!user || !['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT', 'VIEWER'].includes(user.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar isAdmin />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header user={user} />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
