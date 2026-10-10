import { getLenis } from "./lenis";

/**
 * onClick handler for an in-page link: glides to the element with `id` (through Lenis when it is
 * running, native scrolling otherwise) and clears the sticky nav. Focus moves to the target without
 * a second jump, so keyboard and screen-reader users land where the page scrolled to.
 * Modified clicks (new tab, etc.) are left to the browser.
 */
// The pending landing check of the last glide: a new glide, or the reader scrolling, cancels it (it
// would otherwise pull the page back to the earlier target).
let cancelSettle = () => {};
const USER_SCROLL = ["wheel", "touchstart", "keydown"];

export const scrollToId = (id, { offset = -64 } = {}) => (e) => {
  const target = document.getElementById(id);
  if (!target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = getLenis();
  cancelSettle();
  let live = true;
  const stop = () => {
    live = false;
    USER_SCROLL.forEach((t) => window.removeEventListener(t, stop));
  };
  USER_SCROLL.forEach((t) => window.addEventListener(t, stop, { passive: true }));
  cancelSettle = stop;
  // Content above can still settle while the glide runs (lazy images, heading reveals), so the landing
  // is checked and corrected with a short second glide if it drifted.
  const drifted = () => live && Math.abs(target.getBoundingClientRect().top + offset) > 2;
  // A position, not the element: given an element, Lenis also subtracts the element's own
  // scroll-margin-top, which would double the clearance where a section sets one.
  const y = () => target.getBoundingClientRect().top + window.scrollY + offset;
  const settle = () => {
    if (drifted()) lenis.scrollTo(y(), { duration: 0.4 });
    // A heading revealed during the glide can re-wrap for a moment after it; check once more — unless
    // the page has been scrolled away from the landing meanwhile (the reader, e.g. by the scrollbar).
    const landed = Math.round(y());
    setTimeout(() => {
      if (Math.abs(window.scrollY - landed) <= 2 && drifted()) lenis.scrollTo(y(), { duration: 0.4 });
      stop();
    }, 1000);
  };
  if (lenis) lenis.scrollTo(y(), { duration: 1.2, onComplete: settle });
  else {
    stop();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior: reduce ? "auto" : "smooth" });
  }
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
};
