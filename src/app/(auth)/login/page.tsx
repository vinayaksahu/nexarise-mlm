'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function LoginPage() {
  const [form, setForm] = useState({ login: '', password: '' })
  const [error, setError] = useState('')
  const [isAdminRedirect, setIsAdminRedirect] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsAdminRedirect(false)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isAdminPortal: false }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        if (data.error && data.error.includes('/admin/login')) {
          setIsAdminRedirect(true)
        }
        return
      }
      router.push(data.redirectUrl || '/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 pulse-glow shadow-lg">N</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
        <p className="text-slate-400 mt-2 text-sm">Sign in to your NexaRise account</p>
      </div>
      
      <Card variant="glass" hover={false}>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm rounded-xl px-4 py-3 space-y-2">
                <p>⚠️ {error}</p>
                {isAdminRedirect && (
                  <Link 
                    href="/admin/login" 
                    className="inline-block px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    Go to Admin Login Portal →
                  </Link>
                )}
              </div>
            )}
            <Input 
              label="Email or Username" 
              placeholder="Enter your email or username" 
              value={form.login} 
              onChange={(e) => setForm(p => ({ ...p, login: e.target.value }))} 
              required 
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="Enter your password" 
              value={form.password} 
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} 
              required 
            />
            <div className="flex justify-end text-xs">
              <Link href="/forgot-password" className="text-primary hover:text-primary-light transition-colors font-medium">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary-light font-bold transition-colors">Create Account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
