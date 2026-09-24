import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const paths = [
  { id: "general", label: "I'm a customer looking for a BESS system" },
  { id: "oem", label: "Brand / OEM inquiry" },
];

export default function Contact() {
  const [path, setPath] = useState("general");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Contact Us"
        title="Talk to Nexera"
        subtitle="Tell us what you need — we'll route it to the right team."
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-2xl px-6 py-16">
          {/* Path selector — distributor intent routes straight to the real application page;
              the two form paths below are genuinely different audiences with different fields. */}
          <div className="flex flex-wrap gap-2">
            <Link
              to="/become-a-partner"
              className="group inline-flex items-center gap-1.5 rounded-full bg-ice px-4 py-2 text-sm font-medium text-graphite transition-colors hover:text-ink"
            >
              I want to become a distributor
              <svg
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M3 8h9M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            {paths.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { setPath(p.id); setSubmitted(false); }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  path === p.id
                    ? "bg-ink text-white"
                    : "bg-ice text-graphite hover:text-ink"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {submitted ? (
            <div className="mt-8 rounded-lg border border-signal/30 bg-ice p-6">
              <p className="font-medium text-ink">Message received.</p>
              <p className="mt-1 text-sm text-graphite">
                We'll be in touch shortly at the email address you provided.
              </p>
            </div>
          ) : (
            <form key={path} onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Name" name="name" required />
                <Field label="Email" name="email" type="email" required />
              </div>
              <Field label="Mobile number" name="mobile" />

              {path === "general" && (
                <>
                  <p className="text-xs text-graphite">
                    Sharing a few site details lets our team plan a visit if one's needed.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-5">
                    <Field label="Site" name="site" />
                    <Field label="Purpose" name="purpose" />
                    <Field label="Scale" name="scale" />
                  </div>
                  <Field label="Message" name="message" as="textarea" />
                </>
              )}

              {path === "oem" && (
                <>
                  <p className="text-xs text-graphite">
                    For other manufacturers and prospective brand partners — tell us who you
                    are and what you're proposing.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Company name" name="company" required />
                    <Field label="Brand / product you represent" name="brand" required />
                  </div>
                  <Field label="Partnership proposal" name="proposal" as="textarea" />
                </>
              )}

              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-signal px-6 py-3 text-sm font-semibold text-forest hover:bg-signal/90 transition-colors"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </section>
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
        rows={as === "textarea" ? 4 : undefined}
        className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-steel/40"
      />
    </div>
  );
}
