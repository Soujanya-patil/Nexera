import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import SceneImg from "../SceneImg";
import { PRODUCTS } from "../../data/products";
import { useScrollReveal } from "../../lib/scrollReveal";

// Images, alt text and lines as on the Home "Solutions" cards; the system count is read from the
// catalogue. Each card opens the Products explorer filtered to that application.
const APPS = [
  {
    id: "residential",
    title: "Residential",
    copy: "Store your solar power. Use it when you need it. Greater independence, lower bills, reliable backup.",
    img: "res-house",
    alt: "Rendering of a home at night with rooftop solar and a wall-mounted TCL battery beside the garage",
  },
  {
    id: "ci",
    title: "Commercial & Industrial",
    copy: "Cut peak demand charges. Improve reliability. Maximise solar ROI.",
    img: "ci-industrial",
    alt: "TCL floor-standing battery cabinets and inverter beside an industrial building",
  },
  {
    id: "utility",
    title: "Utility-Scale",
    copy: "Enable a cleaner, more stable grid with large-scale storage.",
    img: "utility-yard",
    alt: "Aerial view of rows of Hithium battery storage containers at a large site",
  },
].map((a) => ({ ...a, count: PRODUCTS.filter((p) => p.applications.includes(a.id)).length }));

/**
 * BESS APPLICATIONS — where EPCs deploy the systems: residential, C&I, utility (the Products
 * explorer's categories). Real partner imagery under a dark gradient; on hover or focus the image
 * scales and lifts slightly, the overlay deepens, the title turns green and the arrow moves.
 */
export default function ApplicationsShowcase() {
  const grid = useRef(null);
  const reveal = useScrollReveal(grid, { stagger: 0.1 });
  return (
    <section aria-labelledby="applications-title" className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">BESS applications</p>
            <AnimatedText id="applications-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Where Your Projects Can Deploy Storage
            </AnimatedText>
          </div>
          <p className="max-w-md text-graphite">Residential, commercial &amp; industrial, and utility-scale systems from TCL, Hithium and CLOU.</p>
        </div>

        <ul ref={grid} data-sr-state={reveal} className="mt-12 grid gap-5 md:grid-cols-3">
          {APPS.map((a) => (
            <li key={a.id} data-sr>
              <Link
                to={`/products?app=${a.id}`}
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-night text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal md:aspect-[4/5]"
              >
                <SceneImg
                  name={a.img}
                  alt={a.alt}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="absolute inset-0 h-full w-full object-cover transition-[scale,translate] duration-700 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/5" />
                <span aria-hidden="true" className="absolute inset-0 bg-night/0 transition-colors duration-500 group-hover:bg-night/35 group-focus-visible:bg-night/35" />
                <div className="relative p-6 md:p-7">
                  <p className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-ice/70">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" />
                    {a.count} {a.count === 1 ? "system" : "systems"} in the catalogue
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold transition-colors duration-300 group-hover:text-signal group-focus-visible:text-signal">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ice/80">{a.copy}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-signal">
                    Explore Solutions
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
