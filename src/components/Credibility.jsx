import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useMotion, useScrollScene } from "../lib/motion";
import SceneImg from "./SceneImg";
import tclLogo from "../assets/partners/tcl-logo.png";
import hithiumLogo from "../assets/partners/hithium-logo.png";
import clouLogo from "../assets/partners/clou-logo.png";

/**
 * Scene 5 — TECHNOLOGY PARTNERS. NEXERA as solution provider, TCL and Hithium as the two
 * authorized partners, full-bleed and side by side, drifting in opposite directions as the scene
 * passes. Official logos (extracted from each partner's own brochure/product artwork — see the
 * source notes on each import below) sit alongside the existing names, never implying NEXERA
 * manufactures the partner product. CLOU gets a lighter-weight mention with its own logo, sized
 * down from TCL/Hithium's full treatment since there's no CLOU site photography to fill a full
 * column (matches the prior text-only CLOU direction in spirit, just upgraded with a real mark
 * now that one's available).
 *
 * No FEATHER here. FEATHER exists to dissolve the top edge of a scene that rises over a PINNED
 * previous scene's held tail (see lib/motion.js), and this section lost its `-mt-[100vh]` rise-over
 * when ProductShowcase was inserted above it — but kept the mask. With ProductShowcase sitting in
 * normal flow directly above, the mask had nothing to dissolve into except an identically coloured
 * background, and its 20vh ramp was taller than this section's `pt-14 md:pt-20` (80px), so it was
 * quietly rendering this section's own eyebrow and h2 at partial opacity at every desktop viewport.
 * Same defect that was clipping WhoWeAre's heading; found while auditing that one.
 */
export default function Credibility() {
  const { mode } = useMotion();
  const cine = mode === "cinematic";
  const root = useRef(null);

  useScrollScene(
    root,
    ({ gsap, q }) => {
      const $ = (name) => q(`[data-a="${name}"]`);
      const trigger = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true };
      gsap.fromTo($("bg-tcl"), { yPercent: -5, scale: 1.08 }, { yPercent: 5, scale: 1.08, ease: "none", scrollTrigger: trigger });
      gsap.fromTo($("bg-hithium"), { yPercent: 5, scale: 1.08 }, { yPercent: -5, scale: 1.08, ease: "none", scrollTrigger: trigger });
      gsap.fromTo(
        $("rise"),
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
      <div className="relative z-10 px-6 pt-14 text-center md:pt-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-bone/60">NEXERA — Solution Provider</p>
        <h2 className="mt-3 font-serif text-2xl font-semibold text-bone md:text-3xl">
          Technology Partners — TCL &middot; Hithium &middot; CLOU
        </h2>
      </div>

      <div className="relative mt-10 grid md:min-h-[82svh] md:grid-cols-2 md:grid-rows-1">
        <div className="relative min-h-[58svh] overflow-hidden">
          {/* TODO(india-imagery): partner HQ, may be intentional. src/assets/scenes/partner-tcl-{640,1000}.webp is TCL's tower in China; keep or replace, update `alt`. */}
          <SceneImg
            data-a="bg-tcl"
            name="partner-tcl"
            alt="TCL headquarters office tower"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            style={{ objectPosition: "50% 40%" }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-night/20" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-night/45" />
          <div className="relative z-10 flex h-full min-h-[58svh] flex-col justify-end px-6 pb-16 md:min-h-[82svh] md:px-12 md:pb-20">
            <div data-a="rise" data-reveal>
              <span className="rounded-full bg-signal/15 px-3 py-1 text-xs font-medium text-signal">Authorized Partner</span>
              <img src={tclLogo} alt="TCL" className="mt-5 h-8 w-auto" />
              <p className="mt-4 max-w-xs text-sm text-bone/75">Residential &amp; C&amp;I BESS, from TCL's global manufacturing.</p>
              <Link
                to="/brands"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-signal transition-colors hover:text-bone"
              >
                View TCL products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative min-h-[58svh] overflow-hidden">
          {/* TODO(india-imagery): partner HQ, may be intentional. src/assets/scenes/partner-hithium-{640,1000}.webp shows Chinese-character signage on Hithium's HQ; keep or replace, update `alt`. */}
          <SceneImg
            data-a="bg-hithium"
            name="partner-hithium"
            alt="Hithium headquarters building with a hexagonal facade"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            style={{ objectPosition: "50% 30%" }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-night/20" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-night/45" />
          <div className="relative z-10 flex h-full min-h-[58svh] flex-col justify-end px-6 pb-16 md:min-h-[82svh] md:px-12 md:pb-20">
            <div data-a="rise" data-reveal style={{ "--reveal-delay": "0.1s" }}>
              <span className="rounded-full bg-signal/15 px-3 py-1 text-xs font-medium text-signal">Authorized Partner</span>
              <img src={hithiumLogo} alt="Hithium" className="mt-5 h-8 w-auto" />
              <p className="mt-4 max-w-xs text-sm text-bone/75">Liquid-cooled C&amp;I and utility-scale BESS.</p>
              <Link
                to="/brands"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-signal transition-colors hover:text-bone"
              >
                View Hithium products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-bone/10 px-6 py-8 text-center">
        <div data-a="rise" data-reveal className="inline-flex flex-col items-center gap-2">
          <img src={clouLogo} alt="CLOU" className="h-6 w-auto opacity-90" />
          <p className="text-sm text-bone/70">+ select global technologies including CLOU for utility-scale</p>
          <Link to="/brands" className="text-xs font-medium text-signal transition-colors hover:text-bone">
            Learn more
          </Link>
        </div>
        <p data-a="rise" data-reveal className="mt-6 text-sm text-bone/50">
          Regional offices: Kalaburagi, Nagpur (planned), Delhi (planned)
        </p>
      </div>
    </section>
  );
}
