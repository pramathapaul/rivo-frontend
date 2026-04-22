import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const MobileBottomNav = () => {
  const location = useLocation()
  const { setIsCartOpen } = useCart()

  const navItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/collections', label: 'Shop', icon: 'explore' },
    { path: '/customize', label: 'Custom', icon: 'design_services' }
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0e0e10] z-40 px-4 py-3 flex justify-around items-center border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 transition-all ${
            location.pathname === item.path 
              ? 'text-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {item.icon}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {item.label}
          </span>
        </Link>
      ))}
      
      <button 
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-on-surface transition-all relative"
      >
        <span className="material-symbols-outlined text-xl">shopping_bag</span>
        <span className="text-[10px] font-bold uppercase tracking-tighter">Cart</span>
      </button>
    </nav>
  )
}

export default MobileBottomNav