import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

// A line-art icon per card, in order (drawn in as the cards arrive): a commercial building, two
// cabinets side by side, a factory with a falling peak, a battery with cooling.
const ICONS = [
  "M6 30 V10 h14 v20 M20 30 V16 h12 v14 M10 14 h3 M10 19 h3 M10 24 h3 M24 20 h3 M24 25 h3 M3 30 h32",
  "M5 30 V8 h11 v22 z M21 30 V8 h11 v22 z M8 12 h5 M24 12 h5 M8 26 h5 M24 26 h5",
  "M3 30 V18 l7 4 v-4 l7 4 v-4 l7 4 V8 h5 v22 z M24 4 l3 3 l3 -2 l3 4",
  "M8 8 h20 v22 h-20 z M14 5 h8 M12 14 h12 M12 19 h12 M12 24 h12 M31 12 c2 2 2 5 0 7 M33 10 c3 3 3 8 0 11",
];

/**
 * News & Insights: a numbered card per title ("01", "02"…), with a line-art icon that draws in as the
 * cards arrive (DrawSVG, via the page's reveal: data-rv="card"). A title without a page yet is a
 * "Coming soon" card — not a link, no date, a soft shimmer along its border (static under reduced
 * motion). A title with a page (`to`) becomes a real link with a pointer light and a sliding arrow.
 */
export default function InsightCards({ items }) {
  // The shimmer runs only while the cards are on screen.
  const list = useRef(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setRun(e.isIntersecting));
    io.observe(list.current);
    return () => io.disconnect();
  }, []);
  return (
    <ul ref={list} data-run={run || undefined} className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it, i) => {
        const { title, to } = typeof it === "string" ? { title: it } : it;
        const body = (
          <>
            <span className="flex items-start justify-between gap-3">
              <span className="text-xs font-semibold tracking-[0.2em] text-sage">{String(i + 1).padStart(2, "0")}</span>
              <svg aria-hidden="true" viewBox="0 0 36 34" className="h-9 w-9 text-forest" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path data-icon d={ICONS[i % ICONS.length]} />
              </svg>
            </span>
            <span className="mt-5 flex-1 font-semibold leading-snug text-ink">{title}</span>
            {to ? (
              <ArrowRight aria-hidden="true" className="mt-5 h-4 w-4 text-forest transition-transform duration-300 group-hover/ins:translate-x-1" />
            ) : (
              <span className="mt-5 self-start rounded-full border border-forest/20 bg-ice px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest">Coming soon</span>
            )}
          </>
        );
        return (
          <li key={title} data-rv="card">
            {to ? (
              <a
                href={to}
                className="guide-card group/ins relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper p-6 transition-[border-color,box-shadow,translate] duration-300 hover:-translate-y-1 hover:border-forest/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                {body}
              </a>
            ) : (
              <div className="insight-soon relative flex h-full flex-col rounded-3xl bg-paper p-6">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
