import { StrictMode, Suspense } from 'react'
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

import { ProductsRoute, ProductDetailRoute } from './pages/lazy'

// Product pages are split out (see pages/lazy.jsx); the motion runtime only loads with them.
// Full viewport height so the footer stays below the fold while a route loads (no layout shift).
const PageFallback = () => <div className="min-h-svh bg-night" />

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Suspense fallback={<PageFallback />}><ProductsRoute /></Suspense>} />
          <Route path="/products/:productId" element={<Suspense fallback={<PageFallback />}><ProductDetailRoute /></Suspense>} />
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
