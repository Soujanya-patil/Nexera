import { prerender } from "react-dom/static";
import { StaticRouter } from "react-router-dom";
import { App } from "./AppRoutes";

/**
 * Build-time pre-render (scripts/seo-pages.mjs): the page for `url` as static HTML, the same tree the
 * browser hydrates (AppRoutes App). React's prerender waits for every lazy page and Suspense boundary,
 * so the markup is the complete page.
 */
async function once(url) {
  // Any error while rendering fails the build (React would otherwise leave that part to the browser).
  const errors = [];
  const { prelude } = await prerender(<App Router={StaticRouter} routerProps={{ location: url }} />, {
    onError: (error) => errors.push(error),
    // Never "outline" a large Suspense boundary (React streams those separately and reveals them with an
    // inline script): this is a static page, every part is written in place.
    progressiveChunkSize: Infinity,
  });
  const html = await new Response(prelude).text();
  if (errors.length) throw new Error(`pre-render of ${url} failed: ${errors[0]?.stack ?? errors[0]}`);
  return html;
}

export async function render(url) {
  // Twice: the first pass loads every lazy module the page uses, so in the second nothing suspends and
  // every part is written in place — plain HTML, readable without JavaScript, no inline scripts that
  // reveal streamed-in parts.
  await once(url);
  return once(url);
}
