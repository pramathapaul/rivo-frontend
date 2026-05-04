import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import api from '../services/api'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register, user } = useCart()
  const [step, setStep] = useState(1) // 1 = Email OTP, 2 = Create Password
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [timer, setTimer] = useState(0)

  const redirect = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (user) navigate(redirect)
  }, [user, navigate, redirect])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer(t => t - 1), 1000)
      return () => clearInterval(countdown)
    }
  }, [timer])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (name === 'password') calculatePasswordStrength(value)
  }

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(Math.min(4, strength))
  }

  const getPasswordStrengthLabel = () => {
    if (formData.password.length === 0) return ''
    if (passwordStrength <= 1) return 'Weak'
    if (passwordStrength === 2) return 'Fair'
    if (passwordStrength === 3) return 'Good'
    return 'Strong'
  }

  // Send OTP
  const handleSendOTP = async () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setOtpLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.post('/auth/send-otp', { email: formData.email })
      setOtpSent(true)
      setTimer(60)
      setSuccess(res.data.message || 'OTP sent to your email!')
      
      // For development: if OTP is returned in response
      if (res.data.otp) {
        console.log('📧 OTP:', res.data.otp)
        setSuccess('OTP sent! (Dev mode: check console for OTP)')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setOtpLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.post('/auth/verify-otp', { email: formData.email, otp })
      setIsEmailVerified(true)
      setSuccess('✅ Email verified successfully!')
      setStep(2)
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    if (timer > 0) return

    setOtpLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.post('/auth/resend-otp', { email: formData.email })
      setTimer(60)
      setSuccess(res.data.message || 'OTP resent!')
      if (res.data.otp) {
        console.log('📧 New OTP:', res.data.otp)
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  // Register
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isEmailVerified) {
      setError('Please verify your email first')
      return
    }
    if (!formData.name.trim()) {
      setError('Please enter your full name')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!acceptedTerms) {
      setError('Please accept the Terms & Conditions')
      return
    }

    setLoading(true)
    setError('')

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      navigate(redirect)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 py-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low rounded-2xl p-6 md:p-8"
        >
          <div className="text-center mb-6">
            <h2 className="font-headline text-3xl md:text-4xl font-black italic tracking-tighter mb-2">
              JOIN RIVO
            </h2>
            <p className="text-on-surface-variant">
              {step === 1 ? 'Verify your email to continue' : 'Create your account'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'bg-primary text-on-primary' : isEmailVerified ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container text-on-surface-variant'}`}>
              {isEmailVerified ? '✓' : '1'}
            </div>
            <div className="w-8 h-0.5 bg-outline-variant/30"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
              2
            </div>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="bg-error/10 border border-error/30 text-error p-3 rounded-lg mb-4 text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-sm flex-shrink-0">error</span>
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="bg-tertiary/10 border border-tertiary/30 text-tertiary p-3 rounded-lg mb-4 text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-sm flex-shrink-0">check_circle</span>
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Email & OTP */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Email</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                      <span className="material-symbols-outlined text-lg">mail</span>
                    </span>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                      disabled={otpSent}
                    />
                  </div>
                  <button
                    onClick={handleSendOTP}
                    disabled={otpLoading || otpSent}
                    className="px-4 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:scale-105 transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {otpLoading ? 'Sending...' : otpSent ? '✓ Sent' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <>
                  <div>
                    <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Enter OTP</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                          <span className="material-symbols-outlined text-lg">pin</span>
                        </span>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface text-center text-2xl tracking-[8px] font-bold focus:outline-none focus:border-primary"
                        />
                      </div>
                      <button
                        onClick={handleVerifyOTP}
                        disabled={otpLoading || otp.length !== 6}
                        className="px-4 py-3 bg-tertiary text-on-tertiary rounded-xl font-bold text-sm hover:scale-105 transition-all disabled:opacity-50 whitespace-nowrap"
                      >
                        {otpLoading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={handleResendOTP}
                      disabled={timer > 0}
                      className="text-xs text-primary hover:underline disabled:text-on-surface-variant disabled:no-underline"
                    >
                      {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Account Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Full Name *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                    <span className="material-symbols-outlined text-lg">person</span>
                  </span>
                  <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary" required />
                </div>
              </div>

              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Password *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                    <span className="material-symbols-outlined text-lg">lock</span>
                  </span>
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="Create a password" value={formData.password} onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength ? (passwordStrength <= 1 ? 'bg-error' : passwordStrength === 2 ? 'bg-yellow-500' : passwordStrength === 3 ? 'bg-primary' : 'bg-tertiary') : 'bg-surface-container-highest'}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-on-surface-variant">Strength: {getPasswordStrengthLabel()}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Confirm Password *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                    <span className="material-symbols-outlined text-lg">lock</span>
                  </span>
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-surface-container border rounded-xl text-on-surface focus:outline-none focus:border-primary ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-error' : 'border-outline-variant/20'}`} required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-error text-[10px] mt-1">Passwords do not match</p>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-2">
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-outline-variant bg-surface-container checked:bg-primary cursor-pointer" />
                <span className="text-sm text-on-surface-variant">I agree to the <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></span>
              </label>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-black text-lg uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2">
                {loading ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>Creating Account...</> : 'Create Account'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-outline-variant/20 text-center">
            <p className="text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link to={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-primary font-bold hover:underline">Sign In</Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RegisterPage
