import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedText from "./ui/AnimatedText";
import { useEntrance } from "../lib/entrance";
import { APPLICATIONS, LISTED_PRODUCTS, applicationLabel } from "../data/products";
import tclLogo from "../assets/partners/tcl-logo.png";
import hithiumLogo from "../assets/partners/hithium-logo.png";
import { DUR, EASE } from "../lib/tokens";

// Equal treatment for both partners.
// Heights are set per logo so the two read at a similar optical size (a step smaller on phones, so both sit in one row) (the source PNGs differ).
// Where each partner's systems fit is read from the product catalogue — never written separately.
const logos = [
  { id: "tcl", name: "TCL", src: tclLogo, size: [86, 31], className: "h-7 sm:h-8" },
  { id: "hithium", name: "Hithium", src: hithiumLogo, size: [355, 89], className: "h-8 sm:h-9" },
].map((l) => {
  const products = LISTED_PRODUCTS.filter((p) => p.partner === l.id);
  const apps = APPLICATIONS.filter((a) => products.some((p) => p.applications.includes(a.id))).map((a) => applicationLabel(a.id));
  return { ...l, apps, count: products.length };
});

// The two logos, static, each a link to its partner page (the director's Final Copy: no looping strip).
// Each rests slightly muted; on hover or keyboard focus it comes to full presence (colour + opacity)
// with a short lift, a green indicator draws beneath it, and the hairline between the two brightens.
const Logo = ({ l, index, last, onHover }) => (
  <li data-e="logo" data-logo={index} className="group/logo relative flex shrink-0 items-center px-4 sm:px-8">
    {!last && (
      <span aria-hidden="true" className="absolute right-0 top-1/2 h-6 w-px -translate-y-1/2 bg-line transition-colors duration-fast group-hover/logo:bg-accent/60 group-focus-within/logo:bg-accent/60" />
    )}
    <Link
      to={`/partners/${l.id}`}
      onPointerEnter={() => onHover(l.id)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(l.id)}
      onBlur={() => onHover(null)}
      className="relative grid min-h-11 place-items-center rounded-control px-2 py-2 focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <img
        src={l.src}
        width={l.size[0]}
        height={l.size[1]}
        loading="lazy"
        decoding="async"
        alt={`${l.name} logo`}
        className={`${l.className} w-auto max-w-none object-contain opacity-60 grayscale-[70%] transition-[opacity,filter,translate] duration-base ease-standard group-hover/logo:-translate-y-0.5 group-focus-within/logo:-translate-y-0.5 group-hover/logo:opacity-100 group-focus-within/logo:opacity-100 group-hover/logo:grayscale-0 group-focus-within/logo:grayscale-0`}
      />
    </Link>
    <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-0.5 w-10 -translate-x-1/2 scale-x-0 rounded-full bg-accent transition-[scale] duration-base ease-standard group-hover/logo:scale-x-100 group-focus-within/logo:scale-x-100" />
  </li>
);

/**
 * Technology partners. The two logos, TCL and Hithium, sit still in one centred row (no looping strip
 * and no hidden copies), each a link to its partner page with its alt text ("TCL logo", "Hithium logo").
 *
 * Entrance ("technology reveal"): eyebrow → heading (its own word reveal) → description, then the
 * logos arrive from the right partner by partner — TCL, then Hithium, ~100 ms apart.
 * Hover: the partner's logo comes to full presence (above) and the line beneath the strip shows
 * where that partner's systems fit — applications and number of systems, from the catalogue.
 * The partner names in the description link to their partner pages (/partners/:id).
 */
export default function HomePartners() {
  const [hot, setHot] = useState(null);
  const root = useRef(null);
  const enter = useEntrance(root, ({ tl, q }) => {
    tl.fromTo(q('[data-e="eyebrow"]'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: DUR.base, clearProps: "all" }, 0)
      .fromTo(q('[data-e="desc"]'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: DUR.base, clearProps: "all" }, 0.3)
      .fromTo(
        q("[data-logo]"),
        { opacity: 0, x: 28 },
        { opacity: 1, x: 0, duration: DUR.slow, ease: EASE.emphasized, stagger: (i, el) => Number(el.dataset.logo) * 0.1, clearProps: "all" },
        0.45
      )
      .fromTo(q('[data-e="fit"]'), { opacity: 0 }, { opacity: 1, duration: DUR.base, clearProps: "all" }, 0.85);
  });
  const partner = logos.find((l) => l.id === hot);

  return (
    <section ref={root} data-enter={enter} className="border-y border-line bg-white py-section">
      <div className="grid container-site items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p data-e="eyebrow" className="eyebrow text-muted">
            Our Technology Partners
          </p>
          <AnimatedText className="mt-eyebrow text-h2 font-semibold text-ink">Authorised TCL and Hithium Distributor in India</AnimatedText>
          <p data-e="desc" className="mt-heading max-w-measure text-copy">
            Nexera Powertech is an authorised partner of TCL and Hithium, two established battery and energy-storage
            manufacturers. We hold spares stock in India and provide design, commissioning, warranty-claim support and
            installer training, so you deal with one local team. See our{" "}
            <Link to="/partners/tcl" className="font-medium text-accent underline-offset-4 hover:underline focus-visible:underline">
              TCL range
            </Link>{" "}
            and{" "}
            <Link to="/partners/hithium" className="font-medium text-accent underline-offset-4 hover:underline focus-visible:underline">
              Hithium range
            </Link>
            .
          </p>
        </div>
        <div className="min-w-0">
          <ul className="flex flex-wrap items-center justify-center py-4" aria-label="Technology partners">
            {logos.map((l, i) => (
              <Logo key={l.name} l={l} index={i} last={i === logos.length - 1} onHover={setHot} />
            ))}
          </ul>
          {/* Where the hovered partner's systems fit (fixed height: hovering never shifts the layout) */}
          <p data-e="fit" aria-hidden="true" className="mt-3 flex h-5 items-center justify-center gap-2 text-micro text-copy">
            <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-fast ${partner ? "bg-accent" : "bg-line"}`} />
            <span key={hot ?? "all"} className="journey-detail">
              {partner ? (
                <>
                  <span className="font-semibold text-accent">{partner.name}</span> · {partner.apps.join(" · ")} · {partner.count}{" "}
                  {partner.count === 1 ? "system" : "systems"} in the catalogue
                </>
              ) : (
                "Residential, C&I and utility-scale systems across our technology partners"
              )}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
