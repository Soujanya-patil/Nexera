import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { ARTICLES, formatDate } from "../data/articles";

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

      {/* Guides: every article (data/articles.js), newest first. */}
      <section aria-labelledby="guides-title" className="bg-paper border-b border-line">
        <div className="container-site py-16">
          <h2 id="guides-title" className="font-sans text-2xl font-semibold text-ink">
            Guides
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...ARTICLES]
              .sort((x, y) => y.datePublished.localeCompare(x.datePublished))
              .map((a) => (
                <li key={a.slug}>
                  <article className="group/guide relative flex h-full flex-col rounded-2xl border border-line bg-paper p-6 transition-[border-color,box-shadow,translate] duration-300 ease-out hover:-translate-y-1 hover:border-forest/30 hover:shadow-[0_22px_44px_-28px_rgba(7,26,23,0.4)] motion-reduce:transition-none">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">{a.eyebrow}</p>
                    <h3 className="mt-3 text-lg font-semibold leading-snug text-ink">
                      <Link
                        to={`/resources/${a.slug}`}
                        className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-signal"
                      >
                        {a.h1}
                      </Link>
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-graphite">{a.description}</p>
                    <p className="mt-5 flex items-center justify-between gap-3 text-xs text-graphite">
                      <span>
                        <time dateTime={a.datePublished}>{formatDate(a.datePublished)}</time> · {a.readingTime} min read
                      </span>
                      <ArrowRight aria-hidden="true" className="h-4 w-4 text-forest transition-transform duration-300 group-hover/guide:translate-x-1" />
                    </p>
                  </article>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <section className="bg-paper border-b border-line">
        <div className="container-site py-16">
          <h2 className="font-sans text-2xl font-semibold text-ink">
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
          <h2 className="font-sans text-2xl font-semibold text-ink">FAQs</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-sans text-2xl font-semibold text-ink">News & Insights</h2>
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
        <p className="mt-3 text-sm text-forest">Download link sent to {email}</p>
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
