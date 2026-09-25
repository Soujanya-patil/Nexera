import { useRef } from "react";
import MagneticButton from "../ui/MagneticButton";
import AnimatedText from "../ui/AnimatedText";
import { useScrollReveal } from "../../lib/scrollReveal";

/**
 * Closing band for the catalogue and product pages: help choosing, or go straight to a quote.
 * On entering the viewport the heading's words rise in, then the paragraph and buttons follow
 * (ScrollTrigger); one soft light drifts slowly behind. Both buttons get the restrained magnetic
 * pull, a 1.02 hover scale and the arrow nudge.
 */
export default function ChooseCta({ productId }) {
  const root = useRef(null);
  const reveal = useScrollReveal(root, { stagger: 0.1, y: 16, start: "top 85%" });
  const quote = `/contact?intent=quote${productId ? `&product=${productId}` : ""}`;
  return (
    <section ref={root} data-sr-state={reveal} className="relative overflow-hidden bg-deep text-white">
      <div
        aria-hidden="true"
        className="ambient-drift pointer-events-none absolute -inset-[10%]"
        style={{ background: "radial-gradient(45% 70% at 78% 105%, rgba(144,217,136,0.15), transparent 70%)" }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 md:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p data-sr className="text-xs font-medium uppercase tracking-[0.22em] text-ice/80">
            Talk to an engineer
          </p>
          <AnimatedText className="mt-4 text-2xl font-semibold leading-tight tracking-tight md:text-3xl">Need help choosing the right system?</AnimatedText>
          <p data-sr className="mt-4 max-w-xl leading-relaxed text-ice/80">
            Tell us about your site and load. NEXERA&rsquo;s team will recommend and size a system from our technology partners.
          </p>
        </div>
        <div data-sr className="flex shrink-0 flex-wrap items-center gap-4">
          <MagneticButton to="/contact" arrow className="hover:scale-[1.02]">
            Talk to NEXERA
          </MagneticButton>
          <MagneticButton to={quote} variant="outline" arrow className="hover:scale-[1.02]">
            Request a Quote
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
