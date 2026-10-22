import { useRef } from "react";
import AnimatedText from "../ui/AnimatedText";
import { LIFECYCLE } from "./content";
import { useMediaQuery, useScrollSteps } from "../../lib/scrollSteps";

/**
 * WHY PARTNER — the page's answer in one statement (the About story, restated), then the
 * partnership lifecycle as a line of stages. As the section scrolls into view the line draws
 * through the stages (scrubbed, --progress) and each stage lights up as the line reaches it —
 * horizontal on desktop, vertical on phones. Under reduced motion every stage is simply shown lit.
 */
export default function WhyPartner() {
  const track = useRef(null);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const step = useScrollSteps(track, LIFECYCLE.length + 1, { start: "top 80%", end: "bottom 45%", enabled: !reduce });
  const lit = (i) => reduce || i < step;

  return (
    <section aria-labelledby="why-partner" className="bg-paper py-20 md:py-28">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow text-muted">Why partner with NEXERA</p>
            <AnimatedText id="why-partner" className="mt-3 text-h2 font-semibold text-ink">
              Built by an EPC, for EPCs.
            </AnimatedText>
          </div>
          <p className="max-w-xl text-body text-copy">
            NEXERA was founded to solve a problem we lived ourselves as a solar EPC: getting reliable battery storage into
            Indian projects, backed by service that actually shows up. As an authorized TCL, Hithium and CLOU partner, we
            work with you from technology access to long-term partnership.
          </p>
        </div>

        <div ref={track} className="relative mt-14 md:mt-16">
          {/* Track + scrubbed fill: vertical on phones, horizontal from md */}
          <span aria-hidden="true" className="absolute bottom-3 left-[7px] top-3 w-px bg-forest/15 md:inset-x-[6.25%] md:bottom-auto md:top-[7px] md:h-px md:w-auto" />
          <span
            aria-hidden="true"
            className="absolute bottom-3 left-[7px] top-3 w-px origin-top bg-accent md:inset-x-[6.25%] md:bottom-auto md:top-[7px] md:h-px md:w-auto md:origin-left [scale:1_var(--s)] md:[scale:var(--s)_1]"
            style={{ "--s": reduce ? 1 : "var(--progress, 0)" }}
          />
          <ol className="relative grid gap-6 md:grid-cols-8 md:gap-3">
            {LIFECYCLE.map((label, i) => (
              <li key={label} className="flex items-center gap-4 md:flex-col md:items-center md:gap-4 md:text-center">
                <span
                  aria-hidden="true"
                  className={`relative h-[15px] w-[15px] shrink-0 rounded-full border-2 transition-[background-color,border-color,scale] duration-base ${
                    lit(i) ? "scale-100 border-accent bg-accent" : "scale-90 border-accent/25 bg-ice"
                  }`}
                />
                <span
                  className={`eyebrow transition-colors duration-base ${
                    lit(i) ? "text-ink" : "text-muted"
                  }`}
                >
                  <span className="mr-2 font-medium text-muted md:mr-0 md:block md:pb-1">{String(i + 1).padStart(2, "0")}</span>
                  {label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
