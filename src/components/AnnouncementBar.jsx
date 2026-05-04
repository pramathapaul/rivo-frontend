import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const AnnouncementBar = () => {
  const [announcements, setAnnouncements] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [loading, setLoading] = useState(true)

  // Default announcements
  const defaultAnnouncements = [
    {
      id: 1,
      text: '🔥 Flash Sale! Up to 15% OFF on all items',
      link: '/collections?collections',
      bgColor: 'bg-secondary/20',
      textColor: 'text-secondary',
      icon: 'bolt',
      isActive: true
    }
  ]

  // Load announcements from localStorage (no API call)
  useEffect(() => {
    const loadAnnouncements = () => {
      try {
        const local = localStorage.getItem('rivo-announcements')
        if (local) {
          const parsed = JSON.parse(local)
          const active = parsed.filter(a => a.isActive !== false)
          setAnnouncements(active.length > 0 ? active : defaultAnnouncements)
        } else {
          setAnnouncements(defaultAnnouncements)
        }
      } catch (error) {
        console.error('Error loading announcements:', error)
        setAnnouncements(defaultAnnouncements)
      } finally {
        setLoading(false)
      }
    }
    
    loadAnnouncements()
  }, [])

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length === 0 || isPaused) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isPaused, announcements.length])

  // Save default announcements if none exist
  useEffect(() => {
    if (!loading && announcements.length > 0) {
      const local = localStorage.getItem('rivo-announcements')
      if (!local) {
        localStorage.setItem('rivo-announcements', JSON.stringify(announcements))
      }
    }
  }, [loading, announcements])

  // Hide if no announcements or dismissed
  if (loading || announcements.length === 0 || !isVisible) {
    return null
  }

  const current = announcements[currentIndex]

  // Check if link is external
  const isExternalLink = current.link?.startsWith('http://') || current.link?.startsWith('https://')

  return (
    <AnimatePresence>
      {announcements.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`relative z-50 overflow-hidden ${current.bgColor || 'bg-primary/20'} border-b border-white/5`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="max-w-7xl mx-auto px-4 py-2.5">
            <div className="flex items-center justify-between">
              
              {/* Announcement Content */}
              <div className="flex-1 flex items-center justify-center min-w-0">
                {isExternalLink ? (
                  <a 
                    href={current.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {current.icon && (
                      <span className="material-symbols-outlined text-sm flex-shrink-0">{current.icon}</span>
                    )}
                    <p className={`text-xs md:text-sm font-medium truncate ${current.textColor || 'text-primary-fixed'}`}>
                      {current.text}
                    </p>
                    <span className="material-symbols-outlined text-xs opacity-50 flex-shrink-0">arrow_forward</span>
                  </a>
                ) : (
                  <Link 
                    to={current.link || '/'}
                    className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {current.icon && (
                      <span className="material-symbols-outlined text-sm flex-shrink-0">{current.icon}</span>
                    )}
                    <p className={`text-xs md:text-sm font-medium truncate ${current.textColor || 'text-primary-fixed'}`}>
                      {current.text}
                    </p>
                    <span className="material-symbols-outlined text-xs opacity-50 flex-shrink-0">arrow_forward</span>
                  </Link>
                )}
              </div>

              {/* Navigation Dots */}
              {announcements.length > 1 && (
                <div className="hidden sm:flex items-center gap-1.5 ml-4 flex-shrink-0">
                  {announcements.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setCurrentIndex(i) }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === currentIndex ? 'bg-white w-4' : 'bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Go to announcement ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsVisible(false) }}
                className="ml-4 text-white/50 hover:text-white transition-colors flex-shrink-0"
                aria-label="Close announcement"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {announcements.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
              <motion.div
                className={`h-full ${(current.bgColor || 'bg-primary/20').replace('/20', '')}`}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: isPaused ? 0 : 4, ease: 'linear' }}
                key={currentIndex}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnnouncementBar