import { useEffect, useRef, useState } from "react";
import Callouts from "../cabinet/Callouts";
import scrubSrc from "../../assets/products/nexera-hero-cabinet-scrub.mp4";
import posterSrc from "../../assets/products/nexera-hero-cabinet-poster.webp";
import { loadGsap } from "../../lib/motion";
import { jumpTo } from "../../lib/lenis";
import { SCRUB } from "../../lib/scrub";
import { createSeekGate, useBlobUrl } from "../../lib/footage";

// Pin length (× viewport height of extra scroll), the share of it in which the cabinet opens, and
// the points at which each of the five labels appears in the rest (one by one over the last 30%).
const PIN = 1.2;
const OPEN = 0.7;
const LABEL_AT = [0.73, 0.79, 0.85, 0.91, 0.97];
const noop = () => {};

/**
 * The scrubbed stage of the C&I page's "Inside the cabinet" section — its own chunk, loaded by
 * CabinetScrub only on desktop (scrub screens) once the section is about a screen away, so phones and
 * reduced motion never download this code or the footage.
 *
 * Pins `section` for 1.2 viewport heights: the first 70% opens the cabinet (the Home hero's scrub
 * clip, loaded whole into memory — lib/footage useBlobUrl — and seeked through the self-healing gate,
 * createSeekGate), the last 30% brings in the five verified labels one by one (cabinet/Callouts).
 * Reverses exactly; reverted on unmount.
 */
export default function CabinetStage({ section }) {
  const video = useRef(null);
  const src = useBlobUrl(scrubSrc, true);
  const [labels, setLabels] = useState(0);

  useEffect(() => {
    const el = section.current;
    const v = video.current;
    if (!el || !v) return;
    let cancelled = false;
    let ctx;
    const gate = createSeekGate(v);
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      // If the visitor is already past the section (a deep link), the pin's added scroll length would
      // push what they are reading down: measure the next section before and after, and compensate.
      const next = el.nextElementSibling;
      const passed = el.getBoundingClientRect().bottom < 0;
      const before = next?.getBoundingClientRect().top ?? 0;
      ctx = gsap.context(() => {
        const proxy = { p: 0 };
        let shown = -1;
        const apply = () => {
          const p = proxy.p;
          const duration = Number.isFinite(v.duration) ? v.duration : 6.83;
          gate.seek(Math.min(p / OPEN, 1) * duration);
          const n = LABEL_AT.filter((at) => p >= at).length;
          if (n !== shown) {
            shown = n;
            setLabels(n);
          }
        };
        gsap.to(proxy, {
          p: 1,
          ease: "none",
          onUpdate: apply,
          scrollTrigger: {
            trigger: el,
            start: "top 64px", // pinned just below the sticky header
            end: () => `+=${Math.round(window.innerHeight * PIN)}`,
            pin: true,
            scrub: SCRUB,
            invalidateOnRefresh: true,
          },
        });
        apply();
      }, el);
      // The pin adds scroll length: every trigger further down the page re-measures.
      ScrollTrigger.refresh();
      if (passed && next) jumpTo(window.scrollY + (next.getBoundingClientRect().top - before));
    });
    return () => {
      cancelled = true;
      ctx?.revert();
      gate.destroy();
    };
  }, [section]);

  return (
    <>
      <video
        ref={video}
        src={src ?? undefined}
        poster={posterSrc}
        muted
        playsInline
        preload="auto"
        aria-label="Battery energy storage cabinet opening to reveal its battery modules, power electronics and protection components"
        className="absolute inset-0 h-full w-full object-contain"
      />
      <Callouts count={labels} animate onActive={noop} />
    </>
  );
}
