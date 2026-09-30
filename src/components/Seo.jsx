import { useLocation } from "react-router-dom";
import { getRoute, NOT_FOUND_TITLE } from "../seo/routes";

/**
 * The current route's <title>, meta description and canonical, from src/seo/routes.js. Mounted once,
 * at the router root (main.jsx), so it follows every navigation — including URLs no route matches.
 * React 19 hoists these tags into <head> and swaps them as the location changes.
 *
 * The HTML each route is served with already carries the same three tags (scripts/seo-pages.mjs, for
 * crawlers without JavaScript); main.jsx removes those static copies before the app mounts, so the
 * document never has two of any. Open Graph / Twitter tags stay static only: link-preview crawlers
 * read the served HTML and never run JavaScript.
 *
 * A path that isn't in routes.js (the NotFound page, an unknown product) gets the not-found title and
 * a noindex, and no description or canonical — the same as the 404.html the server answers it with.
 */
export default function Seo() {
  const route = getRoute(useLocation().pathname);
  if (!route) {
    return (
      <>
        <title>{NOT_FOUND_TITLE}</title>
        <meta name="robots" content="noindex" />
      </>
    );
  }
  return (
    <>
      <title>{route.title}</title>
      <meta name="description" content={route.description} />
      <link rel="canonical" href={route.canonical} />
    </>
  );
}
