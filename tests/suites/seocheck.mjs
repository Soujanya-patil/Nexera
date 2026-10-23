// Checks the built pages for the changed routes: one title/description/canonical/h1, JSON-LD parses,
// FAQ JSON-LD text appears word for word in the visible page, keyword phrases present.
import fs from "node:fs";
const dist = process.argv[2];
const file = (p) => `${dist}/${p === "/" ? "index" : p.slice(1)}.html`;
const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
const visible = (html) => decode(html.replace(/<head>[\s\S]*?<\/head>/, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
const KW = {
  "/solutions/residential": ["solar battery for home", "Home battery backup"],
  "/solutions/commercial-industrial": ["commercial battery storage system", "Peak Shaving"],
  "/solutions/utility-scale": ["containerised battery storage", "BESS container"],
  "/become-a-partner": ["Become a BESS Distributor", "lithium battery distributorship", "Build More. Store Smarter."],
  "/service-training": ["BESS installation", "BESS commissioning", "BESS technician training", "Where can EPC technicians get hands-on BESS training in South India?"],
};
let bad = 0;
for (const p of ["/", "/solutions", "/solutions/commercial-industrial", "/solutions/residential", "/solutions/utility-scale", "/products", "/become-a-partner", "/service-training", "/where-we-operate", "/resources"]) {
  const h = fs.readFileSync(file(p), "utf8");
  const count = (re) => (h.match(re) || []).length;
  const title = decode(h.match(/<title>([^<]*)<\/title>/)[1]);
  const desc = decode(h.match(/<meta name="description" content="([^"]*)"/)[1]);
  const canon = h.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const ogt = decode(h.match(/<meta property="og:title" content="([^"]*)"/)?.[1] ?? "");
  const ogd = decode(h.match(/<meta property="og:description" content="([^"]*)"/)?.[1] ?? "");
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const want = "https://nexerapower.com" + (p === "/" ? "/" : p);
  const vis = visible(h);
  const faq = ld.flatMap((g) => g["@graph"]).find((n) => n["@type"] === "FAQPage");
  const faqMiss = faq ? faq.mainEntity.flatMap((q) => [q.name, q.acceptedAnswer.text]).filter((t) => !vis.includes(t)) : [];
  const h1 = count(/<h1[\s>]/g);
  const kwMiss = (KW[p] || []).filter((k) => !vis.includes(k));
  const h3peak = p === "/solutions/commercial-industrial" ? /<h3[^>]*>Peak Shaving<\/h3>/.test(h) : true;
  const ok = count(/<title>/g) === 1 && count(/<meta name="description"/g) === 1 && count(/rel="canonical"/g) === 1 && canon === want && ld.length === 1 && h1 === 1 && ogt === title && ogd === desc && !faqMiss.length && !kwMiss.length && h3peak;
  if (!ok) bad++;
  console.log(`${ok ? "OK  " : "BAD "} ${p.padEnd(34)} h1=${h1} ld=${ld.length} canon=${canon === want} og=${ogt === title && ogd === desc} faq=${faq ? faq.mainEntity.length + " (all visible: " + !faqMiss.length + ")" : "-"}${kwMiss.length ? " MISSING " + kwMiss.join(" | ") : ""}${h3peak ? "" : " no Peak Shaving h3"}`);
  if (faqMiss.length) console.log("   not visible:", faqMiss.map((t) => t.slice(0, 80)));
}
process.exit(bad ? 1 : 0);
