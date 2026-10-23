// Inline color-mix values: does the browser paint them? For every element whose style attribute or
// SVG paint attribute (stroke / fill) uses color-mix, the computed value of that property — "none"
// (or a missing gradient) means the value was thrown away. Also takes a screenshot of each page area.
// Usage: node glowprobe.mjs <base> <outdir> <prefix>
import { chromium } from "playwright-core";
import path from "node:path";
const [BASE, OUT, PRE] = process.argv.slice(2);
const PAGES = [
  ["/", "home"],
  ["/become-a-partner", "epc"],
  ["/blog/what-is-bess", "article"],
  ["/products", "products"],
  ["/products/tcl-blueark-w10", "product"],
  ["/partners/tcl", "partner"],
  ["/resources", "resources"],
  ["/solutions/commercial-industrial", "ci"],
];
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
let painted = 0;
let dropped = 0;
for (const [route, name] of PAGES) {
  const p = await ctx.newPage();
  await p.goto(BASE + route, { waitUntil: "networkidle" });
  const H = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 600) {
    await p.evaluate((v) => scrollTo(0, v), y);
    await p.waitForTimeout(150);
  }
  await p.waitForTimeout(800);
  const rows = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("[style*='color-mix'], [stroke*='color-mix'], [fill*='color-mix']")) {
      const cs = getComputedStyle(el);
      const st = el.getAttribute("style") || "";
      const checks = [];
      if (/background[^;]*color-mix/.test(st)) checks.push(["background", cs.backgroundImage]);
      if (/box-shadow[^;]*color-mix/.test(st)) checks.push(["box-shadow", cs.boxShadow]);
      if (/filter[^;]*color-mix/.test(st)) checks.push(["filter", cs.filter]);
      if (/color-mix/.test(el.getAttribute("stroke") || "")) checks.push(["stroke", cs.stroke]);
      if (/color-mix/.test(el.getAttribute("fill") || "")) checks.push(["fill", cs.fill]);
      for (const [prop, v] of checks) out.push({ tag: el.tagName.toLowerCase(), prop, ok: !!v && v !== "none", v: String(v).slice(0, 60) });
    }
    return out;
  });
  const ok = rows.filter((r) => r.ok).length;
  painted += ok;
  dropped += rows.length - ok;
  const byProp = {};
  for (const r of rows) (byProp[`${r.tag} ${r.prop}`] ??= [0, 0])[r.ok ? 0 : 1]++;
  console.log(`${route}: ${ok}/${rows.length} painted  ${Object.entries(byProp).map(([k, [a, d]]) => `${k} ${a} ok/${d} dropped`).join(", ")}`);
  await p.close();
}
console.log(`glowprobe: ${painted} painted, ${dropped} dropped`);

// Screenshots of the areas these values paint (1440).
const SHOTS = [
  ["/", "section:has(#contact), #contact", "home-contact"],
  ["/", "section:has(h2:text-matches('Stronger, Cleaner'))", "home-whynow"],
  ["/become-a-partner", "section:has(h2:text-matches('Ready to Build'))", "epc-cta"],
  ["/become-a-partner", "section:has(h2:text-matches('Rooted in Karnataka'))", "epc-network"],
  ["/blog/what-is-bess", "section:has(h2:text-matches('Build India'))", "article-band"],
  ["/products", "section >> nth=0", "products-hero"],
  ["/partners/tcl", "section >> nth=0", "partner-hero"],
];
for (const w of [1440, 390]) {
  const c2 = await b.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, isMobile: w < 800, hasTouch: w < 800, reducedMotion: "reduce" });
  for (const [route, sel, name] of SHOTS) {
    const p = await c2.newPage();
    await p.goto(BASE + route, { waitUntil: "networkidle" });
    const loc = p.locator(sel).last();
    try {
      await loc.scrollIntoViewIfNeeded({ timeout: 8000 });
      await p.waitForTimeout(1200);
      await loc.screenshot({ path: path.join(OUT, `${PRE}-${name}-${w}.png`), style: "header, .cb-dock { visibility: hidden !important; }" });
    } catch (e) {
      console.log(`shot ${name}@${w}: ${e.message.split("\n")[0]}`);
    }
    await p.close();
  }
  await c2.close();
}
await b.close();
