import { createElement, useEffect, useRef } from "react";
import { loadGsap } from "../../lib/motion";

/**
 * Section-heading reveal (level 3): the words rise in with a short stagger the first time the heading
 * scrolls into view — GSAP SplitText + ScrollTrigger, run once, then everything is reverted to plain
 * text. The heading is fully visible until GSAP has loaded and never re-animates, and nothing runs
 * under prefers-reduced-motion. Use on section headings only, not body copy.
 */
export default function AnimatedText({ as = "h2", className = "", children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let ctx;
    let split;
    Promise.all([loadGsap(), import("gsap/SplitText")]).then(([{ gsap }, { SplitText }]) => {
      if (cancelled || !ref.current) return;
      gsap.registerPlugin(SplitText);
      ctx = gsap.context(() => {
        split = new SplitText(el, { type: "words", wordsClass: "inline-block will-change-transform" });
        gsap.from(split.words, {
          yPercent: 55,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.045,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onComplete: () => split?.revert(),
        });
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
      split?.revert();
    };
  }, []);

  return createElement(as, { ref, className, ...rest }, children);
}
