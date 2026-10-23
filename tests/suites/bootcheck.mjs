// The app's start after the first paint (scripts/seo-pages.mjs boot): it starts on every page, after the
// first contentful paint; the site works (homepage hero showcase, menu, client-side navigation); both
// fallbacks start it (no paint timing → after the first frame; no paint entry → the 1.5 s timer).
// Usage: node bootcheck.mjs http://127.0.0.1:8810
import { chromium } from "playwright-core";

const BASE = process.argv[2];
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const results = [];
const check = (name, cond, extra = "") => {
  results.push(!!cond);
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra !== "" ? ` — ${typeof extra === "string" ? extra : JSON.stringify(extra)}` : ""}`);
};
async function page(W, H, init) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: W < 500, isMobile: W < 500 });
  const p = await ctx.newPage();
  p.errors = [];
  p.on("pageerror", (e) => p.errors.push(e.message.slice(0, 160)));
  p.on("console", (m) => m.type() === "error" && p.errors.push(m.text().slice(0, 160)));
  if (init) await p.addInitScript(init);
  return p;
}
const timing = (p) =>
  p.evaluate(() => {
    const fcp = performance.getEntriesByType("paint").find((e) => e.name === "first-contentful-paint")?.startTime;
    const app = performance.getEntriesByType("resource").find((e) => /\/assets\/index-[^/]+\.js$/.test(e.name));
    return { fcp: Math.round(fcp ?? -1), app: Math.round(app?.startTime ?? -1) };
  });
// Hydrated = a client-side navigation keeps the window (no document reload).
const spaNav = async (p, click) => {
  await p.evaluate(() => (window.__sameDoc = 1));
  await click();
  await p.waitForTimeout(1200);
  return p.evaluate(() => ({ path: location.pathname, sameDoc: window.__sameDoc === 1 }));
};

// ---- Every gated page: the app starts after the first contentful paint, and the page works -------------
for (const path of ["/", "/resources", "/resources/what-is-bess", "/solutions/commercial-industrial", "/products"]) {
  for (const [W, H] of [
    [1440, 900],
    [390, 844],
  ]) {
    const p = await page(W, H);
    await p.goto(BASE + path, { waitUntil: "load" });
    await p.waitForTimeout(2500);
    const t = await timing(p);
    const nav =
      W > 500
        ? await spaNav(p, () => p.locator('nav a[href="/about"]').first().click())
        : await spaNav(p, async () => {
            await p.getByRole("button", { name: "Open menu" }).click();
            await p.waitForTimeout(300);
            await p.locator('nav ~ div a[href="/about"], header div a[href="/about"]').first().click();
          });
    check(`${path} @${W}: app starts after the first contentful paint, hydrates (client-side nav to /about)`, t.fcp > 0 && t.app >= t.fcp && t.app < 1500 && nav.path === "/about" && nav.sameDoc, { ...t, ...nav });
    check(`${path} @${W}: no console errors`, p.errors.length === 0, p.errors);
    await p.context().close();
  }
}

// ---- Homepage: hero showcase (first product shown, the others added after load, no video); the menu ----
for (const [W, H] of [
  [1440, 900],
  [390, 844],
]) {
  const p = await page(W, H);
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.waitForTimeout(4500);
  const hero = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll("[data-home-hero] figure img")];
    return {
      products: imgs.length,
      loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
      shown: imgs.findIndex((i) => +getComputedStyle(i).opacity > 0.99),
      videos: document.querySelectorAll("[data-home-hero] video").length,
    };
  });
  check(`/ @${W}: the hero showcase is ready (first product shown, all ${hero.products} loaded after load, no video)`, hero.products >= 2 && hero.loaded === hero.products && hero.shown === 0 && hero.videos === 0, hero);
  if (W < 500) {
    const btn = p.getByRole("button", { name: "Open menu" });
    await btn.click();
    await p.waitForTimeout(300);
    const opened = await p.evaluate(() => ({ exp: document.querySelector('nav button[aria-expanded]')?.getAttribute("aria-expanded"), links: [...document.querySelectorAll("nav ~ div a, header div.lg\\:hidden a")].filter((a) => a.getBoundingClientRect().height > 0).length }));
    await p.getByRole("button", { name: "Close menu" }).click();
    await p.waitForTimeout(300);
    const closed = await p.evaluate(() => document.querySelector('nav button[aria-expanded]')?.getAttribute("aria-expanded"));
    check("/ @390: menu opens (links shown) and closes", opened.exp === "true" && opened.links >= 4 && closed === "false", { ...opened, closed });
  } else {
    const nav = await spaNav(p, () => p.locator('nav a[href="/products"]').first().click());
    check("/ @1440: menu links navigate client-side", nav.path === "/products" && nav.sameDoc, nav);
  }
  check(`/ @${W}: no console errors (hero / menu)`, p.errors.length === 0, p.errors);
  await p.context().close();
}

// ---- Fallbacks ----------------------------------------------------------------------------------------
{
  // A browser without paint timing: starts after the first frame.
  const p = await page(1440, 900, () => Object.defineProperty(PerformanceObserver, "supportedEntryTypes", { get: () => ["resource"] }));
  await p.goto(BASE + "/resources", { waitUntil: "load" });
  await p.waitForTimeout(2000);
  const t = await timing(p);
  const nav = await spaNav(p, () => p.locator('nav a[href="/about"]').first().click());
  check("fallback, no paint timing: the app starts after the first frame (< 1.5 s) and works", t.app >= 0 && t.app < 1400 && nav.sameDoc && nav.path === "/about", { ...t, ...nav });
  await p.context().close();
}
{
  // A paint entry that never arrives (e.g. a background tab): the 1.5 s timer starts it.
  const p = await page(1440, 900, () => {
    const Real = window.PerformanceObserver;
    window.PerformanceObserver = class {
      static get supportedEntryTypes() {
        return Real.supportedEntryTypes;
      }
      constructor(cb) {
        this.cb = cb;
        this.real = new Real(cb);
      }
      observe(o) {
        if (o.type !== "paint") this.real.observe(o);
      }
      disconnect() {
        this.real.disconnect();
      }
    };
  });
  await p.goto(BASE + "/resources", { waitUntil: "load" });
  await p.waitForTimeout(2600);
  const t = await timing(p);
  const nav = await spaNav(p, () => p.locator('nav a[href="/about"]').first().click());
  check("fallback, no paint entry: the 1.5 s timer starts the app, and it works", t.app >= 1450 && t.app < 2200 && nav.sameDoc && nav.path === "/about", { ...t, ...nav });
  await p.context().close();
}

await b.close();
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
