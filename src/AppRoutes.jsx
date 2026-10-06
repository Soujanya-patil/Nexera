import { StrictMode, Suspense } from "react";
import { matchPath, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Seo from "./components/Seo";
import Home from "./pages/Home";
import {
  AboutRoute,
  BecomePartnerRoute,
  ContactRoute,
  HomeV2Route,
  HowItWorksRoute,
  NotFoundRoute,
  ProductDetailRoute,
  ProductsRoute,
  ResourcesRoute,
  ServiceTrainingRoute,
  SolutionsCIRoute,
  SolutionsResidentialRoute,
  SolutionsRoute,
  SolutionsUtilityRoute,
  WhereWeOperateRoute,
} from "./pages/lazy";

// Full viewport height so the footer stays below the fold while a route loads (no layout shift).
const PageFallback = () => <div className="min-h-svh bg-night" />;

// Every page but Home is its own chunk (pages/lazy.jsx): path → page.
const PAGES = [
  ["/about", AboutRoute],
  ["/products", ProductsRoute],
  ["/products/:productId", ProductDetailRoute],
  ["/solutions", SolutionsRoute],
  ["/solutions/utility-scale", SolutionsUtilityRoute],
  ["/solutions/commercial-industrial", SolutionsCIRoute],
  ["/solutions/residential", SolutionsResidentialRoute],
  ["/become-a-partner", BecomePartnerRoute],
  ["/how-it-works", HowItWorksRoute],
  ["/service-training", ServiceTrainingRoute],
  ["/where-we-operate", WhereWeOperateRoute],
  ["/resources", ResourcesRoute],
  ["/contact", ContactRoute],
  ["/home-v2", HomeV2Route], // preview of the new Home (noindex; routes.js PREVIEW_ROUTES)
];

/**
 * Loads the page chunk for `pathname` (nothing for Home, which is in the main bundle). The browser
 * awaits this before hydrating a pre-rendered page, so its first render is the same page the HTML
 * holds rather than a loading fallback.
 */
export function preloadRoute(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path === "/" || path === "/brands") return Promise.resolve();
  const hit = PAGES.find(([p]) => matchPath(p, path));
  return (hit ? hit[1] : NotFoundRoute).preload();
}

/**
 * The site's route tree, shared by the browser entry (main.jsx) and the build-time pre-renderer
 * (entry-server.jsx), so both render exactly the same pages. Home is part of the main bundle (the
 * main entry page); every other page is its own chunk (pages/lazy.jsx).
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        {PAGES.map(([path, Page]) => (
          <Route
            key={path}
            path={path}
            element={
              <Suspense fallback={<PageFallback />}>
                <Page />
              </Suspense>
            }
          />
        ))}
        {/* The catalogue replaced the Our Brands page; keep old links working. */}
        <Route path="/brands" element={<Navigate to="/products" replace />} />
        <Route
          path="*"
          element={
            <Suspense fallback={<PageFallback />}>
              <NotFoundRoute />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}

/**
 * The whole app inside a router: the same tree in the browser (BrowserRouter) and in the pre-render
 * (StaticRouter). <Seo> is part of both — it renders nothing until its route table has loaded in the
 * browser — so the two trees match node for node.
 */
export function App({ Router, routerProps }) {
  return (
    <StrictMode>
      <Router {...routerProps}>
        <Seo />
        <AppRoutes />
      </Router>
    </StrictMode>
  );
}
