import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import SceneImg from "../components/SceneImg";
import { SOLUTION_PAGES } from "../data/solutions";
import { useScrollReveal } from "../lib/scrollReveal";

// The Solutions hub: one card per segment, each opening its own page. The card ids are the old
// section ids, so links such as /solutions#ci (Home's Solutions cards) still land on the right card.
const SEGMENTS = [
  {
    id: "residential",
    page: SOLUTION_PAGES.residential.path,
    title: "Residential Energy Storage",
    copy: "Solar power shouldn't stop when the sun goes down. Home battery systems from Midea and TCL.",
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
    img: "utility-yard",
    alt: "Aerial view of rows of Hithium battery storage containers at a large site",
  },
];

export default function Solutions() {
  const grid = useRef(null);
  const reveal = useScrollReveal(grid, { stagger: 0.1 });
  return (
    <div className="solutions-page">
      <PageHeader
        eyebrow="Solutions"
        title="Storage built for how you'll actually use it"
        subtitle="Three segments, one supply chain — residential, commercial & industrial, and utility-scale."
      />

      {/* Same card treatment as For EPCs' application cards: partner imagery under a dark gradient. */}
      <section aria-label="Solutions by segment" className="bg-paper py-14 lg:py-20">
        <ul ref={grid} data-sr-state={reveal} className="grid container-site gap-5 md:grid-cols-3">
          {SEGMENTS.map((s) => (
            <li key={s.id} id={s.id} data-sr className="scroll-mt-20">
              <Link
                to={s.page}
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-night text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal md:aspect-[4/5]"
              >
                <SceneImg
                  name={s.img}
                  alt={s.alt}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="absolute inset-0 h-full w-full object-cover transition-[scale,translate] duration-700 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/5" />
                <span aria-hidden="true" className="absolute inset-0 bg-night/0 transition-colors duration-500 group-hover:bg-night/35 group-focus-visible:bg-night/35" />
                <div className="relative p-6 md:p-7">
                  <h2 className="text-2xl font-semibold transition-colors duration-300 group-hover:text-signal group-focus-visible:text-signal">
                    {s.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ice/85">{s.copy}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-signal">
                    {s.cta}
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
