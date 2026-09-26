import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SceneImg from "./SceneImg";
import { useEntrance } from "../lib/entrance";
import AnimatedText from "./ui/AnimatedText";
import ParallaxMedia from "./ui/ParallaxMedia";

// Imagery and alt text reused from ScaleStory (same three segments); copy from the approved mockup.
// Each card links to its segment's section on the Solutions page.
const cards = [
  {
    id: "residential",
    title: "Residential",
    copy: "Store your solar power. Use it when you need it. Greater independence, lower bills, reliable backup.",
    // TODO(india-imagery): see ScaleStory — res-house is a CGI render of a generic non-Indian house.
    img: "res-house",
    alt: "Rendering of a home at night with rooftop solar and a wall-mounted TCL battery beside the garage",
  },
  {
    id: "ci",
    title: "Commercial & Industrial (C&I)",
    copy: "Cut peak demand charges. Improve reliability. Maximise solar ROI.",
    // TODO(india-imagery): see ScaleStory — ci-industrial is not identifiably Indian.
    img: "ci-industrial",
    alt: "TCL floor-standing battery cabinets and inverter beside an industrial building",
  },
  {
    id: "utility",
    title: "Utility-Scale",
    copy: "Enable a cleaner, more stable grid with large-scale storage.",
    // TODO(india-imagery): see ScaleStory — utility-yard shows Chinese-language signage.
    img: "utility-yard",
    alt: "Aerial view of rows of Hithium battery storage containers at a large site",
  },
];

/**
 * Solutions: the three segment cards.
 * Entrance (medium rhythm): each card rises out of its own frame — a clip reveal from the bottom
 * with a short lift — one after another.
 * Hover / focus: the card rises 6 px with a deeper shadow, a green accent draws along its top edge,
 * the photo zooms slowly and brightens (a soft shade over it lifts), the title shifts a touch and
 * the arrow moves.
 */
export default function HomeSolutions() {
  const grid = useRef(null);
  const enter = useEntrance(grid, ({ tl, q }) => {
    tl.fromTo(
      q("[data-e]"),
      { opacity: 0, y: 36, clipPath: "inset(18% 0% 0% 0% round 12px)" },
      { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 12px)", duration: 0.9, stagger: 0.12, ease: "power3.out", clearProps: "all" }
    );
  });
  return (
    <section className="bg-ice py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Our Solutions</p>
            <AnimatedText className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">Energy Storage for Every Need</AnimatedText>
            <p className="mt-3 max-w-2xl text-graphite">
              From homes to industries to the grid — Nexera brings the right storage solution for every application.
            </p>
          </div>
          <Link
            to="/solutions"
            className="group/all inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-forest transition-colors hover:text-steel"
          >
            View All Solutions
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/all:translate-x-1" />
          </Link>
        </div>

        <div ref={grid} data-enter={enter} className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.id}
              data-e
              className="group relative flex flex-col overflow-hidden rounded-xl bg-paper shadow-[0_1px_2px_rgba(7,22,33,0.06),0_12px_28px_-16px_rgba(7,22,33,0.22)] transition-[box-shadow,translate] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_1px_2px_rgba(7,22,33,0.06),0_26px_44px_-18px_rgba(7,22,33,0.34)] focus-within:-translate-y-1.5"
            >
              <span aria-hidden="true" className="absolute left-6 top-0 z-10 h-0.5 w-0 rounded-full bg-signal transition-[width] duration-500 ease-out group-hover:w-14 group-focus-within:w-14" />
              <div className="relative aspect-[16/10] overflow-hidden">
                <ParallaxMedia amount={5}>
                  <SceneImg
                    name={c.img}
                    alt={c.alt}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="h-full w-full object-cover transition-[scale] duration-[1400ms] ease-out group-hover:scale-[1.06]"
                  />
                </ParallaxMedia>
                {/* A soft shade that lifts on hover, so the photo seems to brighten */}
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/30 via-night/5 to-transparent transition-opacity duration-700 group-hover:opacity-0" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold text-ink transition-[translate] duration-500 ease-out group-hover:translate-x-1">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-graphite">{c.copy}</p>
                {/* Stretched link: the whole card is the target, the visible text names it */}
                <Link
                  to={`/solutions#${c.id}`}
                  aria-label={`Learn more about ${c.title} storage`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest after:absolute after:inset-0 group-hover:text-steel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  Learn More
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
