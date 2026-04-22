import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rivo-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

// Handle 401/403 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('rivo-token')
      localStorage.removeItem('rivo-user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============================================
// AUTH APIs
// ============================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
}

// ============================================
// PRODUCT APIs
// ============================================
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getTopProducts: () => api.get('/products/top'),
  getCategories: () => api.get('/products/categories'),
  searchProducts: (query) => api.get('/products/search', { params: query }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  bulkDeleteProducts: (ids) => api.post('/products/bulk-delete', { ids }),
  bulkUpdateStock: (updates) => api.post('/products/bulk-update-stock', { updates }),
  createReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  searchProducts: (params) => api.get('/products/search', { params })
}

// ============================================
// ORDER APIs - ONLY ONE DECLARATION
// ============================================
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/myorders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  updateOrderToPaid: (id, data) => api.put(`/orders/${id}/pay`, data),
  
  // Admin only
  getOrders: (params) => api.get('/orders', { params }),
  updateOrderToDelivered: (id) => api.put(`/orders/${id}/deliver`),
  updateOrderStatus: (id, status, trackingNumber) => api.put(`/orders/${id}/status`, { status, trackingNumber })
}

// ============================================
// CUSTOM DESIGN APIs
// ============================================
export const customAPI = {
  createDesign: (data) => api.post('/custom', data),
  getMyDesigns: () => api.get('/custom'),
  getDesignById: (id) => api.get(`/custom/${id}`),
  updateDesign: (id, data) => api.put(`/custom/${id}`, data),
  deleteDesign: (id) => api.delete(`/custom/${id}`),
  submitDesign: (id) => api.put(`/custom/${id}/submit`)
}

// ============================================
// UPLOAD APIs
// ============================================
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadMultipleImages: (files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('images', file))
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// ============================================
// ADMIN APIs
// ============================================
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAnalytics: (range) => api.get('/admin/analytics', { params: { range } }),
  getUsers: (params) => api.get('/auth/users', { params }),
  getUserById: (id) => api.get(`/auth/users/${id}`),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`)
}

export default api