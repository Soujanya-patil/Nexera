// The datasheet gate: every TCL "Request Datasheet" button goes to /contact?datasheet=<id>; the contact
// form there names the datasheet, pre-selects the enquiry type and pre-fills the message; the PDF downloads
// only after a successful send (php -S + SMTP sink: a real enquiry), with generate_lead (form_source
// datasheet) and datasheet_download; a failed send downloads nothing; an unknown id is the plain form; no
// page links a PDF; the PDFs carry X-Robots-Tag noindex (Apache, .htaccess).
// Google is stubbed locally (nothing leaves the machine), as in consent.mjs.
// Usage: MAILS=<mails.log> node datasheetgate.mjs <apache base> <php base>
import { chromium } from "playwright-core";
import fs from "node:fs";

const A = process.argv[2] ?? "http://127.0.0.1:8810";
const P = process.argv[3] ?? "http://127.0.0.1:8800";
const MAILS = process.env.MAILS;
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
const results = [];
const check = (n, c, x = "") => {
  results.push(!!c);
  console.log(`${c ? "PASS" : "FAIL"} ${n}${x !== "" ? " — " + JSON.stringify(x).slice(0, 400) : ""}`);
};
const GOOGLE = /googletagmanager\.com|google-analytics\.com|analytics\.google\.com|doubleclick\.net|www\.google\.com\/(ccm|g\/collect)/;
const mails = () => (MAILS && fs.existsSync(MAILS) ? fs.readFileSync(MAILS, "utf8").split("----- MESSAGE -----").filter((m) => m.trim()) : []);
const events = (p, name) => p.evaluate((name) => (window.dataLayer || []).map((a) => Array.from(a)).filter((a) => a[0] === "event" && a[1] === name).map((a) => a[2] || {}), name);

async function page(W, base = P) {
  const mobile = W < 500;
  const ctx = await b.newContext({ viewport: { width: W, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile, acceptDownloads: true });
  await ctx.route(GOOGLE, (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "/* stub */" }));
  await ctx.addInitScript(() => localStorage.setItem("nexera-consent", "granted"));
  const p = await ctx.newPage();
  p.downloads = [];
  p.on("download", (d) => p.downloads.push(d.suggestedFilename()));
  p.errors = [];
  p.on("pageerror", (e) => p.errors.push(e.message.slice(0, 160)));
  return p;
}
const formState = (p) =>
  p.evaluate(() => ({
    line: [...document.querySelectorAll("form p")].map((x) => x.textContent.trim()).find((t) => t.startsWith("Fill in your details")) ?? null,
    type: document.querySelector("#enquiry_type")?.value ?? null,
    message: document.querySelector("#message")?.value ?? null,
  }));
async function fillAndSend(p, who) {
  await p.fill("#name", who);
  await p.fill("#email", "gate.test@example.com");
  await p.fill("#mobile", "9845012345");
  await p.waitForTimeout(3200); // the form's minimum fill time
  await p.getByRole("button", { name: "Send", exact: true }).click();
}

