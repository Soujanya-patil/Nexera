import { useEffect, useState } from "react";
import { loadGsap } from "./motion";

/** Live `matchMedia` result, updated when the query flips (resize, rotation, OS motion setting). */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/**
 * Scroll-driven step progression (GSAP ScrollTrigger). While `ref`'s element crosses the
 * start → end range, its progress (0…1) is written to the element as the CSS variable --progress
 * (for scrubbed CSS transforms and fills, no React render per frame) and turned into the active step
 * index, which is returned — React only re-renders when the step actually changes.
 *
 * Pass `enabled: false` (e.g. reduced motion, or a layout that is not on screen) and nothing is
 * created: the step stays at 0 and --progress is unset. The trigger is reverted on unmount.
 */
export function useScrollSteps(ref, count, { start = "top top", end = "bottom bottom", enabled = true } = {}) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let cancelled = false;
    let ctx;
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !ref.current) return;
      const sync = (self) => {
        el.style.setProperty("--progress", self.progress.toFixed(4));
        setStep(Math.min(count - 1, Math.floor(self.progress * count)));
      };
      ctx = gsap.context(() => {
        ScrollTrigger.create({ trigger: el, start, end, onUpdate: sync, onRefresh: sync });
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
      el.style.removeProperty("--progress");
    };
  }, [ref, count, start, end, enabled]);
  return step;
}
