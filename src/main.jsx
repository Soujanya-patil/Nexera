import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import Layout from './components/Layout'
import Seo from './components/Seo'
import Home from './pages/Home'
import About from './pages/About'
import BecomePartner from './pages/BecomePartner'
import HowItWorks from './pages/HowItWorks'
import ServiceTraining from './pages/ServiceTraining'
import WhereWeOperate from './pages/WhereWeOperate'
import Resources from './pages/Resources'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

import { ProductsRoute, ProductDetailRoute, SolutionsRoute, SolutionsUtilityRoute, SolutionsCIRoute, SolutionsResidentialRoute } from './pages/lazy'

// Product pages are split out (see pages/lazy.jsx); the motion runtime only loads with them.
// Full viewport height so the footer stays below the fold while a route loads (no layout shift).
const PageFallback = () => <div className="min-h-svh bg-night" />

// Motion is allowed: from here on the reveal styles may hold content hidden until GSAP animates it
// in (index.css gates them on this class, so without JavaScript — or under reduced motion —
// everything is simply visible).
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('js-motion')

// The served HTML carries this route's title, description and canonical for crawlers that don't run
// JavaScript (scripts/seo-pages.mjs; 404.html carries a noindex instead). From here on <Seo> renders
// them per route, so drop the static copies: exactly one of each, and they follow client-side
// navigation.
document.head
  .querySelectorAll('title, meta[name="description"], link[rel="canonical"], meta[name="robots"]')
  .forEach((el) => el.remove());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Seo />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Suspense fallback={<PageFallback />}><ProductsRoute /></Suspense>} />
          <Route path="/products/:productId" element={<Suspense fallback={<PageFallback />}><ProductDetailRoute /></Suspense>} />
          {/* The catalogue replaced the Our Brands page; keep old links working. */}
          <Route path="/brands" element={<Navigate to="/products" replace />} />
          <Route path="/solutions" element={<Suspense fallback={<PageFallback />}><SolutionsRoute /></Suspense>} />
          <Route path="/solutions/utility-scale" element={<Suspense fallback={<PageFallback />}><SolutionsUtilityRoute /></Suspense>} />
          <Route path="/solutions/commercial-industrial" element={<Suspense fallback={<PageFallback />}><SolutionsCIRoute /></Suspense>} />
          <Route path="/solutions/residential" element={<Suspense fallback={<PageFallback />}><SolutionsResidentialRoute /></Suspense>} />
          <Route path="/become-a-partner" element={<BecomePartner />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/service-training" element={<ServiceTraining />} />
          <Route path="/where-we-operate" element={<WhereWeOperate />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
