import { useRef } from "react";
import { FEATHER, useMotion, useScrollScene } from "../lib/motion";
import SceneImg from "./SceneImg";

/**
 * Scene 2 — STORAGE. The BESS product environment the hero rises into.
 *
 * Cinematic: a 300vh runway pulled up by -100vh so it overlaps the hero's last 100vh and rises over
 * the pinned hero. Its top 28vh is feathered by a mask so the hero's cabinet dissolves into it
 * instead of being cut by a hard edge. Once pinned, two beats crossfade by scroll: TCL BlueArk, then
 * Hithium. The beats use the first half of the pin; the second half is held for the next scene
 * (Scale) to rise over it. Copy is the approved product copy from the Our Brands page.
 * Light / static: the two beats stack in normal flow.
 */
const STORY = 0.5; // share of the pin used by this scene's own story; the rest is held while Scale rises over it

export default function Storage() {
  const { mode } = useMotion();
  const cine = mode === "cinematic";
  const root = useRef(null);

  useScrollScene(
    root,
    ({ gsap, q }) => {
      const $ = (name) => q(`[data-a="${name}"]`);
      const P = (x) => x * STORY;

      // While the scene rises over the hero: the environment settles in and the first beat arrives
      gsap.fromTo(
        $("bg-rise"),
        { scale: 1.12, yPercent: 7 },
        {
          scale: 1,
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "top top", scrub: 0.5, invalidateOnRefresh: true },
        }
      );
      gsap.fromTo(
        $("tcl-rise"),
        { autoAlpha: 0, y: 70 },
        {
          autoAlpha: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: { trigger: root.current, start: "top 55%", end: "top top", scrub: 0.5, invalidateOnRefresh: true },
        }
      );

      // Pinned: TCL beat -> Hithium beat, then held while the next scene rises over it
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.5, invalidateOnRefresh: true },
      });
      tl.fromTo($("bg-tcl"), { scale: 1.06 }, { scale: 1, duration: P(0.5) }, 0)
        .to($("tcl-text"), { autoAlpha: 0, y: -40, duration: P(0.1), ease: "power1.in" }, P(0.42))
        .to($("beat-tcl"), { autoAlpha: 0, duration: P(0.16) }, P(0.46))
        .fromTo($("beat-hithium"), { autoAlpha: 0 }, { autoAlpha: 1, duration: P(0.16) }, P(0.46))
        .fromTo($("container"), { xPercent: 14, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: P(0.24), ease: "power2.out" }, P(0.5))
        .fromTo($("block"), { xPercent: 40, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: P(0.24), ease: "power2.out" }, P(0.56))
        .fromTo($("hithium-text"), { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: P(0.14), ease: "power2.out" }, P(0.62))
        .to($("container"), { xPercent: -3, duration: 1 - P(0.7) }, P(0.7))
        // The copy leaves before the next scene reaches it, so the hand-off is imagery over imagery
        .to($("hithium-text"), { autoAlpha: 0, y: -36, duration: 0.1, ease: "power1.in" }, STORY + 0.02);
    },
    cine
  );

  const beat = cine ? "absolute inset-0" : "relative min-h-[88svh] overflow-hidden";
  const inner = `relative z-10 mx-auto flex max-w-6xl flex-col justify-end px-6 pb-16 pt-28 md:pb-24 ${
    cine ? "h-full" : "min-h-[88svh]"
  }`;
  const shadow = { filter: "drop-shadow(0 30px 34px rgba(0,0,0,0.6))" };

  return (
    <section ref={root} className={cine ? "relative z-10 -mt-[100vh] h-[300vh]" : "relative"}>
      <div className={cine ? "sticky top-0 h-screen overflow-hidden bg-night" : "relative bg-night"} style={cine ? FEATHER : undefined}>
        {/* Beat 1 — TCL BlueArk */}
        <article data-a="beat-tcl" className={beat}>
          <div data-a="bg-rise" className="absolute inset-0 will-change-transform">
            <SceneImg
              data-a="bg-tcl"
              name="storage-tcl"
              alt="TCL BlueArk energy storage range on a studio floor: stackable battery modules, floor-standing cabinets, wall-mounted units and inverters"
              className="h-full w-full object-cover will-change-transform"
              style={{ objectPosition: "50% 84%", filter: "brightness(1.08) contrast(1.05)" }}
            />
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-night via-night/55 to-transparent" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-night/90 via-night/35 to-transparent" />
          <div className={inner}>
            <div data-a="tcl-rise" data-reveal className="max-w-xl will-change-transform">
              <div data-a="tcl-text" className="will-change-transform">
                <span className="rounded-full bg-signal/15 px-3 py-1 text-xs font-medium text-signal">Authorized Partner</span>
                <h2 className="mt-4 font-serif text-[clamp(2.5rem,5.4vw,5.25rem)] font-semibold leading-none text-bone">
                  TCL BlueArk
                </h2>
                <dl className="mt-8 grid gap-4 text-sm">
                  <div>
                    <dt className="text-bone/60">Products</dt>
                    <dd className="mt-0.5 text-bone">W10 (125kW/261kWh), X5</dd>
                  </div>
                  <div>
                    <dt className="text-bone/60">Best for</dt>
                    <dd className="mt-0.5 text-bone">Residential, light C&amp;I</dd>
                  </div>
                  <div>
                    <dt className="text-bone/60">Why TCL</dt>
                    <dd className="mt-0.5 text-bone">Global brand backing, compact footprint</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </article>

        {/* Beat 2 — Hithium */}
        <article data-a="beat-hithium" className={`${beat} ${cine ? "invisible" : ""}`}>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(75% 65% at 72% 78%, color-mix(in srgb, var(--color-steel) 30%, transparent), transparent 70%), radial-gradient(45% 35% at 70% 102%, color-mix(in srgb, var(--color-amber) 20%, transparent), transparent 70%), var(--color-night)",
            }}
          />
          <div className={inner}>
            <div className={cine ? "flex h-full items-end" : ""}>
              <div data-a="hithium-text" data-reveal className={`max-w-md will-change-transform ${cine ? "relative z-10" : ""}`}>
                <span className="rounded-full bg-signal/15 px-3 py-1 text-xs font-medium text-signal">Authorized Partner</span>
                <h2 className="mt-4 font-serif text-[clamp(2.5rem,5.4vw,5.25rem)] font-semibold leading-none text-bone">
                  Hithium
                </h2>
                <dl className="mt-8 grid gap-4 text-sm">
                  <div>
                    <dt className="text-bone/60">Products</dt>
                    <dd className="mt-0.5 text-bone">
                      261kWh liquid-cooled C&amp;I cabinet, 1022kWh DC block, 6.25MWh (4h) utility block
                    </dd>
                  </div>
                  <div>
                    <dt className="text-bone/60">Best for</dt>
                    <dd className="mt-0.5 text-bone">C&amp;I and utility-scale</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Product line, sized by scale: the DC block stands in front of the utility container.
              Real transparent cutouts of the partner's product photography. */}
          <div
            data-a="container"
            style={shadow}
            className={
              cine
                ? "pointer-events-none absolute -right-[2vw] bottom-[9vh] z-0 w-[min(50vw,54rem)] will-change-transform"
                : "relative mx-auto mt-10 w-[94%] max-w-3xl"
            }
          >
            <SceneImg name="hithium-container" alt="Hithium utility-scale battery storage container" sizes="(min-width: 1024px) 50vw, 94vw" className="block h-auto w-full" />
          </div>
          <div
            data-a="block"
            style={shadow}
            className={
              cine
                ? "pointer-events-none absolute bottom-[6vh] right-[43vw] z-0 w-[min(12vw,11.5rem)] will-change-transform"
                : "relative mx-auto -mt-4 w-1/3 max-w-[11rem]"
            }
          >
            <SceneImg name="hithium-block" alt="Hithium DC block battery cabinet" sizes="(min-width: 1024px) 12vw, 34vw" className="block h-auto w-full" />
          </div>
        </article>
      </div>
    </section>
  );
}
