import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// A line icon for each related page (drawn in as the cards arrive).
const ICONS = {
  "/solutions/residential": "M6 26 V14 L18 5 L30 14 V26 Z M14 26 V18 H22 V26",
  "/solutions/commercial-industrial": "M4 28 V14 L11 18 V14 L18 18 V14 L25 18 V6 H30 V28 Z M9 23 H13 M17 23 H21",
  "/solutions/utility-scale": "M3 10 H33 V26 H3 Z M9 10 V26 M15 10 V26 M21 10 V26 M27 10 V26",
  "/products": "M5 5 H15 V15 H5 Z M21 5 H31 V15 H21 Z M5 21 H15 V31 H5 Z M21 21 H31 V31 H21 Z",
};

/** A soft light that follows the pointer across a card (mouse / pen only). */
const spotlight = (e) => {
  if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

/**
 * "Related": one card per related page — a line icon (drawn in as the cards rise in, one after
 * another), the page's name and an arrow that slides on hover, with a light that follows the pointer.
 */
export default function ArticleRelated({ items }) {
  return (
    <section aria-labelledby="related-title" className="bg-paper py-14 lg:py-20">
      <div className="container-site">
        <div data-rv="h2">
          <svg aria-hidden="true" className="article-h2-line" viewBox="0 0 64 4" preserveAspectRatio="none">
            <line x1="1" y1="2" x2="63" y2="2" />
          </svg>
          <h2 id="related-title" className="article-h2 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight tracking-tight text-ink">
            Related
          </h2>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((r) => (
            <li key={r.to} data-rv="card">
              <Link
                to={r.to}
                onPointerMove={spotlight}
                className="article-related group/rel relative flex h-full min-h-28 flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-line bg-paper p-5 font-semibold text-ink transition-[border-color,box-shadow,translate] duration-300 ease-out hover:-translate-y-1 hover:border-forest/30 hover:shadow-[0_22px_44px_-28px_rgba(7,26,23,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal motion-reduce:transition-none"
              >
                <svg aria-hidden="true" viewBox="0 0 36 32" className="h-8 w-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path data-icon d={ICONS[r.to] ?? ICONS["/products"]} className="text-forest" />
                </svg>
                <span className="flex items-center justify-between gap-3">
                  {r.label}
                  <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-forest transition-transform duration-300 group-hover/rel:translate-x-1.5 group-focus-visible/rel:translate-x-1.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
