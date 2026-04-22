import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'

const CouponManager = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '0',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    perUserLimit: '1',
    isActive: true,
    firstTimeOnly: false
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons')
      setCoupons(res.data || [])
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, formData)
        alert('Coupon updated successfully!')
      } else {
        await api.post('/coupons', formData)
        alert('Coupon created successfully!')
      }
      
      setShowModal(false)
      resetForm()
      fetchCoupons()
    } catch (error) {
      console.error('Error saving coupon:', error)
      alert(error.response?.data?.message || 'Failed to save coupon')
    }
  }

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount || '',
      startDate: coupon.startDate?.split('T')[0] || '',
      endDate: coupon.endDate?.split('T')[0] || '',
      usageLimit: coupon.usageLimit || '',
      perUserLimit: coupon.perUserLimit || '1',
      isActive: coupon.isActive,
      firstTimeOnly: coupon.firstTimeOnly
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return
    
    try {
      await api.delete(`/coupons/${id}`)
      fetchCoupons()
      alert('Coupon deleted')
    } catch (error) {
      console.error('Error deleting coupon:', error)
      alert('Failed to delete coupon')
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/coupons/${id}`, { isActive: !currentStatus })
      fetchCoupons()
    } catch (error) {
      console.error('Error toggling coupon:', error)
    }
  }

  const resetForm = () => {
    setEditingCoupon(null)
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '0',
      maxDiscount: '',
      startDate: '',
      endDate: '',
      usageLimit: '',
      perUserLimit: '1',
      isActive: true,
      firstTimeOnly: false
    })
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN')
  }

  const getStatusBadge = (coupon) => {
    const now = new Date()
    const start = new Date(coupon.startDate)
    const end = new Date(coupon.endDate)
    
    if (!coupon.isActive) return { text: 'Inactive', color: 'bg-gray-500/20 text-gray-400' }
    if (now < start) return { text: 'Upcoming', color: 'bg-blue-500/20 text-blue-400' }
    if (now > end) return { text: 'Expired', color: 'bg-error/20 text-error' }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { text: 'Exhausted', color: 'bg-yellow-500/20 text-yellow-500' }
    return { text: 'Active', color: 'bg-tertiary/20 text-tertiary' }
  }

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
          <h1 className="font-headline text-3xl font-black uppercase tracking-tighter">Coupon Manager</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage discount coupons and promotions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-105 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create Coupon
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-on-surface-variant text-xs uppercase tracking-wider">Total Coupons</p>
          <p className="text-3xl font-headline font-black mt-2">{coupons.length}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-on-surface-variant text-xs uppercase tracking-wider">Active Now</p>
          <p className="text-3xl font-headline font-black mt-2 text-tertiary">
            {coupons.filter(c => getStatusBadge(c).text === 'Active').length}
          </p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-on-surface-variant text-xs uppercase tracking-wider">Total Used</p>
          <p className="text-3xl font-headline font-black mt-2 text-primary">
            {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
          </p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-on-surface-variant text-xs uppercase tracking-wider">Expired</p>
          <p className="text-3xl font-headline font-black mt-2 text-error">
            {coupons.filter(c => getStatusBadge(c).text === 'Expired').length}
          </p>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container border-b border-outline-variant/20">
              <tr>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Code</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Discount</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Valid Period</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Used</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Status</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => {
                const status = getStatusBadge(coupon)
                return (
                  <tr key={coupon._id} className="border-b border-outline-variant/10 hover:bg-surface-container">
                    <td className="p-4">
                      <p className="font-mono font-bold text-primary">{coupon.code}</p>
                      <p className="text-xs text-on-surface-variant truncate max-w-xs">{coupon.description}</p>
                    </td>
                    <td className="p-4">
                      {coupon.discountType === 'percentage' ? (
                        <span>{coupon.discountValue}% off {coupon.maxDiscount && `(max ₹${coupon.maxDiscount})`}</span>
                      ) : (
                        <span>₹{coupon.discountValue} off</span>
                      )}
                      {coupon.minOrderAmount > 0 && (
                        <p className="text-xs text-on-surface-variant">Min order: ₹{coupon.minOrderAmount}</p>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <p>{formatDate(coupon.startDate)}</p>
                      <p className="text-on-surface-variant">to</p>
                      <p>{formatDate(coupon.endDate)}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-bold">{coupon.usedCount || 0}</span>
                      {coupon.usageLimit && (
                        <span className="text-on-surface-variant"> / {coupon.usageLimit}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleToggleActive(coupon._id, coupon.isActive)}
                          className={`p-2 rounded-lg transition-colors ${coupon.isActive ? 'hover:bg-yellow-500/20 text-yellow-500' : 'hover:bg-tertiary/20 text-tertiary'}`}
                          title={coupon.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {coupon.isActive ? 'pause' : 'play_arrow'}
                          </span>
                        </button>
                        <button onClick={() => handleEdit(coupon)} className="p-2 hover:bg-primary/20 rounded-lg transition-colors text-primary">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleDelete(coupon._id)} className="p-2 hover:bg-error/20 rounded-lg transition-colors text-error">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {coupons.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">confirmation_number</span>
            <p className="text-on-surface-variant">No coupons created yet</p>
          </div>
        )}
      </div>

      {/* Coupon Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative bg-surface-container-low rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="font-headline text-2xl font-black uppercase mb-6">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Coupon Code *</label>
                    <input
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="e.g., WELCOME20"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl uppercase"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Description</label>
                    <input
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="e.g., 20% off on first order"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Discount Type</label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Discount Value *</label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      placeholder={formData.discountType === 'percentage' ? '20' : '100'}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Min Order Amount (₹)</label>
                    <input
                      type="number"
                      name="minOrderAmount"
                      value={formData.minOrderAmount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Max Discount (₹)</label>
                    <input
                      type="number"
                      name="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Usage Limit</label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                      placeholder="Unlimited"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Per User Limit</label>
                    <input
                      type="number"
                      name="perUserLimit"
                      value={formData.perUserLimit}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-outline-variant checked:bg-primary"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="firstTimeOnly"
                      checked={formData.firstTimeOnly}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-outline-variant checked:bg-primary"
                    />
                    <span className="text-sm">First Time Customers Only</span>
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-wider">
                    {editingCoupon ? 'Update' : 'Create'} Coupon
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 border border-outline-variant rounded-xl font-bold uppercase tracking-wider">
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

export default CouponManager