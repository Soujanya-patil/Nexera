// End-to-end checks of the site-wide call-back widget against the built site on php -S (real endpoint,
// local SMTP sink). Usage: MAILS=<mails.log> node cb.mjs http://127.0.0.1:8800 [--shots] [--nudge-timer]
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2];
const SHOTS = process.argv.includes("--shots");
const TIMER = process.argv.includes("--nudge-timer");
const MAILS = process.env.MAILS;
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const results = [];
const check = (name, cond, extra = "") => {
  results.push(!!cond);
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra !== "" ? ` — ${typeof extra === "string" ? extra : JSON.stringify(extra)}` : ""}`);
};
const mails = () => (fs.existsSync(MAILS) ? fs.readFileSync(MAILS, "utf8").split("----- MESSAGE -----").filter((m) => m.trim()) : []);
const subjectOf = (m) => {
  const s = m.match(/Subject: =\?UTF-8\?B\?([^?]+)\?=/);
  return s ? Buffer.from(s[1], "base64").toString("utf8") : "";
};

async function newPage(w, h, { reduced = false } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: reduced ? "reduce" : "no-preference", deviceScaleFactor: w < 500 ? 2 : 1, hasTouch: w < 500 });
  const p = await ctx.newPage();
  p.errors = [];
  p.on("console", (m) => m.type() === "error" && !/#418|ERR_FAILED/.test(m.text()) && p.errors.push(m.text().slice(0, 140)));
  p.on("pageerror", (e) => p.errors.push(e.message.slice(0, 140)));
  await p.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  return p;
}
const ready = (p) => p.waitForSelector(".cb-dock", { state: "attached", timeout: 8000 });
const pill = (p) => p.locator(".cb-dock > button[aria-haspopup]");
const card = (p) => p.locator('[role="dialog"][aria-labelledby]').filter({ hasText: "Get a call back" });
const pillShown = (p) => p.evaluate(() => {
  const d = document.querySelector(".cb-dock");
  return !!d && getComputedStyle(d).opacity === "1" && !d.inert;
});
const scrollTo = (p, y) => p.evaluate((y) => window.scrollTo(0, typeof y === "number" ? y : eval(y)), y);
const settle = (p, ms = 700) => p.waitForTimeout(ms);

for (const [W, H] of [
  [1440, 900],
  [390, 844],
]) {
  const tag = `@${W}`;

  // ---- visibility rules ---------------------------------------------------------------------------
  {
    const p = await newPage(W, H);
    await p.goto(BASE + "/", { waitUntil: "load" });
    const inHtml = await p.evaluate(() => document.querySelector(".cb-dock") !== null);
    await ready(p);
    await settle(p);
    const atTop = await pillShown(p);
    await scrollTo(p, "document.querySelector('[data-home-hero]').getBoundingClientRect().bottom + scrollY - 200");
    await settle(p);
    const heroPartly = await pillShown(p);
    await scrollTo(p, "document.querySelector('[data-home-hero]').getBoundingClientRect().bottom + scrollY + 40");
    await settle(p, 300);
    const ring = await p.evaluate(() => !!document.querySelector(".cb-ring"));
    await settle(p);
    const past = await pillShown(p);
    check(`${tag} home: not pre-rendered; hidden over the hero, appears once the hero has scrolled out`, !inHtml && !atTop && !heroPartly && past, { inHtml, atTop, heroPartly, past });
    check(`${tag} home: one pulse ring as it first appears`, ring);
    // #contact on screen → steps aside.
    await p.waitForSelector("#contact", { timeout: 8000 });
    await scrollTo(p, "document.getElementById('contact').getBoundingClientRect().top + scrollY - 100");
    await settle(p);
    const atContact = await pillShown(p);
    await scrollTo(p, "document.getElementById('contact').getBoundingClientRect().top + scrollY - innerHeight - 400");
    await settle(p);
    const back = await pillShown(p);
    check(`${tag} home: hidden while #contact is on screen, back above it`, !atContact && back, { atContact, back });
    const name = await pill(p).evaluate((n) => ({ name: n.textContent.trim(), exp: n.getAttribute("aria-expanded") }));
    check(`${tag} pill: accessible name "Get a call back", aria-expanded=false`, name.name === "Get a call back" && name.exp === "false", name);
    // Pill + nudge screenshot comes later (nudge block).
    const cls = await p.evaluate(() => window.__cls);
    check(`${tag} CLS 0 on the homepage through scrolling and the widget`, cls === 0, cls);
    check(`${tag} no console errors (home)`, p.errors.length === 0, p.errors);
    await p.context().close();
  }
  {
    const p = await newPage(W, H);
    await p.goto(BASE + "/about", { waitUntil: "load" });
    await ready(p);
    await settle(p);
    const top = await pillShown(p);
    await scrollTo(p, 250);
    await settle(p);
    const at250 = await pillShown(p);
    await scrollTo(p, 340);
    await settle(p);
    const at340 = await pillShown(p);
    check(`${tag} other pages: appears after 300px of scroll`, !top && !at250 && at340, { top, at250, at340 });
    await p.context().close();
  }
  {
    const p = await newPage(W, H);
    await p.goto(BASE + "/contact", { waitUntil: "load" });
    await ready(p);
    await scrollTo(p, 400);
    await settle(p);
    const formVisible = await p.evaluate(() => {
      const r = document.querySelector("#main form").getBoundingClientRect();
      return r.top < innerHeight && r.bottom > 0;
    });
    const shownOverForm = await pillShown(p);
    await scrollTo(p, "document.documentElement.scrollHeight");
    await settle(p);
    const formGone = await p.evaluate(() => document.querySelector("#main form").getBoundingClientRect().bottom < 0);
    const shownBelow = await pillShown(p);
    await settle(p, 1200);
    const nudgeOnContact = await p.evaluate(() => !!document.querySelector(".cb-nudge"));
    check(`${tag} /contact: hidden while the page's form is on screen; never a nudge there`, formVisible && !shownOverForm && (!formGone || shownBelow) && !nudgeOnContact, { formVisible, shownOverForm, formGone, shownBelow, nudgeOnContact });
    await p.context().close();
  }

  // ---- compare trays: the pill sits above them --------------------------------------------------------
  for (const [url, pick] of [
    ["/solutions/commercial-industrial", async (p) => {
      const boxes = p.getByRole("checkbox", { name: /^Compare/ });
      for (let i = 0; i < 2; i++) {
        await boxes.nth(i).scrollIntoViewIfNeeded();
        await boxes.nth(i).evaluate((n) => n.click());
      }
    }],
    ["/products", async (p) => {
      const btns = p.locator("button[aria-pressed]").filter({ hasText: "Compare" });
      await btns.nth(0).scrollIntoViewIfNeeded();
      await btns.nth(0).click();
    }],
  ]) {
    const p = await newPage(W, H);
    await p.goto(BASE + url, { waitUntil: "load" });
    await ready(p);
    await pick(p);
    await settle(p, 900);
    const r = await p.evaluate(() => {
      const trays = [...document.querySelectorAll("div.fixed.inset-x-0.bottom-0")].filter((d) => d.getAttribute("aria-hidden") !== "true" && getComputedStyle(d).opacity === "1");
      const t = trays[0]?.firstElementChild?.getBoundingClientRect();
      const b = document.querySelector(".cb-dock > button").getBoundingClientRect();
      const d = document.querySelector(".cb-dock");
      const seg = document.querySelector('nav[aria-label="Solutions segments"]');
      const s = seg && seg.getAttribute("aria-hidden") !== "true" ? seg.getBoundingClientRect() : null;
      return {
        tray: !!t,
        trayTop: t && Math.round(t.top),
        pillBottom: Math.round(b.bottom),
        pillShown: getComputedStyle(d).opacity === "1",
        clearOfSeg: !s || b.top > s.bottom,
      };
    });
    check(`${tag} ${url}: with the compare tray shown, the pill sits above it (no overlap)`, r.tray && r.pillShown && r.pillBottom <= r.trayTop && r.clearOfSeg, r);
    if (SHOTS) await p.screenshot({ path: `cb-tray-${url.split("/").pop()}-${W}.png` });
    await p.context().close();
  }

  // ---- open, focus, keyboard, Esc, outside click ------------------------------------------------------
  {
    const p = await newPage(W, H);
    await p.goto(BASE + "/about", { waitUntil: "load" });
    await ready(p);
    await scrollTo(p, 600);
    await settle(p);
    await pill(p).click();
    await card(p).waitFor();
    await settle(p, 700);
    const st = await p.evaluate(() => {
      const c = document.querySelector('[role="dialog"][aria-modal="true"]');
      const r = c.getBoundingClientRect();
      const b = document.querySelector(".cb-dock > button").getBoundingClientRect();
      return {
        exp: document.querySelector(".cb-dock > button").getAttribute("aria-expanded"),
        focus: document.activeElement.name,
        w: Math.round(r.width),
        above: r.bottom <= b.top + 1,
        sheet: Math.round(r.bottom) === innerHeight && Math.round(r.width) === innerWidth,
        op: getComputedStyle(c).opacity,
        chips: c.querySelectorAll('[role="radiogroup"] input[type="radio"]').length,
        label: document.getElementById(c.getAttribute("aria-labelledby")).textContent,
      };
    });
    const layoutOk = W > 500 ? st.w === 360 && st.above : st.sheet;
    check(`${tag} open: dialog "Get a call back", aria-expanded=true, focus on Name, 4 chips, ${W > 500 ? "360px card above the pill" : "bottom sheet"}`, st.exp === "true" && st.focus === "name" && st.chips === 4 && st.op === "1" && layoutOk && st.label === "Get a call back", st);
    if (SHOTS) await p.screenshot({ path: `cb-open-${W}.png` });
    // Focus trap.
    await p.keyboard.press("Shift+Tab");
    const fromName = await p.evaluate(() => document.activeElement.getAttribute("aria-label"));
    await p.keyboard.press("Shift+Tab");
    const wrapped = await p.evaluate(() => document.activeElement.textContent.trim());
    await p.keyboard.press("Tab");
    const wrappedBack = await p.evaluate(() => document.activeElement.getAttribute("aria-label"));
    check(`${tag} keyboard: focus stays in the card (wraps ✕ ↔ full-form link)`, fromName === "Close" && wrapped === "Prefer the full form? ↓" && wrappedBack === "Close", { fromName, wrapped, wrappedBack });
    // Esc closes; focus returns to the pill.
    await p.keyboard.press("Escape");
    await settle(p, 500);
    const esc = await p.evaluate(() => ({ open: !!document.querySelector('[role="dialog"][aria-modal="true"]'), focusPill: document.activeElement === document.querySelector(".cb-dock > button"), exp: document.querySelector(".cb-dock > button").getAttribute("aria-expanded") }));
    check(`${tag} Esc closes; focus back on the pill; aria-expanded=false`, !esc.open && esc.focusPill && esc.exp === "false", esc);
    // Keyboard open (Enter on the pill), then Space-toggle close via the pill.
    await p.keyboard.press("Enter");
    await card(p).waitFor();
    await settle(p, 300);
    const kOpen = await p.evaluate(() => document.activeElement.name);
    await p.keyboard.press("Escape");
    await settle(p, 500);
    check(`${tag} keyboard: Enter on the pill opens with focus in the card`, kOpen === "name", kOpen);
    // Outside click / scrim tap closes.
    await pill(p).click();
    await card(p).waitFor();
    await settle(p, 600);
    await p.mouse.click(40, 160);
    await settle(p, 500);
    const outside = await p.evaluate(() => !!document.querySelector('[role="dialog"][aria-modal="true"]'));
    check(`${tag} a click outside (scrim on phones) closes it`, !outside);
    check(`${tag} no console errors (open/close)`, p.errors.length === 0, p.errors);
    await p.context().close();
  }

  // ---- validation, error, success ------------------------------------------------------------------
  {
    const p = await newPage(W, H);
    await p.goto(BASE + "/about", { waitUntil: "load" });
    await ready(p);
    await scrollTo(p, 600);
    await settle(p);
    await pill(p).click();
    await card(p).waitFor();
    await settle(p, 600);
    let posted = 0;
    p.on("request", (r) => r.url().includes("/api/contact.php") && posted++);
    await card(p).getByRole("button", { name: "Get a call back" }).click();
    await settle(p, 200);
    const errs = await p.evaluate(() => {
      const c = document.querySelector('[role="dialog"][aria-modal="true"]');
      return [...c.querySelectorAll('p[aria-live="polite"]')].map((n) => n.textContent.trim());
    });
    const focus = await p.evaluate(() => document.activeElement.name);
    check(`${tag} empty submit: three errors (aria-live), focus on Name, nothing sent`, errs.filter(Boolean).length === 3 && focus === "name" && posted === 0, { errs, focus });
    await card(p).locator('[name="name"]').fill("Asha Rao");
    await card(p).locator('[name="mobile"]').fill("+91 98450 12345");
    await card(p).locator("label.contact-chip", { hasText: "Business / C&I" }).click();
    await settle(p, 100);
    const cleared = await p.evaluate(() => [...document.querySelectorAll('[role="dialog"] p[aria-live="polite"]')].every((n) => !n.textContent.trim()));
    check(`${tag} errors clear live as the fields are fixed`, cleared);
    // Endpoint down.
    await p.route("**/api/contact.php", async (r) => {
      await new Promise((res) => setTimeout(res, 900));
      await r.abort();
    });
    await card(p).getByRole("button", { name: "Get a call back" }).click();
    await card(p).getByRole("button", { name: "Sending…" }).waitFor({ timeout: 4000 });
    await card(p).getByRole("alert").waitFor({ timeout: 8000 });
    const e = await p.evaluate(() => {
      const c = document.querySelector('[role="dialog"][aria-modal="true"]');
      return { text: c.querySelector('[role="alert"]').textContent.trim(), vals: ["name", "mobile"].map((n) => c.querySelector(`[name="${n}"]`).value), chip: c.querySelector('input[name="interest"]:checked')?.value };
    });
    check(`${tag} endpoint down: "Couldn't send. Please try again." with the values kept`, e.text === "Couldn’t send. Please try again." && e.vals.join("|") === "Asha Rao|+91 98450 12345" && e.chip === "ci", e);
    if (SHOTS) await p.screenshot({ path: `cb-error-${W}.png` });
    // Success (real endpoint).
    await p.unroute("**/api/contact.php");
    const before = mails().length;
    let body = null;
    p.on("request", (r) => r.url().includes("/api/contact.php") && (body = JSON.parse(r.postData())));
    await card(p).getByRole("button", { name: "Get a call back" }).click();
    await card(p).getByText("Thank you, Asha.").waitFor({ timeout: 8000 });
    const t0 = Date.now();
    await settle(p, 900);
    const ok = await p.evaluate(() => {
      const c = document.querySelector('[role="dialog"][aria-modal="true"]');
      return { text: c.querySelector('[role="status"]').innerText.replace(/\s+/g, " ").trim(), check: !!c.querySelector(".contact-check"), focus: document.activeElement.textContent.trim().slice(0, 14) };
    });
    check(`${tag} success: check + "Thank you, Asha. We'll call you on +91 98450 12345."`, ok.text === "Thank you, Asha. We’ll call you on +91 98450 12345." && ok.check && ok.focus === "Thank you, Ash", ok);
    if (SHOTS) await p.screenshot({ path: `cb-success-${W}.png` });
    await p.waitForTimeout(Math.max(0, 3300 - (Date.now() - t0)));
    const stillOpen = await p.evaluate(() => !!document.querySelector('[role="dialog"][aria-modal="true"]'));
    await p.waitForTimeout(1500);
    const closed = await p.evaluate(() => ({ open: !!document.querySelector('[role="dialog"][aria-modal="true"]'), focusPill: document.activeElement === document.querySelector(".cb-dock > button") }));
    check(`${tag} success: closes by itself after 4 s, focus back on the pill`, stillOpen && !closed.open && closed.focusPill, { stillOpen, ...closed });
    const got = mails().slice(before);
    check(`${tag} request source "quick"; email "Call-back request: Business / C&I – Asha Rao"`, body?.source === "quick" && got.length === 1 && subjectOf(got[0]) === "Call-back request: Business / C&I – Asha Rao", { source: body?.source, n: got.length, subj: got[0] && subjectOf(got[0]) });
    // Reopen: a fresh form.
    await pill(p).click();
    await card(p).waitFor();
    const fresh = await p.evaluate(() => document.querySelector('[role="dialog"] [name="name"]').value);
    check(`${tag} reopened after a success: a fresh, empty form`, fresh === "", fresh);
    check(`${tag} no console errors (send)`, p.errors.length === 0, p.errors);
    await p.context().close();
  }

  // ---- the nudge: once per session ------------------------------------------------------------------
  {
    const p = await newPage(W, H);
    await p.goto(BASE + "/how-it-works", { waitUntil: "load" });
    await ready(p);
    // Past the 300px start point, but well short of half-way.
    await scrollTo(p, "Math.max(320, (document.documentElement.scrollHeight - innerHeight) * 0.3)");
    await settle(p, 1500);
    const early = await p.evaluate(() => ({ nudge: !!document.querySelector(".cb-nudge"), ratio: +(scrollY / (document.documentElement.scrollHeight - innerHeight)).toFixed(2) }));
    await scrollTo(p, "(document.documentElement.scrollHeight - innerHeight) * 0.55");
    await settle(p, 900);
    const n = await p.evaluate(() => {
      const el = document.querySelector(".cb-nudge");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const b = document.querySelector(".cb-dock > button").getBoundingClientRect();
      const overlap = !(r.right <= b.left || r.left >= b.right || r.bottom <= b.top || r.top >= b.bottom);
      return { text: el.innerText.replace(/\s+/g, " ").trim(), inView: r.left >= 0 && r.top >= 0 && r.right <= innerWidth, overlapPill: overlap, w: Math.round(r.width) };
    });
    check(`${tag} nudge: appears at half-way, beside the pill, not before`, !early.nudge && early.ratio < 0.5 && n && n.text === "Need help choosing a battery? We’ll call you." && n.inView && !n.overlapPill, { early, n });
    if (SHOTS) await p.screenshot({ path: `cb-nudge-${W}.png` });
    await p.getByRole("button", { name: "Dismiss" }).click();
    await settle(p, 300);
    const gone = await p.evaluate(() => !document.querySelector(".cb-nudge"));
    // Same session: another page (client-side) and a reload — no nudge again.
    await p.evaluate(() => {
      history.pushState({}, "", "/about");
      dispatchEvent(new PopStateEvent("popstate"));
    });
    await settle(p, 1200);
    await scrollTo(p, "(document.documentElement.scrollHeight - innerHeight) * 0.6");
    await settle(p, 1200);
    const again1 = await p.evaluate(() => !!document.querySelector(".cb-nudge"));
    await p.reload({ waitUntil: "load" });
    await ready(p);
    await scrollTo(p, "(document.documentElement.scrollHeight - innerHeight) * 0.6");
    await settle(p, 1500);
    const again2 = await p.evaluate(() => !!document.querySelector(".cb-nudge"));
    check(`${tag} nudge: ✕ dismisses; never again in the session (other page, reload)`, gone && !again1 && !again2, { gone, again1, again2 });
    await p.context().close();
  }
}

// ---- nudge by time (25 s) ----------------------------------------------------------------------------
if (TIMER) {
  const p = await newPage(1440, 900);
  await p.goto(BASE + "/how-it-works", { waitUntil: "load" });
  await ready(p);
  await scrollTo(p, "Math.max(320, (document.documentElement.scrollHeight - innerHeight) * 0.3)");
  await p.waitForTimeout(20000);
  const at20 = await p.evaluate(() => !!document.querySelector(".cb-nudge"));
  await p.waitForTimeout(7000);
  const at27 = await p.evaluate(() => !!document.querySelector(".cb-nudge"));
  check("nudge: after ~25 s on the page without scrolling half-way", !at20 && at27, { at20, at27 });
  await p.context().close();
}

// ---- reduced motion: no pulse, no spring -------------------------------------------------------------
{
  const p = await newPage(1440, 900, { reduced: true });
  await p.goto(BASE + "/about", { waitUntil: "load" });
  await ready(p);
  await scrollTo(p, 600);
  await p.waitForTimeout(150);
  const ring = await p.evaluate(() => !!document.querySelector(".cb-ring"));
  await pill(p).click();
  await card(p).waitFor();
  await p.waitForTimeout(30);
  const s = await p.evaluate(() => {
    const c = document.querySelector('[role="dialog"][aria-modal="true"]');
    const cs = getComputedStyle(c);
    return { op: cs.opacity, tf: cs.transform };
  });
  check("reduced motion: no pulse ring; the card appears at once (no spring)", !ring && s.op === "1" && (s.tf === "none" || s.tf === "matrix(1, 0, 0, 1, 0, 0)"), { ring, ...s });
  await p.context().close();
}

