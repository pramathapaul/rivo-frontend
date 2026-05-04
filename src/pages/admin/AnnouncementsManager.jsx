import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AnnouncementsManager = () => {
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)

    const [formData, setFormData] = useState({
        text: '',
        link: '/collections',
        linkType: 'internal',
        icon: 'campaign',
        bgColor: 'bg-primary/20',
        textColor: 'text-primary-fixed',
        isActive: true
    })

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    const fetchAnnouncements = () => {
        try {
            const local = localStorage.getItem('rivo-announcements')
            if (local) {
                setAnnouncements(JSON.parse(local))
            }
        } catch (e) {
            setAnnouncements([])
        }
        setLoading(false)
    }

    const saveAnnouncements = (data) => {
        localStorage.setItem('rivo-announcements', JSON.stringify(data))
        setAnnouncements(data)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!formData.text.trim()) {
            alert('Please enter announcement text')
            return
        }

        // Auto-detect link type
        const isExternal = formData.link.startsWith('http://') || formData.link.startsWith('https://')
        const finalData = {
            ...formData,
            linkType: isExternal ? 'external' : 'internal'
        }

        let updated
        if (editingId !== null) {
            updated = announcements.map((a, i) => i === editingId ? finalData : a)
        } else {
            updated = [...announcements, finalData]
        }

        saveAnnouncements(updated)
        setShowModal(false)
        resetForm()
    }

    const handleEdit = (index) => {
        setEditingId(index)
        setFormData(announcements[index])
        setShowModal(true)
    }

    const handleDelete = (index) => {
        if (!window.confirm('Delete this announcement?')) return
        const updated = announcements.filter((_, i) => i !== index)
        saveAnnouncements(updated)
    }

    const handleToggleActive = (index) => {
        const updated = announcements.map((a, i) =>
            i === index ? { ...a, isActive: !a.isActive } : a
        )
        saveAnnouncements(updated)
    }

    const resetForm = () => {
        setEditingId(null)
        setFormData({
            text: '',
            link: '/collections',
            linkType: 'internal',
            icon: 'campaign',
            bgColor: 'bg-primary/20',
            textColor: 'text-primary-fixed',
            isActive: true
        })
    }

    // Predefined link templates
    const linkTemplates = [
        { label: 'Home Page', link: '/' },
        { label: 'All Collections', link: '/collections' },
        { label: 'Custom Lab', link: '/customize' },
        { label: 'Cart', link: '/cart' },
        { label: 'Flash Sale', link: '/collections?sale=true' },
        { label: 'Oversized Tees', link: '/collections?category=Oversized+Tees' },
        { label: 'Jerseys', link: '/collections?category=Jerseys' },
        { label: 'Limited Edition', link: '/collections?category=Limited+Edition' },
        { label: 'Luxury Jersey', link: '/collections?category=Luxury+Jersey' },
        { label: 'Heavyweight Cotton', link: '/collections?category=Heavyweight+Cotton' },
        { label: 'Tech-Mesh Blend', link: '/collections?category=Tech-Mesh+Blend' },
        { label: 'Streetwear', link: '/collections?category=Streetwear' },
        { label: 'Merchandise', link: '/collections?category=Merchandise' },
    ]

    const colorOptions = [
        { bg: 'bg-secondary/20', text: 'text-secondary', label: 'Pink - Sales/Urgent' },
        { bg: 'bg-primary/20', text: 'text-primary-fixed', label: 'Cyan - Info/News' },
        { bg: 'bg-tertiary/20', text: 'text-tertiary', label: 'Green - Success/Offers' },
        { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Yellow - Warning' },
    ]

    const iconOptions = [
        { value: 'campaign', label: '📢 Campaign' },
        { value: 'bolt', label: '⚡ Flash' },
        { value: 'local_shipping', label: '🚚 Shipping' },
        { value: 'confirmation_number', label: '🎫 Coupon' },
        { value: 'new_releases', label: '🆕 New' },
        { value: 'celebration', label: '🎉 Celebrate' },
        { value: 'stars', label: '⭐ Special' },
        { value: 'sell', label: '🏷️ Sale' },
        { value: 'discount', label: '💸 Discount' },
    ]

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-black uppercase tracking-tighter">Announcements</h1>
                    <p className="text-on-surface-variant text-sm mt-1">
                        {announcements.length} announcement{announcements.length !== 1 ? 's' : ''} •
                        {announcements.filter(a => a.isActive).length} active
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true) }}
                    className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-105 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Announcement
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-container-low rounded-xl p-4 text-center">
                    <div className="text-2xl font-headline font-bold text-primary">{announcements.length}</div>
                    <div className="text-xs text-on-surface-variant">Total</div>
                </div>
                <div className="bg-surface-container-low rounded-xl p-4 text-center">
                    <div className="text-2xl font-headline font-bold text-tertiary">{announcements.filter(a => a.isActive).length}</div>
                    <div className="text-xs text-on-surface-variant">Active</div>
                </div>
                <div className="bg-surface-container-low rounded-xl p-4 text-center">
                    <div className="text-2xl font-headline font-bold text-on-surface-variant">{announcements.filter(a => !a.isActive).length}</div>
                    <div className="text-xs text-on-surface-variant">Inactive</div>
                </div>
            </div>

            {announcements.length === 0 ? (
                <div className="bg-surface-container-low rounded-2xl p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">campaign</span>
                    <h3 className="font-headline text-xl font-bold mb-2">No Announcements Yet</h3>
                    <p className="text-on-surface-variant text-sm mb-4">Create your first announcement to display on the notification bar</p>
                    <button
                        onClick={() => { resetForm(); setShowModal(true) }}
                        className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-105 transition-all"
                    >
                        Create Announcement
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {announcements.map((ann, i) => (
                        <div key={i} className={`bg-surface-container-low rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${!ann.isActive ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ann.bgColor}`}>
                                    <span className={`material-symbols-outlined text-lg ${ann.textColor}`}>{ann.icon || 'campaign'}</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm truncate">{ann.text}</p>
                                    <p className="text-xs text-on-surface-variant truncate">
                                        {ann.linkType === 'external' ? '🔗 External: ' : '📄 Page: '}
                                        {ann.link}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {ann.isActive ? (
                                            <span className="text-[10px] text-tertiary">● Active</span>
                                        ) : (
                                            <span className="text-[10px] text-on-surface-variant">○ Inactive</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => handleToggleActive(i)}
                                    className={`p-2 rounded-lg transition-colors ${ann.isActive ? 'hover:bg-yellow-500/20 text-yellow-500' : 'hover:bg-tertiary/20 text-tertiary'}`}
                                    title={ann.isActive ? 'Deactivate' : 'Activate'}>
                                    <span className="material-symbols-outlined text-sm">{ann.isActive ? 'visibility' : 'visibility_off'}</span>
                                </button>
                                <button onClick={() => handleEdit(i)} className="p-2 hover:bg-primary/20 rounded-lg transition-colors text-primary" title="Edit">
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button onClick={() => handleDelete(i)} className="p-2 hover:bg-error/20 rounded-lg transition-colors text-error" title="Delete">
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
                        <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            className="relative bg-surface-container-low rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto">

                            <h2 className="font-headline text-xl font-black uppercase mb-6">
                                {editingId !== null ? 'Edit' : 'Create'} Announcement
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Text */}
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                                        Announcement Text *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.text}
                                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                        placeholder="e.g., 🔥 Flash Sale! Up to 50% OFF"
                                        className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                                        required
                                    />
                                    <p className="text-[10px] text-on-surface-variant/60 mt-1">Keep it short and catchy (max 60 characters recommended)</p>
                                </div>

                                {/* Link Input with Templates */}
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                                        Link (Where users go when they click)
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={formData.link}
                                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                            placeholder="/collections or https://..."
                                            className="flex-1 px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary text-sm"
                                        />
                                    </div>

                                    {/* Link Type Indicator */}
                                    <div className="mb-3">
                                        {formData.link.startsWith('http://') || formData.link.startsWith('https://') ? (
                                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">🌐 External Link</span>
                                        ) : (
                                            <span className="text-[10px] bg-primary/20 text-primary-fixed px-2 py-1 rounded-full">📄 Internal Page</span>
                                        )}
                                    </div>

                                    {/* Quick Link Templates */}
                                    <div>
                                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">
                                            Quick Links (click to use):
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {linkTemplates.map((template, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, link: template.link, linkType: 'internal' })}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${formData.link === template.link
                                                            ? 'bg-primary text-on-primary'
                                                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                                        }`}
                                                >
                                                    {template.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Icon & Color */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Icon Selection */}
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-2">Icon</label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {iconOptions.map(icon => (
                                                <button
                                                    key={icon.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon: icon.value })}
                                                    className={`p-2 rounded-lg text-center transition-all ${formData.icon === icon.value
                                                            ? 'bg-primary text-on-primary'
                                                            : 'bg-surface-container hover:bg-surface-container-high'
                                                        }`}
                                                    title={icon.label}
                                                >
                                                    <span className="material-symbols-outlined text-base block">{icon.value}</span>
                                                    <span className="text-[8px] block mt-0.5">{icon.label.split(' ')[0]}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color Selection */}
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-2">Color Theme</label>
                                        <div className="space-y-1.5">
                                            {colorOptions.map(color => (
                                                <button
                                                    key={color.label}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, bgColor: color.bg, textColor: color.text })}
                                                    className={`w-full px-3 py-2 rounded-lg text-left text-xs font-bold transition-all flex items-center gap-2 ${formData.bgColor === color.bg
                                                            ? 'ring-2 ring-white ' + color.bg + ' ' + color.text
                                                            : color.bg + ' ' + color.text + ' opacity-60 hover:opacity-100'
                                                        }`}
                                                >
                                                    <span className="w-3 h-3 rounded-full border border-current flex-shrink-0"></span>
                                                    {color.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Active Toggle */}
                                <label className="flex items-center gap-3 cursor-pointer bg-surface-container rounded-xl p-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 rounded border-outline-variant checked:bg-primary"
                                    />
                                    <div>
                                        <span className="text-sm font-bold">Active</span>
                                        <p className="text-[10px] text-on-surface-variant">Show this announcement on the website</p>
                                    </div>
                                </label>

                                {/* Preview */}
                                <div className="bg-surface-container rounded-xl p-3">
                                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">Preview:</p>
                                    <div className={`${formData.bgColor} rounded-lg px-4 py-2.5 flex items-center justify-center gap-2`}>
                                        <span className="material-symbols-outlined text-sm">{formData.icon}</span>
                                        <span className={`text-xs font-medium ${formData.textColor}`}>
                                            {formData.text || 'Your announcement text here'}
                                        </span>
                                        <span className="material-symbols-outlined text-xs opacity-50">arrow_forward</span>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button type="submit"
                                        className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-wider text-sm hover:scale-[1.01] transition-all">
                                        {editingId !== null ? 'Update Announcement' : 'Create Announcement'}
                                    </button>
                                    <button type="button" onClick={() => setShowModal(false)}
                                        className="px-6 py-3 border border-outline-variant text-on-surface rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-surface-container transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AnnouncementsManager
