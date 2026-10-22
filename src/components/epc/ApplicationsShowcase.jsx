import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import SceneImg from "../SceneImg";
import { PRODUCTS } from "../../data/products";
import { useScrollReveal } from "../../lib/scrollReveal";
import { STAGGER } from "../../lib/tokens";

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
  const reveal = useScrollReveal(grid);
  return (
    <section aria-labelledby="applications-title" className="bg-white py-20 md:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-muted">BESS applications</p>
            <AnimatedText id="applications-title" className="mt-3 text-h2 font-semibold text-ink">
              Where Your Projects Can Deploy Storage
            </AnimatedText>
          </div>
          <p className="max-w-md text-copy">Residential, commercial &amp; industrial, and utility-scale systems from TCL, Hithium and CLOU.</p>
        </div>

        <ul ref={grid} data-sr-state={reveal} className="mt-12 grid gap-5 md:grid-cols-3">
          {APPS.map((a) => (
            <li key={a.id} data-sr>
              <Link
                to={`/products?app=${a.id}`}
                className="card-hover group relative flex aspect-[4/3] focus-visible:outline-link flex-col justify-end overflow-hidden rounded-2xl bg-deep-grid text-white focus-visible:outline-2 focus-visible:outline-offset-2 md:aspect-[4/5]"
              >
                <SceneImg
                  name={a.img}
                  alt={a.alt}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="card-media absolute inset-0 h-full w-full object-cover"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep-grid via-deep-grid/55 to-deep-grid/5" />
                <span aria-hidden="true" className="absolute inset-0 bg-deep-grid/0 transition-colors duration-base group-hover:bg-deep-grid/35 group-focus-within:bg-deep-grid/35 group-focus-visible:bg-deep-grid/35" />
                <div className="relative p-6 md:p-7">
                  <p className="flex items-center gap-2 eyebrow text-paper/70">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {a.count} {a.count === 1 ? "system" : "systems"} in the catalogue
                  </p>
                  <h3 className="mt-3 text-h3 font-semibold transition-colors duration-fast group-hover:text-accent group-focus-within:text-accent group-focus-visible:text-accent">{a.title}</h3>
                  <p className="mt-2 text-small text-paper/80">{a.copy}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-small font-semibold text-accent">
                    Explore Solutions
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 group-focus-within:translate-x-1.5" />
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
