import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Get storage key based on user
  const getCartStorageKey = (userId) => {
    return userId ? `rivo-cart-${userId}` : 'rivo-cart-guest'
  }

  // Load cart from localStorage when user changes
  useEffect(() => {
    const loadCart = () => {
      const storageKey = getCartStorageKey(user?._id)
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          setCartItems(JSON.parse(saved))
        } catch (error) {
          console.error('Error parsing cart data:', error)
          setCartItems([])
        }
      } else {
        setCartItems([])
      }
    }
    
    loadCart()
  }, [user]) // Re-run when user changes

  // Check for logged in user on mount
  useEffect(() => {
    const token = localStorage.getItem('rivo-token')
    if (token) {
      authAPI.getProfile()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('rivo-token')
          localStorage.removeItem('rivo-user')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      const storageKey = getCartStorageKey(user?._id)
      if (cartItems.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(cartItems))
      } else {
        // Remove empty cart from storage
        localStorage.removeItem(storageKey)
      }
    }
  }, [cartItems, user, loading])

  // Auth functions
  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    localStorage.setItem('rivo-token', res.data.token)
    localStorage.setItem('rivo-user', JSON.stringify(res.data))
    
    // Before setting new user, check if there's a guest cart to merge
    const guestCartKey = getCartStorageKey(null)
    const guestCart = localStorage.getItem(guestCartKey)
    
    setUser(res.data)
    
    // Merge guest cart with user cart if exists
    if (guestCart) {
      try {
        const guestItems = JSON.parse(guestCart)
        const userCartKey = getCartStorageKey(res.data._id)
        const existingUserCart = localStorage.getItem(userCartKey)
        let userItems = existingUserCart ? JSON.parse(existingUserCart) : []
        
        // Merge carts (avoid duplicates based on id+size+color)
        guestItems.forEach(guestItem => {
          const existingIndex = userItems.findIndex(
            item => item.id === guestItem.id && 
                   item.size === guestItem.size && 
                   item.color === guestItem.color
          )
          if (existingIndex >= 0) {
            userItems[existingIndex].quantity += guestItem.quantity
          } else {
            userItems.push(guestItem)
          }
        })
        
        localStorage.setItem(userCartKey, JSON.stringify(userItems))
        localStorage.removeItem(guestCartKey) // Clear guest cart
        setCartItems(userItems)
      } catch (error) {
        console.error('Error merging carts:', error)
      }
    }
    
    return res.data
  }

  const register = async (userData) => {
    const res = await authAPI.register(userData)
    localStorage.setItem('rivo-token', res.data.token)
    localStorage.setItem('rivo-user', JSON.stringify(res.data))
    
    // Merge guest cart with new user cart
    const guestCartKey = getCartStorageKey(null)
    const guestCart = localStorage.getItem(guestCartKey)
    
    setUser(res.data)
    
    if (guestCart) {
      try {
        const guestItems = JSON.parse(guestCart)
        const userCartKey = getCartStorageKey(res.data._id)
        localStorage.setItem(userCartKey, JSON.stringify(guestItems))
        localStorage.removeItem(guestCartKey)
        setCartItems(guestItems)
      } catch (error) {
        console.error('Error transferring guest cart:', error)
      }
    }
    
    return res.data
  }

  const logout = () => {
    // Clear current cart from state
    setCartItems([])
    
    // Remove auth data
    localStorage.removeItem('rivo-token')
    localStorage.removeItem('rivo-user')
    
    // Set user to null (this will trigger cart reload with guest key)
    setUser(null)
    
    // Close cart drawer
    setIsCartOpen(false)
  }

  const addToCart = (product, size, color, qty = 1) => {
    const productId = product._id || product.id
    
    setCartItems(prev => {
      const existing = prev.find(item => 
        item.id === productId && item.size === size && item.color === color
      )
      
      let newCart
      if (existing) {
        newCart = prev.map(item =>
          item.id === productId && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      } else {
        newCart = [...prev, {
          id: productId,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image || 'https://via.placeholder.com/400',
          size,
          color,
          quantity: qty,
          isCustomized: product.isCustomized || false
        }]
      }
      
      // Save immediately to storage
      const storageKey = getCartStorageKey(user?._id)
      localStorage.setItem(storageKey, JSON.stringify(newCart))
      
      return newCart
    })
    
    setIsCartOpen(true)
  }

  const updateQuantity = (id, size, color, qty) => {
    if (qty <= 0) {
      removeItem(id, size, color)
      return
    }
    
    setCartItems(prev => {
      const newCart = prev.map(item =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity: qty }
          : item
      )
      
      const storageKey = getCartStorageKey(user?._id)
      localStorage.setItem(storageKey, JSON.stringify(newCart))
      
      return newCart
    })
  }

  const removeItem = (id, size, color) => {
    setCartItems(prev => {
      const newCart = prev.filter(item => 
        !(item.id === id && item.size === size && item.color === color)
      )
      
      const storageKey = getCartStorageKey(user?._id)
      if (newCart.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(newCart))
      } else {
        localStorage.removeItem(storageKey)
      }
      
      return newCart
    })
  }

  const clearCart = () => {
    setCartItems([])
    const storageKey = getCartStorageKey(user?._id)
    localStorage.removeItem(storageKey)
  }

  const getSubtotal = () => cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0)
  const getTotalItems = () => cartItems.reduce((sum, i) => sum + i.quantity, 0)

  // Merge guest cart when logging in from checkout
  const mergeGuestCart = () => {
    if (!user) return
    
    const guestCartKey = getCartStorageKey(null)
    const guestCart = localStorage.getItem(guestCartKey)
    
    if (guestCart) {
      try {
        const guestItems = JSON.parse(guestCart)
        const userCartKey = getCartStorageKey(user._id)
        const existingUserCart = localStorage.getItem(userCartKey)
        let userItems = existingUserCart ? JSON.parse(existingUserCart) : []
        
        guestItems.forEach(guestItem => {
          const existingIndex = userItems.findIndex(
            item => item.id === guestItem.id && 
                   item.size === guestItem.size && 
                   item.color === guestItem.color
          )
          if (existingIndex >= 0) {
            userItems[existingIndex].quantity += guestItem.quantity
          } else {
            userItems.push(guestItem)
          }
        })
        
        localStorage.setItem(userCartKey, JSON.stringify(userItems))
        localStorage.removeItem(guestCartKey)
        setCartItems(userItems)
      } catch (error) {
        console.error('Error merging carts:', error)
      }
    }
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      getSubtotal,
      getTotalItems,
      user,
      loading,
      login,
      register,
      logout,
      mergeGuestCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export default CartContext