import { useRef } from "react";
import MagneticButton from "../ui/MagneticButton";
import SceneImg from "../SceneImg";
import { depth, usePointerDepth } from "../../lib/pointerDepth";
import { useIntro } from "../../lib/intro";
import { scrollToId } from "../../lib/scrollTo";

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
    tl.fromTo(q('[data-a="eyebrow"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ...done }, 0)
      .fromTo(q('[data-a="line1"]'), { opacity: 0, y: 40, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85, ...done }, 0.12)
      .fromTo(
        q('[data-a="line2"]'),
        { opacity: 0, y: 44, filter: "blur(8px)", textShadow: "0 0 26px rgba(144,217,136,0.55)" },
        { opacity: 1, y: 0, filter: "blur(0px)", textShadow: "0 0 0px rgba(144,217,136,0)", duration: 1, ease: "expo.out", ...done },
        0.26
      )
      .fromTo(q('[data-a="desc"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", ...done }, 0.5)
      .fromTo(q('[data-a="image"]'), { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out", ...done }, 0.58)
      .fromTo(q('[data-a="cta"]'), { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ...done }, 0.95);
  });

  return (
    <section ref={root} className="relative overflow-hidden bg-night text-white">
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
          <div aria-hidden="true" className="absolute inset-0 bg-night/70 lg:bg-transparent lg:bg-gradient-to-r lg:from-night lg:via-night/55 lg:to-night/5" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/90 to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[min(46rem,calc(100svh-4rem))] max-w-6xl flex-col justify-center px-6 py-20 lg:py-24">
          <p data-a="eyebrow" className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-signal">
            <span aria-hidden="true" className="h-px w-8 bg-signal/70" />
            For EPCs &amp; Project Developers
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            <span data-a="line1" className="block">
              Build More.
            </span>
            <span data-a="line2" className="block text-signal">
              Store Smarter.
            </span>
          </h1>
          <p data-a="desc" className="mt-6 max-w-lg text-base leading-relaxed text-ice/80 md:text-lg">
            NEXERA gives EPCs authorized access to TCL, Hithium and CLOU battery storage — with design, commissioning,
            training and after-sales support — so you can add BESS to your projects without building a supply chain from
            scratch.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <span data-a="cta" className="inline-block">
              <MagneticButton to="#apply" onClick={scrollToId("apply")} arrow className="hover:scale-[1.02]">
                Become a Partner
              </MagneticButton>
            </span>
            <span data-a="cta" className="inline-block">
              <MagneticButton to="/contact" variant="outline" arrow className="hover:-translate-y-0.5">
                Talk to NEXERA
              </MagneticButton>
            </span>
          </div>
        </div>

        <p className="absolute bottom-4 right-6 hidden text-[0.6875rem] tracking-[0.14em] text-ice/45 lg:block">
          <span className="uppercase">Hithium</span> outdoor storage cabinets · technology partner imagery
        </p>
      </div>
    </section>
  );
}
