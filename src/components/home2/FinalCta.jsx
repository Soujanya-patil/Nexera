import { useEffect, useRef, useState } from "react";
import MagneticButton from "../ui/MagneticButton";
import ParallaxMedia from "../ui/ParallaxMedia";
import MediaSlot from "./MediaSlot";
import { Eyebrow, useDrawIn, whenNear } from "./shared";

/* Code-made night (until cta-tomorrow.png is supplied): a deep teal sky with a first-dawn line and a
   city skyline in silhouette with small warm windows. Deterministic (pre-render safe). */
function Skyline() {
  const rnd = (i) => {
    const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const blds = [];
  let x = 0;
  for (let i = 0; x < 1600; i++) {
    const w = 40 + Math.round(rnd(i) * 70);
    const h = 80 + Math.round(rnd(i + 50) * (i % 7 === 3 ? 260 : 150));
    blds.push({ x, w, h });
    x += w + 4;
  }
  const windows = [];
  blds.forEach((b, i) => {
    for (let wy = 600 - b.h + 14; wy < 586; wy += 16)
      for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 12) if (rnd(wx * 0.37 + wy * 0.91 + i) > 0.72) windows.push([wx, wy]);
  });
  return (
    <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(180deg, #03100d 0%, #062420 45%, #0b3a36 70%, #14514a 79%, #0a2724 80%, #03100d 100%)" }}>
      <svg viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[70%] w-full">
        <defs>
          <linearGradient id="sky-dawn" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#90D988" stopOpacity="0" />
            <stop offset="1" stopColor="#90D988" stopOpacity="0.16" />
          </linearGradient>
        </defs>
        <rect x="0" y="360" width="1600" height="120" fill="url(#sky-dawn)" />
        <path fill="#020b09" d={blds.map((b) => `M${b.x} ${600 - b.h}h${b.w}v${b.h}h-${b.w}z`).join("")} />
        {/* windows: three brightness levels, one path each */}
        {[0.4, 0.6, 0.85].map((o, k) => (
          <path key={o} fill="#f2c27a" opacity={o} d={windows.filter((_, i) => i % 3 === k).map(([wx, wy]) => `M${wx} ${wy}h4v6h-4z`).join("")} />
        ))}
        {/* the current into the city */}
        <path d="M0 380 C 400 360, 800 400, 1600 370" stroke="#90D988" strokeOpacity="0.45" strokeWidth="1.2" fill="none" />
      </svg>
    </div>
  );
}

const BADGES = [
  { text: "Cleaner Energy", d: ["M6 18c0-8 5-12 12-12 0 7-4 12-12 12z", "M6 18l7-7"] },
  { text: "Greater Efficiency", d: ["M4 15a8 8 0 1 1 16 0", "M12 15l4-5"] },
  { text: "A More Resilient Future", d: ["M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z", "M9 12l2 2 4-4"] },
];

/**
 * Final CTA (dark, full-bleed, slow parallax on desktop): "Store today. Power tomorrow." A huge
 * outlined watermark drifts slowly behind (desktop, paused off screen). The journey's route enters
 * from the top and ends under "Enquire Now", which glows once when it arrives. Badge icons draw in.
 */
export default function FinalCta() {
  const root = useRef(null);
  const btn = useRef(null);
  const path = useRef(null);
  const badges = useRef(null);
  const [geo, setGeo] = useState(null);
  useDrawIn(badges);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let samples = null;
    let raf = 0;
    let pulsed = false;
    const paint = () => {
      raf = 0;
      if (!samples || !path.current) return;
      const { len, ys, maxY, total } = samples;
      let drawn = total;
      if (!still) {
        const tip = 0.78 * window.innerHeight - el.getBoundingClientRect().top;
        let k = -1;
        while (k < maxY.length - 1 && maxY[k + 1] <= tip) k++;
        drawn = k < 0 ? 0 : k === maxY.length - 1 ? total : len[k];
      }
      path.current.style.strokeDashoffset = `${total - drawn}`;
      if (!still && !pulsed && drawn >= total - 1) {
        pulsed = true;
        btn.current?.classList.add("cta-pulse");
      }
    };
    const measure = () => {
      const r = el.getBoundingClientRect();
      const b = btn.current.getBoundingClientRect();
      const bx = b.left + b.width / 2 - r.left;
      const by = b.bottom - r.top;
      const sx = Math.max(bx + 120, r.width * 0.92);
      const d = `M${sx} 0 C ${sx} ${by * 0.55}, ${sx} ${by + 30}, ${sx - 40} ${by + 30} L${bx + 24} ${by + 30} Q${bx} ${by + 30} ${bx} ${by + 8}`;
      setGeo({ w: r.width, h: r.height, d });
      requestAnimationFrame(() => {
        const p = path.current;
        if (!p) return;
        const total = p.getTotalLength();
        p.style.strokeDasharray = `${total}`;
        const n = Math.ceil(total / 6);
        const len = [];
        const ys = [];
        const maxY = [];
        for (let i = 0; i <= n; i++) {
          const l = (total * i) / n;
          const q = p.getPointAtLength(l);
          len.push(l);
          ys.push(q.y);
          maxY.push(Math.max(q.y, maxY.at(-1) ?? -Infinity));
        }
        samples = { len, ys, maxY, total };
        paint();
      });
    };
    return whenNear(el, () => {
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      const onScroll = () => !raf && (raf = requestAnimationFrame(paint));
      window.addEventListener("scroll", onScroll, { passive: true });
      const io = new IntersectionObserver(([e]) => (el.dataset.run = e.isIntersecting ? "true" : "false"));
      io.observe(el);
      return () => {
        ro.disconnect();
        io.disconnect();
        cancelAnimationFrame(raf);
        window.removeEventListener("scroll", onScroll);
      };
    });
  }, []);

  return (
    <section ref={root} aria-labelledby="home2-cta" className="cta2 relative isolate overflow-hidden bg-deep text-white">
      <ParallaxMedia amount={6} className="-z-10">
        <MediaSlot file="cta-tomorrow.png" sizes="100vw" className="h-full w-full object-cover" fallback={<Skyline />} />
      </ParallaxMedia>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-deep/90 via-deep/60 to-deep/10" />
      <div aria-hidden="true" data-ch="Store today. Power tomorrow. Store today. Power tomorrow." className="cta2-mark seq-ch pointer-events-none absolute inset-x-0 top-5 -z-10 whitespace-nowrap lg:top-6" />

      {geo && (
        <svg aria-hidden="true" className="pointer-events-none absolute left-0 top-0 hidden overflow-visible md:block" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} fill="none">
          <path d={geo.d} stroke="#90D988" strokeWidth="7" strokeOpacity="0.14" strokeLinecap="round" />
          <path ref={path} d={geo.d} stroke="#90D988" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}

      <div className="relative container-site pb-24 pt-28 lg:pb-36 lg:pt-48">
        <div className="max-w-2xl">
          <Eyebrow dark>Let&rsquo;s build a cleaner tomorrow</Eyebrow>
          <h2 id="home2-cta" className="mt-4 text-[clamp(2.4rem,1.4rem+3.6vw,5rem)] font-semibold leading-[0.98] tracking-tight [text-wrap:balance]">
            Ready to Explore Energy Storage?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ice/85">Talk to NEXERA Powertech about the right Battery Energy Storage System for your application.</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <span ref={btn} data-energy="cta" className="inline-block rounded-full">
              <MagneticButton to="/contact" arrow spotlight ripple>
                Enquire Now
              </MagneticButton>
            </span>
            <MagneticButton to="/become-a-partner" variant="outline" sweep>
              Become a Partner
            </MagneticButton>
          </div>
          <ul ref={badges} className="mt-16 flex flex-wrap gap-x-8 gap-y-4">
            {BADGES.map((b) => (
              <li key={b.text} className="flex items-center gap-3 text-sm font-medium text-ice/90">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10 rounded-full border border-signal/40 p-2.5 text-signal" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {b.d.map((d, j) => (
                    <path key={j} d={d} />
                  ))}
                </svg>
                {b.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
