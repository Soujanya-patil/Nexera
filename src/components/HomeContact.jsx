import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, BadgeCheck, GraduationCap, Ruler } from "lucide-react";
import { useScrollReveal } from "../lib/scrollReveal";
import { onceInView } from "../lib/inview";
import { jumpTo } from "../lib/lenis";
import { isFirstLoad } from "../lib/firstLoad";
import { CONTACT_EMAIL, CONTACT_PHONE, INTERESTS, LIMITS, MIN_FILL_MS, fieldError, sendEnquiry, telHref, validateEnquiry } from "../lib/enquiry";

const TRUST = [
  { icon: BadgeCheck, text: "Authorized partner for TCL, Hithium, CLOU and Midea" },
  { icon: Ruler, text: "Design, sizing and commissioning support" },
  { icon: GraduationCap, text: "Hands-on technician training in Kalaburagi" },
];
const EMPTY = { name: "", mobile: "", email: "", company: "", city: "", interest: "", message: "", website: "" };

/** A parameter from #contact?… (first) or ?… */
function param(search, hash, key) {
  const fromHash = hash.startsWith("#contact?") ? new URLSearchParams(hash.slice("#contact?".length)).get(key) : null;
  return fromHash ?? new URLSearchParams(search).get(key);
}
/** ?interest=ci or #contact?interest=ci → "ci" (only the four homepage values). */
function interestFrom(search, hash) {
  const v = param(search, hash, "interest");
  return INTERESTS.some((i) => i.id === v) ? v : "";
}
/**
 * #contact?doc=TCL BlueArk W10 (&kind=brochure) — the /resources document cards — → the message
 * "Please send me the datasheet for TCL BlueArk W10." (or "brochure"); "" without a doc.
 */
function docRequestFrom(search, hash) {
  const doc = (param(search, hash, "doc") ?? "").replace(/[\x00-\x1F\x7F]+/g, " ").trim().slice(0, 120);
  if (!doc) return "";
  const kind = param(search, hash, "kind") === "brochure" ? "brochure" : "datasheet";
  return `Please send me the ${kind} for ${doc}.`;
}

/**
 * Homepage contact section (id="contact"): the page's last section before the footer, replacing the
 * old closing band (HomeCta stays in the codebase, unmounted). Dark, in the hero's palette: the pitch
 * and trust lines on the left, the enquiry form on the right (stacked on phones).
 *
 * The hero's "Contact Us" links here (#contact). /#contact?interest=ci or /?interest=ci#contact
 * preselects the interest (home, ci, utility, distributor) and lands on the section; &doc=<product>
 * (and &kind=brochure) — the /resources document cards — pre-fills an editable message asking for
 * that product's datasheet (or brochure).
 *
 * The form validates on blur and on submit (errors under each field, announced politely), sends through
 * the shared helper (lib/enquiry → /api/contact.php), shows a spinner while sending, then a thank-you
 * panel with a check mark that draws itself; on failure it keeps every value and shows an error (with
 * the phone / email only when they are configured). Reveals once, like the other sections; the form
 * card rises in with a soft border glow. Reduced motion: static.
 */
