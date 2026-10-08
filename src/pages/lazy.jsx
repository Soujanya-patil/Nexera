import { lazy } from "react";

/**
 * A lazily loaded route that can also be preloaded. Once its module has arrived the component is
 * rendered directly, so navigating to it never suspends: important for the card → product View
 * Transition, which would otherwise snapshot the loading fallback instead of the product page.
 */
function preloadable(factory) {
  let Loaded = null;
  let pending = null;
  const preload = () =>
    (pending ??= factory().then((m) => {
      Loaded = m.default;
      return m;
    }));
  const Lazy = lazy(preload);
  function Route(props) {
    return Loaded ? <Loaded {...props} /> : <Lazy {...props} />;
  }
  Route.preload = preload;
  return Route;
}

// The product pages carry the motion-based registry components (Unlumen Tilt, SmoothUI tabs, the
// live count), so they are split from the main bundle.
export const ProductsRoute = preloadable(() => import("./Products"));
export const ProductDetailRoute = preloadable(() => import("./ProductDetail"));
// Partner pages (/partners/:partnerId): one template for every technology partner.
export const PartnerRoute = preloadable(() => import("./Partner"));
// Articles (/resources/:slug): one template for every guide.
export const ArticleRoute = preloadable(() => import("./Article"));

// The three Solutions pages are long and only needed on their own routes, so they load on demand too.
export const SolutionsRoute = preloadable(() => import("./Solutions"));
export const SolutionsUtilityRoute = preloadable(() => import("./SolutionsUtility"));
export const SolutionsCIRoute = preloadable(() => import("./SolutionsCI"));
export const SolutionsResidentialRoute = preloadable(() => import("./SolutionsResidential"));

// Every other page except Home (the main entry page) is its own chunk too, so a visitor downloads
// only the page they opened; each page's data (catalogue, EPC content) travels with it.
export const AboutRoute = preloadable(() => import("./About"));
export const BecomePartnerRoute = preloadable(() => import("./BecomePartner"));
export const HowItWorksRoute = preloadable(() => import("./HowItWorks"));
export const ServiceTrainingRoute = preloadable(() => import("./ServiceTraining"));
export const WhereWeOperateRoute = preloadable(() => import("./WhereWeOperate"));
export const ResourcesRoute = preloadable(() => import("./Resources"));
export const ContactRoute = preloadable(() => import("./Contact"));
export const NotFoundRoute = preloadable(() => import("./NotFound"));

// Preview of the new Home (noindex, not in the sitemap or the nav) — /home-v2.
export const HomeV2Route = preloadable(() => import("./HomeV2"));
