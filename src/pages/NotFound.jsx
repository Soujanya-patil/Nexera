import PillLink from "../components/PillLink";

/**
 * Any URL no route matches. The server answers these with a real 404 status (public/.htaccess →
 * 404.html), and <Seo> marks them noindex; this is what the visitor sees. Same treatment as the
 * catalogue's "couldn't find that system" page.
 */
export default function NotFound() {
  return (
    // Tall enough that the footer always reaches the bottom of the window.
    <section className="flex min-h-[60svh] items-center bg-ice">
      <div className="mx-auto w-full max-w-2xl px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Error 404</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">We couldn&rsquo;t find that page.</h1>
        <p className="mt-2 text-graphite">It may have moved, or the link may be mistyped.</p>
        <PillLink to="/" className="mt-8">
          Back to home
        </PillLink>
      </div>
    </section>
  );
}
