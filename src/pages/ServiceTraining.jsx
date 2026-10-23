import { useRef, useState } from "react";
import { Check, CircleHelp, DraftingCompass, GraduationCap, ShieldCheck } from "lucide-react";
import PageHeader from "../components/PageHeader";
import HomeCta from "../components/HomeCta";
import { useScrollReveal } from "../lib/scrollReveal";
import { SERVICE_TRAINING_FAQ } from "../data/serviceTraining";

/** The section's icon: the site's icon style (ink glyph in an ice circle, as in the feature grids). */
function SectionIcon({ icon: Icon }) {
  return (
    <span data-sr aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-ice text-ink">
      <Icon className="h-5 w-5" strokeWidth={1.7} />
    </span>
  );
}

export default function ServiceTraining() {
  // The site's scroll reveal: headings rise from their masks, copy and lists fade up (lib/scrollReveal).
  const root = useRef(null);
  const reveal = useScrollReveal(root);
  return (
    <div ref={root} data-sr-state={reveal}>
      <PageHeader
        eyebrow="Service & Training"
        title="We don't just supply the battery. We train the hands that install it."
      />

      <section className="bg-white border-b border-line">
        <div className="container-site py-section">
          <SectionIcon icon={DraftingCompass} />
          <h2 data-sr="heading" className="mt-5 text-h2 font-semibold text-ink">
            Design & Commissioning Support
          </h2>
          <p data-sr className="mt-heading max-w-measure text-body text-copy">
            Every partner gets our engineering team for sizing, single-line diagrams,
            and on-site support with BESS installation and BESS commissioning.
          </p>
        </div>
      </section>

      <section className="bg-paper border-b border-line">
        <div className="container-site py-section">
          <SectionIcon icon={ShieldCheck} />
          <h2 data-sr="heading" className="mt-5 text-h2 font-semibold text-ink">
            After-Sales & Warranty
          </h2>
          <p data-sr className="mt-heading max-w-measure text-body text-copy">
            Local-first warranty handling — we manage the OEM relationship so your
            customer relationship stays intact.
          </p>
          <FileComplaint />
        </div>
      </section>

      <section className="bg-white">
        <div className="container-site py-section">
          <SectionIcon icon={GraduationCap} />
          <h2 data-sr="heading" className="mt-5 text-h2 font-semibold text-ink">
            Kalaburagi Technician Training Center
          </h2>
          <p data-sr className="mt-2 text-small text-copy">
            India's Hands-On BESS Training Center for EPC Technicians
          </p>
          <p data-sr className="mt-heading max-w-measure text-body text-copy">
            In Kalaburagi, BESS technician training happens on live TCL and Hithium
            hardware — not manuals and PDFs.
          </p>
          <ul data-sr className="mt-6 space-y-2 text-body text-copy">
            <li className="flex gap-3"><Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-label" strokeWidth={2.4} /> Hands-on installation and commissioning practice</li>
            <li className="flex gap-3"><Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-label" strokeWidth={2.4} /> Electrical safety, fault diagnosis, troubleshooting on live systems</li>
            <li className="flex gap-3"><Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-label" strokeWidth={2.4} /> Certification path for field-ready technicians</li>
          </ul>
        </div>
      </section>

      {/* FAQ: the same list is the page's FAQPage structured data (src/seo/routes.js), word for word. */}
      <section className="bg-paper border-t border-line">
        <div className="container-site py-section">
          <SectionIcon icon={CircleHelp} />
          <h2 data-sr="heading" className="mt-5 text-h2 font-semibold text-ink">
            Frequently Asked Questions
          </h2>
          <dl className="mt-8 max-w-measure space-y-6">
            {SERVICE_TRAINING_FAQ.map(({ q, a }) => (
              <div key={q} data-sr>
                <dt className="text-h4 font-semibold text-ink">{q}</dt>
                <dd className="mt-2 text-copy text-body">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* The shared closing band (as on the partner pages, the blog and resources). */}
      <HomeCta contactTo="/#contact" />
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
    <div data-sr className="mt-8 rounded-card border border-line bg-white p-6 max-w-xl">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="link inline-flex min-h-11 items-center text-small font-semibold text-link"
        >
          File a Complaint →
        </button>
      ) : ref ? (
        <div>
          <p className="font-medium text-ink">Complaint filed.</p>
          <p className="mt-1 text-small text-copy">
            Reference number: <span className="font-mono text-ink">{ref}</span>
          </p>
          <p className="mt-1 text-small text-copy">
            We'll email you updates — track anytime with this reference.
          </p>
        </div>
      ) : (
        <form method="post" onSubmit={handleSubmit} className="space-y-4">
          <noscript><p className="app-fallback-note">This form needs JavaScript. Please enable it and reload the page.</p></noscript>
          <p className="text-small text-copy">Tracked by email.</p>
          <Field label="Name" name="name" required />
          <Field label="Number" name="number" />
          <Field label="Email" name="email" type="email" required />
          <Field label="Product type" name="productType" />
          <Field label="What's wrong" name="issue" as="textarea" />
          <button
            type="submit"
            className="btn-motion inline-flex min-h-11 items-center rounded-full bg-accent px-6 py-3 text-button font-semibold text-on-accent hover:bg-accent-hover focus-visible:bg-accent-hover"
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
      <label htmlFor={name} className="block text-small font-medium text-ink mb-1.5">
        {label}
      </label>
      <Tag
        id={name}
        name={name}
        type={as ? undefined : type}
        required={required}
        rows={as === "textarea" ? 3 : undefined}
        className="w-full rounded-control border border-line bg-white px-3 py-2.5 text-body text-ink focus:outline-none focus:ring-2 focus:ring-link/40"
      />
    </div>
  );
}
