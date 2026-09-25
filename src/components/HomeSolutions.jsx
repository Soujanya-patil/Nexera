import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import SceneImg from "./SceneImg";
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

export default function HomeSolutions() {
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

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal
              key={c.id}
              as="article"
              delay={i * 0.08}
              className="group relative flex flex-col overflow-hidden rounded-xl bg-paper shadow-[0_1px_2px_rgba(7,22,33,0.06),0_12px_28px_-16px_rgba(7,22,33,0.22)] transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(7,22,33,0.06),0_20px_36px_-16px_rgba(7,22,33,0.3)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <ParallaxMedia amount={5}>
                  <SceneImg
                    name={c.img}
                    alt={c.alt}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="h-full w-full object-cover transition-[scale] duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </ParallaxMedia>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-graphite">{c.copy}</p>
                {/* Stretched link: the whole card is the target, the visible text names it */}
                <Link
                  to={`/solutions#${c.id}`}
                  aria-label={`Learn more about ${c.title} storage`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest after:absolute after:inset-0 group-hover:text-steel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  Learn More
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
