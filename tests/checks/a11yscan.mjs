// Accessibility scan of rendered pages (after every reveal has played):
//   contrast  every visible text element vs the pixels actually behind it (text hidden, page re-shot);
//             WCAG AA: 4.5:1, or 3:1 for large text (≥ 24px, or ≥ 18.66px bold). Reports the worst 10%.
//   focus     tab through the page: each focused element must show an outline (or ring) whose colour
//             is ≥ 3:1 against the ground right around it
//   targets   (390 only, touch) links / buttons / summaries / fields under 44 × 44 px, except links
//             inside a sentence (WCAG's inline exception)
// Usage: node a11yscan.mjs <base> <path…>   → prints FAIL lines and a summary per page and width.
import { chromium } from "playwright-core";
import zlib from "node:zlib";
// Minimal PNG decoder (8-bit RGB / RGBA, non-interlaced: what Chrome screenshots are).
const decode = async (buf) => {
  let pos = 8, width = 0, height = 0, ctype = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const body = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") [width, height, ctype] = [body.readUInt32BE(0), body.readUInt32BE(4), body[9]];
    if (type === "IDAT") idat.push(body);
    pos += 12 + len;
  }
  const ch = ctype === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * ch;
  const data = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const out = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? data[out + x - ch] : 0;
      const b2 = y ? data[out - stride + x] : 0;
      const c = x >= ch && y ? data[out - stride + x - ch] : 0;
      let v = raw[src + x];
      if (f === 1) v += a;
      else if (f === 2) v += b2;
      else if (f === 3) v += (a + b2) >> 1;
      else if (f === 4) {
        const p0 = a + b2 - c, pa = Math.abs(p0 - a), pb = Math.abs(p0 - b2), pc = Math.abs(p0 - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b2 : c;
      }
      data[out + x] = v & 255;
    }
  }
  return { data, width, height, ch };
};

const [BASE, ...PATHS] = process.argv.slice(2);
const lum = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const blend = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)];

