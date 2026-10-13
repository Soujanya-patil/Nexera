/*
 * Website enquiries — one helper for every form that sends one (the homepage contact section, the
 * site-wide call-back widget and the /contact page). Validation here mirrors public/api/contact.php,
 * which validates again server-side and sends the email.
 *
 * Optional contact details are read at build time; when they are not set, nothing is shown (no phone
 * number or email address is ever invented):
 *   VITE_CONTACT_PHONE   e.g. +91 80 1234 5678
 *   VITE_CONTACT_EMAIL   e.g. hello@example.com
 */
export const ENDPOINT = "/api/contact.php";
// (`?? {}`: outside Vite — the rules' unit tests in Node — there is no import.meta.env.)
const ENV = import.meta.env ?? {};
export const CONTACT_PHONE = (ENV.VITE_CONTACT_PHONE || "").trim();
export const CONTACT_EMAIL = (ENV.VITE_CONTACT_EMAIL || "").trim();
export const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** "I'm interested in" values (the API accepts these ids only). `oem` is the /contact page's brand / OEM path. */
export const INTERESTS = [
  { id: "home", label: "Home storage" },
  { id: "ci", label: "Business / C&I" },
  { id: "utility", label: "Utility-scale" },
  { id: "distributor", label: "Becoming a distributor" },
];
// `epc`: the Become a Partner form's "EPC / Project Partnership" (its "Distributor application" is `distributor`).
export const INTEREST_IDS = [...INTERESTS.map((i) => i.id), "oem", "epc"];

/** At least this long between opening a form and sending it (bots are faster); the API checks it too. */
export const MIN_FILL_MS = 3000;

/*
 * The rules for every enquiry form (the /contact page, the homepage contact section, the call-back
 * widget, the Become a Partner form). public/api/contact.php applies exactly the same rules and
 * messages again, so a request that skips this page is held to them too.
 *
 * Every value is trimmed and its repeated spaces collapsed first (`tidy`). A field that is empty is
 * fine unless the form requires it; a field that is filled must pass its rule:
 *   name         2–60 characters; letters, spaces, . ' and - only; at least 2 letters (no digits)
 *   company      2–100 characters; at least 2 letters (digits allowed: "3M India")
 *   email        a valid address with a domain and a TLD of 2+ letters; Gmail: 6–30 characters before @
 *   mobile       an Indian mobile (10 digits from 6–9, optional +91 / 91 / 0) or +<8–15 digits>;
 *                not one digit repeated, not an ascending run (1234567890)
 *   city         2–80 characters; at least 3 letters (a pincode alongside is fine)
 *   requirement  2–100 characters; at least 2 letters (a unit or a word, not just a number)
 *   message      10–1,000 characters; at least 5 letters
 * "Letters" are any script's (\p{L}), so names in Indian scripts pass too.
 */
export const LIMITS = { name: 60, mobile: 20, email: 160, company: 100, city: 80, requirement: 100, message: 1000 };
const MIN = { name: 2, company: 2, city: 2, requirement: 2, message: 10 };
const MIN_LETTERS = { name: 2, company: 2, city: 3, requirement: 2, message: 5 };
export const MESSAGES = {
  name: "Please enter your full name.",
  company: "Please enter your company name.",
  email: "Please enter a valid email address.",
  mobile: "Please enter a valid mobile number.",
  city: "Please enter your city or location.",
  requirement: "Please add a unit, e.g. 500 kWh, 2 MW or 3 systems.",
  message: "Please write a few words about your requirement.",
  interest: "Please choose what you're interested in.",
};
/** Required on every form unless it says otherwise (the Become a Partner form's phone is optional). */
const REQUIRED = { name: true, mobile: true, interest: true };

