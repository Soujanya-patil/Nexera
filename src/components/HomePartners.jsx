import { Fragment, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedText from "./ui/AnimatedText";
import { useEntrance } from "../lib/entrance";
import { useMediaQuery } from "../lib/scrollSteps";
import { Marquee } from "./ui/marquee";
import { APPLICATIONS, PRODUCTS, applicationLabel } from "../data/products";
import tclLogo from "../assets/partners/tcl-logo.png";
import hithiumLogo from "../assets/partners/hithium-logo.png";
import clouLogo from "../assets/partners/clou-logo.png";

// Equal treatment for all three: the CLOU agreement is signed, so the earlier text-only rule is gone.
// Heights are set per logo so the three read at a similar optical size (the source PNGs differ).
// Where each partner's systems fit is read from the product catalogue — never written separately.
const logos = [
  { id: "tcl", name: "TCL", src: tclLogo, className: "h-8" },
  { id: "hithium", name: "Hithium", src: hithiumLogo, className: "h-9" },
  { id: "clou", name: "CLOU", src: clouLogo, className: "h-10" },
].map((l) => {
  const products = PRODUCTS.filter((p) => p.partner === l.id);
  const apps = APPLICATIONS.filter((a) => products.some((p) => p.applications.includes(a.id))).map((a) => applicationLabel(a.id));
  return { ...l, apps, count: products.length };
});

// The partners named in the description, each a link to its partner page.
const NAMED = [
  ["tcl", "TCL"],
  ["hithium", "Hithium"],
  ["clou", "CLOU"],
  ["midea", "Midea"],
];

// Each logo rests slightly muted; on hover it comes to full presence (colour + opacity) with a short
// lift, a green indicator draws beneath it, and the hairline divider beside it brightens.
const Logo = ({ l, index, hidden, onHover }) => (
  <li
    aria-hidden={hidden || undefined}
    data-e="logo"
    data-logo={index}
    onPointerEnter={() => onHover(l.id)}
    onPointerLeave={() => onHover(null)}
    className="group/logo relative flex shrink-0 items-center px-6 sm:px-8"
  >
    <span aria-hidden="true" className="absolute right-0 top-1/2 h-6 w-px -translate-y-1/2 bg-line transition-colors duration-300 group-hover/logo:bg-signal/60" />
    <img
      src={l.src}
      loading="lazy"
      decoding="async"
      // The same alt in the marquee's looping copies (they sit in aria-hidden, so screen readers skip
      // them; crawlers still see a description).
      alt={`${l.name} logo`}
      className={`${l.className} w-auto max-w-none object-contain opacity-60 grayscale-[70%] transition-[opacity,filter,translate] duration-500 ease-out group-hover/logo:-translate-y-0.5 group-hover/logo:opacity-100 group-hover/logo:grayscale-0`}
    />
    <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-signal transition-[width] duration-500 ease-out group-hover/logo:w-10" />
  </li>
);

/**
 * Technology partners. The logos run in a slow Magic UI Marquee (installed from the Magic UI
 * registry; CSS keyframes only, no JS animation), faded at both edges and paused on hover so a
 * logo can be read. The moving copies are hidden from assistive tech, which gets one plain list of
 * partner names (with where their systems fit) instead. Under prefers-reduced-motion the logos sit
 * still in a single row.
 *
 * Entrance ("technology reveal"): eyebrow → heading (its own word reveal) → description, then the
 * logos arrive from the right partner by partner — TCL, Hithium, CLOU, ~100 ms apart.
 * Hover: the partner's logo comes to full presence (above) and the line beneath the strip shows
 * where that partner's systems fit — applications and number of systems, from the catalogue.
 * The partner names in the description link to their partner pages (/partners/:id).
 */
export default function HomePartners() {
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [hot, setHot] = useState(null);
  const root = useRef(null);
  const enter = useEntrance(root, ({ tl, q }) => {
    tl.fromTo(q('[data-e="eyebrow"]'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.55, clearProps: "all" }, 0)
      .fromTo(q('[data-e="desc"]'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, clearProps: "all" }, 0.3)
      .fromTo(
        q("[data-logo]"),
        { opacity: 0, x: 28 },
        { opacity: 1, x: 0, duration: 0.7, ease: "power3.out", stagger: (i, el) => Number(el.dataset.logo) * 0.1, clearProps: "all" },
        0.45
      )
      .fromTo(q('[data-e="fit"]'), { opacity: 0 }, { opacity: 1, duration: 0.5, clearProps: "all" }, 0.85);
  });
  const partner = logos.find((l) => l.id === hot);

  return (
    <section ref={root} data-enter={enter} className="border-y border-line bg-paper py-16 md:py-20">
      <div className="grid container-site items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p data-e="eyebrow" className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">
            Our Technology Partners
          </p>
          <AnimatedText className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">Global Technology. Local Impact.</AnimatedText>
          <p data-e="desc" className="mt-3 max-w-lg text-graphite">
            NEXERA brings systems from world-leading BESS manufacturers —{" "}
            {NAMED.map(([id, name], i) => (
              <Fragment key={id}>
                {i > 0 && (i === NAMED.length - 1 ? " and " : ", ")}
                <Link to={`/partners/${id}`} className="font-medium text-forest underline-offset-4 hover:underline">
                  {name}
                </Link>
              </Fragment>
            ))}{" "}
            — with products across residential, C&amp;I and utility-scale segments.
          </p>
        </div>
        <div className="min-w-0">
          {still ? (
            <ul className="flex flex-wrap items-center justify-center" aria-label="Technology partners">
              {logos.map((l, i) => (
                <Logo key={l.name} l={l} index={i} onHover={setHot} />
              ))}
            </ul>
          ) : (
            <>
              <ul className="sr-only" aria-label="Technology partners">
                {logos.map((l) => (
                  <li key={l.name}>
                    {l.name}: {l.apps.join(", ")}
                  </li>
                ))}
              </ul>
              <Marquee
                pauseOnHover
                repeat={4}
                aria-hidden="true"
                className="py-4 [--duration:36s] [--gap:0rem] [mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)]"
              >
                <ul className="flex items-center">
                  {logos.map((l, i) => (
                    <Logo key={l.name} l={l} index={i} hidden onHover={setHot} />
                  ))}
                </ul>
              </Marquee>
            </>
          )}
          {/* Where the hovered partner's systems fit (fixed height: hovering never shifts the layout) */}
          <p data-e="fit" aria-hidden="true" className="mt-3 flex h-5 items-center justify-center gap-2 text-xs text-graphite">
            <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${partner ? "bg-signal" : "bg-line"}`} />
            <span key={hot ?? "all"} className="journey-detail">
              {partner ? (
                <>
                  <span className="font-semibold text-forest">{partner.name}</span> · {partner.apps.join(" · ")} · {partner.count}{" "}
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
