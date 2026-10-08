import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useMagnetic } from "../lib/magnetic";
import { onceInView } from "../lib/inview";
import { isFirstLoad } from "../lib/firstLoad";
import { scrollToId } from "../lib/scrollTo";
import { INTERESTS, LIMITS, MIN_FILL_MS, cleanMobile, fieldError, sendEnquiry } from "../lib/enquiry";

const EMPTY = { name: "", mobile: "", interest: "", website: "" };
const FIELDS = ["name", "mobile", "interest"];
// Shorter wording than the full form's, so an error fits the strip's one-line band under its field.
const SHORT = { mobile: "Please enter a valid 10-digit mobile number.", interest: "Please choose one." };
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** ?interest=ci or #contact?interest=ci → "ci" (the four homepage values, as the full form reads them). */
function interestFrom(search, hash) {
  const fromHash = hash.startsWith("#contact?") ? new URLSearchParams(hash.slice("#contact?".length)).get("interest") : null;
  const v = fromHash ?? new URLSearchParams(search).get("interest");
  return INTERESTS.some((i) => i.id === v) ? v : "";
}

/** "+919845012345" → "+91 98450 12345"; "9845012345" → "98450 12345". */
function prettyMobile(v) {
  const m = cleanMobile(v);
  const d = m.slice(-10);
  return `${m.startsWith("+91") ? "+91 " : ""}${d.slice(0, 5)} ${d.slice(5)}`;
}

/**
 * Homepage quick call-back strip, directly under the hero: a one-step enquiry (name, mobile,
 * interest) for visitors who don't want the full form. The full contact section (#contact, at the
 * bottom of the page) is unchanged; this strip links to it.
 *
 * A dark band in the hero's palette with a soft signal-green line along its top. Desktop: one row
 * (~96px) — the label, three fields (each label sits inside its box and stays visible when filled),
 * then the button with the "full form" link under it. Phones: stacked, labels above the inputs.
 *
 * Sends through the shared helper (lib/enquiry → /api/contact.php) with source "quick", which the API
 * turns into a "Call-back request" email. The 3 s minimum fill time runs from when the strip mounts.
 * Errors show on submit, then update live as the visitor fixes them; on success the fields fade out
 * and one thank-you line (with a check that draws itself) takes their place in the same grid cell, so
 * the strip keeps its height and nothing below moves. On failure every value is kept.
 *
 * Motion: it rises in once (12px, 0.4s) after the hero settles. On a first load that is pure CSS from
 * the pre-rendered page (.qe-reveal, no JavaScript needed); if it starts below the viewport it waits
 * and rises as it scrolls into view instead. Reduced motion: static.
 */
