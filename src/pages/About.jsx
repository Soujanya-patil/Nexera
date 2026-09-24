import PageHeader from "../components/PageHeader";

const leaders = [
  { name: "Ankit Jain", role: "Co-founder. 15+ years in solar EPC, leads strategy, brand partnerships, and fundraising." },
  { name: "Narendra", role: "Co-founder. Leads project execution and installation." },
  { name: "Raviraj", role: "Co-founder." },
  { name: "Patil Sir", role: "Co-founder." },
];

const why = [
  "Authorized TCL, Hithium and CLOU partner",
  "India-based design and commissioning support",
  "Hands-on technician training center in Kalaburagi",
  "Built by EPCs who understand the site-level problem",
];

export default function About() {
  return (
    <div>
      <PageHeader
        eyebrow="About Us"
        title="Built by an EPC, for EPCs"
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-sans text-2xl font-semibold text-ink">Our Story</h2>
          <p className="mt-4 text-graphite leading-relaxed">
            Nexera Powertech was founded to solve a problem we lived ourselves as a
            solar EPC: getting reliable battery storage into Indian projects, backed
            by service that actually shows up. We're an authorized TCL, Hithium and CLOU
            partner, built to give Indian EPCs a trusted route into the BESS market.
          </p>
        </div>
      </section>

      <section className="bg-ice border-y border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-sans text-2xl font-semibold text-ink">Leadership Team</h2>
          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {leaders.map((l) => (
              <div key={l.name}>
                <p className="font-medium text-ink">{l.name}</p>
                <p className="mt-1 text-sm text-graphite leading-relaxed">{l.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-sans text-2xl font-semibold text-ink">Why Nexera</h2>
          <ul className="mt-6 space-y-3">
            {why.map((w) => (
              <li key={w} className="flex gap-3 text-graphite">
                <span className="text-forest mt-0.5">✓</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
