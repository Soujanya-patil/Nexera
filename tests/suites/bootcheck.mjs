// The app's start after the first paint (scripts/seo-pages.mjs boot): it starts on every page, after the
// first contentful paint; the site works (homepage story, /products cabinet film, menu, client-side
// navigation); both
// fallbacks start it (no paint timing → after the first frame; no paint entry → the 1.5 s timer).
// Usage: node bootcheck.mjs http://127.0.0.1:8810
import { chromium } from "playwright-core";

const BASE = process.argv[2];
// WebGL in headless Chrome is software-rendered and needs these flags, so the home story's live 3D scene
// can start at 1440.
const GL = ["--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"];
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: GL } : { channel: "chrome", args: GL });
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

// ---- Homepage: the story (no video on Home); the menu opens and closes (phone) ----------------------
// Desktop: the opening still first; the 3D scene (its own chunk) is not requested until the visitor
// first scrolls / presses a key / taps, then it loads and cross-fades in. Phone: the phone still, no 3D.
// Home no longer has (or downloads) any video: the cabinet film is on /products.
for (const [W, H] of [
  [1440, 900],
  [390, 844],
]) {
  const p = await page(W, H);
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.waitForTimeout(4500);
  const sceneEarly = await p.evaluate(() => performance.getEntriesByType("resource").some((r) => /\/assets\/scene-[^/]*\.js$/.test(r.name)));
  if (W > 500) {
    await p.mouse.wheel(0, 120);
    await p.waitForSelector("[data-day-story][data-live]", { timeout: 20000 }).catch(() => {});
  }
  const v = await p.evaluate(() => {
    const res = performance.getEntriesByType("resource").map((r) => r.name);
    return {
      still: (document.querySelector(".day-still.is-on")?.currentSrc || "").split("/").pop(),
      live: !!document.querySelector("[data-day-story][data-live]"),
      scene: res.some((n) => /\/assets\/scene-[^/]*\.js$/.test(n)),
      videos: document.querySelectorAll("video").length,
      mp4: res.filter((n) => /\.mp4/.test(n)).length,
    };
  });
  if (W > 500) check("/ @1440: story — the desktop opening still shows; no 3D until the first scroll, then the scene loads and goes live; no video on Home", /^d0-/.test(v.still) && !sceneEarly && v.live && v.scene && v.videos === 0 && v.mp4 === 0, { sceneEarly, ...v });
  else check("/ @390: story — the phone still shows; no 3D scene, no video on Home", /^m0-/.test(v.still) && !v.live && !v.scene && v.videos === 0 && v.mp4 === 0, v);
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
  check(`/ @${W}: no console errors (story / menu)`, p.errors.length === 0, p.errors);
  await p.context().close();
}

const FILM = 'section[aria-labelledby="cabinet-film-title"]';
/**
 * Scrolls the film's stage to the middle of the screen (the scroll also counts as the first interaction)
 * and waits until the page has stopped moving: the film sits below the product grid, far down the page,
 * and the site scrolls smoothly, so the stage's position (where the tests tap) is only final once the
 * scroll has settled.
 */
async function filmInView(p) {
  await p.evaluate((F) => {
    const st = document.querySelector(`${F} [tabindex="0"][aria-label]`);
    const r = st.getBoundingClientRect();
    window.scrollTo({ top: r.top + scrollY + r.height / 2 - innerHeight / 2, behavior: "instant" });
  }, FILM);
  let last = -1;
  for (let i = 0; i < 40; i++) {
    await p.waitForTimeout(150);
    const top = await p.evaluate((F) => Math.round(document.querySelector(`${F} [tabindex="0"][aria-label]`).getBoundingClientRect().top), FILM);
    if (top === last) break;
    last = top;
  }
}

// ---- /products cabinet film playback rules (desktop hover, phone tap) ----------------------------------
// (The former home hero video and its rules, now a section on /products: the film loads once the visitor
// has scrolled and plays its first cycle by itself when in view, so each test first scrolls it into view.)
// A hover (desktop) or tap (phone) plays the cycle from the start when it is at rest; hovering, clicking
// or tapping again while it plays never restarts it; leaving lets it play to the end; it then rests on
// the closed frame (no loop), and the next hover / tap plays it again from the start. "At rest": both
// clips paused, the opening rewound, the closing clip hidden.
for (const [W, H, touch] of [
  [1440, 900, false],
  [390, 844, true],
]) {
  const p = await page(W, H);
  await p.goto(BASE + "/products", { waitUntil: "load" });
  await filmInView(p);
  const st = () => p.evaluate((F) => { const [o, c] = document.querySelectorAll(`${F} video`); return { o: +o.currentTime.toFixed(2), op: o.paused, cp: c.paused, cv: c.style.opacity }; }, FILM);
  const atRest = async (ms = 30000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const s = await st(); if (s.op && s.cp && s.o === 0 && s.cv !== "1") return true; await p.waitForTimeout(100); } return false; };
  const box = await p.locator(`${FILM} [tabindex="0"][aria-label]`).boundingBox();
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
  check(`/products @${W}: film — at rest, ${how} plays the video from the start (also at the first moment of rest)`, rest0 && !s1.op && s1.o > 0 && s1.o < 1.5, { rest0, s1 });
  check(`/products @${W}: film — ${how} again while it plays does not restart it`, !s2.op && s2.o > b2, { b2, s2 });
  check(`/products @${W}: film — ${touch ? "a second tap" : "a click"} while it plays does not restart it`, !s3.op && s3.o > b3, { b3, s3 });
  check(`/products @${W}: film — ${touch ? "left alone" : "after the mouse leaves"} it plays to the end and rests on the closed frame (no loop)`, rest1 && s4.op && s4.cp && s4.o === 0, { rest1, s4 });
  check(`/products @${W}: film — after the end, the next ${touch ? "tap" : "hover"} plays it again from the start`, !s5.op && s5.o > 0 && s5.o < 1.5, s5);
  check(`/products @${W}: no console errors (film playback)`, p.errors.length === 0, p.errors);
  await p.context().close();
}

// The end of a cycle, exactly: a tap 20 ms after the closing clip ends (while the cycle is still settling
// back to rest) is not dropped — it plays the cycle again from the start.
{
  const p = await page(390, 844);
  await p.goto(BASE + "/products", { waitUntil: "load" });
  await filmInView(p);
  await p.waitForFunction((F) => document.querySelectorAll(`${F} video`)[1]?.getAttribute("src"), FILM, { timeout: 10000 }).catch(() => {});
  await p.evaluate((F) => {
    const c = document.querySelectorAll(`${F} video`)[1];
    const stage = document.querySelector(`${F} [tabindex="0"][aria-label]`);
    c.addEventListener("ended", () => setTimeout(() => { stage.dispatchEvent(new PointerEvent("pointerup", { pointerType: "touch", bubbles: true })); window.__tapped = 1; }, 20), { once: true });
  }, FILM);
  const t0 = Date.now();
  while (Date.now() - t0 < 30000 && !(await p.evaluate(() => window.__tapped === 1))) await p.waitForTimeout(100);
  await p.waitForTimeout(1200);
  const s = await p.evaluate((F) => { const o = document.querySelector(`${F} video`); return { o: +o.currentTime.toFixed(2), playing: !o.paused }; }, FILM);
  check("/products @390: film — a tap just as the video ends replays it from the start (not dropped)", s.playing && s.o > 0 && s.o < 2, s);
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
