import { createElement, useEffect, useRef } from "react";
import { loadGsap } from "../../lib/motion";
import { onceInView } from "../../lib/inview";

/*
 * Kinetic typography for the Solutions pages. Every piece of text here is real HTML that is visible by
 * default; motion is applied only at the moment the element enters the viewport, and only when:
 *   - motion is allowed (not prefers-reduced-motion),
 *   - the element was still below the viewport when the page set up (anything already on screen is
 *     simply shown), and
 *   - the visitor isn't scrolling fast (a fling shows the final state instead).
 * An element passed without its animation (a jump, a deep link) is shown at once. Runs once. (The
 * marker underline of a heading already on screen draws at once, as a decoration.)
 */

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Calls `play(gsap)` once when `ref` scrolls into view at a normal pace, or `finish()` instead when it
 * can't be animated cleanly (already on screen, above, a fast scroll, a jump). `play` may return a
 * cleanup. `onWait()` runs once the element is known to be below the viewport (it will animate; hiding
 * it then can't flash). Positions come from the shared IntersectionObserver (lib/inview) — no layout
 * reads.
 */
function useEnterOnce(ref, { play, finish, onWait, preload }) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) {
      finish?.();
      return;
    }
    let cancelled = false;
    let off;
    let undo;
    // Fetch extras (SplitText) once the page is idle, not while it is still loading.
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1));
    if (preload) idle(preload, { timeout: 3000 });
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      off = onceInView(el, { enter: () => (undo = play(gsap)), show: () => finish?.(), below: onWait });
    });
    return () => {
      cancelled = true;
      off?.();
      undo?.();
    };
    // Set up once per element.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Heading text with one key phrase wrapped in a marker (skipped if the phrase isn't in the text). */
function withMark(text, mark) {
  if (!mark || typeof text !== "string") return text;
  const at = text.indexOf(mark);
  if (at < 0) return text;
  return [text.slice(0, at), <span key="m" className="h2-mark">{mark}</span>, text.slice(at + mark.length)];
}

/**
 * Section heading (h2 by default). Line-mask reveal: the heading is split into its rendered lines
 * (GSAP SplitText, no ARIA changes, so the heading's text is untouched for assistive tech), each line
 * slides up from behind its own mask (0.5 s, 60 ms apart, expo.out), and the split is reverted as soon
 * as it lands. Then the key phrase's marker underline draws left → right. Under every fallback the
 * heading is plain and visible with its marker drawn.
 */
export function KineticHeading({ as = "h2", mark, className = "", children, ...rest }) {
  const ref = useRef(null);
  const marked = () => ref.current && (ref.current.dataset.kinetic = "done");
  useEnterOnce(ref, {
    onWait: () => (ref.current.dataset.kinetic = "waiting"),
    preload: () => import("gsap/SplitText"),
    finish: marked,
    play: (gsap) => {
      const el = ref.current;
      let split;
      let alive = true;
      import("gsap/SplitText").then(({ SplitText }) => {
        if (!alive) return;
        gsap.registerPlugin(SplitText);
        // Hold the width while split, so the line boxes can't re-wrap the heading.
        const width = el.style.width;
        el.style.width = `${Math.ceil(el.getBoundingClientRect().width) + 1}px`;
        split = new SplitText(el, { type: "lines", mask: "lines", aria: "none", linesClass: "block" });
        gsap.from(split.lines, {
          yPercent: 100,
          duration: 0.5,
          ease: "expo.out",
          stagger: 0.06,
          onComplete: () => {
            split?.revert();
            split = null;
            el.style.width = width;
            marked();
          },
        });
      });
      return () => {
        alive = false;
        split?.revert();
      };
    },
  });
  return createElement(as, { ref, className, ...rest }, withMark(children, mark));
}

/**
 * Eyebrow with a leading rule: on entering, its letter-spacing settles from wide to normal while it
 * fades in, and the rule draws from 0 to full width (0.6 s). Static and visible otherwise.
 */
export function KineticEyebrow({ className = "", ruleClass = "bg-current", children }) {
  const ref = useRef(null);
  useEnterOnce(ref, {
    play: (gsap) => {
      const el = ref.current;
      const tl = gsap.timeline();
      tl.from(el, { letterSpacing: "0.36em", opacity: 0.3, duration: 0.6, ease: "power2.out", clearProps: "letterSpacing,opacity" }, 0).from(
        el.querySelector("[data-rule]"),
        { scaleX: 0, duration: 0.6, ease: "power2.out", clearProps: "transform" },
        0
      );
      return () => tl.kill();
    },
  });
  return (
    <p ref={ref} className={`flex items-center gap-3 ${className}`}>
      <span data-rule aria-hidden="true" className={`h-px w-8 origin-left opacity-70 ${ruleClass}`} />
      {children}
    </p>
  );
}
