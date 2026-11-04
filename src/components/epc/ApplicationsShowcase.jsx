import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import { PRODUCTS } from "../../data/products";
import { useScrollReveal } from "../../lib/scrollReveal";
import { STAGGER } from "../../lib/tokens";

// The card photos (src/assets/partner-cards): partners at work, each exported at 600 / 900 / 1200 px
// wide (4:3) as AVIF, WebP and JPG from the approved 1600 x 1200 originals
// (nexera-reference/NEXERA_partner_images). `position` keeps the people and the equipment in the
// card's portrait crop on desktop (phones show the whole 4:3 photo).
const files = import.meta.glob("../../assets/partner-cards/*.{avif,webp,jpg}", { eager: true, query: "?url", import: "default" });
const WIDTHS = [600, 900, 1200];
const url = (name, w, ext) => files[`../../assets/partner-cards/${name}-${w}.${ext}`];
const srcSet = (name, ext) => WIDTHS.map((w) => `${url(name, w, ext)} ${w}w`).join(", ");

/** A card photo as a <picture> (AVIF → WebP → JPG), its intrinsic size set, loaded lazily (below the first screen). */
function CardPicture({ name, alt, position }) {
  const sizes = "(min-width: 768px) 33vw, 100vw";
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(name, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, "webp")} sizes={sizes} />
      <img
        src={url(name, 900, "jpg")}
        srcSet={srcSet(name, "jpg")}
        sizes={sizes}
        width={1200}
        height={900}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="card-media absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position }}
      />
    </picture>
  );
}

// Lines as on the Home "Solutions" cards; the system count is read from the catalogue. Each card opens
// the Products explorer filtered to that application.
const APPS = [
  {
    id: "residential",
    title: "Residential",
    copy: "Store your solar power. Use it when you need it. Greater independence, lower bills, reliable backup.",
    img: "residential",
    position: "100% 50%",
    alt: "Technicians installing a wall-mounted home battery at an Indian home",
  },
  {
    id: "ci",
    title: "Commercial & Industrial",
    copy: "Cut peak demand charges. Improve reliability. Maximise solar ROI.",
    img: "ci",
    position: "100% 50%",
    alt: "Engineer commissioning outdoor battery cabinets at a factory",
  },
  {
    id: "utility",
    title: "Utility-Scale",
    copy: "Enable a cleaner, more stable grid with large-scale storage.",
    img: "utility",
    position: "90% 50%",
    alt: "Engineers walking beside battery storage containers at a solar farm",
  },
].map((a) => ({ ...a, count: PRODUCTS.filter((p) => p.applications.includes(a.id)).length }));

/**
 * BESS APPLICATIONS — where EPCs deploy the systems: residential, C&I, utility (the Products
 * explorer's categories). Photos of partners at work under a dark gradient; on hover or focus the image
 * scales and lifts slightly, the overlay deepens, the title turns green and the arrow moves.
 */
export default function ApplicationsShowcase() {
  const grid = useRef(null);
  const reveal = useScrollReveal(grid);
  return (
    <section aria-labelledby="applications-title" className="bg-white py-section">
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
                className="card-hover group relative flex aspect-[4/3] focus-visible:outline-link flex-col justify-end overflow-hidden rounded-card bg-deep-grid text-white focus-visible:outline-2 focus-visible:outline-offset-2 md:aspect-[4/5]"
              >
                <CardPicture name={a.img} alt={a.alt} position={a.position} />
                {/* Phones (< 768 px): the 4:3 card shows the whole photo with the copy over most of it, so the
                    shade is deeper there to keep every line AA; desktop's taller card keeps the light one. */}
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep-grid via-deep-grid/55 to-deep-grid/5 max-md:via-deep-grid/80 max-md:to-deep-grid/65" />
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
