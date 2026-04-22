import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { orderAPI } from '../services/api'
import api from '../services/api'

const CartPage = () => {
  const { cartItems, updateQuantity, removeItem, getSubtotal, user } = useCart()
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)

  if (cartItems.length === 0) {
    return (
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <span className="material-symbols-outlined text-8xl mb-6 opacity-20">shopping_bag</span>
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">YOUR BAG</h1>
        <p className="text-on-surface-variant mb-8">Ready for the runway?</p>
        <Link to="/collections" className="inline-block px-10 py-5 bg-primary text-on-primary font-bold rounded-xl uppercase tracking-widest hover:scale-105 transition-all">
          Shop Latest Drops
        </Link>
      </main>
    )
  }

  const subtotal = getSubtotal()
  const shipping = subtotal > 1000 ? 0 : 80
  const total = subtotal + shipping - discountAmount

  const handleInputChange = (e) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.name]: e.target.value
    })
  }

  // Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }
    
    setCouponLoading(true)
    setCouponError('')
    
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode,
        orderAmount: subtotal
      })
      
      setAppliedCoupon(res.data)
      setDiscountAmount(res.data.discountAmount)
      setCouponError('')
      alert(res.data.message)
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Invalid coupon code')
      setAppliedCoupon(null)
      setDiscountAmount(0)
    } finally {
      setCouponLoading(false)
    }
  }

  // Remove Coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscountAmount(0)
    setCouponCode('')
    setCouponError('')
  }

  const generateOrderSummary = () => {
    const orderNumber = `RVO-${Date.now().toString().slice(-8)}`
    const date = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    })

    const itemsList = cartItems.map(item => {
      return `• ${item.name}\n   Size: ${item.size} | Color: ${item.color}\n   Qty: ${item.quantity} | Price: ₹${(item.price * item.quantity).toFixed(2)}`
    }).join('\n\n')

    const orderSummary = `
🛍️ *NEW ORDER - ${orderNumber}*
───────────────────────────────

👤 *CUSTOMER DETAILS*
Name: ${customerDetails.name}
Email: ${customerDetails.email}
Phone: ${customerDetails.phone}

📍 *SHIPPING ADDRESS*
${customerDetails.address}
${customerDetails.city}, ${customerDetails.state} ${customerDetails.zipCode}
${customerDetails.country}

📦 *ORDER ITEMS*
${itemsList}

───────────────────────────────
💰 *ORDER SUMMARY*
Subtotal: ₹${subtotal.toFixed(2)}
Shipping: ${shipping === 0 ? 'FREE' : '₹' + shipping.toFixed(2)}
${appliedCoupon ? `Discount (${appliedCoupon.code}): -₹${discountAmount.toFixed(2)}` : ''}
Tax: FREE (Tax Free)
*TOTAL: ₹${total.toFixed(2)}*

───────────────────────────────
📝 *NOTES*
${customerDetails.notes || 'No notes provided'}

───────────────────────────────
📅 Order Date: ${date}
🔢 Total Items: ${cartItems.reduce((sum, i) => sum + i.quantity, 0)}
✨ RIVO - Wear Your Identity
    `

    return { orderSummary, orderNumber }
  }

  const handleCheckout = () => {
    if (!user) {
      window.location.href = '/login?redirect=cart'
      return
    }
    setShowCheckoutModal(true)
  }

  const handleSubmitOrder = async () => {
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || 
        !customerDetails.address || !customerDetails.city || !customerDetails.state || 
        !customerDetails.zipCode || !customerDetails.country) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const { orderSummary, orderNumber } = generateOrderSummary()
      
      const orderData = {
        orderNumber: orderNumber,
        orderItems: cartItems.map(item => ({
          product: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          isCustomized: item.name?.includes('CUSTOM') || false
        })),
        shippingAddress: {
          fullName: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
          street: customerDetails.address,
          city: customerDetails.city,
          state: customerDetails.state,
          zipCode: customerDetails.zipCode,
          country: customerDetails.country
        },
        paymentMethod: 'whatsapp',
        itemsPrice: subtotal,
        taxPrice: 0,
        shippingPrice: shipping,
        discountPrice: discountAmount,
        totalPrice: total,
        customerNotes: customerDetails.notes,
        couponUsed: appliedCoupon?.code || null
      }

      try {
        await orderAPI.createOrder(orderData)
        console.log('✅ Order saved to database')
        
        // Increment coupon usage if applied
        if (appliedCoupon) {
          await api.post('/coupons/apply', { code: appliedCoupon.code })
        }
      } catch (error) {
        console.error('❌ Error saving to database:', error)
        const orders = JSON.parse(localStorage.getItem('rivo-orders') || '[]')
        orders.push({
          _id: Date.now().toString(),
          orderNumber,
          createdAt: new Date().toISOString(),
          customer: customerDetails,
          orderItems: cartItems,
          itemsPrice: subtotal,
          shippingPrice: shipping,
          discountPrice: discountAmount,
          taxPrice: 0,
          totalPrice: total,
          status: 'pending',
          couponUsed: appliedCoupon?.code || null
        })
        localStorage.setItem('rivo-orders', JSON.stringify(orders))
      }
      
      const encodedMessage = encodeURIComponent(orderSummary)
      const whatsappNumber = '917003823938'
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
      
      localStorage.removeItem('rivo-cart')
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank')
        setIsSubmitting(false)
        setShowCheckoutModal(false)
        alert('✅ Order submitted successfully! Check WhatsApp for confirmation.')
        window.location.href = '/orders'
      }, 500)
      
    } catch (error) {
      console.error('Error:', error)
      alert('There was an error. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="pt-28 md:pt-32 pb-20 px-4 md:px-10 max-w-7xl mx-auto">
      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl md:text-8xl font-black italic tracking-tighter uppercase mb-2">YOUR BAG</h1>
        <p className="text-on-surface-variant font-medium tracking-widest uppercase text-sm">Ready for the runway?</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {cartItems.map(item => (
            <div key={`${item.id}-${item.size}-${item.color}`} 
                 className="bg-surface-container-low p-4 md:p-6 rounded-lg flex flex-col sm:flex-row gap-4 items-center transition-all hover:bg-surface-container group">
              <div className="w-full sm:w-32 md:w-40 aspect-square overflow-hidden rounded-lg bg-surface-container-highest">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold font-headline mb-1 uppercase">{item.name}</h3>
                    <p className="text-on-surface-variant font-medium text-xs md:text-sm tracking-widest">
                      {item.color} / {item.size}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id, item.size, item.color)}
                    className="text-error-dim hover:text-error transition-colors p-1"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                  <div className="flex items-center gap-3 bg-surface-container-highest rounded-full p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-surface-bright transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="text-base md:text-lg font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-surface-bright transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                  <div className="text-xl md:text-2xl font-black font-headline text-primary-fixed">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <Link to="/collections" className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mt-4">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm uppercase tracking-wider">Continue Shopping</span>
          </Link>
        </div>
        
        {/* Summary Section */}
        <aside className="lg:col-span-4 sticky top-28">
          <div className="bg-surface-container-high rounded-lg p-6 md:p-8 shadow-2xl shadow-black/40">
            <h2 className="text-xl md:text-2xl font-black font-headline uppercase mb-6 pb-4 border-b border-outline-variant/15">
              Order Summary
            </h2>
            
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant uppercase tracking-widest text-xs md:text-sm">Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant uppercase tracking-widest text-xs md:text-sm">Shipping</span>
                <span className={`font-bold ${shipping === 0 ? 'text-tertiary' : ''}`}>
                  {shipping === 0 ? 'FREE' : '₹' + shipping.toFixed(2)}
                </span>
              </div>
              
              {/* Discount Row */}
              {appliedCoupon && (
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant uppercase tracking-widest text-xs md:text-sm">
                    Discount ({appliedCoupon.code})
                  </span>
                  <span className="font-bold text-tertiary">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant uppercase tracking-widest text-xs md:text-sm">Tax</span>
                <span className="font-bold text-tertiary">FREE</span>
              </div>
            </div>
            
            {subtotal < 1000 && subtotal > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-primary-fixed">
                  Add <span className="font-bold">₹{(1000 - subtotal).toFixed(2)}</span> more for FREE shipping!
                </p>
              </div>
            )}
            
            <div className="pt-4 border-t border-outline-variant/30 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-lg md:text-xl font-black font-headline uppercase italic">Total</span>
                <span className="text-3xl md:text-4xl font-black font-headline text-primary-fixed">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleCheckout}
                className="w-full py-4 md:py-6 bg-primary text-on-primary rounded-xl font-black font-headline text-lg md:text-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Checkout Now
              </button>
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">lock</span>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest text-center">
                  Secure Checkout • WhatsApp Order
                </p>
              </div>
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="mt-4 bg-surface-container-low rounded-xl p-5">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Coupon Code
            </label>
            
            {!appliedCoupon ? (
              <>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-surface-container-highest border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary uppercase font-bold tracking-widest placeholder:text-outline/50" 
                    placeholder="ENTER CODE" 
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={couponLoading}
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="bg-surface-bright p-2 rounded-full hover:bg-primary transition-colors group disabled:opacity-50"
                  >
                    {couponLoading ? (
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-primary group-hover:text-on-primary">arrow_forward</span>
                    )}
                  </button>
                </div>
                {couponError && (
                  <p className="text-error text-xs mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {couponError}
                  </p>
                )}
                <p className="text-[10px] text-on-surface-variant/60 mt-2">
                  Try code: WELCOME10 or FIRST50
                </p>
              </>
            ) : (
              <div className="bg-tertiary/10 border border-tertiary/30 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-tertiary text-sm">{appliedCoupon.code}</p>
                    <p className="text-xs text-on-surface-variant">
                      {appliedCoupon.discountType === 'percentage' 
                        ? `${appliedCoupon.discountValue}% off applied`
                        : `₹${appliedCoupon.discountValue} off applied`
                      }
                    </p>
                    <p className="text-xs text-tertiary mt-1">Saved: ₹{discountAmount.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={handleRemoveCoupon} 
                    className="text-error hover:text-error-dim p-1"
                    title="Remove coupon"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setShowCheckoutModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="relative bg-surface-container-low rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl"
            >
              <div className="sticky top-0 bg-surface-container-low border-b border-outline-variant/20 px-6 py-4 flex justify-between items-center">
                <h2 className="font-headline text-xl md:text-2xl font-black uppercase">Checkout Details</h2>
                <button 
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-on-surface-variant hover:text-on-surface p-2 hover:bg-surface-container rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(85vh - 70px)' }}>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-5">
                  <p className="text-sm text-on-surface-variant flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">info</span>
                    <span>Your order will be saved and sent via WhatsApp for confirmation and payment instructions.</span>
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="bg-surface-container rounded-xl p-4">
                    <h3 className="font-headline font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">person</span>
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Full Name *</label>
                        <input type="text" name="name" value={customerDetails.name} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary" required />
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Email *</label>
                        <input type="email" name="email" value={customerDetails.email} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary" required />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Phone Number *</label>
                      <input type="tel" name="phone" value={customerDetails.phone} onChange={handleInputChange} placeholder="+91 98765 43210" className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary" required />
                    </div>
                  </div>

                  <div className="bg-surface-container rounded-xl p-4">
                    <h3 className="font-headline font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">location_on</span>
                      Shipping Address
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Street Address *</label>
                        <input type="text" name="address" value={customerDetails.address} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">City *</label>
                          <input type="text" name="city" value={customerDetails.city} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary" required />
                        </div>
                        <div>
                          <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">State *</label>
                          <input type="text" name="state" value={customerDetails.state} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">PIN Code *</label>
                          <input type="text" name="zipCode" value={customerDetails.zipCode} onChange={handleInputChange} placeholder="6-digit PIN" className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary" required />
                        </div>
                        <div>
                          <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Country *</label>
                          <input type="text" name="country" value={customerDetails.country} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary" required />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container rounded-xl p-4">
                    <h3 className="font-headline font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">notes</span>
                      Additional Notes
                    </h3>
                    <textarea name="notes" value={customerDetails.notes} onChange={handleInputChange} rows="3" placeholder="Any special requests or notes... (Optional)" className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary resize-none" />
                  </div>

                  <div className="bg-surface-container rounded-xl p-4">
                    <h3 className="font-headline font-bold text-sm uppercase tracking-wider mb-3">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Items ({cartItems.reduce((s, i) => s + i.quantity, 0)}):</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Shipping:</span>
                        <span className={shipping === 0 ? 'text-tertiary' : ''}>{shipping === 0 ? 'FREE' : '₹' + shipping.toFixed(2)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Discount ({appliedCoupon.code}):</span>
                          <span className="text-tertiary">-₹{discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Tax:</span>
                        <span className="text-tertiary">FREE</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t border-outline-variant/20 text-base">
                        <span>Total:</span>
                        <span className="text-primary">₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-surface-container-low border-t border-outline-variant/20 px-6 py-4 flex gap-3">
                <button onClick={handleSubmitOrder} disabled={isSubmitting} className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-headline font-black uppercase tracking-wider hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      Place Order & Send WhatsApp
                    </>
                  )}
                </button>
                <button onClick={() => setShowCheckoutModal(false)} className="px-6 py-3 border border-outline-variant text-on-surface font-bold rounded-xl uppercase tracking-wider hover:bg-surface-container transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default CartPage