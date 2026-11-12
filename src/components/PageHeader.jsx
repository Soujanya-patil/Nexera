import { useRef } from "react";
import { useLocation } from "react-router-dom";
import Crumbs from "./Crumbs";
import { useIntro } from "../lib/intro";
import { DUR, RISE, STAGGER } from "../lib/tokens";

/**
 * The plain pages' hero (About, How It Works, Service & Training, Where We Operate, Contact). On a
 * client-side visit the eyebrow, title and subtitle rise in one after another (useIntro, motion
 * tokens); on a direct load the pre-rendered hero is simply there — the h1 (the page's largest paint)
 * is never hidden. `crumb`: this page's name in the breadcrumbs (Home > crumb), on the eyebrow's row.
 */
export default function PageHeader({ eyebrow, title, subtitle, crumb }) {
  const { pathname } = useLocation();
  const root = useRef(null);
  const intro = useIntro(root, ({ tl, q }) => {
    tl.fromTo(q("[data-a]"), { opacity: 0, y: RISE }, { opacity: 1, y: 0, duration: DUR.slow, stagger: STAGGER, clearProps: "all" });
  });
  return (
    <section ref={root} data-intro={intro} className="bg-deep-grid hero-ground text-white">
      {/* Compact band: padding sized to the copy (about 60% of the earlier height on desktop). */}
      <div className="container-site py-5 md:py-8">
        {/* The eyebrow and, on its right, the breadcrumbs: one row, so the band is no taller. */}
        <div className="flex items-center justify-between gap-4">
          {eyebrow && (
            <p data-a className="shrink-0 eyebrow text-label">
              {eyebrow}
            </p>
          )}
          {crumb && <Crumbs trail={[[crumb, pathname]]} />}
        </div>
        <h1 data-a className="mt-eyebrow max-w-intro text-h1 font-semibold">
          {title}
        </h1>
        {subtitle && (
          <p data-a className="mt-heading max-w-measure text-lead text-paper/80">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
