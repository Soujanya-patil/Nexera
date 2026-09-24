import { useEffect, useRef, useState } from "react";

/**
 * Page-level journey indicator for the Home sequence: where you are across the whole
 * SHOW -> INTERACT -> EXPLORE -> TRUST -> ENQUIRE arc, and a way to jump between stops.
 *
 * LEFT edge, deliberately. The right edge is already spoken for by two section-scoped indicators
 * that both sit at `right-6 top-1/2` on desktop — CabinetAnatomy's phase dots (Closed / Opening /
 * Interior Revealed / Exploded View) and ScaleStory's chapter rail. A third right-edge element
 * would land on top of them, so this one takes the opposite gutter and leaves those untouched.
 *
 * Dots only, with the label revealed on hover. Labels can't render inline: the page content is
 * `max-w-6xl` (1152px) and at 1024px wide that leaves ~24px of gutter, so a persistent label
 * column would sit on top of the content at exactly the width this first appears. The hover pill
 * is absolutely positioned and pointer-events-none, so it can overhang harmlessly.
 *
 * Sections are located by INDEX into the scene wrapper's children rather than by id, so no other
 * component needs an id added to support this. `labels` is defined next to the section list in
 * Home.jsx to keep the pairing visible in one place.
 *
 * Active section = the LAST section whose range contains the viewport midpoint. "Last" matters:
 * scenes that rise over a previous scene's held tail (`-mt-[100vh]`) genuinely overlap in document
 * space, and the later one is the one actually being painted, so it should be the one marked.
 */
export default function JourneyRail({ labels, wrapRef }) {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(-1);
  const boundsRef = useRef([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      boundsRef.current = [...wrap.children].map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
      });
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.scrollY + window.innerHeight / 2;
      let next = 0;
      boundsRef.current.forEach((b, i) => {
        if (mid >= b.top && mid < b.bottom) next = i;
      });
      setActive(next);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Section heights are viewport-relative and images/fonts settle late — re-measure once they do.
    window.addEventListener("load", onResize, { once: true });
    document.fonts?.ready.then(onResize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
    };
  }, [wrapRef]);

  const go = (i) => {
    const b = boundsRef.current[i];
    if (!b) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: b.top, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <nav
      aria-label="Page sections"
      className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-4 lg:flex"
    >
      {labels.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => go(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(-1)}
          onFocus={() => setHover(i)}
          onBlur={() => setHover(-1)}
          aria-label={`Go to ${label}`}
          aria-current={i === active ? "true" : undefined}
          className="group relative flex h-4 w-4 items-center justify-center"
        >
          <span
            aria-hidden="true"
            className={`block rounded-full transition-all duration-300 ${
              i === active ? "h-2 w-2 bg-signal" : "h-1.5 w-1.5 bg-bone/35 group-hover:bg-bone/70"
            }`}
          />
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-6 whitespace-nowrap rounded bg-night/90 px-2 py-1 text-[11px] font-medium text-bone shadow-lg ring-1 ring-bone/15 transition-opacity duration-200 ${
              hover === i ? "opacity-100" : "opacity-0"
            }`}
          >
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
}
