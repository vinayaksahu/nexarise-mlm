'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminLoginPage() {
  const [form, setForm] = useState({ login: '', password: '' })
  const [error, setError] = useState('')
  const [isMemberRedirect, setIsMemberRedirect] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsMemberRedirect(false)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isAdminPortal: true }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Admin authentication failed')
        if (data.error && data.error.includes('member login page')) {
          setIsMemberRedirect(true)
        }
        return
      }

      router.push(data.redirectUrl || '/admin')
      router.refresh()
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 animate-fade-in">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/images/nexarise-emblem.png"
            alt="NexaRise Logo"
            className="w-20 h-20 object-contain mx-auto shadow-2xl drop-shadow-xl animate-pulse"
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-white">NexaRise Admin Portal</h1>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
            Restricted Management Console
          </p>
        </div>

        <Card className="bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm rounded-xl p-4 space-y-2 animate-fade-in">
                  <p className="font-semibold flex items-center gap-1.5">
                    <span>⚠️</span> {error}
                  </p>
                  {isMemberRedirect && (
                    <Link 
                      href="/login" 
                      className="inline-block px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm mt-1"
                    >
                      Go to Member Login →
                    </Link>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Admin Username or Email
                </label>
                <Input
                  placeholder="e.g. superadmin"
                  value={form.login}
                  onChange={(e) => setForm(p => ({ ...p, login: e.target.value }))}
                  required
                  className="w-full text-sm py-2.5 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Master Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  className="w-full text-sm py-2.5 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold py-3 text-sm rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Authenticating Admin Credentials...' : '🔐 Login to Admin Portal'}
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 text-center">
              <Link 
                href="/login" 
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1 font-medium"
              >
                <span>⬅️</span> Return to Regular Member Login
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-slate-500 font-mono">
          NexaRise MLM Enterprise Console • Unauthorized access is strictly logged & audited.
        </p>
      </div>
    </div>
  )
}
