import { useEffect, useRef } from "react";
import { afterFirstPaint } from "../../lib/motion";

const DESKTOP = "(min-width: 1024px)";
const RADIUS = 18;
const TIP = 0.7; // the line's tip follows this point of the viewport

/** Orthogonal polyline with rounded corners. */
function rounded(pts) {
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [a, b, c] = [pts[i - 1], pts[i], pts[i + 1]];
    const l1 = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const l2 = Math.hypot(c.x - b.x, c.y - b.y) || 1;
    const r = Math.min(RADIUS, l1 / 2, l2 / 2);
    d += ` L${b.x + ((a.x - b.x) / l1) * r} ${b.y + ((a.y - b.y) / l1) * r}`;
    d += ` Q${b.x} ${b.y} ${b.x + ((c.x - b.x) / l2) * r} ${b.y + ((c.y - b.y) / l2) * r}`;
  }
  const z = pts.at(-1);
  return `${d} L${z.x} ${z.y}`;
}

/**
 * The page's signature "energy line" (desktop only, decorative, aria-hidden): from the hero's rail it
 * runs down the page's right margin — lighting a node level with the BESS flow and another level with
 * the cabinet explorer — and turns in to end under the final CTA's primary button, which glows once
 * when the line reaches it. It draws itself with the scroll (stroke-dashoffset; its tip at 70 % of the
 * viewport). Its course is measured from the sections' anchors ([data-energy]) after the first paint
 * and again whenever the page's size changes. Not rendered on smaller screens; under reduced motion
 * it is simply drawn in full.
 */
export default function EnergyLine() {
  const svg = useRef(null);
  const path = useRef(null);
  const head = useRef(null);
  const nodes = useRef([]);

  useEffect(() => {
    const el = svg.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    const mq = window.matchMedia(DESKTOP);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let samples = null; // { len[], x[], y[], maxY[], total, nodeLen[], top }
    let raf = 0;
    let pulsed = false;
    let ro;
    let alive = true;

    const paint = () => {
      raf = 0;
      if (!samples) return;
      const { len, x, y, maxY, total, nodeLen, top } = samples;
      let drawn = total;
      if (!still) {
        const tip = window.scrollY + window.innerHeight * TIP - top;
        let lo = 0;
        let hi = maxY.length - 1;
        if (maxY[0] > tip) drawn = 0;
        else {
          while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (maxY[mid] <= tip) lo = mid;
            else hi = mid - 1;
          }
          drawn = lo === maxY.length - 1 ? total : len[lo];
        }
        const h = head.current;
        if (drawn > 0 && drawn < total) {
          const k = Math.min(lo, x.length - 1);
          h.style.opacity = "1";
          h.style.transform = `translate(${x[k]}px, ${y[k]}px)`;
        } else h.style.opacity = "0";
      }
      path.current.style.strokeDashoffset = `${total - drawn}`;
      nodeLen.forEach((l, i) => nodes.current[i]?.setAttribute("data-on", drawn >= l ? "true" : "false"));
      if (!still && !pulsed && drawn >= total - 0.5 && total > 0) {
        pulsed = true;
        host.querySelector('[data-energy="cta"]')?.classList.add("cta-pulse");
      }
    };
    const schedule = () => !raf && (raf = requestAnimationFrame(paint));

    const measure = () => {
      if (!mq.matches) {
        el.style.display = "none";
        samples = null;
        return;
      }
      const hr = host.getBoundingClientRect();
      const rect = (name) => host.querySelector(`[data-energy="${name}"]`)?.getBoundingClientRect();
      const rail = rect("rail");
      const flow = rect("flow");
      const explorer = rect("explorer");
      const cta = rect("cta");
      if (!rail || !cta) {
        el.style.display = "none";
        samples = null;
        return;
      }
      el.style.display = "";
      const W = host.clientWidth;
      const Hh = host.scrollHeight;
      el.setAttribute("width", W);
      el.setAttribute("height", Hh);
      el.setAttribute("viewBox", `0 0 ${W} ${Hh}`);
      const X = (r) => r.left - hr.left;
      const Y = (r) => r.top - hr.top;
      const gx = W - 16;
      const rx = X(rail) + 7.5; // the rail's own line
      const ry = Y(rail) + rail.height + 6;
      const cx = X(cta) + cta.width / 2;
      const cy = Y(cta) + cta.height;
      const pts = [
        { x: rx, y: ry },
        { x: rx, y: ry + 28 },
        { x: gx, y: ry + 28 },
        { x: gx, y: cy + 28 },
        { x: cx, y: cy + 28 },
        { x: cx, y: cy + 6 },
      ];
      const p = path.current;
      p.setAttribute("d", rounded(pts));
      const total = p.getTotalLength();
      p.style.strokeDasharray = `${total}`;
      const n = Math.max(2, Math.ceil(total / 6));
      const len = [];
      const xs = [];
      const ys = [];
      const maxY = [];
      for (let i = 0; i <= n; i++) {
        const l = (total * i) / n;
        const q = p.getPointAtLength(l);
        len.push(l);
        xs.push(q.x);
        ys.push(q.y);
        maxY.push(Math.max(q.y, maxY.at(-1) ?? -Infinity));
      }
      // Nodes on the margin, level with the flow and the explorer.
      const marks = [flow, explorer].map((r) => (r ? Y(r) : null));
      const nodeLen = marks.map((my, i) => {
        const c = nodes.current[i];
        if (my == null || !c) return Infinity;
        c.setAttribute("cx", gx);
        c.setAttribute("cy", my);
        const k = ys.findIndex((v, j) => v >= my && Math.abs(xs[j] - gx) < 1);
        return k < 0 ? Infinity : len[k];
      });
      samples = { len, x: xs, y: ys, maxY, total, nodeLen, top: hr.top + window.scrollY };
      paint();
    };

    const start = () => {
      if (!alive) return;
      measure();
      ro = new ResizeObserver(() => measure());
      ro.observe(host);
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", measure);
      mq.addEventListener("change", measure);
    };
    afterFirstPaint().then(start);
    return () => {
      alive = false;
      ro?.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", measure);
    };
  }, []);

  return (
    <svg ref={svg} aria-hidden="true" className="energy-line pointer-events-none absolute left-0 top-0 z-[5]" style={{ display: "none" }} fill="none">
      <path ref={path} stroke="var(--color-signal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
      {[0, 1].map((i) => (
        <circle key={i} ref={(c) => (nodes.current[i] = c)} r="4.5" className="energy-node" data-on="false" />
      ))}
      <circle ref={head} r="3.5" cx="0" cy="0" className="energy-head" style={{ opacity: 0 }} />
    </svg>
  );
}
