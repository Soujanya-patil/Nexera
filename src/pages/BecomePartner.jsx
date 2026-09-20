import { useState } from "react";
import PageHeader from "../components/PageHeader";

const reasons = [
  {
    title: "Authorized access, no vetting risk",
    copy: "Direct, authorized access to TCL and Hithium — no separate brand negotiation on your side.",
  },
  {
    title: "Trained on design, sizing, and commissioning",
    copy: "Not just sales — our engineers work your first sizing and commissioning with you.",
  },
  {
    title: "After-sales support included",
    copy: "So warranty issues don't become your problem. We manage the OEM relationship.",
  },
  {
    title: "Protected territory",
    copy: "Your region is formally mapped and protected once you're onboarded.",
  },
];

const journey = [
  { step: "01", title: "Application & Fit Assessment", copy: "Region, business, and segment reviewed before anything else." },
  { step: "02", title: "Brand & Segment Onboarding", copy: "Trained only on the product lines matching your market." },
  { step: "03", title: "Territory Mapping & Agreement", copy: "Your region formally protected." },
  { step: "04", title: "Design & Commissioning Support", copy: "Our engineers work your first sizing and commissioning with you." },
  { step: "05", title: "Ongoing Service & Growth", copy: "After-sales, warranty handling, and portal access." },
];

export default function BecomePartner() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Become a Partner"
        title="Add Battery Storage to Your EPC Business"
        subtitle="Run an EPC business? Add battery storage without building a supply chain from scratch."
      />

      {/* Why partner */}
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Why Partner With Nexera
          </h2>
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            {reasons.map((r) => (
              <div key={r.title} className="border-l-2 border-signal pl-5">
                <h3 className="font-medium text-ink">{r.title}</h3>
                <p className="mt-1.5 text-sm text-graphite leading-relaxed">{r.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey — a real sequence, numbering earns its place here */}
      <section className="bg-ice border-y border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            How It Works
          </h2>
          <div className="mt-8 grid md:grid-cols-5 gap-6">
            {journey.map((j) => (
              <div key={j.step}>
                <p className="font-serif text-2xl text-steel/40">{j.step}</p>
                <h3 className="mt-2 font-medium text-ink text-sm">{j.title}</h3>
                <p className="mt-1.5 text-xs text-graphite leading-relaxed">{j.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section className="bg-paper">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Apply to Become a Distributor
          </h2>
          {submitted ? (
            <div className="mt-6 rounded-lg border border-signal/30 bg-ice p-6">
              <p className="font-medium text-ink">Application received.</p>
              <p className="mt-1 text-sm text-graphite">
                Our team will review your details and reach out within a few business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Field label="Business name" name="business" required />
              <Field label="Region" name="region" required />
              <Field label="Current EPC experience" name="experience" as="textarea" />
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Segment of interest
                </label>
                <select
                  name="segment"
                  className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-steel/40"
                >
                  <option>Residential</option>
                  <option>Commercial & Industrial</option>
                  <option>Utility-Scale</option>
                </select>
              </div>
              <Field label="Expected volume" name="volume" />
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-signal px-6 py-3 text-sm font-medium text-white hover:bg-signal/90 transition-colors"
              >
                Submit Application
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, name, required, as }) {
  const Tag = as || "input";
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink mb-1.5">
        {label} {required && <span className="text-graphite font-normal">(required)</span>}
      </label>
      <Tag
        id={name}
        name={name}
        required={required}
        rows={as === "textarea" ? 3 : undefined}
        className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-steel/40"
      />
    </div>
  );
}
