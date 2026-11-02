/*
 * Post-build: one HTML file per route, with that route's metadata already in <head>, for crawlers
 * that don't run JavaScript. Runs after `vite build` (npm run build).
 *
 * For every route in src/seo/routes.js, dist/index.html is copied to dist/<path>.html (the homepage
 * rewrites dist/index.html itself) with the generic <title> and description removed and the route's
 * title, description, canonical, Open Graph and Twitter tags injected, plus one JSON-LD structured
 * data block (the only place it is emitted, so each URL has exactly one copy). Page bodies are not
 * pre-rendered: every file is the same app shell, and React renders the page as before.
 * public/.htaccess serves /about from about.html (and so on) without a redirect. It also writes
 * dist/404.html — the same shell with the not-found title and a noindex, no canonical — which the
 * server returns, with a 404 status, for every URL that isn't a route or a real file.
 *
 * routes.js imports the product catalogue, which imports images, so it is loaded through a small Vite
 * SSR build (same config, same content hashes): product images resolve to the very /assets/ URLs the
 * client build emitted. It writes dist/sitemap.xml from routes.js (every route except a `noindex` one,
 * each with the built commit's date as lastmod) and the article-URL redirects into dist/.htaccess. The
 * build fails if a limit is broken, a title or description is duplicated, a route or an internal link
 * isn't spelled in lowercase, or an image is missing.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const tmp = path.join(root, "node_modules", ".cache", "seo-routes");

// --- Load routes.js and the page renderer through Vite ---------------------------------------------
// One SSR build: src/seo/routes.js (the route table) and src/entry-server.jsx (the pre-renderer).
await build({
  root,
  logLevel: "warn",
  build: {
    ssr: true,
    rollupOptions: { input: { routes: "src/seo/routes.js", server: "src/entry-server.jsx" } },
    outDir: tmp,
    emptyOutDir: true,
    copyPublicDir: false,
  },
});
const entry = fs.readdirSync(tmp).find((f) => /^routes\.m?js$/.test(f));
const serverEntry = fs.readdirSync(tmp).find((f) => /^server\.m?js$/.test(f));
const { render } = await import(pathToFileURL(path.join(tmp, serverEntry)).href);
const {
  ROUTES,
  SITE_URL,
  TITLE_SUFFIX,
  TITLE_MAX,
  DESCRIPTION_MAX,
  DEFAULT_OG_IMAGE,
  OG_IMAGE_MIN_WIDTH,
  NOT_FOUND_TITLE,
  ORGANIZATION,
  LOCAL_BUSINESS,
  PREVIEW_ROUTES,
} = await import(pathToFileURL(path.join(tmp, entry)).href);

// --- Checks -----------------------------------------------------------------------------------
const problems = [];
// The sitemap: every route search engines should index — not a `noindex` one (e.g. a product kept off
// the catalogue). Written to dist/sitemap.xml once the checks pass.
const sitemap = ROUTES.filter((r) => !r.noindex).map((r) => r.canonical);
// lastmod: the date of the commit being built (the build date where there is no git history).
let lastmod = "";
try {
  lastmod = execFileSync("git", ["log", "-1", "--format=%cs"], { cwd: root, encoding: "utf8" }).trim();
} catch {}
if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) lastmod = new Date().toISOString().slice(0, 10);
// One spelling per URL: every route is lowercase (an article's other spellings 301 to it, below).
for (const r of ROUTES) if (r.path !== r.path.toLowerCase()) problems.push(`${r.path}: route paths must be lowercase`);
const seen = { title: new Map(), description: new Map() };
for (const r of ROUTES) {
  if (r.title.length >= TITLE_MAX) problems.push(`${r.path}: title is ${r.title.length} characters (limit < ${TITLE_MAX})`);
  if (!r.title.endsWith(TITLE_SUFFIX)) problems.push(`${r.path}: title must end with "${TITLE_SUFFIX.trim()}"`);
  if (r.description.length >= DESCRIPTION_MAX)
    problems.push(`${r.path}: description is ${r.description.length} characters (limit < ${DESCRIPTION_MAX})`);
  if (r.canonical !== SITE_URL + r.path) problems.push(`${r.path}: canonical ${r.canonical} is not ${SITE_URL + r.path}`);
  if (r.path !== "/" && r.path.endsWith("/")) problems.push(`${r.path}: trailing slash`);
  for (const key of ["title", "description"]) {
    if (seen[key].has(r[key])) problems.push(`${r.path}: same ${key} as ${seen[key].get(r[key])}`);
    seen[key].set(r[key], r.path);
  }
}

// --- Share images: a route's own image only if it exists in dist and is wide enough ----------
/** Pixel width of a PNG, JPEG or WebP file (header parse only). */
function imageWidth(file) {
  const b = fs.readFileSync(file);
  if (b.toString("ascii", 1, 4) === "PNG") return b.readUInt32BE(16);
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8X") return 1 + b.readUIntLE(24, 3);
    if (chunk === "VP8L") return 1 + (b.readUInt16LE(21) & 0x3fff);
    if (chunk === "VP8 ") return b.readUInt16LE(26) & 0x3fff;
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i < b.length; ) {
      const marker = b[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return b.readUInt16BE(i + 7);
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  throw new Error(`can't read the width of ${file}`);
}
const distFile = (url) => path.join(dist, decodeURIComponent(url));
if (!fs.existsSync(distFile(DEFAULT_OG_IMAGE))) problems.push(`default share image missing: dist${DEFAULT_OG_IMAGE}`);
// Only JPG or PNG: some link previews (LinkedIn, several messaging apps) don't show WebP or AVIF.
const ogFor = (r) => {
  if (r.ogImage === DEFAULT_OG_IMAGE || !r.ogImage.startsWith("/")) return DEFAULT_OG_IMAGE;
  if (!/\.(jpe?g|png)$/i.test(r.ogImage)) return DEFAULT_OG_IMAGE;
  if (!fs.existsSync(distFile(r.ogImage))) {
    problems.push(`${r.path}: image ${r.ogImage} is not in dist`);
    return DEFAULT_OG_IMAGE;
  }
  return imageWidth(distFile(r.ogImage)) >= OG_IMAGE_MIN_WIDTH ? r.ogImage : DEFAULT_OG_IMAGE;
};
const resolved = ROUTES.map((r) => ({ ...r, ogImage: ogFor(r) }));

// --- Structured data: one JSON-LD @graph per page, only here (never rendered at runtime) --------
// Organization on every page; WebSite on the homepage; BreadcrumbList on every other route
// (Home > Page, Home > Products > Product, named like the page titles; or the route's own `crumbs`,
// e.g. Home > Solutions > Utility-Scale); Product on product pages, from the catalogue only — brand
// is the partner, never NEXERA; no offers, prices or ratings; FAQPage where a route has an FAQ.
const ORG_ID = `${SITE_URL}/#organization`;
const organization = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: ORGANIZATION.name,
  legalName: ORGANIZATION.legalName,
  alternateName: ORGANIZATION.alternateName,
  url: `${SITE_URL}/`,
  logo: { "@type": "ImageObject", url: SITE_URL + ORGANIZATION.logo },
  description: ORGANIZATION.description,
  address: {
    "@type": "PostalAddress",
    streetAddress: ORGANIZATION.address.street,
    addressLocality: ORGANIZATION.address.locality,
    addressRegion: ORGANIZATION.address.region,
    postalCode: ORGANIZATION.address.postalCode,
    addressCountry: ORGANIZATION.address.country,
  },
  ...(ORGANIZATION.telephone ? { telephone: ORGANIZATION.telephone } : {}),
};
// The homepage and the contact page: the same node is also the LocalBusiness (same names, address and
// phone as on every page, plus the opening hours).
const localBusiness = {
  ...organization,
  "@type": ["Organization", "LocalBusiness"],
  image: SITE_URL + DEFAULT_OG_IMAGE,
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: LOCAL_BUSINESS.hours.days,
    opens: LOCAL_BUSINESS.hours.opens,
    closes: LOCAL_BUSINESS.hours.closes,
  },
};
if (!fs.existsSync(distFile(ORGANIZATION.logo))) problems.push(`Organization logo missing: dist${ORGANIZATION.logo}`);
// A route's short name for breadcrumbs: its `label` (routes.js) where it has one, else its title.
const pageName = (r) => r.label ?? r.title.slice(0, -TITLE_SUFFIX.length);
const productsRoute = ROUTES.find((r) => r.path === "/products");
/** Trail items are routes (named like their titles) or [name, path] pairs from a route's `crumbs`. */
const breadcrumbs = (trail) => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map((r, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: Array.isArray(r) ? r[0] : r.path === "/" ? "Home" : pageName(r),
    item: Array.isArray(r) ? SITE_URL + r[1] : r.canonical,
  })),
});
const home = ROUTES.find((r) => r.path === "/");
function graphFor(r) {
  const nodes = [r?.localBusiness ? localBusiness : organization];
  if (!r) return nodes; // 404.html
  if (r.path === "/") {
    nodes.push({ "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: ORGANIZATION.name, url: `${SITE_URL}/`, publisher: { "@id": ORG_ID } });
  } else {
    nodes.push(breadcrumbs(r.crumbs ? [home, ...r.crumbs] : r.product ? [home, productsRoute, r] : [home, r]));
  }
  if (r.product) {
    nodes.push({
      "@type": "Product",
      "@id": `${r.canonical}#product`,
      name: r.product.name,
      description: r.product.description,
      ...(r.product.image ? { image: SITE_URL + r.product.image } : {}), // none for a product without a photo
      url: r.canonical,
      brand: { "@type": "Brand", name: r.product.brand },
    });
  }
  // An article (data/articles.js): written and published by the Organization.
  if (r.article) {
    nodes.push({
      "@type": "Article",
      "@id": `${r.canonical}#article`,
      headline: r.article.headline,
      description: r.description,
      image: SITE_URL + r.ogImage,
      datePublished: r.article.datePublished,
      dateModified: r.article.dateModified,
      author: { "@type": "Organization", "@id": ORG_ID, name: ORGANIZATION.name, url: `${SITE_URL}/` },
      publisher: { "@type": "Organization", "@id": ORG_ID, name: ORGANIZATION.name, logo: { "@type": "ImageObject", url: SITE_URL + ORGANIZATION.logo } },
      mainEntityOfPage: { "@type": "WebPage", "@id": r.canonical },
    });
  }
  // The Blog (/blog): a Blog listing each article as a BlogPosting (the cards the page shows).
  if (r.blog) {
    nodes.push({
      "@type": "Blog",
      "@id": `${r.canonical}#blog`,
      name: pageName(r),
      url: r.canonical,
      publisher: { "@id": ORG_ID },
      blogPost: r.blog.map((p) => ({ "@type": "BlogPosting", headline: p.headline, url: SITE_URL + p.path, datePublished: p.datePublished })),
    });
  }
  // The page's visible FAQ, word for word (both come from the same data as the page).
  if (r.faq) {
    nodes.push({
      "@type": "FAQPage",
      "@id": `${r.canonical}#faq`,
      mainEntity: r.faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    });
  }
  return nodes;
}
/** The <script> for a page, after checking what goes into it. */
function jsonLd(r) {
  const where = r ? r.path : "404.html";
  const graph = { "@context": "https://schema.org", "@graph": graphFor(r) };
  const json = JSON.stringify(graph);
  JSON.parse(json); // throws on anything that isn't plain JSON
  const types = graph["@graph"].map((n) => n["@type"]);
  if (new Set(types).size !== types.length) problems.push(`${where}: duplicate @type in JSON-LD (${types.join(", ")})`);
  (function walk(v, key) {
    if (Array.isArray(v)) return v.forEach((x) => walk(x, key));
    if (v && typeof v === "object") return Object.entries(v).forEach(([k, x]) => walk(x, k));
    if (!["url", "@id", "image", "item"].includes(key)) return;
    if (!v.startsWith(`${SITE_URL}/`)) problems.push(`${where}: JSON-LD ${key} is not an absolute ${SITE_URL}/ URL: ${v}`);
    if (key === "image" && !fs.existsSync(distFile(v.slice(SITE_URL.length)))) problems.push(`${where}: JSON-LD image not in dist: ${v}`);
  })(graph);
  // "<" escaped so the JSON can never close the script element early.
  return `<script type="application/ld+json">${json.replace(/</g, "\\u003c")}</script>`;
}
const scripts = new Map(resolved.map((r) => [r.path, jsonLd(r)]));
const notFoundScript = jsonLd(null);

// --- Article URLs: one spelling ----------------------------------------------------------------------
// Any other spelling of an article's URL — other letter case, .html, a trailing slash, or the old
// /resources/<slug> — answers with a 301 to the lowercase /blog/<slug>, before the server would look
// for a file (on Linux a mixed-case URL is otherwise a 404). Written into dist/.htaccess where
// public/.htaccess has its marker. Matched on the request line (THE_REQUEST), which internal
// rewrites never change, so the page's own URL (rewritten to its .html file) can't loop.
const HTACCESS_MARKER = /^[ \t]*# @article-urls\b.*$/m;
const htaccessPath = path.join(dist, ".htaccess");
const htaccess = fs.readFileSync(htaccessPath, "utf8");
if (!HTACCESS_MARKER.test(htaccess)) problems.push("public/.htaccess: the # @article-urls marker is missing");
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const articleRules = ROUTES.filter((r) => r.article).map((r) => {
  const slug = r.path.slice("/blog/".length);
  return [
    `  # ${r.path}: any other spelling -> 301`,
    `  RewriteCond %{THE_REQUEST} !\\s${reEsc(r.path)}[?\\s]`,
    `  RewriteRule ^(?:blog|resources)/${reEsc(slug)}(?:\\.html)?/?$ ${r.path} [NC,R=301,L]`,
  ].join("\n");
});

if (problems.length) {
  console.error(`\nseo-pages: ${problems.length} problem(s):\n  ${problems.join("\n  ")}\n`);
  process.exit(1);
}

fs.writeFileSync(htaccessPath, htaccess.replace(HTACCESS_MARKER, articleRules.join("\n") || "  # (no articles)"));
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap
    .map((u) => `  <url><loc>${u}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`
);

// --- Pre-rendered page markup ---------------------------------------------------------------------
/** The route's markup from the pre-renderer; fails the build if it is empty or has no <h1>. */
async function renderPage(url) {
  // React adds <link rel="preload" as="image"> for images it renders; the <img> elements are in the
  // markup itself, so the browser finds them anyway — dropped (no image preloads on these pages).
  const markup = (await render(url)).replace(/<link rel="preload" as="image"[^>]*\/?>/g, "");
  if (!markup || !/<h1[\s>]/.test(markup)) throw new Error(`pre-render of ${url} produced no page (no <h1>)`);
  if (/<script[\s>]/.test(markup)) throw new Error(`pre-render of ${url} left inline scripts (a part was streamed in, not rendered in place)`);
  return markup;
}
// The root's content is replaced whatever it holds (so re-running the script on a built dist is safe).
const ROOT = /<div id="root">[\s\S]*<\/div>(\s*<\/body>)/;
const withMarkup = (html, markup) => {
  if (!ROOT.test(html)) throw new Error('index.html: <div id="root"> before </body> not found');
  return html.replace(ROOT, (_, end) => `<div id="root">${markup}</div>${end}`);
};

// --- Write the pages --------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
let shell = fs
  .readFileSync(path.join(dist, "index.html"), "utf8")
  .replace(/\s*<title>[\s\S]*?<\/title>/, "")
  .replace(/\s*<meta name="description"[^>]*>/, "");
if (/<title>|name="description"/.test(shell)) throw new Error("dist/index.html: generic title/description not removed");

// The app starts once the pre-rendered page has painted: its script is only requested after the first
// contentful paint has reached the screen (the paint timing entry — not merely the first frame begun,
// which on a page heavy to draw can be presented much later), so the first screen's HTML, CSS, fonts
// and hero image have the connection to themselves, and the first paint (and the LCP) never waits for
// JavaScript to download, compile and hydrate. The page is complete HTML meanwhile (links work as plain
// links). Without paint timing it starts after the first frame; a background tab, where nothing
// paints, starts it on a timer.
const APP_SCRIPT = /<script type="module" crossorigin src="(\/assets\/[^"]+\.js)"><\/script>/;
const appStart = (src) =>
  `<script type="module">let s=0;const go=()=>s||(s=1,import("${src}"));try{if(!PerformanceObserver.supportedEntryTypes.includes("paint"))throw 0;new PerformanceObserver(l=>{l.getEntries().some(e=>e.name==="first-contentful-paint")&&setTimeout(go)}).observe({type:"paint",buffered:!0})}catch{requestAnimationFrame(()=>setTimeout(go))}setTimeout(go,1500)</script>`;
