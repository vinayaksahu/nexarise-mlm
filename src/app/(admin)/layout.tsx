import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { cache } from 'react'

const getCachedAdminUser = cache(async (userId: string) => {
  return db.user.findUnique({
    where: { id: userId },
    select: { name: true, username: true, role: true },
  })
})

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await getCachedAdminUser(session.userId)

  if (!user || !['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT', 'VIEWER'].includes(user.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 overflow-x-hidden">
      <Sidebar isAdmin />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Header user={user} isAdmin />
        <main className="flex-1 pt-4 lg:pt-6 pb-24 lg:pb-6 px-3 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}
