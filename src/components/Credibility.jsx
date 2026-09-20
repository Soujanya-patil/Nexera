import { useRef } from "react";
import { FEATHER, useMotion, useScrollScene } from "../lib/motion";
import SceneImg from "./SceneImg";

/**
 * Scene 5 — CONFIDENCE. The two authorized partners, full-bleed and side by side, drifting in
 * opposite directions as the scene passes. Names and the CLOU line are the approved partner
 * copy; CLOU stays a text mention only (no logo, no photo, no partner badge) until its agreement is signed.
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
    <section
      ref={root}
      className={`relative overflow-hidden bg-night text-bone ${cine ? "z-10 -mt-[100vh]" : ""}`}
      style={cine ? FEATHER : undefined}
    >
      <div className="relative grid md:min-h-[100svh] md:grid-cols-2 md:grid-rows-1">
        <div className="relative min-h-[62svh] overflow-hidden">
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
          <div className="relative z-10 flex h-full min-h-[62svh] flex-col justify-end px-6 pb-24 md:min-h-[100svh] md:px-12 md:pb-32">
            <div data-a="rise" data-reveal>
              <span className="rounded-full bg-signal/15 px-3 py-1 text-xs font-medium text-signal">Authorized Partner</span>
              <h2 className="mt-4 font-serif text-[clamp(2.25rem,4.6vw,4.5rem)] font-semibold leading-none text-bone">TCL BlueArk</h2>
            </div>
          </div>
        </div>

        <div className="relative min-h-[62svh] overflow-hidden">
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
          <div className="relative z-10 flex h-full min-h-[62svh] flex-col justify-end px-6 pb-24 md:min-h-[100svh] md:px-12 md:pb-32">
            <div data-a="rise" data-reveal style={{ "--reveal-delay": "0.1s" }}>
              <span className="rounded-full bg-signal/15 px-3 py-1 text-xs font-medium text-signal">Authorized Partner</span>
              <h2 className="mt-4 font-serif text-[clamp(2.25rem,4.6vw,4.5rem)] font-semibold leading-none text-bone">Hithium</h2>
            </div>
          </div>
        </div>

        <p className="pointer-events-none absolute inset-x-0 top-10 z-10 px-6 text-center text-sm text-bone/70 md:top-16">
          In partnership with
        </p>
        <div className="relative z-10 px-6 py-8 text-center md:absolute md:inset-x-0 md:bottom-0 md:pb-12 md:pt-0">
          <p data-a="rise" data-reveal className="text-sm text-bone/70">
            + select global technologies including CLOU for utility-scale
          </p>
          <p data-a="rise" data-reveal className="mt-2 text-sm text-bone/70">
            Regional offices: Kalaburagi, Nagpur (planned), Delhi (planned)
          </p>
        </div>
      </div>
    </section>
  );
}
