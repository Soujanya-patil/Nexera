import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { jumpTo } from "../../lib/lenis";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_PHONE, MIN_FILL_MS, afterPress, fieldError, sendEnquiry, telHref } from "../../lib/enquiry";
import { COMPANY_TYPES, ENQUIRY_TYPES, PROJECT_APPLICATIONS } from "./content";

// This form's fields and the enquiry rule each follows (lib/enquiry), in the order they appear (the
// first error gets the focus). Phone is optional here; email, company and location are required.
const RULE_OF = { name: "name", company: "company", email: "email", phone: "mobile", location: "city", requirement: "requirement", message: "message" };
const FIELD_OF = Object.fromEntries(Object.entries(RULE_OF).map(([f, r]) => [r, f])); // the API's names -> this form's
const REQUIRED = { mobile: false, email: true, company: true, city: true };

// The first three stages of the partner process, as described on How It Works.
const NEXT = [
  { n: "01", title: "Application & fit assessment", copy: "Region, business, and segment reviewed before anything else." },
  { n: "02", title: "Brand & segment onboarding", copy: "Trained only on the product lines matching your market." },
  { n: "03", title: "Territory mapping & agreement", copy: "Your region formally protected." },
];

const input =
  "w-full rounded-md border border-line bg-white px-3 py-2.5 text-body text-ink transition-[border-color,box-shadow] focus:border-forest/40 focus:outline-none focus:ring-2 focus:ring-signal/50";

/**
 * Partner enquiry — the Become a Partner application form (this page's existing enquiry flow, which
 * the Contact page's "I want to become a distributor" path also leads to), now with the fields an
 * EPC enquiry needs. Enquiry type defaults to "EPC / Project Partnership"; ?type=distributor and
 * ?application=<residential|ci|utility> pre-fill it from a link. It is checked with the same rules as
 * every enquiry form and sent like them (lib/enquiry -> /api/contact.php, as a "partner" enquiry), then
 * shows the same confirmation as before.
 */
