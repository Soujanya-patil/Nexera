// The app-fallback safeguards: on phones the header's links instead of the dead menu button (fallback
// and no JavaScript); forms switched off with a note, never submitted (no details in the URL). And
// nothing changes when the app works. Usage: node fallbackui.mjs http://127.0.0.1:8810
import { chromium } from "playwright-core";

const BASE = process.argv[2];
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const results = [];
const check = (name, cond, extra = "") => {
  results.push(!!cond);
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra !== "" ? ` — ${typeof extra === "string" ? extra : JSON.stringify(extra)}` : ""}`);
};
// The simulated start-up failure (as in startfail.mjs): creating an IntersectionObserver throws.
const breakApp = () => {
  const Real = window.IntersectionObserver;
  window.IntersectionObserver = class extends Real {
    constructor() {
      throw new Error("simulated start-up failure");
    }
  };
};
async function open(path, { W = 390, H = 844, broken = false, js = true } = {}) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: W < 500, hasTouch: W < 500, javaScriptEnabled: js });
  const p = await ctx.newPage();
  p.posts = [];
  p.on("request", (r) => r.url().includes("/api/contact.php") && p.posts.push(r.url()));
  if (broken) await p.addInitScript(breakApp);
  await p.goto(BASE + path, { waitUntil: "load" });
  await p.waitForTimeout(js ? 3500 : 500);
  return p;
}
const header = (p) =>
  p.evaluate(() => {
    const vis = (el) => !!el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().width > 0;
    const toggle = document.querySelector("[data-nav-toggle]");
    const links = [...document.querySelectorAll("[data-nav-links] a, [data-nav-cta] a")].map((a) => {
      const r = a.getBoundingClientRect();
      return { href: a.getAttribute("href"), h: Math.round(r.height), inView: r.left >= 0 && r.right <= innerWidth + 0.5, shown: vis(a) };
    });
    const hdr = document.querySelector("header").getBoundingClientRect();
    const main = document.querySelector("main")?.getBoundingClientRect();
    return {
      failed: document.documentElement.hasAttribute("data-app-error"),
      toggleShown: vis(toggle),
      links,
      headerH: Math.round(hdr.height),
      mainBelowHeader: main ? Math.round(main.top) >= Math.round(hdr.bottom) - 1 : null,
      overflowX: document.documentElement.scrollWidth - innerWidth,
    };
  });

// ---- 1. Mobile navigation ---------------------------------------------------------------------------
for (const path of ["/", "/products", "/contact"]) {
  const p = await open(path, { broken: true });
  const h = await header(p);
  const allShown = h.links.length === 7 && h.links.every((l) => l.shown && l.inView && l.h >= 44);
  check(`fallback ${path} @390: menu button hidden; the 5 links + Contact shown in the header, in view, ≥44px; no sideways scroll; content below the header`, h.failed && !h.toggleShown && allShown && h.overflowX <= 0 && h.mainBelowHeader, h);
  if (path === "/products") {
    await p.locator('[data-nav-links] a[href="/about"]').click();
    await p.waitForURL((u) => u.pathname === "/about");
    await p.waitForTimeout(1500);
    check("fallback @390: a header link opens its page", new URL(p.url()).pathname === "/about" && (await p.locator("h1").count()) === 1, p.url());
  }
  await p.context().close();
}
{
  const p = await open("/products", { js: false });
  const h = await header(p);
  check("no JavaScript @390: menu button hidden, the links + Contact shown (≥44px, in view)", !h.toggleShown && h.links.length === 7 && h.links.every((l) => l.shown && l.inView && l.h >= 44) && h.overflowX <= 0, h);
  await p.context().close();
}
{
  const p = await open("/products", { W: 1366, H: 900, broken: true });
  const h = await header(p);
  check("fallback @1366: desktop header as usual (links + Contact in one 64px row, no menu button)", h.failed && !h.toggleShown && h.headerH <= 66 && h.links.length === 7 && h.links.every((l) => l.shown), h);
  await p.context().close();
}
{
  const p = await open("/products");
  const h = await header(p);
  await p.locator("[data-nav-toggle]").click();
  await p.waitForTimeout(400);
  const opened = await p.evaluate(() => ({ exp: document.querySelector("[data-nav-toggle]").getAttribute("aria-expanded"), panelLinks: [...document.querySelectorAll("header a")].filter((a) => a.getBoundingClientRect().height > 0 && !a.closest("[data-nav-links]") && !a.closest("[data-nav-cta]")).length }));
  check("app working @390: unchanged — menu button shown, header links hidden, the menu opens", !h.failed && h.toggleShown && h.links.every((l) => !l.shown) && h.headerH <= 66 && opened.exp === "true" && opened.panelLinks >= 5, { ...h, opened });
  await p.context().close();
}

// Sticky header: scrolls away in the phone fallback (it is taller), stays stuck otherwise.
// (the waiting is done here, not in the page: with JavaScript off, page timers never fire)
const headerTopAfterScroll = async (p) => {
  await p.evaluate(() => window.scrollTo(0, 700));
  await p.waitForTimeout(500);
  return p.evaluate(() => Math.round(document.querySelector("header").getBoundingClientRect().top));
};
for (const [label, opts, expectStuck] of [
  ["fallback @390", { broken: true }, false],
  ["no JavaScript @390", { js: false }, false],
  ["fallback @1366", { W: 1366, H: 900, broken: true }, true],
  ["app working @390", {}, true],
]) {
  const p = await open("/products", opts);
  const top = await headerTopAfterScroll(p);
  check(`${label}: header ${expectStuck ? "stays stuck to the top" : "scrolls away"} after scrolling`, expectStuck ? top === 0 || top === -8 : top < -100, { top });
  await p.context().close();
}

// ---- 2. Forms -----------------------------------------------------------------------------------------
const formState = (p) =>
  p.evaluate(() =>
    [...document.querySelectorAll("#root form")].map((f) => {
      const note = f.firstElementChild;
      return {
        note: note?.classList.contains("app-fallback-note") ? note.textContent : null,
        noteShown: note ? note.getBoundingClientRect().height > 0 && getComputedStyle(note).visibility !== "hidden" : false,
        describedBy: f.getAttribute("aria-describedby") === note?.id,
        controls: f.elements.length,
        disabled: [...f.elements].filter((e) => e.disabled).length,
      };
    })
  );
for (const [path, W] of [
  ["/", 390],
  ["/", 1366],
  ["/contact", 390],
  ["/contact", 1366],
]) {
  const p = await open(path, { W, H: W < 500 ? 844 : 900, broken: true });
  const forms = await formState(p);
  const ok = forms.length >= 1 && forms.every((f) => /^This form can’t be sent right now\. (Please call \+91[\d ]+, or reload|Please reload) the page and try again\.$/.test(f.note ?? "") && f.noteShown && f.describedBy && f.controls > 0 && f.disabled === f.controls);
  check(`fallback ${path} @${W}: every form (${forms.length}) disabled, with the note first (visible, aria-describedby)`, ok, forms);
  // Try hard to submit: requestSubmit, a forced click on the button, Enter in a field — nothing leaves.
  const before = p.url();
  await p.evaluate(() => document.querySelectorAll("#root form").forEach((f) => f.requestSubmit()));
  await p.locator('#root form button[type="submit"]').first().click({ force: true }).catch(() => {});
  await p.locator("#root form input").first().press("Enter").catch(() => {});
  await p.waitForTimeout(1200);
  check(`fallback ${path} @${W}: no submission — URL unchanged (no form values in it), nothing sent`, p.url() === before && !p.url().includes("?") && p.posts.length === 0, { before, after: p.url(), posts: p.posts });
  await p.context().close();
}
{
  // The note is read before the fields (first in the form), and the disabled controls are announced as such.
  const p = await open("/contact", { broken: true });
  const snap = await p.locator("#root form").first().ariaSnapshot();
  check("fallback /contact: accessibility tree — the note first, then the controls marked disabled", /^- paragraph:(\s*- text:)?\s*This form can’t be sent right now/.test(snap.trim().replace(/\n\s*/g, " ")) && /\[disabled\]/.test(snap), snap.split("\n").slice(0, 6).join(" | "));
  await p.context().close();
}
{
  const p = await open("/contact");
  const forms = await formState(p);
  check("app working /contact: forms unchanged — no note, nothing disabled", forms.length >= 1 && forms.every((f) => f.note === null && f.disabled === 0), forms);
  await p.context().close();
}
// ---- 3. No JavaScript at all: forms post (never details in the URL), with the <noscript> note ---------
const NOSCRIPT = "This form needs JavaScript. Please enable it and reload the page.";
for (const path of ["/", "/contact", "/become-a-partner"]) {
  const p = await open(path, { js: false });
  const s = await p.evaluate(() =>
    [...document.querySelectorAll("#root form")].map((f) => {
      const note = [...f.querySelectorAll("p.app-fallback-note")][0];
      return { method: f.getAttribute("method"), note: note?.textContent, shown: note ? note.getBoundingClientRect().height > 0 : false, firstInForm: f.firstElementChild?.tagName };
    })
  );
  check(`no JavaScript ${path}: form method="post", the note shown first in the form`, s.length === 1 && s.every((f) => f.method === "post" && f.note === NOSCRIPT && f.shown && f.firstInForm === "NOSCRIPT"), s);
  // Submit it for real: the browser posts; nothing lands in the URL.
  const form = p.locator("#root form").first();
  const text = form.locator('input[type="text"], input:not([type])').first();
  if (await text.count()) await text.fill("Ravi Kumar");
  const [resp] = await Promise.all([p.waitForNavigation({ timeout: 8000 }).catch(() => null), form.evaluate((f) => f.submit())]);
  const after = p.url();
  check(`no JavaScript ${path}: submitting posts — the URL carries no form values`, !after.includes("?") && !after.includes("Ravi") && resp?.request().method() === "POST", { after, method: resp?.request().method(), status: resp?.status() });
  await p.context().close();
}
{
  const p = await open("/contact");
  const shown = await p.evaluate(() => [...document.querySelectorAll("#root form noscript")].map((n) => n.getBoundingClientRect().height));
  check("app working /contact: the <noscript> note is not shown", shown.length === 1 && shown[0] === 0, shown);
  await p.context().close();
}

await b.close();
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
