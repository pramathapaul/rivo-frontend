import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import AnnouncementBar from './components/AnnouncementBar'
import Navbar from './components/Navbar'
import MobileBottomNav from './components/MobileBottomNav'
import HomePage from './pages/HomePage'
import CollectionPage from './pages/CollectionPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CustomizePage from './pages/CustomizePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import Footer from './components/Footer'

function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminDashboard />} />
          
          {/* Public Routes */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col bg-surface">
              <Navbar />
              <AnnouncementBar />
              <main className="flex-grow pb-16 md:pb-0">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/collections" element={<CollectionPage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/customize" element={<CustomizePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                </Routes>
              </main>
              <Footer />
              <MobileBottomNav />
            </div>
          } />
        </Routes>
      </CartProvider>
    </Router>
  )
}

export default App
