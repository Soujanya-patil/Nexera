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
