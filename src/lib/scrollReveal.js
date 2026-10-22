import { useEffect, useState } from "react";
import { loadGsap } from "./motion";
import { onceInView } from "./inview";
import { isFirstLoad } from "./firstLoad";
import { DUR, EASE, RISE, staggerFor } from "./tokens";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let splitText;
/**
 * GSAP SplitText, registered — fetched only by a page that reveals a heading, once fonts have loaded
 * (lines are measured in the final face, so the split matches the lines on screen).
 */
export function loadSplitText() {
  splitText ??= loadGsap().then(({ gsap }) =>
    Promise.all([import("gsap/SplitText"), document.fonts?.ready]).then(([{ SplitText }]) => {
      gsap.registerPlugin(SplitText);
      return SplitText;
    })
  );
  return splitText;
}

/**
 * A heading's entrance: split into its rendered lines (no ARIA changes, so the heading reads the same),
 * each line rises from behind its own mask, staggered, and the split is reverted as soon as it lands.
 * The width is held while split so the line boxes can't re-wrap. Returns a function that stops it and
 * restores the heading.
 */
function playHeading(gsap, SplitText, el, delay = 0) {
  const width = el.style.width;
  el.style.width = `${Math.ceil(el.getBoundingClientRect().width) + 1}px`;
  const split = new SplitText(el, { type: "lines", mask: "lines", aria: "none", linesClass: "block" });
  gsap.set(el, { clearProps: "opacity" });
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    split.revert();
    el.style.width = width;
  };
  const tween = gsap.from(split.lines, {
    yPercent: 105,
    duration: DUR.base,
    ease: EASE.emphasized,
    stagger: staggerFor(split.lines.length),
    delay,
    onComplete: finish,
  });
  return () => {
    tween.kill();
    finish();
  };
}

/**
 * The site's one scroll reveal. Every `[data-sr]` element inside `ref` comes in once, the first time it
 * scrolls into view; elements entering together are staggered (STAGGER, never more than MAX_STAGGER
 * across a group). Three kinds, all on the motion tokens (lib/tokens):
 *   [data-sr]               fade + rise (RISE px) — sections, paragraphs, cards, list items
 *   [data-sr="heading"]     the heading's lines rise from behind their own masks (SplitText)
 *   [data-sr][data-wipe]    media: fades in while its image settles from a slight zoom
 * `self: true` reveals `ref` itself (a lone heading: AnimatedText, KineticHeading).
 *
 * Put `data-sr-state={state}` on the container (or the element, with `self`): index.css holds items
 * hidden only while it is "pending" AND <html> has the `js-motion` class, so content is visible by
 * default — without JavaScript, under reduced motion, and in the pre-rendered HTML.
 *
 * Positions come from the shared IntersectionObserver (lib/inview), never from synchronous layout
 * reads. Never leaves content hidden: items already above the viewport are shown at once; an item
 * arriving during a fast scroll, or coming back into view after being jumped past, is shown at once.
 * Runs once. Reverted on unmount; nothing is hidden or animated under prefers-reduced-motion.
 *
 * First load (a direct visit: the pre-rendered page is already on screen; lib/firstLoad): nothing is
 * held by CSS ("idle"), and an item is put into its waiting state only once the observer reports it
 * below the viewport — what is on screen (or above) stays exactly as it is, so nothing visible is
 * ever hidden (the hero h1 included). Client-side navigations hold everything from the start
 * ("pending").
 */
export function useScrollReveal(ref, { self = false } = {}) {
  const [state, setState] = useState(() => (typeof window === "undefined" || isFirstLoad() ? "idle" : reduced() ? "done" : "pending"));

  useEffect(() => {
    if (reduced()) return;
    const el = ref.current;
    let cancelled = false;
    const subs = [];
    const stops = new Set();
    let gsapRef;
    let items = [];
    const safety = setTimeout(() => !cancelled && setState("done"), 2500);
    const needsSplit = el && (self ? el.dataset.sr === "heading" : !!el.querySelector('[data-sr="heading"]'));
    // SplitText is fetched when the page is idle (not while it is still busy loading); a heading that
    // arrives before it is ready waits hidden the few milliseconds it takes.
    if (needsSplit) (window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1)))(() => loadSplitText(), { timeout: 4000 });
    loadGsap()
      .then(({ gsap }) => {
        if (cancelled || !el) return;
        clearTimeout(safety);
        gsapRef = gsap;
        // Only this container's own items (a nested reveal handles its own).
        items = self ? [el] : [...el.querySelectorAll("[data-sr]")].filter((n) => n.closest("[data-sr-state]") === el);
        const isHeading = (n) => n.dataset.sr === "heading";
        const isMedia = (n) => n.matches("[data-wipe]");
        const imgs = (n) => [...n.querySelectorAll("img")];
        const show = (n) => {
          gsap.set(n, { clearProps: "opacity,transform" });
          if (isMedia(n)) gsap.set(imgs(n), { clearProps: "scale" });
        };
        // Writes only: an item takes its waiting state — all of them at once after a navigation (nothing
        // was on screen yet), on a first load only those the observer reports below the viewport.
        const wait = (n) => {
          if (isHeading(n)) gsap.set(n, { opacity: 0 });
          else if (isMedia(n)) {
            gsap.set(n, { opacity: 0 });
            gsap.set(imgs(n), { scale: 1.06 });
          } else gsap.set(n, { opacity: 0, y: RISE });
        };
        const first = state === "idle";
        if (!first) items.forEach(wait);
        const enter = (batch) => {
          const each = staggerFor(batch.length);
          batch.forEach((n, i) => {
            if (isHeading(n))
              loadSplitText().then((SplitText) => {
                if (!cancelled) stops.add(playHeading(gsap, SplitText, n, i * each));
              }, () => show(n));
          });
          const media = batch.filter(isMedia);
          const fades = batch.filter((n) => !isMedia(n) && !isHeading(n));
          if (media.length) {
            gsap.to(media, { opacity: 1, duration: DUR.slow, ease: EASE.standard, stagger: each, clearProps: "opacity" });
            gsap.to(media.flatMap(imgs), { scale: 1, duration: DUR.slow, ease: EASE.emphasized, clearProps: "scale" });
          }
          if (fades.length) gsap.to(fades, { opacity: 1, y: 0, duration: DUR.base, ease: EASE.standard, stagger: each, overwrite: true, clearProps: "opacity,transform" });
        };
        for (const n of items) subs.push(onceInView(n, { initial: !first, enter, show: () => show(n), below: first ? () => wait(n) : undefined }));
        setState("ready");
      })
      .catch(() => !cancelled && setState("done"));
    return () => {
      cancelled = true;
      clearTimeout(safety);
      subs.forEach((off) => off());
      stops.forEach((stop) => stop());
      if (gsapRef && items.length) {
        gsapRef.killTweensOf(items);
        gsapRef.set(items, { clearProps: "opacity,transform" });
      }
    };
    // Set up once per container; `state` is read for its starting value only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, self]);

  return state;
}
