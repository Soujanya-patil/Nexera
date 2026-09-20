import { useState } from "react";
import PageHeader from "../components/PageHeader";

const datasheets = [
  "TCL BlueArk W10 — Datasheet",
  "Hithium 261kWh Liquid-Cooled C&I Cabinet — Datasheet",
  "Hithium 6.25MWh Utility Block — Brochure",
];

const faqs = [
  { q: "What's the difference between C&I and utility-scale BESS?", a: "C&I systems are sized for factories, warehouses, and commercial sites — typically cabinet or small containerized units. Utility-scale systems are multi-megawatt-hour DC blocks built for grid-connected projects." },
  { q: "Do I need existing BESS experience to become a distributor?", a: "No. Most of our partners come from a solar EPC background with strong PV experience but limited battery storage exposure — that's exactly the gap our training and design support exist to close." },
  { q: "How long does commissioning support take?", a: "It varies by project scale and segment, but our engineers work your first sizing and commissioning alongside you as part of onboarding, not as a one-off session." },
];

const articles = [
  "What Is C&I Battery Storage and Why Bangalore Businesses Are Adopting It",
  "TCL BlueArk W10 vs X5: Which Fits Your Project?",
  "How Battery Storage Cuts Demand Charges for Indian Factories",
  "Liquid-Cooled vs Air-Cooled BESS: What EPCs Should Know",
];

export default function Resources() {
  return (
    <div>
      <PageHeader
        eyebrow="Resources"
        title="Datasheets, answers, and the latest from Nexera"
      />

      <section className="bg-paper border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Datasheets & Brochures
          </h2>
          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {datasheets.map((d) => (
              <GatedDownload key={d} title={d} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ice border-b border-line">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-serif text-2xl font-semibold text-ink">FAQs</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-serif text-2xl font-semibold text-ink">News & Insights</h2>
          <ul className="mt-6 space-y-4">
            {articles.map((a) => (
              <li key={a} className="text-graphite border-b border-line pb-4 last:border-0">
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function GatedDownload({ title }) {
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (email) setUnlocked(true);
  }

  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <p className="font-medium text-ink text-sm">{title}</p>
      {unlocked ? (
        <p className="mt-3 text-sm text-signal">Download link sent to {email}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            type="email"
            required
            placeholder="Work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-steel/40"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-ink px-3 py-2 text-xs font-medium text-white hover:bg-ink/90 transition-colors"
          >
            Get it
          </button>
        </form>
      )}
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-line bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-medium text-ink text-sm">{q}</span>
        <span className="text-graphite text-lg leading-none">{open ? "–" : "+"}</span>
      </button>
      {open && (
        <p className="px-5 pb-4 text-sm text-graphite leading-relaxed">{a}</p>
      )}
    </div>
  );
}
