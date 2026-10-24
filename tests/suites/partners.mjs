// Browser checks of the partner pages and the new internal links (local build on php -S).
// Usage: node partners.mjs http://127.0.0.1:8803 [--shots]
import { chromium } from "playwright-core";

const BASE = process.argv[2];
const SHOTS = process.argv.includes("--shots");
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const results = [];
const check = (name, cond, extra = "") => {
  results.push(!!cond);
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra !== "" ? ` — ${typeof extra === "string" ? extra : JSON.stringify(extra)}` : ""}`);
};
async function newPage(w = 1440, h = 900, js = true) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1, javaScriptEnabled: js });
  const p = await ctx.newPage();
  p.errors = [];
  p.on("console", (m) => m.type() === "error" && p.errors.push(m.text().slice(0, 140)));
  p.on("pageerror", (e) => p.errors.push(e.message.slice(0, 140)));
  await p.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  return p;
}
const status = async (path) => (await fetch(BASE + path, { redirect: "manual" })).status;

// ---- server: /partners → 301 /products; every partner page 200 ------------------------------------------
{
  const r = await fetch(BASE + "/partners", { redirect: "manual" });
  const r2 = await fetch(BASE + "/partners/", { redirect: "manual" });
  check("/partners and /partners/ → 301 to /products", r.status === 301 && /^(https?:\/\/[^/]+)?\/products$/.test(r.headers.get("location") || "") && r2.status === 301, { s: r.status, loc: r.headers.get("location"), s2: r2.status });
  const codes = {};
  for (const id of ["hithium", "tcl", "clou", "nope"]) codes[id] = await status(`/partners/${id}`);
  check("partner pages 200; an unknown partner 404", codes.hithium === 200 && codes.tcl === 200 && codes.clou === 200 && codes.nope === 404, codes);
  // The removed partner page (not a NEXERA partner): its old URL, .html and trailing slash → 301 /products.
  const gone = [];
  for (const u of ["/partners/midea", "/partners/midea.html", "/partners/midea/"]) {
    const g = await fetch(BASE + u, { redirect: "manual" });
    gone.push([u, g.status, g.headers.get("location")]);
  }
  check("the removed partner page's old URL (also .html, trailing slash) → 301 /products", gone.every(([, st, loc]) => st === 301 && /^(https?:\/\/[^/]+)?\/products$/.test(loc || "")), gone);
}

// ---- each page: sections, links, hero buttons -----------------------------------------------------------
for (const [id, interest, nProducts] of [
  ["hithium", "ci", 3], // the ∞Power 5.016 MWh is `listed: false`: no card (its page and FAQ mention remain)
  ["tcl", "ci", 3],
  ["clou", "ci", 2],
]) {
  const p = await newPage();
  await p.goto(`${BASE}/partners/${id}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const s = await p.evaluate(() => ({
    h1: document.querySelectorAll("h1").length,
    h1text: document.querySelector("h1").textContent.replace(/\s+/g, " ").trim(),
    sections: ["about", "systems", "why", "faq"].filter((x) => document.getElementById(x)),
    cards: [...document.querySelectorAll("#systems article a[href^='/products/']")].map((a) => a.getAttribute("href")),
    hero: [...document.querySelectorAll("section a")].slice(0, 4).map((a) => [a.textContent.trim(), a.getAttribute("href")]),
    stats: document.querySelectorAll("#about dl > div").length,
    why: document.querySelectorAll("#why li").length,
    faq: document.querySelectorAll("#faq details").length,
    cta: [...document.querySelectorAll("a")].find((a) => a.textContent.trim() === "Get in Touch")?.getAttribute("href"),
  }));
  check(`/partners/${id}: one h1, all sections, ${nProducts || "no"} product cards, 4 why points, 2 FAQs`, s.h1 === 1 && s.sections.length === 4 && s.cards.length === nProducts && s.why === 4 && s.faq === 2 && s.stats >= 4, s);
  const contact = s.hero.find(([t]) => t === "Contact Us")?.[1];
  const see = s.hero.find(([t]) => t.startsWith("See "))?.[1];
  check(`/partners/${id}: hero buttons — See systems (#systems), Contact Us (/#contact?interest=${interest}); closing band → same`, contact === `/#contact?interest=${interest}` && see?.endsWith("#systems") && s.cta === contact, { contact, see, cta: s.cta });
  for (const href of s.cards) if ((await status(href)) !== 200) check(`card link ${href} works`, false);
  // See systems glides to the section.
  await p.getByRole("link", { name: new RegExp(`^See ${id === "tcl" ? "TCL" : id === "clou" ? "CLOU" : id[0].toUpperCase() + id.slice(1)} systems`) }).click();
  await p.waitForTimeout(1800);
  const top = await p.evaluate(() => Math.round(document.getElementById("systems").getBoundingClientRect().top));
  check(`/partners/${id}: "See … systems" scrolls to the systems section`, Math.abs(top - 64) <= 3, top);
  // Contact Us lands on the homepage form with the interest preselected.
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(400);
  await p.locator("section").first().getByRole("link", { name: "Contact Us" }).click();
  await p.waitForURL((u) => u.pathname === "/", { timeout: 8000 });
  await p.waitForSelector("#contact", { timeout: 8000 });
  await p.waitForTimeout(1500);
  const land = await p.evaluate(() => ({ top: Math.round(document.getElementById("contact").getBoundingClientRect().top), chip: document.querySelector('#contact input[name="interest"]:checked')?.value }));
  check(`/partners/${id}: Contact Us → homepage #contact, "${interest}" preselected`, Math.abs(land.top - 64) <= 3 && land.chip === interest, land);
  check(`/partners/${id}: no console errors`, p.errors.length === 0, p.errors);
  await p.context().close();
}