export default function HomeContact() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const root = useRef(null);
  const card = useRef(null);
  const form = useRef(null);
  const reveal = useScrollReveal(root, { stagger: 0.08 });
  const { search, hash } = useLocation();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [firstName, setFirstName] = useState("");
  const started = useRef(0);
  const askedFor = useRef("");

  // Preselect from the URL, and land on the section for the #contact?… form (not an element id), and
  // for a plain #contact reached from another page (this section is in the homepage's second chunk,
  // so it may not exist yet when the router looks for it; a direct load is left to the browser).
  // Arriving from another page, the page above can still be settling as it renders (sections
  // hydrate, images decode), so the landing is checked again a few times and corrected if it drifted.
  useEffect(() => {
    const pre = interestFrom(search, hash);
    if (pre) setValues((v) => ({ ...v, interest: pre }));
    // A document request pre-fills the message, and an untouched pre-fill follows the URL (cleared by a
    // link without one) — never over what the visitor has written.
    const ask = docRequestFrom(search, hash);
    const prev = askedFor.current;
    if (ask || prev) setValues((v) => (v.message === "" || v.message === prev ? { ...v, message: ask } : v));
    askedFor.current = ask;
    if (!hash.startsWith("#contact?") && !(hash === "#contact" && !isFirstLoad())) return;
    const el = root.current;
    const land = () => el && Math.abs(el.getBoundingClientRect().top - 64) > 2 && jumpTo(el.getBoundingClientRect().top + window.scrollY - 64);
    const raf = requestAnimationFrame(land);
    const timers = [150, 450, 900, 1600].map((ms) => setTimeout(land, ms));
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [search, hash]);

  // The form card's soft border glow, once, as it arrives.
  useEffect(() => {
    const el = card.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return onceInView(el, { enter: () => (el.dataset.glow = "on"), show: () => (el.dataset.glow = "on") });
  }, []);

  const begin = () => (started.current ||= Date.now());
  const set = (k) => (e) => {
    const v = e.target.value;
    setValues((s) => ({ ...s, [k]: k === "message" ? v.slice(0, LIMITS.message) : v }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: fieldError(k, v) || undefined }));
  };
  const blur = (k) => () => {
    const e = fieldError(k, values[k]);
    setErrors((er) => ({ ...er, [k]: e || undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    begin();
    const er = validateEnquiry(values);
    setErrors(er);
    const firstBad = ["name", "mobile", "email", "company", "city", "interest", "message"].find((k) => er[k]);
    if (firstBad) {
      const target = firstBad === "interest" ? form.current.querySelector('input[name="interest"]') : form.current.querySelector(`#${uid}-${firstBad}`);
      target?.focus();
      return;
    }
    setStatus("sending");
    // Never sooner than the API's minimum fill time.
    const wait = MIN_FILL_MS - (Date.now() - started.current);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    const res = await sendEnquiry({ ...values, startedAt: started.current });
    if (res.ok) {
      setFirstName(values.name.trim().split(/\s+/)[0]);
      setValues(EMPTY);
      setStatus("done");
    } else setStatus("error");
  };
  const again = () => {
    started.current = 0;
    setErrors({});
    setStatus("idle");
    requestAnimationFrame(() => form.current?.querySelector(`#${uid}-name`)?.focus());
  };

  const input = "mt-2 block w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-ice/40 transition-colors focus-visible:border-transparent focus-visible:outline-2 focus-visible:outline-signal aria-[invalid=true]:border-[#ffb0a3]";
  const label = "block text-sm font-medium text-ice/90";
  const err = (k) => (
    <p id={`${uid}-${k}-err`} aria-live="polite" className="mt-1.5 min-h-0 text-sm text-[#ffb0a3]">
      {errors[k] || ""}
    </p>
  );
  const field = (k, text, { type = "text", required, autoComplete, inputMode } = {}) => (
    <div>
      <label htmlFor={`${uid}-${k}`} className={label}>
        {text}
        {required ? <span className="text-signal"> *</span> : <span className="text-ice/60"> (optional)</span>}
      </label>
      <input
        id={`${uid}-${k}`}
        name={k}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required={required}
        maxLength={LIMITS[k]}
        value={values[k]}
        onChange={set(k)}
        onBlur={blur(k)}
        aria-invalid={!!errors[k] || undefined}
        aria-describedby={`${uid}-${k}-err`}
        className={input}
      />
      {err(k)}
    </div>
  );

  return (
    <section ref={root} id="contact" data-sr-state={reveal} aria-labelledby={`${uid}-title`} className="relative scroll-mt-16 overflow-hidden bg-night text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 60% at 85% 20%, rgba(144,217,136,0.10), transparent 70%), radial-gradient(50% 60% at 0% 100%, rgba(144,217,136,0.07), transparent 70%)" }}
      />
      <div className="relative container-site grid gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
        {/* Left: the pitch */}
        <div className="lg:col-span-5">
          <p data-sr className="text-xs font-semibold uppercase tracking-[0.22em] text-signal">
            Get in touch
          </p>
          <h2 id={`${uid}-title`} data-sr className="mt-4 text-[clamp(2rem,1.2rem+2.6vw,3.25rem)] font-semibold leading-[1.05] tracking-tight">
            Let&rsquo;s power your project.
          </h2>
          <p data-sr className="mt-5 max-w-md text-lg leading-relaxed text-ice/80">
            Tell us about your home, business or utility project. Our team will help you choose the right battery energy storage system.
          </p>
          <ul data-sr className="mt-8 space-y-4">
            {TRUST.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-ice/90">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-signal/50 text-signal">
                  <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <span className="pt-1">{text}</span>
              </li>
            ))}
          </ul>
          {(CONTACT_PHONE || CONTACT_EMAIL) && (
            <p data-sr className="mt-8 text-ice/85">
              {CONTACT_PHONE && (
                <>
                  Prefer to talk? Call{" "}
                  <a href={telHref(CONTACT_PHONE)} className="font-semibold text-signal underline-offset-4 hover:underline">
                    {CONTACT_PHONE}
                  </a>
                  {CONTACT_EMAIL ? " " : ""}
                </>
              )}
              {CONTACT_EMAIL && (
                <>
                  {CONTACT_PHONE ? "or email " : "Prefer email? Write to "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-signal underline-offset-4 hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                </>
              )}
            </p>
          )}
          <p data-sr className="mt-8 text-sm text-ice/75">
            Want to become a distributor?{" "}
            <Link to="/become-a-partner" className="group inline-flex items-center gap-1 font-semibold text-signal underline-offset-4 hover:underline">
              Explore our partner program
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </p>
        </div>

        {/* Right: the form card */}
        <div className="lg:col-span-7">
          <div ref={card} data-sr className="contact-card relative rounded-3xl border border-white/12 bg-white/[0.03] p-6 sm:p-8">
            {status === "done" ? (
              <div role="status" className="py-10 text-center">
                <svg aria-hidden="true" viewBox="0 0 64 64" className="contact-check mx-auto h-20 w-20" fill="none" stroke="#90D988" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="32" cy="32" r="29" pathLength="1" />
                  <path d="M20 33l8 8 16-17" pathLength="1" />
                </svg>
                <p className="mx-auto mt-6 max-w-md text-xl font-semibold leading-snug text-white">
                  Thank you, {firstName}. We&rsquo;ve received your enquiry and our team will get back to you shortly.
                </p>
                <button type="button" onClick={again} className="mt-6 rounded-md text-sm font-semibold text-signal underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal">
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form ref={form} onSubmit={submit} onFocusCapture={begin} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  {field("name", "Name", { required: true, autoComplete: "name" })}
                  {field("mobile", "Mobile number", { type: "tel", required: true, autoComplete: "tel", inputMode: "tel" })}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {field("email", "Email", { type: "email", autoComplete: "email" })}
                  {field("company", "Company / organisation", { autoComplete: "organization" })}
                </div>
                {field("city", "City", { autoComplete: "address-level2" })}

                <fieldset>
                  <legend id={`${uid}-interest-legend`} className={label}>
                    I&rsquo;m interested in<span className="text-signal"> *</span>
                  </legend>
                  <div role="radiogroup" aria-labelledby={`${uid}-interest-legend`} aria-required="true" aria-invalid={!!errors.interest || undefined} aria-describedby={`${uid}-interest-err`} className="mt-2 flex flex-wrap gap-2">
                    {INTERESTS.map((it) => (
                      <label key={it.id} className="contact-chip">
                        <input
                          type="radio"
                          name="interest"
                          value={it.id}
                          checked={values.interest === it.id}
                          onChange={(e) => {
                            set("interest")(e);
                            setErrors((er) => ({ ...er, interest: undefined }));
                          }}
                          className="sr-only"
                        />
                        <span>{it.label}</span>
                      </label>
                    ))}
                  </div>
                  {err("interest")}
                </fieldset>

                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor={`${uid}-message`} className={label}>
                      Message<span className="text-ice/60"> (optional)</span>
                    </label>
                    <span id={`${uid}-count`} className="text-xs tabular-nums text-ice/60">
                      {values.message.length} / {LIMITS.message}
                    </span>
                  </div>
                  <textarea
                    id={`${uid}-message`}
                    name="message"
                    rows={4}
                    maxLength={LIMITS.message}
                    value={values.message}
                    onChange={set("message")}
                    onBlur={blur("message")}
                    aria-invalid={!!errors.message || undefined}
                    aria-describedby={`${uid}-count ${uid}-message-err`}
                    className={`${input} resize-y`}
                  />
                  {err("message")}
                </div>

                {/* Honeypot: hidden from people; bots fill it. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
                  </label>
                </div>

                {status === "error" && (
                  <p role="alert" className="rounded-xl border border-[#ffb0a3]/40 bg-[#ffb0a3]/10 px-4 py-3 text-sm text-white">
                    Something went wrong. Please try again, or call/email us.
                    {CONTACT_PHONE && (
                      <>
                        {" "}
                        <a href={telHref(CONTACT_PHONE)} className="font-semibold text-signal underline">
                          {CONTACT_PHONE}
                        </a>
                      </>
                    )}
                    {CONTACT_EMAIL && (
                      <>
                        {" "}
                        <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-signal underline">
                          {CONTACT_EMAIL}
                        </a>
                      </>
                    )}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <p className="text-xs text-ice/70">We&rsquo;ll only use your details to respond to this enquiry.</p>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-forest transition-[background-color,box-shadow] duration-300 hover:bg-[#a4e39d] hover:shadow-[0_0_24px_2px_rgba(144,217,136,0.35)] disabled:cursor-wait disabled:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
                  >
                    {status === "sending" ? (
                      <>
                        <span aria-hidden="true" className="contact-spin h-4 w-4 rounded-full border-2 border-forest/30 border-t-forest" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send enquiry
                        <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
