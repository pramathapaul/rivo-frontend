import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'

const OrdersManager = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [trackingInput, setTrackingInput] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders')
      setOrders(res.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter.toLowerCase()
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order._id?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleStatusUpdate = async (orderId, newStatus, trackingNumber = '') => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus, trackingNumber })
      fetchOrders()
      setTrackingInput('')
      alert(`Order marked as ${newStatus}`)
    } catch (error) {
      console.error('Error updating order:', error)
      alert(error.response?.data?.message || 'Failed to update order')
    }
  }

  const handleMarkAsPaid = async (orderId) => {
    if (!window.confirm('Mark this order as paid?')) return
    
    try {
      await api.put(`/orders/${orderId}/pay`, {
        id: `manual-${Date.now()}`,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: 'admin@rivo.com'
      })
      fetchOrders()
      alert('Order marked as paid')
    } catch (error) {
      console.error('Error updating payment:', error)
      alert('Failed to update payment status')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-tertiary/20 text-tertiary'
      case 'shipped': return 'bg-primary/20 text-primary-fixed'
      case 'processing': return 'bg-secondary/20 text-secondary'
      case 'pending': return 'bg-yellow-500/20 text-yellow-500'
      case 'cancelled': return 'bg-error/20 text-error'
      default: return 'bg-surface-container text-on-surface-variant'
    }
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
        <h1 className="font-headline text-3xl font-black uppercase tracking-tighter">Orders Manager</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by order # or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container border-b border-outline-variant/20">
              <tr>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Order #</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Customer</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Date</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Total</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Payment</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Status</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} className="border-b border-outline-variant/10 hover:bg-surface-container">
                  <td className="p-4 font-mono text-sm">{order.orderNumber || order._id.slice(-8)}</td>
                  <td className="p-4">{order.shippingAddress?.fullName || 'N/A'}</td>
                  <td className="p-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-primary">₹{order.totalPrice?.toFixed(2) || '0.00'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.isPaid ? 'bg-tertiary/20 text-tertiary' : 'bg-yellow-500/20 text-yellow-500'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                      className="text-primary hover:underline text-sm"
                    >
                      {selectedOrder?._id === order._id ? 'Hide' : 'Manage'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">inbox</span>
            <p className="text-on-surface-variant">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface-container-low rounded-xl p-6"
          >
            <h3 className="font-headline font-bold text-lg mb-4">Order Details - {selectedOrder.orderNumber || selectedOrder._id.slice(-8)}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-on-surface-variant mb-2">Customer</h4>
                <p className="font-bold">{selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
                <p className="text-sm">{selectedOrder.shippingAddress?.email || 'N/A'}</p>
                <p className="text-sm">{selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                <p className="text-sm mt-2">{selectedOrder.shippingAddress?.street || 'N/A'}</p>
                <p className="text-sm">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}
                </p>
                <p className="text-sm">{selectedOrder.shippingAddress?.country || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-on-surface-variant mb-2">Items</h4>
                {selectedOrder.orderItems?.map((item, i) => (
                  <div key={i} className="text-sm mb-1">
                    {item.quantity}x {item.name} ({item.size}/{item.color}) - ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                ))}
                <p className="font-bold mt-2">Total: ₹{selectedOrder.totalPrice?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            {/* Payment Status Section */}
            <div className="border-t border-outline-variant/20 pt-4 mb-4">
              <h4 className="text-xs uppercase tracking-wider text-on-surface-variant mb-3">Payment Status</h4>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${selectedOrder.isPaid ? 'bg-tertiary/20 text-tertiary' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  {selectedOrder.isPaid ? 'PAID' : 'PENDING'}
                </span>
                {!selectedOrder.isPaid && (
                  <button 
                    onClick={() => handleMarkAsPaid(selectedOrder._id)}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:scale-105 transition-all"
                  >
                    Mark as Paid
                  </button>
                )}
                {selectedOrder.isPaid && selectedOrder.paidAt && (
                  <span className="text-sm text-on-surface-variant">
                    Paid on: {new Date(selectedOrder.paidAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Update Status Section */}
            <div className="border-t border-outline-variant/20 pt-4">
              <h4 className="text-xs uppercase tracking-wider text-on-surface-variant mb-3">Update Order Status</h4>
              <div className="flex flex-wrap gap-3">
                {selectedOrder.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleMarkAsPaid(selectedOrder._id)}
                      className="px-4 py-2 bg-tertiary/20 text-tertiary rounded-lg text-sm font-bold"
                    >
                      Mark as Paid
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedOrder._id, 'processing')} 
                      className="px-4 py-2 bg-secondary/20 text-secondary rounded-lg text-sm font-bold"
                    >
                      Mark Processing
                    </button>
                  </>
                )}
                
                {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && selectedOrder.isPaid && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tracking Number"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      className="px-3 py-2 bg-surface-container border border-outline-variant/20 rounded-lg text-sm"
                    />
                    <button 
                      onClick={() => handleStatusUpdate(selectedOrder._id, 'shipped', trackingInput)} 
                      className="px-4 py-2 bg-primary/20 text-primary-fixed rounded-lg text-sm font-bold"
                    >
                      Mark Shipped
                    </button>
                  </div>
                )}
                
                {selectedOrder.status === 'shipped' && (
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder._id, 'delivered')} 
                    className="px-4 py-2 bg-tertiary/20 text-tertiary rounded-lg text-sm font-bold"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OrdersManager