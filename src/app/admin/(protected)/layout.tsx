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

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const user = await getCachedAdminUser(session.userId)

  if (!user || !['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT', 'VIEWER'].includes(user.role)) {
    redirect('/admin/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar isAdmin user={user} />
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <Header user={user} isAdmin />
        <main className="flex-1 overflow-y-auto pt-4 lg:pt-6 pb-24 lg:pb-6 px-3 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}
