import { createElement, useEffect, useRef } from "react";
import { loadGsap } from "../../lib/motion";
import { REVEAL, scrollingFast } from "../../lib/scrollReveal";

/**
 * Section-heading reveal: the whole heading fades and rises in once, the first time it scrolls into
 * view (REVEAL timing from lib/scrollReveal — starts as it enters the viewport, 0.4 s). It never starts
 * below 35% opacity, so a heading is never "empty", and it is done well before it reaches the middle
 * of the screen. (This replaced a word-by-word reveal whose later words could still be grey when the
 * heading was already mid-screen.)
 *
 * Never leaves a heading dimmed: one already at or above the trigger line when set up is left alone;
 * one passed without its reveal (a jump or a fast fling) is shown at once; a fast scroll shows it
 * instead of animating it. Runs once. Nothing runs under prefers-reduced-motion. Use on section
 * headings only, not body copy.
 */
export default function AnimatedText({ as = "h2", className = "", children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let ctx;
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !ref.current) return;
      // Only headings still below the viewport wait; anything already on screen is simply visible.
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      ctx = gsap.context(() => {
        const show = () => gsap.set(el, { opacity: 1, y: 0, clearProps: "opacity,transform" });
        gsap.set(el, { opacity: 0.35, y: 12 });
        ScrollTrigger.create({
          trigger: el,
          start: REVEAL.start,
          once: true,
          onEnter: (self) => {
            if (scrollingFast(self)) return show();
            gsap.to(el, { opacity: 1, y: 0, duration: REVEAL.duration, ease: REVEAL.ease, overwrite: true, clearProps: "opacity,transform" });
          },
          onLeave: show,
          onEnterBack: show,
        });
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return createElement(as, { ref, className, ...rest }, children);
}
