// Cookie consent + GA4 (lib/analytics, components/ConsentBanner). Every request to Google is
// intercepted and answered locally with an empty script (nothing leaves the machine), and counted.
// Checks: nothing is requested before a choice or after "Reject" (also after reload / navigation);
// "Accept" loads gtag.js for G-3CT5021X9H with Consent Mode v2 (default denied → update granted);
// page views follow navigation; click_call, explore_click, datasheet_request and generate_lead are
// queued with no personal data; Cookie settings reopens the banner; rejecting later stops all requests;
// the banner causes no layout shift and, on phones, sits above the bottom action bar; the bar's
// Call / WhatsApp / Enquire events are sent only with consent.
// Usage: node consent.mjs <apache base> <php base>   (the PHP server takes the form submission)
import { chromium } from "playwright-core";
const BASE = process.argv[2] ?? "http://127.0.0.1:8810";
const PHP = process.argv[3] ?? "http://127.0.0.1:8800";
const ID = "G-3CT5021X9H";
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
const results = [];
const check = (n, c, x = "") => {
  results.push(!!c);
  console.log(`${c ? "PASS" : "FAIL"} ${n}${x !== "" ? " — " + JSON.stringify(x).slice(0, 400) : ""}`);
};
const GOOGLE = /googletagmanager\.com|google-analytics\.com|analytics\.google\.com|doubleclick\.net|www\.google\.com\/(ccm|g\/collect)/;

async function context(W = 1440, { consent } = {}) {
  const mobile = W < 500;
  const ctx = await b.newContext({ viewport: { width: W, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile });
  ctx.google = [];
  await ctx.route(GOOGLE, (r) => {
    ctx.google.push(r.request().url());
    r.fulfill({ status: 200, contentType: "application/javascript", body: "/* stub */" });
  });
  await ctx.addInitScript((c) => {
    if (c) localStorage.setItem("nexera-consent", c);
    window.__shifts = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__shifts += e.value))).observe({ type: "layout-shift", buffered: true });
  }, consent ?? null);
  return ctx;
}
const banner = (p) => p.locator('section[aria-labelledby="consent-title"]');
const dl = (p) => p.evaluate(() => (window.dataLayer || []).map((a) => JSON.parse(JSON.stringify(Array.from(a)))));
const events = async (p, name) => (await dl(p)).filter((a) => a[0] === "event" && a[1] === name).map((a) => a[2] || {});
const clientNav = (p, to) => p.evaluate((to) => { history.pushState({}, "", to); dispatchEvent(new PopStateEvent("popstate")); }, to);

// ---- Before a choice -----------------------------------------------------------------------------
{
  const ctx = await context();
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "load" });
  await banner(p).waitFor({ state: "visible", timeout: 12000 });
  await p.waitForTimeout(800);
  const s = await p.evaluate(() => {
    const sec = document.querySelector('section[aria-labelledby="consent-title"]');
    const [acc, rej] = [...sec.querySelectorAll("button")];
    const st = (el) => { const c = getComputedStyle(el); return [c.backgroundColor, c.color, c.borderColor, c.fontSize, c.fontWeight, Math.round(el.getBoundingClientRect().height)].join(" "); };
    const r = sec.getBoundingClientRect();
    return { text: sec.querySelector("p").textContent.trim(), acc: acc.textContent.trim(), rej: rej.textContent.trim(), same: acc.className === rej.className && st(acc) === st(rej), link: sec.querySelector("a")?.getAttribute("href"), fixed: getComputedStyle(sec).position, inView: r.bottom <= innerHeight && r.left >= 0, shifts: window.__shifts };
  });
  check("banner: the message, Accept and Reject styled exactly alike, a privacy link (/contact), fixed at the bottom", s.text.startsWith("We use cookies to understand how visitors use our site.") && s.acc === "Accept" && s.rej === "Reject" && s.same && s.link === "/contact" && s.fixed === "fixed" && s.inView, s);
  check("banner: no layout shift (CLS 0)", s.shifts === 0, s.shifts);
  const d = await dl(p);
  check("before a choice: no request to Google; Consent Mode default denied in the dataLayer", ctx.google.length === 0 && d.some((a) => a[0] === "consent" && a[1] === "default" && a[2].analytics_storage === "denied" && a[2].ad_storage === "denied" && a[2].ad_user_data === "denied" && a[2].ad_personalization === "denied"), { google: ctx.google, first: d[0] });

  // ---- Reject ----------------------------------------------------------------------------------
  await banner(p).getByRole("button", { name: "Reject" }).click();
  await p.waitForTimeout(600);
  const gone = !(await banner(p).isVisible());
  const stored = await p.evaluate(() => localStorage.getItem("nexera-consent"));
  await clientNav(p, "/products");
  await p.waitForTimeout(1500);
  await p.reload({ waitUntil: "load" });
  await p.waitForTimeout(4500);
  const again = await banner(p).isVisible();
  check("Reject: banner closes, choice remembered, no banner after reload, still no request to Google", gone && stored === "denied" && !again && ctx.google.length === 0, { gone, stored, again, google: ctx.google });
  // Cookie settings reopens it, with keyboard focus on it.
  await p.locator("[data-cookie-settings]").click();
  await banner(p).waitFor({ state: "visible", timeout: 8000 });
  const focus = await p.evaluate(() => document.activeElement?.getAttribute("aria-labelledby"));
  check("footer Cookie settings reopens the banner (focus moves to it)", focus === "consent-title", focus);
  await banner(p).getByRole("button", { name: "Reject" }).click();
  await p.waitForTimeout(800);
  check("Reject again: still nothing requested from Google", ctx.google.length === 0, ctx.google);
  await ctx.close();
}

