import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { productAPI, uploadAPI } from '../services/api'

const CustomizePage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addToCart, user } = useCart()
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const productId = searchParams.get('id')
  const [baseProduct, setBaseProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Design State
  const [activeTab, setActiveTab] = useState('design')
  const [selectedColor, setSelectedColor] = useState('#ffffff')
  const [selectedSize, setSelectedSize] = useState('L')
  const [quantity, setQuantity] = useState(1)
  
  // Text State
  const [customText, setCustomText] = useState('')
  const [selectedFont, setSelectedFont] = useState('BOLD')
  const [textColor, setTextColor] = useState('#00eefc')
  const [textSize, setTextSize] = useState(40)
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 })
  const [isDraggingText, setIsDraggingText] = useState(false)
  
  // Image State
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 })
  const [imageScale, setImageScale] = useState(0.5)
  const [imageRotation, setImageRotation] = useState(0)
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [activeLayer, setActiveLayer] = useState(null)
  const [showGrid, setShowGrid] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedEffect, setSelectedEffect] = useState('none')
  
  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportImageData, setExportImageData] = useState(null)

  // T-shirt mockup image based on color
  const getTshirtMockup = (color) => {
    const mockups = {
      '#ffffff': 'https://i.ibb.co/dsnJCtKv/indian-man-simple-white-tee-studio-portrait.jpg',
      '#0e0e10': 'https://i.ibb.co/n80Lw8gp/Gemini-Generated-Image-iw40k9iw40k9iw40.png',
      '#1e1e24': 'https://i.ibb.co/nsFRDJyr/Gemini-Generated-Image-58uwyl58uwyl58uw.png',
      '#2a303c': 'https://i.ibb.co/1t69VBjv/Gemini-Generated-Image-l3g7tyl3g7tyl3g7.png',
      '#ff6b98': 'https://i.ibb.co/yc02XBJ9/Gemini-Generated-Image-gdj7mugdj7mugdj7.png',
      '#00eefc': 'https://i.ibb.co/9kKtwNZv/Gemini-Generated-Image-ouwbugouwbugouwb.png',
      '#9945FF': 'https://i.ibb.co/Y704Jrsm/Gemini-Generated-Image-nb41ljnb41ljnb41.png',
      '#bcff5f': 'https://i.ibb.co/2YM8mbM9/Gemini-Generated-Image-947xof947xof947x.png'
    }
    return mockups[color] || mockups['#ffffff']
  }

  const [tshirtImage, setTshirtImage] = useState(getTshirtMockup('#ffffff'))

  // Colors
  const colors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Core Black', value: '#0e0e10' },
    { name: 'Void', value: '#1e1e24' },
    { name: 'Dark Steel', value: '#2a303c' },
    { name: 'Neon Pink', value: '#ff6b98' },
    { name: 'Cyan', value: '#00eefc' },
    { name: 'Purple Haze', value: '#9945FF' },
    { name: 'Lime', value: '#bcff5f' }
  ]

  const fonts = [
    { name: 'BOLD', class: 'font-headline font-bold' },
    { name: 'SERIF', class: 'font-serif' },
    { name: 'GLITCH', class: 'font-mono tracking-wider' },
    { name: 'MONO', class: 'font-mono' },
    { name: 'GRAFFITI', class: 'font-headline italic' },
    { name: 'MINIMAL', class: 'font-body font-light' }
  ]

  const textColors = ['#00eefc', '#ff6b98', '#bcff5f', '#ffffff', '#0e0e10', '#9945FF']
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  // Fetch base product
  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        try {
          const res = await productAPI.getProductById(productId)
          setBaseProduct(res.data)
        } catch (error) {
          console.error('Error fetching product:', error)
        }
      }
      setLoading(false)
    }
    fetchProduct()
  }, [productId])

  // Update t-shirt image when color changes
  useEffect(() => {
    setTshirtImage(getTshirtMockup(selectedColor))
  }, [selectedColor])

  // Draw canvas
  useEffect(() => {
    drawCanvas()
  }, [tshirtImage, uploadedImage, customText, textPosition, textSize, textColor, selectedFont, selectedEffect, imagePosition, imageScale, imageRotation, showGrid, zoomLevel])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = tshirtImage

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.scale(zoomLevel, zoomLevel)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      if (showGrid) {
        ctx.strokeStyle = 'rgba(143, 245, 255, 0.15)'
        ctx.lineWidth = 1
        const gridSize = 50
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, canvas.height)
          ctx.stroke()
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.stroke()
        }
        
        ctx.strokeStyle = 'rgba(143, 245, 255, 0.3)'
        ctx.lineWidth = 2
        ctx.setLineDash([10, 10])
        const safeZone = {
          x: canvas.width * 0.2,
          y: canvas.height * 0.25,
          w: canvas.width * 0.6,
          h: canvas.height * 0.5
        }
        ctx.strokeRect(safeZone.x, safeZone.y, safeZone.w, safeZone.h)
        ctx.setLineDash([])
      }
      
      if (uploadedImage) {
        const userImg = new Image()
        userImg.crossOrigin = 'anonymous'
        userImg.src = uploadedImage
        
        userImg.onload = () => {
          const imgX = (imagePosition.x / 100) * canvas.width
          const imgY = (imagePosition.y / 100) * canvas.height
          const scaledWidth = userImg.width * imageScale
          const scaledHeight = userImg.height * imageScale
          
          ctx.save()
          ctx.translate(imgX, imgY)
          ctx.rotate((imageRotation * Math.PI) / 180)
          
          if (activeLayer === 'image') {
            ctx.shadowColor = '#00eefc'
            ctx.shadowBlur = 20
          }
          
          ctx.drawImage(
            userImg,
            -scaledWidth / 2,
            -scaledHeight / 2,
            scaledWidth,
            scaledHeight
          )
          ctx.restore()
          
          drawText(ctx, canvas)
        }
      } else {
        drawText(ctx, canvas)
      }
      
      ctx.restore()
    }
  }

  const drawText = (ctx, canvas) => {
    if (!customText) return
    
    const x = (textPosition.x / 100) * canvas.width
    const y = (textPosition.y / 100) * canvas.height
    
    ctx.save()
    
    let fontFamily = 'Space Grotesk, sans-serif'
    if (selectedFont === 'SERIF') fontFamily = 'Georgia, serif'
    else if (selectedFont === 'MONO' || selectedFont === 'GLITCH') fontFamily = 'Courier New, monospace'
    
    ctx.font = `bold ${textSize}px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    if (selectedEffect === 'glow') {
      ctx.shadowColor = textColor
      ctx.shadowBlur = 20
    } else if (selectedEffect === 'shadow') {
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 4
      ctx.shadowOffsetY = 4
    } else if (selectedEffect === 'outline') {
      ctx.strokeStyle = textColor
      ctx.lineWidth = 3
      ctx.strokeText(customText, x, y)
      ctx.fillStyle = 'transparent'
    } else if (selectedEffect === 'distressed') {
      ctx.fillStyle = textColor
      ctx.globalAlpha = 0.85
    }
    
    if (selectedEffect !== 'outline') {
      ctx.fillStyle = textColor
    }
    
    if (activeLayer === 'text') {
      ctx.shadowColor = '#00eefc'
      ctx.shadowBlur = 20
    }
    
    if (selectedEffect !== 'outline') {
      ctx.fillText(customText, x, y)
    }
    
    ctx.restore()
  }

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setUploading(true)
    
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
        setActiveLayer('image')
      }
      reader.readAsDataURL(file)
      
      if (user) {
        try {
          await uploadAPI.uploadImage(file)
        } catch (error) {
          console.error('Server upload failed, using local preview:', error)
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
        setActiveLayer('image')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e) => e.preventDefault()

  // Mouse handlers for dragging
  const handleMouseDown = (e, type) => {
    e.preventDefault()
    if (type === 'text' && customText) {
      setIsDraggingText(true)
      setActiveLayer('text')
    } else if (type === 'image' && uploadedImage) {
      setIsDraggingImage(true)
      setActiveLayer('image')
    }
  }

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = ((e.clientX - rect.left) * scaleX / canvas.width) * 100
    const y = ((e.clientY - rect.top) * scaleY / canvas.height) * 100
    
    if (isDraggingText) {
      setTextPosition({ 
        x: Math.min(90, Math.max(10, x)), 
        y: Math.min(85, Math.max(15, y)) 
      })
    }
    if (isDraggingImage) {
      setImagePosition({ 
        x: Math.min(90, Math.max(10, x)), 
        y: Math.min(85, Math.max(15, y)) 
      })
    }
  }

  const handleMouseUp = () => {
    setIsDraggingText(false)
    setIsDraggingImage(false)
  }

  // Reset all customizations
  const handleReset = () => {
    setCustomText('')
    setUploadedImage(null)
    setSelectedColor('#ffffff')
    setTextPosition({ x: 50, y: 50 })
    setImagePosition({ x: 50, y: 50 })
    setImageScale(0.5)
    setImageRotation(0)
    setTextSize(40)
    setSelectedEffect('none')
    setActiveLayer(null)
  }

  // Export design as PNG
  const handleExportDesign = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const dataURL = canvas.toDataURL('image/png')
    setExportImageData(dataURL)
    setShowExportModal(true)
  }

  // Download design
  const handleDownload = () => {
    if (!exportImageData) return
    const link = document.createElement('a')
    link.download = `rivo-custom-${Date.now()}.png`
    link.href = exportImageData
    link.click()
    setShowExportModal(false)
  }

  // Share design (copy to clipboard)
  const handleCopyLink = async () => {
    if (!exportImageData) return
    try {
      // Convert base64 to blob for sharing
      const blob = await (await fetch(exportImageData)).blob()
      await navigator.clipboard.writeText('Design ready for sharing!')
      alert('Design copied! You can paste it in messages.')
    } catch (err) {
      alert('Could not copy. You can download instead.')
    }
  }

  // Add to cart with export prompt
  const handleAddToCartWithExport = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const designPreview = canvas.toDataURL('image/png')
    
    // Show export modal before adding to cart
    setExportImageData(designPreview)
    setShowExportModal(true)
  }

  // Continue to cart after export
  const handleContinueToCart = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const designPreview = canvas.toDataURL('image/png')
    
    const customizedProduct = {
      ...baseProduct,
      _id: baseProduct?._id || 'custom',
      id: baseProduct?._id || 'custom',
      name: customText ? `CUSTOM: ${customText}` : `CUSTOM: ${baseProduct?.name || 'T-Shirt'}`,
      price: (baseProduct?.price || 85) + 25,
      customDesign: {
        text: customText,
        image: uploadedImage,
        color: selectedColor,
        preview: designPreview
      }
    }
    
    addToCart(customizedProduct, selectedSize, selectedColor, quantity)
    setShowExportModal(false)
    alert('✅ Custom design added to cart!')
    navigate('/cart')
  }

  // Calculate total price
  const basePrice = baseProduct?.price || 85
  const customizationFee = (customText || uploadedImage) ? 25 : 0
  const totalPrice = (basePrice + customizationFee) * quantity

  return (
    <main 
      className="pt-28 pb-20 px-4 md:px-6 max-w-[1800px] mx-auto min-h-screen"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-primary font-headline text-sm font-bold tracking-[0.2em] uppercase mb-4">
          <span>Design Studio</span>
          <span className="w-12 h-[1px] bg-primary/30"></span>
          <span className="flex items-center gap-2 ml-auto">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-on-surface-variant text-xs">Live Preview</span>
          </span>
        </div>
        <h1 className="font-headline text-5xl md:text-7xl font-black italic tracking-tighter text-on-surface mb-2">
          CUSTOM LAB PRO
        </h1>
        <p className="text-on-surface-variant text-lg">
          {baseProduct ? `Customizing: ${baseProduct.name}` : 'Create your masterpiece'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-8">
          <div className="bg-surface-container-low rounded-2xl p-4 md:p-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-outline-variant/15">
              <div className="flex items-center gap-2">
                <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))} className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined">zoom_out</span>
                </button>
                <span className="text-sm font-bold min-w-[60px] text-center">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={() => setZoomLevel(z => Math.min(2, z + 0.1))} className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined">zoom_in</span>
                </button>
                <div className="w-px h-8 bg-outline-variant/20 mx-2"></div>
                <button onClick={() => setShowGrid(!showGrid)} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${showGrid ? 'bg-primary text-on-primary' : 'bg-surface-container-highest hover:bg-surface-bright'}`}>
                  <span className="material-symbols-outlined">grid_on</span>
                </button>
                <button onClick={handleReset} className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center hover:bg-error hover:text-on-error transition-all">
                  <span className="material-symbols-outlined">refresh</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={handleExportDesign} className="px-4 py-2 rounded-lg bg-surface-container-highest text-sm font-bold hover:bg-surface-bright transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div 
              className="relative rounded-xl overflow-hidden flex items-center justify-center"
              style={{ 
                background: showGrid ? '#1a1a1e' : 'transparent',
                minHeight: '500px'
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <canvas 
                ref={canvasRef}
                className="max-w-full h-auto cursor-crosshair"
                style={{ maxHeight: '600px' }}
              />
              
              {/* Drag handles */}
              {customText && (
                <div
                  className="absolute cursor-move"
                  style={{
                    left: `${textPosition.x}%`,
                    top: `${textPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none'
                  }}
                >
                  <div 
                    className={`w-6 h-6 rounded-full bg-primary border-2 border-white cursor-move ${activeLayer === 'text' ? 'scale-125' : ''}`}
                    style={{ pointerEvents: 'auto' }}
                    onMouseDown={(e) => handleMouseDown(e, 'text')}
                  />
                </div>
              )}
              
              {uploadedImage && (
                <div
                  className="absolute cursor-move"
                  style={{
                    left: `${imagePosition.x}%`,
                    top: `${imagePosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none'
                  }}
                >
                  <div 
                    className={`w-6 h-6 rounded-full bg-secondary border-2 border-white cursor-move ${activeLayer === 'image' ? 'scale-125' : ''}`}
                    style={{ pointerEvents: 'auto' }}
                    onMouseDown={(e) => handleMouseDown(e, 'image')}
                  />
                </div>
              )}
            </div>

            {/* Layer Indicator */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-outline-variant/15">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider">Layers:</span>
              {customText && (
                <button onClick={() => setActiveLayer('text')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeLayer === 'text' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  Text Layer
                </button>
              )}
              {uploadedImage && (
                <button onClick={() => setActiveLayer('image')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeLayer === 'image' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  Image Layer
                </button>
              )}
              {(customText || uploadedImage) && (
                <button onClick={() => { if (activeLayer === 'text') setCustomText(''); if (activeLayer === 'image') setUploadedImage(null); setActiveLayer(null); }} className="ml-auto text-error-dim hover:text-error text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Remove {activeLayer}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container rounded-2xl p-6 sticky top-28 max-h-[calc(100vh-150px)] overflow-y-auto">
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-surface-container-low rounded-xl p-1">
              {['design', 'product', 'effects'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Design Tab */}
              {activeTab === 'design' && (
                <motion.div key="design" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">Custom Text</label>
                    <input type="text" value={customText} onChange={(e) => { setCustomText(e.target.value); setActiveLayer('text'); }} placeholder="ENTER YOUR TEXT..." className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-on-surface font-headline focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                  </div>

                  {customText && (
                    <>
                      <div>
                        <label className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">Font Style</label>
                        <div className="grid grid-cols-3 gap-2">
                          {fonts.map(font => (
                            <button key={font.name} onClick={() => setSelectedFont(font.name)} className={`p-2 rounded-lg text-xs font-bold transition-all ${selectedFont === font.name ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
                              {font.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">Text Color</label>
                        <div className="flex flex-wrap gap-2">
                          {textColors.map(color => (
                            <button key={color} onClick={() => setTextColor(color)} className={`w-10 h-10 rounded-full border-2 transition-all ${textColor === color ? 'border-primary scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">Text Size: {textSize}px</label>
                        <input type="range" min="20" max="80" value={textSize} onChange={(e) => setTextSize(parseInt(e.target.value))} className="w-full accent-primary" />
                      </div>

                      <div className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg">
                        <span className="material-symbols-outlined text-sm me-2 align-middle">drag_pan</span>
                        Drag the blue handle to reposition text
                      </div>
                    </>
                  )}

                  <div className="pt-4 border-t border-outline-variant/15">
                    <label className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">Upload Design</label>
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-outline-variant/30 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-surface-container-low/50">
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                      {uploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-4xl mb-3 text-primary">cloud_upload</span>
                          <h4 className="font-headline font-bold mb-1">{uploadedImage ? 'Image Uploaded' : 'Upload Image'}</h4>
                          <p className="text-xs text-on-surface-variant">PNG, JPG, SVG (Max 10MB)</p>
                          <p className="text-xs text-primary mt-2">or drag and drop</p>
                        </>
                      )}
                    </div>
                  </div>

                  {uploadedImage && (
                    <>
                      <div>
                        <label className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">Image Scale: {Math.round(imageScale * 100)}%</label>
                        <input type="range" min="0.2" max="1.5" step="0.05" value={imageScale} onChange={(e) => setImageScale(parseFloat(e.target.value))} className="w-full accent-primary" />
                      </div>
                      <div>
                        <label className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">Rotation: {imageRotation}°</label>
                        <input type="range" min="-180" max="180" value={imageRotation} onChange={(e) => setImageRotation(parseInt(e.target.value))} className="w-full accent-primary" />
                      </div>
                      <div className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg">
                        <span className="material-symbols-outlined text-sm me-2 align-middle">drag_pan</span>
                        Drag the pink handle to reposition image
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Product Tab */}
              {activeTab === 'product' && (
                <motion.div key="product" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">Base Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {colors.map(color => (
                        <button key={color.value} onClick={() => setSelectedColor(color.value)} className={`w-full aspect-square rounded-xl border-2 transition-all hover:scale-105 ${selectedColor === color.value ? 'border-primary scale-105 shadow-lg' : 'border-outline-variant/20'}`} style={{ backgroundColor: color.value }} title={color.name} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">Select Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {sizes.map(size => (
                        <button key={size} onClick={() => setSelectedSize(size)} className={`py-3 rounded-lg text-sm font-bold transition-all ${selectedSize === size ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>{size}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-all">-</button>
                      <span className="text-2xl font-bold min-w-[40px] text-center">{quantity}</span>
                      <button onClick={() => setQuantity(q => Math.min(10, q + 1))} className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-all">+</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Effects Tab */}
              {activeTab === 'effects' && (
                <motion.div key="effects" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">Text Effects</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'none', name: 'None', icon: 'block' },
                      { id: 'glow', name: 'Neon Glow', icon: 'highlight' },
                      { id: 'shadow', name: '3D Shadow', icon: 'shadow' },
                      { id: 'outline', name: 'Outline', icon: 'border_color' }
                    ].map(effect => (
                      <button key={effect.id} onClick={() => setSelectedEffect(effect.id)} className={`p-4 rounded-xl transition-all ${selectedEffect === effect.id ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'} ${!customText ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!customText}>
                        <span className="material-symbols-outlined text-2xl mb-2 block">{effect.icon}</span>
                        <span className="text-xs font-bold uppercase">{effect.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Price Summary & Add to Cart */}
            <div className="mt-8 pt-6 border-t border-outline-variant/15">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Base Price:</span><span>₹{basePrice.toFixed(2)}</span></div>
                {customizationFee > 0 && (
                  <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Customization:</span><span className="text-primary">+₹{customizationFee.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Quantity:</span><span>x{quantity}</span></div>
                <div className="flex justify-between items-end pt-3 border-t border-outline-variant/15">
                  <span className="text-lg font-headline font-bold uppercase">Total</span>
                  <span className="text-3xl font-headline font-black text-primary">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handleAddToCartWithExport} className="w-full py-5 bg-primary text-on-primary rounded-xl font-headline font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">shopping_cart</span>
                Add to Cart
              </button>

              <p className="text-[10px] text-on-surface-variant text-center mt-4 uppercase tracking-wider">Ships in 3-5 business days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setShowExportModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="relative bg-surface-container-low rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-primary">download</span>
                </div>
                <h2 className="font-headline text-2xl font-black uppercase mb-2">Save Your Design</h2>
                <p className="text-on-surface-variant text-sm">
                  Would you like to download your custom design before adding to cart?
                </p>
              </div>

              {/* Design Preview */}
              {exportImageData && (
                <div className="bg-surface-container rounded-xl p-4 mb-6">
                  <img src={exportImageData} alt="Your Design" className="w-full rounded-lg" />
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-bold uppercase tracking-wider hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">download</span>
                  Download Design
                </button>
                
                <button
                  onClick={handleContinueToCart}
                  className="w-full py-4 bg-surface-container text-on-surface rounded-xl font-headline font-bold uppercase tracking-wider hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">shopping_cart</span>
                  Skip & Continue to Cart
                </button>
                
                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full py-3 text-on-surface-variant hover:text-on-surface text-sm uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inspiration Section */}
      <section className="mt-32">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-headline font-black uppercase italic tracking-tighter">Inspiration Lab</h2>
            <p className="text-on-surface-variant text-sm">See what the RIVO community is creating.</p>
          </div>
          <Link to="/collections" className="text-primary font-headline font-bold text-sm hover:underline tracking-widest flex items-center gap-2 group">
            VIEW ALL DROPS
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 md:row-span-2 bg-surface-container-low rounded-xl overflow-hidden group relative">
            <img alt="Custom design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60"></div>
            <div className="absolute bottom-8 left-8">
              <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-black tracking-widest mb-2 inline-block">FEATURED</span>
              <h4 className="text-2xl font-headline font-black">NEON VOID</h4>
              <p className="text-sm text-on-surface-variant">By @digital_creator</p>
            </div>
          </div>
          
          <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between group hover:bg-surface-container-high transition-colors">
            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-fixed flex items-center justify-center text-on-primary mb-4">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <h4 className="font-headline font-bold text-lg mb-2">AI Assistant</h4>
              <p className="text-xs text-on-surface-variant">Generate unique designs.</p>
            </div>
            <span className="text-xs text-primary font-bold mt-4">COMING SOON</span>
          </div>
          
          <div className="bg-surface-container-low rounded-xl overflow-hidden group">
            <img alt="Premium" className="w-full h-40 object-cover group-hover:scale-110 transition-transform" src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300" />
            <div className="p-4">
              <h4 className="font-headline font-bold">PREMIUM</h4>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">220GSM Cotton</p>
            </div>
          </div>
          
          <div className="md:col-span-2 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-8 flex items-center justify-between border border-primary/30">
            <div>
              <h4 className="text-3xl font-headline font-black uppercase tracking-tighter leading-none mb-2">CREATOR PROGRAM</h4>
              <p className="text-sm text-on-surface-variant">Sell your designs and earn royalties.</p>
            </div>
            <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-headline font-bold text-sm hover:scale-105 transition-transform">COMING SOON</button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default CustomizePage