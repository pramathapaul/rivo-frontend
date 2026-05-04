import { useState, useEffect } from 'react'
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../../context/CartContext'
import api from '../../services/api'
import ProductsManager from './ProductsManager'
import OrdersManager from './OrdersManager'
import UsersManager from './UsersManager'
import AnalyticsPage from './AnalyticsPage'
import CouponManager from './CouponManager'
import AnnouncementsManager from './AnnouncementsManager'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useCart()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
    monthlyRevenue: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }
    fetchStats()
  }, [user, navigate])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
    { path: '/admin/products', label: 'Products', icon: 'inventory' },
    { path: '/admin/orders', label: 'Orders', icon: 'shopping_cart' },
    { path: '/admin/users', label: 'Users', icon: 'group' },
    { path: '/admin/coupons', label: 'Coupons', icon: 'confirmation_number' },
    { path: '/admin/announcements', label: 'Announcements', icon: 'campaign' },
    { path: '/admin/analytics', label: 'Analytics', icon: 'analytics' }
  ]

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Admin Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-surface-container border-b border-outline-variant/20">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-black italic font-headline text-primary-fixed">RIVO</Link>
            <span className="px-3 py-1 bg-primary/20 text-primary-fixed rounded-full text-xs font-bold">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-on-surface-variant">{user?.name}</span>
            <Link to="/" className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">exit_to_app</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-[57px] bottom-0 w-64 bg-surface-container-low border-r border-outline-variant/20 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.path, item.exact)
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-headline font-bold text-sm uppercase tracking-wider">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 pt-[57px]">
        <div className="p-6">
          <Routes>
            <Route path="/" element={<DashboardHome stats={stats} fetchStats={fetchStats} />} />
            <Route path="/products" element={<ProductsManager />} />
            <Route path="/orders" element={<OrdersManager />} />
            <Route path="/users" element={<UsersManager />} />
            <Route path="/coupons" element={<CouponManager />} />
            <Route path="/analytics" element={<AnalyticsPage stats={stats} />} />
            <Route path="/announcements" element={<AnnouncementsManager />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

// Dashboard Home Component
const DashboardHome = ({ stats, fetchStats }) => {
  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: 'inventory', color: 'bg-primary/20 text-primary-fixed' },
    { label: 'Total Orders', value: stats.totalOrders, icon: 'shopping_cart', color: 'bg-secondary/20 text-secondary' },
    { label: 'Total Users', value: stats.totalUsers, icon: 'group', color: 'bg-tertiary/20 text-tertiary' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: 'payments', color: 'bg-primary/20 text-primary-fixed' }
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-black uppercase tracking-tighter">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container-low rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant text-sm uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-headline font-black mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-surface-container-low rounded-xl p-6">
          <h3 className="font-headline font-bold text-lg uppercase tracking-wider mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {stats.recentOrders?.length > 0 ? (
              stats.recentOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                  <div>
                    <p className="font-bold text-sm">{order.orderNumber || order._id.slice(-8)}</p>
                    <p className="text-xs text-on-surface-variant">{order.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₹{order.totalPrice?.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-tertiary/20 text-tertiary' :
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-primary/20 text-primary-fixed'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-on-surface-variant text-sm text-center py-4">No recent orders</p>
            )}
          </div>
          <Link to="/admin/orders" className="text-primary text-sm font-bold mt-4 inline-block hover:underline">
            View All Orders →
          </Link>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-surface-container-low rounded-xl p-6">
          <h3 className="font-headline font-bold text-lg uppercase tracking-wider mb-4">Low Stock Alert</h3>
          <div className="space-y-3">
            {stats.lowStockProducts?.length > 0 ? (
              stats.lowStockProducts.map(product => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={product.images?.[0]} alt={product.name} className="w-10 h-10 rounded object-cover" />
                    <div>
                      <p className="font-bold text-sm">{product.name}</p>
                      <p className="text-xs text-on-surface-variant">{product.category}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${product.stock === 0 ? 'text-error' : 'text-yellow-500'}`}>
                    {product.stock} left
                  </span>
                </div>
              ))
            ) : (
              <p className="text-on-surface-variant text-sm text-center py-4">All products well stocked</p>
            )}
          </div>
          <Link to="/admin/products" className="text-primary text-sm font-bold mt-4 inline-block hover:underline">
            Manage Inventory →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