export default function PartnerForm() {
  const [params] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const [errors, setErrors] = useState({});
  const started = useRef(0);
  const type = params.get("type") === "distributor" ? ENQUIRY_TYPES[1] : ENQUIRY_TYPES[0];
  // Arriving on /become-a-partner#apply: the layout jumps here before fonts and images settle, and
  // text above can re-wrap after that — land on the form again once the page has settled.
  const { hash } = useLocation();
  useEffect(() => {
    if (hash !== "#apply") return;
    let live = true;
    const realign = () => {
      const el = live && document.getElementById("apply");
      if (el && Math.abs(el.getBoundingClientRect().top - 64) > 2) jumpTo(el.getBoundingClientRect().top + window.scrollY - 64);
    };
    const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true }));
    Promise.all([document.fonts?.ready, loaded]).then(() => requestAnimationFrame(realign));
    const late = setTimeout(realign, 1500);
    return () => {
      live = false;
      clearTimeout(late);
    };
  }, [hash]);
  const application = PROJECT_APPLICATIONS.some((a) => a.id === params.get("application")) ? params.get("application") : "";

  const check = (field, value) => (RULE_OF[field] ? fieldError(RULE_OF[field], value, { required: REQUIRED }) : "");
  const onBlur = (e) => {
    const { name, value } = e.target;
    if (RULE_OF[name]) afterPress(() => setErrors((er) => ({ ...er, [name]: check(name, value) || undefined })));
  };
  // Once a field shows an error, it is checked again as the visitor fixes it.
  const onInput = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors((er) => ({ ...er, [name]: check(name, value) || undefined }));
  };
  const focusFirst = (form, er) => {
    const first = Object.keys(RULE_OF).find((f) => er[f]);
    if (first) form.elements[first]?.focus();
    return !!first;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    started.current ||= Date.now();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form));
    const er = {};
    for (const field of Object.keys(RULE_OF)) {
      const m = check(field, f[field] ?? "");
      if (m) er[field] = m;
    }
    setErrors(er);
    if (focusFirst(form, er)) return;
    setStatus("sending");
    const wait = MIN_FILL_MS - (Date.now() - started.current);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    const res = await sendEnquiry({
      name: f.name,
      mobile: f.phone,
      email: f.email,
      company: f.company,
      city: f.location,
      requirement: f.requirement ?? "",
      interest: f.enquiryType === ENQUIRY_TYPES[1] ? "distributor" : "epc",
      message: f.message ?? "",
      website: f.website ?? "",
      startedAt: started.current,
      source: "partner",
      details: {
        enquiry: f.enquiryType ?? "",
        company_type: f.companyType ?? "",
        application: PROJECT_APPLICATIONS.find((a) => a.id === f.application)?.label ?? "",
      },
    });
    if (res.ok) return setSubmitted(true);
    if (res.fields) {
      // The API's own field errors (should it ever disagree with the page) go under their fields.
      const fromApi = {};
      for (const [k, m] of Object.entries(res.fields)) fromApi[FIELD_OF[k] ?? k] = m;
      setErrors(fromApi);
      setStatus(focusFirst(form, fromApi) ? "idle" : "error");
      return;
    }
    setStatus("error");
  }

  return (
    <section id="apply" aria-labelledby="apply-title" className="bg-paper py-20 focus:outline-none md:py-28">
      <div className="grid container-site gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <p className="eyebrow text-sage">Partner enquiry</p>
          <h2 id="apply-title" className="mt-3 text-h2 font-semibold text-ink">
            Become a Partner
          </h2>
          <p className="mt-4 max-w-md text-body text-graphite">
            Tell us about your company and the projects you&rsquo;re planning. Our team will review your details and get
            back to you.
          </p>
          <ol className="mt-10 space-y-6">
            {NEXT.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="text-micro font-semibold tracking-[0.18em] text-sage">{s.n}</span>
                <div>
                  <p className="font-medium text-ink">{s.title}</p>
                  <p className="mt-0.5 text-small text-graphite">{s.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-line bg-ice/60 p-6 sm:p-8">
          {submitted ? (
            <div role="status" className="journey-detail flex flex-col items-start py-6">
              <CheckCircle2 aria-hidden="true" className="h-8 w-8 text-forest" strokeWidth={1.75} />
              <p className="mt-4 text-lead font-semibold text-ink">Enquiry received.</p>
              <p className="mt-1.5 text-small text-graphite">Our team will review your details and get back to you.</p>
            </div>
          ) : (
            <form method="post" onSubmit={handleSubmit} onFocusCapture={() => (started.current ||= Date.now())} onBlur={onBlur} onInput={onInput} noValidate className="space-y-5">
              <noscript><p className="app-fallback-note">This form needs JavaScript. Please enable it and reload the page.</p></noscript>
              <Select label="Enquiry type" name="enquiryType" defaultValue={type} options={ENQUIRY_TYPES.map((t) => ({ value: t, label: t }))} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" name="name" autoComplete="name" required error={errors.name} />
                <Field label="Company" name="company" autoComplete="organization" required error={errors.company} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
                <Field label="Phone" name="phone" type="tel" autoComplete="tel" error={errors.phone} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Location" name="location" placeholder="City, state" required error={errors.location} />
                <Select label="Company type" name="companyType" options={COMPANY_TYPES.map((t) => ({ value: t, label: t }))} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  label="Project / application"
                  name="application"
                  defaultValue={application}
                  options={[{ value: "", label: "Select…" }, ...PROJECT_APPLICATIONS.map((a) => ({ value: a.id, label: a.label }))]}
                />
                <Field label="Expected requirement" name="requirement" placeholder="e.g. 500 kWh, 2 MW or 3 systems" error={errors.requirement} />
              </div>
              <Field label="Message" name="message" as="textarea" error={errors.message} />
              {/* Honeypot: hidden from people; bots fill it. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>
              {status === "error" && (
                <p role="alert" className="rounded-lg border border-[#b3261e]/30 bg-[#b3261e]/[0.06] px-4 py-3 text-small text-ink">
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
                aria-busy={status === "sending" || undefined}
                className="group btn-motion inline-flex min-h-11 items-center gap-2 rounded-full bg-signal px-6 py-3 text-button font-semibold uppercase tracking-[0.08em] text-forest hover:bg-[#a4e39d] focus-visible:bg-[#a4e39d] hover:shadow-[0_0_24px_2px_rgba(144,217,136,0.35)] focus-visible:shadow-[0_0_24px_2px_rgba(144,217,136,0.35)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                Submit Enquiry
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1 group-focus-visible:translate-x-1 group-focus-within:translate-x-1" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, required, type = "text", as, error, ...rest }) {
  const Tag = as || "input";
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-small font-medium text-ink">
        {label} {required && <span className="font-normal text-graphite">(required)</span>}
      </label>
      <Tag
        id={name}
        name={name}
        type={as ? undefined : type}
        required={required}
        rows={as === "textarea" ? 4 : undefined}
        aria-invalid={!!error || undefined}
        aria-describedby={`${name}-err`}
        className={`${input} aria-[invalid=true]:border-[#b3261e]`}
        {...rest}
      />
      {/* The field's error (announced politely); takes no space until there is one. */}
      <p id={`${name}-err`} aria-live="polite" className={error ? "mt-1.5 text-small text-[#b3261e]" : undefined}>
        {error || ""}
      </p>
    </div>
  );
}

function Select({ label, name, options, defaultValue }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-small font-medium text-ink">
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue} className={input}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
