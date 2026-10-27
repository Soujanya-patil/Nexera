import { chromium } from "playwright-core";
const BASE = process.argv[2];
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const results = [];
const check = (n, c, x = "") => { results.push(!!c); console.log(`${c ? "PASS" : "FAIL"} ${n}${x !== "" ? " — " + JSON.stringify(x) : ""}`); };
const CARD = 'section[aria-label="Articles"] a[data-slug="what-is-bess"]';
async function page(w, h, js = true) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1, javaScriptEnabled: js, hasTouch: w < 500 })).newPage();
  p.errors = [];
  p.on("pageerror", (e) => p.errors.push(e.message.slice(0, 120)));
  await p.goto(BASE + "/blog", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  return p;
}
const landed = async (p) => {
  await p.waitForURL((u) => u.pathname === "/blog/what-is-bess", { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(600);
  return { path: new URL(p.url()).pathname, h1: await p.evaluate(() => document.querySelector("h1")?.textContent.trim()) };
};
const H1 = "What Is a BESS? A Plain Guide to Battery Energy Storage";
for (const [W, H] of [[1440, 900], [390, 844]]) {
  const tag = `@${W}`;
  // Structure: one link, the arrow inside it, the link covers the whole card, no click handlers.
  {
    const p = await page(W, H);
    const s = await p.evaluate((sel) => {
      // Hub: one link to the article itself (the featured card); "Start here" links go to its sections.
      const links = document.querySelectorAll('section[aria-label="Articles"] a[href="/blog/what-is-bess"]');
      const a = document.querySelector(sel);
      a.scrollIntoView({ block: "center" });
      const r = a.getBoundingClientRect();
      const svg = a.querySelector("svg.lucide-arrow-right, svg[class*='arrow']") || [...a.querySelectorAll("svg")].pop();
      // The whole card is the link: a grid of points across it all hit inside the link.
      const pts = [];
      for (const fx of [0.05, 0.5, 0.95]) for (const fy of [0.05, 0.5, 0.95]) pts.push(document.elementFromPoint(r.left + r.width * fx, r.top + r.height * fy));
      return { links: links.length, arrowInside: !!svg, href: a.getAttribute("href") === "/blog/what-is-bess", covers: pts.every((el) => el && a.contains(el)), name: a.getAttribute("aria-labelledby") && document.getElementById(a.getAttribute("aria-labelledby")).textContent.trim() };
    }, CARD);
    check(`${tag} one real <a href> is the whole card, arrow inside it, accessible name = title`, s.links === 1 && s.arrowInside && s.href && s.covers && s.name === H1, s);
    // Hover state.
    const before = await p.locator(CARD).evaluate((a) => ({ t: getComputedStyle(a).translate, b: getComputedStyle(a).borderColor, c: getComputedStyle(a.querySelector("h3")).textDecorationColor }));
    if (W > 500) {
      await p.locator(CARD).hover();
      await p.waitForTimeout(450);
      const after = await p.locator(CARD).evaluate((a) => ({ t: getComputedStyle(a).translate, b: getComputedStyle(a).borderColor, c: getComputedStyle(a.querySelector("h3")).textDecorationColor, sh: getComputedStyle(a).boxShadow !== "none" }));
      check(`${tag} hover: card lifts, border firms, title gets its navy underline, shadow`, after.t !== before.t && after.b !== before.b && before.c === "rgba(0, 0, 0, 0)" && after.c !== before.c && after.sh, { before, after });
    }
    await p.context().close();
  }
  // Clicks on each part of the card.
  for (const [part, sel] of [["title", "h3"], ["description", "span[id$='-desc']"], ["arrow", "svg.lucide-arrow-right"], ["empty corner", null]]) {
    const p = await page(W, H);
    const card = p.locator(CARD);
    if (sel) await card.locator(sel).first().click();
    else {
      await card.scrollIntoViewIfNeeded();
      await p.waitForTimeout(300);
      const box = await card.boundingBox();
      await p.mouse.click(box.x + box.width - 8, box.y + 8);
    }
    const r = await landed(p);
    check(`${tag} click on the ${part} → the article`, r.path === "/blog/what-is-bess" && r.h1 === H1, r);
    await p.context().close();
  }
  // Keyboard: focus ring, Enter.
  {
    const p = await page(W, H);
    await p.locator(CARD).focus();
    await p.keyboard.press("Shift+Tab");
    await p.keyboard.press("Tab");
    const f = await p.evaluate((sel) => {
      const a = document.querySelector(sel);
      const cs = getComputedStyle(a);
      return { focused: document.activeElement === a, outline: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor };
    }, CARD);
    check(`${tag} keyboard focus: visible outline (the site ring)`, f.focused && f.outline === "solid" && f.width === "2px", f);
    if (W > 500) await p.locator('section[aria-label="Articles"]').screenshot({ path: `guides-focus-${W}.png` });
    await p.keyboard.press("Enter");
    const r = await landed(p);
    check(`${tag} Enter on the focused card → the article`, r.path === "/blog/what-is-bess" && r.h1 === H1, r);
    await p.context().close();
  }
  // Tap on phones.
  if (W < 500) {
    const p = await page(W, H);
    await p.locator(CARD).tap();
    const r = await landed(p);
    check(`${tag} tap → the article`, r.path === "/blog/what-is-bess" && r.h1 === H1, r);
    await p.context().close();
  }
  // Without JavaScript.
  {
    const p = await page(W, H, false);
    await p.locator(CARD).locator("svg.lucide-arrow-right").click();
    const r = await landed(p);
    check(`${tag} no JavaScript: click on the arrow → the article`, r.path === "/blog/what-is-bess" && r.h1 === H1, r);
    await p.context().close();
  }
}
// Hover screenshot (desktop).
{
  const p = await page(1440, 900);
  await p.locator(CARD).hover();
  await p.waitForTimeout(450);
  await p.locator('section[aria-label="Articles"]').screenshot({ path: "guides-hover-1440.png" });
  await p.context().close();
  const q = await page(390, 844);
  await q.locator('section[aria-label="Articles"]').screenshot({ path: "guides-390.png" });
  await q.context().close();
}
await b.close();
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