if (!APP_SCRIPT.test(shell)) throw new Error("dist/index.html: the app's module script was not found");
shell = shell.replace(APP_SCRIPT, (_, src) => appStart(src));

for (const r of resolved) {
  const image = SITE_URL + r.ogImage;
  // A `noindex` route (not in the sitemap): a robots noindex instead of the canonical, and no
  // structured data; title, description and link-preview tags as usual.
  const head = [
    `<title>${esc(r.title)}</title>`,
    `<meta name="description" content="${esc(r.description)}" />`,
    r.noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${esc(r.canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(r.title)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
    `<meta property="og:url" content="${esc(r.canonical)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    r.noindex ? null : scripts.get(r.path),
  ]
    .filter(Boolean)
    .join("\n    ");
  let html = shell.replace(/\s*<\/head>/, `\n    ${head}\n  </head>`);
  // The page itself, pre-rendered (the browser hydrates it): visible before any JavaScript runs.
  html = withMarkup(html, await renderPage(r.path));
  const out = r.path === "/" ? path.join(dist, "index.html") : path.join(dist, `${r.path.slice(1)}.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}
// The not-found page: same app shell (React renders the NotFound page), not indexed, no canonical.
fs.writeFileSync(
  path.join(dist, "404.html"),
  withMarkup(
    shell.replace(
      /\s*<\/head>/,
      `\n    <title>${esc(NOT_FOUND_TITLE)}</title>\n    <meta name="robots" content="noindex" />\n    ${notFoundScript}\n  </head>`
    ),
    await renderPage("/404")
  )
);
// Preview pages (routes.js PREVIEW_ROUTES, e.g. a draft article in development): pre-rendered like any page, but not
// indexed — title and noindex only (no description, canonical, social tags or JSON-LD), and never in
// the sitemap. The server serves them like any route (/x -> x.html).
for (const r of PREVIEW_ROUTES) {
  if (ROUTES.some((x) => x.path === r.path) || sitemap.includes(SITE_URL + r.path)) throw new Error(`${r.path}: a preview page must not be a sitemap route`);
  const html = withMarkup(
    shell.replace(/\s*<\/head>/, `\n    <title>${esc(r.title)}</title>\n    <meta name="robots" content="noindex" />\n  </head>`),
    await renderPage(r.path)
  );
  fs.writeFileSync(path.join(dist, `${r.path.slice(1)}.html`), html);
}
fs.rmSync(tmp, { recursive: true, force: true });

// --- Images: every <img> in the built pages has an alt ------------------------------------------
// Search engines read these pages (Bing's Site Scan reports any image without a description).
// alt="" is accepted only for an image marked presentational (role="presentation" / "none") or
// sitting inside aria-hidden="true"; anything else fails the build, naming the page and the image.
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
function imageProblems(page, html) {
  const out = [];
  const stack = [];
  const markup = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "");
  for (const [, close, tag, attrs, selfClose] of markup.matchAll(/<(\/?)([a-zA-Z][\w-]*)\b([^>]*?)(\/?)>/g)) {
    const name = tag.toLowerCase();
    if (close) {
      const i = stack.map((e) => e.name).lastIndexOf(name);
      if (i >= 0) stack.length = i;
      continue;
    }
    if (name === "img") {
      const alt = attrs.match(/\salt="([^"]*)"/);
      const src = (attrs.match(/\ssrc="([^"]*)"/) || [])[1] ?? "?";
      const hidden = /\saria-hidden="true"/.test(attrs) || stack.some((e) => e.hidden);
      if (!alt) out.push(`${page}: <img> without alt: ${src}`);
      else if (!alt[1].trim() && !/\srole="(presentation|none)"/.test(attrs) && !hidden)
        out.push(`${page}: <img alt=""> not marked role="presentation" or inside aria-hidden: ${src}`);
      continue;
    }
    if (!VOID.has(name) && !selfClose) stack.push({ name, hidden: /\saria-hidden="true"/.test(attrs) });
  }
  return out;
}
const htmlFiles = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith(".html")) htmlFiles.push(p);
  }
})(dist);
const imgProblems = htmlFiles.flatMap((f) => imageProblems(path.relative(dist, f).split(path.sep).join("/"), fs.readFileSync(f, "utf8")));
if (imgProblems.length) {
  console.error(`\nseo-pages: ${imgProblems.length} image(s) without a usable alt:\n  ${imgProblems.join("\n  ")}\n`);
  process.exit(1);
}
console.log(`seo-pages: every <img> in ${htmlFiles.length} HTML files has an alt`);

