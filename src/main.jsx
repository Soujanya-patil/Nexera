import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Solutions from './pages/Solutions'
import BecomePartner from './pages/BecomePartner'
import HowItWorks from './pages/HowItWorks'
import ServiceTraining from './pages/ServiceTraining'
import WhereWeOperate from './pages/WhereWeOperate'
import Resources from './pages/Resources'
import Contact from './pages/Contact'

// The product pages carry the motion-based registry components (Unlumen Tilt, SmoothUI tabs), so
// they are split out: the motion runtime only loads when someone opens the catalogue.
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const PageFallback = () => <div className="min-h-[70svh] bg-night" />

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Suspense fallback={<PageFallback />}><Products /></Suspense>} />
          <Route path="/products/:productId" element={<Suspense fallback={<PageFallback />}><ProductDetail /></Suspense>} />
          {/* The catalogue replaced the Our Brands page; keep old links working. */}
          <Route path="/brands" element={<Navigate to="/products" replace />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/become-a-partner" element={<BecomePartner />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/service-training" element={<ServiceTraining />} />
          <Route path="/where-we-operate" element={<WhereWeOperate />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
