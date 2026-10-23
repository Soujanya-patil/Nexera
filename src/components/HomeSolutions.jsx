import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SceneImg from "./SceneImg";
import { useEntrance } from "../lib/entrance";
import { PARTNERS, PRODUCTS } from "../data/products";
import { SOLUTION_PAGES } from "../data/solutions";

// Which technology partners have systems for each application — read from the product catalogue,
// so the preview can never claim a pairing the catalogue doesn't have.
const partnersFor = (app) => PARTNERS.filter((p) => PRODUCTS.some((x) => x.partner === p.id && x.applications.includes(app)));
const countFor = (app) => PRODUCTS.filter((x) => x.applications.includes(app)).length;

/** A very soft light that follows the pointer across the section (mouse only). */
const trackSpotlight = (e) => {
  if (e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--cx", `${Math.round(e.clientX - r.left)}px`);
  e.currentTarget.style.setProperty("--cy", `${Math.round(e.clientY - r.top)}px`);
};
import AnimatedText from "./ui/AnimatedText";
import ParallaxMedia from "./ui/ParallaxMedia";
import { DUR, EASE, STAGGER } from "../lib/tokens";

// Imagery and alt text reused from ScaleStory (same three segments); copy from the approved mockup.
// Each card links to its segment's section on the Solutions page.
const cards = [
  {
    id: "residential",
    title: "Residential",
    page: SOLUTION_PAGES.residential.path,
    cta: "Explore Residential Storage",
    copy: "Store your solar power. Use it when you need it. Greater independence, lower bills, reliable backup.",
    // TODO(india-imagery): see ScaleStory — res-house is a CGI render of a generic non-Indian house.
    img: "res-house",
    alt: "Rendering of a home at night with rooftop solar and a wall-mounted TCL battery beside the garage",
  },
  {
    id: "ci",
    title: "Commercial & Industrial (C&I)",
    page: SOLUTION_PAGES.ci.path,
    cta: "Explore C&I Storage",
    copy: "Cut peak demand charges. Improve reliability. Maximise solar ROI.",
    // TODO(india-imagery): see ScaleStory — ci-industrial is not identifiably Indian.
    img: "ci-industrial",
    alt: "TCL floor-standing battery cabinets and inverter beside an industrial building",
  },
  {
    id: "utility",
    title: "Utility-Scale",
    page: SOLUTION_PAGES.utility.path,
    cta: "Explore Utility-Scale Storage",
    copy: "Enable a cleaner, more stable grid with large-scale storage.",
    // TODO(india-imagery): see ScaleStory — utility-yard shows Chinese-language signage.
    img: "utility-yard",
    alt: "Aerial view of rows of Hithium battery storage containers at a large site",
  },
];

/**
 * Solutions — a product-discovery moment: the three segment cards act as a BESS selector.
 * Entrance: Residential → C&I → Utility rise out of their own frames in turn (same direction, short
 * stagger).
 * Hover / focus: the card rises 6 px with a deeper shadow, a green accent draws along its top edge,
 * the photo zooms slowly and brightens (a soft shade over it lifts), an "Explore" tag slides in on
 * the photo, the title shifts 3 px, the arrow moves, and the technology partners with systems for
 * that application (from the catalogue) and the number of systems come up at the foot of the card.
 * The section carries a very soft light that follows the mouse.
 */
export default function HomeSolutions() {
  const grid = useRef(null);
  const enter = useEntrance(grid, ({ tl, q }) => {
    tl.fromTo(
      q("[data-e]"),
      { opacity: 0, y: 36 },
      { opacity: 1, y: 0, duration: DUR.slow, stagger: STAGGER, ease: EASE.emphasized, clearProps: "all" }
    );
  });
  return (
    <section onPointerMove={trackSpotlight} className="group/sol relative overflow-hidden bg-paper py-section">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-slow group-hover/sol:opacity-100 group-focus-visible/sol:opacity-100 group-focus-within/sol:opacity-100"
        style={{ background: "radial-gradient(520px circle at var(--cx, -999px) var(--cy, -999px), color-mix(in srgb, var(--accent) 9%, transparent), transparent 65%)" }}
      />
      <div className="relative container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-muted">Our Solutions</p>
            <AnimatedText className="mt-eyebrow text-h2 font-semibold text-ink">Energy Storage for Every Need</AnimatedText>
            <p className="mt-heading max-w-measure text-copy">
              From homes to industries to the grid — Nexera brings the right storage solution for every application.
            </p>
          </div>
          <Link
            to="/solutions"
            className="group/all inline-flex min-h-11 shrink-0 items-center gap-2 text-button font-semibold text-accent transition-colors hover:text-link focus-visible:text-link"
          >
            View All Solutions
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover/all:translate-x-1 group-focus-visible/all:translate-x-1 group-focus-within/all:translate-x-1" />
          </Link>
        </div>

        <div ref={grid} data-enter={enter} className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.id}
              data-e
              className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-white card-hover"
            >
              <span aria-hidden="true" className="absolute left-6 top-0 z-10 h-0.5 w-14 origin-left scale-x-0 rounded-full bg-accent transition-[scale] duration-base ease-standard group-hover:scale-x-100 group-focus-visible:scale-x-100 group-focus-within:scale-x-100 " />
              <div className="relative aspect-[16/10] overflow-hidden">
                <ParallaxMedia amount={5}>
                  <SceneImg
                    name={c.img}
                    alt={c.alt}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="card-media h-full w-full object-cover"
                  />
                </ParallaxMedia>
                {/* A soft shade that lifts on hover, so the photo seems to brighten */}
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep-grid/30 via-deep-grid/5 to-transparent transition-opacity duration-slow group-hover:opacity-0 group-focus-visible:opacity-0 group-focus-within:opacity-0" />
                <span
                  aria-hidden="true"
                  className="absolute right-4 top-4 inline-flex translate-x-2 items-center gap-1.5 rounded-full bg-deep-grid/75 px-3 py-1 eyebrow text-white opacity-0 backdrop-blur-sm transition-[opacity,translate] duration-base ease-standard group-hover:translate-x-0 group-focus-visible:translate-x-0 group-focus-within:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-within:opacity-100  "
                >
                  Explore
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-h4 font-semibold text-ink transition-[translate] duration-base ease-standard group-hover:translate-x-[3px] group-focus-visible:translate-x-[3px] group-focus-within:translate-x-[3px]">{c.title}</h3>
                <p className="mt-2 flex-1 text-small text-copy">{c.copy}</p>
                {/* Product preview (space always reserved, so hovering never shifts the layout) */}
                <p className="mt-4 flex translate-y-1 items-center gap-2 text-micro text-copy transition-[translate] duration-base ease-standard group-hover:translate-y-0 group-focus-visible:translate-y-0 group-focus-within:translate-y-0 ">
                  <span className="h-1.5 w-1.5 rounded-full bg-label" aria-hidden="true" />
                  <span className="font-semibold text-copy">{partnersFor(c.id).map((p) => p.name).join(" · ")}</span>
                  <span aria-hidden="true">·</span>
                  {countFor(c.id)} {countFor(c.id) === 1 ? "system" : "systems"}
                </p>
                {/* Stretched link: the whole card is the target; the visible text names where it goes (the
                    accessible name is the same words) */}
                <Link
                  to={c.page}
                  aria-label={c.cta}
                  className="mt-5 inline-flex items-center gap-2 text-button font-semibold text-accent after:absolute after:inset-0 group-hover:text-link group-focus-visible:text-link group-focus-within:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {c.cta}
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 group-focus-within:translate-x-1.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
