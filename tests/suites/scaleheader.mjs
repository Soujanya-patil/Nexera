// The Solutions hub header (scale slider): pre-rendered / no-JS state, auto-play, mouse drag, label
// click, keyboard, touch drag and tap, reduced motion, the Explore links, layout shift and overflow.
// Usage: node scaleheader.mjs <base>
import { chromium } from "playwright-core";

const BASE = process.argv[2];
const b = await chromium.launch({ channel: "chrome" });
let fails = 0;
const check = (name, ok, info) => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : " — " + JSON.stringify(info)}`);
};
const H1 = "Storage built for how you'll actually use it";
const LINKS = { "Explore residential": "/solutions/residential", "Explore C&I": "/solutions/commercial-industrial", "Explore utility-scale": "/solutions/utility-scale" };

async function page(W, { touch = false, reduce = false, js = true } = {}) {
  const ctx = await b.newContext({ viewport: { width: W, height: touch ? 844 : 900 }, isMobile: touch, hasTouch: touch, reducedMotion: reduce ? "reduce" : "no-preference", javaScriptEnabled: js });
  const p = await ctx.newPage();
  p.errors = [];
  p.on("pageerror", (e) => p.errors.push(e.message));
  await p.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__cls += e.value))).observe({ type: "layout-shift", buffered: true });
    // Every figure the visitor can see, frame by frame (the digits are hidden until their count).
    window.__figs = [];
    const tick = () => {
      const n = document.querySelector(".sh-n");
      if (n && getComputedStyle(n).opacity !== "0" && window.__figs.at(-1) !== n.textContent) window.__figs.push(n.textContent);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await p.goto(BASE + "/solutions", { waitUntil: "load" });
  if (js) await p.waitForSelector("[data-scale-header][data-ready]", { timeout: 15000 });
  return p;
}
/** The header's state: slider value, figure, the visible stop's texts, the visible Explore link. */
const state = (p) =>
  p.evaluate(() => {
    const h = document.querySelector("[data-scale-header]");
    const s = h.querySelector("[role=slider]");
    const vis = (el) => el && getComputedStyle(el).visibility === "visible" && !el.closest("[inert]");
    const on = [...h.querySelectorAll(".sh-panel")].filter(vis);
    const link = [...h.querySelectorAll("a")].filter((a) => a.textContent.startsWith("Explore") && vis(a)).map((a) => [a.textContent.trim(), a.getAttribute("href")]);
    return {
      value: s.getAttribute("aria-valuetext"),
      now: s.getAttribute("aria-valuenow"),
      fig: h.querySelector(".sh-n").textContent + " " + h.querySelector(".sh-u").textContent,
      title: on.map((x) => x.querySelector("h2")?.textContent).filter(Boolean).join("|"),
      link,
      allLinks: [...h.querySelectorAll("a")].filter((a) => a.textContent.startsWith("Explore")).map((a) => [a.textContent.trim(), a.getAttribute("href")]),
    };
  });
const track = (p) => p.evaluate(() => { const r = document.querySelector(".sh-fill").parentElement.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width }; });
const settle = (p, ms = 900) => p.waitForTimeout(ms);

// 1. Pre-rendered HTML without JavaScript: the Residential stop, all three Explore links in the markup.
{
  const p = await page(1440, { js: false });
  const r = await p.evaluate(() => {
    const h = document.querySelector("[data-scale-header]");
    const n = h.querySelector(".sh-n");
    return {
      h1: document.querySelector("h1").textContent,
      h1s: document.querySelectorAll("h1").length,
      title: [...h.querySelectorAll(".sh-panel")].filter((x) => getComputedStyle(x).visibility === "visible").map((x) => x.querySelector("h2")?.textContent).filter(Boolean),
      fig: n.textContent,
      figShown: getComputedStyle(n).opacity === "1",
      links: [...h.querySelectorAll("a")].filter((a) => a.textContent.startsWith("Explore")).map((a) => [a.textContent.trim(), a.getAttribute("href")]),
      img: h.querySelector("img.sh-img")?.getAttribute("fetchpriority"),
    };
  });
  check("no JS: one h1, the page's own", r.h1 === H1 && r.h1s === 1, r);
  check("no JS: Residential shown (headline, 128 kWh visible)", r.title.join() === "More control at home." && r.fig === "128" && r.figShown, r);
  check("no JS: all three Explore links in the markup, right targets", Object.entries(LINKS).every(([t, h]) => r.links.some(([a, b]) => a === t && b === h)), r.links);
  check("no JS: the Residential scene is the high-priority image", r.img === "high", r);
  await p.context().close();
}

// 2. Auto-play: counts up, then glides Home → Business → Grid once; no layout shift; no errors.
{
  const p = await page(1440);
  await p.waitForTimeout(1500);
  const figs = await p.evaluate(() => window.__figs.slice(0, 300));
  await p.waitForTimeout(4800);
  const mid = await state(p);
  await p.waitForTimeout(6500);
  const end = await state(p);
  await p.waitForTimeout(3000);
  const after = await state(p);
  const cls = await p.evaluate(() => window.__cls);
  const upTo = figs.slice(0, figs.indexOf("128") + 1).map(Number);
  check("auto-play: the figure counts up from 0 to 128 (128 never shown before the count)", upTo[0] === 0 && upTo.length > 5 && upTo.every((v, i) => i === 0 || v >= upTo[i - 1]) && upTo.at(-1) === 128, figs);
  check("auto-play: Business after ~6 s", mid.value === "Business, 261 kWh" && mid.title === "Power your operation.", mid);
  check("auto-play: Grid at the end, exact 6.25 MWh", end.value === "Grid, 6.25 MWh" && end.fig === "6.25 MWh" && end.title === "Built to scale with demand.", end);
  check("auto-play: runs once (stays on Grid)", after.value === "Grid, 6.25 MWh", after);
  check("auto-play: layout shift 0", cls === 0, cls);
  check("no script errors", p.errors.length === 0, p.errors);
  await p.context().close();
}

// 3. Mouse: drag (live log-scale figure, snap to the nearest stop), auto-play stops for good, label click.
{
  const p = await page(1440);
  await p.waitForTimeout(400);
  const t = await track(p);
  await p.mouse.move(t.x, t.y);
  await p.mouse.down();
  await p.mouse.move(t.x + t.w * 0.25, t.y, { steps: 6 });
  const between = await state(p);
  await p.mouse.move(t.x + t.w * 0.45, t.y, { steps: 6 });
  await p.mouse.up();
  await settle(p);
  const r = await state(p);
  const expect = Math.round(128 * Math.pow(261 / 128, 0.5));
  check(`drag: halfway Home→Business shows the log-scale figure (≈${expect} kWh)`, Math.abs(parseInt(between.fig) - expect) <= 3 && between.fig.endsWith("kWh"), between);
  check("drag: released near Business snaps to Business, 261 kWh", r.value === "Business, 261 kWh" && r.fig === "261 kWh" && r.now === "1", r);
  check("drag: Business text and Explore C&I shown", r.title === "Power your operation." && r.link.length === 1 && r.link[0][1] === LINKS["Explore C&I"], r);
  await p.waitForTimeout(7000);
  check("drag: auto-play stopped for good (still Business 7 s later)", (await state(p)).value === "Business, 261 kWh");
  await p.locator(".sh-label", { hasText: "Grid" }).click();
  await settle(p);
  const g = await state(p);
  check("label click: Grid → 6.25 MWh, utility text and link", g.value === "Grid, 6.25 MWh" && g.fig === "6.25 MWh" && g.link[0]?.[1] === LINKS["Explore utility-scale"], g);
  await p.locator(".sh-label", { hasText: "Home" }).click();
  await settle(p);
  check("label click: Home → 128 kWh", (await state(p)).value === "Home, 128 kWh");
  // Explore hover lifts the button; click opens the segment page.
  await p.locator(".sh-label", { hasText: "Business" }).click();
  await settle(p);
  const btn = p.locator("[data-scale-header] a", { hasText: "Explore C&I" });
  await btn.hover();
  await p.waitForTimeout(400);
  check("Explore hover: the button lifts", (await btn.evaluate((a) => getComputedStyle(a).translate)) !== "none");
  await btn.click();
  await p.waitForURL((u) => u.pathname === LINKS["Explore C&I"], { timeout: 8000 }).catch(() => {});
  check("Explore C&I → the C&I page", new URL(p.url()).pathname === LINKS["Explore C&I"], p.url());
  check("no script errors (mouse)", p.errors.length === 0, p.errors);
  await p.context().close();
}

// 4. Keyboard: a real slider (arrows, Home / End, value text).
{
  const p = await page(1440);
  const s = p.locator("[data-scale-header] [role=slider]");
  await s.focus();
  const seq = [["End", "Grid, 6.25 MWh"], ["Home", "Home, 128 kWh"], ["ArrowRight", "Business, 261 kWh"], ["ArrowUp", "Grid, 6.25 MWh"], ["ArrowLeft", "Business, 261 kWh"], ["ArrowDown", "Home, 128 kWh"]];
  const got = [];
  for (const [k] of seq) {
    await p.keyboard.press(k);
    await settle(p, 800);
    got.push((await state(p)).value);
  }
  check("keyboard: End, Home, arrows move stop by stop with value text", got.join("|") === seq.map((x) => x[1]).join("|"), got);
  const a = await s.evaluate((el) => ({ role: el.getAttribute("role"), min: el.getAttribute("aria-valuemin"), max: el.getAttribute("aria-valuemax"), label: el.getAttribute("aria-label"), tab: el.tabIndex }));
  check("keyboard: role=slider, 0–2, labelled, focusable", a.role === "slider" && a.min === "0" && a.max === "2" && !!a.label && a.tab === 0, a);
  await p.context().close();
}

// 5. Touch (390): drag with a finger, tap a label, 44 px targets, no horizontal scroll.
{
  const p = await page(390, { touch: true });
  await p.waitForTimeout(400);
  await p.locator("[data-scale-header] [role=slider]").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(300);
  const t = await track(p);
  const cdp = await p.context().newCDPSession(p);
  const touch = (type, x) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y: t.y + 2 }] });
  await touch("touchStart", t.x + 2);
  for (let i = 1; i <= 8; i++) await touch("touchMove", t.x + 2 + (t.w * 0.5 * i) / 8);
  await touch("touchEnd");
  await settle(p);
  const r = await state(p);
  check("touch: a finger drag to the middle → Business, 261 kWh", r.value === "Business, 261 kWh" && r.fig === "261 kWh", r);
  const g = await p.locator(".sh-label", { hasText: "Grid" }).boundingBox();
  await p.touchscreen.tap(g.x + g.width / 2, g.y + g.height / 2);
  await settle(p);
  check("touch: tap on Grid → 6.25 MWh", (await state(p)).value === "Grid, 6.25 MWh");
  const m = await p.evaluate(() => ({ zone: document.querySelector(".sh-zone").getBoundingClientRect().height, btn: Math.min(...[...document.querySelectorAll("[data-scale-header] .sh-panel a")].filter((a) => a.offsetParent && getComputedStyle(a.closest(".sh-panel") || a).visibility === "visible").map((a) => a.getBoundingClientRect().height)), hscroll: document.documentElement.scrollWidth > innerWidth }));
  check("touch: slider zone and Explore button ≥ 44 px tall; no horizontal scroll", m.zone >= 44 && m.btn >= 44 && !m.hscroll, m);
  check("no script errors (touch)", p.errors.length === 0, p.errors);
  await p.context().close();
}

// 6. Reduced motion: no count, no auto-play, instant switches without wipe or ring.
{
  const p = await page(1440, { reduce: true });
  await p.waitForTimeout(300);
  const r0 = await state(p);
  await p.waitForTimeout(6000);
  const r1 = await state(p);
  check("reduced motion: 128 kWh at once, no auto-play", r0.fig === "128 kWh" && r1.value === "Home, 128 kWh", { r0, r1 });
  await p.locator(".sh-label", { hasText: "Grid" }).click();
  await p.waitForTimeout(60);
  const r2 = await state(p);
  const anims = await p.evaluate(() => document.querySelector("[data-scale-header]").getAnimations({ subtree: true }).filter((a) => a.playState === "running").length);
  check("reduced motion: label click switches instantly, nothing animates", r2.value === "Grid, 6.25 MWh" && r2.fig === "6.25 MWh" && r2.title === "Built to scale with demand." && anims === 0, { r2, anims });
  await p.context().close();
}

console.log(fails ? `${fails} failed` : "all passed");
await b.close();
process.exit(fails ? 1 : 0);
