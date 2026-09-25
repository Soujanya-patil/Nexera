import { useEffect, useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import { initSmoothScroll, jumpTo } from "../lib/lenis";

/**
 * On navigation: jump to the #hash target if there is one (e.g. /solutions#ci), otherwise to the top.
 * A layout effect, so the jump lands before paint — and before a View Transition takes its "new"
 * snapshot, which would otherwise morph toward where the page was scrolled before.
 */
function useScrollOnNavigate() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    // Clear the sticky nav (h-16) when landing on a section
    jumpTo(target ? target.getBoundingClientRect().top + window.scrollY - 64 : 0);
  }, [pathname, hash]);
}

export default function Layout() {
  // Mounted once for the life of the app (nested routes keep Layout mounted across navigation;
  // only <Outlet />'s content swaps) — the single Lenis instance the whole site scrolls through.
  useEffect(() => initSmoothScroll(), []);
  useScrollOnNavigate();

  return (
    <div>
      <Nav />
      <Outlet />
      <Footer />
    </div>
  );
}
