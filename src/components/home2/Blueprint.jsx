import { useEffect, useRef } from "react";

/*
 * The hero's code-made visual (shown until hero-blueprint.mp4 is supplied): a technical drawing of a
 * generic, unbranded storage cabinet in a three-quarter view on drafting paper. It draws itself line
 * by line (CSS, from the first paint — no JavaScript needed), then a line of green energy enters from
 * the left and runs through the outline and module lines, and after the page has loaded, particles of
 * light flow along them (canvas 2D, paused off screen). Reduced motion: the finished, lit drawing.
 */

// Three-quarter projection: x along the front (right-down), y into depth (right-up), z up.
const U = [0.92, 0.26];
const V = [0.55, -0.32];
const O = [96, 412];
const P = (x, y, z) => [+(O[0] + x * U[0] + y * V[0]).toFixed(1), +(O[1] + x * U[1] + y * V[1] - z).toFixed(1)];
const W = 230;
const D = 150;
const H = 330;
const pts = (...ps) => ps.map((p) => p.join(",")).join(" ");
const line = (a, b) => `M${a.join(",")}L${b.join(",")}`;
const poly = (...ps) => `M${ps.map((p) => p.join(",")).join("L")}`;

// Construction lines (dashed, faint).
const CONSTRUCTION = [line(P(-60, 0, 0), P(W + 40, 0, 0)), line(P(W, -40, 0), P(W, D + 50, 0)), line(P(0, 0, -30), P(0, 0, H + 40)), line(P(W, D, H), P(W, D, H + 50)), line(P(-40, D, H), P(W, D, H))];
// The cabinet: outline, door, module bays, grille, lights.
const EDGES = [
  poly(P(0, 0, 0), P(W, 0, 0), P(W, 0, H), P(0, 0, H), P(0, 0, 0)),
  poly(P(W, 0, 0), P(W, D, 0), P(W, D, H), P(W, 0, H)),
  poly(P(0, 0, H), P(0, D, H), P(W, D, H)),
  poly(P(14, 0, 16), P(W - 14, 0, 16), P(W - 14, 0, H - 16), P(14, 0, H - 16), P(14, 0, 16)),
  line(P(W / 2, 0, 16), P(W / 2, 0, H - 16)),
];
const MODULES = [92, 130, 168, 206, 244, 282].map((z) => line(P(22, 0, z), P(W - 22, 0, z)));
const BAYS = [92, 130, 168, 206, 244].flatMap((z) => [line(P(30, 0, z + 12), P(W / 2 - 12, 0, z + 12)), line(P(W / 2 + 12, 0, z + 12), P(W - 30, 0, z + 12))]);
const GRILLE = Array.from({ length: 9 }, (_, i) => line(P(28 + i * 20, 0, 30), P(38 + i * 20, 0, 70)));
const SIDE_HATCH = Array.from({ length: 11 }, (_, i) => line(P(W, 10 + i * 12, 20), P(W, 10 + i * 12, H - 20)));
const HANDLES = [line(P(W / 2 - 8, 0, 150), P(W / 2 - 8, 0, 200)), line(P(W / 2 + 8, 0, 150), P(W / 2 + 8, 0, 200))];
const EYES = [P(30, D * 0.25, H), P(W - 30, D * 0.25, H), P(W - 30, D * 0.8, H), P(30, D * 0.8, H)];
// Dimension lines (arrows, ticks, extension lines) — no figures.
const arrow = (a, b) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy);
  const ux = dx / l;
  const uy = dy / l;
  const head = (p, s) => `M${p[0] + s * (ux * 9 - uy * 4)},${p[1] + s * (uy * 9 + ux * 4)}L${p[0]},${p[1]}L${p[0] + s * (ux * 9 + uy * 4)},${p[1] + s * (uy * 9 - ux * 4)}`;
  return `${line(a, b)}${head(a, 1)}${head(b, -1)}`;
};
const DIMS = [
  line(P(0, 0, 0), P(0, -34, 0)),
  line(P(W, 0, 0), P(W, -34, 0)),
  arrow(P(0, -28, 0), P(W, -28, 0)),
  line(P(0, 0, 0), P(-34, 0, 0)),
  line(P(0, 0, H), P(-34, 0, H)),
  arrow(P(-28, 0, 0), P(-28, 0, H)),
  line(P(W, D, 0), P(W + 30, D, 0)),
  arrow(P(W + 24, 0, 0), P(W + 24, D, 0)),
];
// Energy runs: where the green light travels (and where the particles flow). The first enters from
// the left edge of the sheet.
const RUNS = [
  [[0, O[1] - 2], [O[0] - 40, O[1] - 2], P(0, 0, 0)],
  [P(0, 0, 0), P(W, 0, 0), P(W, 0, H), P(0, 0, H), P(0, 0, 0)],
  [P(W, 0, 0), P(W, D, 0), P(W, D, H), P(W, 0, H)],
  [P(0, 0, H), P(0, D, H), P(W, D, H)],
  ...[92, 130, 168, 206, 244, 282].map((z) => [P(22, 0, z), P(W - 22, 0, z)]),
];
const runPath = (r) => `M${r.map((p) => p.join(",")).join("L")}`;

const VB = [560, 520];

