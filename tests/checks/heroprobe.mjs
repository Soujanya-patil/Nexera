// Home hero showcase timing: which product is shown every 250 ms for 34 s (one round, then stop),
// that a hover pauses the countdown, and that reduced motion never rotates. Also layout shift.
// Usage: node heroprobe.mjs <base>
import { chromium } from "playwright-core";
const BASE = process.argv[2] ?? "http://127.0.0.1:8810";
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
let fails = 0;
const check = (name, ok, extra) => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : " — " + JSON.stringify(extra)}`);
};
const shown = (p) =>
  p.evaluate(() => {
    const imgs = [...document.querySelectorAll("[data-home-hero] figure img")];
    const ops = imgs.map((i) => +getComputedStyle(i).opacity);
    return { n: imgs.length, top: ops.findIndex((o) => o > 0.99), ops: ops.map((o) => +o.toFixed(2)) };
  });
const timeline = async (p, ms, hover) => {
  const out = [];
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (hover) await hover(Date.now() - t0);
    out.push({ t: Date.now() - t0, ...(await shown(p)) });
    await p.waitForTimeout(250);
  }
  return out;
};
// A change: a different product fully shown than the last one fully shown (mid-fade samples, where
// none is fully opaque, are skipped).
const changes = (tl) => {
  const out = [];
  let last = null;
  for (const s of tl) {
    if (s.top === -1) continue;
    if (last !== null && s.top !== last) out.push(`${(s.t / 1000).toFixed(1)}s→${s.top}`);
    last = s.top;
  }
  return out;
};

for (const w of [1440, 390]) {
  const mobile = w < 800;
  const vp = { width: w, height: mobile ? 844 : 900 };
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await p.goto(BASE + "/", { waitUntil: "load" });
  if (mobile) await p.evaluate(() => document.querySelector("[data-home-hero] figure").scrollIntoView({ block: "center" }));
  const first = await shown(p);
  check(`@${w} first paint: one product shown (the first)`, first.top === 0, first);
  const tl = await timeline(p, 33000);
  const ch = changes(tl);
  const n = tl.at(-1).n;
  check(`@${w} one round: ${n} changes (to each product, then back to the first), about 7 s apart`, ch.length === n && tl.at(-1).top === 0, ch);
  const mid = tl.filter((s) => s.ops.filter((o) => o > 0.02).length >= 2).length;
  check(`@${w} cross-fades are seen (frames with two products partly visible)`, mid > 0, { mid });
  const after = await timeline(p, 9000);
  check(`@${w} then it stops (no change in the next 9 s)`, changes(after).length === 0, changes(after));
  const cls = await p.evaluate(() => window.__cls);
  check(`@${w} layout shift 0`, cls < 0.001, { cls });
  await ctx.close();
}

// Hover pauses the countdown (desktop).
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "load" });
  const fig = p.locator("[data-home-hero] figure");
  await fig.hover();
  const tl = await timeline(p, 10000);
  check("hovering the showcase holds the current product (10 s, no change)", changes(tl).length === 0, changes(tl));
  await p.mouse.move(5, 450);
  const tl2 = await timeline(p, 9000);
  check("leaving it lets the round continue", changes(tl2).length >= 1, changes(tl2));
  // A dot picks a product and ends the rotation.
  await p.locator('[data-home-hero] [aria-label="Featured systems"] button').nth(2).click();
  await p.mouse.move(5, 450);
  await p.waitForTimeout(1500);
  const picked = await shown(p);
  const tl3 = await timeline(p, 9000);
  check("a dot shows its product and ends the rotation", picked.top === 2 && changes(tl3).length === 0, { picked, later: changes(tl3) });
  await ctx.close();
}

// Reduced motion: never rotates.
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "load" });
  const tl = await timeline(p, 16000);
  check("reduced motion: the first product, still (16 s)", changes(tl).length === 0 && tl.at(-1).top === 0, changes(tl));
  await ctx.close();
}
console.log(`heroprobe: ${fails ? fails + " failed" : "all passed"}`);
await b.close();
process.exit(fails ? 1 : 0);
