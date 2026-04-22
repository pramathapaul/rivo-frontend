import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartDrawer from './CartDrawer'
import SearchModal from './SearchModal'
import logo from '../assets/logo.png'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const { getTotalItems, isCartOpen, setIsCartOpen, user, logout } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu') && !e.target.closest('.user-menu-btn')) {
        setShowUserMenu(false)
      }
      if (!e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-btn')) {
        setShowMobileMenu(false)
      }
    }
    if (showUserMenu || showMobileMenu) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showUserMenu, showMobileMenu])

  useEffect(() => {
    setShowMobileMenu(false)
  }, [location])

  const navLinks = [
    { path: '/', label: 'Drops' },
    { path: '/collections', label: 'Collections' },
    { path: '/customize', label: 'Custom Lab' }
  ]

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    navigate('/')
  }

  const toggleUserMenu = (e) => {
    e.stopPropagation()
    setShowUserMenu(!showUserMenu)
    setShowMobileMenu(false)
  }

  const toggleMobileMenu = (e) => {
    e.stopPropagation()
    setShowMobileMenu(!showMobileMenu)
    setShowUserMenu(false)
  }

  return (
    <>
      <nav className={`fixed top-0 w-full z-40 transition-all ${scrolled ? 'py-3 shadow-xl shadow-cyan-500/5' : 'py-4 md:py-6'} md:bg-[#0e0e10]/80 md:backdrop-blur-md md:glass-effect bg-[#0e0e10] border-b border-outline-variant/20 md:border-none`}>
        <div className="flex justify-between items-center px-4 md:px-10 w-full max-w-[1920px] mx-auto">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform">
            <img 
              src={logo} 
              alt="RIVO Logo" 
              className="h-8 md:h-11 w-auto max-w-[120px] md:max-w-[160px] object-contain"
            />
            <span className="text-xl md:text-3xl font-black italic tracking-tighter text-[#f9f5f8] font-headline">
              RIVO
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 font-headline tracking-tight">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`transition-colors ${location.pathname === link.path ? 'text-[#f9f5f8] font-bold border-b-2 border-primary-fixed pb-1' : 'text-[#adaaad] hover:text-[#f9f5f8]'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* Right Icons */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Search Button */}
            <button 
              onClick={() => setShowSearchModal(true)}
              className="text-[#adaaad] hover:text-[#f9f5f8] transition-all hover:scale-110 p-1"
              aria-label="Search"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            
            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="text-[#adaaad] hover:text-[#f9f5f8] transition-all hover:scale-110 relative p-1"
              aria-label="Cart"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
            
            {/* User Menu - Desktop */}
            <div className="hidden md:block relative">
              {user ? (
                <>
                  <button 
                    onClick={toggleUserMenu} 
                    className="user-menu-btn text-[#adaaad] hover:text-[#f9f5f8] transition-all hover:scale-110 flex items-center gap-1 p-1"
                    aria-label="User menu"
                  >
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-xs font-bold text-primary-fixed hidden lg:inline">
                      {user.name?.split(' ')[0]}
                    </span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="user-menu absolute right-0 mt-3 w-56 bg-surface-container-high rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden z-50">
                      <div className="p-4 border-b border-outline-variant/15">
                        <p className="font-headline font-bold text-on-surface">{user.name}</p>
                        <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          user.role === 'admin' ? 'bg-primary/20 text-primary-fixed' : 
                          user.role === 'designer' ? 'bg-secondary/20 text-secondary' : 
                          'bg-tertiary/20 text-tertiary'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      
                      <div className="py-2">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
                          <span className="material-symbols-outlined text-xl">account_circle</span>
                          My Profile
                        </Link>
                        <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
                          <span className="material-symbols-outlined text-xl">inventory</span>
                          My Orders
                        </Link>
                        <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
                          <span className="material-symbols-outlined text-xl">favorite</span>
                          Wishlist
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                            Admin Dashboard
                          </Link>
                        )}
                        {user.role === 'designer' && (
                          <Link to="/designer" className="flex items-center gap-3 px-4 py-3 text-sm text-secondary hover:bg-secondary/10 transition-colors">
                            <span className="material-symbols-outlined text-xl">design_services</span>
                            Designer Studio
                          </Link>
                        )}
                      </div>
                      
                      <div className="border-t border-outline-variant/15 py-2">
                        <button 
                          onClick={handleLogout} 
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">logout</span>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="text-[#adaaad] hover:text-[#f9f5f8] transition-all hover:scale-110 p-1"
                  aria-label="Sign In"
                >
                  <span className="material-symbols-outlined">person</span>
                </Link>
              )}
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={toggleMobileMenu} 
              className="mobile-menu-btn md:hidden text-[#adaaad] hover:text-[#f9f5f8] transition-all p-1"
              aria-label="Menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {showMobileMenu ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        {/* Mobile Menu Drawer */}
        <div className={`mobile-menu md:hidden fixed top-0 right-0 h-full w-80 bg-[#131315] z-50 transform transition-transform duration-300 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="p-6 border-b border-outline-variant/20">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <img src={logo} alt="RIVO" className="h-7 w-auto max-w-[100px] object-contain" />
                  <span className="text-xl font-black italic font-headline text-primary-fixed">RIVO</span>
                </div>
                <button 
                  onClick={() => setShowMobileMenu(false)} 
                  className="text-on-surface-variant hover:text-on-surface p-1"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              {/* Mobile User Info */}
              {user ? (
                <div className="flex items-center gap-3 p-3 bg-[#1f1f22] rounded-xl">
                  <span className="material-symbols-outlined text-3xl text-primary">account_circle</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      user.role === 'admin' ? 'bg-primary/20 text-primary-fixed' : 
                      user.role === 'designer' ? 'bg-secondary/20 text-secondary' : 
                      'bg-tertiary/20 text-tertiary'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link 
                    to="/login" 
                    className="flex items-center gap-3 p-3 bg-[#1f1f22] rounded-xl"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="material-symbols-outlined text-3xl text-primary">login</span>
                    <div>
                      <p className="font-bold text-sm">Sign In</p>
                      <p className="text-xs text-on-surface-variant">Access your account</p>
                    </div>
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl border border-primary/30"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="material-symbols-outlined text-3xl text-primary">person_add</span>
                    <div>
                      <p className="font-bold text-sm text-primary">Create Account</p>
                      <p className="text-xs text-on-surface-variant">Join RIVO today</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile Navigation Links */}
            <div className="flex-1 py-6 overflow-y-auto">
              {navLinks.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-4 px-6 py-4 text-lg font-headline transition-colors ${
                    location.pathname === link.path 
                      ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                      : 'text-on-surface-variant hover:bg-[#1f1f22] hover:text-on-surface'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* Mobile Menu Footer */}
            <div className="p-6 border-t border-outline-variant/20 space-y-2">
              <button 
                onClick={() => {
                  setShowMobileMenu(false)
                  setShowSearchModal(true)
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-on-surface-variant hover:bg-[#1f1f22] rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined">search</span>
                <span>Search</span>
              </button>
              
              {user && (
                <>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 w-full px-4 py-3 text-on-surface-variant hover:bg-[#1f1f22] rounded-xl transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="material-symbols-outlined">account_circle</span>
                    <span>My Profile</span>
                  </Link>
                  <Link 
                    to="/orders" 
                    className="flex items-center gap-3 w-full px-4 py-3 text-on-surface-variant hover:bg-[#1f1f22] rounded-xl transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="material-symbols-outlined">inventory</span>
                    <span>My Orders</span>
                  </Link>
                  <Link 
                    to="/wishlist" 
                    className="flex items-center gap-3 w-full px-4 py-3 text-on-surface-variant hover:bg-[#1f1f22] rounded-xl transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="material-symbols-outlined">favorite</span>
                    <span>Wishlist</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="flex items-center gap-3 w-full px-4 py-3 text-primary hover:bg-primary/10 rounded-xl transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <span className="material-symbols-outlined">admin_panel_settings</span>
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-error hover:bg-error/10 rounded-xl transition-colors mt-2"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Search Modal */}
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
      
      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Spacer for fixed navbar */}
      <div className="h-14 md:h-20"></div>
    </>
  )
}

export default Navbar