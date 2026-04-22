import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const Footer = () => {
  const socialLinks = [
    {
      name: 'Instagram',
      icon: 'camera',
      url: 'https://www.instagram.com/rivostaybold/',
      color: 'hover:text-[#E4405F]'
    },
    {
      name: 'Facebook',
      icon: 'thumb_up',
      url: 'https://www.facebook.com/share/1717jU77ot/',
      color: 'hover:text-[#1877F2]'
    },
    {
      name: 'WhatsApp',
      icon: 'chat_bubble',
      url: 'https://wa.me/7003823938',
      color: 'hover:text-[#25D366]'
    },
    {
      name: 'Discord',
      icon: 'forum',
      url: '#',
      color: 'hover:text-[#5865F2]'
    },
    {
      name: 'YouTube',
      icon: 'play_circle',
      url: '#',
      color: 'hover:text-[#FF0000]'
    },
    {
      name: 'Pinterest',
      icon: 'push_pin',
      url: '#',
      color: 'hover:text-[#BD081C]'
    }
  ]

  return (
    <footer className="w-full mt-20 pb-24 md:pb-10 bg-[#0e0e10] border-t border-[#48474a]/15">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8 md:py-10">
          {/* Logo Section */}
          <div className="flex items-center gap-2 md:gap-2 hover:scale-105 transition-transform">
            <img src={logo} alt="RIVO Logo" className="h-10 md:h-20 w-auto opacity-100" />
            <span className="text-4xl font-black text-[#f9f5f8] opacity-10 font-headline">RIVO</span>
            <p className="text-[10px] tracking-widest text-[#adaaad] uppercase text-center md:text-left">
              © 2026 RIVO DIGITAL. BEYOND THE GRID.
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {['Privacy', 'Terms', 'Shipping', 'Sustainability', 'FAQ'].map(link => (
              <Link
                key={link}
                // to={`/${link.toLowerCase()}`} 
                className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors text-xs tracking-widest uppercase"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#48474a]/15 my-6"></div>

        {/* Social Media Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#48474a]/30"></span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#adaaad] font-bold">Follow the Movement</span>
            <span className="w-8 h-[1px] bg-[#48474a]/30"></span>
          </div>

          {/* Social Icons */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative w-12 h-12 md:w-14 md:h-14 bg-surface-container-low rounded-full flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 ${social.color}`}
                aria-label={social.name}
              >
                <span className="material-symbols-outlined text-xl md:text-2xl text-[#adaaad] group-hover:text-current transition-colors">
                  {social.icon}
                </span>

                {/* Tooltip */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-[#adaaad] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {social.name}
                </span>
              </a>
            ))}
          </div>

          {/* WhatsApp Contact Info */}
          <div className="flex items-center gap-2 text-[#adaaad] text-xs">
            <span className="material-symbols-outlined text-sm text-[#25D366]">chat_bubble</span>
            <span>WhatsApp Support: </span>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              +91 7003823938
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#48474a]/15 my-6"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Payment Methods */}
          {/* <div className="flex items-center gap-4">
            <span className="text-[10px] text-[#adaaad] uppercase tracking-wider">We Accept:</span>
            <div className="flex items-center gap-2">
              <span className="text-[#adaaad] text-lg">💳</span>
              <span className="text-[#adaaad] text-lg">🏦</span>
              <span className="text-[#adaaad] text-lg">📱</span>
              <span className="text-[#adaaad] text-sm">VISA</span>
              <span className="text-[#adaaad] text-sm">MC</span>
              <span className="text-[#adaaad] text-sm">AMEX</span>
            </div>
          </div> */}

          {/* Newsletter Signup */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-[10px] text-[#adaaad] uppercase tracking-wider">Get Early Access:</span>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-l-full text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary w-40 md:w-56"
              />
              <button className="px-4 py-2 bg-primary text-on-primary rounded-r-full text-sm font-bold hover:bg-primary-fixed transition-all">
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Copyright Mobile (visible only on mobile) */}
        <div className="md:hidden text-center mt-6">
          <p className="text-[8px] tracking-widest text-[#adaaad] uppercase">
            © 2026 RIVO DIGITAL. BEYOND THE GRID.
          </p>
        </div>

        {/* Brand Tagline */}
        <div className="text-center mt-8">
          <p className="font-headline text-2xl md:text-4xl font-black italic tracking-tighter opacity-5 select-none">
            WEAR YOUR IDENTITY
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer