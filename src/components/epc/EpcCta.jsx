import { useRef } from "react";
import MagneticButton from "../ui/MagneticButton";
import AnimatedText from "../ui/AnimatedText";
import { useScrollReveal } from "../../lib/scrollReveal";
import { scrollToId } from "../../lib/scrollTo";

/**
 * Closing call to action. The heading's words rise in, then the copy and buttons follow
 * (ScrollTrigger); a soft light drifts slowly behind and three faint green lines run along the
 * bottom (the Home closing band's motif). "Become a Partner" glides to the enquiry form right below;
 * "Talk to NEXERA" opens Contact. Both buttons carry the restrained magnetic pull.
 */
export default function EpcCta() {
  const root = useRef(null);
  const reveal = useScrollReveal(root, { stagger: 0.1, y: 16, start: "top 85%" });
  return (
    <section ref={root} data-sr-state={reveal} aria-labelledby="epc-cta-title" className="relative overflow-hidden bg-deep text-white">
      <div
        aria-hidden="true"
        className="ambient-drift pointer-events-none absolute -inset-[10%]"
        style={{ background: "radial-gradient(45% 70% at 70% 110%, rgba(144,217,136,0.17), transparent 70%)" }}
      />
      <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 w-full" viewBox="0 0 1440 240" preserveAspectRatio="none" fill="none">
        <path d="M0 210 C 360 150, 720 250, 1440 120" stroke="rgba(144,217,136,0.3)" strokeWidth="1.2" />
        <path d="M0 230 C 420 170, 820 240, 1440 150" stroke="rgba(144,217,136,0.18)" strokeWidth="1" />
        <path d="M0 240 C 500 200, 900 230, 1440 185" stroke="rgba(144,217,136,0.1)" strokeWidth="1" />
      </svg>
      <div className="relative mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
        <p data-sr className="text-xs font-semibold uppercase tracking-[0.22em] text-signal">
          Partner with NEXERA
        </p>
        <AnimatedText id="epc-cta-title" className="mx-auto mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          Ready to Build Your Next Energy Storage Project?
        </AnimatedText>
        <p data-sr className="mx-auto mt-5 max-w-xl leading-relaxed text-ice/80">
          Talk to NEXERA about technology access, project requirements, and partnership opportunities.
        </p>
        <div data-sr className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton to="#apply" onClick={scrollToId("apply")} arrow className="uppercase tracking-[0.08em] hover:scale-[1.02]">
            Become a Partner
          </MagneticButton>
          <MagneticButton to="/contact" variant="outline" arrow className="uppercase tracking-[0.08em] hover:scale-[1.02]">
            Talk to NEXERA
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
