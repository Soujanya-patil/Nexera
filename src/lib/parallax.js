import { useEffect } from "react";
import { loadGsap } from "./motion";

/**
 * Scroll parallax for an image inside a clipping frame (level 3): the element drifts vertically by
 * ±`amount` % of its own height while its trigger crosses the viewport (GSAP ScrollTrigger, scrubbed).
 * Give the element some overscan (e.g. h-[112%] -top-[6%]) so the drift never shows an edge.
 * Halved on small screens, off under prefers-reduced-motion; the tween and trigger are reverted on
 * unmount.
 */
export function useParallax(ref, { amount = 6, trigger } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = window.matchMedia("(max-width: 767px)").matches ? amount / 2 : amount;
    let cancelled = false;
    let ctx;
    loadGsap().then(({ gsap }) => {
      if (cancelled || !ref.current) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { yPercent: -a },
          {
            yPercent: a,
            ease: "none",
            scrollTrigger: { trigger: trigger?.current ?? el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 },
          }
        );
      });
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [ref, amount, trigger]);
}
