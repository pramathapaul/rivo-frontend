import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { productAPI, uploadAPI } from '../../services/api'

const ProductsManager = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'Essential',
    description: '',
    stock: '',
    inStock: true,
    featured: false,
    images: [''],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', value: '#0e0e10' }],
    tags: []
  })

  const [newColorName, setNewColorName] = useState('')
  const [newColorValue, setNewColorValue] = useState('#0e0e10')
  const [newSize, setNewSize] = useState('')
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getProducts({ limit: 100 })
      setProducts(res.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', 'Heavyweight Cotton', 'Limited Edition', 'Tech-Mesh Blend', 'Luxury Jersey', 'Merchandise', 'Essential']
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData({ ...formData, images: newImages })
  }

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] })
  }

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  const addColor = () => {
    if (newColorName && newColorValue) {
      setFormData({
        ...formData,
        colors: [...formData.colors, { name: newColorName, value: newColorValue }]
      })
      setNewColorName('')
      setNewColorValue('#0e0e10')
    }
  }

  const removeColor = (index) => {
    const newColors = formData.colors.filter((_, i) => i !== index)
    setFormData({ ...formData, colors: newColors })
  }

  const toggleSize = (size) => {
    const sizes = formData.sizes.includes(size)
      ? formData.sizes.filter(s => s !== size)
      : [...formData.sizes, size]
    setFormData({ ...formData, sizes })
  }

  const addCustomSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, newSize.toUpperCase()]
      })
      setNewSize('')
    }
  }

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag]
      })
      setNewTag('')
    }
  }

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    })
  }

  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const res = await uploadAPI.uploadImage(file)
      const newImages = [...formData.images]
      newImages[index] = res.data.image
      setFormData({ ...formData, images: newImages })
      alert('Image uploaded successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (!formData.name || !formData.price || !formData.description || !formData.category) {
        alert('Please fill in all required fields')
        return
      }

      if (formData.images.length === 0 || formData.images.every(img => !img.trim())) {
        alert('Please add at least one image')
        return
      }

      if (formData.colors.length === 0) {
        alert('Please add at least one color')
        return
      }

      if (formData.sizes.length === 0) {
        alert('Please select at least one size')
        return
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        category: formData.category,
        description: formData.description,
        stock: parseInt(formData.stock) || 0,
        inStock: formData.inStock,
        featured: formData.featured,
        images: formData.images.filter(img => img.trim() !== ''),
        sizes: formData.sizes,
        colors: formData.colors,
        tags: formData.tags,
        customizationAvailable: true
      }

      console.log('Submitting product data:', productData)

      if (editingProduct) {
        await productAPI.updateProduct(editingProduct._id, productData)
        alert('Product updated successfully!')
      } else {
        await productAPI.createProduct(productData)
        alert('Product created successfully!')
      }
      
      setShowModal(false)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save product'
      alert(errorMessage)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      category: product.category || 'Essential',
      description: product.description || '',
      stock: product.stock || 0,
      inStock: product.inStock !== false,
      featured: product.featured || false,
      images: product.images?.length ? product.images : [''],
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors || [{ name: 'Black', value: '#0e0e10' }],
      tags: product.tags || []
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    
    try {
      await productAPI.deleteProduct(id)
      fetchProducts()
      alert('Product deleted')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return
    if (!window.confirm(`Delete ${selectedProducts.length} products?`)) return
    
    try {
      await productAPI.bulkDeleteProducts(selectedProducts)
      setSelectedProducts([])
      fetchProducts()
      alert(`${selectedProducts.length} products deleted`)
    } catch (error) {
      console.error('Error deleting products:', error)
      alert('Failed to delete products')
    }
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id))
    }
  }

  const toggleSelect = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      price: '',
      originalPrice: '',
      category: 'Essential',
      description: '',
      stock: '',
      inStock: true,
      featured: false,
      images: [''],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Black', value: '#0e0e10' }],
      tags: []
    })
    setNewColorName('')
    setNewColorValue('#0e0e10')
    setNewSize('')
    setNewTag('')
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="font-headline text-3xl font-black uppercase tracking-tighter">Products Manager</h1>
        <div className="flex gap-3">
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-error/20 text-error rounded-xl font-bold text-sm hover:bg-error/30 transition-all"
            >
              Delete Selected ({selectedProducts.length})
            </button>
          )}
          <button
            onClick={() => { resetForm(); setShowModal(true) }}
            className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-105 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container border-b border-outline-variant/20">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-outline-variant checked:bg-primary"
                  />
                </th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-on-surface-variant">Image</th>
                <th className="p-4 text01 text-xs uppercase tracking-wider text-on-surface-variant">Name</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-on-surface-variant">Category</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-on-surface-variant">Price</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-on-surface-variant">Stock</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-on-surface-variant">Status</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product._id} className="border-b border-outline-variant/10 hover:bg-surface-container transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => toggleSelect(product._id)}
                      className="w-4 h-4 rounded border-outline-variant checked:bg-primary"
                    />
                  </td>
                  <td className="p-4">
                    <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 rounded object-cover" />
                  </td>
                  <td className="p-4 font-bold">{product.name}</td>
                  <td className="p-4 text-sm text-on-surface-variant">{product.category}</td>
                  <td className="p-4 font-bold text-primary">₹{product.price}</td>
                  <td className="p-4">
                    <span className={product.stock < 10 ? 'text-yellow-500 font-bold' : ''}>{product.stock}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.inStock ? 'bg-tertiary/20 text-tertiary' : 'bg-error/20 text-error'}`}>
                      {product.inStock ? 'In Stock' : 'Sold Out'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)} className="p-2 hover:bg-primary/20 rounded-lg transition-colors text-primary">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-error/20 rounded-lg transition-colors text-error">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">inventory_2</span>
            <p className="text-on-surface-variant">No products found</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
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
              className="relative bg-surface-container-low rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="font-headline text-2xl font-black uppercase mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Product Name *</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                    >
                      {categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Colors Section */}
                <div className="border-t border-outline-variant/20 pt-4">
                  <h3 className="font-headline font-bold text-lg mb-3">Colors *</h3>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    {formData.colors.map((color, i) => (
                      <div key={i} className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2">
                        <div className="w-6 h-6 rounded-full border border-outline-variant" style={{ backgroundColor: color.value }}></div>
                        <span className="text-sm">{color.name}</span>
                        <button type="button" onClick={() => removeColor(i)} className="text-error hover:text-error-dim">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Color Name (e.g., Black)"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="flex-1 px-4 py-2 bg-surface-container border border-outline-variant/20 rounded-xl"
                    />
                    <input
                      type="color"
                      value={newColorValue}
                      onChange={(e) => setNewColorValue(e.target.value)}
                      className="w-12 h-10 rounded-xl cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={addColor}
                      className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold"
                    >
                      Add Color
                    </button>
                  </div>
                </div>

                {/* Sizes Section */}
                <div className="border-t border-outline-variant/20 pt-4">
                  <h3 className="font-headline font-bold text-lg mb-3">Sizes *</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {availableSizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          formData.sizes.includes(size)
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Custom Size (e.g., 3XL)"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="flex-1 px-4 py-2 bg-surface-container border border-outline-variant/20 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={addCustomSize}
                      className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold"
                    >
                      Add Size
                    </button>
                  </div>
                </div>

                {/* Tags Section */}
                <div className="border-t border-outline-variant/20 pt-4">
                  <h3 className="font-headline font-bold text-lg mb-3">Tags</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-primary/20 text-primary-fixed rounded-full text-xs font-bold flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-error">×</button>
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Tag (e.g., Limited, New, Trending)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-1 px-4 py-2 bg-surface-container border border-outline-variant/20 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>

                {/* Images Section */}
                <div className="border-t border-outline-variant/20 pt-4">
                  <h3 className="font-headline font-bold text-lg mb-3">Images *</h3>
                  
                  {formData.images.map((img, i) => (
                    <div key={i} className="space-y-2 mb-3">
                      <div className="flex gap-2">
                        <input
                          value={img}
                          onChange={(e) => handleImageChange(i, e.target.value)}
                          placeholder="Image URL"
                          className="flex-1 px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl"
                        />
                        {formData.images.length > 1 && (
                          <button type="button" onClick={() => removeImageField(i)} className="px-3 text-error text-xl">✕</button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-on-surface-variant">OR</span>
                        <label className="cursor-pointer text-sm text-primary hover:underline">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, i)}
                            disabled={uploading}
                          />
                          {uploading ? 'Uploading...' : 'Upload from computer'}
                        </label>
                        {img && (
                          <img src={img} alt="Preview" className="w-12 h-12 rounded object-cover" />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" onClick={addImageField} className="text-sm text-primary hover:underline">
                    + Add Another Image
                  </button>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6 pt-4 border-t border-outline-variant/20">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-outline-variant checked:bg-primary"
                    />
                    <span className="text-sm">In Stock</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-outline-variant checked:bg-primary"
                    />
                    <span className="text-sm">Featured Product</span>
                  </label>
                </div>
                
                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-wider">
                    {editingProduct ? 'Update Product' : 'Create Product'}
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

export default ProductsManager