'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [step, setStep] = useState<1 | 2>(1)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const router = useRouter()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid registered email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'PASSWORD_RESET' }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP')
        return
      }

      setStep(2)
      setCountdown(60)
      let msg = `OTP sent to ${email}. Please check your inbox.`
      if (data.devOtp) {
        msg += ` (Dev/Test OTP: ${data.devOtp})`
      }
      setSuccessMsg(msg)
    } catch {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit OTP code.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode, newPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to reset password.')
        return
      }

      setSuccessMsg('Your password has been reset successfully! Redirecting to login...')
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 2000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <img
          src="/images/nexarise-emblem.png"
          alt="NexaRise Logo"
          className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-xl animate-pulse"
        />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
        <p className="text-slate-400 mt-2 text-sm">
          {step === 1 ? 'Enter your registered email to receive an OTP code' : 'Verify OTP and set a new password'}
        </p>
      </div>

      <Card variant="glass" hover={false}>
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm rounded-xl px-4 py-3">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm rounded-xl px-4 py-3">
              ✅ {successMsg}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="enter@your-email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                {loading ? 'Sending OTP...' : 'Send Reset OTP Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex items-center justify-between text-xs text-slate-300 mb-2">
                <span>Email: <strong>{email}</strong></span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-primary hover:underline font-semibold"
                >
                  Change
                </button>
              </div>

              <Input
                label="6-Digit OTP Code"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                required
              />

              <div className="flex justify-end text-xs mb-1">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading || countdown > 0}
                  className="text-primary hover:text-primary-light transition-colors font-medium disabled:opacity-50"
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>

              <Input
                label="New Password"
                type="password"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" loading={loading} className="w-full" size="lg">
                {loading ? 'Updating Password...' : 'Reset Password & Sign In'}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            Remembered your password?{' '}
            <Link href="/login" className="text-primary hover:text-primary-light font-bold transition-colors">
              Back to Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
