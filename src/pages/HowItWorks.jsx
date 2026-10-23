import { useLayoutEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useScrollReveal } from "../lib/scrollReveal";
import { useMediaQuery, useScrollSteps } from "../lib/scrollSteps";

const journey = [
  { step: "01", title: "Application & Fit Assessment", copy: "Region, business, and segment reviewed before anything else." },
  { step: "02", title: "Brand & Segment Onboarding", copy: "Trained only on the product lines matching your market." },
  { step: "03", title: "Territory Mapping & Agreement", copy: "Your region formally protected." },
  { step: "04", title: "Design & Commissioning Support", copy: "Our engineers work your first sizing and commissioning with you." },
  { step: "05", title: "Ongoing Service & Growth", copy: "After-sales, warranty handling, and portal access." },
];

/**
 * The five stages as a numbered vertical timeline, in the For EPCs lifecycle's style (WhyPartner): a
 * thin track down the left, a green line that fills it as the list scrolls through the view (scrubbed:
 * --progress, transform only), and a node per stage that lights up as the line reaches it. The track
 * runs from the first node to the last (--tail: the last stage's height below its node, measured).
 * Reduced motion: the line fully drawn and every node lit, nothing moves.
 */
function Timeline({ items }) {
  const box = useRef(null);
  const list = useRef(null);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Node i sits at i / (n − 1) of the track: it lights the moment the fill reaches it.
  const toStep = useMemo(() => (p) => Math.floor(p * (items.length - 1) + 0.001) + 1, [items.length]);
  const step = useScrollSteps(box, items.length + 1, { start: "top 75%", end: "bottom 55%", enabled: !reduce, toStep });
  const lit = (i) => reduce || i < step;
  useLayoutEffect(() => {
    const el = box.current;
    const ol = list.current;
    if (!el || !ol) return;
    const measure = () => {
      const last = ol.lastElementChild;
      if (last) el.style.setProperty("--tail", `${last.offsetHeight - 11}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="relative mt-10 max-w-2xl">
      {/* Track, and the scrubbed fill over it; both from the first node's centre to the last's. */}
      <span aria-hidden="true" className="absolute bottom-[var(--tail,0px)] left-[7px] top-[11px] w-px bg-forest/15" />
      <span
        aria-hidden="true"
        className="absolute bottom-[var(--tail,0px)] left-[7px] top-[11px] w-px origin-top bg-accent [scale:1_var(--s)]"
        style={{ "--s": reduce ? 1 : "var(--progress, 0)" }}
      />
      <ol ref={list} className="relative space-y-10">
        {items.map((j, i) => (
          <li key={j.step} data-sr className="relative grid grid-cols-[15px_minmax(0,1fr)] gap-x-6">
            <span
              aria-hidden="true"
              className={`relative mt-1 h-[15px] w-[15px] rounded-full border-2 transition-[background-color,border-color,scale] duration-base ${
                lit(i) ? "scale-100 border-accent bg-accent" : "scale-90 border-accent/25 bg-white"
              }`}
            />
            <div>
              <p className={`eyebrow tabular-nums transition-colors duration-base ${lit(i) ? "text-ink" : "text-label"}`}>{j.step}</p>
              <h3 className="mt-1 text-h4 font-semibold text-ink">{j.title}</h3>
              <p className="mt-1 text-small text-copy">{j.copy}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function HowItWorks() {
  // The site's scroll reveal: headings rise from their masks, steps and copy fade up (lib/scrollReveal).
  const root = useRef(null);
  const reveal = useScrollReveal(root);
  return (
    <div ref={root} data-sr-state={reveal}>
      <PageHeader
        eyebrow="How It Works"
        title="From First Call to Fully Operational Distributor"
      />

      <section className="bg-white">
        <div className="container-site py-section">
          <h2 data-sr="heading" className="text-h2 font-semibold text-ink">
            The Five-Stage Distributor Journey
          </h2>
          <Timeline items={journey} />
        </div>
      </section>

      <section className="bg-paper border-t border-line">
        <div className="container-site py-section">
          <h2 data-sr="heading" className="text-h2 font-semibold text-ink">
            Inside the Partner Portal
          </h2>
          <p data-sr className="mt-heading max-w-measure text-body text-copy">
            In development — a preview of what every distributor will get: territory
            map, pipeline, training status, warranty tickets, and price sheets.
          </p>
          <div data-sr className="mt-8 aspect-video max-w-2xl rounded-card border border-line bg-white flex items-center justify-center">
            <p className="text-small text-copy">Partner Portal preview — coming soon</p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div data-sr className="container-site py-14 text-center">
          <Link
            to="/become-a-partner"
            className="btn-motion inline-flex min-h-11 items-center rounded-full bg-accent px-6 py-3 text-button font-semibold text-on-accent hover:bg-accent-hover focus-visible:bg-accent-hover"
          >
            Start Your Application
          </Link>
        </div>
      </section>
    </div>
  );
}