// --- Page content: every route's file has its page in #root, exactly its one <h1>, and exactly
// one non-empty <title> and meta description in its <head> -----------------------------------------
// Read back from the files as written (what gets deployed). A crawler that doesn't run JavaScript sees
// only this, so an empty root, a missing or second <h1>, or a heading other than the route's `h1`
// (routes.js) fails the build, naming the page and the reason.
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const plain = (s) =>
  s
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
      e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENTITIES[e.toLowerCase()] ?? m
    )
    .replace(/\s+/g, " ")
    .trim();
const pageProblems = [];
for (const r of resolved) {
  const file = r.path === "/" ? "index.html" : `${r.path.slice(1)}.html`;
  const html = fs.readFileSync(path.join(dist, file), "utf8");
  const headPart = html.slice(0, html.indexOf("</head>"));
  const titles = [...headPart.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((m) => m[1].trim());
  const descriptions = [...headPart.matchAll(/<meta name="description" content="([^"]*)"/g)].map((m) => m[1].trim());
  if (titles.length !== 1 || !titles[0]) pageProblems.push(`${r.path} (${file}): ${titles.length} <title> in <head>${titles.length === 1 ? " (empty)" : ""} (expected exactly 1, not empty)`);
  if (descriptions.length !== 1 || !descriptions[0]) pageProblems.push(`${r.path} (${file}): ${descriptions.length} meta description in <head>${descriptions.length === 1 ? " (empty)" : ""} (expected exactly 1, not empty)`);
  const root = html.match(/<div id="root">([\s\S]*)<\/div>\s*<\/body>/);
  if (!root || !plain(root[1])) pageProblems.push(`${r.path} (${file}): #root is empty`);
  const h1s = [...html.matchAll(/<h1[\s>][\s\S]*?<\/h1>/g)].map((m) => plain(m[0]));
  if (h1s.length !== 1) pageProblems.push(`${r.path} (${file}): ${h1s.length} <h1> (expected exactly 1)${h1s.length ? `: ${h1s.map((h) => `"${h}"`).join(", ")}` : ""}`);
  else if (!r.h1) pageProblems.push(`${r.path}: no expected h1 in routes.js (renders "${h1s[0]}")`);
  else if (h1s[0] !== r.h1) pageProblems.push(`${r.path} (${file}): <h1> is "${h1s[0]}", expected "${r.h1}"`);
}
// Internal links use each route's own (lowercase) spelling, never one that only matches it ignoring case.
const routeByLower = new Map(ROUTES.map((r) => [r.path.toLowerCase(), r.path]));
for (const f of htmlFiles) {
  for (const [, href] of fs.readFileSync(f, "utf8").matchAll(/<a\s[^>]*?href="(\/[^"#?]*)/g)) {
    const p = href.length > 1 ? href.replace(/\/+$/, "") : href;
    const own = routeByLower.get(p.toLowerCase());
    if (own && own !== p) pageProblems.push(`${path.relative(dist, f).split(path.sep).join("/")}: link to ${href} (the URL is ${own})`);
  }
}
if (pageProblems.length) {
  console.error(`\nseo-pages: ${pageProblems.length} page(s) without their content or heading:\n  ${pageProblems.join("\n  ")}\n`);
  process.exit(1);
}
console.log(`seo-pages: every route page (${resolved.length}; ${sitemap.length} in the sitemap) has its content in #root, exactly its one <h1>, and one non-empty <title> and description`);

console.log(`\nseo-pages: ${resolved.length} route pages + 404.html + ${PREVIEW_ROUTES.length} noindex preview page(s) written\n`);
for (const r of resolved) console.log(`  ${r.path.padEnd(38)} ${String(r.title.length).padStart(2)}  ${String(r.description.length).padStart(3)}  ${r.ogImage}`);
