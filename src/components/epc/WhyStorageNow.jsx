import { useRef } from "react";
import { Link } from "react-router-dom";
import AnimatedText from "../ui/AnimatedText";
import { HOME_STATS } from "../StatBar";
import { useScrollReveal } from "../../lib/scrollReveal";

// The two figures the site already cites, with their public sources (the Home stat bar's own links):
// CEA, National Electricity Plan 2022–32 (400+ GWh of storage by 2031–32); Ministry of Power, PIB, June 2025
// (VGF for 30 GWh of standalone BESS).
const [CEA, PIB] = HOME_STATS;
const LINK = "font-semibold text-accent underline underline-offset-4 hover:text-link focus-visible:text-link focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * WHY STORAGE, WHY NOW — the market case in about 120 words, using only figures the site already cites
 * (each linked to its source) and a link to the Karnataka ToD guide. No forecasts of our own.
 */
export default function WhyStorageNow() {
  const root = useRef(null);
  const reveal = useScrollReveal(root);
  return (
    <section ref={root} data-sr-state={reveal} aria-labelledby="why-now-title" className="bg-white py-section">
      <div className="container-site">
        <p className="eyebrow text-muted">The market</p>
        <AnimatedText id="why-now-title" className="mt-3 max-w-2xl text-h2 font-semibold text-ink">
          Why Storage, Why Now
        </AnimatedText>
        <div className="mt-heading max-w-measure space-y-4 text-body text-copy">
          <p data-sr>
            India needs more than 400 GWh of energy storage by 2031–32, by the{" "}
            <a href={CEA.source.href} target="_blank" rel="noopener noreferrer" className={LINK}>
              Central Electricity Authority&rsquo;s estimate
            </a>
            , and in 2025 the{" "}
            <a href={PIB.source.href} target="_blank" rel="noopener noreferrer" className={LINK}>
              Ministry of Power
            </a>{" "}
            backed 30 GWh of new standalone battery storage through its Viability Gap Funding scheme.
          </p>
          <p data-sr>
            Demand reaches every segment you can sell into: homes storing their rooftop solar, factories and commercial
            sites cutting peak demand and riding through power cuts, and solar and wind plants adding storage. In
            Karnataka, time-of-day tariffs add another reason; see{" "}
            <Link to="/blog/tod-tariff-karnataka-battery-storage" className={LINK}>
              how battery storage saves money under ToD tariffs
            </Link>
            .
          </p>
          <p data-sr>For EPCs, solar distributors and electrical contractors, BESS fits the projects you already deliver.</p>
        </div>
      </div>
    </section>
  );
}
