import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SOLUTION_PAGES } from "../../data/solutions";
import { useRouteTransition } from "../../lib/viewTransition";

const SEGMENTS = ["residential", "ci", "utility"];

/**
 * Sticky segment switcher for the three Solutions segment pages (its own chunk). Once the hero has
 * scrolled away, a small pill bar fades and slides (8 px) in under the site header: Residential |
 * Commercial & Industrial | Utility-Scale, a green indicator under the current page. It gets out of
 * the way again when the final CTA band or the footer comes into view, so it never covers them.
 * Hovering or focusing another pill slides the indicator to it. Choosing one opens that page with the
 * Solutions View Transition: the pill grows into the new page's hero photo (text never morphs).
 * Phones: the same bar as a horizontally scrolling row. While hidden it is inert (not focusable).
 * Its height is accounted for in the pages' anchor offset (SEGMENT_OFFSET, index.css scroll-margin).
 */
export default function SegmentSwitcher({ current }) {
  const [shown, setShown] = useState(false);
  const [target, setTarget] = useState(current); // the pill the indicator sits under
  const row = useRef(null);
  const bar = useRef(null);

  // Shown between the hero leaving and the CTA band / footer arriving.
  useEffect(() => {
    const hero = document.querySelector("[data-vt-hero]");
    const ends = [...document.querySelectorAll("[data-cta-band], body footer")];
    if (!hero) return;
    let heroGone = false;
    const endIn = new Set();
    const update = () => setShown(heroGone && endIn.size === 0);
    const heroIo = new IntersectionObserver(
      ([e]) => {
        // Gone = scrolled up past the header (not merely below the fold).
        heroGone = !e.isIntersecting && e.boundingClientRect.top < 0;
        update();
      },
      { rootMargin: "-64px 0px 0px 0px" }
    );
    const endIo = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? endIn.add(e.target) : endIn.delete(e.target);
      update();
    });
    heroIo.observe(hero);
    ends.forEach((el) => endIo.observe(el));
    return () => {
      heroIo.disconnect();
      endIo.disconnect();
    };
  }, []);

  // Indicator: one bar moved and sized with transform only (translateX + scaleX of a 1 px wide box).
  useLayoutEffect(() => {
    const place = () => {
      const pill = row.current?.querySelector(`[data-seg="${target}"]`);
      if (!pill || !bar.current) return;
      bar.current.style.transform = `translateX(${pill.offsetLeft + 12}px) scaleX(${pill.offsetWidth - 24})`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [target]);

  // Phones: centre the current pill in the scrolling row (the cut-off neighbours show it scrolls).
  useEffect(() => {
    const pill = row.current?.querySelector(`[data-seg="${current}"]`);
    if (pill && row.current.scrollWidth > row.current.clientWidth)
      row.current.scrollLeft = pill.offsetLeft - (row.current.clientWidth - pill.offsetWidth) / 2; // centred
  }, [current]);

  return (
    <nav
      aria-label="Solutions segments"
      aria-hidden={!shown || undefined}
      inert={!shown}
      className={`fixed inset-x-0 top-16 z-40 flex justify-center px-4 pt-2 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      <div
        ref={row}
        onPointerLeave={() => setTarget(current)}
        className="rail relative flex max-w-full overflow-x-auto rounded-full border border-white/10 bg-ink/90 p-1 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.7)] backdrop-blur"
      >
        {SEGMENTS.map((id) => (
          <SegmentPill key={id} id={id} current={current} onPoint={() => setTarget(id)} onBlur={() => setTarget(current)} />
        ))}
        <span
          ref={bar}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1 left-0 h-0.5 w-px origin-left rounded-full bg-signal transition-transform duration-300 ease-out motion-reduce:transition-none"
        />
      </div>
    </nav>
  );
}

function SegmentPill({ id, current, onPoint, onBlur }) {
  const page = SOLUTION_PAGES[id];
  const ref = useRef(null);
  // The pill becomes the origin of the photo morph: named like the new page's hero photo for the
  // old-state capture only (cleared before the new page renders).
  const open = useRouteTransition(page.path, `[data-vt-hero="${id}"]`, {
    segment: id,
    before: () => {
      const el = ref.current;
      if (!el) return undefined;
      el.style.viewTransitionName = `sol-img-${id}`;
      document.documentElement.dataset.vtFrom = "pill";
      return () => (el.style.viewTransitionName = "");
    },
  });
  const here = id === current;
  return (
    <Link
      ref={ref}
      to={page.path}
      data-seg={id}
      onClick={here ? (e) => e.preventDefault() : open}
      aria-current={here ? "page" : undefined}
      onPointerEnter={onPoint}
      onFocus={onPoint}
      onBlur={onBlur}
      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal ${
        here ? "text-white" : "text-ice/70 hover:text-white"
      }`}
    >
      {page.label}
    </Link>
  );
}