// ---- CLS on a first load ------------------------------------------------------------------------------------
for (const [w, h] of [
  [1440, 900],
  [390, 844],
]) {
  const p = await newPage(w, h);
  await p.goto(`${BASE}/partners/hithium`, { waitUntil: "networkidle" });
  for (let y = 0; y < 6000; y += 400) {
    await p.evaluate((y) => scrollTo(0, y), y);
    await p.waitForTimeout(120);
  }
  await p.waitForTimeout(600);
  const cls = await p.evaluate(() => window.__cls);
  check(`/partners/hithium @${w}: CLS < 0.1 through load and scroll`, cls < 0.1, +cls.toFixed(4));
  await p.context().close();
}

// ---- in-app: /partners (client-side) → /products ----------------------------------------------------------
{
  const p = await newPage();
  await p.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await p.evaluate(() => {
    history.pushState({}, "", "/partners");
    dispatchEvent(new PopStateEvent("popstate"));
  });
  await p.waitForTimeout(800);
  check("in the app, /partners → /products", new URL(p.url()).pathname === "/products", p.url());
  await p.context().close();
}

// ---- the new internal links ---------------------------------------------------------------------------------
async function linksOn(path, selector, setup) {
  const p = await newPage();
  await p.goto(BASE + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  if (setup) await setup(p);
  const hrefs = await p.evaluate((sel) => [...document.querySelectorAll(sel)].map((a) => [a.textContent.replace(/\s+/g, " ").trim(), a.getAttribute("href")]), selector);
  await p.context().close();
  return hrefs;
}
{
  // /products with a partner filter.
  const p = await newPage();
  await p.goto(`${BASE}/products?partner=hithium`, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const about = await p.evaluate(() => [...document.querySelectorAll("a")].filter((a) => a.textContent.trim().startsWith("About ")).map((a) => [a.textContent.trim(), a.getAttribute("href")]));
  await p.getByRole("link", { name: "About Hithium in India" }).click();
  await p.waitForTimeout(800);
  const went = new URL(p.url()).pathname;
  await p.goto(`${BASE}/products`, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const none = await p.evaluate(() => [...document.querySelectorAll("a")].some((a) => / in India$/.test(a.textContent.trim())));
  check('/products?partner=hithium: "About Hithium in India" → /partners/hithium (and none without a filter)', about.length === 1 && about[0][1] === "/partners/hithium" && went === "/partners/hithium" && !none, { about, went, none });
  await p.context().close();
}
{
  const l = await linksOn("/products/hithium-power-5016", "main a[href^='/partners/']");
  check("product page: partner name (breadcrumb + eyebrow) → /partners/hithium", l.length === 2 && l.every(([t, h]) => t === "Hithium" && h === "/partners/hithium"), l);
}
{
  const l = await linksOn("/solutions", "main a[href^='/partners/']");
  check("Solutions partner strip: all three logos → /partners/{id}", l.length === 3 && ["tcl", "hithium", "clou"].every((id) => l.some(([, h]) => h === `/partners/${id}`)), l);
}
{
  const l = await linksOn("/solutions/commercial-industrial", "main a[href^='/partners/']");
  check('C&I partner cards: "View {Partner} systems" → /partners/{id}', ["TCL", "Hithium", "CLOU"].every((n) => l.some(([t, h]) => t.startsWith(`View ${n} systems`) && h === `/partners/${n.toLowerCase()}`)), l);
}
{
  const l = await linksOn("/solutions/utility-scale", "main a[href^='/partners/']");
  check('Utility partner cards: "All {Partner} systems" → /partners/{id}', l.some(([t, h]) => t.startsWith("All Hithium systems") && h === "/partners/hithium") && l.some(([t, h]) => t.startsWith("All CLOU systems") && h === "/partners/clou"), l);
}
{
  const l = await linksOn("/become-a-partner", "main a[href^='/partners/']");
  check('Become a Partner, technology partners: "View {Partner} systems" → /partners/{id}', l.length >= 1 && l.every(([t, h]) => /^View .+ systems$/.test(t) && h.startsWith("/partners/")), l);
}
{
  const l = await linksOn("/", "main a[href^='/partners/']");
  check("homepage partners section: TCL, Hithium, CLOU → /partners/{id} (and no other partner)", ["tcl", "hithium", "clou"].every((id) => l.some(([, h]) => h === `/partners/${id}`)) && l.every(([, h]) => /^\/partners\/(tcl|hithium|clou)$/.test(h)), l);
}
{
  const l = await linksOn("/about", "footer a[href^='/partners/']");
  check("footer Partners column: Hithium · TCL · CLOU", l.map(([t]) => t).join(" · ") === "Hithium · TCL · CLOU", l);
}
// Every /partners link on these pages resolves to a 200 page.
{
  const all = new Set();
  for (const path of ["/", "/solutions", "/solutions/commercial-industrial", "/solutions/utility-scale", "/become-a-partner", "/products/tcl-blueark-x1", "/about"]) {
    const l = await linksOn(path, "a[href^='/partners/']");
    l.forEach(([, h]) => all.add(h));
  }
  const codes = {};
  for (const h of all) codes[h] = await status(h);
  check("every new internal link answers 200", Object.values(codes).every((c) => c === 200), codes);
}

// ---- no JS: the pre-rendered page is complete ------------------------------------------------------------------
{
  const p = await newPage(1440, 900, false);
  await p.goto(`${BASE}/partners/tcl`, { waitUntil: "load" });
  const s = await p.evaluate(() => ({ h1: document.querySelector("h1")?.textContent.replace(/\s+/g, " ").trim(), cards: document.querySelectorAll("#systems article").length, faq: document.querySelectorAll("#faq details").length }));
  check("no JS: /partners/tcl is complete in the pre-rendered HTML", s.h1 === "TCL energy storage in India" && s.cards === 3 && s.faq === 2, s);
  await p.context().close();
}

// ---- screenshots -------------------------------------------------------------------------------------------
if (SHOTS) {
  for (const id of ["hithium"]) {
    for (const [w, h] of [
      [1440, 900],
      [390, 844],
    ]) {
      const p = await newPage(w, h);
      await p.goto(`${BASE}/partners/${id}`, { waitUntil: "networkidle" });
      // Reveal everything (scroll through once), then a full-page capture.
      for (let y = 0; y < 9000; y += 300) {
        await p.evaluate((y) => scrollTo(0, y), y);
        await p.waitForTimeout(90);
      }
      await p.evaluate(() => scrollTo(0, 0));
      await p.waitForTimeout(1200);
      await p.screenshot({ path: `partner-${id}-${w}.png`, fullPage: true });
      await p.screenshot({ path: `partner-${id}-${w}-top.png` });
      await p.context().close();
    }
  }
}

await b.close();
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
