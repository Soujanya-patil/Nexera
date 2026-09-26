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
    Promise.all([loadGsap(), import("gsap/SplitText")]).then(([{ gsap, ScrollTrigger }, { SplitText }]) => {
      if (cancelled || !ref.current) return;
      // Already scrolled past (e.g. arriving on a #section link): nothing to show, and splitting would
      // only re-wrap the heading for a moment and shift the page under the reader.
      if (el.getBoundingClientRect().bottom < 0) return;
      gsap.registerPlugin(SplitText);
      ctx = gsap.context(() => {
        // Split only when the heading arrives (not at mount), and hold its width for the moment it is
        // split: in a flex row the word boxes can size the heading differently, re-wrapping it and
        // shifting everything below. The split is reverted, and the width released, when it lands.
        const width = el.style.width;
        const restore = () => (el.style.width = width);
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => {
            // A couple of pixels of slack: the word boxes can round a fraction wider than the text.
            el.style.width = `${Math.ceil(el.getBoundingClientRect().width) + 2}px`;
            split = new SplitText(el, { type: "words", wordsClass: "inline-block will-change-transform" });
            gsap.from(split.words, {
              yPercent: 55,
              opacity: 0,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.045,
              onComplete: () => {
                split?.revert();
                split = null;
                restore();
              },
            });
          },
        });
        return restore;
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
