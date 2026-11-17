// Browser checks of /blog/what-is-bess (the Step 11 refresh, published 17 November 2026), the /blog cards
// and the links to the article.
// Usage: node article.mjs http://127.0.0.1:8803 [--shots]
import { chromium } from "playwright-core";

const BASE = process.argv[2];
const SHOTS = process.argv.includes("--shots");
const URL_A = "/blog/what-is-bess";
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
const slowScroll = async (p, to) => {
  for (let y = 0; y <= to; y += 350) {
    await p.evaluate((y) => scrollTo(0, y), y);
    await p.waitForTimeout(80);
  }
};

check("article and an unknown article: 200 / 404", (await status(URL_A)) === 200 && (await status("/blog/nope")) === 404);

for (const [W, H] of [
  [1440, 900],
  [390, 844],
]) {
  const tag = `@${W}`;
  const p = await newPage(W, H);
  await p.goto(BASE + URL_A, { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const s = await p.evaluate(() => {
    const art = document.querySelector("article");
    const cs = getComputedStyle(art);
    const nav = document.querySelector('nav[aria-label="On this page"]');
    const det = document.querySelector("aside details");
    return {
      h1: document.querySelectorAll("h1").length,
      font: cs.fontSize,
      lh: (parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)).toFixed(2),
      measureCh: +(art.getBoundingClientRect().width / (parseFloat(cs.fontSize) * 0.5)).toFixed(0),
      width: Math.round(art.getBoundingClientRect().width),
      navShown: !!nav && getComputedStyle(nav).display !== "none",
      detailsShown: !!det && getComputedStyle(det).display !== "none",
      detailsOpen: det?.open,
      figures: [...document.querySelectorAll('article figure svg[role="img"]')].map((x) => x.getAttribute("aria-label")),
      tables: document.querySelectorAll('article [role="region"] table').length,
      faq: document.querySelectorAll("#faq details").length,
      related: [...document.querySelectorAll('section[aria-labelledby="related-title"] a')].map((a) => a.getAttribute("href")),
      byline: [...document.querySelectorAll("p")].find((x) => x.textContent.startsWith("By Nexera"))?.textContent.trim(),
    };
  });
  check(`${tag} one h1; body 16–18px (token), line height 1.7; ${W > 500 ? "sticky contents beside the text" : "collapsible contents (closed) above the text"}`, s.h1 === 1 && (W > 500 ? s.font === "18px" : parseFloat(s.font) >= 16) && s.lh === "1.70" && (W > 500 ? s.navShown && !s.detailsShown : s.detailsShown && !s.navShown && !s.detailsOpen), s);
  check(`${tag} one diagram, two tables, six FAQs, five related links, byline (published, updated)`, s.figures.length === 1 && s.tables === 2 && s.faq === 6 && s.related.join() === "/solutions/commercial-industrial,/solutions/utility-scale,/solutions/residential,/products,/become-a-partner" && s.byline === "By Nexera Powertech · Published 8 October 2026 · Updated 17 November 2026 · 7 min read", s);
  // The Step 11 posts' text column (no scene stage beside it) is 46rem.
  if (W > 500) check(`${tag} text column at most 46rem`, s.width > 500 && s.width <= 740, { width: s.width });

  // Contents: a link scrolls to its section (desktop list or the opened phone list).
  if (W < 500) await p.locator("aside details summary").click();
  const link = W > 500 ? p.locator('nav[aria-label="On this page"] a', { hasText: "Types of BESS by scale" }) : p.locator("aside details a", { hasText: "Types of BESS by scale" });
  await link.click();
  await p.waitForTimeout(1800);
  const top = await p.evaluate(() => Math.round(document.getElementById("types-of-bess-by-scale").getBoundingClientRect().top));
  check(`${tag} contents link scrolls to "Types of BESS by scale" (below the header)`, top >= 60 && top <= 100, top);
  if (W > 500) {
    const st = await p.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="On this page"]');
      const r = nav.getBoundingClientRect();
      return { navTop: Math.round(r.top), current: nav.querySelector('[aria-current="location"]')?.textContent.trim() };
    });
    check(`${tag} contents stay in view while reading and mark the current section`, st.navTop >= 64 && st.navTop <= 120 && st.current === "Types of BESS by scale", st);
  }
  // Links to the other posts in the text are live now that they are published.
  const inl = await p.evaluate(() => [...document.querySelectorAll("article a[href^='/blog/']")].map((a) => a.getAttribute("href")));
  check(`${tag} links to the published posts in the text (BMS/PCS/EMS article, design and sizing article)`, inl.includes("/blog/inside-a-bess-bms-pcs-ems-cooling-fire-safety") && inl.includes("/blog/how-bess-is-designed-and-sized"), inl);
  await slowScroll(p, 9000);
  await p.waitForTimeout(500);
  const cls = await p.evaluate(() => window.__cls);
  check(`${tag} CLS < 0.1 through load and reading`, cls < 0.1, +cls.toFixed(4));
  check(`${tag} no console errors`, p.errors.length === 0, p.errors);
  if (SHOTS) {
    await p.evaluate(() => scrollTo(0, 0));
    await p.waitForTimeout(800);
    await p.screenshot({ path: `article-${W}-top.png` });
    await p.screenshot({ path: `article-${W}.png`, fullPage: true });
  }
  await p.context().close();
}

