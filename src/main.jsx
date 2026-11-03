import './lib/featureGuards'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

import { App, preloadRoute } from './AppRoutes'
import StartupBoundary, { captureHead } from './components/StartupBoundary'

// Motion is allowed: from here on the reveal styles may hold content hidden until GSAP animates it
// in (index.css gates them on this class, so without JavaScript — or under reduced motion —
// everything is simply visible). On a direct load nothing in the first viewport is ever held: the
// hold states only apply to content below the fold (lib/firstLoad).
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('js-motion')

// The page as served, kept for StartupBoundary: if the app stops on an error, this is put back.
const root = document.getElementById('root')
const prerendered = root.innerHTML
const servedHead = captureHead()

// The served HTML carries this route's title, description and canonical for crawlers that don't run
// JavaScript (scripts/seo-pages.mjs; 404.html carries a noindex instead). <Seo> updates those same
// elements in place as the route changes, so there is always exactly one of each.

// Every route's HTML is pre-rendered at build time (entry-server.jsx): hydrate it — after loading the
// page's own chunk, so the first render is that page, exactly as pre-rendered. An empty root (no
// pre-rendered markup) is simply rendered.
const app = (
  <StartupBoundary path={window.location.pathname} html={prerendered} head={servedHead}>
    <App Router={BrowserRouter} />
  </StartupBoundary>
)
if (root.firstElementChild) preloadRoute(window.location.pathname).then(() => hydrateRoot(root, app))
else createRoot(root).render(app)
