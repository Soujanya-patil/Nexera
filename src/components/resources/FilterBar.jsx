import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { scrollToId } from "../../lib/scrollTo";

/** Offset for landing a section under the site header (64px) and this bar. */
export const BAR_OFFSET = -124;

/**
 * The hub's sticky section bar, under the site header: All · Guides · Datasheets · FAQs · Insights.
 * A real nav of in-page links (keyboard as usual; without JavaScript they are plain anchors). A click
 * glides to that section through Lenis, landing below the header and the bar — the page keeps every
 * section in place, so nothing reflows and everything stays readable and indexable. A green pill slides
 * to the option for the section being read (`active`). Phones: the row scrolls sideways.
 */
export default function FilterBar({ items, active }) {
  const row = useRef(null);
  const [pill, setPill] = useState(null);

  useLayoutEffect(() => {
    const place = () => {
      const el = row.current?.querySelector(`[data-id="${active}"]`);
      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);
  // Phones: keep the current option in view in the sideways-scrolling row.
  useEffect(() => {
    const el = row.current?.querySelector(`[data-id="${active}"]`);
    if (el && row.current.scrollWidth > row.current.clientWidth) row.current.scrollTo({ left: el.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="Resources sections" className="sticky top-16 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="container-site">
        <div ref={row} className="relative -mx-2 flex gap-1 overflow-x-auto px-2 py-2.5 [scrollbar-width:none]">
          {pill && (
            <span
              aria-hidden="true"
              className="absolute top-2.5 h-11 rounded-full bg-signal transition-[transform,width] duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(${pill.x}px)`, width: pill.w }}
            />
          )}
          {items.map((it) => {
            const on = it.id === active;
            return (
              <a
                key={it.id}
                data-id={it.id}
                href={`#${it.target}`}
                onClick={scrollToId(it.target, { offset: it.target === items[0].target ? -64 : BAR_OFFSET })}
                aria-current={on ? "location" : undefined}
                className={`relative z-10 inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
                  on ? "text-forest" : "text-graphite hover:text-ink"
                }`}
              >
                {it.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
