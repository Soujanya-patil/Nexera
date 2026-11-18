// Zoho CRM (api/zoho.php) against a local stand-in for the webform endpoint — never the real Zoho.
// Usage: MAILS=<.work/mails.log> DIST=<dist> node zoho.mjs http://127.0.0.1:8800
// The PHP server's web root is .work/php-web, so "outside the web root" is .work/nexera-private: the
// config, the retry queue and the log live there. Each case switches the stand-in's answer.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const BASE = process.argv[2] ?? "http://127.0.0.1:8800";
const MAILS = process.env.MAILS;
const DIST = process.env.DIST;
const W = path.dirname(MAILS);
const PRIVATE = path.join(W, "nexera-private");
const QUEUE = path.join(PRIVATE, "zoho-queue");
const LOG = path.join(PRIVATE, "zoho-log.txt");
const WEBROOT = path.join(W, "php-web");
const SECRET = "cron-" + "k".repeat(30);
const PORT = 8831;
const results = [];
const ok = (name, cond, extra = "") => {
  results.push(!!cond);
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + String(extra).slice(0, 400) : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mailText = () => (fs.existsSync(MAILS) ? fs.readFileSync(MAILS, "utf8") : "");
const mails = () => mailText().split("----- MESSAGE -----").length - 1;
const subjects = () => [...mailText().matchAll(/^Subject: =\?UTF-8\?B\?([^?]+)\?=/gm)].map((m) => Buffer.from(m[1], "base64").toString("utf8"));
const queue = () => (fs.existsSync(QUEUE) ? fs.readdirSync(QUEUE).filter((f) => f.endsWith(".json")) : []);
const readQueue = () => queue().map((f) => JSON.parse(fs.readFileSync(path.join(QUEUE, f), "utf8")));
const log = () => (fs.existsSync(LOG) ? fs.readFileSync(LOG, "utf8") : "");

// ---- The stand-in for the webform endpoint -------------------------------------------------------------
let mode = "ok"; // ok | 503 | dup | html | slow
const got = []; // each request's fields
function parseMultipart(body, type) {
  const b = (type.match(/boundary=(.+)$/) || [])[1];
  const out = {};
  if (!b) return out;
  for (const part of body.split(`--${b}`)) {
    const m = part.match(/name="([^"]*)"\r\n\r\n([\s\S]*)\r\n$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}
const server = http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", async () => {
    got.push({ path: req.url, fields: parseMultipart(Buffer.concat(chunks).toString("utf8"), req.headers["content-type"] || "") });
    const json = (o) => {
      res.setHeader("Content-Type", "application/json;charset=UTF-8");
      res.end(JSON.stringify(o));
    };
    if (mode === "ok") return json({ actionsubmit: "Splash Message", actionvalue: "Thank you for submitting the form." });
    if (mode === "dup") return json({ actionsubmit: "error_msg", message: "Duplicate data found: a Lead with ankit.sharma@gmail.com / +919876543210 already exists." });
    if (mode === "html") {
      res.setHeader("Content-Type", "text/html");
      return res.end("<html><body>Something went wrong</body></html>");
    }
    if (mode === "slow") {
      await sleep(6000);
      return json({ actionsubmit: "Splash Message", actionvalue: "late" });
    }
    res.statusCode = 503;
    res.end("Service Unavailable");
  });
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));

// ---- Config (outside the web root) ---------------------------------------------------------------------
const FAKE_A = "a1".repeat(32);
const FAKE_B = "b2".repeat(48);
function config({ enabled = true, test = false, secret = SECRET, url = `http://127.0.0.1:${PORT}/crm/WebToLeadForm`, timeout = 3 } = {}) {
  fs.mkdirSync(PRIVATE, { recursive: true });
  fs.writeFileSync(
    path.join(PRIVATE, "zoho-config.php"),
    `<?php return ${phpArray({ enabled, test, action_url: url, hidden: { xnQsjsdp: FAKE_A, zc_gad: "", xmIwtLD: FAKE_B, actionType: "TGVhZHM=", returnURL: "null" }, honeypot: "hp_field", lead_source: "Website", cron_secret: secret, timeout })};\n`
  );
}
function phpArray(o) {
  const v = (x) => (typeof x === "boolean" ? String(x) : typeof x === "number" ? String(x) : typeof x === "object" ? phpArray(x) : `'${String(x).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`);
  return "[" + Object.entries(o).map(([k, x]) => `'${k}' => ${v(x)}`).join(", ") + "]";
}
const clearRate = () => fs.rmSync(path.join(PRIVATE, "ratelimit"), { recursive: true, force: true });
const reset = () => {
  for (const f of ["zoho-queue", "zoho-log.txt", "ratelimit"]) fs.rmSync(path.join(PRIVATE, f), { recursive: true, force: true });
  got.length = 0;
};

