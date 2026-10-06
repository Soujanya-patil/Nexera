import { useEffect } from "react";
import { onceInView } from "../../lib/inview";
import { KineticEyebrow, KineticHeading } from "../solutions/Kinetic";

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SHAPES = "svg :is(path, line, circle, rect, polyline, polygon, ellipse):not([data-nodraw])";

/** Readies every stroke inside `el` to draw itself (pathLength 1; .draw-path), each svg staggered. */
function prepare(el) {
  el.querySelectorAll("svg").forEach((svg, i) => svg.style.setProperty("--i", i));
  el.querySelectorAll(SHAPES).forEach((s) => {
    if (s.classList.contains("charge-ring")) return;
    s.setAttribute("pathLength", "1");
    s.classList.add("draw-path");
  });
}

/** Plays the draw: from the hidden state (set now if it isn't yet) to drawn, on the next frames. */
export function playDraw(el) {
  el.dataset.draw = "wait";
  requestAnimationFrame(() => requestAnimationFrame(() => (el.dataset.draw = "go")));
}

/**
 * Line art / icons inside `ref` draw themselves (stroke-dashoffset) as they scroll into view, one svg
 * after another. Nothing is hidden in the pre-rendered page: an element is put into its "waiting"
 * (undrawn) state only once the observer reports it below the viewport, so anything already on screen
 * simply stays drawn; one passed in a fast scroll is shown drawn at once. `onEnter` runs as the draw
 * starts, `onShow` instead when it is shown without the draw. Reduced motion: drawn, static.
 */
export function useDrawIn(ref, { onEnter, onShow } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) return void onShow?.();
    prepare(el);
    return onceInView(el, {
      below: () => (el.dataset.draw = "wait"),
      enter: () => {
        el.dataset.draw = "go";
        onEnter?.();
      },
      // Passed in a fast scroll, or already above the viewport: simply drawn, no animation.
      show: () => {
        delete el.dataset.draw;
        onShow?.();
      },
    });
    // Set up once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Re-draws decoration that is already on screen, after the page has loaded (the hero's chips). */
export function useDrawAfterLoad(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    prepare(el);
    let id;
    const go = () => (id = setTimeout(() => playDraw(el), 250));
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      clearTimeout(id);
    };
  }, [ref]);
}

/**
 * A section's heading block: eyebrow (small caps, wide tracking, a short rule before it — the site's
 * pattern, settling in as it enters) and the kinetic h2 (lines rise from their masks). `dark` for
 * dark grounds.
 */
export function SectionHead({ id, eyebrow, title, dark = false, className = "", children }) {
  return (
    <div className={className}>
      <KineticEyebrow className={`text-xs font-semibold uppercase tracking-[0.22em] ${dark ? "text-signal" : "text-sage"}`} ruleClass={dark ? "bg-signal" : "bg-sage"}>
        {eyebrow}
      </KineticEyebrow>
      <KineticHeading id={id} className={`sol-h2 mt-3 font-semibold ${dark ? "text-white" : "text-ink"}`}>
        {title}
      </KineticHeading>
      {children}
    </div>
  );
}
