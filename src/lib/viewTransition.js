import { useNavigate } from "react-router-dom";
import { getLenis } from "./lenis";

// Rendering (and so requestAnimationFrame) is paused while a View Transition waits for its DOM
// update, so wait with a MutationObserver plus a timer instead.
const waitFor = (selector, timeout = 1200) =>
  new Promise((resolve) => {
    if (document.querySelector(selector)) return resolve();
    const done = () => {
      observer.disconnect();
      clearTimeout(timer);
      resolve();
    };
    const observer = new MutationObserver(() => document.querySelector(selector) && done());
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = setTimeout(done, timeout);
  });

/**
 * Opens a product with a View Transition: the card's image (view-transition-name product-<id>)
 * morphs into the product page's hero image, which carries the same name, while the rest of the
 * page cross-fades (styles in index.css). The transition's "new" state is captured once that hero
 * image is in the DOM — the route renders asynchronously, so we wait for it rather than assume.
 *
 * Returns an onClick handler for a <Link>. Falls back to the Link's normal navigation when the API
 * is missing, for modified clicks (new tab etc.) and under prefers-reduced-motion.
 */
export function useProductTransition(productId) {
  const navigate = useNavigate();
  return (e) => {
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    e.preventDefault();
    // Settle any scroll still in flight (a native smooth scroll or a Lenis glide): otherwise it keeps
    // running through the route change and lands the new page part-way down instead of at the top.
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    else window.scrollTo({ top: window.scrollY, behavior: "instant" });
    document.startViewTransition(async () => {
      navigate(`/products/${productId}`);
      await waitFor(`[data-vt-hero="${productId}"]`);
    });
  };
}
