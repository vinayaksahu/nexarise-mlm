'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

function RegisterForm() {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    otpCode: '',
  })
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setForm(p => ({ ...p, referralCode: ref }))
  }, [searchParams])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  const handleSendOtp = async () => {
    setError('')
    setSuccessMsg('')

    if (!form.email || !form.email.includes('@')) {
      setError('Please enter a valid email address first.')
      return
    }

    setSendingOtp(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, purpose: 'REGISTRATION' }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP')
        return
      }

      setOtpSent(true)
      setCountdown(60)
      let msg = `OTP sent successfully to ${form.email}. Please check your inbox.`
      if (data.devOtp) {
        msg += ` (Dev/Test OTP: ${data.devOtp})`
      }
      setSuccessMsg(msg)
    } catch {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!form.otpCode || form.otpCode.length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.')
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
          referralCode: form.referralCode,
          otpCode: form.otpCode,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }
      router.push('/login?registered=true')
    } catch {
      setError('Something went wrong. Please try again.')
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
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl px-4 py-3">
              ✅ {successMsg}
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
            required
          />
          <Input
            label="Username"
            placeholder="johndoe"
            value={form.username}
            onChange={(e) => setForm(p => ({ ...p, username: e.target.value.toLowerCase() }))}
            required
          />

          <div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleSendOtp}
                loading={sendingOtp}
                disabled={sendingOtp || countdown > 0}
                className="mb-[2px] whitespace-nowrap text-xs h-10 border-primary/40 hover:bg-primary/20 text-primary-light"
              >
                {sendingOtp
                  ? 'Sending...'
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : otpSent
                  ? 'Resend OTP'
                  : 'Send OTP'}
              </Button>
            </div>
          </div>

          {otpSent && (
            <div className="animate-fade-in bg-primary/10 border border-primary/30 p-3 rounded-xl">
              <Input
                label="6-Digit Email OTP Code"
                placeholder="Enter 6-digit OTP code"
                maxLength={6}
                value={form.otpCode}
                onChange={(e) => setForm(p => ({ ...p, otpCode: e.target.value.replace(/\D/g, '') }))}
                required
              />
            </div>
          )}

          <Input
            label="Mobile (Optional)"
            placeholder="+91 9876543210"
            value={form.mobile}
            onChange={(e) => setForm(p => ({ ...p, mobile: e.target.value }))}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min 8 characters"
            value={form.password}
            onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={(e) => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
            required
          />
          <Input
            label="Referral Code"
            placeholder="Enter referral code"
            value={form.referralCode}
            onChange={(e) => setForm(p => ({ ...p, referralCode: e.target.value }))}
            required
          />

          <Button type="submit" loading={loading} className="w-full" size="lg" disabled={!otpSent}>
            {loading ? 'Verifying & Creating Account...' : 'Create Verified Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-primary-light font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <div className="animate-fade-in max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <img
          src="/images/nexarise-emblem.png"
          alt="NexaRise Logo"
          className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-xl animate-pulse"
        />
        <h1 className="text-3xl font-bold text-white">Create Account</h1>
        <p className="text-gray-400 mt-2">Join NexaRise with Email OTP Verification</p>
      </div>

      <Suspense fallback={<div className="text-center text-gray-400">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
