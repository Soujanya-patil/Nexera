// The photos on the Solutions pages (segment heroes, hub switcher and cards, C&I cabinet still) and the
// home solution cards, at 1440 and 390.
// Usage: node photoshots.mjs <base> <outdir> <prefix>
import { chromium } from "playwright-core";
import path from "node:path";
const [BASE, OUT, PRE] = process.argv.slice(2);
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
const shot = (n) => path.join(OUT, `${PRE}-${n}.png`);
for (const w of [1440, 390]) {
  const mobile = w < 800;
  const ctx = await b.newContext({ viewport: { width: w, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  const go = async (route) => { const p = await ctx.newPage(); await p.goto(BASE + route, { waitUntil: "networkidle" }); await p.waitForTimeout(2600); return p; };
  // Segment heroes (the photo is the hero's right side on desktop, behind the copy on phones).
  for (const [n, route] of [["residential", "/solutions/residential"], ["ci", "/solutions/commercial-industrial"], ["utility", "/solutions/utility-scale"]]) {
    const p = await go(route);
    await p.locator("section[data-vt-hero]").screenshot({ path: shot(`${n}-hero-${w}`) });
    if (n === "ci") {
      const s = p.locator("#inside-cabinet");
      await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
      await s.screenshot({ path: shot(`ci-cabinet-${w}`) });
    }
    await p.close();
  }
  // Hub: header (the scale slider, once its script is running) and the segment cards.
  const hub = await go("/solutions");
  await hub.waitForSelector("[data-scale-header][data-ready]", { timeout: 15000 }).catch(() => {});
  await hub.waitForTimeout(1200);
  await hub.screenshot({ path: shot(`hub-top-${w}`) });
  const cards = hub.locator('section[aria-label="Solutions by segment"]');
  await cards.scrollIntoViewIfNeeded(); await hub.waitForTimeout(1500);
  await cards.screenshot({ path: shot(`hub-cards-${w}`) });
  await hub.close();
  // Home: the solutions section.
  const home = await go("/");
  const sol = home.locator("section", { has: home.getByText("Energy Storage for Every Need") }).last();
  // Walk through the section so every entrance plays, then hide the sticky header for the stitched shot.
  const box = await sol.boundingBox();
  for (let y = box.y - 400; y < box.y + box.height; y += 300) { await home.evaluate((v) => window.scrollTo(0, v), y); await home.waitForTimeout(350); }
  await home.waitForTimeout(1500);
  await sol.screenshot({ path: shot(`home-solutions-${w}`), style: "header, [data-callback], .callback-widget { visibility: hidden !important; }" });
  await home.close();
  await ctx.close();
}
console.log("done");
await b.close();
