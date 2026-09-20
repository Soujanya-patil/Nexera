import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import useMediaQuery from "../hooks/useMediaQuery";
import useScrollProgress from "../hooks/useScrollProgress";
import StatBar, { ScrollStat, stats } from "./StatBar";
import hithiumCabinet from "../assets/products/hithium-cabinet-hero.jpg";

/**
 * Hero + stat bar as one sequence.
 * - Desktop, motion allowed: the hero pins while scroll progress drives a scroll-linked
 *   sequence (headline recedes, three depth layers move at different rates, the stat bar
 *   rises in and counts up).
 * - Mobile / short viewports / prefers-reduced-motion: the same content laid out in normal
 *   flow, showing the end state (no pinning, no parallax).
 */
export default function Hero() {
  const reducedMotion = useReducedMotion();
  const canPin = useMediaQuery("(min-width: 768px) and (min-height: 620px)");
  return canPin && !reducedMotion ? <PinnedHero /> : <StaticHero />;
}

function HeroCopy({ style, className = "" }) {
  return (
    <motion.div style={style} className={`${className} origin-left will-change-transform`}>
      <h1 className="font-serif text-4xl lg:text-5xl leading-tight font-semibold text-balance">
        Battery Energy Storage Systems for India's Commercial &amp; Industrial Sector
      </h1>
      <p className="mt-6 text-lg text-ice/80 max-w-xl leading-relaxed">
        Nexera Powertech brings TCL and Hithium battery storage systems to EPCs
        across Bangalore, South India, and beyond — backed by local design,
        commissioning, and hands-on technician training.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-4">
        <Link
          to="/become-a-partner"
          className="inline-flex items-center rounded-md bg-signal px-6 py-3 text-sm font-medium text-white shadow-[0_0_0_0_rgba(0,167,142,0.5)] transition-all duration-300 hover:bg-signal/90 hover:shadow-[0_0_28px_4px_rgba(0,167,142,0.45)]"
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
          <dt className="text-ice/60">Authorized Partner</dt>
          <dd className="mt-0.5 text-ice/90">TCL, Hithium</dd>
        </div>
        <div>
          <dt className="text-ice/60">Founding team</dt>
          <dd className="mt-0.5 text-ice/90">15+ years in solar &amp; storage EPC</dd>
        </div>
        <div>
          <dt className="text-ice/60">HQ</dt>
          <dd className="mt-0.5 text-ice/90">Bangalore</dd>
        </div>
      </dl>
    </motion.div>
  );
}

/**
 * Real Hithium cabinet photo. The source is a JPEG on pure black, so `mix-blend-screen`
 * drops the black into the dark hero instead of showing a hard-edged rectangle; a glow and a
 * floor light-pool (separate layers) seat the cabinet in the scene.
 */
function HeroProduct({ glowStyle, productStyle, className = "" }) {
  return (
    <div className={`relative flex justify-center ${className}`}>
      <motion.div
        style={glowStyle}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2 will-change-transform"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in srgb, var(--color-steel) 42%, transparent), color-mix(in srgb, var(--color-signal) 16%, transparent) 55%, transparent 100%)",
          }}
        />
      </motion.div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-3 left-1/2 h-8 w-[78%] -translate-x-1/2 rounded-[100%] blur-xl"
        style={{ background: "color-mix(in srgb, var(--color-signal) 38%, transparent)" }}
      />
      <motion.div
        style={productStyle}
        className="relative h-80 md:h-[min(52vh,32rem)] aspect-[700/1008] mix-blend-screen will-change-transform"
      >
        <img
          src={hithiumCabinet}
          width="700"
          height="1008"
          fetchPriority="high"
          decoding="async"
          alt="Hithium liquid-cooled battery energy storage cabinet, front view, with status indicators and emergency stop"
          className="block h-full w-full object-contain"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0, #000 4%, #000 96%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 4%, #000 96%, transparent 100%)",
          }}
        />
      </motion.div>
    </div>
  );
}

function Aurora({ steelStyle, signalStyle }) {
  return (
    <>
      <motion.div
        style={{
          ...steelStyle,
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--color-steel) 55%, transparent), transparent)",
        }}
        className="pointer-events-none absolute -left-[10rem] -top-[12rem] h-[42rem] w-[50rem] will-change-transform"
        aria-hidden="true"
      />
      <motion.div
        style={{
          ...signalStyle,
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--color-signal) 45%, transparent), transparent)",
        }}
        className="pointer-events-none absolute -right-[10rem] top-[28rem] h-[45rem] w-[48rem] will-change-transform"
        aria-hidden="true"
      />
    </>
  );
}

function StaticHero() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <Aurora />
        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24 grid md:grid-cols-5 gap-14 items-center">
          <HeroCopy className="md:col-span-3" />
          <HeroProduct className="md:col-span-2 pb-6" />
        </div>
      </section>
      <StatBar />
    </>
  );
}

function PinnedHero() {
  const ref = useRef(null);
  const p = useScrollProgress(ref, ["start start", "end end"]);

  // Foreground copy recedes
  const copyScale = useTransform(p, [0, 0.55], [1, 0.9]);
  const copyY = useTransform(p, [0, 0.55], [0, -36]);
  const copyOpacity = useTransform(p, [0.1, 0.6], [1, 0.7]);

  // Three depth layers, three rates: far aurora < product glow < product
  const steelY = useTransform(p, [0, 1], [0, -30]);
  const signalY = useTransform(p, [0, 1], [0, -60]);
  const auroraScale = useTransform(p, [0, 1], [1, 1.15]);
  const glowY = useTransform(p, [0, 1], [0, -90]);
  const glowScale = useTransform(p, [0, 1], [1, 1.3]);
  const glowOpacity = useTransform(p, [0, 0.6], [0.7, 1]);
  const productY = useTransform(p, [0, 1], [0, -150]);
  const productScale = useTransform(p, [0, 1], [1, 1.07]);

  // Stat band rises into the pinned viewport
  const bandY = useTransform(p, [0.3, 0.7], ["100%", "0%"]);
  const bandOpacity = useTransform(p, [0.3, 0.45], [0, 1]);

  return (
    <section ref={ref} className="relative h-[200vh] bg-ink text-white">
      <div className="sticky top-0 h-screen overflow-hidden">
        <Aurora
          steelStyle={{ y: steelY, scale: auroraScale }}
          signalStyle={{ y: signalY, scale: auroraScale }}
        />
        <div className="relative mx-auto grid h-full max-w-6xl grid-cols-5 items-center gap-14 px-6 pb-40 pt-20">
          <HeroCopy
            className="col-span-3"
            style={{ scale: copyScale, y: copyY, opacity: copyOpacity }}
          />
          <HeroProduct
            className="col-span-2"
            glowStyle={{ y: glowY, scale: glowScale, opacity: glowOpacity }}
            productStyle={{ y: productY, scale: productScale }}
          />
        </div>

        <motion.div
          style={{ y: bandY, opacity: bandOpacity }}
          className="absolute inset-x-0 bottom-0 border-b border-line bg-ice will-change-transform"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-line px-6 py-10">
            {stats.map((stat, i) => (
              <ScrollStat key={stat.label} stat={stat} progress={p} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
