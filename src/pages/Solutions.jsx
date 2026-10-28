import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SceneImg from "../components/SceneImg";
import { ArrowUnderline, PartnerStrip } from "../components/solutions/Interactive";
import ScaleHeader from "../components/solutions/ScaleHeader";
import { SOLUTION_PAGES } from "../data/solutions";
import { useScrollReveal } from "../lib/scrollReveal";
import { useRouteTransition } from "../lib/viewTransition";
import { usePanels } from "../lib/panels";

// The Solutions hub: one card per segment, each opening its own page. The card ids are the old
// section ids, so links such as /solutions#ci (Home's Solutions cards) still land on the right card.
const SEGMENTS = [
  {
    id: "residential",
    page: SOLUTION_PAGES.residential.path,
    title: "Residential Energy Storage",
    copy: "Solar power shouldn't stop when the sun goes down. Home battery systems from TCL.",
    cta: "Explore Residential Solutions",
    img: "res-house",
    alt: "Rendering of a home at night with rooftop solar and a wall-mounted TCL battery beside the garage",
  },
  {
    id: "ci",
    page: SOLUTION_PAGES.ci.path,
    title: "Commercial & Industrial Energy Storage",
    copy: "Reduce peak demand, store solar energy and keep critical loads running with TCL, Hithium and CLOU.",
    cta: "Explore C&I Solutions",
    img: "ci-industrial",
    alt: "TCL floor-standing battery cabinets and inverter beside an industrial building",
  },
  {
    id: "utility",
    page: SOLUTION_PAGES.utility.path,
    title: "Utility-Scale Energy Storage",
    copy: "Grid-scale battery storage from Hithium and CLOU for renewable integration, grid support and round-the-clock power.",
    cta: "Explore Utility Solutions",
    // The same photo the utility page's hero shows, so the card morphs into it.
    img: "utility-solar",
    alt: "Utility-scale battery energy storage containers beside a solar plant",
  },
];

/**
 * A hub card: opening it morphs its photo into the segment hero's photo (the photo only: text never
 * morphs). On desktop it is one of the expanding panels (usePanels): its photo zooms a little as it
 * opens. Touch, small screens and reduced motion: the usual grid of cards.
 */
function SegmentCard({ s }) {
  const open = useRouteTransition(s.page, `[data-vt-hero="${s.id}"]`, { segment: s.id });
  return (
    <Link
      to={s.page}
      onClick={open}
      data-vt-card={s.id}
      className="card-hover group relative flex aspect-[4/3] focus-visible:outline-link flex-col justify-end overflow-hidden rounded-card bg-deep-grid text-white focus-visible:outline-2 focus-visible:outline-offset-2 md:aspect-[4/5]"
    >
      <div data-vt-img className="absolute inset-0 overflow-hidden">
        <SceneImg
          name={s.img}
          alt={s.alt}
          sizes="(min-width: 1024px) 45vw, (min-width: 768px) 33vw, 100vw"
          className="card-media absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep-grid via-deep-grid/60 to-deep-grid/5" />
      <span aria-hidden="true" className="absolute inset-0 bg-deep-grid/0 transition-colors duration-base group-hover:bg-deep-grid/35 group-focus-within:bg-deep-grid/35 group-focus-visible:bg-deep-grid/35" />
      {/* In the panels the card's own outline would be clipped by its window: the ring is drawn on the text. */}
      <div
        data-panel-text
        className="relative rounded-card p-6 group-focus-visible:outline-2 group-focus-visible:-outline-offset-4 group-focus-visible:outline-accent md:p-7"
      >
        <h2
          className="text-h2 font-semibold transition-colors duration-fast group-hover:text-accent group-focus-within:text-accent group-focus-visible:text-accent"
        >
          {s.title}
        </h2>
        <p className="mt-2 text-small text-paper/85">{s.copy}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-small font-semibold text-accent">
          <ArrowUnderline group="card">{s.cta}</ArrowUnderline>
        </span>
      </div>
    </Link>
  );
}

export default function Solutions() {
  const grid = useRef(null);
  const reveal = useScrollReveal(grid);
  usePanels(grid);
  return (
    <div className="solutions-page">
      {/* The scale slider header: the page's h1 in its top line, with the BESS primer link beside it. */}
      <ScaleHeader
        title="Storage built for how you'll actually use it"
        aside={
          <Link to="/blog/what-is-bess" className="group/new hit-area inline-flex items-center gap-1.5 text-small font-semibold text-accent underline-offset-4 hover:underline focus-visible:underline">
            New to battery storage? Read: What Is a BESS?
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-fast group-hover/new:translate-x-0.5 group-focus-visible/new:translate-x-0.5" />
          </Link>
        }
      />

      {/* Same card treatment as For EPCs' application cards: partner imagery under a dark gradient. */}
      <section aria-label="Solutions by segment" className="bg-white py-section">
        <ul ref={grid} data-sr-state={reveal} className="seg-panels grid container-site gap-5 md:grid-cols-3">
          {SEGMENTS.map((s) => (
            <li key={s.id} id={s.id} data-sr className="scroll-mt-20">
              <SegmentCard s={s} />
            </li>
          ))}
        </ul>
        <PartnerStrip partners={["tcl", "hithium", "clou"]} className="container-site mt-14" />
      </section>
    </div>
  );
}
