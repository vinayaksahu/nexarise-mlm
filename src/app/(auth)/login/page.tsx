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
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 pulse-glow">N</div>
        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
        <p className="text-gray-400 mt-2">Sign in to your NexaRise account</p>
      </div>
      
      <Card variant="glass" hover={false}>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <Input label="Email or Username" placeholder="Enter your email or username" value={form.login} onChange={(e) => setForm(p => ({ ...p, login: e.target.value }))} required />
            <Input label="Password" type="password" placeholder="Enter your password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} required />
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-light transition-colors">Forgot password?</Link>
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary-light font-medium transition-colors">Create Account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
