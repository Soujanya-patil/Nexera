import { loadGsap } from "./motion";

/**
 * Site-wide smooth scroll (one instance, mounted once from Layout — not per-section). Lenis
 * intercepts and replaces native scrolling, and this project's most important interaction
 * (CabinetAnatomy's pinned, scroll-scrubbed video) depends on GSAP ScrollTrigger reading native
 * scroll events — so the two are explicitly kept on the same clock, the standard Lenis+GSAP
 * integration:
 *   - `lenis.on("scroll", ScrollTrigger.update)` — ScrollTrigger re-evaluates on every Lenis tick,
 *     not just on native `scroll` events (which Lenis no longer dispatches at the same cadence).
 *   - Lenis's own raf loop is driven by `gsap.ticker` instead of a second independent
 *     `requestAnimationFrame` loop, so Lenis and every GSAP-driven tween (the video scrub's
 *     timeline included) advance on the same frame, not two slightly-offset clocks.
 *   - `gsap.ticker.lagSmoothing(0)` disables GSAP's own lag-compensation jump, which would
 *     otherwise fight with Lenis's easing after a long task stalls the main thread.
 *
 * Skipped entirely for `prefers-reduced-motion` — native scroll, no Lenis, no GSAP ticker hookup.
 * Returns a cleanup function; safe to call once from a component that stays mounted for the life
 * of the app (Layout does, via nested routes).
 */
let active = null;

/** The live Lenis instance, or null (reduced motion, not yet loaded, or torn down). */
export const getLenis = () => active;

/**
 * Jump to a scroll position without easing. Goes through Lenis when it is running, so its internal
 * target can't pull the page back toward a previous position; plain window.scrollTo otherwise.
 */
export function jumpTo(top) {
  if (active) active.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, behavior: "instant" });
}

export function initSmoothScroll() {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  let cancelled = false;
  let lenis;
  let gsapRef;
  let onTick;

  Promise.all([loadGsap(), import("lenis")]).then(([{ gsap, ScrollTrigger }, { default: Lenis }]) => {
    // Guard against a second instance (StrictMode re-runs effects; the first run is cancelled).
    if (cancelled || active) return;
    // Wheel inside [data-lenis-prevent] (modals, horizontally scrolling rows) scrolls natively.
    lenis = new Lenis();
    active = lenis;
    gsapRef = gsap;
    lenis.on("scroll", ScrollTrigger.update);
    onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
  });

  return () => {
    cancelled = true;
    if (onTick && gsapRef) gsapRef.ticker.remove(onTick);
    if (active === lenis) active = null;
    lenis?.destroy();
  };
}
