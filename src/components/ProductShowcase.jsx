import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import tclLineup from "../assets/products/tcl-product-lineup.jpg";
import hithiumDeployed from "../assets/products/hithium-containers-deployed.jpg";

/**
 * Scene 5 — SHOWCASE. Catalogue, not card-grid: one real product family per row, full-width
 * image, generous whitespace. Hierarchy is image -> name -> application -> overview ->
 * capabilities -> specs -> enquire, per brief. Hithium's capabilities fold in the certification
 * points that used to live in the standalone Technology scene (now retired from Home) — nothing
 * invented, same copy, different home.
 *
 * Normal flow with IntersectionObserver reveals, not a pinned scene — motion priority for this
 * section is "tertiary" per brief, so it doesn't need a GSAP timeline. No `-mt-[100vh]` rise-over
 * here: that now belongs to WhoWeAre, which sits directly after ScaleStory's held tail. Pulling
 * this section up over WhoWeAre's real content would clip it — same reasoning as Credibility
 * losing its own rise-over when ProductShowcase was first inserted before it.
 *
 * Top padding is lighter than the bottom (`pt-16 md:pt-20` vs `pb-24 md:pb-32`) on purpose: it
 * meets WhoWeAre's own reduced bottom padding, which is the other half of closing the gap that
 * used to sit between the two sections. Symmetric `py-24 md:py-32` on both stacked 256px of dead
 * space at that one seam.
 */
const products = [
  {
    id: "tcl-bluearK",
    name: "TCL BlueArk",
    application: "Residential & light C&I",
    overview:
      "Stackable battery modules, floor-standing cabinets, wall-mounted units and inverters, backed by TCL's global manufacturing and brand support.",
    capabilities: ["Compact, stackable footprint", "Global brand backing", "Residential through light C&I scale"],
    specs: "W10 — 125kW / 261kWh · X5 — wall-mounted",
    img: tclLineup,
    alt: "TCL battery energy storage range: stackable residential battery modules, floor-standing C&I cabinets, and wall-mounted units and inverters",
  },
  {
    id: "hithium",
    name: "Hithium",
    application: "C&I & utility-scale",
    overview:
      "Liquid-cooled containerised storage, from a single C&I cabinet to grid-scale DC blocks, engineered for high cyclic lifetime.",
    capabilities: ["Liquid cooling", "High cyclic lifetime", "IEC 62619 / 62477 certified", "ISO 9001 / 14001 / 45001"],
    specs: "261kWh C&I cabinet · 1022kWh DC block · 6.25MWh (4h) utility block",
    img: hithiumDeployed,
    alt: "Row of Hithium containerised battery storage units installed on a gravel site under an evening sky",
  },
];

export default function ProductShowcase() {
  return (
    <section className="relative bg-night text-bone">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-20 md:pb-32">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-bone/60">Product Showcase</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-bone md:text-4xl">Real systems, ready to deploy</h2>
        </Reveal>

        <div className="mt-16 space-y-24 md:space-y-32">
          {products.map((p, i) => (
            <Reveal key={p.id} className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
              <figure
                className={`group overflow-hidden rounded-lg bg-charcoal ring-1 ring-bone/10 transition-[box-shadow] duration-300 hover:ring-signal/50 ${
                  i % 2 === 1 ? "md:order-2" : ""
                }`}
              >
                <img
                  src={p.img}
                  width="700"
                  height="550"
                  loading="lazy"
                  decoding="async"
                  alt={p.alt}
                  className="block h-auto w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.025]"
                />
              </figure>
              <div>
                <p className="text-sm text-bone/60">{p.application}</p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-bone md:text-3xl">{p.name}</h3>
                <p className="mt-4 leading-relaxed text-bone/75">{p.overview}</p>
                <ul className="mt-6 space-y-2.5">
                  {p.capabilities.map((c) => (
                    <li key={c} className="flex items-center gap-2.5 text-sm text-bone/85">
                      <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-signal" />
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-bone/15 pt-4 text-xs text-bone/50">{p.specs}</p>
                <a
                  href="#enquire"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-signal transition-colors hover:text-bone"
                >
                  Enquire about {p.name}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
