import { useEffect, useRef, useState } from "react";
import MediaSlot from "./MediaSlot";
import { JOURNEY } from "./data";
import { Eyebrow, whenNear } from "./shared";

/* Code-made backdrop (until journey-road.png is supplied): faint topographic contour lines. Deterministic. */
function Topo() {
  const ring = (cx, cy, r, k, seed) => {
    const n = 48;
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (1 + 0.16 * Math.sin(a * 3 + seed) + 0.08 * Math.sin(a * 5 + seed * 2.3) + k * 0.01);
      return [cx + Math.cos(a) * rr * 1.6, cy + Math.sin(a) * rr];
    });
    return `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join("L")}Z`;
  };
  const hills = [
    [260, 180, 1.1],
    [980, 420, 2.4],
    [1500, 140, 3.7],
    [640, 640, 5.2],
  ];
  return (
    <svg aria-hidden="true" viewBox="0 0 1600 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" fill="none" stroke="rgba(244,247,244,0.07)" strokeWidth="1">
      <path d={hills.flatMap(([cx, cy, seed]) => Array.from({ length: 9 }, (_, k) => ring(cx, cy, 26 + k * 30, k, seed))).join("")} />
    </svg>
  );
}

/** A smooth path through points (Catmull-Rom → cubic Bézier). */
function smooth(p) {
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * The journey (dark): "Built by an EPC, for EPCs." A glowing route winds through seven milestones —
 * across the section on desktop, down it on phones — and draws itself with the scroll; each node
 * lights green as the line reaches it and its text slides into place (the text is always readable:
 * it only moves). The last node pulses and the route runs on, out of the section, toward the CTA.
 * No dates: each milestone has an empty `year`, hidden until one is added. Reduced motion: drawn, lit.
 */
export default function Journey() {
  const stage = useRef(null);
  const path = useRef(null);
  const glow = useRef(null);
  const dots = useRef([]);
  const [geo, setGeo] = useState(null);
  const [lit, setLit] = useState(JOURNEY.length);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const desk = window.matchMedia("(min-width: 1024px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let samples = null;
    let raf = 0;
    const paint = () => {
      raf = 0;
      if (!samples || !path.current) return;
      const { len, xs, ys, total, nodeLen, horizontal } = samples;
      let drawn = total;
      if (!still) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        if (horizontal) drawn = total * Math.min(1, Math.max(0, (0.85 * vh - r.top) / (0.6 * vh)));
        else {
          const tip = 0.72 * vh - r.top;
          let k = 0;
          while (k < ys.length - 1 && ys[k + 1] <= tip) k++;
          drawn = ys[0] > tip ? 0 : len[k];
        }
      }
      path.current.style.strokeDashoffset = `${total - drawn}`;
      if (glow.current) glow.current.style.strokeDashoffset = `${total - drawn}`;
      setLit(nodeLen.filter((l) => drawn >= l - 1).length);
    };
    const measure = () => {
      const r = el.getBoundingClientRect();
      const horizontal = desk.matches;
      const centers = dots.current.map((d) => {
        const b = d.getBoundingClientRect();
        return [b.left + b.width / 2 - r.left, b.top + b.height / 2 - r.top];
      });
      if (centers.length < 2) return;
      const pts = horizontal
        ? [[-40, centers[0][1] + 40], ...centers, [r.width + 30, centers.at(-1)[1] + 60], [r.width - 40, r.height + 120]]
        : [[centers[0][0], -30], ...centers, [centers[0][0], r.height + 80]];
      setGeo({ w: r.width, h: r.height, d: smooth(pts) });
      requestAnimationFrame(() => {
        const p = path.current;
        if (!p) return;
        const total = p.getTotalLength();
        p.style.strokeDasharray = `${total}`;
        if (glow.current) glow.current.style.strokeDasharray = `${total}`;
        const n = Math.ceil(total / 6);
        const len = [];
        const xs = [];
        const ys = [];
        for (let i = 0; i <= n; i++) {
          const l = (total * i) / n;
          const q = p.getPointAtLength(l);
          len.push(l);
          xs.push(q.x);
          ys.push(q.y);
        }
        const nodeLen = centers.map(([cx, cy]) => {
          let best = 0;
          let bd = Infinity;
          for (let i = 0; i <= n; i++) {
            const dd = (xs[i] - cx) ** 2 + (ys[i] - cy) ** 2;
            if (dd < bd) {
              bd = dd;
              best = i;
            }
          }
          return len[best];
        });
        samples = { len, xs, ys, total, nodeLen, horizontal };
        paint();
      });
    };
    return whenNear(el, () => {
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      const onScroll = () => !raf && (raf = requestAnimationFrame(paint));
      window.addEventListener("scroll", onScroll, { passive: true });
      desk.addEventListener("change", measure);
      // The last node's pulse runs only on screen.
      const io = new IntersectionObserver(([e]) => (el.dataset.run = e.isIntersecting ? "true" : "false"));
      io.observe(el);
      return () => {
        ro.disconnect();
        io.disconnect();
        cancelAnimationFrame(raf);
        window.removeEventListener("scroll", onScroll);
        desk.removeEventListener("change", measure);
      };
    });
  }, []);

  return (
    <section aria-labelledby="home2-journey" className="relative isolate overflow-hidden bg-[#050f0c] py-20 text-white lg:py-28">
      <div className="absolute inset-0 -z-10">
        <MediaSlot file="journey-road.png" sizes="100vw" className="h-full w-full object-cover" fallback={<Topo />} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-[#050f0c]/85 via-[#050f0c]/55 to-[#050f0c]/90" />
      <div className="container-site">
        <Eyebrow dark>Our journey</Eyebrow>
        <h2 id="home2-journey" className="mt-4 text-[clamp(2.4rem,1.4rem+3.6vw,5rem)] font-semibold leading-[0.98] tracking-tight">
          Built by an EPC, for EPCs.
        </h2>

        <div ref={stage} className="jr-stage relative mt-14 lg:mt-12">
          {geo && (
            <svg aria-hidden="true" className="pointer-events-none absolute left-0 top-0 overflow-visible" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} fill="none">
              <path d={geo.d} stroke="rgba(244,247,244,0.12)" strokeWidth="1.5" strokeDasharray="3 7" />
              <path ref={glow} d={geo.d} stroke="#90D988" strokeWidth="7" strokeOpacity="0.16" strokeLinecap="round" />
              <path ref={path} d={geo.d} stroke="#90D988" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          <ol className="jr-list relative">
            {JOURNEY.map((m, i) => (
              <li key={m.title} className="jr-item" data-i={i} style={{ "--x": `${4 + i * 15.33}%`, "--y": i % 2 ? "60%" : "40%" }} data-lit={lit > i} data-last={i === JOURNEY.length - 1 || undefined}>
                <span ref={(d) => (dots.current[i] = d)} aria-hidden="true" className="jr-dot">
                  <span className="jr-dot-on" />
                </span>
                <div className="jr-text">
                  {m.year && <p className="text-xs font-semibold tracking-[0.18em] text-signal">{m.year}</p>}
                  <h3 className="text-base font-semibold leading-snug text-white">{m.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ice/80">{m.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
