import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api'

const AnalyticsPage = ({ stats }) => {
  const [analyticsData, setAnalyticsData] = useState({
    topProducts: [],
    salesByCategory: [],
    revenueData: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30days')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/admin/analytics?range=${timeRange}`)
      setAnalyticsData(res.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const mockTopProducts = [
    { name: 'CYBER_CORE 01', sales: 145, revenue: 12325 },
    { name: 'NEON_GRID V2', sales: 98, revenue: 11760 },
    { name: 'DATA_STREAM', sales: 87, revenue: 6525 },
    { name: 'VOID CORE', sales: 54, revenue: 9720 },
    { name: 'GHOST_SHELL', sales: 32, revenue: 3040 }
  ]

  const mockCategoryData = [
    { category: 'Heavyweight Cotton', percentage: 35, color: '#00eefc' },
    { category: 'Tech-Mesh Blend', percentage: 28, color: '#ff6b98' },
    { category: 'Luxury Jersey', percentage: 20, color: '#bcff5f' },
    { category: 'Limited Edition', percentage: 12, color: '#9945FF' },
    { category: 'Archive 01', percentage: 5, color: '#FF1493' }
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
        <h1 className="font-headline text-3xl font-black uppercase tracking-tighter">Analytics</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Revenue Chart */}
      <div className="bg-surface-container-low rounded-xl p-6">
        <h3 className="font-headline font-bold text-lg uppercase tracking-wider mb-4">Revenue Trend</h3>
        <div className="h-64 flex items-end justify-around gap-2">
          {stats.monthlyRevenue?.map((month, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-primary/60 rounded-t-lg transition-all hover:bg-primary"
                style={{ 
                  height: `${Math.min(100, (month.total / 10000) * 100)}%`,
                  minHeight: '20px'
                }}
              >
                <div className="text-center text-xs mt-1 text-on-primary font-bold">
                  ₹{(month.total / 1000).toFixed(1)}k
                </div>
              </div>
              <span className="text-xs text-on-surface-variant">{month._id}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-surface-container-low rounded-xl p-6">
          <h3 className="font-headline font-bold text-lg uppercase tracking-wider mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {mockTopProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-on-surface-variant/30">#{i + 1}</span>
                  <div>
                    <p className="font-bold">{product.name}</p>
                    <p className="text-xs text-on-surface-variant">{product.sales} units sold</p>
                  </div>
                </div>
                <p className="font-bold text-primary">₹{product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-surface-container-low rounded-xl p-6">
          <h3 className="font-headline font-bold text-lg uppercase tracking-wider mb-4">Sales by Category</h3>
          <div className="space-y-4">
            {mockCategoryData.map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{cat.category}</span>
                  <span className="font-bold">{cat.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-5 border border-primary/30">
          <p className="text-xs uppercase tracking-wider text-primary">Conversion Rate</p>
          <p className="text-3xl font-headline font-black mt-2">3.2%</p>
          <p className="text-xs text-on-surface-variant mt-1">↑ 0.5% from last month</p>
        </div>
        <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-xl p-5 border border-secondary/30">
          <p className="text-xs uppercase tracking-wider text-secondary">Avg Order Value</p>
          <p className="text-3xl font-headline font-black mt-2">₹127.50</p>
          <p className="text-xs text-on-surface-variant mt-1">↑ ₹12.30 from last month</p>
        </div>
        <div className="bg-gradient-to-br from-tertiary/20 to-tertiary/5 rounded-xl p-5 border border-tertiary/30">
          <p className="text-xs uppercase tracking-wider text-tertiary">Cart Abandonment</p>
          <p className="text-3xl font-headline font-black mt-2">24%</p>
          <p className="text-xs text-on-surface-variant mt-1">↓ 3% from last month</p>
        </div>
        <div className="bg-gradient-to-br from-primary/20 to-secondary/5 rounded-xl p-5 border border-primary/30">
          <p className="text-xs uppercase tracking-wider text-primary-fixed">Return Rate</p>
          <p className="text-3xl font-headline font-black mt-2">1.8%</p>
          <p className="text-xs text-on-surface-variant mt-1">↓ 0.2% from last month</p>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage