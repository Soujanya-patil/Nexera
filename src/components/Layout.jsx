import { useEffect, useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import { initSmoothScroll, jumpTo } from "../lib/lenis";
import { loadRouteMeta } from "../seo/loadRouteMeta";
import { isFirstLoad, markNavigated } from "../lib/firstLoad";

/**
 * On navigation: jump to the #hash target if there is one (e.g. /solutions#ci), otherwise to the top.
 * A layout effect, so the jump lands before paint — and before a View Transition takes its "new"
 * snapshot, which would otherwise morph toward where the page was scrolled before.
 */
function useScrollOnNavigate() {
  const { pathname, hash, key } = useLocation();
  useLayoutEffect(() => {
    // The location the page was opened at (React Router's "default" key; every navigation, hash-only
    // ones included, gets a new key): the browser has already placed the pre-rendered page — at the
    // top, at its #hash target, or wherever the visitor scrolled before the app took over. Leave it.
    // (Coming back to it later — Back after a navigation — jumps as before: no longer the first load.)
    if (key === "default" && isFirstLoad()) return;
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    // Clear the sticky nav (h-16) when landing on a section — or the section's own scroll-margin-top
    // where it sets a larger one (the Solutions segment pages also clear their segment switcher).
    const clear = target ? Math.max(64, parseFloat(getComputedStyle(target).scrollMarginTop) || 0) : 0;
    jumpTo(target ? target.getBoundingClientRect().top + window.scrollY - clear : 0);
    // Only path and #hash changes move the page (a query-string change, e.g. the catalogue's filters,
    // does not); `key` is read, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash]);
}

// The path the page was loaded with (a direct load); any other path got here by client-side navigation.
const firstPath = typeof window === "undefined" ? null : window.location.pathname;

export default function Layout() {
  // Mounted once for the life of the app (nested routes keep Layout mounted across navigation;
  // only <Outlet />'s content swaps) — the single Lenis instance the whole site scrolls through.
  useEffect(() => initSmoothScroll(), []);
  useScrollOnNavigate();
  const { pathname } = useLocation();
  // Any path other than the one the page was opened with was reached by client-side navigation:
  // marked here, while rendering, so the new page's first render already knows (lib/firstLoad).
  if (firstPath !== null && pathname !== firstPath) markNavigated();
  // A client-side navigation needs the new page's title at once: don't wait for the idle moment.
  useEffect(() => {
    if (pathname !== firstPath) loadRouteMeta({ now: true });
  }, [pathname]);
  // A page arriving by a View Transition doesn't get the route fade at all (decided as it renders):
  // toggling the animation off only while html[data-vt] is set made it restart — a blank flash — the
  // moment the transition ended and the flag was removed.
  // The first render (a direct load: the pre-rendered page is already on screen) doesn't fade in either.
  const fade = isFirstLoad() || document.documentElement.dataset.vt === "true" ? "" : "route-fade";

  return (
    <div>
      <Nav />
      {/* The page's main content: the one <main> landmark on every route (pages render none). */}
      <main id="main">
        {/* Route change: the new page fades in (opacity only — no transform, so sticky/fixed children
            and scroll measurements are unaffected). Keyed by path, so filter/query and #hash changes
            don't re-trigger it; skipped for a page opened by a View Transition and under reduced motion. */}
        <div key={pathname} className={fade}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
