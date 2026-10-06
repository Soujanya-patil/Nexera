import { useEffect, useState } from "react";
import { loadGsap } from "./motion";
import { onceInView } from "./inview";
import { isFirstLoad } from "./firstLoad";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Reveal timing shared by every scroll reveal on the site (useScrollReveal and AnimatedText). */
export const REVEAL = {
  // Begins the moment the element's top enters the viewport. (A later line, e.g. 92%, leaves
  // anything sitting in the bottom of the screen fully visible but still waiting, i.e. blank.)
  start: "top bottom",
  duration: 0.4,
  ease: "power2.out",
  y: 14,
  stagger: 0.04, // per item…
  maxStagger: 0.2, // …and never more than this across a group
  // Scrolling faster than an unhurried reading pace (px/s) skips the animation: the content is simply
  // shown, so a quick scroll never passes text that is still fading in.
  fastScroll: 700,
};

/** True when the trigger's scroll is moving fast enough that a reveal would be caught mid-fade. */
export const scrollingFast = (trigger) => Math.abs(trigger?.getVelocity?.() ?? 0) > REVEAL.fastScroll;

/**
 * Section-level reveal: every `[data-sr]` element inside `ref` fades and rises in once as it enters the
 * viewport (REVEAL timing), elements entering together staggered. `[data-sr][data-wipe]` (media only,
 * never text) is revealed by a top → bottom clip-path wipe instead (0.8 s), its image settling from
 * 1.08. Put `data-sr-state={state}` on the container: index.css holds items at opacity 0 only while
 * it is "pending" AND <html> has the `js-motion` class, so content is visible by default.
 *
 * Positions come from the shared IntersectionObserver (lib/inview), never from synchronous layout
 * reads. Never leaves content hidden: items already above the viewport are shown at once; an item
 * arriving during a fast scroll, or coming back into view after being jumped past, is shown at once.
 * Runs once. Reverted on unmount; nothing is hidden under prefers-reduced-motion.
 *
 * First load (a direct visit: the pre-rendered page is already on screen; lib/firstLoad): nothing is
 * held by CSS ("idle"), and an item is put into its waiting state only once the observer reports it
 * below the viewport — what is on screen (or above) stays exactly as it is, so nothing visible is
 * ever hidden. Client-side navigations hold everything from the start ("pending") as before.
 */
export function useScrollReveal(ref, { stagger = REVEAL.stagger, y = REVEAL.y } = {}) {
  const [state, setState] = useState(() => (typeof window === "undefined" || isFirstLoad() ? "idle" : reduced() ? "done" : "pending"));

  useEffect(() => {
    if (reduced()) return;
    const el = ref.current;
    let cancelled = false;
    const subs = [];
    let gsapRef;
    let items = [];
    const safety = setTimeout(() => !cancelled && setState("done"), 2500);
    loadGsap()
      .then(({ gsap }) => {
        if (cancelled || !el) return;
        clearTimeout(safety);
        gsapRef = gsap;
        // Only this container's own items (a nested reveal handles its own).
        items = [...el.querySelectorAll("[data-sr]")].filter((n) => n.closest("[data-sr-state]") === el);
        const isWipe = (n) => n.matches("[data-wipe]");
        const imgs = (n) => [...n.querySelectorAll("img")];
        const show = (n) => {
          gsap.set(n, { clearProps: "opacity,transform,clipPath" });
          if (isWipe(n)) gsap.set(imgs(n), { clearProps: "scale" });
        };
        // Writes only: an item takes its waiting state — all of them at once after a navigation (nothing
        // was on screen yet), on a first load only those the observer reports below the viewport.
        const wait = (n) =>
          isWipe(n) ? gsap.set(n, { opacity: 1, clipPath: "inset(0% 0% 100% 0%)" }) : gsap.set(n, { opacity: 0, y: Math.min(y, REVEAL.y) });
        const first = state === "idle";
        if (!first) items.forEach(wait);
        const enter = (batch) => {
          const each = Math.min(stagger, REVEAL.stagger, batch.length > 1 ? REVEAL.maxStagger / (batch.length - 1) : REVEAL.stagger);
          const wipes = batch.filter(isWipe);
          const fades = batch.filter((n) => !isWipe(n));
          if (wipes.length) {
            gsap.to(wipes, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power2.out", stagger: each, clearProps: "clipPath" });
            gsap.fromTo(wipes.flatMap(imgs), { scale: 1.08 }, { scale: 1, duration: 0.8, ease: "power2.out", clearProps: "scale" });
          }
          if (fades.length)
            gsap.to(fades, { opacity: 1, y: 0, duration: REVEAL.duration, ease: REVEAL.ease, stagger: each, overwrite: true, clearProps: "opacity,transform" });
        };
        for (const n of items) subs.push(onceInView(n, { initial: !first, enter, show: () => show(n), below: first ? () => wait(n) : undefined }));
        setState("ready");
      })
      .catch(() => !cancelled && setState("done"));
    return () => {
      cancelled = true;
      clearTimeout(safety);
      subs.forEach((off) => off());
      if (gsapRef && items.length) {
        gsapRef.killTweensOf(items);
        gsapRef.set(items, { clearProps: "opacity,transform,clipPath" });
      }
    };
    // Set up once per container; `state` is read for its starting value only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, stagger, y]);

  return state;
}
