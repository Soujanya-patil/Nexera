import { useRef } from "react";
import { Link } from "react-router-dom";
import { useMotion, useScrollScene } from "../lib/motion";
import SceneImg from "./SceneImg";

/**
 * Scene 6 — ENQUIRE. The distributor pitch as the closing scene: a slow pull-back on a real Hithium
 * installation render, a low sunrise glow (the one warm "energy moment" on the page), and the two
 * routes to Nexera. Its lower edge is graded to the footer's colour so the page ends without a seam.
 */
export default function FinalCta() {
  const { mode } = useMotion();
  const cine = mode === "cinematic";
  const root = useRef(null);

  useScrollScene(
    root,
    ({ gsap, q }) => {
      const $ = (name) => q(`[data-a="${name}"]`);
      const trigger = { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: 0.5, invalidateOnRefresh: true };
      gsap.fromTo($("bg"), { scale: 1.14, yPercent: -4 }, { scale: 1, yPercent: 0, ease: "none", scrollTrigger: trigger });
      gsap.fromTo($("glow"), { autoAlpha: 0.15 }, { autoAlpha: 1, ease: "none", scrollTrigger: trigger });
      gsap.fromTo(
        $("rise"),
        { autoAlpha: 0, y: 48 },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: root.current, start: "top 60%", end: "top 15%", scrub: 0.5, invalidateOnRefresh: true },
        }
      );
    },
    cine
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-night text-bone">
      <div className="relative flex min-h-[92svh] items-center">
        {/* TODO(india-imagery): src/assets/scenes/cta-desert-{1280,1920}.webp is a desert render from Hithium's EU brochure; replace with an Indian installation, update `alt`. */}
        <SceneImg
          data-a="bg"
          name="cta-desert"
          alt="Row of Hithium battery storage cabinets on a concrete pad under a low sun"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ objectPosition: "50% 70%" }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/60 to-night/20" />
        <div
          data-a="glow"
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 62% 78%, color-mix(in srgb, var(--color-amber) 24%, transparent), transparent 70%)",
          }}
        />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/5 bg-gradient-to-b from-night to-transparent" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <h2
              data-a="rise"
              data-reveal
              className="font-serif text-[clamp(2.5rem,5.6vw,5.5rem)] font-semibold leading-[1.02] text-bone"
            >
              Run an EPC business?
            </h2>
            <p data-a="rise" data-reveal style={{ "--reveal-delay": "0.08s" }} className="mt-6 max-w-xl text-lg leading-relaxed text-bone/80">
              Add battery storage without building a supply chain from scratch.
              Authorized access, training, and after-sales support included.
            </p>
            <div data-a="rise" data-reveal style={{ "--reveal-delay": "0.16s" }} className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/become-a-partner"
                className="inline-flex items-center gap-2 rounded-md bg-signal px-6 py-3 text-sm font-medium text-ink shadow-[0_0_0_0_rgba(0,167,142,0.5)] transition-all duration-300 hover:bg-signal/90 hover:shadow-[0_0_28px_4px_rgba(0,167,142,0.45)]"
              >
                Apply to Become a Distributor
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h9M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-md border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:border-white/60 hover:bg-white/5"
              >
                Talk to Nexera
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