function Particles() {
  const canvas = useRef(null);
  useEffect(() => {
    const c = canvas.current;
    if (!c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let visible = true;
    let started = false;
    let alive = true;
    const ctx = c.getContext("2d");
    // Each run as cumulative segment lengths, to place a particle at a distance along it.
    const runs = RUNS.map((r) => {
      const segs = [];
      let total = 0;
      for (let i = 1; i < r.length; i++) {
        const l = Math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]);
        segs.push({ a: r[i - 1], b: r[i], from: total, l });
        total += l;
      }
      return { segs, total };
    });
    const at = (run, d) => {
      const s = run.segs.find((x) => d <= x.from + x.l) ?? run.segs.at(-1);
      const t = Math.min(1, (d - s.from) / s.l);
      return [s.a[0] + (s.b[0] - s.a[0]) * t, s.a[1] + (s.b[1] - s.a[1]) * t];
    };
    const N = 64;
    const parts = Array.from({ length: N }, (_, i) => {
      const run = runs[i % runs.length];
      return { run, d: Math.random() * run.total, v: 0.35 + Math.random() * 0.6, r: 0.6 + Math.random() * 1.1 };
    });
    // A soft green dot, drawn once.
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const sg = sprite.getContext("2d");
    const g = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(220,255,215,1)");
    g.addColorStop(0.25, "rgba(144,217,136,0.9)");
    g.addColorStop(1, "rgba(144,217,136,0)");
    sg.fillStyle = g;
    sg.fillRect(0, 0, 32, 32);

    let scale = 1;
    const size = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      scale = (r.width / VB[0]) * dpr;
    };
    let last = 0;
    const frame = (t) => {
      raf = 0;
      if (!alive || !visible || document.hidden) return;
      const dt = Math.min(48, t - (last || t));
      last = t;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.globalCompositeOperation = "lighter";
      for (const p of parts) {
        p.d += p.v * dt * 0.06;
        if (p.d > p.run.total) p.d -= p.run.total;
        const [x, y] = at(p.run, p.d);
        const s = 10 * p.r * scale;
        ctx.globalAlpha = 0.55 + 0.45 * Math.sin((p.d / p.run.total) * Math.PI);
        ctx.drawImage(sprite, x * scale - s / 2, y * scale - s / 2, s, s);
      }
      raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && started && visible) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick();
    });
    io.observe(c);
    const ro = new ResizeObserver(size);
    ro.observe(c);
    document.addEventListener("visibilitychange", kick);
    // After load and once the drawing has lit (≈ 3.4 s from first paint).
    let tid;
    const begin = () => {
      const wait = Math.max(0, 3400 - performance.now());
      tid = setTimeout(() => (window.requestIdleCallback ?? ((f) => setTimeout(f, 1)))(() => {
        size();
        started = true;
        c.style.opacity = "1";
        kick();
      }), wait);
    };
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(tid);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("load", begin);
      document.removeEventListener("visibilitychange", kick);
    };
  }, []);
  return <canvas ref={canvas} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000`} />;
}

export default function Blueprint({ className = "" }) {
  // Each group is one path (its sub-paths draw one after another), staggered group by group: the
  // sketch still builds line by line, with ten animated elements instead of sixty.
  let i = 0;
  const draw = (ds, cls = "") => <path key={i} d={ds.join("")} className={`bp-line ${cls}`} style={{ "--i": i++ }} pathLength="1" />;
  return (
    <div aria-hidden="true" className={`relative ${className}`} style={{ aspectRatio: `${VB[0]} / ${VB[1]}` }}>
      <svg viewBox={`0 0 ${VB[0]} ${VB[1]}`} className="absolute inset-0 h-full w-full overflow-visible" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g stroke="rgba(214,226,220,0.28)" strokeWidth="0.8">
          {draw(CONSTRUCTION, "bp-faint")}
        </g>
        <polygon points={pts(P(W, 0, 0), P(W, D, 0), P(W, D, H), P(W, 0, H))} fill="rgba(214,226,220,0.035)" />
        <g stroke="rgba(226,236,230,0.82)" strokeWidth="1.3">
          {draw(EDGES)}
          {draw(MODULES)}
          {draw(HANDLES)}
        </g>
        <g stroke="rgba(214,226,220,0.42)" strokeWidth="0.8">
          {draw(BAYS)}
          {draw(GRILLE)}
          {draw(SIDE_HATCH)}
          {draw(DIMS)}
          {draw(EYES.map((e) => `M${e[0] - 7},${e[1]}a7,4 0 1,0 14,0a7,4 0 1,0 -14,0`))}
        </g>
        {/* Indicator lights on the front edge. */}
        <g fill="rgba(144,217,136,0.9)" className="bp-lights">
          {[0, 1, 2].map((k) => {
            const p = P(W - 30, 0, H - 40 - k * 14);
            return <circle key={k} cx={p[0]} cy={p[1]} r="2.6" />;
          })}
        </g>
        {/* The energy: a soft glow and a bright line, drawn after the sketch. */}
        <g stroke="#90D988" className="bp-energy">
          <path d={RUNS.map(runPath).join("")} pathLength="1" strokeWidth="6" strokeOpacity="0.16" className="bp-glow" style={{ "--k": 0 }} />
          <path d={RUNS.map(runPath).join("")} pathLength="1" strokeWidth="1.6" className="bp-glow" style={{ "--k": 0 }} />
        </g>
      </svg>
      <Particles />
    </div>
  );
}

export const BLUEPRINT_LINES = CONSTRUCTION.length + EDGES.length + MODULES.length + HANDLES.length + BAYS.length + GRILLE.length + SIDE_HATCH.length + DIMS.length + EYES.length;
