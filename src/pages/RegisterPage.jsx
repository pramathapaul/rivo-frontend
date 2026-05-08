import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register, user } = useCart()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const redirect = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (user) navigate(redirect)
  }, [user, navigate, redirect])

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

  const validateForm = () => {
    if (!formData.name.trim()) { setError('Please enter your full name'); return false }
    if (formData.name.trim().length < 2) { setError('Name must be at least 2 characters'); return false }
    if (!formData.email.trim()) { setError('Please enter your email'); return false }
    if (!/\S+@\S+\.\S+/.test(formData.email)) { setError('Please enter a valid email'); return false }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return false }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return false }
    if (!acceptedTerms) { setError('Please accept the Terms & Conditions'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
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
            <p className="text-on-surface-variant">Create your account and start shopping</p>
          </div>
          
          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="bg-error/10 border border-error/30 text-error p-3 rounded-lg mb-4 text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{error}</span>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Full Name *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                  <span className="material-symbols-outlined text-lg">person</span>
                </span>
                <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary" required />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Email *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </span>
                <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary" required />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Password *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                  <span className="material-symbols-outlined text-lg">lock</span>
                </span>
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Create a password (min. 6 characters)" value={formData.password} onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className={`h-1.5 flex-1 rounded-full ${
                        level <= passwordStrength 
                          ? (passwordStrength <= 1 ? 'bg-error' : passwordStrength === 2 ? 'bg-yellow-500' : passwordStrength === 3 ? 'bg-primary' : 'bg-tertiary') 
                          : 'bg-surface-container-highest'
                      }`} />
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
            
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-outline-variant bg-surface-container checked:bg-primary cursor-pointer" />
                <span className="text-sm text-on-surface-variant">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </span>
              </label>
            </div>
            
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-black text-lg uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2">
              {loading ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>Creating Account...</> : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-outline-variant/20 text-center">
            <p className="text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link to={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-primary font-bold hover:underline">Sign In</Link>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Home
            </Link>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-3 gap-3 text-center">
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

export default RegisterPage
