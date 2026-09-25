import { useEffect, useState } from "react";
import { loadGsap } from "./motion";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One GSAP entrance timeline for a hero. Put `data-intro={intro}` on the root and `data-a` on each
 * animated part: index.css holds `[data-intro="pending"] [data-a]` at opacity 0 until the timeline
 * exists (no flash of the final state), after which GSAP's inline styles own them. `build({ tl, q })`
 * adds the tweens; each should end with `clearProps` so nothing is left inline. If GSAP is slow or
 * fails the parts are simply shown after 2.5 s; under prefers-reduced-motion nothing is hidden.
 */
export function useIntro(ref, build) {
  const [intro, setIntro] = useState(() => (reduced() ? "done" : "pending"));

  useEffect(() => {
    if (reduced()) return;
    const el = ref.current;
    let cancelled = false;
    let ctx;
    const safety = setTimeout(() => !cancelled && setIntro("done"), 2500);
    loadGsap()
      .then(({ gsap }) => {
        if (cancelled || !el) return;
        clearTimeout(safety);
        ctx = gsap.context(() => {
          const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: () => !cancelled && setIntro("done") });
          build({ tl, q: gsap.utils.selector(el), gsap });
          setIntro("running");
        }, el);
      })
      .catch(() => !cancelled && setIntro("done"));
    return () => {
      cancelled = true;
      clearTimeout(safety);
      ctx?.revert();
    };
    // `build` is read once, at mount.
  }, [ref]);

  return intro;
}
