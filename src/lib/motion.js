import { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * Motion modes for the Home page:
 *  - "cinematic": desktop with motion allowed. Pinned scenes + scroll-scrubbed GSAP timelines.
 *  - "light":     phones/tablets/short viewports. Normal flow, no pinning or parallax,
 *                 cheap IntersectionObserver reveals. GSAP is never downloaded.
 *  - "static":    prefers-reduced-motion (or GSAP failed to load). Normal flow, final state, no motion.
 */
const Q_CINEMATIC = "(min-width: 1024px) and (min-height: 620px)";
const Q_REDUCED = "(prefers-reduced-motion: reduce)";

function readMode() {
  if (typeof window === "undefined") return "static";
  if (window.matchMedia(Q_REDUCED).matches) return "static";
  return window.matchMedia(Q_CINEMATIC).matches ? "cinematic" : "light";
}

export function useMotionMode() {
  const [mode, setMode] = useState(readMode);
  useEffect(() => {
    const queries = [window.matchMedia(Q_REDUCED), window.matchMedia(Q_CINEMATIC)];
    const onChange = () => setMode(readMode());
    queries.forEach((q) => q.addEventListener("change", onChange));
    return () => queries.forEach((q) => q.removeEventListener("change", onChange));
  }, []);
  return mode;
}

/** Top edge of a scene that rises over the previous pinned scene: dissolves in instead of cutting. */
export const FEATHER = {
  maskImage: "linear-gradient(to bottom, transparent 0, #000 20vh)",
  WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 20vh)",
};

export const MotionContext = createContext({ mode: "static", fail: () => {} });
export const useMotion = () => useContext(MotionContext);

let idle;
/**
 * Resolves once the first screen has painted and the page has gone quiet: the first idle moment
 * after `load` (at most ~2 s later), or the visitor's first scroll, pointer or key press, whichever
 * comes first. Nothing above the fold waits on what is gated behind it (the first screen is already
 * visible); after that first time it resolves at once, so client-side navigations never wait.
 */
export function afterFirstPaint() {
  idle ??= new Promise((resolve) => {
    if (typeof window === "undefined") return;
    const events = ["scroll", "wheel", "pointerdown", "keydown", "touchstart"];
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      events.forEach((e) => window.removeEventListener(e, go, true));
      resolve();
    };
    events.forEach((e) => window.addEventListener(e, go, { capture: true, passive: true }));
    const whenIdle = () => (window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1)))(go, { timeout: 2000 });
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
  });
  return idle;
}

let gsapPromise;
/**
 * Lazy, memoised GSAP + ScrollTrigger — fetched only after the first paint (afterFirstPaint), so they
 * never compete with the first screen.
 */
export function loadGsap() {
  gsapPromise ??= afterFirstPaint()
    .then(() => Promise.all([import("gsap"), import("gsap/ScrollTrigger")]))
    .then(
    ([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      // Section heights are viewport-relative, but re-measure once fonts and images settle.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh, { once: true });
      document.fonts?.ready.then(refresh);
      return { gsap, ScrollTrigger };
    }
  );
  return gsapPromise;
}

/**
 * Runs `build({ gsap, ScrollTrigger, q })` inside a gsap.context scoped to `ref`, once GSAP has
 * loaded. Everything the build creates is reverted on unmount, so remounting (mode change,
 * route change, StrictMode) never leaves stray triggers or inline styles behind.
 *
 * Scrubbed values all come from ScrollTrigger's JS-driven progress, never the browser's native
 * scroll-timeline acceleration (the source of the Framer Motion opacity-drift bug this replaced),
 * so every tween clamps to its end state when the range is over.
 */
export function useScrollScene(ref, build, enabled) {
  const { fail } = useMotion();
  const buildRef = useRef(build);
  buildRef.current = build;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let ctx;
    loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled || !ref.current) return;
        ctx = gsap.context(
          () => buildRef.current({ gsap, ScrollTrigger, q: gsap.utils.selector(ref.current) }),
          ref
        );
      })
      .catch(() => !cancelled && fail());
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [enabled, ref, fail]);
}

/** Light mode: fade-up any [data-reveal] element inside `ref` the first time it scrolls into view. */
export function useReveal(ref, enabled) {
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
    );
    ref.current.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled, ref]);
}
