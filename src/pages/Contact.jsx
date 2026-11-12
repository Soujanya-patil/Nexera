import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useScrollReveal } from "../lib/scrollReveal";
import { getProduct, productLabel } from "../data/products";
import { topicLabels } from "../data/solutionTopics";
import { CONTACT_EMAIL, CONTACT_PHONE, FORM_INTERESTS, LIMITS, MIN_FILL_MS, afterPress, fieldError, sendEnquiry, telHref } from "../lib/enquiry";
import { ADDRESS, BRANCH_ADDRESS } from "../data/business";
import { track, trackLead } from "../lib/analytics";
import { datasheetFor } from "../data/datasheets";

// A segment (a Solutions page's ?intent=, a datasheet's or a product's application) as the form's option.
const INTEREST_OF = { residential: "home", ci: "ci", utility: "utility" };

// The fields, in the form's order (the director's Final Copy; the homepage form has the same set).
const FIELDS = ["name", "mobile", "email", "company", "city", "interest", "requirement", "message"];

/** Starts a file download (same origin; the browser keeps the visitor on the page). */
function download(file) {
  const a = document.createElement("a");
  a.href = file;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [errors, setErrors] = useState({});
  const started = useRef(0);
  // Arriving with context: /contact?product=<id> (and/or &intent=quote) from the catalogue,
  // ?intent=residential|ci|utility (&topics=…) from a Solutions page, ?datasheet=<id> (the datasheet
  // gate) — each pre-selects the interest and/or pre-fills the message, so the enquiry is routed with it.
  const [params] = useSearchParams();
  const product = getProduct(params.get("product"));
  const intent = params.get("intent");
  const quote = intent === "quote";
  const name = product ? productLabel(product) : null;
  // The datasheet gate: /contact?datasheet=<id> (a system with a datasheet PDF, data/datasheets.js) asks
  // for the visitor's details first; the PDF downloads only once the form is sent. Unknown id: the plain form.
  const sheet = datasheetFor(params.get("datasheet"));
  // ?topics=<slugs>: the items chosen in a Solutions page's final CTA.
  const topics = topicLabels(intent, params.get("topics"));
  const preInterest =
    INTEREST_OF[sheet?.type] ?? INTEREST_OF[intent] ?? (product ? INTEREST_OF[product.applications.includes("ci") ? "ci" : product.applications[0]] : undefined) ?? "";
  const starter = sheet
    ? `Datasheet request: ${sheet.name}`
    : quote
    ? `I'd like a quote${name ? ` for the ${name}` : ""}.`
    : name
      ? `I'd like to know more about the ${name}.`
      : topics.length
        ? `I'd like help with: ${topics.join(", ")}`
        : undefined;

  // The page is pre-rendered without its query, so on a direct load the browser keeps the plain form's
  // empty choices: once the page is live, the pre-selection and the pre-filled message go into any field
  // that is still empty (never over what the visitor has typed). A client-side visit renders them at once.
  const formRef = useRef(null);
  useEffect(() => {
    const f = formRef.current;
    if (!f) return;
    if (preInterest && !f.elements.interest.value) f.elements.interest.value = preInterest;
    if (starter && !f.elements.message.value) f.elements.message.value = starter;
  }, [preInterest, starter]);

  // One check per field, the same rules (and required fields: name, mobile, interest) as the API (lib/enquiry).
  const check = (k, value) => fieldError(k, value);
  const onBlur = (e) => {
    const { name: k, value } = e.target;
    if (!FIELDS.includes(k)) return;
    afterPress(() => setErrors((er) => ({ ...er, [k]: check(k, value) || undefined })));
  };
  // Once a field shows an error, it is checked again as the visitor fixes it.
  const onInput = (e) => {
    const { name: k, value } = e.target;
    if (k && errors[k]) setErrors((er) => ({ ...er, [k]: check(k, value) || undefined }));
  };

  // Sends through the shared helper (lib/enquiry -> /api/contact.php), with everything the form knows.
  async function handleSubmit(e) {
    e.preventDefault();
    started.current ||= Date.now();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form));
    const er = {};
    for (const k of FIELDS) {
      const m = check(k, f[k] ?? "");
      if (m) er[k] = m;
    }
    setErrors(er);
    const first = FIELDS.find((k) => er[k]);
    if (first) {
      form.elements[first]?.focus();
      return;
    }
    setStatus("sending");
    const wait = MIN_FILL_MS - (Date.now() - started.current);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    const res = await sendEnquiry({
      name: f.name,
      mobile: f.mobile,
      email: f.email ?? "",
      company: f.company ?? "",
      city: f.city ?? "",
      requirement: f.requirement ?? "",
      interest: f.interest,
      message: f.message ?? "",
      website: f.website ?? "",
      startedAt: started.current,
      details: {
        enquiry: sheet ? "Datasheet request" : quote ? "Quote request" : product ? "Product enquiry" : "General enquiry",
        product: sheet ? sheet.name : (name ?? ""),
        topics: topics.join(", "),
      },
    });
    // The API's own field errors (should it ever disagree with the page) go under their fields.
    if (res.fields) {
      setErrors(res.fields);
      setStatus("idle");
      const bad = FIELDS.find((k) => res.fields[k]);
      if (bad) form.elements[bad]?.focus();
      else setStatus("error");
      return;
    }
    // Only a successful send releases the datasheet: the lead (form_source datasheet), the download event
    // (both only with consent, lib/analytics), then the PDF itself. A failed send downloads nothing.
    const gated = res.ok && sheet;
    if (gated) {
      trackLead("datasheet", { item_name: sheet.name, interest: f.interest });
      track("datasheet_download", { item_name: sheet.name });
    } else if (res.ok) trackLead("full", { interest: f.interest });
    setStatus(res.ok ? "done" : "error");
    if (gated) download(sheet.file);
  }

  // The site's scroll reveal: the address, the distributor link and the form fade up in turn.
  const root = useRef(null);
  const reveal = useScrollReveal(root);
  return (
    <div ref={root} data-sr-state={reveal}>
      <PageHeader
        eyebrow="Contact Us"
        crumb="Contact"
        title="Talk to Nexera"
        subtitle="Tell us what you need — we'll route it to the right team."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-2xl px-6 py-section">
          {/* Where to find and call us (data/business: as on the Google Business Profile). */}
          <address data-sr className="mb-8 rounded-control border border-line bg-ice px-5 py-4 text-small not-italic text-copy">
            <span className="block font-medium text-ink">Head office: {ADDRESS}</span>
            <span className="mt-1 block">Branch office: {BRANCH_ADDRESS}</span>
            {CONTACT_PHONE && (
              <span className="mt-1 block">
                Call{" "}
                <a href={telHref(CONTACT_PHONE)} className="link-inline font-semibold text-accent">
                  {CONTACT_PHONE}
                </a>
              </span>
            )}
            {CONTACT_EMAIL && (
              <span className="mt-1 block">
                Email{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="link-inline font-semibold text-accent">
                  {CONTACT_EMAIL}
                </a>
              </span>
            )}
            <span className="mt-1 block">
              Visiting us?{" "}
              <Link to="/locations/bengaluru" className="link-inline font-semibold text-accent">
                See our Bengaluru office<span aria-hidden="true"> →</span>
              </Link>
            </span>
          </address>
          {/* Distributor intent routes straight to the partner programme's own page and form. */}
          <div data-sr className="flex flex-wrap gap-2">
            <Link
              to="/become-a-partner"
              className="group inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ice px-4 py-2 text-small font-medium text-copy transition-colors duration-fast hover:text-ink focus-visible:text-ink"
            >
              I want to become a distributor
              <svg
                className="h-3.5 w-3.5 transition-transform duration-fast group-hover:translate-x-0.5 group-focus-within:translate-x-0.5 group-focus-visible:translate-x-0.5"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M3 8h9M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div data-sr>
          {status === "done" ? (
            <div role="status" className="mt-8 rounded-card border border-accent/30 bg-ice p-6">
              {sheet ? (
                <>
                  <p className="font-medium text-ink">Thank you. Your datasheet is downloading.</p>
                  <p className="mt-1 text-small text-copy">
                    <a href={sheet.file} download="" className="link-inline font-semibold text-accent">
                      Download again
                      <span className="sr-only">: {sheet.name} datasheet (PDF)</span>
                    </a>
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-ink">Message received.</p>
                  <p className="mt-1 text-small text-copy">We&rsquo;ll be in touch shortly.</p>
                </>
              )}
            </div>
          ) : (
            <form ref={formRef} method="post" onSubmit={handleSubmit} onFocusCapture={() => (started.current ||= Date.now())} onBlur={onBlur} onInput={onInput} noValidate className="relative mt-8 space-y-5">
              {/* First in the form: without JavaScript it can't be sent. */}
              <noscript><p className="app-fallback-note">Please enable JavaScript to send this form{CONTACT_PHONE ? `, or call ${CONTACT_PHONE}` : ""}.</p></noscript>
              {sheet && (
                <p className="rounded-control bg-ice px-4 py-3 text-small text-ink">
                  Fill in your details and your {sheet.short} datasheet will download straight away.
                </p>
              )}
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Name" name="name" required autoComplete="name" error={errors.name} />
                <Field label="Mobile number" name="mobile" type="tel" inputMode="tel" required autoComplete="tel" error={errors.mobile} />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
                <Field label="Company / organisation" name="company" autoComplete="organization" error={errors.company} />
              </div>
              <Field label="City" name="city" autoComplete="address-level2" error={errors.city} />
              <div>
                <label htmlFor="interest" className="block text-small font-medium text-ink mb-1.5">
                  I am interested in<Required />
                </label>
                <select
                  id="interest"
                  name="interest"
                  defaultValue={preInterest}
                  required
                  aria-invalid={!!errors.interest || undefined}
                  aria-describedby="interest-err"
                  className="min-h-11 w-full rounded-control border border-line bg-white px-3 py-2.5 text-body text-ink focus:outline-none focus:ring-2 focus:ring-link/40 aria-[invalid=true]:border-[#b3261e]"
                >
                  <option value="">Select…</option>
                  {FORM_INTERESTS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <FieldError name="interest" error={errors.interest} />
              </div>
              <Field label="Project size (kWh or MWh)" name="requirement" error={errors.requirement} />
              <Field label="Message" name="message" as="textarea" defaultValue={starter} error={errors.message} />

              {/* Honeypot: off-screen, hidden from screen readers and out of the tab order; bots fill it. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              {status === "error" && (
                <p role="alert" className="rounded-control border border-[#b3261e]/30 bg-[#b3261e]/[0.06] px-4 py-3 text-small text-ink">
                  Something went wrong. Please try again, or call/email us.
                  {CONTACT_PHONE && (
                    <>
                      {" "}
                      <a href={telHref(CONTACT_PHONE)} className="font-semibold text-accent underline">
                        {CONTACT_PHONE}
                      </a>
                    </>
                  )}
                  {CONTACT_EMAIL && (
                    <>
                      {" "}
                      <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent underline">
                        {CONTACT_EMAIL}
                      </a>
                    </>
                  )}
                </p>
              )}

              {/* Under the fields: the required legend and how the details are used. */}
              <div className="space-y-1 text-micro text-copy">
                <p>* required</p>
                <p>We use your details only to respond to your enquiry. See our Privacy Policy.</p>
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-motion inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 py-3 text-button font-semibold text-on-accent hover:bg-accent-hover focus-visible:bg-accent-hover disabled:cursor-wait disabled:opacity-80"
              >
                {status === "sending" && <span aria-hidden="true" className="contact-spin h-4 w-4 rounded-full border-2 border-on-accent/30 border-t-on-accent" />}
                {status === "sending" ? "Sending…" : "Send enquiry"}
              </button>
            </form>
          )}
          </div>
        </div>
      </section>
    </div>
  );
}

/** The required mark after a label (the form's "* required" legend explains it; `required` says it too). */
function Required() {
  return <span aria-hidden="true"> *</span>;
}

/** A field's error under it (announced politely; empty when there is none). */
function FieldError({ name, error }) {
  return (
    <p id={`${name}-err`} aria-live="polite" className="mt-1.5 text-small text-[#b3261e]">
      {error || ""}
    </p>
  );
}

function Field({ label, name, required, type = "text", as, defaultValue, error, autoComplete, inputMode }) {
  const Tag = as || "input";
  return (
    <div>
      <label htmlFor={name} className="block text-small font-medium text-ink mb-1.5">
        {label}
        {required ? <Required /> : <span className="font-normal text-copy"> (optional)</span>}
      </label>
      <Tag
        id={name}
        name={name}
        type={as ? undefined : type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required={required}
        maxLength={LIMITS[name]}
        defaultValue={defaultValue}
        rows={as === "textarea" ? 4 : undefined}
        aria-invalid={!!error || undefined}
        aria-describedby={`${name}-err`}
        className="min-h-11 w-full rounded-control border border-line bg-white px-3 py-2.5 text-body text-ink focus:outline-none focus:ring-2 focus:ring-link/40 aria-[invalid=true]:border-[#b3261e]"
      />
      <FieldError name={name} error={error} />
    </div>
  );
}
