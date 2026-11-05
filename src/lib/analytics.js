/*
 * Analytics with consent: Google Analytics 4 (G-3CT5021X9H) under Google Consent Mode v2.
 *
 * - Before a choice, and after "Reject": nothing is loaded and nothing is sent. The Consent Mode
 *   default (everything denied) only goes into the page's own dataLayer — no request leaves the page.
 * - After "Accept" (now, or on a later visit): consent is updated (analytics_storage granted; the ad
 *   signals stay denied — the site runs no ads), then gtag.js is fetched async, off the critical path
 *   (on a later visit: once the page has loaded and the browser is idle), and page views follow
 *   client-side navigation.
 * - Rejecting after accepting (Cookie settings in the footer): consent goes back to denied, GA4 is
 *   switched off for the rest of the visit (window['ga-disable-<id>']) and its _ga cookies are removed.
 *
 * The choice is kept in localStorage ("nexera-consent": "granted" | "denied"); where storage is
 * blocked it lasts for the visit only. Events carry no personal data: no name, phone, email or form
 * text — only which form, which kind of link and its place, product names and CTA labels.
 */
export const GA_ID = "G-3CT5021X9H";
const KEY = "nexera-consent";
const DISABLE = `ga-disable-${GA_ID}`;

let memory = null; // the choice, where localStorage is unavailable
const read = () => {
  try {
    return localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
};
const write = (v) => {
  memory = v;
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* blocked storage: kept for this visit */
  }
};

/** The visitor's choice: "granted", "denied" or null (not chosen yet). */
export const consentChoice = () => {
  const v = read();
  return v === "granted" || v === "denied" ? v : null;
};

// --- The banner's open state (a tiny store: the footer's Cookie settings reopens it) --------------
const subs = new Set();
let open = false;
const emit = () => subs.forEach((f) => f());
export const subscribeConsent = (f) => (subs.add(f), () => subs.delete(f));
export const consentOpen = () => open;
/** Shows the banner again (Cookie settings). */
export function openConsent() {
  open = true;
  emit();
}

// --- gtag --------------------------------------------------------------------------------------
function gtag() {
  // gtag.js reads the `arguments` object itself, as in Google's snippet.
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}
let loaded = false;
function load() {
  if (loaded) return;
  loaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  gtag("js", new Date());
  // Page views are sent by pageView() on every route; no ad features.
  gtag("config", GA_ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
  pageView();
}
const granted = () => consentChoice() === "granted" && loaded && !window[DISABLE];

/** Records the choice from the banner. */
export function setConsent(choice) {
  write(choice);
  open = false;
  emit();
  if (typeof window === "undefined") return;
  if (choice === "granted") {
    window[DISABLE] = false;
    gtag("consent", "update", { analytics_storage: "granted" });
    load();
  } else {
    gtag("consent", "update", { analytics_storage: "denied" });
    if (loaded) window[DISABLE] = true; // nothing more is sent this visit
    clearGaCookies();
  }
}

function clearGaCookies() {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (!/^_ga(_|$)/.test(name)) continue;
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
  }
}

/** Sends an event (only with consent; otherwise nothing happens). `params` must hold no personal data. */
export function track(name, params = {}) {
  if (granted()) gtag("event", name, params);
}

/** A page view for the current URL (after the route's title is in place). */
export function pageView() {
  if (!granted()) return;
  setTimeout(() => gtag("event", "page_view", { page_location: location.href, page_path: location.pathname + location.search, page_title: document.title }), 120);
}

/** A successful enquiry: which form only ("callback" | "full" | "partner" | "quick"). */
export const trackLead = (formSource) => track("generate_lead", { form_source: formSource });

// --- Clicks: calls, emails, WhatsApp, the mobile bar's Enquire, datasheet requests, Solutions /
// Products CTAs (one listener) ---------------------------------------------------------------------
const placement = (a) => (a.closest("[data-mobile-bar]") ? "mobile_bar" : a.closest("header") ? "header" : a.closest("footer") ? "footer" : a.closest(".cb-dock, [role='dialog']") ? "callback" : "page");
const CTA = /\b(Explore|View all|Browse)\b[^·\n]*/i;
function onClick(e) {
  const a = e.target instanceof Element && e.target.closest("a[href]");
  if (!a) return;
  const href = a.getAttribute("href") || "";
  if (href.startsWith("tel:")) return track("click_call", { link_placement: placement(a) });
  if (href.startsWith("mailto:")) return track("click_email", { link_placement: placement(a) });
  if (/^https:\/\/wa\.me\//.test(href)) return track("click_whatsapp", { link_placement: placement(a) });
  if (a.dataset.track === "click_enquire") return track("click_enquire", { link_placement: placement(a) });
  const text = (a.getAttribute("aria-label") || a.textContent || "").replace(/\s+/g, " ").trim();
  let url;
  try {
    url = new URL(href, location.href);
  } catch {
    return;
  }
  if (url.origin !== location.origin) return;
  // Datasheet / brochure requests: the catalogue's request links (/#contact?…&doc=<product>) and any
  // "Request / Download Datasheet" link.
  const doc = new URLSearchParams(url.hash.split("?")[1] || "").get("doc") || url.searchParams.get("doc");
  if (doc || /\b(Request|Download) (Datasheet|Brochure)\b/i.test(text)) {
    return track("datasheet_request", { item_name: doc || "", link_text: text.slice(0, 60) });
  }
  if (/^\/(solutions|products)(\/|$|\?)/.test(url.pathname) && CTA.test(text)) {
    track("explore_click", { link_text: text.match(CTA)[0].trim().slice(0, 60), link_url: url.pathname + url.search });
  }
}

/** Runs once at start-up (main.jsx): the Consent Mode default, the click listener, and GA4 on a later
 * visit with consent given (after load + idle, so it never competes with the first screen). */
export function initAnalytics() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  document.addEventListener("click", onClick, { capture: true, passive: true });
  if (consentChoice() !== "granted") return;
  const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1));
  const go = () => idle(() => setConsent("granted"), { timeout: 3000 });
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
}
