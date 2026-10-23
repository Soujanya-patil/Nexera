// The draggable call-back pill, at 1440 and 390, against the built site. Usage: node cbdrag.mjs <base>
// Tap / Enter / Space open the card; a press that moves < 6px is still a tap; a drag moves the pill by
// exactly the drag and doesn't open the card; touch drags too (and doesn't scroll the page); it stays
// where dropped while scrolling; it is kept 8px inside the viewport and below the header (again on
// resize); the card opens beside it, fully on screen; lift + grab cursor while dragging; the nudge
// hides while dragging; every route change (and coming back) puts it in its default corner.
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://127.0.0.1:8810";
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const results = [];
const check = (name, cond, extra) => {
  results.push(!!cond);
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${cond ? "" : " — " + JSON.stringify(extra)}`);
};
const near = (a, b, tol = 1.5) => Math.abs(a - b) <= tol;

async function page(W) {
  const H = W < 500 ? 844 : 900;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: W < 500, hasTouch: W < 500 });
  const p = await ctx.newPage();
  p.errs = [];
  p.on("pageerror", (e) => p.errs.push(e.message.slice(0, 160)));
  p.on("console", (m) => m.type() === "error" && p.errs.push(m.text().slice(0, 160)));
  return p;
}
const settle = (p, ms = 500) => p.waitForTimeout(ms);
const dockRect = (p) => p.evaluate(() => {
  const r = document.querySelector(".cb-dock").getBoundingClientRect();
  return { x: r.left, y: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height };
});
const cardOpen = (p) => p.evaluate(() => !!document.querySelector('[role="dialog"][aria-modal="true"]'));
const closeCard = async (p) => {
  await p.keyboard.press("Escape");
  await settle(p, 450);
};
async function showPill(p, path = "/products") {
  await p.goto(BASE + path, { waitUntil: "networkidle" });
  await p.waitForSelector(".cb-dock", { state: "attached", timeout: 8000 });
  await p.evaluate(() => scrollTo(0, 600));
  await settle(p, 900);
}
/** A mouse drag from the pill's centre by (dx, dy), in steps; `hold` runs before the release. */
async function mouseDrag(p, dx, dy, hold) {
  const r = await dockRect(p);
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  await p.mouse.move(cx, cy);
  await p.mouse.down();
  const steps = 12;
  for (let i = 1; i <= steps; i++) await p.mouse.move(cx + (dx * i) / steps, cy + (dy * i) / steps);
  if (hold) await hold();
  await p.mouse.up();
  await settle(p, 300);
}
/** The same with real touch events (CDP), so pointerType is "touch". */
async function touchDrag(p, dx, dy) {
  const s = await p.context().newCDPSession(p);
  const r = await dockRect(p);
  const x = r.x + r.w / 2;
  const y = r.y + r.h / 2;
  await s.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let i = 1; i <= 12; i++) await s.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + (dx * i) / 12, y: y + (dy * i) / 12 }] });
  await s.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await settle(p, 400);
}

for (const W of [1440, 390]) {
  const tag = `@${W}`;
  const p = await page(W);
  const vp = p.viewportSize();
  await showPill(p);
  const home = await dockRect(p); // the default corner on this page

  // Tap, a tiny move, Enter, Space: the card opens.
  await p.locator(".cb-dock > button[aria-haspopup]").click();
  await settle(p, 500);
  check(`${tag} tap opens the card`, await cardOpen(p));
  await closeCard(p);
  {
    const r = await dockRect(p);
    await p.mouse.move(r.x + r.w / 2, r.y + r.h / 2);
    await p.mouse.down();
    await p.mouse.move(r.x + r.w / 2 + 3, r.y + r.h / 2 + 2);
    await p.mouse.up();
    await settle(p, 500);
    check(`${tag} a press that moves under 6px is a tap (opens the card, the pill stays)`, (await cardOpen(p)) && near((await dockRect(p)).x, home.x), await dockRect(p));
    await closeCard(p);
  }
  for (const key of ["Enter", " "]) {
    await p.locator(".cb-dock > button[aria-haspopup]").focus();
    await p.keyboard.press(key);
    await settle(p, 500);
    check(`${tag} keyboard ${key === " " ? "Space" : key} opens the card`, await cardOpen(p));
    await closeCard(p);
  }

  // Drag: follows the pointer exactly, lifts while held, doesn't open the card on release.
  const [dx, dy] = W > 500 ? [-500, -300] : [-150, -320];
  let during = null;
  await mouseDrag(p, dx, dy, async () => {
    // Read once the 300 ms lift transition has settled (mid-transition the shadow is an in-between
    // value), and look for the lift shadow itself (0 24px 44px -14px), not just "some shadow".
    await settle(p, 450);
    during = await p.evaluate(() => {
      const btn = document.querySelector(".cb-dock > button[aria-haspopup]");
      const cs = getComputedStyle(btn);
      return { scale: cs.scale, cursor: cs.cursor, shadow: /0px 24px 44px -14px/.test(cs.boxShadow), boxShadow: cs.boxShadow.slice(0, 80) };
    });
  });
  const moved = await dockRect(p);
  check(`${tag} drag: the pill moves by exactly the drag`, near(moved.x, home.x + dx) && near(moved.y, home.y + dy), { home, moved });
  check(`${tag} drag: releasing doesn't open the card`, !(await cardOpen(p)));
  check(`${tag} while dragging: lifted (scale 1.05, lift shadow), grabbing cursor`, Math.abs(parseFloat(during?.scale) - 1.05) < 0.01 && during.shadow && during.cursor === "grabbing", during);
  if (W > 500) {
    const cur = await p.evaluate(() => getComputedStyle(document.querySelector(".cb-dock > button[aria-haspopup]")).cursor);
    check(`${tag} desktop: grab cursor on the pill`, cur === "grab", cur);
  }
  const touchAction = await p.evaluate(() => getComputedStyle(document.querySelector(".cb-dock > button[aria-haspopup]")).touchAction);
  check(`${tag} touch-action: none on the pill only`, touchAction === "none" && (await p.evaluate(() => getComputedStyle(document.body).touchAction)) !== "none", touchAction);

  // Fixed while scrolling.
  await p.evaluate(() => scrollBy(0, 500));
  await settle(p, 500);
  const scrolled = await dockRect(p);
  check(`${tag} it stays where dropped while the page scrolls`, near(scrolled.x, moved.x) && near(scrolled.y, moved.y), { moved, scrolled });

  // The card opens beside it, fully on screen.
  await p.locator(".cb-dock > button[aria-haspopup]").click();
  await settle(p, 700);
  const c = await p.evaluate(() => {
    const r = document.querySelector('[role="dialog"][aria-modal="true"]').getBoundingClientRect();
    return { x: r.left, y: r.top, r: r.right, b: r.bottom };
  });
  const on = c.x >= 0 && c.y >= 0 && c.r <= vp.width + 0.5 && c.b <= vp.height + 0.5;
  if (W > 500) {
    const beside = near(c.y, scrolled.b + 12, 3) || near(c.b, scrolled.y - 12, 3);
    const lined = near(c.x, scrolled.x, 2) || near(c.r, scrolled.r, 2) || near(c.x, 8, 2) || near(c.r, vp.width - 8, 2);
    check(`${tag} the card opens next to the dragged pill (above or below, lined up), fully on screen`, on && beside && lined, { c, pill: scrolled });
  } else {
    check(`${tag} phones: the card is the bottom sheet, fully on screen`, on && near(c.b, vp.height, 2), c);
  }
  await closeCard(p);

  // Clamped: 8px from every edge, below the header.
  const header = await p.evaluate(() => document.querySelector("header").getBoundingClientRect().bottom);
  await mouseDrag(p, -3000, -3000);
  const tl = await dockRect(p);
  check(`${tag} clamp: top-left stops 8px in and 8px below the header`, near(tl.x, 8) && near(tl.y, header + 8), { tl, header });
  await mouseDrag(p, 3000, 3000);
  const br = await dockRect(p);
  check(`${tag} clamp: bottom-right stops 8px in`, near(br.r, vp.width - 8) && near(br.b, vp.height - 8), { br, vp });

  // Resize: kept on screen.
  await p.setViewportSize({ width: vp.width - 120, height: vp.height - 160 });
  await settle(p, 400);
  const rs = await dockRect(p);
  check(`${tag} resize: re-clamped inside the smaller viewport`, rs.r <= vp.width - 120 - 8 + 1 && rs.b <= vp.height - 160 - 8 + 1 && rs.x >= 8 - 1, rs);
  await p.setViewportSize(vp);
  await settle(p, 400);

  // Touch drag (phones): moves, no card, the page doesn't scroll.
  if (W < 500) {
    const before = await dockRect(p);
    const sy = await p.evaluate(() => scrollY);
    await touchDrag(p, -120, -200);
    const after = await dockRect(p);
    const sy2 = await p.evaluate(() => scrollY);
    check(`${tag} touch drag: the pill follows the finger, no card, the page doesn't scroll`, near(after.x, Math.max(8, before.x - 120)) && near(after.y, before.y - 200) && !(await cardOpen(p)) && sy2 === sy, { before, after, sy, sy2 });
  }

  // Route change: back in the corner; and coming back: in the corner again.
  await p.evaluate(() => document.querySelector('footer a[href="/about"]').click());
  await p.waitForURL((u) => u.pathname === "/about");
  await p.evaluate(() => scrollTo(0, 600));
  await settle(p, 900);
  const other = await dockRect(p);
  check(`${tag} another page: the pill is in its default corner`, near(other.x, home.x) && near(other.y, home.y), { other, home });
  await mouseDrag(p, -100, -100); // drag it on that page too
  await p.goBack();
  await p.waitForURL((u) => u.pathname === "/products");
  await p.evaluate(() => scrollTo(0, 600));
  await settle(p, 900);
  const back = await dockRect(p);
  check(`${tag} back on the first page: default corner again (not the dragged place)`, near(back.x, home.x) && near(back.y, home.y), { back, home });
  check(`${tag} no console errors`, p.errs.length === 0, p.errs);
  await p.context().close();
}

// The nudge hides while the pill is dragged (a fresh session; it shows half-way down a page).
for (const W of [1440, 390]) {
  const p = await page(W);
  await showPill(p);
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2));
  await settle(p, 1200);
  const shown = await p.evaluate(() => !!document.querySelector(".cb-nudge"));
  let hidden = null;
  await mouseDrag(p, -80, -80, async () => (hidden = await p.evaluate(() => !document.querySelector(".cb-nudge"))));
  check(`@${W} the nudge shows, and hides while the pill is dragged`, shown && hidden, { shown, hidden });
  await p.context().close();
}

await b.close();
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
