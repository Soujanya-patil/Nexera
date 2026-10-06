import { useEffect, useState } from "react";
import { loadGsap } from "./motion";
import { isFirstLoad } from "./firstLoad";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A section's own entrance: one GSAP timeline, built by `build({ tl, q, gsap })` and played once when
 * the section reaches `start` (ScrollTrigger). Put `data-enter={state}` on the section root and
 * `data-e` on each part the timeline brings in: index.css holds `[data-enter="pending"] [data-e]` at
 * opacity 0 until GSAP exists (no flash of the final state); each tween should end with `clearProps`.
 * A section already scrolled past when the page loads simply shows. If GSAP is slow or fails, the
 * parts are shown after 3 s; under prefers-reduced-motion nothing is hidden or animated.
 *
 * First load (a direct visit; lib/firstLoad): nothing is held by CSS ("idle"); when GSAP arrives, a
 * section already on screen (or passed) is simply shown in its final state, and only a section still
 * below the viewport takes its waiting state and plays its entrance as it arrives.
 */
export function useEntrance(ref, build, { start = "top 78%" } = {}) {
  const [state, setState] = useState(() => (typeof window === "undefined" || isFirstLoad() ? "idle" : reduced() ? "done" : "pending"));
  const first = state === "idle";

  useEffect(() => {
    if (reduced()) return;
    const el = ref.current;
    let cancelled = false;
    let ctx;
    const safety = setTimeout(() => !cancelled && setState("done"), 3000);
    loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled || !el) return;
        clearTimeout(safety);
        ctx = gsap.context(() => {
          const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" }, onComplete: () => !cancelled && setState("done") });
          build({ tl, q: gsap.utils.selector(el), gsap });
          const st = ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => tl.play() });
          // Already passed — or, on a first load, already on screen: just show it (same frame, no flash).
          if (window.scrollY > st.start || (first && el.getBoundingClientRect().top < window.innerHeight)) tl.progress(1);
          if (!first) setState("ready");
        }, el);
      })
      .catch(() => !cancelled && setState("done"));
    return () => {
      cancelled = true;
      clearTimeout(safety);
      ctx?.revert();
    };
    // `build` is read once, at mount.
  }, [ref, start]);

  return state;
}
