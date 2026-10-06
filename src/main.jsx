import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

import { App, preloadRoute } from './AppRoutes'
import { loadRouteMeta } from './seo/loadRouteMeta'

// Motion is allowed: from here on the reveal styles may hold content hidden until GSAP animates it
// in (index.css gates them on this class, so without JavaScript — or under reduced motion —
// everything is simply visible). On a direct load nothing in the first viewport is ever held: the
// hold states only apply to content below the fold (lib/firstLoad).
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('js-motion')

// The served HTML carries this route's title, description and canonical for crawlers that don't run
// JavaScript (scripts/seo-pages.mjs; 404.html carries a noindex instead). <Seo> takes them over once
// its route table has loaded (after the first screen): at that moment drop the static copies, so
// there is exactly one of each and they follow client-side navigation. (This runs first: it is
// registered before <Seo> subscribes.)
loadRouteMeta().then(() =>
  document.head
    .querySelectorAll('title, meta[name="description"], link[rel="canonical"], meta[name="robots"]')
    .forEach((el) => el.remove()),
)

// Every route's HTML is pre-rendered at build time (entry-server.jsx): hydrate it — after loading the
// page's own chunk, so the first render is that page, exactly as pre-rendered. An empty root (no
// pre-rendered markup) is simply rendered.
const root = document.getElementById('root')
const app = <App Router={BrowserRouter} />
if (root.firstElementChild) preloadRoute(window.location.pathname).then(() => hydrateRoot(root, app))
else createRoot(root).render(app)