/** Trimmed, with runs of spaces collapsed (the message keeps its line breaks). */
export const tidy = (v = "", { multiline = false } = {}) =>
  String(v)
    .replace(multiline ? /[^\S\n]+/g : /\s+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .trim();
const letters = (v) => (v.match(/\p{L}/gu) || []).length;
const NAME_RE = /^[\p{L}\p{M} .'’-]+$/u;
const EMAIL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
const GMAIL = ["gmail.com", "googlemail.com"];

/** A mobile number's digits and +, without spaces, dashes, dots or brackets. */
export const cleanMobile = (v = "") => String(v).replace(/[\s().-]/g, "");
/** One digit repeated, or each digit one more than the last (1234567890, 0123456789). */
const junkDigits = (d) => /^(\d)\1+$/.test(d) || [...d].every((c, i) => i === 0 || Number(c) === (Number(d[i - 1]) + 1) % 10);
/** An Indian mobile (+91 / 91 / 0 and 10 digits from 6–9) or an international +<8–15 digits>. */
export function validMobile(v = "") {
  const m = cleanMobile(v);
  const indian = m.match(/^(?:\+91|91|0)?([6-9]\d{9})$/);
  if (indian) return !junkDigits(indian[1]);
  // +91 is India: held to the Indian rule above, never accepted as "international".
  if (/^\+(?!91)\d{8,15}$/.test(m)) return !junkDigits(m.slice(1));
  return false;
}
/** For display: "+919845012345" → "+91 98450 12345"; "9845012345" → "98450 12345"; others as typed. */
export function prettyMobile(v = "") {
  const m = cleanMobile(v);
  const indian = m.match(/^(\+91|91|0)?([6-9]\d{9})$/);
  if (!indian) return m;
  const d = indian[2];
  return `${indian[1] ? "+91 " : ""}${d.slice(0, 5)} ${d.slice(5)}`;
}

/** Whether a filled-in value passes its field's rule. */
function passes(name, v) {
  switch (name) {
    case "name":
      return v.length >= MIN.name && v.length <= LIMITS.name && NAME_RE.test(v) && letters(v) >= MIN_LETTERS.name;
    case "email": {
      if (v.length > LIMITS.email || !EMAIL_RE.test(v)) return false;
      const [local, domain] = [v.slice(0, v.lastIndexOf("@")), v.slice(v.lastIndexOf("@") + 1).toLowerCase()];
      // Gmail's own rule: 6–30 characters before the @ (a +tag after the username doesn't count).
      if (GMAIL.includes(domain)) {
        const user = local.split("+")[0];
        return user.length >= 6 && user.length <= 30;
      }
      return true;
    }
    case "mobile":
      return validMobile(v);
    case "company":
    case "city":
    case "requirement":
    case "message":
      return v.length >= MIN[name] && v.length <= LIMITS[name] && letters(v) >= MIN_LETTERS[name];
    case "interest":
      return INTEREST_IDS.includes(v);
    default:
      return true;
  }
}

/**
 * The error for one field (or ""). `required`: the fields this form requires, over the defaults
 * (name, mobile, interest) — e.g. { email: true } on /contact, { mobile: false, email: true, … } on
 * the Become a Partner form.
 */
export function fieldError(name, value = "", { required = {} } = {}) {
  const v = tidy(value, { multiline: name === "message" });
  if (!v) return { ...REQUIRED, ...required }[name] ? MESSAGES[name] ?? "" : "";
  return passes(name, v) ? "" : MESSAGES[name] ?? "";
}

// A field checked on blur while the pointer is pressed — the press on "Send" that moved focus off it —
// is checked once the press is over: a message appearing above the button would otherwise move the
// button from under the pointer and swallow that click. (pointerup, mouseup and click are dispatched
// together, so a timeout set at pointerup runs after the click.)
let pressed = false;
let queued = [];
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", () => (pressed = true), true);
  const release = () =>
    setTimeout(() => {
      pressed = false;
      const run = queued;
      queued = [];
      run.forEach((fn) => fn());
    });
  window.addEventListener("pointerup", release, true);
  window.addEventListener("pointercancel", release, true);
}
/** Runs `fn` now, or — during a pointer press — just after it (see above). For blur checks. */
export function afterPress(fn) {
  if (pressed) queued.push(fn);
  else fn();
}

/** All errors for a set of values: { field: message }. */
export function validateEnquiry(values, opts, fields = ["name", "mobile", "email", "company", "city", "interest", "message"]) {
  const errors = {};
  for (const k of fields) {
    const e = fieldError(k, values[k] ?? "", opts);
    if (e) errors[k] = e;
  }
  return errors;
}

/**
 * Sends an enquiry. `startedAt` is when the visitor opened (first touched) the form. `details` carries
 * any extra context a form has (product, site, proposal …) as short strings. `source` is "full" (a full
 * enquiry form), "quick" (the call-back widget: name, mobile, interest) or "partner" (the Become a
 * Partner form). Resolves to { ok: true } or { ok: false, error, fields? } — `fields`, when the API
 * found a field invalid: { field: message }, shown under that field — never throws.
 */
export async function sendEnquiry({ name, mobile = "", email = "", company = "", city = "", requirement = "", interest, message = "", website = "", startedAt, details = {}, source = "full" }) {
  const body = {
    name: tidy(name),
    mobile: cleanMobile(mobile),
    email: tidy(email),
    company: tidy(company),
    city: tidy(city),
    requirement: tidy(requirement),
    interest,
    message: tidy(message, { multiline: true }),
    website,
    details,
    source,
    page: window.location.pathname + window.location.search,
    startedAt,
    sentAt: Date.now(),
  };
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (data?.ok) return { ok: true };
    const fields = data?.error === "validation" && data.fields && typeof data.fields === "object" && !Array.isArray(data.fields) ? data.fields : null;
    return { ok: false, error: data?.error || `http_${res.status}`, ...(fields ? { fields } : {}) };
  } catch {
    return { ok: false, error: "network" };
  }
}
