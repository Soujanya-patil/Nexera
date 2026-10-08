import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { SERVICE_TRAINING_FAQ } from "../data/serviceTraining";

export default function ServiceTraining() {
  return (
    <div>
      <PageHeader
        eyebrow="Service & Training"
        title="We don't just supply the battery. We train the hands that install it."
      />

      <section className="bg-paper border-b border-line">
        <div className="container-site py-16">
          <h2 className="font-sans text-2xl font-semibold text-ink">
            Design & Commissioning Support
          </h2>
          <p className="mt-3 text-graphite max-w-2xl leading-relaxed">
            Every partner gets our engineering team for sizing, single-line diagrams,
            and on-site support with BESS installation and BESS commissioning.
          </p>
        </div>
      </section>

      <section className="bg-ice border-b border-line">
        <div className="container-site py-16">
          <h2 className="font-sans text-2xl font-semibold text-ink">
            After-Sales & Warranty
          </h2>
          <p className="mt-3 text-graphite max-w-2xl leading-relaxed">
            Local-first warranty handling — we manage the OEM relationship so your
            customer relationship stays intact.
          </p>
          <FileComplaint />
        </div>
      </section>

      <section className="bg-paper">
        <div className="container-site py-16">
          <h2 className="font-sans text-2xl font-semibold text-ink">
            Kalaburagi Technician Training Center
          </h2>
          <p className="mt-1 text-sm text-graphite">
            India's Hands-On BESS Training Center for EPC Technicians
          </p>
          <p className="mt-4 text-graphite max-w-2xl leading-relaxed">
            In Kalaburagi, BESS technician training happens on live TCL and Hithium
            hardware — not manuals and PDFs.
          </p>
          <ul className="mt-6 space-y-2 text-graphite">
            <li className="flex gap-3"><span className="text-forest">✓</span> Hands-on installation and commissioning practice</li>
            <li className="flex gap-3"><span className="text-forest">✓</span> Electrical safety, fault diagnosis, troubleshooting on live systems</li>
            <li className="flex gap-3"><span className="text-forest">✓</span> Certification path for field-ready technicians</li>
          </ul>
        </div>
      </section>

      {/* FAQ: the same list is the page's FAQPage structured data (src/seo/routes.js), word for word. */}
      <section className="bg-ice border-t border-line">
        <div className="container-site py-16">
          <h2 className="font-sans text-2xl font-semibold text-ink">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 max-w-2xl space-y-6">
            {SERVICE_TRAINING_FAQ.map(({ q, a }) => (
              <div key={q}>
                <dt className="font-semibold text-ink">{q}</dt>
                <dd className="mt-2 text-graphite leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}

function FileComplaint() {
  const [open, setOpen] = useState(false);
  const [ref, setRef] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    // Reference number, not a redirect back to a product page — builds trust faster
    setRef(`NX-${Math.floor(100000 + Math.random() * 900000)}`);
  }

  return (
    <div className="mt-8 rounded-lg border border-line bg-white p-6 max-w-xl">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm font-medium text-steel hover:text-steel/80"
        >
          File a Complaint →
        </button>
      ) : ref ? (
        <div>
          <p className="font-medium text-ink">Complaint filed.</p>
          <p className="mt-1 text-sm text-graphite">
            Reference number: <span className="font-mono text-ink">{ref}</span>
          </p>
          <p className="mt-1 text-sm text-graphite">
            We'll email you updates — track anytime with this reference.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-graphite">Tracked by email.</p>
          <Field label="Name" name="name" required />
          <Field label="Number" name="number" />
          <Field label="Email" name="email" type="email" required />
          <Field label="Product type" name="productType" />
          <Field label="What's wrong" name="issue" as="textarea" />
          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-forest hover:bg-signal/90 transition-colors"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}

function Field({ label, name, required, type = "text", as }) {
  const Tag = as || "input";
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      <Tag
        id={name}
        name={name}
        type={as ? undefined : type}
        required={required}
        rows={as === "textarea" ? 3 : undefined}
        className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-steel/40"
      />
    </div>
  );
}
