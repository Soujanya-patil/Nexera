// Layout shifts (with their sources) on a page loaded and scrolled through. Usage: node clsprobe.mjs <url> <width>
import { chromium } from "playwright-core";
const [url, w = "1440"] = process.argv.slice(2);
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const mobile = +w < 800;
const p = await b.newPage({ viewport: { width: +w, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile });
await p.addInitScript(() => {
  window.__shifts = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries())
      if (!e.hadRecentInput)
        window.__shifts.push({ v: +e.value.toFixed(5), t: Math.round(e.startTime), src: e.sources.map((s) => { const n = s.node; return n ? `${n.nodeName.toLowerCase()}.${String(n.className || "").slice(0, 70)} ${JSON.stringify(s.previousRect)}→${JSON.stringify(s.currentRect)}` : "?"; }) });
  }).observe({ type: "layout-shift", buffered: true });
});
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const total = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < total; y += 400) { if (mobile) await p.evaluate((y) => scrollTo(0, y), y); else await p.mouse.wheel(0, 400); await p.waitForTimeout(250); }
await p.waitForTimeout(2000);
console.log(JSON.stringify(await p.evaluate(() => ({ shifts: window.__shifts.map((s) => ({ v: s.v, t: s.t, src: s.src.map((x) => x.slice(0, 60)) })), fonts: performance.getEntriesByType("resource").filter((r) => r.name.includes("woff")).map((r) => [r.name.split("/").pop(), Math.round(r.responseEnd)]), fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime, heroH: document.querySelector("section")?.offsetHeight })), null, 1).slice(0, 3000));
await b.close();
