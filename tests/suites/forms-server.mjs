// Server-side rules: posts straight to api/contact.php (no page, no client checks), as a bot would.
// Usage: MAILS=<mails.log> node forms-server.mjs http://127.0.0.1:8800
// Junk values -> 422 {ok:false, error:"validation", fields:{field: message}} and no email; realistic
// values for each form -> 200 and exactly one email each, with the right subject and lines (State
// included). With Zoho switched off (enabled = false in the config), nothing is sent to Zoho.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const BASE = process.argv[2] ?? "http://127.0.0.1:8800";
const MAILS = process.env.MAILS;
const mailText = () => (MAILS && fs.existsSync(MAILS) ? fs.readFileSync(MAILS, "utf8") : "");
const mails = () => mailText().split("----- MESSAGE -----").length - 1;
const results = [];
const ok = (name, cond, extra = "") => {
  results.push(!!cond);
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
};
const MSG = {
  name: "Please enter your full name.",
  company: "Please enter your company name.",
  email: "Please enter a valid email address.",
  mobile: "Please enter a valid mobile number.",
  city: "Please enter your city or location.",
  requirement: "Please add a unit, e.g. 500 kWh, 2 MW or 3 systems.",
  message: "Please write a few words about your requirement.",
  state: "Please choose your state or union territory.",
};
// Zoho switched off: a config outside the web root (<.work>/nexera-private/zoho-config.php) that points at
// a local endpoint but has enabled = false — the endpoint must never be called.
const PRIVATE = MAILS ? path.join(path.dirname(MAILS), "nexera-private") : null;
let zohoCalls = 0;
const zoho = http.createServer((req, res) => {
  zohoCalls++;
  req.resume();
  res.end('{"actionsubmit":"Splash Message","actionvalue":"ok"}');
});
await new Promise((r) => zoho.listen(8832, "127.0.0.1", r));
if (PRIVATE) {
  fs.mkdirSync(PRIVATE, { recursive: true });
  fs.writeFileSync(
    path.join(PRIVATE, "zoho-config.php"),
    `<?php return ["enabled" => false, "action_url" => "http://127.0.0.1:8832/crm/WebToLeadForm", "hidden" => ["formA" => str_repeat("a", 40), "formB" => str_repeat("b", 40)], "cron_secret" => str_repeat("s", 30)];\n`
  );
}
const post = async (body) => {
  const now = Date.now();
  const res = await fetch(`${BASE}/api/contact.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ startedAt: now - 5000, sentAt: now, website: "", page: "/test", ...body }),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
};

const JUNK = { name: "11", company: "111", email: "111@gmail.com", mobile: "11", city: "111", state: "Karnatka", requirement: "11", message: "1111" };

// 1. The brief's junk set, sent as each form would send it.
for (const [label, extra] of [
  ["/contact (full)", { interest: "ci", source: "full" }],
  ["homepage (full)", { interest: "home", source: "full" }],
  ["call-back widget (quick)", { interest: "ci", source: "quick" }],
  ["Become a Partner (partner)", { interest: "epc", source: "partner" }],
]) {
  const n0 = mails();
  const r = await post({ ...JUNK, ...extra });
  const f = r.json?.fields ?? {};
  const want = Object.keys(JUNK);
  const exact = want.every((k) => f[k] === MSG[k]);
  ok(`${label}: junk set -> 422 validation, every field named with its message, no email`, r.status === 422 && r.json?.ok === false && r.json?.error === "validation" && exact && mails() === n0, `${r.status} ${JSON.stringify(f)}`);
}
// The answer never echoes what was sent.
{
  const r = await post({ ...JUNK, name: "<script>x</script>", interest: "ci" });
  ok("the 422 answer never echoes the input", r.status === 422 && !JSON.stringify(r.json).includes("<script>"), JSON.stringify(r.json));
}
// "27862" as an expected requirement; a bare-number company; all-same / ascending mobiles.
for (const [label, body, field] of [
  ["expected requirement '27862'", { requirement: "27862" }, "requirement"],
  ["mobile 9999999999", { mobile: "9999999999" }, "mobile"],
  ["mobile +1234567890", { mobile: "+1234567890" }, "mobile"],
  ["mobile +91 12345 67890 (an Indian number held to the Indian rule)", { mobile: "+91 12345 67890" }, "mobile"],
  ["gmail with 5 characters", { email: "abcde@gmail.com" }, "email"],
  ["name with digits", { name: "Ankit2" }, "name"],
]) {
  const n0 = mails();
  const r = await post({ name: "Ankit Sharma", mobile: "9876543210", state: "Karnataka", interest: "ci", source: "full", ...body });
  ok(`${label} -> 422 on ${field} only`, r.status === 422 && Object.keys(r.json?.fields ?? {}).join() === field && mails() === n0, JSON.stringify(r.json));
}
// Required by form: the partner form needs email, company and city (not mobile); the others need mobile.
// State is required on every form.
{
  const r = await post({ name: "Ankit Sharma", interest: "epc", source: "partner", state: "" });
  ok("partner: email, company, city and state required; phone optional", r.status === 422 && ["company", "email", "city", "state"].every((k) => r.json.fields[k] === MSG[k]) && !r.json.fields.mobile, JSON.stringify(r.json));
  const r2 = await post({ name: "Ankit Sharma", interest: "ci", source: "full", state: "" });
  ok("full / quick: mobile and state required", r2.status === 422 && r2.json.fields.mobile === MSG.mobile && r2.json.fields.state === MSG.state, JSON.stringify(r2.json));
  for (const [label, state] of [["the old \"-None-\"", "-None-"], ["lower case", "karnataka"], ["a city", "Bengaluru"]]) {
    const r4 = await post({ name: "Ankit Sharma", mobile: "9876543210", interest: "ci", source: "quick", state });
    ok(`state: ${label} -> 422 on state only`, r4.status === 422 && Object.keys(r4.json?.fields ?? {}).join() === "state", JSON.stringify(r4.json));
  }
  const r3 = await post({ name: "Ankit Sharma", mobile: "9876543210", state: "Karnataka", interest: "oem", source: "full" });
  ok("brand / OEM path: company required", r3.status === 422 && r3.json.fields.company === MSG.company, JSON.stringify(r3.json));
}
// The existing guards still run (honeypot, minimum fill time).
{
  const n0 = mails();
  const r = await post({ name: "Ankit Sharma", mobile: "9876543210", interest: "ci", website: "http://spam" });
  const now = Date.now();
  const fast = await fetch(`${BASE}/api/contact.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Ankit Sharma", mobile: "9876543210", interest: "ci", startedAt: now - 500, sentAt: now }) });
  ok("honeypot -> 400 rejected; under 3 s -> 400 too_fast; no email", r.status === 400 && r.json.error === "rejected" && fast.status === 400 && (await fast.json()).error === "too_fast" && mails() === n0);
}

// 2. Realistic values for each form: sent, one email each (the rate limit allows 5 per hour per IP).
const REAL = [
  ["/contact", { name: "Ankit Sharma", mobile: "98765 43210", email: "ankit.sharma@gmail.com", state: "Karnataka", interest: "ci", source: "full", message: "We are planning a 500 kWh C&I system for our plant and would like a quote." }, "New website enquiry: Commercial & Industrial – Ankit Sharma"],
  ["call-back widget", { name: "K. S. Rao", mobile: "+91-9876543210", state: "Dadra and Nagar Haveli and Daman and Diu", interest: "home", source: "quick" }, "Call-back request: Home storage – K. S. Rao"],
  [
    "Become a Partner",
    { name: "K. S. Rao", mobile: "+44 20 7946 0958", email: "info@company.co.in", company: "3M India", city: "Bengaluru 560001", state: "Karnataka", requirement: "500 kWh", interest: "epc", source: "partner", message: "We are an EPC in Karnataka planning C&I storage projects.", details: { enquiry: "EPC / Project Partnership", company_type: "EPC", application: "Commercial & Industrial" } },
    "Partner enquiry: EPC / installer partnership – K. S. Rao",
  ],
  // A page loaded before State was added sends no `state` key at all: still accepted (no State line).
  ["an older page (no state key)", { name: "Ankit Sharma", mobile: "98765 43210", interest: "ci", source: "quick" }, "Call-back request: Business / C&I – Ankit Sharma"],
];
for (const [label, body, subject] of REAL) {
  const n0 = mails();
  const r = await post(body);
  // let the mail land in the sink
  for (let i = 0; i < 20 && mails() === n0; i++) await new Promise((res) => setTimeout(res, 150));
  const last = mailText().split("----- MESSAGE -----").at(-1) ?? "";
  const subj = (last.match(/^Subject: =\?UTF-8\?B\?([^?]+)\?=/m) || [])[1];
  const decoded = subj ? Buffer.from(subj, "base64").toString("utf8") : "";
  ok(`${label}: realistic values -> 200, one email to sales@, subject "${subject}"`, r.status === 200 && r.json?.ok && mails() === n0 + 1 && decoded === subject && /^To: leads-test@example\.com\r?$/m.test(last), `${r.status} ${decoded}`);
  if (body.source === "partner") ok("partner email carries the requirement, location and company", /Requirement: +500 kWh/.test(last) && /City: +Bengaluru 560001/.test(last) && /Company: +3M India/.test(last) && /Source: Become a Partner form/.test(last));
  if ("state" in body) ok(`${label}: the email has the State line, after City`, new RegExp(`City: [^\\n]*\\nState: +${body.state.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\r?\\n`).test(last));
  else ok(`${label}: no State line`, !/^State:/m.test(last));
}

// 3. Email routing (NEXERA_ROUTES in api/contact.php). The test build has leads-test@ for sales@ and
//    routed-test@ for every routed address (tests/prepare.sh); the source file must name the real ones.
{
  const src = fs.readFileSync(new URL("../../public/api/contact.php", import.meta.url), "utf8");
  const route = src.match(/const NEXERA_ROUTES = \[([\s\S]*?)\n\];/)?.[1] ?? "";
  ok(
    "routing table: sales@ by default; distributorship (contact / home, partner and call-back forms, not datasheets) -> ankit@nexerapower.com",
    /const NEXERA_LEADS_TO = "sales@nexerapower\.com";/.test(src) &&
      /\["to" => "ankit@nexerapower\.com", "sources" => \["full", "partner", "quick"\], "interests" => \["distributor"\], "except_enquiry" => \["Datasheet request"\]\]/.test(route) &&
      (route.match(/"to" =>/g) ?? []).length === 1,
    route.trim()
  );
}
const lastTo = () => ((mailText().split("----- MESSAGE -----").at(-1) ?? "").match(/^To: *(.+?)\r?$/m) || [])[1] ?? "";
const clearRate = () => PRIVATE && fs.rmSync(path.join(PRIVATE, "ratelimit"), { recursive: true, force: true });
const SALES = "leads-test@example.com";
const ROUTED = "routed-test@example.com";
const ASK = { name: "Ankit Sharma", mobile: "98765 43210", email: "ankit.sharma@gmail.com", state: "Karnataka", message: "We would like to become a distributor in Karnataka." };
const PARTNER = { name: "K. S. Rao", email: "info@company.co.in", company: "3M India", city: "Bengaluru", state: "Karnataka", requirement: "500 kWh", source: "partner" };
for (const [label, body, want] of [
  ["home form, Distributorship", { ...ASK, interest: "distributor", source: "full", page: "/" }, ROUTED],
  ["/contact, Distributorship", { ...ASK, interest: "distributor", source: "full", page: "/contact", details: { enquiry: "General enquiry" } }, ROUTED],
  ["Become a Partner, Distributor application", { ...PARTNER, interest: "distributor", details: { enquiry: "Distributor application", company_type: "Other", application: "Residential" } }, ROUTED],
  ["Become a Partner, EPC / Project Partnership", { ...PARTNER, interest: "epc", details: { enquiry: "EPC / Project Partnership", company_type: "EPC", application: "Commercial & Industrial" } }, SALES],
  ["/contact, EPC / installer partnership", { ...ASK, interest: "epc", source: "full", page: "/contact" }, SALES],
  ["datasheet request (even with Distributorship chosen)", { ...ASK, interest: "distributor", source: "full", page: "/contact?datasheet=tcl-blueark-x5", details: { enquiry: "Datasheet request", product: "TCL BlueArk X5" } }, SALES],
  ["call-back widget, Becoming a distributor", { name: "K. S. Rao", mobile: "9876543210", state: "Karnataka", interest: "distributor", source: "quick" }, ROUTED],
  ["call-back widget, Home storage", { name: "K. S. Rao", mobile: "9876543210", state: "Karnataka", interest: "home", source: "quick" }, SALES],
  ["/contact, Commercial & Industrial", { ...ASK, interest: "ci", source: "full", page: "/contact" }, SALES],
]) {
  clearRate();
  const n0 = mails();
  const r = await post(body);
  for (let i = 0; i < 20 && mails() === n0; i++) await new Promise((res) => setTimeout(res, 150));
  const to = lastTo();
  ok(`routing: ${label} -> ${want === ROUTED ? "the routed address (Ankit)" : "sales@"}, one email`, r.status === 200 && mails() === n0 + 1 && to === want, `${r.status} to ${to}`);
}
clearRate();

ok("Zoho switched off: no request reached the (local) Zoho endpoint", zohoCalls === 0, `${zohoCalls} request(s)`);
zoho.close();
if (PRIVATE) fs.rmSync(path.join(PRIVATE, "zoho-config.php"), { force: true });

const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
