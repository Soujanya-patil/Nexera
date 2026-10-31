// The /products hero rotation (ProductsHeroStage): pre-rendered / no-JS state, auto-advance with the
// count-up, hover pause, partner-list jump, product links, keyboard, the pause button, hidden tab,
// reduced motion, phones (tabs, 44 px targets, no sideways scroll), late images, layout shift.
// Usage: node productshero.mjs <base>
import { chromium } from "playwright-core";

const BASE = process.argv[2];
const b = await chromium.launch({ channel: "chrome" });
let fails = 0;
let total = 0;
const check = (name, ok, info) => {
  total++;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : " — " + JSON.stringify(info)}`);
};
const IDS = ["tcl-blueark-x5", "hithium-power-cabinet-1022", "clou-aqua-c25s"];
const NAMES = ["BlueArk X5", "∞Power 1022 kWh Cabinet", "Aqua C2.5S"];
const FIGS = ["100 kWh", "1022 kWh", "2.089 MWh"];
const HERO = "[data-products-hero]";

async function page(W, { touch = false, reduce = false, js = true } = {}) {
  const ctx = await b.newContext({ viewport: { width: W, height: touch ? 844 : 900 }, isMobile: touch, hasTouch: touch, deviceScaleFactor: touch ? 2 : 1, reducedMotion: reduce ? "reduce" : "no-preference", javaScriptEnabled: js });
  const p = await ctx.newPage();
  p.errors = [];
  p.on("pageerror", (e) => p.errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && p.errors.push(m.text().slice(0, 160)));
  await p.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__cls += e.value))).observe({ type: "layout-shift", buffered: true });
    // Every figure text shown on the active slide, frame by frame.
    window.__figs = [];
    const tick = () => {
      const f = document.querySelector('[data-products-hero] .ph-slide[data-state="on"] .ph-info p[class*="text-accent"] [aria-hidden] .inline-grid > :last-child');
      if (f && window.__figs.at(-1) !== f.textContent) window.__figs.push(f.textContent);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await p.goto(BASE + "/products", { waitUntil: "load" });
  if (js) await p.waitForSelector(`${HERO}[data-ready]`, { timeout: 15000 });
  if (!touch) await p.mouse.move(2, 600); // away from the stage
  return p;
}
const state = (p) =>
  p.evaluate((HERO) => {
    const h = document.querySelector(HERO);
    const slides = [...h.querySelectorAll(".ph-slide")];
    const on = slides.findIndex((s) => s.dataset.state === "on");
    const visible = slides.map((s) => getComputedStyle(s).visibility === "visible" && getComputedStyle(s.querySelector(".ph-prod")).opacity !== "0");
    const tabs = [...h.querySelectorAll("[role=tab]")];
    return {
      on,
      visible,
      selected: tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"),
      counter: h.querySelector("p.tabular-nums")?.textContent.trim(),
      live: h.querySelector("[aria-live]")?.textContent,
      liveMode: h.querySelector("[aria-live]")?.getAttribute("aria-live"),
      rotating: h.hasAttribute("data-rotating"),
      paused: h.hasAttribute("data-paused"),
      pause: [...h.querySelectorAll('button[aria-label$="product rotation"]')].find((x) => getComputedStyle(x).visibility === "visible")?.getAttribute("aria-label") ?? null,
      inert: slides.map((s) => s.hasAttribute("inert")),
      focus: document.activeElement?.getAttribute("role") === "tab" ? tabs.indexOf(document.activeElement) : document.activeElement?.tagName,
    };
  }, HERO);

// 1. Pre-rendered HTML (as served): product 1 on, all three product links, products 2 and 3 without an
//    image yet, product 1's image eager and high priority; the page's own head and h1 unchanged.
{
  const html = await (await fetch(BASE + "/products")).text();
  const hero = html.slice(html.indexOf("data-products-hero"), html.indexOf('id="catalogue"'));
  const links = IDS.every((id) => hero.includes(`href="/products/${id}"`));
  const imgs = (hero.match(/<img [^>]*>/g) || []).map((t) => t.match(/src="([^"]+)"/)?.[1] ?? "");
  check(
    "pre-rendered: all three product links in the hero; only product 1's image (×2 with its reflection), eager + fetchpriority=high",
    links && imgs.length === 2 && imgs.every((s) => s.includes("tcl-blueark-x5")) && /<img [^>]*fetchpriority="high"[^>]*tcl-blueark-x5|<img [^>]*tcl-blueark-x5[^>]*fetchpriority="high"/i.test(hero),
    { links, imgs }
  );
  check(
    "pre-rendered: slide 1 on, slides 2 and 3 inert; name + figure of product 1 in the markup",
    /data-state="on"/.test(hero) && (hero.match(/inert=""/g) || []).length === 2 && hero.includes(">BlueArk X5<") && hero.includes(">100 kWh<"),
    { on: /data-state="on"/.test(hero), inert: (hero.match(/inert=""/g) || []).length }
  );
  check(
    "page head unchanged: title, description, canonical, JSON-LD, h1",
    html.includes("<title>") && html.includes('rel="canonical" href="https://nexerapower.com/products"') && html.includes("application/ld+json") && /<h1[^>]*>.*Energy Storage,.*Built to Scale\..*<\/h1>/s.test(html),
    {}
  );
}

// 2. No JavaScript: product 1 shown with its name, figure and link; nothing hidden by script.
{
  const p = await page(1440, { js: false });
  const r = await p.evaluate((HERO) => {
    const h = document.querySelector(HERO);
    const s = h.querySelector('.ph-slide[data-state="on"]');
    const vis = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.visibility === "visible" && r.width > 0; };
    const name = [...s.querySelectorAll("a")].find((a) => a.textContent.includes("BlueArk X5"));
    const img = s.querySelector(".ph-prod img:not(.-scale-y-100)");
    return {
      name: name && vis(name) ? name.getAttribute("href") : null,
      fig: s.querySelector(".sr-only")?.textContent,
      img: img ? img.complete && img.naturalWidth > 0 && vis(img) : false,
      prodOpacity: getComputedStyle(s.querySelector(".ph-prod")).opacity,
      links: [...h.querySelectorAll('a[href^="/products/"]')].map((a) => a.getAttribute("href")),
    };
  }, HERO);
  check("no JS: product 1 visible (image, name link, figure); all three product links in the page", r.name === "/products/tcl-blueark-x5" && r.fig === "100 kWh" && r.img && r.prodOpacity === "1" && IDS.every((id) => r.links.includes(`/products/${id}`)), r);
  await p.context().close();
}

// 3. Auto-advance (1440): ~4.4 s per product, in order, looping; the figure counts up from 0; the
//    counter and live region follow; the live region is off while rotating on its own.
{
  const p = await page(1440);
  const s0 = await state(p);
  check("@1440: starts on product 1, rotating, live region off while rotating", s0.on === 0 && s0.selected === 0 && s0.rotating && !s0.paused && s0.liveMode === "off" && s0.counter === "01 / 03" && s0.pause === "Pause product rotation", s0);
  await p.waitForTimeout(4900);
  const s1 = await state(p);
  check("@1440: after ~4.4 s → product 2 (tab, counter, slide)", s1.on === 1 && s1.selected === 1 && s1.counter === "02 / 03" && s1.visible[1] && s1.inert[0] && !s1.inert[1], s1);
  await p.waitForTimeout(1500); // the count (1 s) has ended
  const figs1 = await p.evaluate(() => window.__figs.slice());
  check("@1440: product 2's figure counted up from 0 to 1022", figs1.includes("0") && figs1.at(-1) === "1022" && figs1.filter((f) => /^\d+$/.test(f) && +f > 0 && +f < 1022).length >= 5, figs1);
  await p.waitForTimeout(2900);
  const s2 = await state(p);
  await p.waitForTimeout(4400);
  const s3 = await state(p);
  const figs = await p.evaluate(() => window.__figs.slice());
  check("@1440: → product 3, then loops back to product 1", s2.on === 2 && s3.on === 0, { s2: s2.on, s3: s3.on });
  check("@1440: product 3's figure counted to 2.089 (three decimals throughout)", figs.includes("0.000") && figs.includes("2.089") && figs.filter((f) => /^\d\.\d{3}$/.test(f)).length >= 5, figs.filter((f) => f.includes(".")).slice(0, 8));
  const cls = await p.evaluate(() => window.__cls);
  check("@1440: layout shift 0 over load + a full loop", cls === 0, { cls });
  const bad = await p.evaluate((HERO) => [...document.querySelectorAll(`${HERO} source, ${HERO} img`)].map((e) => e.getAttribute("srcset") || e.getAttribute("src")).filter((s) => !s || /undefined/.test(s)), HERO);
  check("@1440: every image source in the hero resolves (no undefined URLs in a srcset)", bad.length === 0, bad);
  check("@1440: no page or console errors (no failed image requests)", p.errors.length === 0, p.errors);
  await p.context().close();
}

// 4. Hover pauses (the bar stops where it is); leaving resumes.
{
  const p = await page(1440);
  await p.waitForTimeout(1500);
  await p.locator(`${HERO} .ph-slide[data-state="on"] .ph-prod a`).hover();
  const a = await state(p);
  const fill1 = await p.evaluate((HERO) => getComputedStyle(document.querySelector(`${HERO} [aria-selected=true] .ph-fill`)).transform, HERO);
  await p.waitForTimeout(5500);
  const b2 = await state(p);
  const fill2 = await p.evaluate((HERO) => getComputedStyle(document.querySelector(`${HERO} [aria-selected=true] .ph-fill`)).transform, HERO);
  check("hover: rotation paused (same product after 5.5 s, bar frozen), live region polite", a.paused && b2.on === 0 && fill1 === fill2 && b2.liveMode === "polite", { a: a.paused, on: b2.on, fill1, fill2, live: b2.liveMode });
  await p.mouse.move(2, 600);
  await p.waitForTimeout(3600);
  const c = await state(p);
  check("hover: leaving resumes (moves on within the rest of the 4.4 s)", !c.paused && c.on === 1, c);
  await p.context().close();
}

// 5. Partner list: click jumps (and announces); clicking the product or its name opens its page.
{
  const p = await page(1440);
  await p.locator(`${HERO} [role=tab]`, { hasText: "CLOU" }).click();
  await p.mouse.move(2, 600);
  await p.waitForTimeout(1200);
  const s = await state(p);
  check("click CLOU: product 3 shown, tab selected, counter 03, live text", s.on === 2 && s.selected === 2 && s.counter === "03 / 03" && s.visible[2] && !s.visible[0] && s.live === "CLOU Aqua C2.5S, 2.089 MWh", s);
  await p.locator(`${HERO} [role=tab]`, { hasText: "Hithium" }).hover();
  await p.locator(`${HERO} [role=tab]`, { hasText: "Hithium" }).click();
  await p.waitForTimeout(1200);
  const h = await state(p);
  check("click Hithium (pointer over the carousel): product 2, live region polite and announcing it", h.on === 1 && h.liveMode === "polite" && h.live === "Hithium ∞Power 1022 kWh Cabinet, 1022 kWh", h);
  await p.locator(`${HERO} .ph-slide[data-state="on"] .ph-prod a`).click();
  await p.waitForURL((u) => u.pathname === "/products/hithium-power-cabinet-1022", { timeout: 8000 }).catch(() => {});
  check("click the product image → its product page", new URL(p.url()).pathname === "/products/hithium-power-cabinet-1022", p.url());
  await p.goBack();
  await p.waitForSelector(`${HERO}[data-ready]`);
  await p.waitForTimeout(500);
  await p.locator(`${HERO} .ph-slide[data-state="on"] .ph-info a`).click();
  await p.waitForURL((u) => u.pathname.startsWith("/products/") && u.pathname !== "/products", { timeout: 8000 }).catch(() => {});
  check("click the product name → its product page", /^\/products\/(tcl-blueark-x5|hithium-power-cabinet-1022|clou-aqua-c25s)$/.test(new URL(p.url()).pathname), p.url());
  await p.context().close();
}

// 6. Keyboard: the product name is focusable; tabs use arrows / Home / End (focus + selection move
//    together), Enter works; a visible focus ring; keyboard focus inside pauses the rotation.
{
  const p = await page(1440);
  await p.locator("h1").click();
  const order = [];
  for (let i = 0; i < 12; i++) {
    await p.keyboard.press("Tab");
    const f = await p.evaluate((HERO) => {
      const a = document.activeElement;
      if (!a.closest(HERO)) return null;
      const cs = getComputedStyle(a);
      return { tag: a.tagName, role: a.getAttribute("role"), text: (a.getAttribute("aria-label") || a.textContent).trim(), ring: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2 };
    }, HERO);
    if (f) order.push(f);
    if (order.length >= 3) break;
  }
  check("keyboard: Tab reaches the product name link, then the selected tab, then the pause button — each with a focus ring", order.length === 3 && order[0].tag === "A" && order[0].text.startsWith("BlueArk X5") && order[1].role === "tab" && order[1].text.startsWith("TCL") && order[2].text === "Pause product rotation" && order.every((o) => o.ring), order);
  await p.keyboard.press("Shift+Tab"); // back onto the tab
  const s0 = await state(p);
  check("keyboard focus inside: rotation paused, live region polite", s0.paused && s0.liveMode === "polite", s0);
  await p.keyboard.press("ArrowDown");
  await p.waitForTimeout(300);
  const s1 = await state(p);
  await p.keyboard.press("End");
  await p.waitForTimeout(300);
  const s2 = await state(p);
  await p.keyboard.press("ArrowRight"); // wraps to the first
  await p.waitForTimeout(300);
  const s3 = await state(p);
  await p.keyboard.press("ArrowUp"); // wraps to the last
  await p.waitForTimeout(300);
  const s4 = await state(p);
  await p.keyboard.press("Home");
  await p.waitForTimeout(300);
  const s5 = await state(p);
  check("keyboard: ArrowDown → 2, End → 3, ArrowRight wraps → 1, ArrowUp wraps → 3, Home → 1 (focus follows)", [s1, s2, s3, s4, s5].map((s) => `${s.on}${s.focus}`).join(",") === "11,22,00,22,00", [s1, s2, s3, s4, s5].map((s) => [s.on, s.focus]));
  // Enter on a tab: arrow away without activating is not possible (automatic), so check Enter on the selected one keeps it.
  await p.keyboard.press("Enter");
  await p.waitForTimeout(300);
  check("keyboard: Enter on the focused tab selects it", (await state(p)).on === 0, {});
  await p.waitForTimeout(5000);
  check("keyboard: still on product 1 while focus stays inside (5 s)", (await state(p)).on === 0, {});
  await p.context().close();
}

// 7. Pause button (WCAG 2.2.2): stops until pressed again; then it resumes.
{
  const p = await page(1440);
  await p.locator(`${HERO} button[aria-label="Pause product rotation"]`).click();
  await p.mouse.move(2, 600);
  const a = await state(p);
  await p.waitForTimeout(6000);
  const b2 = await state(p);
  check("pause button: stops (label → Play, not rotating, same product after 6 s, live region polite)", a.pause === "Play product rotation" && !a.rotating && b2.on === 0 && b2.liveMode === "polite", { a, b: b2.on });
  await p.locator(`${HERO} button[aria-label="Play product rotation"]`).click();
  await p.mouse.move(2, 600);
  await p.waitForTimeout(5000);
  const c = await state(p);
  check("play button: rotation resumes", c.rotating && c.pause === "Pause product rotation" && c.on === 1, c);
  await p.context().close();
}

// 8. Hidden tab: rotation pauses while the document is hidden.
{
  const p = await page(1440);
  await p.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await p.waitForTimeout(6000);
  const a = await state(p);
  await p.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await p.waitForTimeout(5000);
  const c = await state(p);
  check("hidden tab: paused while hidden (6 s, still product 1); moves on once visible again", a.paused && a.on === 0 && !c.paused && c.on === 1, { a, c });
  await p.context().close();
}

// 9. Reduced motion: no rotation, no pause button, no count; product 1 with all labels; the partner
//    list switches instantly.
{
  const p = await page(1440, { reduce: true });
  await p.waitForTimeout(6000);
  const a = await state(p);
  const anims = await p.evaluate((HERO) => document.querySelector(HERO).getAnimations({ subtree: true }).length, HERO);
  check("reduced motion: product 1 after 6 s, not rotating, no pause button, no running animations", a.on === 0 && !a.rotating && a.pause === null && anims === 0 && a.visible[0], { ...a, anims });
  await p.locator(`${HERO} [role=tab]`, { hasText: "CLOU" }).click();
  const r = await p.evaluate((HERO) => {
    const s = document.querySelectorAll(`${HERO} .ph-slide`);
    return { op: getComputedStyle(s[2].querySelector(".ph-prod")).opacity, vis: getComputedStyle(s[2]).visibility, old: getComputedStyle(s[0]).visibility, fig: window.__figs.slice(-3) };
  }, HERO);
  check("reduced motion: CLOU shows at once (no transition), figure as written (no count)", r.op === "1" && r.vis === "visible" && r.old === "hidden" && !r.fig.includes("0.000"), r);
  await p.context().close();
}

// 10. Phones (390): text first, then the stage; product fits; labels under it; three horizontal tabs
//     ≥ 44 px; pause button ≥ 44 px; no sideways scroll; layout shift 0.
{
  const p = await page(390, { touch: true });
  await p.waitForTimeout(1500);
  const r = await p.evaluate((HERO) => {
    const h = document.querySelector(HERO);
    const box = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height), r: Math.round(r.right) }; };
    const tabs = [...h.querySelectorAll("[role=tab]")].map(box);
    const s = h.querySelector('.ph-slide[data-state="on"]');
    return {
      ox: document.documentElement.scrollWidth - innerWidth,
      cta: box([...document.querySelectorAll("main button")].find((x) => x.textContent.includes("Explore Systems"))),
      prod: box(s.querySelector(".ph-prod a")),
      info: box(s.querySelector(".ph-info")),
      tabs,
      pause: box(h.querySelector('button[aria-label$="product rotation"]')),
      vw: innerWidth,
    };
  }, HERO);
  const row = r.tabs.every((t) => Math.abs(t.y - r.tabs[0].y) <= 1) && r.tabs[0].x < r.tabs[1].x && r.tabs[1].x < r.tabs[2].x;
  check("@390: stage below the text, labels under the product, product within the screen", r.prod.y > r.cta.y + r.cta.h && r.info.y >= r.prod.y + r.prod.h && r.prod.x >= 0 && r.prod.r <= r.vw, r);
  check("@390: partner list = three horizontal tabs, each ≥ 44 px tall; pause button 44×44; no sideways scroll", row && r.tabs.every((t) => t.h >= 44 && t.w >= 44) && r.pause.w >= 44 && r.pause.h >= 44 && r.ox <= 0, { tabs: r.tabs, pause: r.pause, ox: r.ox });
  await p.locator(`${HERO} [role=tab]`).nth(2).tap();
  await p.waitForTimeout(1300);
  const s = await state(p);
  check("@390: tapping a tab switches the product", s.on === 2 && s.visible[2], s);
  const cls = await p.evaluate(() => window.__cls);
  check("@390: layout shift 0", cls === 0, { cls });
  check("@390: no page or console errors (no failed image requests)", p.errors.length === 0, p.errors);
  await p.context().close();
}

// 11. Products 2 and 3 load only after the page's load event.
{
  const p = await page(1440);
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const load = performance.getEntriesByType("navigation")[0].loadEventEnd;
    // The hero's own files (AVIF in Chrome); the catalogue cards below load the plain WebP cut-outs.
    const res = performance.getEntriesByType("resource").filter((e) => /\/(tcl-blueark-x5|hithium-power-cabinet-1022|clou-aqua-c25s)-\d+-[^/]+\.avif$/.test(e.name));
    const pick = (k) => res.filter((e) => e.name.includes(k)).map((e) => Math.round(e.startTime));
    return { load: Math.round(load), x5: pick("tcl-blueark-x5"), cab: pick("hithium-power-cabinet-1022"), clou: pick("clou-aqua-c25s"), fmt: res.map((e) => e.name.split("/").pop()) };
  });
  check("images: product 1's AVIF before the load event; products 2 and 3 (AVIF) requested after it", r.x5.length >= 1 && r.x5[0] < r.load && r.cab.length >= 1 && r.clou.length >= 1 && r.cab.every((t) => t >= r.load) && r.clou.every((t) => t >= r.load), r);
  await p.context().close();
}

await b.close();
console.log(`${total - fails}/${total} passed`);
process.exit(fails ? 1 : 0);