// ---- Accept --------------------------------------------------------------------------------------
{
  const ctx = await context();
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "load" });
  await banner(p).waitFor({ state: "visible", timeout: 12000 });
  const before = ctx.google.length;
  await banner(p).getByRole("button", { name: "Accept" }).click();
  await p.waitForTimeout(1200);
  const d = await dl(p);
  const tagReq = ctx.google.find((u) => u.includes("/gtag/js") && u.includes(`id=${ID}`));
  const upd = d.findIndex((a) => a[0] === "consent" && a[1] === "update" && a[2].analytics_storage === "granted");
  const cfg = d.findIndex((a) => a[0] === "config" && a[1] === ID);
  check("Accept: gtag.js requested for G-3CT5021X9H (async), consent updated to granted before config, ad signals not granted", before === 0 && !!tagReq && upd >= 0 && cfg > upd && !d.some((a) => a[0] === "consent" && a[1] === "update" && a[2].ad_storage === "granted"), { before, tagReq, upd, cfg });
  const async = await p.evaluate((id) => [...document.scripts].find((s) => s.src.includes(id))?.async, ID);
  check("gtag.js is an async script", async === true, async);
  check("page_view sent for the page", (await events(p, "page_view")).some((e) => e.page_path === "/"), await events(p, "page_view"));

  // explore_click: a Home solution card CTA.
  await p.evaluate(() => {
    const a = [...document.querySelectorAll('a[href^="/solutions/"]')].find((x) => /Explore/.test(x.textContent));
    a.addEventListener("click", (e) => e.preventDefault(), { once: true });
    a.click();
  });
  const ex = await events(p, "explore_click");
  check("explore_click on a Solutions CTA (label and path, nothing else)", ex.length === 1 && /^Explore/.test(ex[0].link_text) && ex[0].link_url.startsWith("/solutions/"), ex);

  // click_call: the footer phone link (navigation prevented).
  await p.evaluate(() => {
    const a = document.querySelector('footer a[href^="tel:"]');
    a.addEventListener("click", (e) => e.preventDefault(), { once: true });
    a.click();
  });
  const calls = await events(p, "click_call");
  check("click_call on a tel: link, without the number", calls.length === 1 && calls[0].link_placement === "footer" && !JSON.stringify(calls).match(/\d{6,}/), calls);

  // Navigation → page_view; datasheet_request from a catalogue card.
  await clientNav(p, "/products");
  await p.waitForSelector('a[href*="doc="]', { timeout: 10000 });
  await p.waitForTimeout(800);
  check("page_view follows client-side navigation", (await events(p, "page_view")).some((e) => e.page_path === "/products"), await events(p, "page_view"));
  await p.evaluate(() => {
    const a = document.querySelector('a[href*="doc="]');
    a.addEventListener("click", (e) => e.preventDefault(), { once: true });
    a.click();
  });
  const ds = await events(p, "datasheet_request");
  check("datasheet_request with the product name", ds.length === 1 && ds[0].item_name.length > 0, ds);
  const mail = await p.evaluate(() => !!document.querySelector('a[href^="mailto:"]'));
  if (mail) {
    await p.evaluate(() => {
      const a = document.querySelector('a[href^="mailto:"]');
      a.addEventListener("click", (e) => e.preventDefault(), { once: true });
      a.click();
    });
    const em = await events(p, "click_email");
    check("click_email on a mailto: link, without the address", em.length === 1 && !JSON.stringify(em).includes("@"), em);
  }

  // A later visit: no banner; GA4 loads again on its own, after load.
  const n = ctx.google.length;
  await p.reload({ waitUntil: "load" });
  await p.waitForTimeout(4500);
  check("later visit: no banner, gtag.js loads after the page has loaded", !(await banner(p).isVisible()) && ctx.google.slice(n).some((u) => u.includes("/gtag/js")), ctx.google.slice(n));

  // Reject from Cookie settings: switched off, nothing more requested.
  await p.locator("[data-cookie-settings]").click();
  await banner(p).getByRole("button", { name: "Reject" }).click();
  await p.waitForTimeout(500);
  const m = ctx.google.length;
  await clientNav(p, "/about");
  await p.waitForTimeout(1500);
  const off = await p.evaluate((id) => window[`ga-disable-${id}`] === true, ID);
  const lastPv = (await events(p, "page_view")).some((e) => e.page_path === "/about");
  await p.reload({ waitUntil: "load" });
  await p.waitForTimeout(4500);
  check("Reject after Accept: GA4 switched off, no page view and no request to Google afterwards (also after reload)", off && !lastPv && ctx.google.length === m, { off, lastPv, after: ctx.google.slice(m) });
  await ctx.close();
}