// "Talk to a Nexera BESS expert" (the post's CTA) opens /contact; "Get in Touch" (the closing band, a plain
// /#contact from another page) lands on the homepage form.
{
  const p = await newPage();
  await p.goto(BASE + URL_A, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const btn = p.getByRole("link", { name: "Talk to a Nexera BESS expert" }).first();
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await p.waitForURL((u) => u.pathname === "/contact", { timeout: 8000 }).catch(() => {});
  check('"Talk to a Nexera BESS expert" → /contact', new URL(p.url()).pathname === "/contact", p.url());
  await p.context().close();
}
for (const name of ["Get in Touch"]) {
  const p = await newPage();
  await p.goto(BASE + URL_A, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const btn = p.getByRole("link", { name, exact: true }).first();
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await p.waitForURL((u) => u.pathname === "/", { timeout: 8000 });
  await p.waitForSelector("#contact", { timeout: 8000 });
  await p.waitForTimeout(2200);
  const top = await p.evaluate(() => Math.round(document.getElementById("contact").getBoundingClientRect().top));
  check(`"${name}" → homepage #contact (lands on the form)`, Math.abs(top - 64) <= 3, top);
  await p.context().close();
}
{
  const p = await newPage();
  await p.goto(BASE + URL_A, { waitUntil: "networkidle" });
  const card = p.locator('section[aria-labelledby="related-title"] a[href="/products"]');
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await p.waitForTimeout(800);
  check('Related "BESS products" → /products', new URL(p.url()).pathname === "/products", p.url());
  await p.context().close();
}
// Related and FAQ in the article answer 200.
for (const h of ["/solutions/residential", "/solutions/commercial-industrial", "/solutions/utility-scale", "/products", "/become-a-partner", "/contact"]) if ((await status(h)) !== 200) check(`${h} 200`, false);

// The article's card is on /blog (since 6881c94 /resources has no blog section); Solutions hub link;
// footer Resources column.
{
  const p = await newPage();
  await p.goto(BASE + "/resources", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => ({ cards: document.querySelectorAll("main a[data-slug]").length, h2: [...document.querySelectorAll("main h2")].map((h) => h.textContent.trim()) }));
  check("/resources: no article cards; Datasheets & Brochures, FAQs, News & Insights kept", r.cards === 0 && r.h2.slice(0, 3).join("|") === "Datasheets & Brochures|FAQs|News & Insights", r);
  await p.goto(BASE + "/blog", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const g = await p.evaluate(() => {
    const sec = document.querySelector('section[aria-label="Articles"]');
    const bess = sec?.querySelector('a[data-slug="what-is-bess"]');
    return { h1: document.querySelector("h1")?.textContent.replace(/\s+/g, " ").trim(), cards: sec ? [...sec.querySelectorAll("a[data-slug]")].map((c) => c.getAttribute("href")) : null, bess: bess?.innerText.replace(/\s+/g, " ").trim(), href: bess?.getAttribute("href") };
  });
  check("/blog: ten cards, What Is a BESS? among them (title, date · reading time) → the article", g.h1 === "NEXERA Blog" && g.cards?.length === 10 && g.cards.includes("/blog/what-is-bess") && g.bess?.includes("What Is a BESS? A Complete Guide to Battery Energy Storage Systems in India") && g.bess.includes("8 October 2026") && g.bess.includes("7 min read") && g.href === URL_A, g);
  if (SHOTS) {
    await p.locator('section[aria-label="Articles"]').screenshot({ path: "blog-cards-1440.png" });
  }
  const bessCard = p.locator('section[aria-label="Articles"] a[data-slug="what-is-bess"]');
  await bessCard.scrollIntoViewIfNeeded();
  await bessCard.click({ position: { x: 30, y: 60 } });
  await p.waitForURL((u) => u.pathname === "/blog/what-is-bess", { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(800);
  check("/blog card (anywhere on it) opens the article", new URL(p.url()).pathname === URL_A, p.url());
  await p.context().close();
}
if (SHOTS) {
  const p = await newPage(390, 844);
  await p.goto(BASE + "/blog", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  await p.locator('section[aria-label="Articles"]').screenshot({ path: "blog-cards-390.png" });
  await p.context().close();
}
{
  const p = await newPage();
  await p.goto(BASE + "/solutions", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const l = await p.evaluate(() => [...document.querySelectorAll("main a")].filter((a) => a.textContent.includes("New to battery storage")).map((a) => [a.textContent.trim(), a.getAttribute("href")]));
  const foot = await p.evaluate(() => {
    const col = [...document.querySelectorAll("footer p")].find((x) => x.textContent.trim() === "Resources")?.parentElement;
    return col ? [...col.querySelectorAll("a")].map((a) => [a.textContent.trim(), a.getAttribute("href")]) : null;
  });
  check('Solutions hub intro: "New to battery storage? Read: What Is a BESS?" → the article', l.length === 1 && l[0][0] === "New to battery storage? Read: What Is a BESS?" && l[0][1] === URL_A, l);
  check('footer Resources column: "Blog" → /blog, "What is a BESS?" → the article', foot?.some(([t, h]) => t === "Blog" && h === "/blog") && foot.some(([t, h]) => t === "What is a BESS?" && h === URL_A), foot);
  await p.context().close();
}

// No JS: the pre-rendered article is complete; contents anchors and FAQ work natively.
{
  const p = await newPage(1440, 900, false);
  await p.goto(BASE + URL_A, { waitUntil: "load" });
  const s = await p.evaluate(() => ({
    h1: document.querySelector("h1").textContent.trim(),
    h2: document.querySelectorAll("article h2").length,
    toc: [...document.querySelectorAll('nav[aria-label="On this page"] a')].map((a) => a.getAttribute("href")),
    faq: document.querySelectorAll("#faq details").length,
  }));
  await p.locator('nav[aria-label="On this page"] a', { hasText: "Key terms, explained simply" }).click();
  await p.waitForTimeout(1500);
  const top = await p.evaluate(() => Math.round(document.getElementById("key-terms-explained-simply").getBoundingClientRect().top));
  check("no JS: article complete (h1, 10 h2s, 11 contents anchors, 6 FAQs); an anchor lands on its section", s.h1 === "What Is a BESS? A Complete Guide to Battery Energy Storage Systems in India" && s.h2 === 10 && s.toc.length === 11 && s.faq === 6 && top >= 0 && top <= 120, { ...s, top });
  await p.context().close();
}

await b.close();
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
