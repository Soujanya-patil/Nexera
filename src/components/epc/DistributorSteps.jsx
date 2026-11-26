import { useRef } from "react";
import AnimatedText from "../ui/AnimatedText";
import { ArrowLink } from "../solutions/Interactive";
import { DISTRIBUTOR_STEPS } from "../../data/becomePartner";
import { useScrollReveal } from "../../lib/scrollReveal";

/**
 * HOW TO BECOME A BESS DISTRIBUTOR IN 5 STEPS — How It Works' five stages, in short (about 50 words), as a
 * numbered list in the page's value-point style; the link goes to the full stages.
 */
export default function DistributorSteps() {
  const root = useRef(null);
  const reveal = useScrollReveal(root);
  return (
    <section ref={root} data-sr-state={reveal} aria-labelledby="steps-title" className="bg-white py-section">
      <div className="container-site">
        <p className="eyebrow text-muted">Getting started</p>
        <AnimatedText id="steps-title" className="mt-3 max-w-2xl text-h2 font-semibold text-ink">
          How to Become a BESS Distributor in 5 Steps
        </AnimatedText>
        <ol className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
          {DISTRIBUTOR_STEPS.map((s, i) => (
            <li key={s.title} data-sr className="relative pt-5">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-forest/15" />
              <span className="text-micro font-semibold tracking-[0.18em] text-muted">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-h4 font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-small text-copy">{s.copy}</p>
            </li>
          ))}
        </ol>
        <ArrowLink to="/how-it-works" className="mt-10">
          See the five stages in detail
        </ArrowLink>
      </div>
    </section>
  );
}
