import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { applicationLabel, getProduct, productLabel } from "../data/products";
import { topicLabels } from "../data/solutionTopics";
import { CONTACT_EMAIL, CONTACT_PHONE, MIN_FILL_MS, fieldError, sendEnquiry, telHref } from "../lib/enquiry";

// The customer enquiry types as the enquiry API's interest values.
const INTEREST_OF = { residential: "home", ci: "ci", utility: "utility" };

const paths = [
  { id: "general", label: "I'm a customer looking for a BESS system" },
  { id: "oem", label: "Brand / OEM inquiry" },
];

// Customer enquiry types. Arriving from a Solutions page — /contact?intent=residential|ci|utility —
// pre-selects the type, so the submission says where the enquiry came from.
const ENQUIRY_TYPES = [
  { id: "residential", label: "Residential" },
  { id: "ci", label: "Commercial & Industrial" },
  { id: "utility", label: "Utility-Scale" },
];
// ?brand=<id>: a partner the visitor asked about that has no catalogue product to link (Midea's
// residential range). It is carried in the submission and implies its segment.
const BRANDS = { midea: { name: "Midea", type: "residential" } };

export default function Contact() {
  const [path, setPath] = useState("general");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [errors, setErrors] = useState({});
  const started = useRef(0);
  // Arriving from the catalogue: /contact?product=<id> (and/or &intent=quote) pre-fills the
  // customer form with the system and its application, so the enquiry is routed with context.
  const [params] = useSearchParams();
  const product = getProduct(params.get("product"));
  const intent = params.get("intent");
  const quote = intent === "quote";
  const brand = BRANDS[params.get("brand")] ?? null;
  const type = ENQUIRY_TYPES.find((t) => t.id === (ENQUIRY_TYPES.some((x) => x.id === intent) ? intent : brand?.type)) ?? null;
  const name = product ? productLabel(product) : null;
  // ?topics=<slugs>: the items chosen in a Solutions page's final CTA.
  const topics = topicLabels(intent, params.get("topics"));
  const starter = quote
    ? `I'd like a quote${name ? ` for the ${name}` : ""}.`
    : name
      ? `I'd like to know more about the ${name}.`
      : topics.length
        ? `I'd like help with: ${topics.join(", ")}`
        : undefined;

  // One check per field, the same rules as the API (lib/enquiry); email stays required on this page.
  const check = (name, value) => {
    if (name === "enquiry_type") return value ? "" : "Please choose an enquiry type.";
    if (["company", "brand"].includes(name) && path === "oem" && !value.trim()) return "Please fill this in.";
    return fieldError(name, value, { emailRequired: true });
  };
  const onBlur = (e) => {
    const { name, value } = e.target;
    if (!name || name === "website") return;
    setErrors((er) => ({ ...er, [name]: check(name, value) || undefined }));
  };

  // Sends through the shared helper (lib/enquiry -> /api/contact.php), with everything the form knows.
  async function handleSubmit(e) {
    e.preventDefault();
    started.current ||= Date.now();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form));
    const names = path === "general" ? ["name", "email", "mobile", "enquiry_type", "message"] : ["name", "email", "mobile", "company", "brand"];
    const er = {};
    for (const n of names) {
      const m = check(n, f[n] ?? "");
      if (m) er[n] = m;
    }
    setErrors(er);
    const first = names.find((n) => er[n]);
    if (first) {
      form.elements[first]?.focus();
      return;
    }
    setStatus("sending");
    const wait = MIN_FILL_MS - (Date.now() - started.current);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    const details =
      path === "general"
        ? {
            enquiry: quote ? "Quote request" : product ? "Product enquiry" : "General enquiry",
            product: f.product ?? "",
            application: f.application ?? "",
            brand: f.brand ?? "",
            topics: topics.join(", "),
            site: f.site ?? "",
            purpose: f.purpose ?? "",
            scale: f.scale ?? "",
          }
        : { enquiry: "Brand / OEM inquiry", brand: f.brand ?? "" };
    const res = await sendEnquiry({
      name: f.name,
      mobile: f.mobile,
      email: f.email,
      company: f.company ?? "",
      interest: path === "general" ? INTEREST_OF[f.enquiry_type] : "oem",
      message: (path === "general" ? f.message : f.proposal) ?? "",
      website: f.website ?? "",
      startedAt: started.current,
      details,
    });
    setStatus(res.ok ? "done" : "error");
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
                onClick={() => { setPath(p.id); setStatus("idle"); setErrors({}); started.current = 0; }}
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

          {status === "done" ? (
            <div role="status" className="mt-8 rounded-lg border border-signal/30 bg-ice p-6">
              <p className="font-medium text-ink">Message received.</p>
              <p className="mt-1 text-sm text-graphite">
                We'll be in touch shortly at the email address you provided.
              </p>
            </div>
          ) : (
            <form key={path} onSubmit={handleSubmit} onFocusCapture={() => (started.current ||= Date.now())} onBlur={onBlur} noValidate className="relative mt-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Name" name="name" required error={errors.name} />
                <Field label="Email" name="email" type="email" required error={errors.email} />
              </div>
              <Field label="Mobile number" name="mobile" type="tel" required error={errors.mobile} />

              {path === "general" && (
                <>
                  {(product || quote || type || brand) && (
                    <p className="rounded-lg bg-ice px-4 py-3 text-sm text-ink">
                      <span className="font-semibold">
                        {quote ? "Quote request" : product ? "Product enquiry" : `${type.label} enquiry`}
                      </span>
                      {name && <> &middot; {name}</>}
                      {brand && <> &middot; {brand.name}</>}
                    </p>
                  )}
                  <div>
                    <label htmlFor="enquiry_type" className="block text-sm font-medium text-ink mb-1.5">
                      Enquiry type
                    </label>
                    <select
                      id="enquiry_type"
                      name="enquiry_type"
                      defaultValue={type?.id ?? ""}
                      required
                      aria-invalid={!!errors.enquiry_type || undefined}
                      aria-describedby="enquiry_type-err"
                      className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-steel/40 aria-[invalid=true]:border-[#b3261e]"
                    >
                      <option value="">Select…</option>
                      {ENQUIRY_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <FieldError name="enquiry_type" error={errors.enquiry_type} />
                  </div>
                  {brand && <input type="hidden" name="brand" value={brand.name} />}
                  {product && (
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Product" name="product" defaultValue={name} />
                      <Field label="Application" name="application" defaultValue={product.applications.map(applicationLabel).join(", ")} />
                    </div>
                  )}
                  <p className="text-xs text-graphite">
                    Sharing a few site details lets our team plan a visit if one's needed.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-5">
                    <Field label="Site" name="site" />
                    <Field label="Purpose" name="purpose" />
                    <Field label="Scale" name="scale" />
                  </div>
                  <Field label="Message" name="message" as="textarea" defaultValue={starter} />
                </>
              )}

              {path === "oem" && (
                <>
                  <p className="text-xs text-graphite">
                    For other manufacturers and prospective brand partners — tell us who you
                    are and what you're proposing.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Company name" name="company" required error={errors.company} />
                    <Field label="Brand / product you represent" name="brand" required error={errors.brand} />
                  </div>
                  <Field label="Partnership proposal" name="proposal" as="textarea" />
                </>
              )}

              {/* Honeypot: hidden from people; bots fill it. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              {status === "error" && (
                <p role="alert" className="rounded-lg border border-[#b3261e]/30 bg-[#b3261e]/[0.06] px-4 py-3 text-sm text-ink">
                  Something went wrong. Please try again, or call/email us.
                  {CONTACT_PHONE && (
                    <>
                      {" "}
                      <a href={telHref(CONTACT_PHONE)} className="font-semibold text-forest underline">
                        {CONTACT_PHONE}
                      </a>
                    </>
                  )}
                  {CONTACT_EMAIL && (
                    <>
                      {" "}
                      <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-forest underline">
                        {CONTACT_EMAIL}
                      </a>
                    </>
                  )}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-forest hover:bg-signal/90 transition-colors disabled:cursor-wait disabled:opacity-80"
              >
                {status === "sending" && <span aria-hidden="true" className="contact-spin h-4 w-4 rounded-full border-2 border-forest/30 border-t-forest" />}
                {status === "sending" ? "Sending…" : "Send"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

/** A field's error under it (announced politely; empty when there is none). */
function FieldError({ name, error }) {
  return (
    <p id={`${name}-err`} aria-live="polite" className="mt-1.5 text-sm text-[#b3261e]">
      {error || ""}
    </p>
  );
}

function Field({ label, name, required, type = "text", as, defaultValue, error }) {
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
        defaultValue={defaultValue}
        rows={as === "textarea" ? 4 : undefined}
        aria-invalid={!!error || undefined}
        aria-describedby={`${name}-err`}
        className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-steel/40 aria-[invalid=true]:border-[#b3261e]"
      />
      <FieldError name={name} error={error} />
    </div>
  );
}
