import { useRef } from "react";
import MagneticButton from "../ui/MagneticButton";
import AnimatedText from "../ui/AnimatedText";
import { useScrollReveal } from "../../lib/scrollReveal";
import { STAGGER } from "../../lib/tokens";

/**
 * Closing band for the catalogue and product pages: help choosing, or go straight to a quote.
 * On entering the viewport the heading's words rise in, then the paragraph and buttons follow
 * (ScrollTrigger); one soft light drifts slowly behind. Both buttons get the restrained magnetic
 * pull, a 1.02 hover scale and the arrow nudge.
 */
export default function ChooseCta({ productId }) {
  const root = useRef(null);
  const reveal = useScrollReveal(root);
  const quote = `/contact?intent=quote${productId ? `&product=${productId}` : ""}`;
  return (
    <section ref={root} data-sr-state={reveal} className="relative overflow-hidden bg-deep-grid text-white">
      <div
        aria-hidden="true"
        className="ambient-drift pointer-events-none absolute -inset-[10%]"
        style={{ background: "radial-gradient(45% 70% at 78% 105%, color-mix(in_srgb,var(--accent)_15%,transparent), transparent 70%)" }}
      />
      <div className="relative flex container-site flex-col gap-8 py-16 md:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p data-sr className="eyebrow text-paper/80">
            Talk to an engineer
          </p>
          <AnimatedText className="mt-4 text-h2 font-semibold">Need help choosing the right system?</AnimatedText>
          <p data-sr className="mt-4 max-w-xl text-body text-paper/80">
            Tell us about your site and load. NEXERA&rsquo;s team will recommend and size a system from our technology partners.
          </p>
        </div>
        <div data-sr className="flex shrink-0 flex-wrap items-center gap-4">
          <MagneticButton to="/contact" arrow>
            Talk to NEXERA
          </MagneticButton>
          <MagneticButton to={quote} variant="outline" arrow>
            Request a Quote
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
