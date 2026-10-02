import { useEffect } from "react";
import { loadGsap } from "./motion";

/**
 * Where scroll-scrubbed motion runs: desktop-sized screens (at least 1024 × 640) with motion allowed.
 * Everywhere else the scrubbed elements simply show their final state.
 */
export const SCRUB_QUERY = "(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)";

/** Smoothing for every scrub (seconds the animation takes to catch up with the scroll position). */
export const SCRUB = 0.6;

/**
 * Runs `setup({ gsap, ScrollTrigger, el })` inside a gsap.matchMedia scope while SCRUB_QUERY
 * matches. Everything created in it (tweens, ScrollTriggers, pins) is reverted automatically when
 * the query stops matching or the component unmounts — no leaks across route changes. `setup` may
 * return a cleanup function for anything else it changed (e.g. restoring final-state attributes).
 */
export function useScrub(ref, setup, deps = []) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let mm;
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      mm = gsap.matchMedia();
      mm.add(SCRUB_QUERY, () => setup({ gsap, ScrollTrigger, el }));
    });
    return () => {
      cancelled = true;
      mm?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
