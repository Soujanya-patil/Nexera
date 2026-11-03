import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadRouteMeta } from "../seo/loadRouteMeta";
import { appFailed } from "./StartupBoundary";

/**
 * Keeps the document's <title>, meta description, canonical and robots tag on the current route,
 * from src/seo/routes.js. Mounted once, at the router root (main.jsx), so it follows every navigation —
 * including URLs no route matches.
 *
 * It renders nothing: the HTML each route is served with already carries these tags
 * (scripts/seo-pages.mjs, for crawlers without JavaScript), and this UPDATES those same elements in
 * place — never a second copy beside them, never removed and re-added — so the document has exactly
 * one of each at every moment, after hydration and after client-side navigation (a missing one is
 * created; any extra is removed). The route table is its own chunk (it carries the product catalogue),
 * loaded once the first screen is up (seo/loadRouteMeta): until then the served tags stand, and they
 * are already the right ones for the page on screen. Open Graph / Twitter tags and the JSON-LD stay as
 * served: link-preview crawlers and search engines read each URL's own served HTML.
 *
 * A path that isn't in routes.js (the NotFound page, an unknown product) gets the not-found title and
 * a noindex, and no description or canonical — the same as the 404.html the server answers it with.
 * A route kept out of the index (`noindex`) gets its title, its description where it has one, and a
 * noindex — no canonical.
 */
export default function Seo() {
  const { pathname } = useLocation();
  const [meta, setMeta] = useState(null);
  useEffect(() => {
    let alive = true;
    loadRouteMeta().then((m) => alive && setMeta(m));
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    // If the app has stopped, the served page and its served tags are what is shown (StartupBoundary).
    if (!meta || appFailed()) return;
    const route = meta.getRoute(pathname);
    if (!route) setHead({ title: meta.NOT_FOUND_TITLE, noindex: true });
    else if (route.noindex) setHead({ title: route.title, description: route.description, noindex: true });
    else setHead({ title: route.title, description: route.description, canonical: route.canonical });
  }, [meta, pathname]);
  return null;
}

/** The single <head> element for `selector`: extras removed, created (by `make`) if missing. */
function single(selector, make) {
  const [first, ...extra] = document.head.querySelectorAll(selector);
  extra.forEach((el) => el.remove());
  return first ?? document.head.appendChild(make());
}
const element = (tag, attrs) => Object.assign(document.createElement(tag), attrs);
/** Sets the one tag for `selector` to `value` (attribute `attr`), or removes every copy when there is none. */
function setTag(selector, value, attr, make) {
  if (value == null) return document.head.querySelectorAll(selector).forEach((el) => el.remove());
  const el = single(selector, make);
  if (el.getAttribute(attr) !== value) el.setAttribute(attr, value);
}

function setHead({ title, description, canonical, noindex }) {
  const t = single("title", () => element("title"));
  if (t.textContent !== title) t.textContent = title;
  setTag('meta[name="description"]', description, "content", () => element("meta", { name: "description" }));
  setTag('link[rel="canonical"]', canonical, "href", () => element("link", { rel: "canonical" }));
  setTag('meta[name="robots"]', noindex ? "noindex" : null, "content", () => element("meta", { name: "robots" }));
}
