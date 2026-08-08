'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

function RegisterForm() {
  const [form, setForm] = useState({ name: '', username: '', email: '', mobile: '', password: '', confirmPassword: '', referralCode: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setForm(p => ({ ...p, referralCode: ref }))
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          username: form.username.toLowerCase(),
          email: form.email,
          mobile: form.mobile || undefined,
          password: form.password,
          referralCode: form.referralCode || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }
      router.push('/login?registered=true')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card variant="glass" hover={false}>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          <Input label="Full Name" placeholder="John Doe" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
          <Input label="Username" placeholder="johndoe" value={form.username} onChange={(e) => setForm(p => ({ ...p, username: e.target.value.toLowerCase() }))} required />
          <Input label="Email" type="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} required />
          <Input label="Mobile (Optional)" placeholder="+91 9876543210" value={form.mobile} onChange={(e) => setForm(p => ({ ...p, mobile: e.target.value }))} />
          <Input label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} required />
          <Input label="Confirm Password" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={(e) => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
          <Input label="Referral Code (Optional)" placeholder="Enter referral code" value={form.referralCode} onChange={(e) => setForm(p => ({ ...p, referralCode: e.target.value }))} />
          <Button type="submit" loading={loading} className="w-full" size="lg">Create Account</Button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-primary-light font-medium transition-colors">Sign In</Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 pulse-glow">N</div>
        <h1 className="text-3xl font-bold text-white">Create Account</h1>
        <p className="text-gray-400 mt-2">Join NexaRise and start growing</p>
      </div>
      
      <Suspense fallback={<div className="text-center text-gray-400">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
