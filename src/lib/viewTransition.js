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
    // The route fade (Layout) would hide the morph target mid-capture, so it is off during the transition.
    const root = document.documentElement;
    root.dataset.vt = "true";
    const vt = document.startViewTransition(async () => {
      navigate(`/products/${productId}`);
      await waitFor(`[data-vt-hero="${productId}"]`);
    });
    vt.finished.finally(() => delete root.dataset.vt);
  };
}

/**
 * Navigates to `to` inside a View Transition (same-document, React Router): elements sharing a
 * view-transition-name on the old and new page morph into each other (on the Solutions pages: the
 * segment photo only, never text). The rest of the page does not cross-fade: the old page fades out
 * in 150 ms first and only then does the new one fade in (html[data-vt-fade], index.css), so old and
 * new text are never on screen together. The new state is captured once `waitSelector` is in the
 * DOM. Sets html[data-vt] for the duration, so the route fade stands aside, and html[data-vt-seg] =
 * `segment`: only that segment's photos (hub card, segment hero: [data-vt-img]) get a
 * view-transition-name (index.css), so no other card's photo can linger as a ghost over the new page.
 * `before()` runs just before the transition starts (e.g. to name the element the photo should grow
 * out of) and may return an undo, run once the old state is captured. Returns an onClick for a
 * <Link>; falls back to normal navigation (the route fade) without the API, for modified clicks and
 * under reduced motion.
 */
export function useRouteTransition(to, waitSelector, { segment, before } = {}) {
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
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    else window.scrollTo({ top: window.scrollY, behavior: "instant" });
    const root = document.documentElement;
    root.dataset.vt = "true";
    root.dataset.vtFade = "";
    if (segment) root.dataset.vtSeg = segment;
    const undo = before?.(e);
    const vt = document.startViewTransition(async () => {
      undo?.();
      navigate(to);
      await waitFor(waitSelector);
    });
    vt.finished.finally(() => {
      delete root.dataset.vt;
      delete root.dataset.vtFade;
      delete root.dataset.vtFrom;
      delete root.dataset.vtSeg;
    });
  };
}
