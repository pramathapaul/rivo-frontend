import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { authAPI, uploadAPI } from '../services/api'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, loading, logout } = useCart()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [addresses, setAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    isDefault: false
  })

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || ''
      })
      setAddresses(user.addresses || [])
    }
  }, [user])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const res = await uploadAPI.uploadImage(file)
      setFormData({ ...formData, avatar: res.data.image })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar
      }
      
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          alert('Passwords do not match')
          setSaving(false)
          return
        }
        updateData.password = formData.newPassword
      }
      
      await authAPI.updateProfile(updateData)
      alert('Profile updated successfully!')
      setIsEditing(false)
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    
    if (editingAddress !== null) {
      const updatedAddresses = addresses.map((addr, idx) => 
        idx === editingAddress ? addressForm : addr
      )
      setAddresses(updatedAddresses)
    } else {
      setAddresses([...addresses, addressForm])
    }
    
    setShowAddressForm(false)
    setEditingAddress(null)
    setAddressForm({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      isDefault: false
    })
  }

  const handleEditAddress = (index) => {
    setEditingAddress(index)
    setAddressForm(addresses[index])
    setShowAddressForm(true)
  }

  const handleDeleteAddress = (index) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setAddresses(addresses.filter((_, idx) => idx !== index))
    }
  }

  const handleSetDefaultAddress = (index) => {
    const updatedAddresses = addresses.map((addr, idx) => ({
      ...addr,
      isDefault: idx === index
    }))
    setAddresses(updatedAddresses)
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout()
      navigate('/')
    }
  }

  if (loading) {
    return (
      <div className="pt-20 md:pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-on-surface-variant">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="pt-20 md:pt-28 pb-20 px-4 md:px-6 max-w-6xl mx-auto min-h-screen overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 md:mb-8"
      >
        <h1 className="font-headline text-3xl md:text-6xl font-black italic tracking-tighter mb-2">MY PROFILE</h1>
        <p className="text-on-surface-variant text-sm md:text-base">Manage your account and preferences</p>
      </motion.div>

      {/* Tabs - Scrollable on mobile */}
      <div className="flex gap-1 mb-6 border-b border-outline-variant/20 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { id: 'profile', label: 'Profile', icon: 'person' },
          { id: 'addresses', label: 'Addresses', icon: 'location_on' },
          { id: 'security', label: 'Security', icon: 'lock' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 md:gap-2 px-4 md:px-6 py-3 font-headline font-bold text-xs md:text-sm uppercase tracking-wider transition-all border-b-2 -mb-[2px] whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-on-surface-variant border-transparent hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base md:text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface-container-low rounded-2xl p-4 md:p-8"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 mb-6 md:mb-8 text-center sm:text-left">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-primary-fixed flex items-center justify-center text-on-primary text-2xl md:text-3xl font-bold overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary text-on-primary p-1.5 md:p-2 rounded-full cursor-pointer hover:scale-110 transition-all">
                  <span className="material-symbols-outlined text-xs md:text-sm">photo_camera</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              )}
            </div>
            <div>
              <h2 className="font-headline text-xl md:text-2xl font-bold">{user.name}</h2>
              <p className="text-on-surface-variant text-sm md:text-base">{user.email}</p>
              <span className={`inline-block mt-2 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase ${
                user.role === 'admin' ? 'bg-primary/20 text-primary-fixed' :
                user.role === 'designer' ? 'bg-secondary/20 text-secondary' :
                'bg-tertiary/20 text-tertiary'
              }`}>
                {user.role}
              </span>
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider">Full Name</label>
                  <p className="font-bold text-base md:text-lg">{user.name}</p>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider">Email</label>
                  <p className="font-bold text-base md:text-lg break-all">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider">Member Since</label>
                  <p className="font-bold text-base md:text-lg">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 w-full sm:w-auto px-6 py-3 bg-primary text-on-primary font-bold rounded-xl uppercase tracking-widest text-sm hover:scale-105 transition-all"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-outline-variant/20 pt-5">
                <h3 className="font-headline font-bold mb-3">Change Password (Optional)</h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl uppercase tracking-widest text-sm hover:scale-105 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({ ...formData, name: user.name, email: user.email, newPassword: '', confirmPassword: '' })
                  }}
                  className="px-6 py-3 border border-outline-variant text-on-surface font-bold rounded-xl uppercase tracking-widest text-sm hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </motion.div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="font-headline text-xl md:text-2xl font-bold">Saved Addresses</h2>
            <button
              onClick={() => {
                setEditingAddress(null)
                setAddressForm({ street: '', city: '', state: '', zipCode: '', country: 'United States', isDefault: false })
                setShowAddressForm(true)
              }}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-on-primary font-bold rounded-xl text-sm hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Address
            </button>
          </div>

          {showAddressForm && (
            <div className="bg-surface-container-low rounded-2xl p-4 md:p-6">
              <h3 className="font-headline font-bold mb-4">{editingAddress !== null ? 'Edit Address' : 'New Address'}</h3>
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded border-outline-variant bg-surface-container checked:bg-primary"
                  />
                  <span className="text-sm text-on-surface-variant">Set as default address</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="submit" className="px-6 py-2 bg-primary text-on-primary font-bold rounded-xl text-sm hover:scale-105 transition-all">
                    {editingAddress !== null ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false)
                      setEditingAddress(null)
                    }}
                    className="px-6 py-2 border border-outline-variant text-on-surface font-bold rounded-xl text-sm hover:bg-surface-container transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="bg-surface-container-low rounded-2xl p-8 md:p-12 text-center">
                <span className="material-symbols-outlined text-4xl md:text-5xl text-on-surface-variant mb-3">location_off</span>
                <p className="text-on-surface-variant">No saved addresses yet</p>
              </div>
            ) : (
              addresses.map((addr, index) => (
                <div key={index} className="bg-surface-container-low rounded-2xl p-4 md:p-6 relative">
                  {addr.isDefault && (
                    <span className="absolute top-3 right-3 md:top-4 md:right-4 bg-primary/20 text-primary-fixed px-2 md:px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                      Default
                    </span>
                  )}
                  <p className="font-bold mb-1 pr-20">{addr.street}</p>
                  <p className="text-on-surface-variant text-sm">{addr.city}, {addr.state} {addr.zipCode}</p>
                  <p className="text-on-surface-variant text-sm">{addr.country}</p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={() => handleEditAddress(index)}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(index)}
                      className="text-sm text-error hover:underline"
                    >
                      Delete
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(index)}
                        className="text-sm text-on-surface-variant hover:underline"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface-container-low rounded-2xl p-4 md:p-8"
        >
          <h2 className="font-headline text-xl md:text-2xl font-bold mb-6">Account Security</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-2">Two-Factor Authentication</h3>
              <p className="text-on-surface-variant text-sm mb-3">Add an extra layer of security to your account.</p>
              <button className="w-full sm:w-auto px-4 py-2 border border-outline-variant text-on-surface font-bold rounded-xl text-sm hover:bg-surface-container transition-all">
                Enable 2FA
              </button>
            </div>

            <div className="border-t border-outline-variant/20 pt-6">
              <h3 className="font-bold mb-2 text-error">Danger Zone</h3>
              <p className="text-on-surface-variant text-sm mb-3">Once you delete your account, there is no going back.</p>
              <button className="w-full sm:w-auto px-4 py-2 bg-error/20 text-error font-bold rounded-xl text-sm hover:bg-error/30 transition-all">
                Delete Account
              </button>
            </div>

            <div className="border-t border-outline-variant/20 pt-6">
              <h3 className="font-bold mb-2">Sign Out</h3>
              <p className="text-on-surface-variant text-sm mb-3">Sign out of your account on this device.</p>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3 bg-primary text-on-primary font-bold rounded-xl uppercase tracking-widest text-sm hover:scale-105 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ProfilePage