// ---- "Prefer the full form? ↓" from another page lands on the homepage's #contact --------------------
{
  const p = await newPage(1440, 900);
  await p.goto(BASE + "/about", { waitUntil: "load" });
  await ready(p);
  await scrollTo(p, 600);
  await p.waitForTimeout(600);
  await pill(p).click();
  await card(p).waitFor();
  await p.waitForTimeout(500);
  await card(p).getByRole("link", { name: "Prefer the full form? ↓" }).click();
  await p.waitForTimeout(3000);
  const r = await p.evaluate(() => ({ path: location.pathname, hash: location.hash, top: document.getElementById("contact") && Math.round(document.getElementById("contact").getBoundingClientRect().top), open: !!document.querySelector('[role="dialog"][aria-modal="true"]') }));
  check('"Prefer the full form? ↓" from /about → / at #contact (top 64), card closed', r.path === "/" && Math.abs(r.top - 64) <= 3 && !r.open, r);
  await p.context().close();
}

// ---- the bottom contact form still sends source "full" -------------------------------------------------
{
  const p = await newPage(1440, 900);
  const before = mails().length;
  await p.goto(BASE + "/#contact", { waitUntil: "load" });
  await p.waitForTimeout(1500);
  let body = null;
  p.on("request", (r) => r.url().includes("/api/contact.php") && (body = JSON.parse(r.postData())));
  const c = p.locator("#contact form");
  await c.locator('[name="name"]').fill("Ravi Kumar");
  await c.locator('[name="mobile"]').fill("9876543210");
  await c.locator("label.contact-chip", { hasText: "Home storage" }).click();
  await c.getByRole("button", { name: "Send enquiry" }).click();
  await p.locator("#contact").getByText("Thank you, Ravi.").waitFor({ timeout: 8000 });
  await p.waitForTimeout(500);
  const got = mails().slice(before);
  check('bottom #contact form unchanged: source "full", "New website enquiry: Home storage – Ravi Kumar"', body?.source === "full" && got.length === 1 && subjectOf(got[0]) === "New website enquiry: Home storage – Ravi Kumar", { source: body?.source, subj: got[0] && subjectOf(got[0]) });
  await p.context().close();
}

await b.close();
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
