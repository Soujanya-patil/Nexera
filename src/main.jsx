import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import OurBrands from './pages/OurBrands'
import Solutions from './pages/Solutions'
import BecomePartner from './pages/BecomePartner'
import HowItWorks from './pages/HowItWorks'
import ServiceTraining from './pages/ServiceTraining'
import WhereWeOperate from './pages/WhereWeOperate'
import Resources from './pages/Resources'
import Contact from './pages/Contact'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/brands" element={<OurBrands />} />
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
