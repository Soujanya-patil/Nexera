import { useEffect, useRef, useState } from "react";
import { BatteryCharging, Cpu, Layers, MapPin } from "lucide-react";
import MagneticButton from "../ui/MagneticButton";
import videoSrc from "../../assets/products/nexera-hero-cabinet.mp4";
import closeSrc from "../../assets/products/nexera-hero-cabinet-close.mp4";
import posterSrc from "../../assets/products/nexera-hero-cabinet-poster.webp";
import { depth, usePointerDepth } from "../../lib/pointerDepth";
import { reducedMotion, sleep, useDrawAfterLoad } from "./shared";

const CHIPS = [
  { icon: BatteryCharging, title: "Reliable", sub: "Energy Storage" },
  { icon: Layers, title: "Scalable", sub: "for Every Need" },
  { icon: Cpu, title: "Advanced", sub: "Technology Partners" },
  { icon: MapPin, title: "Support", sub: "Across India" },
];
const RAIL = ["Store", "Optimize", "Backup", "Integrate"];
const RAIL_MS = 2500;
const HOLD_OPEN_MS = 2600;

const once = (el, ev) => new Promise((r) => el.addEventListener(ev, r, { once: true }));
const seek = (v, t) =>
  new Promise((r) => {
    if (Math.abs(v.currentTime - t) < 0.01) return r();
    v.addEventListener("seeked", r, { once: true });
    v.currentTime = t;
  });

/**
 * Home v2 hero (dark, full-bleed). Copy left, the cabinet right on a dusk-sky ground glow.
 *
 * Everything is in the pre-rendered page and visible from the first paint: the h1's last five words
 * charge up (a CSS gradient fill sweeping across white text that is already there), the poster is
 * the product visual. After load:
 *  - desktop (≥ 1024 px, motion allowed, not Save-Data / 2g / 3g): the existing hero footage — the
 *    cabinet opens once as the stage comes into view, holds, and closes; hovering replays it. Phones
 *    and reduced motion keep the poster.
 *  - the rail (STORE · OPTIMIZE · BACKUP · INTEGRATE) moves its highlight every 2.5 s, a dot gliding
 *    down the line and a soft glow pulsing on the cabinet's indicator lights (an overlay, the footage
 *    is untouched; only while the cabinet is closed). Paused while the rail is hovered and off screen; static under
 *    reduced motion.
 *  - the feature chips' icons draw in one by one; the product follows the pointer (≤ 8 px, desktop).
 *  - SCROLL TO EXPLORE: a small battery fills with the page's scroll progress.
 */
