import { useEffect, useState } from "react";
import { loadGsap } from "./motion";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Reveal timing shared by every scroll reveal on the site (useScrollReveal and AnimatedText). */
export const REVEAL = {
  // Begins the moment the element's top enters the viewport. (A later line, e.g. 92%, leaves
  // anything sitting in the bottom of the screen fully visible but still waiting, i.e. blank.)
  start: "top bottom",
  duration: 0.4,
  ease: "power2.out",
  y: 14,
  stagger: 0.04, // per item…
  maxStagger: 0.2, // …and never more than this across a group
  // Scrolling faster than an unhurried reading pace (px/s) skips the animation: the content is simply
  // shown, so a quick scroll never passes text that is still fading in.
  fastScroll: 700,
};

/** True when the trigger's scroll is moving fast enough that a reveal would be caught mid-fade. */
export const scrollingFast = (trigger) => Math.abs(trigger?.getVelocity?.() ?? 0) > REVEAL.fastScroll;

/**
 * Section-level reveal (GSAP ScrollTrigger.batch): every `[data-sr]` element inside `ref` fades and
 * rises in once as it enters the viewport (REVEAL timing), elements entering together staggered.
 * Put `data-sr-state={state}` on the container: index.css holds items at opacity 0 only while it is
 * "pending" AND <html> has the `js-motion` class (main.jsx adds it when motion is allowed), so
 * content is visible by default.
 *
 * Never leaves content hidden: items already scrolled past when the reveal is set up are shown at
 * once; an item passed or re-entered without its reveal running (a jump or a fast fling) is shown at
 * once; a fast scroll shows items instead of animating them. Runs once — scrolling back up never
 * hides anything. Elements that are display:none at setup (filtered-out cards) are left alone.
 * Reverted on unmount; nothing is hidden under prefers-reduced-motion.
 */
export function useScrollReveal(ref, { stagger = REVEAL.stagger, y = REVEAL.y, start = REVEAL.start } = {}) {
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
          // Only this container's own items (a nested reveal handles its own) and only rendered ones.
          const items = [...el.querySelectorAll("[data-sr]")].filter(
            (n) => n.closest("[data-sr-state]") === el && n.getClientRects().length > 0
          );
          const show = (batch) => gsap.set(batch, { opacity: 1, y: 0, clearProps: "opacity,transform" });
          // Already above the viewport: nothing to reveal.
          const pending = items.filter((n) => n.getBoundingClientRect().bottom > 0);
          show(items.filter((n) => !pending.includes(n)));
          gsap.set(pending, { opacity: 0, y: Math.min(y, REVEAL.y) });
          ScrollTrigger.batch(pending, {
            start,
            once: true,
            onEnter: (batch, triggers) => {
              if (scrollingFast(triggers[0])) return show(batch);
              const each = Math.min(stagger, REVEAL.stagger, batch.length > 1 ? REVEAL.maxStagger / (batch.length - 1) : REVEAL.stagger);
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: REVEAL.duration,
                ease: REVEAL.ease,
                stagger: each,
                overwrite: true,
                clearProps: "opacity,transform",
              });
            },
            onLeave: show,
            onEnterBack: show,
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
