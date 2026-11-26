// The app's start after the first paint (scripts/seo-pages.mjs boot): it starts on every page, after the
// first contentful paint; the site works (homepage hero video, menu, client-side navigation); both
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

// ---- Homepage: hero video plays; the menu opens and closes (phone) -----------------------------------
for (const [W, H] of [
  [1440, 900],
  [390, 844],
]) {
  const p = await page(W, H);
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.waitForTimeout(4500);
  const v = await p.evaluate(() =>
    [...document.querySelectorAll("main video, video")].map((v) => ({ src: (v.currentSrc || v.getAttribute("src") || "").split("/").pop(), t: +v.currentTime.toFixed(2), paused: v.paused, ready: v.readyState }))
  );
  const playing = v.filter((x) => x.src && x.t > 0.3 && !x.paused);
  check(`/ @${W}: the hero video plays (${W > 500 ? "desktop" : "mobile"} footage)`, playing.length >= 1 && (W > 500 ? !/mobile/.test(playing[0].src) : /mobile/.test(playing[0].src)), v);
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
  check(`/ @${W}: no console errors (video / menu)`, p.errors.length === 0, p.errors);
  await p.context().close();
}

// ---- Homepage hero playback rules (desktop hover, phone tap) -------------------------------------------
// A hover (desktop) or tap (phone) plays the cycle from the start when it is at rest; hovering, clicking
// or tapping again while it plays never restarts it; leaving lets it play to the end; it then rests on
// the closed frame (no loop), and the next hover / tap plays it again from the start. "At rest": both
// clips paused, the opening rewound, the closing clip hidden.
for (const [W, H, touch] of [
  [1440, 900, false],
  [390, 844, true],
]) {
  const p = await page(W, H);
  await p.goto(BASE + "/", { waitUntil: "load" });
  const st = () => p.evaluate(() => { const [o, c] = document.querySelectorAll("[data-home-hero] video"); return { o: +o.currentTime.toFixed(2), op: o.paused, cp: c.paused, cv: c.style.opacity }; });
  const atRest = async (ms = 30000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const s = await st(); if (s.op && s.cp && s.o === 0 && s.cv !== "1") return true; await p.waitForTimeout(100); } return false; };
  const box = await p.locator('[data-home-hero] [tabindex="0"][aria-label]').boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const leave = () => p.mouse.move(5, 5, { steps: 3 });
  const enter = async () => { await leave(); await p.mouse.move(cx, cy, { steps: 3 }); };
  const trigger = touch ? () => p.touchscreen.tap(cx, cy) : enter;
  const how = touch ? "a tap" : "hovering";
  const rest0 = await atRest();
  // The very first moment of rest, with no extra wait: the trigger must not be lost.
  await trigger();
  await p.waitForTimeout(700);
  const s1 = await st();
  const b2 = (await st()).o;
  if (touch) await trigger(); else await enter();
  await p.waitForTimeout(500);
  const s2 = await st();
  const b3 = s2.o;
  if (touch) await p.touchscreen.tap(cx, cy); else await p.mouse.click(cx, cy);
  await p.waitForTimeout(500);
  const s3 = await st();
  if (!touch) await leave();
  const rest1 = await atRest();
  await p.waitForTimeout(1200);
  const s4 = await st();
  await trigger();
  await p.waitForTimeout(700);
  const s5 = await st();
  check(`/ @${W}: hero — at rest, ${how} plays the video from the start (also at the first moment of rest)`, rest0 && !s1.op && s1.o > 0 && s1.o < 1.5, { rest0, s1 });
  check(`/ @${W}: hero — ${how} again while it plays does not restart it`, !s2.op && s2.o > b2, { b2, s2 });
  check(`/ @${W}: hero — ${touch ? "a second tap" : "a click"} while it plays does not restart it`, !s3.op && s3.o > b3, { b3, s3 });
  check(`/ @${W}: hero — ${touch ? "left alone" : "after the mouse leaves"} it plays to the end and rests on the closed frame (no loop)`, rest1 && s4.op && s4.cp && s4.o === 0, { rest1, s4 });
  check(`/ @${W}: hero — after the end, the next ${touch ? "tap" : "hover"} plays it again from the start`, !s5.op && s5.o > 0 && s5.o < 1.5, s5);
  check(`/ @${W}: no console errors (hero playback)`, p.errors.length === 0, p.errors);
  await p.context().close();
}

// The end of a cycle, exactly: a tap 20 ms after the closing clip ends (while the cycle is still settling
// back to rest) is not dropped — it plays the cycle again from the start.
{
  const p = await page(390, 844);
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.evaluate(() => {
    const c = document.querySelectorAll("[data-home-hero] video")[1];
    const stage = document.querySelector('[data-home-hero] [tabindex="0"][aria-label]');
    c.addEventListener("ended", () => setTimeout(() => { stage.dispatchEvent(new PointerEvent("pointerup", { pointerType: "touch", bubbles: true })); window.__tapped = 1; }, 20), { once: true });
  });
  const t0 = Date.now();
  while (Date.now() - t0 < 30000 && !(await p.evaluate(() => window.__tapped === 1))) await p.waitForTimeout(100);
  await p.waitForTimeout(1200);
  const s = await p.evaluate(() => { const o = document.querySelector("[data-home-hero] video"); return { o: +o.currentTime.toFixed(2), playing: !o.paused }; });
  check("/ @390: hero — a tap just as the video ends replays it from the start (not dropped)", s.playing && s.o > 0 && s.o < 2, s);
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
