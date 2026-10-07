import { useEffect, useRef, useState } from "react";
import ParallaxMedia from "../ui/ParallaxMedia";
import MediaSlot from "./MediaSlot";
import { Eyebrow } from "./shared";

// The statement, as tokens; `key` phrases turn signal green and get a marker underline.
const LINES = [
  [{ t: "India" }, { t: "makes" }, { t: "power" }, { t: "from" }, { t: "the" }, { t: "sun", key: true, tail: "." }],
  [{ t: "It" }, { t: "needs" }, { t: "power" }, { t: "after sunset", key: true, tail: "." }],
  [{ t: "That" }, { t: "gap", key: true }, { t: "is" }, { t: "why" }, { t: "we" }, { t: "exist", tail: "." }],
];
const COUNT = LINES.flat().length;

/** Code-made dusk (until why-dusk.png is supplied): a sky deepening from ember to night, a sun setting on the horizon. */
function DuskSky() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg, #06110f 0%, #0b1f22 32%, #2a2433 58%, #6b3a2c 74%, #b0602f 82%, #241612 83%, #0a0d0b 100%)" }}>
      <div className="absolute left-[62%] top-[82%] h-[38vw] max-h-[34rem] w-[38vw] max-w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(255,196,120,0.55), rgba(227,162,59,0.18) 55%, transparent)" }} />
      <div className="absolute left-[62%] top-[82%] h-[7vw] max-h-24 w-[7vw] max-w-24 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, #ffe2b0 0%, #f2a65a 60%, #d9772f 100%)", clipPath: "inset(0 0 50% 0)" }} />
      <div className="absolute inset-x-0 top-[82.6%] h-px bg-[#f2a65a]/40" />
    </div>
  );
}

/**
 * Why NEXERA exists (dark, over the dusk): the statement as huge editorial type. It is readable from
 * the start (ice at 70 %); as it scrolls through the viewport a highlight sweeps it word by word —
 * each word to full white, "sun", "after sunset" and "gap" to green with a marker underline drawing in
 * — tied to the scroll over about 70 vh and complete when the block's top is at 35 % of the viewport.
 * Desktop: a thin horizon line where a sun glyph sets while a small battery fills at the same rate.
 * Reduced motion: every word in its final state, the sun set, the battery full.
 */
export default function Why() {
  const block = useRef(null);
  const sun = useRef(null);
  const fill = useRef(null);
  // The highlight copies are added after hydration, so the pre-rendered heading holds each word once.
  const [hi, setHi] = useState(false);
  useEffect(() => setHi(true), []);

  useEffect(() => {
    const el = block.current;
    if (!el) return;
    if (!hi) return;
    const words = [...el.querySelectorAll("[data-w]")];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = -1;
    const paint = (p) => {
      const lit = Math.min(COUNT, Math.floor(p * (COUNT + 1)));
      if (lit !== last) {
        words.forEach((w, i) => (w.dataset.on = i < lit ? "true" : "false"));
        last = lit;
      }
      if (sun.current) sun.current.style.transform = `translateY(${(p * 120).toFixed(1)}%)`;
      if (fill.current) fill.current.style.transform = `scaleX(${p.toFixed(3)})`;
    };
    if (still) return paint(1);
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top;
      paint(Math.min(1, Math.max(0, (1.05 * vh - top) / (0.7 * vh))));
    };
    const onScroll = () => !raf && (raf = requestAnimationFrame(update));
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [hi]);

  let n = 0;
  return (
    <section aria-labelledby="home2-why" className="relative isolate overflow-hidden bg-deep text-white">
      <ParallaxMedia amount={6} className="-z-10">
        <MediaSlot file="why-dusk.png" sizes="100vw" className="h-full w-full object-cover" fallback={<DuskSky />} />
      </ParallaxMedia>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-deep/95 via-deep/75 to-deep/30" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-deep/70 via-transparent to-deep/80" />

      {/* Horizon (desktop): the sun sets below the line while the battery fills. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-14 hidden lg:block">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-ice/35 to-transparent" />
        <div className="absolute bottom-0 right-[12%] h-14 w-14 overflow-hidden">
          <svg ref={sun} viewBox="0 0 56 56" className="h-14 w-14" fill="none" stroke="#f2b46a" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="28" cy="34" r="10" fill="rgba(242,180,106,0.25)" />
            {[0, 30, 60, 90, 120, 150, 180].map((a) => {
              const r = (a * Math.PI) / 180;
              return <line key={a} x1={28 - Math.cos(r) * 15} y1={34 - Math.sin(r) * 15} x2={28 - Math.cos(r) * 20} y2={34 - Math.sin(r) * 20} />;
            })}
          </svg>
        </div>
        <div className="absolute right-[12%] top-4 flex translate-x-[120%] items-center gap-1">
          <span className="relative block h-4 w-8 overflow-hidden rounded-[3px] border border-ice/50 p-[2px]">
            <span ref={fill} className="block h-full w-full origin-left rounded-[1px] bg-signal" style={{ transform: "scaleX(0)" }} />
          </span>
          <span className="block h-1.5 w-[3px] rounded-r-sm bg-ice/50" />
        </div>
      </div>

      <div className="relative container-site py-24 lg:py-36">
        <Eyebrow dark>Why NEXERA exists</Eyebrow>
        <h2 id="home2-why" ref={block} className="statement mt-6 max-w-[15ch] lg:max-w-none">
          {LINES.map((line, li) => (
            <span key={li} className="block">
              {line.map((w, wi) => {
                const i = n++;
                return (
                  <span key={wi}>
                    <span data-w={i} data-key={w.key || undefined} data-on="false" className="sweep-word">
                      {w.t}
                      {w.tail}
                      {hi && (
                        <span aria-hidden="true" className="sweep-hi">
                          {w.t}
                          {w.tail}
                        </span>
                      )}
                      {hi && w.key && (
                        <svg aria-hidden="true" viewBox="0 0 100 12" preserveAspectRatio="none" className="sweep-mark">
                          <path d="M2 8 C 22 3, 44 11, 62 6 S 90 5, 98 7" pathLength="1" />
                        </svg>
                      )}
                    </span>
                    {wi < line.length - 1 ? " " : ""}
                  </span>
                );
              })}
              {li < LINES.length - 1 ? " " : ""}
            </span>
          ))}
        </h2>
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ice/85">
          Most Indian solar companies understand PV well, but have limited battery storage expertise. NEXERA exists to close that gap: bringing
          world-class storage technology from TCL, Hithium, CLOU and Midea, with the training, design and commissioning support to deploy it reliably.
        </p>
        <p className="mt-6 text-lg italic text-signal">To be India&rsquo;s most trusted partner for battery energy storage.</p>
      </div>
    </section>
  );
}
