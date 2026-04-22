import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { orderAPI } from '../services/api'

const OrdersPage = () => {
  const navigate = useNavigate()
  const { user, loading } = useCart()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [error, setError] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return
      
      try {
        setLoadingOrders(true)
        setError(null)
        const res = await orderAPI.getMyOrders()
        console.log('Fetched orders:', res.data)
        
        const sortedOrders = (res.data || []).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        setOrders(sortedOrders)
      } catch (error) {
        console.error('Error fetching orders:', error)
        setError('Failed to load orders. Please try again.')
        
        const localOrders = JSON.parse(localStorage.getItem('rivo-orders') || '[]')
        if (localOrders.length > 0) {
          setOrders(localOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        }
      } finally {
        setLoadingOrders(false)
      }
    }
    
    fetchOrders()
  }, [user])

  const displayOrders = orders

  const filteredOrders = filterStatus === 'All' 
    ? displayOrders 
    : displayOrders.filter(o => o.status?.toLowerCase() === filterStatus.toLowerCase())

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-tertiary/20 text-tertiary'
      case 'shipped': return 'bg-primary/20 text-primary-fixed'
      case 'processing': return 'bg-secondary/20 text-secondary'
      case 'pending': return 'bg-yellow-500/20 text-yellow-500'
      case 'cancelled': return 'bg-error/20 text-error'
      default: return 'bg-on-surface-variant/20 text-on-surface-variant'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    
    try {
      await orderAPI.cancelOrder(orderId)
      const res = await orderAPI.getMyOrders()
      setOrders(res.data || [])
      setSelectedOrder(null)
      alert('Order cancelled successfully')
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert(error.response?.data?.message || 'Failed to cancel order')
    }
  }

  const handleViewInvoice = (orderId) => {
    const token = localStorage.getItem('rivo-token')
    window.open(`${API_URL}/api/invoice/${orderId}?token=${token}`, '_blank')
  }

  const handleDownloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem('rivo-token')
      const response = await fetch(`${API_URL}/api/invoice/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const htmlContent = await response.text()
      
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `RIVO-Invoice-${orderId.slice(-8)}.html`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Failed to download invoice')
    }
  }

  const handleTrackOrder = (order) => {
    if (order.trackingNumber) {
      alert(`Tracking Number: ${order.trackingNumber}\n\nTrack your order at our shipping partner's website.`)
    } else {
      alert('Tracking number will be updated soon. Please check back later.')
    }
  }

  const handleReorder = (order) => {
    // Add items back to cart
    order.orderItems?.forEach(item => {
      // This would need cart context integration
      console.log('Reorder item:', item)
    })
    alert('Reorder functionality coming soon!')
  }

  if (loading || loadingOrders) {
    return (
      <div className="pt-28 md:pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-on-surface-variant">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="pt-24 md:pt-28 pb-20 px-4 md:px-6 max-w-6xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 md:mb-8"
      >
        <h1 className="font-headline text-3xl md:text-5xl font-black italic tracking-tighter mb-2">MY ORDERS</h1>
        <p className="text-on-surface-variant text-sm md:text-base">Track and manage your orders</p>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              filterStatus === status
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-4 mb-6">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-surface-container-low rounded-2xl p-8 md:p-12 text-center">
          <span className="material-symbols-outlined text-5xl md:text-6xl text-on-surface-variant mb-4">inventory</span>
          <h3 className="font-headline text-xl md:text-2xl font-bold mb-2">No orders yet</h3>
          <p className="text-on-surface-variant text-sm md:text-base mb-6">Start shopping to see your orders here.</p>
          <Link to="/collections" className="inline-block px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:scale-105 transition-all">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order._id || order.orderNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10"
            >
              {/* Order Header */}
              <div 
                className="p-4 md:p-5 cursor-pointer hover:bg-surface-container transition-colors"
                onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4 md:gap-6">
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider">Order #</p>
                      <p className="font-headline font-bold text-sm">
                        {order.orderNumber || order._id?.slice(-8).toUpperCase() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider">Placed On</p>
                      <p className="font-bold text-sm">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider">Total</p>
                      <p className="font-bold text-primary text-sm">₹{order.totalPrice?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider">Items</p>
                      <p className="font-bold text-sm">{order.orderItems?.length || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                      {order.status || 'pending'}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant">
                      {selectedOrder?._id === order._id ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Details (Expandable) */}
              <AnimatePresence>
                {selectedOrder?._id === order._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-outline-variant/20"
                  >
                    <div className="p-4 md:p-5 space-y-5">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-headline font-bold text-sm uppercase tracking-wider mb-3">Items</h4>
                        <div className="space-y-3">
                          {order.orderItems?.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-14 h-14 bg-surface-container rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={item.image || 'https://via.placeholder.com/100'} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{item.name}</p>
                                <p className="text-xs text-on-surface-variant">
                                  Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                                </p>
                                {item.isCustomized && (
                                  <span className="text-[10px] text-primary">Customized</span>
                                )}
                              </div>
                              <p className="font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping & Order Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <h4 className="font-headline font-bold text-sm uppercase tracking-wider mb-2">Shipping Address</h4>
                          <div className="bg-surface-container rounded-lg p-3">
                            <p className="font-bold text-sm">{order.shippingAddress?.fullName || order.customer?.name || 'N/A'}</p>
                            <p className="text-xs text-on-surface-variant">{order.shippingAddress?.street || order.customer?.address}</p>
                            <p className="text-xs text-on-surface-variant">
                              {order.shippingAddress?.city || order.customer?.city}, {order.shippingAddress?.state || order.customer?.state} {order.shippingAddress?.zipCode || order.customer?.zipCode}
                            </p>
                            <p className="text-xs text-on-surface-variant">{order.shippingAddress?.country || order.customer?.country}</p>
                            <p className="text-xs text-on-surface-variant mt-1">{order.shippingAddress?.phone || order.customer?.phone}</p>
                            <p className="text-xs text-on-surface-variant">{order.shippingAddress?.email || order.customer?.email}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-headline font-bold text-sm uppercase tracking-wider mb-2">Order Summary</h4>
                          <div className="bg-surface-container rounded-lg p-3 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-on-surface-variant">Subtotal</span>
                              <span>₹{order.itemsPrice?.toFixed(2) || order.subtotal?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-on-surface-variant">Shipping</span>
                              <span className={order.shippingPrice === 0 ? 'text-tertiary' : ''}>
                                {order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice?.toFixed(2) || order.shipping?.toFixed(2) || '0.00'}`}
                              </span>
                            </div>
                            {order.discountPrice > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">
                                  Discount {order.couponUsed && `(${order.couponUsed})`}
                                </span>
                                <span className="text-tertiary">-₹{order.discountPrice?.toFixed(2) || '0.00'}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-on-surface-variant">Tax</span>
                              <span className="text-tertiary">FREE</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t border-outline-variant/20">
                              <span>Total</span>
                              <span className="text-primary">₹{order.totalPrice?.toFixed(2) || order.total?.toFixed(2) || '0.00'}</span>
                            </div>
                            {order.couponUsed && (
                              <div className="text-xs text-primary mt-1">
                                Coupon Applied: {order.couponUsed}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="bg-surface-container rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined ${order.isPaid ? 'text-tertiary' : 'text-yellow-500'}`}>
                            {order.isPaid ? 'check_circle' : 'pending'}
                          </span>
                          <div>
                            <p className="text-sm font-bold">
                              Payment Status: {order.isPaid ? 'Paid' : 'Pending'}
                            </p>
                            {order.isPaid && order.paidAt && (
                              <p className="text-xs text-on-surface-variant">
                                Paid on {formatDate(order.paidAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tracking Info */}
                      {order.trackingNumber && (
                        <div className="bg-surface-container rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">local_shipping</span>
                            <div>
                              <p className="text-xs text-on-surface-variant uppercase tracking-wider">Tracking Number</p>
                              <p className="font-mono font-bold">{order.trackingNumber}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Customer Notes */}
                      {order.customerNotes && (
                        <div className="bg-surface-container rounded-lg p-3">
                          <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Order Notes</p>
                          <p className="text-sm">{order.customerNotes}</p>
                        </div>
                      )}

                      {/* Order Timeline */}
                      <div className="relative py-4">
                        <h4 className="font-headline font-bold text-sm uppercase tracking-wider mb-4">Order Timeline</h4>
                        <div className="flex items-center justify-between">
                          {['Placed', 'Paid', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                            let isCompleted = false
                            if (i === 0) isCompleted = true
                            if (i === 1) isCompleted = order.isPaid
                            if (i === 2) isCompleted = order.isPaid
                            if (i === 3) isCompleted = order.status === 'shipped' || order.status === 'delivered'
                            if (i === 4) isCompleted = order.status === 'delivered'
                            
                            return (
                              <div key={step} className="flex-1 text-center">
                                <div className={`w-7 h-7 md:w-8 md:h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                                  isCompleted ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                                }`}>
                                  {isCompleted ? (
                                    <span className="material-symbols-outlined text-sm">check</span>
                                  ) : (
                                    <span className="text-xs">{i + 1}</span>
                                  )}
                                </div>
                                <p className="text-[8px] md:text-[10px] uppercase tracking-wider font-bold">{step}</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-3 border-t border-outline-variant/20">
                        {order.status === 'pending' && !order.isPaid && (
                          <button 
                            onClick={() => handleCancelOrder(order._id)}
                            className="px-4 py-2 bg-error/20 text-error font-bold rounded-xl text-sm hover:bg-error/30 transition-all"
                          >
                            Cancel Order
                          </button>
                        )}
                        
                        {/* View Invoice Button */}
                        <button 
                          onClick={() => handleViewInvoice(order._id)}
                          className="px-4 py-2 bg-primary text-on-primary font-bold rounded-xl text-sm hover:scale-105 transition-all flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">receipt</span>
                          View Invoice
                        </button>
                        
                        {/* Download Invoice Button */}
                        <button 
                          onClick={() => handleDownloadInvoice(order._id)}
                          className="px-4 py-2 bg-surface-container text-on-surface font-bold rounded-xl text-sm hover:bg-surface-container-high transition-all flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          Download
                        </button>
                        
                        {/* Track Order Button */}
                        {order.trackingNumber && (
                          <button 
                            onClick={() => handleTrackOrder(order)}
                            className="px-4 py-2 border border-outline-variant text-on-surface font-bold rounded-xl text-sm hover:bg-surface-container transition-all flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">local_shipping</span>
                            Track
                          </button>
                        )}
                        
                        {/* Reorder Button */}
                        {order.status === 'delivered' && (
                          <button 
                            onClick={() => handleReorder(order)}
                            className="px-4 py-2 border border-primary/30 text-primary font-bold rounded-xl text-sm hover:bg-primary/10 transition-all flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">replay</span>
                            Buy Again
                          </button>
                        )}
                        
                        {/* Need Help Button */}
                        <button className="px-4 py-2 border border-outline-variant text-on-surface font-bold rounded-xl text-sm hover:bg-surface-container transition-all flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">help</span>
                          Need Help?
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage