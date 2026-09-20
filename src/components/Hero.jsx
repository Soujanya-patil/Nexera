import { useRef } from "react";
import { Link } from "react-router-dom";
import { useMotion, useScrollScene } from "../lib/motion";
import { formatCount, parseCount } from "../lib/count";
import Count from "./Count";
import ModelStage from "./ModelStage";
import SceneImg from "./SceneImg";

const stats = [
  { value: "30–33%", label: "Projected CAGR" },
  { value: "24×7", label: "Availability" },
  { value: "Quick", label: "Response times" },
];

/**
 * Scene 1 — ENERGY. Also carries the stat band and hands off to the Storage scene.
 *
 * Cinematic: a 300vh runway with a CSS-sticky 100vh panel (sticky, not a JS pin: no pin-spacer,
 * no jitter). One scrubbed timeline drives everything for the 200vh the panel is held:
 * headline recedes, stat band rises and counts, background/aurora/cabinet move at different
 * rates (depth), and a tone overlay darkens toward the product environment. The Storage scene
 * overlaps the last 100vh of this runway, so it rises over the still-pinned hero.
 * Light / static: the same content in normal flow at its final state.
 */
export default function Hero() {
  const { mode } = useMotion();
  const cine = mode === "cinematic";
  const root = useRef(null);
  const modelProgress = useRef(0);

  useScrollScene(
    root,
    ({ gsap, q }) => {
      const $ = (name) => q(`[data-a="${name}"]`);
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            modelProgress.current = self.progress;
          },
        },
      });

      // The product travels to the centre of frame as the copy leaves (measured from the untransformed column)
      const stage = $("stage")[0];
      const toCentre = () => window.innerWidth / 2 - (stage.getBoundingClientRect().left + stage.offsetWidth / 2);

      // Depth — each layer moves for the full pin, at its own rate
      tl.fromTo($("city"), { scale: 1, autoAlpha: 0.42 }, { scale: 1.08, autoAlpha: 0.1, duration: 1 }, 0)
        .fromTo($("aurora-steel"), { yPercent: 0, scale: 1 }, { yPercent: -14, scale: 1.18, duration: 1 }, 0)
        .fromTo($("aurora-signal"), { yPercent: 0, scale: 1 }, { yPercent: -26, scale: 1.28, duration: 1 }, 0)
        .fromTo($("glow"), { yPercent: 0, scale: 1 }, { yPercent: -18, scale: 1.4, duration: 1 }, 0)
        .fromTo($("cabinet"), { yPercent: 0, scale: 1 }, { yPercent: -8, scale: 1.24, duration: 1 }, 0)
        .fromTo($("cabinet"), { x: 0 }, { x: toCentre, duration: 0.42, ease: "power2.inOut" }, 0.06)
        .fromTo($("glow"), { x: 0 }, { x: toCentre, duration: 0.42, ease: "power2.inOut" }, 0.06)
        .fromTo($("pool"), { x: 0 }, { x: toCentre, duration: 0.42, ease: "power2.inOut" }, 0.06)
        // Tone: cool aurora -> near-black with a faint warm horizon, matching the Storage scene's top edge
        .fromTo($("tone"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55, ease: "power1.inOut" }, 0.35);

      // Foreground copy recedes, and leaves the tab order once it is gone (autoAlpha -> visibility)
      tl.to($("copy"), { autoAlpha: 0, yPercent: -12, scale: 0.94, duration: 0.3, ease: "power1.in" }, 0.06);

      // Stat band rises and counts, driven by scroll position
      tl.fromTo($("band"), { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.2, ease: "power2.out" }, 0.1);
      $("stat").forEach((el, i) => {
        tl.fromTo(el, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.16, ease: "power2.out" }, 0.14 + i * 0.05);
      });
      // The band sinks away just before the Storage surface rises over that area
      tl.to($("band"), { yPercent: 35, autoAlpha: 0, duration: 0.09, ease: "power1.in" }, 0.44);
      $("stat").forEach((stat, i) => {
        const el = stat.querySelector("[data-count]");
        const parsed = el && parseCount(el.dataset.count);
        if (!parsed) return;
        const counter = { t: 0 };
        el.textContent = formatCount(parsed, 0);
        tl.to(
          counter,
          {
            t: 1,
            duration: 0.3,
            onUpdate: () => {
              el.textContent = formatCount(parsed, counter.t);
            },
          },
          0.16 + i * 0.05
        );
      });
    },
    cine
  );

  const panel = cine
    ? "sticky top-0 h-screen overflow-hidden bg-night text-bone"
    : "relative overflow-hidden bg-night text-bone";
  const grid = cine
    ? "relative mx-auto grid h-full max-w-6xl grid-cols-5 items-center gap-14 px-6 pb-40 pt-20"
    : "relative mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-5 md:items-center md:gap-14 md:py-24";
  const band = cine
    ? "invisible absolute inset-x-0 bottom-0 bg-bone text-ink"
    : "relative bg-bone text-ink";

  return (
    <section ref={root} className={cine ? "relative h-[300vh]" : "relative"}>
      <div className={panel}>
        {mode !== "light" && (
          <SceneImg
            data-a="city"
            name="energy-night"
            fetchPriority="low"
            eager
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        {mode !== "light" && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/85 via-night/30 to-night/25" />
        )}
        <div
          data-a="aurora-steel"
          aria-hidden="true"
          className="pointer-events-none absolute -left-[10rem] -top-[12rem] h-[42rem] w-[50rem] will-change-transform"
          style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--color-steel) 55%, transparent), transparent)" }}
        />
        <div
          data-a="aurora-signal"
          aria-hidden="true"
          className="pointer-events-none absolute -right-[10rem] top-[28rem] h-[45rem] w-[48rem] will-change-transform"
          style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--color-signal) 45%, transparent), transparent)" }}
        />
        {cine && (
          <div
            data-a="tone"
            aria-hidden="true"
            className="pointer-events-none invisible absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 45% at 50% 108%, color-mix(in srgb, var(--color-amber) 16%, transparent), transparent 70%), linear-gradient(to bottom, color-mix(in srgb, var(--color-night) 82%, transparent), var(--color-night))",
            }}
          />
        )}

        <div className={grid}>
          <div data-a="copy" className={`${cine ? "col-span-3" : "md:col-span-3"} origin-left will-change-transform`}>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-balance lg:text-5xl">
              Battery Energy Storage Systems for India's Commercial &amp; Industrial Sector
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-bone/80">
              Nexera Powertech brings TCL and Hithium battery storage systems to EPCs
              across Bangalore, South India, and beyond — backed by local design,
              commissioning, and hands-on technician training.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/become-a-partner"
                className="inline-flex items-center rounded-md bg-signal px-6 py-3 text-sm font-medium text-ink shadow-[0_0_0_0_rgba(0,167,142,0.5)] transition-all duration-300 hover:bg-signal/90 hover:shadow-[0_0_28px_4px_rgba(0,167,142,0.45)]"
              >
                Become a Distributor
              </Link>
              <Link
                to="/brands"
                className="inline-flex items-center rounded-md border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:border-white/60 hover:bg-white/5"
              >
                Explore Our Brands
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/15 pt-5 text-sm">
              <div>
                <dt className="text-bone/60">Authorized Partner</dt>
                <dd className="mt-0.5 text-bone/90">TCL, Hithium</dd>
              </div>
              <div>
                <dt className="text-bone/60">Founding team</dt>
                <dd className="mt-0.5 text-bone/90">15+ years in solar &amp; storage EPC</dd>
              </div>
              <div>
                <dt className="text-bone/60">HQ</dt>
                <dd className="mt-0.5 text-bone/90">Bangalore</dd>
              </div>
            </dl>
          </div>

          {/* Product sits in the scene: the photo is on black, so mix-blend-screen drops the black into
              the dark ground. The blend and the transform live on the same element on purpose. */}
          <div data-a="stage" className={`relative flex justify-center ${cine ? "col-span-2" : "md:col-span-2 pb-6"}`}>
            <div
              data-a="glow"
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2 will-change-transform"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in srgb, var(--color-steel) 42%, transparent), color-mix(in srgb, var(--color-signal) 16%, transparent) 55%, transparent 100%)",
              }}
            />
            <div
              data-a="pool"
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-3 left-1/2 h-8 w-[78%] -translate-x-1/2 rounded-[100%] blur-xl"
              style={{ background: "color-mix(in srgb, var(--color-signal) 38%, transparent)" }}
            />
            <div data-a="cabinet" className="relative will-change-transform" style={{ filter: "drop-shadow(0 34px 38px rgba(0,0,0,0.55))" }}>
              <ModelStage
                poster="hero-cabinet"
                alt="Hithium liquid-cooled battery energy storage cabinet with status indicators and emergency stop"
                sizes="(min-width: 1024px) 34vw, 60vw"
                eager
                enabled={cine}
                progress={modelProgress}
                className="h-72 aspect-[811/1196] md:h-96 lg:h-[min(58vh,36rem)]"
              />
            </div>
          </div>
        </div>

        <div data-a="band" className={band}>
          <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-ink/15 px-6 py-8 sm:py-10">
            {stats.map((s) => (
              <div key={s.label} data-a="stat" data-reveal className="px-3 text-center first:pl-0 sm:px-6">
                <p className="whitespace-nowrap font-serif text-2xl font-semibold sm:text-3xl md:text-4xl">
                  <Count value={s.value} />
                </p>
                <p className="mt-1 text-sm text-ink/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
