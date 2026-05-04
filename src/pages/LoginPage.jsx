import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, user } = useCart()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const redirect = searchParams.get('redirect') || '/'
  const verified = searchParams.get('verified')

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirect)
    }
  }, [user, navigate, redirect])

  // Show verification pending message
  useEffect(() => {
    if (verified === 'pending') {
      setSuccessMessage('✅ Account created! Please check your email to verify your account.')
    }
  }, [verified])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')
    
    try {
      await login(email, password)
      navigate(redirect)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="font-headline text-3xl md:text-4xl font-black italic tracking-tighter mb-2">
              WELCOME BACK
            </h2>
            <p className="text-on-surface-variant">Sign in to your RIVO account</p>
          </div>
          
          {/* Success Message for Verification */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-tertiary/10 border border-tertiary/30 text-tertiary p-4 rounded-lg mb-4 text-sm flex items-start gap-2"
            >
              <span className="material-symbols-outlined text-lg flex-shrink-0">mark_email_unread</span>
              <div>
                <p className="font-bold">Verify Your Email</p>
                <p className="text-xs mt-1">{successMessage}</p>
                <p className="text-xs text-on-surface-variant mt-2">Didn't receive the email? Check your spam folder or contact support.</p>
              </div>
            </motion.div>
          )}
          
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-error/10 border border-error/30 text-error p-3 rounded-lg mb-4 text-sm flex items-start gap-2"
            >
              <span className="material-symbols-outlined text-sm flex-shrink-0">error</span>
              <span>{error}</span>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                  <span className="material-symbols-outlined text-lg">lock</span>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-outline-variant bg-surface-container checked:bg-primary cursor-pointer"
                />
                <span className="text-xs text-on-surface-variant">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-black text-lg uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>
          
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-surface-container-low text-on-surface-variant uppercase tracking-wider">
                New to RIVO?
              </span>
            </div>
          </div>
          
          {/* Register Link */}
          <Link
            to={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
            className="w-full py-4 border-2 border-primary/30 text-primary font-headline font-bold text-lg uppercase tracking-wider rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">person_add</span>
            Create Account
          </Link>
          
          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Home
            </Link>
          </div>
        </motion.div>
        
        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-3 gap-3 text-center"
        >
          <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-xl p-3 border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary text-2xl mb-1">local_shipping</span>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Free Shipping</p>
            <p className="text-xs font-bold text-primary">Over ₹1000</p>
          </div>
          <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-xl p-3 border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary text-2xl mb-1">verified</span>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Secure</p>
            <p className="text-xs font-bold text-primary">Checkout</p>
          </div>
          <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-xl p-3 border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary text-2xl mb-1">support_agent</span>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">24/7</p>
            <p className="text-xs font-bold text-primary">Support</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
