import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useMotion, useScrollScene } from "../lib/motion";
import DisplayHeading from "./DisplayHeading";
import SceneImg from "./SceneImg";
import TechGrid from "./TechGrid";
import tclLogo from "../assets/partners/tcl-logo.png";
import hithiumLogo from "../assets/partners/hithium-logo.png";
import clouLogo from "../assets/partners/clou-logo.png";

/**
 * Scene 5 — TECHNOLOGY PARTNERS. NEXERA as solution provider; TCL, Hithium and CLOU as the
 * technology it supplies. Official logos (extracted from each partner's own brochure/product
 * artwork) sit alongside the names, never implying NEXERA manufactures the partner product.
 *
 * INTERACTIVE — three equal panels that expand on hover/focus (and on tap, via the same selected
 * state, since coarse pointers get no hover). The active panel widens, its imagery lifts out of
 * greyscale, and its product context slides in; the others recede. Purposeful rather than
 * decorative: it lets a visitor compare partners by application without leaving the page, which is
 * the actual question at this point in the journey.
 *
 * Keyboard and touch both work without hover: the panels are real <button>s driving the same
 * `active` state, so focus expands a panel identically and a tap selects it.
 *
 * CLOU — authorized partner (agreement signed), treated identically to TCL and Hithium. Its copy is
 * still only what the project states (utility-scale applications). It has no site photography yet,
 * so its panel uses the <TechGrid /> backdrop rather than a borrowed photo.
 */
const partners = [
  {
    id: "tcl",
    name: "TCL",
    logo: tclLogo,
    badge: "Authorized Partner",
    application: "Residential & C&I",
    copy: "Residential and C&I BESS, from TCL's global manufacturing.",
    img: "partner-tcl",
    // TODO(india-imagery): partner HQ, may be intentional. src/assets/scenes/partner-tcl-{640,1000}.webp is TCL's tower in China; keep or replace, update `alt`.
    alt: "TCL headquarters office tower",
    position: "50% 40%",
  },
  {
    id: "hithium",
    name: "Hithium",
    logo: hithiumLogo,
    badge: "Authorized Partner",
    application: "C&I & utility-scale",
    copy: "Liquid-cooled C&I and utility-scale BESS.",
    img: "partner-hithium",
    // TODO(india-imagery): partner HQ, may be intentional. src/assets/scenes/partner-hithium-{640,1000}.webp shows Chinese-character signage on Hithium's HQ; keep or replace, update `alt`.
    alt: "Hithium headquarters building with a hexagonal facade",
    position: "50% 30%",
  },
  {
    id: "clou",
    name: "CLOU",
    logo: clouLogo,
    badge: "Authorized Partner",
    application: "Utility-scale",
    copy: "Select global storage technologies including CLOU for utility-scale.",
    img: null, // no CLOU photography exists; TechGrid stands in rather than a misleading photo
    alt: null,
    position: null,
  },
];

export default function Credibility() {
  const { mode } = useMotion();
  const cine = mode === "cinematic";
  const root = useRef(null);
  const [active, setActive] = useState(0);

  useScrollScene(
    root,
    ({ gsap, q }) => {
      const trigger = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true };
      // Opposed drift keeps the two photographic panels from feeling like one flat backdrop.
      gsap.fromTo(q('[data-a="bg-tcl"]'), { yPercent: -5, scale: 1.08 }, { yPercent: 5, scale: 1.08, ease: "none", scrollTrigger: trigger });
      gsap.fromTo(q('[data-a="bg-hithium"]'), { yPercent: 5, scale: 1.08 }, { yPercent: -5, scale: 1.08, ease: "none", scrollTrigger: trigger });
      gsap.fromTo(
        q('[data-a="rise"]'),
        { autoAlpha: 0, y: 44 },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: root.current, start: "top 65%", end: "top 20%", scrub: 0.5, invalidateOnRefresh: true },
        }
      );
    },
    cine
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-night text-bone">
      <TechGrid size={64} tone={0.04} glow={false} drift={3} />

      <div className="relative z-10 px-6 pt-16 text-center md:pt-24">
        <DisplayHeading eyebrow="NEXERA — Solution Provider" className="mx-auto max-w-4xl">
          Technology partners behind every system
        </DisplayHeading>
      </div>

      {/* Equal thirds that redistribute toward the active panel on desktop; plain stacked panels
          below md, where there's no room to expand and no hover to drive it. */}
      <div className="relative z-10 mt-12 flex flex-col md:mt-16 md:min-h-[78svh] md:flex-row">
        {partners.map((p, i) => {
          const isActive = i === active;
          return (
            <button
              key={p.id}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-pressed={isActive}
              aria-label={`${p.name} — ${p.application}`}
              className={`group relative min-h-[46svh] overflow-hidden border-t border-bone/10 text-left transition-[flex-grow] duration-700 ease-out md:min-h-[78svh] md:border-l md:border-t-0 ${
                isActive ? "md:grow-[1.6]" : "md:grow-[1]"
              } md:basis-0`}
            >
              {p.img ? (
                <SceneImg
                  data-a={`bg-${p.id}`}
                  name={p.img}
                  alt={p.alt}
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className={`absolute inset-0 h-full w-full object-cover transition-[filter,opacity] duration-700 will-change-transform ${
                    isActive ? "opacity-100 saturate-100" : "opacity-70 saturate-0"
                  }`}
                  style={{ objectPosition: p.position }}
                />
              ) : (
                // CLOU: technical backdrop, not stand-in product photography.
                <div className="absolute inset-0 bg-charcoal">
                  <TechGrid size={40} tone={0.07} glow={isActive} drift={2} />
                </div>
              )}
              <div aria-hidden="true" className="absolute inset-0 bg-night/20" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-night/45" />

              <div className="relative z-10 flex h-full min-h-[46svh] flex-col justify-end px-6 pb-14 md:min-h-[78svh] md:px-10 md:pb-16">
                <div data-a="rise" data-reveal style={{ "--reveal-delay": `${i * 0.1}s` }}>
                  {p.badge ? (
                    <span className="rounded-full bg-signal/15 px-3 py-1 text-xs font-medium text-signal">{p.badge}</span>
                  ) : (
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-bone/50">Technology</span>
                  )}
                  <img src={p.logo} alt={p.name} className="mt-5 h-8 w-auto" />
                  <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-signal">{p.application}</p>

                  {/* Product context: always present for screen readers and for the stacked mobile
                      layout; on desktop it reveals as the panel becomes active. */}
                  <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-700 ease-out md:max-h-0 md:opacity-0 ${
                      isActive ? "md:max-h-40 md:opacity-100" : ""
                    }`}
                  >
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-bone/80">{p.copy}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-signal">
                      View {p.name} products
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* The panels are buttons (they drive selection), so the real navigation lives here — one
          keyboard-reachable link per partner rather than a link nested inside a button. */}
      <div className="relative z-10 border-t border-bone/10 px-6 py-8 text-center">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {partners.map((p) => (
            <li key={p.id}>
              <Link
                to="/brands"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-signal transition-colors hover:text-bone"
              >
                View {p.name} products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <p data-a="rise" data-reveal className="mt-6 text-sm text-bone/50">
          Regional offices: Kalaburagi, Nagpur (planned), Delhi (planned)
        </p>
      </div>
    </section>
  );
}
