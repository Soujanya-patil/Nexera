import { useEffect, useState } from "react";
import { loadGsap } from "./motion";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Section-level reveal (GSAP ScrollTrigger.batch): every `[data-sr]` element inside `ref` rises in
 * (opacity + y, no sideways travel) as it enters the viewport, with elements that enter together
 * staggered by `stagger` seconds. Put `data-sr-state={state}` on the container: index.css holds items
 * at opacity 0 only while it is "pending". Elements that are display:none when the reveal is set up
 * (e.g. filtered-out cards) are left alone, so showing them later never finds them invisible.
 * Reverted on unmount; nothing is hidden under prefers-reduced-motion.
 */
export function useScrollReveal(ref, { stagger = 0.09, y = 24, start = "top 90%" } = {}) {
  const [state, setState] = useState(() => (reduced() ? "done" : "pending"));

  useEffect(() => {
    if (reduced()) return;
    const el = ref.current;
    let cancelled = false;
    let ctx;
    const safety = setTimeout(() => !cancelled && setState("done"), 2500);
    loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled || !el) return;
        clearTimeout(safety);
        ctx = gsap.context(() => {
          // Only this container's own items (a nested reveal, e.g. the CTA band, handles its own) and
          // only ones currently rendered.
          const items = [...el.querySelectorAll("[data-sr]")].filter(
            (n) => n.closest("[data-sr-state]") === el && n.getClientRects().length > 0
          );
          gsap.set(items, { opacity: 0, y });
          ScrollTrigger.batch(items, {
            start,
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger, overwrite: true, clearProps: "opacity,transform" }),
          });
          setState("ready");
        }, el);
      })
      .catch(() => !cancelled && setState("done"));
    return () => {
      cancelled = true;
      clearTimeout(safety);
      ctx?.revert();
    };
  }, [ref, stagger, y, start]);

  return state;
}
