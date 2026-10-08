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
export const CONTACT_PHONE = (import.meta.env.VITE_CONTACT_PHONE || "").trim();
export const CONTACT_EMAIL = (import.meta.env.VITE_CONTACT_EMAIL || "").trim();
export const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** "I'm interested in" values (the API accepts these ids only). `oem` is the /contact page's brand / OEM path. */
export const INTERESTS = [
  { id: "home", label: "Home storage" },
  { id: "ci", label: "Business / C&I" },
  { id: "utility", label: "Utility-scale" },
  { id: "distributor", label: "Becoming a distributor" },
];
export const INTEREST_IDS = [...INTERESTS.map((i) => i.id), "oem"];

export const LIMITS = { name: 100, mobile: 20, email: 160, company: 120, city: 80, message: 1000 };
/** At least this long between opening a form and sending it (bots are faster); the API checks it too. */
export const MIN_FILL_MS = 3000;

/** An Indian mobile number: 10 digits starting 6–9, optionally prefixed +91 (spaces / hyphens allowed). */
export const cleanMobile = (v = "") => v.replace(/[\s()-]/g, "");
const MOBILE_RE = /^(?:\+91)?[6-9]\d{9}$/;
/** For display: "+919845012345" → "+91 98450 12345"; "9845012345" → "98450 12345". */
export function prettyMobile(v = "") {
  const m = cleanMobile(v);
  const d = m.slice(-10);
  return `${m.startsWith("+91") ? "+91 " : ""}${d.slice(0, 5)} ${d.slice(5)}`;
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** The error for one field (or ""), for validation on blur. */
export function fieldError(name, value = "", { emailRequired = false } = {}) {
  const v = typeof value === "string" ? value.trim() : value;
  switch (name) {
    case "name":
      if (!v) return "Please enter your name.";
      return v.length > LIMITS.name ? `Please keep your name under ${LIMITS.name} characters.` : "";
    case "mobile":
      if (!v) return "Please enter your mobile number.";
      return MOBILE_RE.test(cleanMobile(v)) ? "" : "Please enter a 10-digit Indian mobile number (optionally with +91).";
    case "email":
      if (!v) return emailRequired ? "Please enter your email address." : "";
      return EMAIL_RE.test(v) && v.length <= LIMITS.email ? "" : "Please enter a valid email address.";
    case "company":
    case "city":
      return v.length > LIMITS[name] ? `Please keep this under ${LIMITS[name]} characters.` : "";
    case "interest":
      return INTEREST_IDS.includes(v) ? "" : "Please choose what you're interested in.";
    case "message":
      return v.length > LIMITS.message ? `Please keep your message under ${LIMITS.message} characters.` : "";
    default:
      return "";
  }
}

/** All errors for a set of values: { field: message }. */
export function validateEnquiry(values, opts) {
  const errors = {};
  for (const k of ["name", "mobile", "email", "company", "city", "interest", "message"]) {
    const e = fieldError(k, values[k] ?? "", opts);
    if (e) errors[k] = e;
  }
  return errors;
}

/**
 * Sends an enquiry. `startedAt` is when the visitor opened (first touched) the form. `details` carries
 * any extra context a form has (product, site, proposal …) as short strings. `source` is "full" (a full
 * enquiry form) or "quick" (the call-back widget: name, mobile, interest). Resolves to { ok: true } or
 * { ok: false, error } — never throws.
 */
export async function sendEnquiry({ name, mobile, email = "", company = "", city = "", interest, message = "", website = "", startedAt, details = {}, source = "full" }) {
  const body = {
    name: name.trim(),
    mobile: cleanMobile(mobile),
    email: email.trim(),
    company: company.trim(),
    city: city.trim(),
    interest,
    message: message.trim(),
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
    return data?.ok ? { ok: true } : { ok: false, error: data?.error || `http_${res.status}` };
  } catch {
    return { ok: false, error: "network" };
  }
}
