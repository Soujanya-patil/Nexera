import { useRef } from "react";
import { useIntro } from "../lib/intro";
import { DUR, RISE, STAGGER } from "../lib/tokens";

/**
 * The plain pages' hero (About, How It Works, Service & Training, Where We Operate, Contact). On a
 * client-side visit the eyebrow, title and subtitle rise in one after another (useIntro, motion
 * tokens); on a direct load the pre-rendered hero is simply there — the h1 (the page's largest paint)
 * is never hidden.
 */
export default function PageHeader({ eyebrow, title, subtitle }) {
  const root = useRef(null);
  const intro = useIntro(root, ({ tl, q }) => {
    tl.fromTo(q("[data-a]"), { opacity: 0, y: RISE }, { opacity: 1, y: 0, duration: DUR.slow, stagger: STAGGER, clearProps: "all" });
  });
  return (
    <section ref={root} data-intro={intro} className="bg-deep-grid text-white">
      <div className="container-site py-16 md:py-24">
        {eyebrow && (
          <p data-a className="eyebrow text-accent">
            {eyebrow}
          </p>
        )}
        <h1 data-a className="mt-eyebrow max-w-3xl text-h1 font-semibold">
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
