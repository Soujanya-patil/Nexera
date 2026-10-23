import { useRef } from "react";
import MagneticButton from "../ui/MagneticButton";
import SceneImg from "../SceneImg";
import { depth, usePointerDepth } from "../../lib/pointerDepth";
import { useIntro } from "../../lib/intro";
import { scrollToId } from "../../lib/scrollTo";
import { DUR, EASE, STAGGER } from "../../lib/tokens";

/**
 * For EPCs hero. One real deployment image (Hithium outdoor cabinets on site) fills the right of the
 * frame and fades into the dark ground behind the copy. Entrance (GSAP, lib/intro): eyebrow, then
 * the two headline lines, the supporting copy, then the image settling in, and the CTAs last. On desktop
 * the image drifts a few pixels with the pointer; nothing moves under reduced motion.
 */
export default function EpcHero() {
  const root = useRef(null);
  usePointerDepth(root);
  const intro = useIntro(root, ({ tl, q }) => {
    const done = { clearProps: "all" };
    tl.fromTo(q('[data-a="eyebrow"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: DUR.base, ...done }, 0)
      .fromTo(q('[data-a="line1"]'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: DUR.slow, ...done }, 0.12)
      .fromTo(
        q('[data-a="line2"]'),
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: DUR.slow, ease: EASE.emphasized, ...done },
        0.26
      )
      .fromTo(q('[data-a="desc"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: DUR.base, ease: EASE.standard, ...done }, 0.5)
      .fromTo(q('[data-a="image"]'), { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 1.5, ease: EASE.standard, ...done }, 0.58)
      .fromTo(q('[data-a="cta"]'), { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: DUR.base, stagger: STAGGER, ...done }, 0.95);
  });

  return (
    <section ref={root} className="relative overflow-hidden bg-deep-grid text-white">
      <div data-intro={intro}>
        {/* Image: full-bleed behind the copy on phones (dimmed), the right ~60% of the frame on desktop */}
        <div data-a="image" className="absolute inset-0 overflow-hidden lg:left-[34%]">
          <div className="absolute -inset-3" style={depth(-6, -4)}>
            <SceneImg
              name="cta-desert"
              eager
              fetchPriority="high"
              sizes="(min-width: 1024px) 66vw, 100vw"
              alt="Row of Hithium battery storage cabinets on a concrete pad under a low sun"
              className="h-full w-full object-cover object-[62%_50%]"
            />
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-deep-grid/70 lg:bg-transparent lg:bg-gradient-to-r lg:from-deep-grid lg:via-deep-grid/55 lg:to-deep-grid/5" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-deep-grid/90 to-transparent" />
        </div>

        <div className="relative flex min-h-[min(46rem,calc(100svh-4rem))] container-site flex-col justify-center py-20 lg:py-24">
          {/* The eyebrow is the heading's first line (it names what the page offers, the headline
              doesn't); it looks as before. The h1 itself has no classes: leading/tracking set inherited
              variables that would reach the eyebrow, so the headline's styles sit on its own span. */}
          <h1>
            <span data-a="eyebrow" className="flex items-center gap-3 eyebrow text-label">
              <span aria-hidden="true" className="h-px w-8 bg-accent/70" />
              Become a BESS Distributor
            </span>{" "}
            <span className="mt-5 block text-display font-semibold">
              <span data-a="line1" className="block">
                Build More.
              </span>
              {/* Keeps the lines' words apart in the heading's text; between block lines it renders nothing. */}
              {" "}
              <span data-a="line2" className="block text-accent">
                Store Smarter.
              </span>
            </span>
          </h1>
          <p data-a="desc" className="mt-6 max-w-lg text-body text-paper/80">
            NEXERA gives EPCs authorized access to TCL, Hithium and CLOU battery storage — with design, commissioning,
            training and after-sales support — so you can add BESS to your projects without building a supply chain from
            scratch.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <span data-a="cta" className="inline-block">
              <MagneticButton to="#apply" onClick={scrollToId("apply")} arrow>
                Become a Partner
              </MagneticButton>
            </span>
            <span data-a="cta" className="inline-block">
              <MagneticButton to="/contact" variant="outline" arrow>
                Talk to NEXERA
              </MagneticButton>
            </span>
            <span data-a="cta" className="inline-block">
              <MagneticButton to="/how-it-works" variant="outline" arrow>
                See how the partnership works
              </MagneticButton>
            </span>
          </div>
        </div>

        <p className="absolute bottom-4 right-6 hidden text-micro tracking-[0.14em] text-paper/60 lg:block">
          <span className="uppercase">Hithium</span> outdoor storage cabinets · technology partner imagery
        </p>
      </div>
    </section>
  );
}
