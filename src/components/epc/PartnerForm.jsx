import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { jumpTo } from "../../lib/lenis";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { COMPANY_TYPES, ENQUIRY_TYPES, PROJECT_APPLICATIONS } from "./content";

// The first three stages of the partner process, as described on How It Works.
const NEXT = [
  { n: "01", title: "Application & fit assessment", copy: "Region, business, and segment reviewed before anything else." },
  { n: "02", title: "Brand & segment onboarding", copy: "Trained only on the product lines matching your market." },
  { n: "03", title: "Territory mapping & agreement", copy: "Your region formally protected." },
];

const input =
  "w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink transition-[border-color,box-shadow] focus:border-forest/40 focus:outline-none focus:ring-2 focus:ring-signal/50";

/**
 * Partner enquiry — the Become a Partner application form (this page's existing enquiry flow, which
 * the Contact page's "I want to become a distributor" path also leads to), now with the fields an
 * EPC enquiry needs. Enquiry type defaults to "EPC / Project Partnership"; ?type=distributor and
 * ?application=<residential|ci|utility> pre-fill it from a link. Submission shows the same
 * confirmation as before (there is no separate backend).
 */
export default function PartnerForm() {
  const [params] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
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
    return () => {
      live = false;
    };
  }, [hash]);
  const application = PROJECT_APPLICATIONS.some((a) => a.id === params.get("application")) ? params.get("application") : "";

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="apply" aria-labelledby="apply-title" className="bg-paper py-20 focus:outline-none md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Partner enquiry</p>
          <h2 id="apply-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Become a Partner
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-graphite">
            Tell us about your company and the projects you&rsquo;re planning. Our team will review your details and get
            back to you.
          </p>
          <ol className="mt-10 space-y-6">
            {NEXT.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="text-xs font-semibold tracking-[0.18em] text-sage">{s.n}</span>
                <div>
                  <p className="font-medium text-ink">{s.title}</p>
                  <p className="mt-0.5 text-sm text-graphite">{s.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-line bg-ice/60 p-6 sm:p-8">
          {submitted ? (
            <div role="status" className="journey-detail flex flex-col items-start py-6">
              <CheckCircle2 aria-hidden="true" className="h-8 w-8 text-forest" strokeWidth={1.75} />
              <p className="mt-4 text-lg font-semibold text-ink">Enquiry received.</p>
              <p className="mt-1.5 text-sm text-graphite">Our team will review your details and get back to you.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Select label="Enquiry type" name="enquiryType" defaultValue={type} options={ENQUIRY_TYPES.map((t) => ({ value: t, label: t }))} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" name="name" autoComplete="name" required />
                <Field label="Company" name="company" autoComplete="organization" required />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" name="email" type="email" autoComplete="email" required />
                <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Location" name="location" placeholder="City, state" required />
                <Select label="Company type" name="companyType" options={COMPANY_TYPES.map((t) => ({ value: t, label: t }))} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  label="Project / application"
                  name="application"
                  defaultValue={application}
                  options={[{ value: "", label: "Select…" }, ...PROJECT_APPLICATIONS.map((a) => ({ value: a.id, label: a.label }))]}
                />
                <Field label="Expected requirement" name="requirement" placeholder="e.g. capacity or number of systems" />
              </div>
              <Field label="Message" name="message" as="textarea" />
              <button
                type="submit"
                className="group inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-forest transition-[background-color,box-shadow,scale] duration-300 hover:bg-[#a4e39d] hover:shadow-[0_0_24px_2px_rgba(144,217,136,0.35)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                Submit Enquiry
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, required, type = "text", as, ...rest }) {
  const Tag = as || "input";
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="font-normal text-graphite">(required)</span>}
      </label>
      <Tag id={name} name={name} type={as ? undefined : type} required={required} rows={as === "textarea" ? 4 : undefined} className={input} {...rest} />
    </div>
  );
}

function Select({ label, name, options, defaultValue }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
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
