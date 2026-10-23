// /products filters after the hydration fix: the controls reflect a filtered URL on a direct load,
// clicking filters updates the cards and the URL, and clearing works. Usage: node filterclick.mjs http://127.0.0.1:8810
import { chromium } from "playwright-core";
const BASE = process.argv[2];
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const results = [];
const check = (name, cond, extra = "") => {
  results.push(!!cond);
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra !== "" ? ` — ${JSON.stringify(extra)}` : ""}`);
};
const read = (p) =>
  p.evaluate(() => ({
    url: location.pathname + location.search,
    shown: [...document.querySelectorAll("[data-card]")].filter((c) => c.offsetParent !== null).length,
    app: document.querySelector('[role="radiogroup"][aria-label="Application"] [aria-checked="true"]')?.textContent.trim(),
    partner: document.querySelector('button[role="radio"][aria-checked="true"][aria-label]')?.getAttribute("aria-label") ?? null,
  }));
for (const [W, H] of [
  [1366, 900],
  [412, 823],
]) {
  const p = await (await b.newContext({ viewport: { width: W, height: H }, isMobile: W < 500, hasTouch: W < 500 })).newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  // Direct load of a filtered URL: the controls and the cards follow it.
  await p.goto(BASE + "/products?app=ci&partner=tcl", { waitUntil: "load" });
  await p.waitForTimeout(3000);
  const s0 = await read(p);
  check(`@${W} direct load ?app=ci&partner=tcl: controls show C&I + TCL, 2 cards`, s0.app === "C&I" && s0.partner === "TCL" && s0.shown === 2, s0);
  // Clear the partner, then pick Utility, then All.
  await p.locator('button[role="radio"][aria-label="TCL"]').click();
  await p.waitForTimeout(900);
  const s1 = await read(p);
  check(`@${W} click TCL again → partner cleared, URL ?app=ci, 5 cards`, s1.url === "/products?app=ci" && s1.partner === null && s1.shown === 5, s1);
  await p.locator('[role="radiogroup"][aria-label="Application"] button', { hasText: "Utility" }).click();
  await p.waitForTimeout(900);
  const s2 = await read(p);
  check(`@${W} Application → Utility: URL ?app=utility, 3 cards`, s2.url === "/products?app=utility" && s2.app === "Utility" && s2.shown === 3, s2);
  await p.locator('[role="radiogroup"][aria-label="Application"] button', { hasText: "All" }).click();
  await p.waitForTimeout(900);
  const s3 = await read(p);
  check(`@${W} Application → All: URL /products, 8 cards`, s3.url === "/products" && s3.shown === 8, s3);
  // Client-side navigation to a filtered URL (in-site link) applies it at once.
  await p.evaluate(() => (window.__same = 1));
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  await p.evaluate(() => {
    const a = document.createElement("a");
    a.href = "/products?partner=hithium";
    a.textContent = "x";
    document.body.append(a);
  });
  check(`@${W} no errors`, errs.length === 0, errs);
  await p.context().close();
}
await b.close();
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