// ---- Enquiries -----------------------------------------------------------------------------------------
const CONTACT = { name: "Ankit Sharma", mobile: "98765 43210", email: "ankit.sharma@gmail.com", company: "Suntrop Solar Pvt. Ltd.", city: "Bengaluru", state: "Karnataka", interest: "ci", requirement: "500 kWh", message: "We are planning a 500 kWh C&I system and would like a quote.", source: "full", page: "/contact?utm_source=google&utm_medium=cpc&utm_campaign=bess", details: { enquiry: "General enquiry" } };
async function post(body) {
  clearRate();
  const now = Date.now();
  const t0 = Date.now();
  const res = await fetch(`${BASE}/api/contact.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startedAt: now - 5000, sentAt: now, website: "", ...body }) });
  const json = await res.json().catch(() => null);
  return { status: res.status, json, ms: Date.now() - t0 };
}
/** Waits until the stand-in has had `n` requests (the Zoho step runs after the visitor's answer). */
async function until(fn, ms = 12000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (fn()) return true;
    await sleep(100);
  }
  return false;
}
const cron = async (key = SECRET) => {
  const r = await fetch(`${BASE}/api/zoho-retry.php?key=${encodeURIComponent(key)}`);
  return { status: r.status, json: await r.json().catch(() => null) };
};

// 1. Switched off: nothing reaches Zoho; the email goes as always.
reset();
config({ enabled: false });
{
  const m0 = mails();
  const r = await post(CONTACT);
  await sleep(1200);
  ok("off (enabled = false): 200, the email is sent, nothing is sent to Zoho", r.status === 200 && r.json?.ok && mails() === m0 + 1 && got.length === 0, `${r.status} mails ${mails() - m0} zoho ${got.length}`);
}

// 2. Success: every field mapped as the webform names it; nothing queued.
reset();
config();
mode = "ok";
{
  const m0 = mails();
  const r = await post(CONTACT);
  await until(() => got.length === 1);
  const f = got[0]?.fields ?? {};
  ok("success: the visitor gets 200 and the email is sent", r.status === 200 && r.json?.ok && mails() === m0 + 1, `${r.status}`);
  ok("success: one POST to the webform action URL", got.length === 1 && got[0].path === "/crm/WebToLeadForm", JSON.stringify(got.map((g) => g.path)));
  ok("success: the webform's hidden fields from the config, its honeypot sent empty", f.xnQsjsdp === FAKE_A && f.xmIwtLD === FAKE_B && f.actionType === "TGVhZHM=" && f.returnURL === "null" && f.zc_gad === "" && f.hp_field === "", JSON.stringify(f).slice(0, 300));
  ok("success: First / Last Name split on the last space; Mobile +91…; Email; Company; Address - City; State (HQ)", f["First Name"] === "Ankit" && f["Last Name"] === "Sharma" && f.Mobile === "+919876543210" && f.Email === "ankit.sharma@gmail.com" && f.Company === "Suntrop Solar Pvt. Ltd." && f["Address - City"] === "Bengaluru" && f.LEADCF19 === "Karnataka", JSON.stringify(f));
  ok("success: Lead Source \"Website\" (a value of the webform's picklist)", f["Lead Source"] === "Website", f["Lead Source"]);
  const d = f.Description ?? "";
  ok("success: Description — form, interest, project size, message, page, UTM, received", d.startsWith("Form: Website – Contact form\n") && d.includes("Interested in: Commercial & Industrial") && d.includes("Project size: 500 kWh") && d.includes("Message:\nWe are planning") && /Page: https:\/\/127\.0\.0\.1:8800\/contact\?utm_source=google/.test(d) && d.includes("UTM: utm_source=google, utm_medium=cpc, utm_campaign=bess") && /Received: \d{2} \w{3} \d{4}, \d{2}:\d{2} IST/.test(d), d);
  ok("success: no TEST marker, no Brand Interest / Customer Type for a general enquiry", !d.includes("TEST") && !("LEADCF11" in f) && !("LEADCF16" in f), JSON.stringify(Object.keys(f)));
  await sleep(300);
  ok("success: nothing queued; the log says delivered", queue().length === 0 && /\tWebsite – Contact form\tdelivered\t/.test(log()), log());
}

// 3. The other forms' mapping (datasheet, call-back, partner, a one-word name).
reset();
config();
mode = "ok";
{
  const cases = [
    [{ ...CONTACT, page: "/contact?datasheet=tcl-blueark-x5", details: { enquiry: "Datasheet request", product: "TCL BlueArk X5" } }, (f) => f.Description.startsWith("Form: Website – Datasheet request") && f.LEADCF11 === "TCL" && f.Description.includes("Product: TCL BlueArk X5"), "datasheet request: \"Website – Datasheet request\", Brand Interest TCL, the product in Description"],
    [{ name: "Rao", mobile: "+91-9876543210", state: "Tamil Nadu", interest: "home", source: "quick", page: "/products" }, (f) => f.Description.startsWith("Form: Website – Call-back") && f["Last Name"] === "Rao" && !("First Name" in f) && f.Company === "Not given" && !("Email" in f) && f.Mobile === "+919876543210" && !f.Description.includes("Project size") && f.Description.includes("Interested in: Home storage"), "call-back: one-word name in Last Name, Company \"Not given\", no Email, no project size"],
    [{ name: "K. S. Rao", mobile: "", email: "info@company.co.in", company: "3M India", city: "Kalaburagi", state: "Karnataka", requirement: "2 MW", interest: "epc", source: "partner", message: "We are an EPC in Karnataka planning C&I storage projects.", page: "/become-a-partner", details: { enquiry: "EPC / Project Partnership", company_type: "EPC", application: "Commercial & Industrial" } }, (f) => f.Description.startsWith("Form: Website – Partner form") && f.LEADCF16 === "EPC Company" && f["First Name"] === "K. S." && f["Last Name"] === "Rao" && !("Mobile" in f) && /Expected requirement: 2 MW\nLocation: Kalaburagi\nEnquiry: EPC \/ Project Partnership\nCompany type: EPC\nApplication: Commercial & Industrial/.test(f.Description), "partner: \"Website – Partner form\", Customer Type \"EPC Company\", extras in Description, no Mobile when none given"],
    [{ ...CONTACT, page: "/", details: {} }, (f) => f.Description.startsWith("Form: Website – Home form"), "home form: \"Website – Home form\""],
  ];
  for (const [body, check, label] of cases) {
    const n = got.length;
    const r = await post(body);
    await until(() => got.length === n + 1);
    const f = got[n]?.fields ?? {};
    let pass = false;
    try {
      pass = r.status === 200 && check(f);
    } catch {}
    ok(label, pass, JSON.stringify(f));
  }
}

// 4. Test mode: "TEST – " at the start of the Description.
reset();
config({ test: true });
{
  await post(CONTACT);
  await until(() => got.length === 1);
  ok("test mode: the Description starts \"TEST – Form: …\" (Lead Source stays \"Website\")", (got[0]?.fields.Description ?? "").startsWith("TEST – Form: Website – Contact form") && got[0].fields["Lead Source"] === "Website", got[0]?.fields.Description);
}

// 5. Zoho down (no answer at all): the visitor still gets 200 at once, the email is sent, the Lead is queued
//    outside the web root.
reset();
config({ url: "http://127.0.0.1:8839/crm/WebToLeadForm" }); // nothing listens there
{
  const m0 = mails();
  const r = await post(CONTACT);
  await until(() => queue().length === 1, 8000);
  const q = readQueue()[0];
  ok("Zoho down: 200 for the visitor, the email sent", r.status === 200 && r.json?.ok && mails() === m0 + 1, `${r.status} ${r.ms} ms`);
  ok("Zoho down: the Lead is queued — outside the web root, the webform fields only", queue().length === 1 && !QUEUE.startsWith(WEBROOT) && q?.tries === 1 && q.fields?.["Last Name"] === "Sharma" && !("xnQsjsdp" in (q.fields ?? {})) && Object.keys(q).sort().join() === "alerted,created,fields,form,last,note,queued,received,tries,v", JSON.stringify(q));
  ok("Zoho down: no files in the web root's api folder", !fs.existsSync(path.join(WEBROOT, "api", "private", "zoho-queue")));
}

// 6. Retry on the next form submit: an entry not tried for 10 minutes goes along with the next enquiry.
config();
mode = "ok";
{
  const file = path.join(QUEUE, queue()[0]);
  const e = JSON.parse(fs.readFileSync(file, "utf8"));
  e.last -= 3600;
  fs.writeFileSync(file, JSON.stringify(e));
  got.length = 0;
  await post({ ...CONTACT, name: "Priya Nair", email: "priya.nair@example.com", mobile: "9845012345" });
  await until(() => got.length === 2);
  await sleep(300);
  ok("retry on the next submit: the new Lead and the queued one both reach Zoho; the queue is empty", got.length === 2 && got.some((g) => g.fields["Last Name"] === "Sharma") && got.some((g) => g.fields["Last Name"] === "Nair") && queue().length === 0, `${got.length} requests, queue ${queue().length}`);
}

// 7. Zoho slow (past the timeout): the visitor is not kept waiting; the Lead is queued.
reset();
config({ timeout: 2 });
mode = "slow";
{
  const r = await post(CONTACT);
  ok("Zoho slow: the visitor's answer comes at once (not after Zoho's timeout)", r.status === 200 && r.ms < 1500, `${r.ms} ms`);
  await until(() => queue().length === 1, 8000);
  ok("Zoho slow: timed out -> queued", queue().length === 1, `queue ${queue().length}`);
  await sleep(4500); // let the stand-in finish its late answer
}

// 8. The cron URL: wrong key / no secret -> 404 and nothing done; the right key retries every entry.
mode = "ok";
{
  got.length = 0;
  const bad = await cron("wrong");
  config({ secret: "" });
  const none = await cron("");
  config();
  ok("cron: a wrong key, or no secret configured -> 404, nothing retried", bad.status === 404 && none.status === 404 && got.length === 0 && queue().length === 1, `${bad.status} ${none.status}`);
  const good = await cron();
  ok("cron: the right key retries it -> delivered, the queue is empty (the answer has counts only)", good.status === 200 && good.json?.delivered === 1 && queue().length === 0 && JSON.stringify(good.json).match(/^\{"ok":true,"enabled":true,"delivered":1,"duplicate":0,"failed":0,"expired":0,"waiting":0\}$/), JSON.stringify(good.json));
}

// 9. Duplicate: not queued, not retried; logged without the email or number; the email still sent.
reset();
config();
mode = "dup";
{
  const m0 = mails();
  const r = await post(CONTACT);
  await until(() => got.length === 1);
  await sleep(500);
  const l = log();
  ok("duplicate: 200, the email sent, nothing queued", r.status === 200 && mails() === m0 + 1 && queue().length === 0, `queue ${queue().length}`);
  ok("duplicate: logged as duplicate, Zoho's message masked (no email, no number)", /\tduplicate\terror_msg: Duplicate data found: a Lead with \[email\] \/ \[number\] already exists\./.test(l) && !l.includes("ankit") && !l.includes("9876543210"), l);
}

// 10. An HTML page instead of the webform's JSON answer counts as a failure (queued).
reset();
config();
mode = "html";
{
  await post(CONTACT);
  await until(() => queue().length === 1, 8000);
  ok("an HTML answer (not a clear success) -> failure, queued", queue().length === 1 && /not the webform's JSON answer/.test(readQueue()[0]?.note ?? ""), readQueue()[0]?.note);
}

// 11. Three failures -> one alert to sales@ (not one per try); later success clears it.
reset();
config();
mode = "503";
{
  const alerts = () => subjects().filter((s) => s.startsWith("Zoho CRM: a website enquiry could not be added")).length;
  const a0 = alerts();
  await post(CONTACT); // try 1
  await until(() => queue().length === 1, 8000);
  await cron(); // try 2
  ok("after 2 failed tries: no alert yet", alerts() === a0 && readQueue()[0]?.tries === 2, `tries ${readQueue()[0]?.tries}`);
  await cron(); // try 3 -> alert
  await until(() => alerts() === a0 + 1, 4000);
  const body = mailText().split("----- MESSAGE -----").at(-1) ?? "";
  ok("after the 3rd failed try: one alert email to the enquiry address", alerts() === a0 + 1 && /Form: +Website – Contact form/.test(body) && /Tries: +3/.test(body) && /Last answer: +HTTP 503/.test(body) && /please add the Lead in Zoho by hand/.test(body), body.slice(0, 600));
  await cron(); // try 4: no second alert
  await sleep(500);
  ok("a 4th failed try: no second alert", alerts() === a0 + 1 && readQueue()[0]?.tries === 4 && readQueue()[0]?.alerted === true);
  mode = "ok";
  const c = await cron();
  ok("Zoho back: the cron delivers it; the queue is empty", c.json?.delivered === 1 && queue().length === 0, JSON.stringify(c.json));
}

// 12. 30 days at most in the queue.
reset();
config({ url: "http://127.0.0.1:8839/crm/WebToLeadForm" });
{
  const g0 = got.length;
  const r12 = await post(CONTACT);
  await until(() => queue().length === 1, 8000);
  ok("a config change applies at once (the request used the new action URL)", r12.status === 200 && got.length === g0 && queue().length === 1, `zoho requests ${got.length - g0}, queue ${queue().length}`);
  const file = path.join(QUEUE, queue()[0]);
  const e = JSON.parse(fs.readFileSync(file, "utf8"));
  e.created -= 31 * 86400;
  fs.writeFileSync(file, JSON.stringify(e));
  const c = await cron();
  ok("an entry older than 30 days is removed (logged as expired)", c.json?.expired === 1 && queue().length === 0 && /\texpired\t/.test(log()), JSON.stringify(c.json));
}

// 13. The log never holds personal data.
{
  const l = log();
  ok("the log has no names, emails or numbers from the enquiries", !/Ankit|Sharma|Priya|Nair|ankit\.sharma|priya\.nair|98765|9876543210|9845012345|Suntrop/.test(l), l.slice(0, 300));
}

// 14. api/zoho.php requested directly does nothing; the config is never inside the web root.
{
  const r = await fetch(`${BASE}/api/zoho.php`);
  const text = await r.text();
  ok("api/zoho.php requested directly -> 404, empty", r.status === 404 && text === "", `${r.status} ${text.slice(0, 80)}`);
  ok("the config is outside the web root", !fs.existsSync(path.join(WEBROOT, "zoho-config.php")) && fs.existsSync(path.join(PRIVATE, "zoho-config.php")));
}

// 15. Nothing from the Zoho config is in the built site (or its JavaScript).
if (DIST) {
  const hits = [];
  // (The webform's field names, e.g. LEADCF19, are the mapping in api/zoho.php and may be there.)
  const needles = ["crm.zoho", "WebToLeadForm", "xnQsjsdp", "xmIwtLD", "aG9uZXlwb3Q"];
  // The real webform ids, if the reference copy of the webform source is on this machine.
  const ref = path.join(path.dirname(DIST), "nexera-reference", "zoho", "zoho-webform-source.html");
  if (fs.existsSync(ref)) for (const m of fs.readFileSync(ref, "utf8").matchAll(/name = '(?:xnQsjsdp|xmIwtLD)' value = '([^']+)'/g)) needles.push(m[1]);
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(html|js|css|json|php|xml|txt|webmanifest|svg)$/.test(e.name)) {
        const t = fs.readFileSync(p, "utf8");
        for (const n of needles) if (t.includes(n)) hits.push(`${path.relative(DIST, p)}: ${n.slice(0, 20)}`);
      }
    }
  };
  walk(DIST);
  ok(`nothing from the Zoho config in the built site (${needles.length} markers, incl. the real form ids when available)`, hits.length === 0, hits.join(" | "));
}

// Clean up: switched off, no queue.
reset();
fs.rmSync(path.join(PRIVATE, "zoho-config.php"), { force: true });
server.close();
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
