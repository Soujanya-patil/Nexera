import { useRef } from "react";
import PillLink from "../components/PillLink";
import { useIntro } from "../lib/intro";
import { DUR, RISE, STAGGER } from "../lib/tokens";

/**
 * Any URL no route matches. The server answers these with a real 404 status (public/.htaccess →
 * 404.html), and <Seo> marks them noindex; this is what the visitor sees. Same treatment as the
 * catalogue's "couldn't find that system" page. Reached by a client-side link, its lines rise in like
 * every page hero (useIntro); served directly, it is simply there.
 */
export default function NotFound() {
  const root = useRef(null);
  const intro = useIntro(root, ({ tl, q }) => {
    tl.fromTo(q("[data-a]"), { opacity: 0, y: RISE }, { opacity: 1, y: 0, duration: DUR.slow, stagger: STAGGER, clearProps: "all" });
  });
  return (
    // Tall enough that the footer always reaches the bottom of the window.
    <section ref={root} data-intro={intro} className="flex min-h-[60svh] items-center bg-paper">
      <div className="mx-auto w-full max-w-2xl px-6 py-24 text-center">
        <p data-a className="eyebrow text-muted">
          Error 404
        </p>
        <h1 data-a className="mt-eyebrow text-h1 font-semibold text-ink">
          We couldn&rsquo;t find that page.
        </h1>
        <p data-a className="mt-heading text-body text-copy">
          It may have moved, or the link may be mistyped.
        </p>
        <span data-a className="mt-8 inline-block">
          <PillLink to="/">Back to home</PillLink>
        </span>
      </div>
    </section>
  );
}