// ---- generate_lead (the /contact form, on the PHP server) -----------------------------------------
{
  const ctx = await context(1440, { consent: "granted" });
  const p = await ctx.newPage();
  await p.goto(PHP + "/contact", { waitUntil: "load" });
  await p.waitForTimeout(4000);
  const who = { name: "Consent Test", email: "consent.test@example.com", mobile: "98765 43210" };
  await p.fill("#name", who.name);
  await p.fill("#email", who.email);
  await p.fill("#mobile", who.mobile);
  await p.selectOption("#enquiry_type", "ci");
  await p.fill("#message", "Analytics consent test enquiry, please ignore.");
  await p.waitForTimeout(3200);
  await p.click('form button[type="submit"]');
  await p.waitForSelector("text=Message received.", { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500);
  const leads = await events(p, "generate_lead");
  const all = JSON.stringify(await dl(p));
  const pii = [who.name, who.email, "98765", "9876543210", "Analytics consent"].filter((v) => all.includes(v));
  check("generate_lead on a successful submit (form_source full), no personal data anywhere in the dataLayer", leads.length === 1 && leads[0].form_source === "full" && !pii.length, { leads, pii });
  await ctx.close();
}

// ---- Phones: fits, and sits above the bottom action bar (MobileBar; no call-back pill there) ---------
{
  const ctx = await context(390);
  const p = await ctx.newPage();
  await p.goto(BASE + "/about", { waitUntil: "load" });
  await banner(p).waitFor({ state: "visible", timeout: 12000 });
  await p.evaluate(() => scrollTo(0, 500));
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const s = document.querySelector('section[aria-labelledby="consent-title"]').getBoundingClientRect();
    const bar = document.querySelector("[data-mobile-bar]").getBoundingClientRect();
    return { sTop: Math.round(s.top), sBottom: Math.round(s.bottom), sL: Math.round(s.left), sR: Math.round(s.right), barTop: Math.round(bar.top), pill: !!document.querySelector(".cb-dock"), hscroll: document.documentElement.scrollWidth > innerWidth, shifts: window.__shifts };
  });
  check("390: banner inside the screen and above the bottom bar (never under it), no pill, no sideways scroll, CLS 0", r.sL >= 0 && r.sR <= 390 && r.sBottom <= r.barTop && !r.pill && !r.hscroll && r.shifts === 0, r);
  // Without consent, the bar's buttons send nothing.
  for (const sel of ['[data-mobile-bar] a[href^="tel:"]', '[data-mobile-bar] a[href^="https://wa.me/"]', '[data-mobile-bar] a[data-track="click_enquire"]']) {
    await p.evaluate((sel) => { const a = document.querySelector(sel); a.addEventListener("click", (e) => e.preventDefault(), { once: true }); a.click(); }, sel);
  }
  const none = (await dl(p)).filter((a) => a[0] === "event").length;
  check("390: before a choice the bar's Call / WhatsApp / Enquire queue no events and nothing is requested from Google", none === 0 && ctx.google.length === 0, { events: none, google: ctx.google });
  await ctx.close();
}
{
  const ctx = await context(390, { consent: "granted" });
  const p = await ctx.newPage();
  await p.goto(BASE + "/products/tcl-blueark-x5", { waitUntil: "load" });
  await p.waitForTimeout(4500);
  for (const sel of ['[data-mobile-bar] a[href^="tel:"]', '[data-mobile-bar] a[href^="https://wa.me/"]', '[data-mobile-bar] a[data-track="click_enquire"]']) {
    await p.evaluate((sel) => { const a = document.querySelector(sel); a.addEventListener("click", (e) => e.preventDefault(), { once: true }); a.click(); }, sel);
  }
  const [call, wa, enq] = await Promise.all(["click_call", "click_whatsapp", "click_enquire"].map((n) => events(p, n)));
  const all = JSON.stringify([call, wa, enq]);
  check("390 with consent: click_call, click_whatsapp and click_enquire from the bar (link_placement mobile_bar), no number or message in them", call.length === 1 && wa.length === 1 && enq.length === 1 && [call[0], wa[0], enq[0]].every((e) => e.link_placement === "mobile_bar") && !/\d{6,}|interested/i.test(all), { call, wa, enq });
  await ctx.close();
}

console.log(`${results.filter(Boolean).length}/${results.length} passed`);
await b.close();
process.exit(results.every(Boolean) ? 0 : 1);
