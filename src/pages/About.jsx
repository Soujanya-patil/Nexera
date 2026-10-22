import { useRef } from "react";
import PageHeader from "../components/PageHeader";
import { useScrollReveal } from "../lib/scrollReveal";

const leaders = [
  { name: "Ankit Jain", role: "Co-founder. 15+ years in solar EPC, leads strategy, brand partnerships, and fundraising." },
  { name: "Narendra", role: "Co-founder. Leads project execution and installation." },
  { name: "Raviraj", role: "Co-founder." },
  { name: "Patil Sir", role: "Co-founder." },
];

const why = [
  "Authorized TCL, Hithium, CLOU and Midea partner",
  "India-based design and commissioning support",
  "Hands-on technician training center in Kalaburagi",
  "Built by EPCs who understand the site-level problem",
];

export default function About() {
  // The site's scroll reveal: headings rise from their masks, copy and cards fade up (lib/scrollReveal).
  const root = useRef(null);
  const reveal = useScrollReveal(root);
  return (
    <div ref={root} data-sr-state={reveal}>
      <PageHeader
        eyebrow="About Us"
        title="Built by an EPC, for EPCs"
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 data-sr="heading" className="text-h2 font-semibold text-ink">Our Story</h2>
          <p data-sr className="mt-heading max-w-measure text-body text-graphite">
            Nexera Powertech was founded to solve a problem we lived ourselves as a
            solar EPC: getting reliable battery storage into Indian projects, backed
            by service that actually shows up. We're an authorized TCL, Hithium, CLOU and Midea
            partner, built to give Indian EPCs a trusted route into the BESS market.
          </p>
        </div>
      </section>

      <section className="bg-ice border-y border-line">
        <div className="container-site py-16 md:py-20">
          <h2 data-sr="heading" className="text-h2 font-semibold text-ink">Leadership Team</h2>
          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {leaders.map((l) => (
              <div key={l.name} data-sr>
                <p className="text-h4 font-semibold text-ink">{l.name}</p>
                <p className="mt-1 text-small text-graphite">{l.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 data-sr="heading" className="text-h2 font-semibold text-ink">Why Nexera</h2>
          <ul className="mt-6 space-y-3">
            {why.map((w) => (
              <li key={w} data-sr className="flex gap-3 text-body text-graphite">
                <span className="text-forest">✓</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