const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
let fails = 0;
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const mobile = w < 800;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, reducedMotion: "reduce" });
  for (const path of PATHS) {
    const p = await ctx.newPage();
    // Colour probe: any CSS colour → rgba numbers.
    await p.addInitScript(() => {
      const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      window.__rgba = (css) => {
        c.clearRect(0, 0, 1, 1);
        c.fillStyle = "#000";
        c.fillStyle = css;
        c.fillRect(0, 0, 1, 1);
        const d = c.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2], d[3] / 255];
      };
    });
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    // --- Text contrast -----------------------------------------------------------------------------
    const collect = () =>
      p.evaluate(() => {
        const out = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const seen = new Set();
        while (walker.nextNode()) {
          const t = walker.currentNode;
          if (!t.textContent.trim()) continue;
          const el = t.parentElement;
          if (!el || seen.has(el) || el.closest("svg, [aria-hidden='true'], .sr-only, noscript, option, [inert], .ticker-strip, .ticker")) continue;
          seen.add(el);
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden") continue;
          const r = document.createRange();
          r.selectNodeContents(t);
          const rect = r.getBoundingClientRect();
          if (rect.width < 2 || rect.height < 2 || rect.top < 0 || rect.bottom > innerHeight || rect.left < 0 || rect.right > innerWidth) continue;
          let op = 1;
          for (let n = el; n; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
          if (op < 0.05) continue;
          // Covered by something else (the floating call-back pill, a sticky bar): not what is seen.
          const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
          if (!hit || !(el.contains(hit) || hit.contains(el))) continue;
          const col = window.__rgba(cs.color);
          if (col[3] === 0 || window.__rgba(cs.webkitTextFillColor || cs.color)[3] === 0) continue; // gradient / clipped text
          out.push({
            key: `${t.textContent.trim().slice(0, 40)}|${Math.round(rect.left)}|${Math.round(rect.top + scrollY)}`,
            text: t.textContent.trim().slice(0, 40),
            x: rect.left, y: rect.top, w: rect.width, h: rect.height,
            rgba: [col[0], col[1], col[2], col[3] * op],
            large: parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && parseInt(cs.fontWeight) >= 600),
            sel: `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 4).join(".")}`,
          });
        }
        return out;
      });
    let bad = 0;
    let measured = 0;
    const done = new Set();
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(h * 0.7)) {
      await p.evaluate((y) => window.scrollTo(0, y), y);
      await p.waitForTimeout(800);
      const texts = (await collect()).filter((t) => !done.has(t.key));
      if (!texts.length) continue;
      const tag = await p.addStyleTag({ content: "*, *::before, *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; caret-color: transparent !important; }" });
      await p.waitForTimeout(60);
      const png = await decode(await p.screenshot());
      await tag.evaluate((n) => n.remove());
      const px = (x, yy) => {
        const i = (Math.min(png.height - 1, Math.max(0, Math.round(yy))) * png.width + Math.min(png.width - 1, Math.max(0, Math.round(x)))) * png.ch;
        return [png.data[i], png.data[i + 1], png.data[i + 2]];
      };
      for (const t of texts) {
        done.add(t.key);
        measured++;
        const rs = [];
        for (let yy = t.y; yy < t.y + t.h; yy += Math.max(1, t.h / 6))
          for (let xx = t.x; xx < t.x + t.w; xx += Math.max(1, t.w / 12)) {
            const bg = px(xx, yy);
            rs.push(ratio(blend(t.rgba, bg), bg));
          }
        rs.sort((a, b2) => a - b2);
        const cr = rs[Math.floor(rs.length * 0.1)] ?? 99;
        const need = t.large ? 3 : 4.5;
        if (cr < need) {
          bad++;
          if (bad <= 15) console.log(`FAIL contrast ${path} @${w}: ${cr.toFixed(2)} < ${need}  "${t.text}"  ${t.sel}`);
        }
      }
    }
    const texts = { length: measured };
    // --- Focus visibility ----------------------------------------------------------------------------
    await p.reload({ waitUntil: "networkidle" });
    await p.waitForTimeout(500);
    let focusBad = 0;
    let tabs = 0;
    const seenFocus = new Set();
    for (let i = 0; i < 60; i++) {
      await p.keyboard.press("Tab");
      await p.waitForTimeout(60);
      const f = await p.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        el.scrollIntoView({ block: "center", behavior: "instant" });
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          id: `${el.tagName.toLowerCase()}:${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}`,
          ow: parseFloat(cs.outlineWidth),
          os: cs.outlineStyle,
          oc: window.__rgba(cs.outlineColor),
          oo: parseFloat(cs.outlineOffset),
          shadow: cs.boxShadow !== "none" || getComputedStyle(el, "::after").boxShadow !== "none" || getComputedStyle(el, "::after").outlineStyle !== "none",
          noRing: cs.outlineStyle === "none" && cs.boxShadow === "none",
          r: { x: r.left, y: r.top, w: r.width, h: r.height },
          visible: r.width > 0 && r.height > 0,
        };
      });
      if (!f || !f.visible) continue;
      if (seenFocus.has(f.id)) break;
      seenFocus.add(f.id);
      tabs++;
      if (f.os === "none" || f.ow < 1) {
        if (!f.shadow) {
          focusBad++;
          console.log(`FAIL focus ${path} @${w}: no outline or ring  ${f.id}`);
        }
        continue;
      }
      // The ground right outside the outline (sampled from a fresh shot, outline hidden).
      await p.addStyleTag({ content: ":focus-visible { outline-color: transparent !important; }" }).catch(() => {});
      const shot = await decode(await p.screenshot());
      await p.evaluate(() => document.querySelectorAll("style").forEach((s) => s.textContent.includes("outline-color: transparent") && s.remove()));
      const d = f.oo + f.ow / 2;
      const samples = [];
      const at = (x, y) => {
        const i = (Math.min(shot.height - 1, Math.max(0, Math.round(y))) * shot.width + Math.min(shot.width - 1, Math.max(0, Math.round(x)))) * shot.ch;
        return [shot.data[i], shot.data[i + 1], shot.data[i + 2]];
      };
      for (let k = 0; k <= 8; k++) {
        const fx = f.r.x + (f.r.w * k) / 8;
        samples.push(at(fx, f.r.y - d), at(fx, f.r.y + f.r.h + d));
      }
      const crs = samples.map((s) => ratio(f.oc.slice(0, 3), s)).sort((a, b2) => a - b2);
      const cr = crs[Math.floor(crs.length * 0.25)];
      if (cr < 3) {
        focusBad++;
        console.log(`FAIL focus ${path} @${w}: ring ${cr.toFixed(2)}:1  ${f.id}`);
      }
    }
    // --- Touch targets ---------------------------------------------------------------------------------
    let small = 0;
    if (mobile) {
      const list = await p.evaluate(() =>
        [...document.querySelectorAll("a[href], button, summary, select, input:not([type=hidden]), textarea, [role=button], [tabindex='0']")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height || getComputedStyle(el).visibility === "hidden" || el.closest("[inert], [aria-hidden='true']")) return false;
            // Inline links inside running text are exempt.
            if (el.tagName === "A") {
              const block = el.parentElement;
              if (block && block.textContent.trim().length > el.textContent.trim().length + 2) return false;
            }
            // A stretched link (its ::after covers the card) is as big as the card.
            const after = getComputedStyle(el, "::after");
            if (after.position === "absolute" && after.content !== "none" && parseFloat(after.top) <= 0 && parseFloat(after.left) <= 0) return false;
            // A field's own box counts with its label (checkboxes inside label chips).
            const lab = el.labels?.[0];
            const box = el.matches("input[type=checkbox], input[type=radio]") && lab ? lab.getBoundingClientRect() : r;
            return box.height < 43.5 || box.width < 43.5;
          })
          .map((el) => {
            const r = el.getBoundingClientRect();
            return `${el.tagName.toLowerCase()} ${Math.round(r.width)}×${Math.round(r.height)} "${(el.textContent || el.getAttribute("aria-label") || el.name || "").trim().slice(0, 30)}"`;
          })
      );
      small = list.length;
      list.slice(0, 15).forEach((s) => console.log(`FAIL target ${path} @${w}: ${s}`));
    }
    console.log(`${path} @${w}: contrast ${bad} of ${texts.length} below AA; focus ${focusBad} of ${tabs} tabbed; targets ${small} under 44px`);
    fails += bad + focusBad + small;
    await p.close();
  }
  await ctx.close();
}
await b.close();
console.log(`a11yscan: ${fails} failures`);
