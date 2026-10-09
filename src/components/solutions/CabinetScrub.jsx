import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { KineticHeading } from "./Kinetic";
import StageBlend, { FOOTAGE_EDGE } from "./StageBlend";
import { CALLOUTS } from "../cabinet/Callouts";
import posterSrc from "../../assets/products/nexera-hero-cabinet-poster.webp";
import openStill from "../../assets/catalogue/tcl-blueark-w10-open.webp";
import { useMediaQuery } from "../../lib/scrollSteps";
import { SCRUB_QUERY } from "../../lib/scrub";

// The scrubbed stage (footage, seek gate, pin) is its own chunk, fetched only when it will be used.
const CabinetStage = lazy(() => import("./CabinetStage"));

/**
 * C&I page — "Inside a C&I Energy Storage Cabinet": the page's one pinned scroll section.
 *
 * Desktop (≥1024 × 640, motion allowed): once the section is about one screen away, the stage chunk
 * (CabinetStage) loads and pins the section for 1.2 viewport heights — the cabinet opens over the
 * first 70%, the five verified protection labels appear over the last 30%. Until then the stage shows
 * the closed-cabinet poster at its final size, so nothing shifts.
 *
 * Phones, short screens and reduced motion: no pin and nothing of the scrub is downloaded (no video
 * element, no footage fetch, no stage code) — the open-cabinet still (the footage's final frame) with
 * the same five labels as a list below it.
 */
export default function CabinetScrub() {
  const section = useRef(null);
  const scrub = useMediaQuery(SCRUB_QUERY);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = section.current;
    if (!scrub || near || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setNear(true);
      },
      { rootMargin: "100% 0px" } // one screen ahead
    );
    io.observe(el);
    return () => io.disconnect();
  }, [scrub, near]);

  const poster = (
    <img src={posterSrc} alt="Battery energy storage cabinet with its doors closed" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain" />
  );

  return (
    <section ref={section} id="inside-cabinet" aria-labelledby="inside-cabinet-title" className="relative overflow-hidden bg-night text-white">
      <div className={scrub ? "flex h-[calc(100svh-4rem)] items-center py-8" : "py-14 lg:py-20"}>
        <div className="grid w-full container-site items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          <div>
            <KineticHeading id="inside-cabinet-title" className="sol-h2 font-semibold">
              Inside a C&I Energy Storage Cabinet
            </KineticHeading>
            <p className="mt-4 max-w-md leading-relaxed text-ice/75">
              Scroll to open the cabinet: battery modules, power electronics and protection, engineered as one system.
            </p>
            <p className="mt-8 max-w-md text-xs leading-relaxed text-ice/50">
              Representative cabinet shown. See each product page for exact specifications.
            </p>
          </div>

          {scrub ? (
            // The stage keeps the footage's own 1040 × 864 aspect and fits the pinned viewport. No box: its
            // ground is the footage's edge colour and StageBlend fades the edges into the section.
            <div className="relative mx-auto aspect-[65/54] w-full max-w-[calc((100svh-12rem)*65/54)] overflow-hidden" style={{ backgroundColor: FOOTAGE_EDGE }}>
              {near ? (
                <Suspense
                  fallback={
                    <>
                      {poster}
                      <StageBlend />
                    </>
                  }
                >
                  <CabinetStage section={section} />
                </Suspense>
              ) : (
                <>
                  {poster}
                  <StageBlend />
                </>
              )}
            </div>
          ) : (
            <figure>
              <img
                src={openStill}
                width={1040}
                height={864}
                loading="lazy"
                decoding="async"
                alt="Open battery energy storage cabinet: door with fans and fire suppression unit, five battery packs and the lower electrical rack"
                className="w-full rounded-2xl ring-1 ring-white/10"
              />
              <figcaption className="sr-only">Protection components</figcaption>
              <ul aria-label="Protection components" className="mt-5 grid gap-2 sm:grid-cols-2">
                {CALLOUTS.map((c) => (
                  <li key={c.label} className="flex items-center gap-3 text-sm text-ice/85">
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                    {c.label}
                  </li>
                ))}
              </ul>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
