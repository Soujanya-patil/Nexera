import { useRef } from "react";
import { FEATHER, useMotion, useScrollScene } from "../lib/motion";
import SceneImg from "./SceneImg";

/**
 * Scene 4 — TECHNOLOGY. The camera pushes into a real open Hithium cabinet, and the approved
 * "Why Hithium" points arrive one at a time as it closes in. The four points are the Our Brands
 * "Why Hithium" copy, split at its commas.
 * Light / static: the photo, then the points, in normal flow.
 */
const points = ["Liquid cooling", "High cyclic lifetime", "IEC 62619/62477 certified", "ISO 9001/14001/45001"];

const STORY = 90 / 190; // share of the 190vh pin used by this scene's own story; the last 100vh is the Confidence scene rising over it

export default function Technology() {
  const { mode } = useMotion();
  const cine = mode === "cinematic";
  const root = useRef(null);

  useScrollScene(
    root,
    ({ gsap, q }) => {
      const $ = (name) => q(`[data-a="${name}"]`);
      const P = (x) => x * STORY;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.5, invalidateOnRefresh: true },
      });

      tl.fromTo($("cabinet"), { scale: 1 }, { scale: 1.9, duration: 1 }, 0)
        .fromTo($("vignette"), { autoAlpha: 0.25 }, { autoAlpha: 0.8, duration: 1 }, 0)
        .fromTo($("label"), { autoAlpha: 0, x: -36 }, { autoAlpha: 1, x: 0, duration: P(0.12), ease: "power2.out" }, P(0.08));
      $("point").forEach((el, i) => {
        tl.fromTo(el, { autoAlpha: 0, x: -36 }, { autoAlpha: 1, x: 0, duration: P(0.12), ease: "power2.out" }, P(0.2 + i * 0.16));
      });
      // Copy leaves before the Confidence scene rises over the photo
      tl.to([$("label"), ...$("point")], { autoAlpha: 0, x: -24, duration: 0.08, stagger: 0.015, ease: "power1.in" }, STORY + 0.02);
    },
    cine
  );

  return (
    <section ref={root} className={cine ? "relative z-10 -mt-[100vh] h-[290vh]" : "relative"}>
      <div
        className={cine ? "sticky top-0 h-screen overflow-hidden bg-night text-bone" : "relative bg-night text-bone"}
        style={cine ? FEATHER : undefined}
      >
        <div className={cine ? "absolute inset-0" : "relative"}>
          <SceneImg
            data-a="cabinet"
            name="tech-cabinet"
            alt="Hithium battery cabinet with its doors open, showing stacked liquid-cooled battery modules"
            className={`w-full will-change-transform ${cine ? "h-full object-cover" : "h-[52svh] object-cover"}`}
            style={{ transformOrigin: "50% 47%" }}
          />
          <div
            data-a="vignette"
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 48%, transparent 30%, var(--color-night) 100%), linear-gradient(to bottom, var(--color-night), transparent 22%, transparent 78%, var(--color-night))",
            }}
          />
        </div>
        {cine && (
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[70%] bg-gradient-to-r from-night via-night/80 to-transparent"
          />
        )}

        <div
          className={`relative z-10 mx-auto max-w-6xl px-6 ${
            cine ? "flex h-full items-center pt-16" : "pb-20 pt-4"
          }`}
        >
          <div>
            <p data-a="label" data-reveal className="font-serif text-[clamp(2rem,4vw,3.75rem)] font-semibold leading-none text-bone">
              Why Hithium
            </p>
            <ul className="mt-8 space-y-4">
              {points.map((p, i) => (
                <li
                  key={p}
                  data-a="point"
                  data-reveal
                  style={{ "--reveal-delay": `${i * 0.08}s` }}
                  className="flex items-center gap-4 border-t border-bone/20 pt-4 text-lg text-bone md:text-xl"
                >
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