// ---- Every datasheet button: "Request Datasheet", to /contact?datasheet=<id>; no page links a PDF ------
{
  const p = await page(1440, A);
  const SHEETS = { "/resources": ["tcl-blueark-x1", "tcl-blueark-x5", "tcl-blueark-w10", "tcl-blueark-x10"], "/products": ["tcl-blueark-x1", "tcl-blueark-x5", "tcl-blueark-w10", "tcl-blueark-x10"], "/partners/tcl": ["tcl-blueark-x1", "tcl-blueark-x5", "tcl-blueark-w10", "tcl-blueark-x10"], "/products/tcl-blueark-x5": ["tcl-blueark-x1", "tcl-blueark-x5", "tcl-blueark-w10", "tcl-blueark-x10"], "/products/tcl-blueark-x10": ["tcl-blueark-x1", "tcl-blueark-x5", "tcl-blueark-w10", "tcl-blueark-x10"] };
  for (const [path, ids] of Object.entries(SHEETS)) {
    const html = await (await fetch(A + path)).text();
    const r = await (async () => {
      await p.goto(A + path, { waitUntil: "networkidle" });
      return p.evaluate(() => {
        const links = [...document.querySelectorAll('a[href^="/contact?datasheet="]')];
        return {
          ids: [...new Set(links.map((a) => new URLSearchParams(a.getAttribute("href").split("?")[1]).get("datasheet")))].sort(),
          texts: [...new Set(links.map((a) => a.textContent.replace(/\s+/g, " ").trim().split(":")[0]))],
          download: links.some((a) => a.hasAttribute("download")) || !!document.querySelector('a[download], a[href$=".pdf"]'),
          icons: links.some((a) => a.querySelector("svg.lucide-download")),
        };
      });
    })();
    const pdfInHtml = /\/datasheets\/[^"]*\.pdf/.test(html);
    check(`${path}: datasheet buttons read "Request Datasheet" and go to /contact?datasheet=<id> (${ids.length}); no PDF link, no download icon, none in the served HTML`, JSON.stringify(r.ids) === JSON.stringify([...ids].sort()) && r.texts.length === 1 && r.texts[0] === "Request Datasheet" && !r.download && !r.icons && !pdfInHtml, { ...r, pdfInHtml });
  }
  // The brochure (no file) keeps its request on the homepage form.
  await p.goto(A + "/resources", { waitUntil: "networkidle" });
  const bro = await p.locator("#datasheets .sheet-card").nth(4).locator("a").getAttribute("href");
  check("the Hithium brochure keeps its homepage-form request", bro?.startsWith("/#contact?interest=utility&doc=") && bro.includes("kind=brochure"), bro);
  const sitemap = await (await fetch(A + "/sitemap.xml")).text();
  check("no PDF in the sitemap", !/\.pdf/i.test(sitemap));
  const head = await fetch(A + "/datasheets/tcl-blueark-x5-datasheet.pdf", { method: "HEAD" });
  check("the PDFs are served with X-Robots-Tag: noindex", head.status === 200 && /noindex/i.test(head.headers.get("x-robots-tag") ?? ""), { status: head.status, tag: head.headers.get("x-robots-tag") });
  await p.context().close();
}

// ---- The full flow at 1440 and 390: card → form (named, pre-filled, no download) → send → download ----
for (const [W, id, short, full, type, i] of [
  [1440, "tcl-blueark-x5", "BlueArk X5", "TCL BlueArk X5", "ci", 1],
  [390, "tcl-blueark-x1", "BlueArk X1", "TCL BlueArk X1", "residential", 0],
]) {
  const tag = `@${W}`;
  const p = await page(W);
  await p.goto(P + "/resources", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const link = p.locator("#datasheets .sheet-card").nth(i).locator("a");
  await link.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(400);
  await link.click();
  await p.waitForURL((u) => u.pathname === "/contact", { timeout: 8000 });
  await p.waitForTimeout(1500);
  check(`${tag} the button goes to /contact?datasheet=${id}`, new URL(p.url()).search === `?datasheet=${id}`, p.url());
  const req = await events(p, "datasheet_request");
  check(`${tag} datasheet_request on the click, with the product name`, req.length === 1 && req[0].item_name === full, req);
  const f = await formState(p);
  check(`${tag} the form names the datasheet, pre-selects "${type}" and pre-fills "Datasheet request: ${full}"`, f.line === `Fill in your details and your ${short} datasheet will download straight away.` && f.type === type && f.message === `Datasheet request: ${full}`, f);
  await p.waitForTimeout(1500);
  check(`${tag} nothing downloads before the form is sent`, p.downloads.length === 0, p.downloads);
  const n0 = mails().length;
  const dl = p.waitForEvent("download", { timeout: 15000 }).catch(() => null);
  await fillAndSend(p, "Gate Test");
  const d = await dl;
  await p.waitForTimeout(600);
  const done = await p.evaluate(() => {
    const s = document.querySelector('[role="status"]');
    const a = s?.querySelector("a[download]");
    return { text: s?.querySelector("p")?.textContent.trim(), again: a?.textContent.replace(/\s+/g, " ").trim().split(":")[0], href: a?.getAttribute("href") };
  });
  check(`${tag} after a successful send: "Thank you. Your datasheet is downloading.", "Download again", and the PDF downloads`, done.text === "Thank you. Your datasheet is downloading." && done.again === "Download again" && done.href === `/datasheets/${id}-datasheet.pdf` && d?.suggestedFilename() === `${id}-datasheet.pdf`, { ...done, file: d?.suggestedFilename() });
  const m = mails().slice(n0);
  check(`${tag} the enquiry was sent (one email, carrying the datasheet request)`, m.length === 1 && m[0].includes(`Datasheet request: ${full}`), { count: m.length });
  const leads = await events(p, "generate_lead");
  const dls = await events(p, "datasheet_download");
  const all = JSON.stringify(await p.evaluate(() => (window.dataLayer || []).map((a) => Array.from(a))));
  check(`${tag} generate_lead (form_source datasheet, the product) then datasheet_download; no personal data`, leads.length === 1 && leads[0].form_source === "datasheet" && leads[0].item_name === full && dls.length === 1 && dls[0].item_name === full && !/Gate Test|gate\.test|98450/.test(all), { leads, dls });
  check(`${tag} no page errors`, p.errors.filter((e) => !/#418/.test(e)).length === 0, p.errors);
  await p.context().close();
}

// ---- A failed send: the error (with the phone), and no download --------------------------------------
{
  const p = await page(1440);
  await p.route("**/api/contact.php", (r) => r.fulfill({ status: 502, contentType: "application/json", body: '{"ok":false,"error":"send_failed"}' }));
  await p.goto(P + "/contact?datasheet=tcl-blueark-w10", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await fillAndSend(p, "Gate Fail");
  await p.waitForTimeout(3000);
  const s = await p.evaluate(() => ({ alert: document.querySelector('[role="alert"]')?.textContent.replace(/\s+/g, " ").trim(), status: document.querySelector('[role="status"]')?.textContent ?? null }));
  const leads = await events(p, "generate_lead");
  check("a failed send: the error with the phone number, no thank-you, no download, no lead", s.alert?.startsWith("Something went wrong.") && /\+91 97423 53341/.test(s.alert) && !s.status && p.downloads.length === 0 && leads.length === 0, { ...s, downloads: p.downloads, leads });
  await p.context().close();
}

// ---- An unknown or missing ?datasheet=: the plain form, nothing downloads ------------------------------
for (const q of ["?datasheet=nope", "?datasheet=hithium-power-625", ""]) {
  const p = await page(1440);
  await p.goto(P + "/contact" + q, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const f = await formState(p);
  await p.waitForTimeout(800);
  check(`/contact${q || " (no query)"}: the plain form (no datasheet line, nothing pre-filled), no download`, f.line === null && f.type === "" && f.message === "" && p.downloads.length === 0, { ...f, downloads: p.downloads });
  await p.context().close();
}

await b.close();
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