export default function HomeQuickEnquiry() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const content = useRef(null);
  const form = useRef(null);
  const thanks = useRef(null);
  const magnetic = useMagnetic();
  const [first] = useState(() => typeof window === "undefined" || isFirstLoad());
  const { search, hash } = useLocation();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [sent, setSent] = useState({ firstName: "", mobile: "" });
  const started = useRef(0);

  // The minimum fill time runs from when the strip mounts.
  useEffect(() => {
    started.current = Date.now();
  }, []);

  useEffect(() => {
    const pre = interestFrom(search, hash);
    if (pre) setValues((v) => ({ ...v, interest: pre }));
  }, [search, hash]);

  // The reveal. CSS rises the strip in after the hero settles (index.css, .qe-reveal); this only takes
  // over when the strip starts below the viewport — it waits off screen (nothing visible is hidden) and
  // rises as it scrolls into view, never before the hero has settled.
  useLayoutEffect(() => {
    const el = content.current;
    if (!el || reduced()) return;
    const settleAt = performance.now() + (first ? 1400 : 1750);
    let timer;
    const off = onceInView(el, {
      below: () => (el.dataset.qe = "wait"),
      enter: () => {
        timer = setTimeout(() => (el.dataset.qe = "in"), Math.max(0, settleAt - performance.now()));
      },
      show: () => el.dataset.qe === "wait" && (el.dataset.qe = "done"),
    });
    return () => {
      off();
      clearTimeout(timer);
      delete el.dataset.qe;
    };
  }, [first]);

  useEffect(() => {
    if (status === "done") thanks.current?.focus();
  }, [status]);

  const check = (k, v) => {
    const e = fieldError(k, v);
    return e ? SHORT[k] || e : "";
  };
  const set = (k) => (e) => {
    const v = e.target.value;
    setValues((s) => ({ ...s, [k]: v }));
    // After the first submit, errors follow the typing.
    if (tried && k !== "website") setErrors((er) => ({ ...er, [k]: check(k, v) || undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setTried(true);
    const er = {};
    for (const k of FIELDS) {
      const m = check(k, values[k]);
      if (m) er[k] = m;
    }
    setErrors(er);
    const firstBad = FIELDS.find((k) => er[k]);
    if (firstBad) {
      form.current.querySelector(`#${uid}-${firstBad}`)?.focus();
      return;
    }
    setStatus("sending");
    const wait = MIN_FILL_MS - (Date.now() - started.current);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    const res = await sendEnquiry({ ...values, startedAt: started.current, source: "quick" });
    if (res.ok) {
      setSent({ firstName: values.name.trim().split(/\s+/)[0], mobile: prettyMobile(values.mobile) });
      setStatus("done");
    } else setStatus("error");
  };
  const again = () => {
    started.current = Date.now();
    setValues({ ...EMPTY, interest: interestFrom(search, hash) });
    setErrors({});
    setTried(false);
    setStatus("idle");
    requestAnimationFrame(() => form.current?.querySelector(`#${uid}-name`)?.focus());
  };

  const done = status === "done";
  const label = "block text-xs font-medium text-ice/85 lg:pointer-events-none lg:absolute lg:left-4 lg:top-[7px] lg:z-10 lg:text-[11px] lg:tracking-wide";
  const box =
    "block h-11 w-full rounded-xl border border-white/15 bg-white/[0.05] px-4 text-base placeholder:text-ice/40 transition-colors hover:border-white/30 focus-visible:border-transparent focus-visible:outline-2 focus-visible:outline-signal aria-[invalid=true]:border-[#ffb0a3] lg:h-[52px] lg:pt-[18px] lg:text-[15px]";
  const input = `${box} mt-1.5 text-white lg:mt-0`;
  const err = (k) => (
    <p id={`${uid}-${k}-err`} aria-live="polite" className="mt-1 text-xs leading-4 text-[#ffb0a3]">
      {errors[k] || ""}
    </p>
  );
  const describe = (k) => `${uid}-${k}-err`;

  return (
    <div className="relative bg-night text-white">
      {/* The soft signal-green line along the top, and its glow. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(144,217,136,0.6) 25%, rgba(144,217,136,0.6) 75%, transparent)" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-10"
        style={{ background: "radial-gradient(50% 100% at 50% 0%, rgba(144,217,136,0.12), transparent 75%)" }}
      />
      <div ref={content} className="qe-reveal relative container-site grid py-6 lg:py-3" style={first ? undefined : { "--qe-delay": "1.75s" }}>
        <form
          ref={form}
          onSubmit={submit}
          noValidate
          aria-labelledby={`${uid}-title`}
          aria-describedby={`${uid}-sub`}
          inert={done || undefined}
          aria-hidden={done || undefined}
          className={`[grid-area:1/1] grid grid-cols-2 gap-x-3 gap-y-3 duration-300 motion-reduce:transition-none lg:grid-cols-[minmax(0,13rem)_repeat(3,minmax(0,1fr))_auto] lg:items-start lg:gap-x-4 lg:gap-y-0 ${
            // Visibility flips only at the end of a fade-out and at once on the way back, so the fields
            // can take focus again immediately ("Send another").
            done ? "invisible opacity-0 transition-[opacity,visibility]" : "visible opacity-100 transition-opacity"
          }`}
        >
          <div className="col-span-2 lg:col-span-1 lg:flex lg:h-[52px] lg:flex-col lg:justify-center">
            <p id={`${uid}-title`} className="text-base font-semibold leading-tight text-white">
              Get a call back
            </p>
            <p id={`${uid}-sub`} className="mt-1 text-sm leading-snug text-ice/80 lg:text-xs">
              Tell us what you need, we&rsquo;ll call you.
            </p>
          </div>

          <div className="relative">
            <label htmlFor={`${uid}-name`} className={label}>
              Name<span className="text-signal"> *</span>
            </label>
            <input
              id={`${uid}-name`}
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={LIMITS.name}
              value={values.name}
              onChange={set("name")}
              aria-invalid={!!errors.name || undefined}
              aria-describedby={describe("name")}
              className={input}
            />
            {err("name")}
          </div>

          <div className="relative">
            <label htmlFor={`${uid}-mobile`} className={label}>
              Mobile number<span className="text-signal"> *</span>
            </label>
            <input
              id={`${uid}-mobile`}
              name="mobile"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              maxLength={LIMITS.mobile}
              value={values.mobile}
              onChange={set("mobile")}
              aria-invalid={!!errors.mobile || undefined}
              aria-describedby={describe("mobile")}
              className={input}
            />
            {err("mobile")}
          </div>

          <div className="relative col-span-2 lg:col-span-1">
            <label htmlFor={`${uid}-interest`} className={label}>
              I&rsquo;m interested in<span className="text-signal"> *</span>
            </label>
            <div className="relative mt-1.5 lg:mt-0">
              <select
                id={`${uid}-interest`}
                name="interest"
                required
                value={values.interest}
                onChange={set("interest")}
                aria-invalid={!!errors.interest || undefined}
                aria-describedby={describe("interest")}
                className={`${box} cursor-pointer appearance-none pr-10 [&>option]:bg-night [&>option]:text-white ${values.interest ? "text-white" : "text-ice/50"}`}
              >
                <option value="" disabled>
                  Choose one
                </option>
                {INTERESTS.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.label}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ice/70" />
            </div>
            {err("interest")}
          </div>

          {/* Honeypot: hidden from people; bots fill it. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
            </label>
          </div>

          <div className="col-span-2 mt-1 lg:col-span-1 lg:mt-0 lg:text-right">
            {/* The hero's primary button: magnetic pull, a light that follows the pointer, the arrow
                nudging forward, a slight lift in scale. */}
            <span ref={magnetic} className="block lg:inline-block">
              <button
                type="submit"
                disabled={status === "sending"}
                onPointerMove={(e) => {
                  if (e.pointerType !== "mouse") return;
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--sx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
                  e.currentTarget.style.setProperty("--sy", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
                }}
                className="group/pill relative isolate inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-signal px-6 text-sm font-semibold text-forest transition-[background-color,box-shadow,scale] duration-300 hover:scale-[1.02] hover:bg-[#a4e39d] hover:shadow-[0_0_24px_2px_rgba(144,217,136,0.35)] active:scale-[0.97] disabled:cursor-wait disabled:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal lg:h-[52px] lg:w-auto"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity duration-300 group-hover/pill:opacity-100"
                  style={{ background: "radial-gradient(60% 120% at var(--sx, 50%) var(--sy, 50%), rgba(255,255,255,0.42), transparent 70%)" }}
                />
                {status === "sending" ? (
                  <>
                    <span aria-hidden="true" className="contact-spin h-4 w-4 rounded-full border-2 border-forest/30 border-t-forest" />
                    Sending…
                  </>
                ) : (
                  <>
                    Get a call back
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 ease-out group-hover/pill:translate-x-1" strokeWidth={2} />
                  </>
                )}
              </button>
            </span>
            <p className="mt-2 text-center text-xs leading-4 text-ice/75 lg:mt-1 lg:text-right">
              Prefer to share more details?{" "}
              <a href="#contact" onClick={scrollToId("contact")} className="whitespace-nowrap font-semibold text-signal underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">
                Use the full form ↓
              </a>
            </p>
          </div>

          {status === "error" && (
            <p role="alert" className="col-span-2 rounded-xl border border-[#ffb0a3]/40 bg-[#ffb0a3]/10 px-4 py-2.5 text-sm text-white lg:col-span-5 lg:mt-2">
              Couldn&rsquo;t send. Please try again, or{" "}
              <a href="#contact" onClick={scrollToId("contact")} className="font-semibold text-signal underline underline-offset-4">
                use the full form ↓
              </a>
            </p>
          )}
        </form>

        <div
          role="status"
          className={`[grid-area:1/1] flex items-center justify-center duration-300 motion-reduce:transition-none ${
            // Visible at once (so the thank-you line can take focus), fading in as the fields fade out.
            done ? "visible opacity-100 transition-opacity delay-150" : "invisible opacity-0 transition-none"
          }`}
        >
          {done && (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
              <svg aria-hidden="true" viewBox="0 0 64 64" className="contact-check h-8 w-8 shrink-0" fill="none" stroke="#90D988" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="32" cy="32" r="28" pathLength="1" />
                <path d="M20 33l8 8 16-17" pathLength="1" />
              </svg>
              <p ref={thanks} tabIndex={-1} className="text-base font-semibold text-white outline-none lg:text-lg">
                Thank you, {sent.firstName}. We&rsquo;ll call you on <span className="whitespace-nowrap">{sent.mobile}</span>.
              </p>
              <button
                type="button"
                onClick={again}
                className="rounded-sm text-sm font-semibold text-signal underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
              >
                Send another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
