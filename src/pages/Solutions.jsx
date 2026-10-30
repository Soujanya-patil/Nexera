import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ArrowUnderline, PartnerStrip } from "../components/solutions/Interactive";
import ScaleHeader from "../components/solutions/ScaleHeader";
import { SOLUTION_PAGES } from "../data/solutions";
import { useScrollReveal } from "../lib/scrollReveal";
import { useRouteTransition } from "../lib/viewTransition";
import { usePanels } from "../lib/panels";

// The cards' photos: each exported at 600 / 900 / 1200 px or its full width as AVIF, WebP and JPG
// (src/assets/solutions-cards), all 3:4 portraits.
const cardFiles = import.meta.glob("../assets/solutions-cards/*.{avif,webp,jpg}", { eager: true, query: "?url", import: "default" });
function cardImage(name) {
  const set = (ext) =>
    Object.entries(cardFiles)
      .map(([path, url]) => [path.split("/").pop().match(/^([a-z]+)-(\d+)\.([a-z]+)$/), url])
      .filter(([m]) => m && m[1] === name && m[3] === ext)
      .map(([m, url]) => ({ w: Number(m[2]), url }))
      .sort((a, b) => a.w - b.w);
  const jpg = set("jpg");
  const top = jpg[jpg.length - 1];
  const srcSet = (list) => list.map((v) => `${v.url} ${v.w}w`).join(", ");
  return { avif: srcSet(set("avif")), webp: srcSet(set("webp")), jpg: srcSet(jpg), src: top.url, width: top.w, height: Math.round((top.w * 4) / 3) };
}

// The Solutions hub: one card per segment, each opening its own page. The card ids are the old
// section ids, so links such as /solutions#ci (Home's Solutions cards) still land on the right card.
const SEGMENTS = [
  {
    id: "residential",
    page: SOLUTION_PAGES.residential.path,
    title: "Residential Energy Storage",
    copy: "Solar power shouldn't stop when the sun goes down. Home battery systems from TCL.",
    cta: "Explore Residential Solutions",
    img: "residential",
    // Where the photo sits in the card: the product stays in view above the card's text.
    pos: "40% 20%",
    alt: "Slim wall-mounted home battery at a modern home at dusk",
  },
  {
    id: "ci",
    page: SOLUTION_PAGES.ci.path,
    title: "Commercial & Industrial Energy Storage",
    copy: "Reduce peak demand, store solar energy and keep critical loads running with TCL, Hithium and CLOU.",
    cta: "Explore C&I Solutions",
    img: "ci",
    pos: "50% 100%",
    alt: "TCL BlueArk X5 cabinets outside a factory at dusk",
  },
  {
    id: "utility",
    page: SOLUTION_PAGES.utility.path,
    title: "Utility-Scale Energy Storage",
    copy: "Grid-scale battery storage from Hithium and CLOU for renewable integration, grid support and round-the-clock power.",
    cta: "Explore Utility Solutions",
    img: "utility",
    pos: "50% 30%",
    alt: "Utility-scale battery storage site with solar panels at dusk",
  },
];

/**
 * A hub card: opening it morphs its photo into the segment hero's photo (the photo only: text never
 * morphs). On desktop it is one of the expanding panels (usePanels): its photo zooms a little as it
 * opens. Touch, small screens and reduced motion: the usual grid of cards. On tablets (768–1023) the
 * three cards are narrow: the title steps down a size and each card is at least 26rem tall, growing to
 * fit its text rather than clipping it, all three as tall as the tallest.
 */
function SegmentCard({ s }) {
  const img = cardImage(s.img);
  const sizes = "(min-width: 1024px) 40vw, (min-width: 768px) 33vw, 100vw";
  const open = useRouteTransition(s.page, `[data-vt-hero="${s.id}"]`, { segment: s.id });
  return (
    <Link
      to={s.page}
      onClick={open}
      data-vt-card={s.id}
      className="card-hover group relative flex aspect-[4/3] focus-visible:outline-link flex-col justify-end overflow-hidden rounded-card bg-deep-grid text-white focus-visible:outline-2 focus-visible:outline-offset-2 md:aspect-[4/5] md:max-lg:aspect-auto md:max-lg:h-full md:max-lg:min-h-[26rem]"
    >
      <div data-vt-img className="absolute inset-0 overflow-hidden">
        <picture>
          <source type="image/avif" srcSet={img.avif} sizes={sizes} />
          <source type="image/webp" srcSet={img.webp} sizes={sizes} />
          <img
            src={img.src}
            srcSet={img.jpg}
            sizes={sizes}
            width={img.width}
            height={img.height}
            alt={s.alt}
            loading="lazy"
            decoding="async"
            className="card-media absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: s.pos }}
          />
        </picture>
      </div>
      {/* Strong enough that the card text keeps AA over the brightest parts of the photos, phones included. */}
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep-grid via-deep-grid/80 to-deep-grid/30" />
      <span aria-hidden="true" className="absolute inset-0 bg-deep-grid/0 transition-colors duration-base group-hover:bg-deep-grid/35 group-focus-within:bg-deep-grid/35 group-focus-visible:bg-deep-grid/35" />
      {/* In the panels the card's own outline would be clipped by its window: the ring is drawn on the text. */}
      <div
        data-panel-text
        className="relative rounded-card p-6 group-focus-visible:outline-2 group-focus-visible:-outline-offset-4 group-focus-visible:outline-accent md:p-7"
      >
        <h2
          className="text-h2 font-semibold md:max-lg:text-h3 transition-colors duration-fast group-hover:text-accent group-focus-within:text-accent group-focus-visible:text-accent"
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