export default function Hero() {
  const root = useRef(null);
  const chips = useRef(null);
  const opening = useRef(null);
  const closing = useRef(null);
  const fill = useRef(null);
  usePointerDepth(root);
  useDrawAfterLoad(chips);

  // Footage: desktop, after load + idle (the poster is the first paint and the LCP).
  const [footage, setFootage] = useState(false);
  const [phase, setPhase] = useState("closed"); // closed | moving
  const busy = useRef(false);
  useEffect(() => {
    const net = navigator.connection;
    const slow = net && (net.saveData || /(^|-)(2g|3g)$/.test(net.effectiveType ?? ""));
    if (slow || reducedMotion() || !window.matchMedia("(min-width: 1024px)").matches) return;
    let id;
    const go = () => (id = (window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1)))(() => setFootage(true), { timeout: 1500 }));
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      if (id) (window.cancelIdleCallback ?? clearTimeout)(id);
    };
  }, []);

  const alive = useRef(true);
  useEffect(() => () => (alive.current = false), []);
  const cycle = async () => {
    const o = opening.current;
    const c = closing.current;
    if (!footage || !o || !c || busy.current) return;
    busy.current = true;
    setPhase("moving");
    try {
      if (c.readyState === 0) {
        c.preload = "auto";
        c.load();
      }
      if (o.currentTime !== 0) await seek(o, 0);
      const opened = once(o, "ended");
      await o.play();
      await opened;
      await sleep(HOLD_OPEN_MS);
      if (!alive.current) return;
      if (c.readyState < 3) await Promise.race([once(c, "canplaythrough"), sleep(4000)]);
      if (c.readyState >= 3) {
        if (c.currentTime !== 0) await seek(c, 0);
        const closed = once(c, "ended");
        await c.play();
        c.style.opacity = "1"; // its first frame is the held open frame
        await seek(o, 0);
        await closed;
        c.style.opacity = "0"; // its last frame is the closed frame underneath
        c.currentTime = 0;
      } else await seek(o, 0);
    } catch {
      o.pause();
      c.pause();
      c.style.opacity = "0";
      if (o.currentTime !== 0) o.currentTime = 0;
    } finally {
      busy.current = false;
      if (alive.current) setPhase("closed");
    }
  };
  // The first cycle runs once by itself when the stage is half in view.
  useEffect(() => {
    const o = opening.current;
    if (!footage || !o) return;
    o.muted = true;
    closing.current.muted = true;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        cycle();
      },
      { threshold: 0.5 }
    );
    io.observe(o);
    return () => io.disconnect();
    // `cycle` reads the latest state on each call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [footage]);

  // Live rail: one word lit at a time, every 2.5 s, from the first idle moment; paused on hover / off screen.
  const [lit, setLit] = useState(0);
  const [tick, setTick] = useState(0); // restarts the indicator glow
  const hovering = useRef(false);
  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    let onScreen = true;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(el);
    const t = setInterval(() => {
      if (!onScreen || hovering.current || document.hidden) return;
      setLit((i) => (i + 1) % RAIL.length);
      setTick((n) => n + 1);
    }, RAIL_MS);
    return () => {
      clearInterval(t);
      io.disconnect();
    };
  }, []);

  // Battery scroll indicator: fills with the page's scroll progress (transform only, once per frame).
  useEffect(() => {
    const el = fill.current;
    if (!el) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onScroll = () => !raf && (raf = requestAnimationFrame(paint));
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="home2-title"
      className="relative overflow-hidden bg-night text-white"
    >
      {/* Dusk-sky ground: a warm horizon glow low behind the cabinet, a cool green lift above it. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 45% at 72% 88%, rgba(227,162,59,0.16), transparent 70%), radial-gradient(45% 55% at 70% 45%, rgba(144,217,136,0.10), transparent 72%), radial-gradient(55% 60% at 10% 0%, rgba(244,247,244,0.05), transparent 70%), linear-gradient(to bottom, transparent 65%, var(--color-deep))",
          }}
        />
      </div>

      <div className="relative container-site grid items-center gap-10 pb-24 pt-12 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 lg:pb-20 lg:pt-10 lg:pr-28">
        <div className="relative z-10">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-signal">
            <span aria-hidden="true" className="h-px w-8 bg-signal/70" />
            Energy storage for a brighter tomorrow
          </p>
          <h1 id="home2-title" className="mt-5 text-[clamp(2.4rem,5.4vw,4.4rem)] font-semibold leading-[1.03] tracking-tight">
            Battery Energy Storage Systems <span className="charge-text">for a Smarter Energy Future</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ice/80">
            NEXERA Powertech brings advanced Battery Energy Storage Systems (BESS) from global technology partners to residential, commercial &amp;
            industrial and utility-scale projects across India.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton to="/products" arrow spotlight ripple>
              Explore BESS
            </MagneticButton>
            <MagneticButton to="/contact" variant="outline" sweep>
              Talk to NEXERA
            </MagneticButton>
          </div>
          <ul ref={chips} className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {CHIPS.map(({ icon: Icon, title, sub }) => (
              <li key={title} className="flex flex-col gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-signal/40 text-signal">
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <span className="text-sm font-semibold text-white">{title}</span>
                <span className="-mt-1.5 text-xs leading-snug text-ice/65">{sub}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Product: pointer depth (≤ 8 px) → stage (poster, footage on desktop, indicator glow). */}
        <div className="relative" style={depth(8, 6)}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-[8%] bottom-[6%] h-10 rounded-[100%] bg-black/50 blur-2xl" />
          <div
            onPointerEnter={(e) => e.pointerType === "mouse" && cycle()}
            className="hero2-stage relative mx-auto aspect-[65/54] w-full max-w-xl lg:max-w-none"
          >
            <video
              ref={opening}
              src={footage ? videoSrc : undefined}
              poster={posterSrc}
              muted
              playsInline
              preload={footage ? "auto" : "none"}
              aria-label="NEXERA battery energy storage cabinet opening to reveal its stacked battery modules and power electronics"
              className="absolute inset-0 h-full w-full object-contain"
            />
            <video
              ref={closing}
              src={footage ? closeSrc : undefined}
              muted
              playsInline
              preload="none"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-0"
            />
            {/* Indicator lights (the column of three on the cabinet's front edge): a soft glow pulses with the rail. */}
            {phase === "closed" && tick > 0 && (
              <span
                key={tick}
                aria-hidden="true"
                className="rail-glow pointer-events-none absolute left-[52%] top-[27.5%] h-[9%] w-[6%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: "radial-gradient(closest-side, rgba(144,217,136,0.75), rgba(144,217,136,0.18) 55%, transparent)" }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Rail: right edge (desktop), a row under the hero copy elsewhere. The energy line starts here. */}
      <div
        data-energy="rail"
        onPointerEnter={(e) => e.pointerType === "mouse" && (hovering.current = true)}
        onPointerLeave={() => (hovering.current = false)}
        aria-label="What a BESS does"
        role="list"
        className="relative container-site -mt-16 mb-10 flex gap-5 text-[0.6875rem] font-semibold uppercase tracking-[0.24em] lg:absolute lg:right-6 lg:top-1/2 lg:mt-0 lg:mb-0 lg:w-auto lg:-translate-y-1/2 lg:flex-col lg:gap-9 lg:px-0"
      >
        <span aria-hidden="true" className="absolute bottom-0 left-[7px] top-0 hidden w-px bg-white/15 lg:block" />
        <span
          aria-hidden="true"
          className="rail-dot absolute left-[4px] top-0 hidden h-[7px] w-[7px] rounded-full bg-signal shadow-[0_0_10px_2px_rgba(144,217,136,0.6)] lg:block"
          style={{ transform: `translateY(calc(${lit} * (100% + 2.25rem + 0.85rem) + 0.3rem))` }}
        />
        {RAIL.map((w, i) => (
          <span key={w} role="listitem" className={`transition-colors duration-500 lg:pl-6 ${i === lit ? "text-signal" : "text-ice/45"}`}>
            {w}
          </span>
        ))}
      </div>

      {/* Scroll to explore: a battery that fills with the page's scroll progress. */}
      <div aria-hidden="true" className="absolute bottom-6 right-6 hidden items-center gap-3 text-[0.625rem] font-semibold uppercase tracking-[0.28em] text-ice/55 lg:flex">
        Scroll to explore
        <svg viewBox="0 0 30 14" className="h-3.5 w-[30px]" fill="none">
          <rect x="0.75" y="0.75" width="25.5" height="12.5" rx="2.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="27.25" y="4.5" width="2" height="5" rx="1" fill="currentColor" />
        </svg>
        <span className="absolute right-[7px] top-1/2 h-[9px] w-[21px] -translate-y-1/2 overflow-hidden rounded-[1.5px]">
          <span ref={fill} className="block h-full w-full origin-left bg-signal" style={{ transform: "scaleX(0)" }} />
        </span>
      </div>
    </section>
  );
}
