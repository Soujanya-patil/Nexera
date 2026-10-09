import { loadGsap } from "../../lib/motion";

/*
 * Motion for the article pages only. GSAP and ScrollTrigger are already on every page (lib/motion);
 * the extra plugins load here, after the page has hydrated and the browser is idle, each as its own
 * small chunk (so no single script parse becomes a long task). Nothing on the page waits for them:
 * text is visible in the pre-rendered HTML, and an element is only put into a "waiting" state once
 * these are ready to animate it.
 */

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/** The three-column layout with the sticky scene stage. */
export const DESKTOP_Q = "(min-width: 1024px)";
/** Fine pointer (mouse / pen): tilt and magnetic effects only there. */
export const FINE_POINTER_Q = "(hover: hover) and (pointer: fine)";
export const matches = (q) => typeof window !== "undefined" && window.matchMedia(q).matches;

const idle = () =>
  new Promise((resolve) => (window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1)))(() => resolve(), { timeout: 1500 }));

let plugins;
/**
 * GSAP + ScrollTrigger + DrawSVG, MorphSVG, MotionPath, ScrambleText and SplitText, registered. (The page
 * transition and the FAQ's height use the Web Animations API, and the contents indicator a CSS
 * transform, so Flip isn't needed.)
 * Memoised; rejects under reduced motion (callers then keep the static, final state).
 */
export function loadArticleMotion() {
  if (reducedMotion()) return Promise.reject(new Error("reduced motion"));
  plugins ??= loadGsap().then(async ({ gsap, ScrollTrigger }) => {
    await idle();
    const [{ DrawSVGPlugin }, { MorphSVGPlugin }, { MotionPathPlugin }, { ScrambleTextPlugin }, { SplitText }] = await Promise.all([
      import("gsap/DrawSVGPlugin"),
      import("gsap/MorphSVGPlugin"),
      import("gsap/MotionPathPlugin"),
      import("gsap/ScrambleTextPlugin"),
      import("gsap/SplitText"),
    ]);
    gsap.registerPlugin(DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin, ScrambleTextPlugin, SplitText);
    return { gsap, ScrollTrigger, SplitText };
  });
  return plugins;
}
