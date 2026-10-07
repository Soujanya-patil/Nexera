import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { onceInView } from "../../lib/inview";
import { useMediaQuery } from "../../lib/scrollSteps";
import MediaSlot from "./MediaSlot";
import { CROSS } from "./data";
import { Eyebrow } from "./shared";

/* Line-art arm icons (code-made, until arm-*.png are supplied). 64 × 64, stroke only. */
const ARM_ART = {
  solar: (
    <>
      <circle cx="47" cy="15" r="6" />
      <path d="M47 4v3M47 23v3M36 15h3M55 15h3M39.2 7.2l2.1 2.1M52.7 20.7l2.1 2.1M39.2 22.8l2.1-2.1M52.7 9.3l2.1-2.1" />
      <path d="M8 46l8-16h26l-8 16z" />
      <path d="M12 38h26M21 30l-4 16M30 30l-4 16" />
      <path d="M24 46v8M17 54h14" />
    </>
  ),
  industry: (
    <>
      <path d="M6 54V30l12 7v-7l12 7v-7l12 7V16h8v38z" />
      <path d="M42 16V8h8v8" />
      <path d="M12 46h6M24 46h6M36 46h6" />
      <path d="M4 54h56" />
      <path d="M46 4c2 1 4 0 6-1" />
    </>
  ),
  commercial: (
    <>
      <path d="M10 54V14l20-6v46" />
      <path d="M30 22h24v32" />
      <path d="M4 54h56" />
      <path d="M16 18h4M16 26h4M16 34h4M16 42h4M23 16h3M23 24h3M23 32h3M23 40h3" />
      <path d="M36 28h4M44 28h4M36 36h4M44 36h4M36 44h4M44 44h4" />
    </>
  ),
  utility: (
    <>
      <path d="M32 6L20 58M32 6l12 52" />
      <path d="M14 20h36M18 30h28" />
      <path d="M24 42h16M22 50h20" />
      <path d="M14 20l-6 6M50 20l6 6M18 30l-5 5M46 30l5 5" />
      <path d="M26 20l12 10M38 20L26 30M24 42l16 8M40 42l-16 8" />
    </>
  ),
};
function ArmArt({ id }) {
  return (
    <div className="absolute inset-0 grid place-items-center" style={{ background: "radial-gradient(circle at 50% 40%, #12352e 0%, #0a1f1b 70%)" }}>
      <svg viewBox="0 0 64 64" className="h-[52%] w-[52%] text-ice/90" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {ARM_ART[id]}
      </svg>
      <span className="absolute inset-x-[22%] bottom-[18%] h-px bg-signal/70 shadow-[0_0_8px_1px_rgba(144,217,136,0.6)]" />
    </div>
  );
}

/** The core (code-made, until bess-core.png / .mp4 are supplied): a translucent cube of stacked cell layers, edges glowing, four beams. */
function CoreArt() {
  const top = (y) => `M100 ${y - 24} L148 ${y} L100 ${y + 24} L52 ${y} Z`;
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
      <defs>
        <radialGradient id="core-glow">
          <stop offset="0" stopColor="#90D988" stopOpacity="0.45" />
          <stop offset="1" stopColor="#90D988" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="104" r="96" fill="url(#core-glow)" className="core-breathe" />
      <g stroke="#90D988" strokeOpacity="0.55" strokeWidth="1">
        <path d="M100 44V-30M100 166v74M42 104h-74M158 104h74" strokeDasharray="2 5" />
      </g>
      <path d="M52 66 L100 42 L148 66 L148 142 L100 166 L52 142 Z" fill="rgba(144,217,136,0.06)" stroke="#90D988" strokeWidth="1.6" />
      <path d="M100 90 L100 166 M52 66 L100 90 L148 66" stroke="#90D988" strokeOpacity="0.8" strokeWidth="1.2" />
      {[78, 94, 110, 126].map((y, i) => (
        <path key={y} d={top(y + 12)} stroke="#c8f0c2" strokeOpacity={0.35 + i * 0.12} strokeWidth="1" fill={`rgba(144,217,136,${0.05 + i * 0.03})`} className="core-layer" style={{ "--i": i }} />
      ))}
    </svg>
  );
}

/**
 * The BESS cross (light): storage at the centre, four arms — SOLAR feeds in (dashes flow into the
 * core), INDUSTRY, COMMERCIAL and UTILITY draw from it (dashes flow out). Entry: the core settles and
 * glows, the lines draw outward, the nodes pop in, the dashes start (paused off screen). Hover, focus
 * or tap a node: its line brightens and its circle opens into a card over its quadrant (clip-path, no
 * layout shift) with one line and a link; the others dim. Phones: SOLAR, the core, then the three
 * uses as stacked cards along a centre flow line. Reduced motion: drawn, no moving dashes, tap cards.
 */
export default function Cross() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const stage = useRef(null);
  const desk = useMediaQuery("(min-width: 1024px)");
  const [open, setOpen] = useState(null);
  const fromPointer = useRef(false);
  const [size, setSize] = useState({ w: 1152, h: 704 });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    // Entry, once (nothing is hidden unless the stage starts below the viewport).
    const off = onceInView(el, { below: () => (el.dataset.in = "wait"), enter: () => (el.dataset.in = "go"), show: () => delete el.dataset.in });
    // Dashes run only while on screen.
    const io = new IntersectionObserver(([e]) => (el.dataset.run = e.isIntersecting ? "true" : "false"));
    io.observe(el);
    return () => {
      ro.disconnect();
      off();
      io.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  // Arms (desktop): from the core's edge to each node's circle, in the direction energy flows.
  const { w, h } = size;
  const C = [w / 2, h / 2];
  const coreR = 104;
  const discR = 68;
  const NODE = { solar: [0.5, 0.14], industry: [0.11, 0.5], commercial: [0.89, 0.5], utility: [0.5, 0.86] };
  const arm = (id) => {
    const [nx, ny] = [NODE[id][0] * w, NODE[id][1] * h];
    const dx = nx - C[0];
    const dy = ny - C[1];
    const l = Math.hypot(dx, dy) || 1;
    const a = [C[0] + (dx / l) * coreR, C[1] + (dy / l) * coreR];
    const b = [nx - (dx / l) * discR, ny - (dy / l) * discR];
    const [s, e] = id === "solar" ? [b, a] : [a, b];
    return `M${s[0].toFixed(1)} ${s[1].toFixed(1)} L${e[0].toFixed(1)} ${e[1].toFixed(1)}`;
  };

  const nodeProps = (n) => ({
    onPointerEnter: (e) => desk && e.pointerType === "mouse" && setOpen(n.id),
    onPointerLeave: (e) => desk && e.pointerType === "mouse" && setOpen((o) => (o === n.id ? null : o)),
    // Keyboard focus opens; a tap's focus waits for its click (which toggles).
    onFocus: () => desk && !fromPointer.current && setOpen(n.id),
    onBlur: (e) => desk && !e.currentTarget.contains(e.relatedTarget) && setOpen((o) => (o === n.id ? null : o)),
  });

  const node = (n) => {
    const isOpen = !desk || open === n.id;
    return (
      <li key={n.id} data-id={n.id} data-open={desk ? open === n.id : undefined} data-dim={desk && open && open !== n.id ? "true" : undefined} className="cross-node" {...nodeProps(n)}>
        <h3 className="cross-label">{n.label}</h3>
        <button
          type="button"
          className="cross-hit"
          aria-label={n.label}
          aria-expanded={open === n.id}
          aria-controls={`${uid}-${n.id}`}
          onPointerDown={() => (fromPointer.current = true)}
          onClick={(e) => {
            fromPointer.current = false;
            // A mouse click opens (hover already did); a tap or Enter / Space toggles.
            if (e.nativeEvent.pointerType === "mouse") setOpen(n.id);
            else setOpen((o) => (o === n.id ? null : n.id));
          }}
        />
        <div className="cross-card">
          <div id={`${uid}-${n.id}`} className="cross-text" inert={!isOpen || undefined}>
            <p className="text-[0.95rem] leading-snug text-ice/90">{n.text}</p>
            <Link
              to={n.to}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-signal underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
            >
              {n.cta}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="cross-disc">
          <MediaSlot file={n.file} sizes="(min-width: 1024px) 160px, 96px" className="absolute inset-0 h-full w-full object-cover" fallback={<ArmArt id={n.id} />} />
        </div>
      </li>
    );
  };

  return (
    <section aria-labelledby="home2-cross" className="relative overflow-hidden bg-[#06110e] py-20 text-white lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_55%_at_50%_55%,rgba(144,217,136,0.09),transparent_70%)]" />
      <div className="relative container-site">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow dark className="justify-center">
            One technology, every scale
          </Eyebrow>
          <h2 id="home2-cross" className="mt-4 text-[clamp(2rem,1.2rem+2.6vw,3.6rem)] font-semibold leading-[1.02] tracking-tight [text-wrap:balance]">
            Energy Storage for Every Scale
          </h2>
        </div>

        <div ref={stage} className="cross-stage relative mx-auto mt-12 max-w-6xl lg:mt-6">
          {/* Arms + flow (desktop). */}
          <svg aria-hidden="true" className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" viewBox={`0 0 ${w} ${h}`} fill="none">
            {CROSS.map((n, i) => (
              <g key={n.id} data-arm={n.id} data-hot={open === n.id || undefined} data-dim={open && open !== n.id ? "true" : undefined}>
                <path d={arm(n.id)} pathLength="1" className="cross-line" style={{ "--i": i }} />
                <path d={arm(n.id)} className="cross-flow" />
              </g>
            ))}
          </svg>
          {/* Phones: the flow line down the middle. */}
          <span aria-hidden="true" className="cross-vflow">
            <span />
          </span>

          <ul className="relative space-y-6 lg:static lg:space-y-0">
            {node(CROSS[0])}
            <li className="cross-core">
              <span aria-hidden="true" className="cross-bess">BESS</span>
              <div className="cross-core-art">
                <MediaSlot
                  file="bess-core.mp4"
                  desktopOnly
                  loop
                  className="absolute inset-0 h-full w-full object-contain"
                  fallback={<MediaSlot file="bess-core.png" sizes="260px" className="absolute inset-0 h-full w-full object-contain" fallback={<CoreArt />} />}
                />
              </div>
              <p className="relative mx-auto mt-1 w-fit rounded-md bg-[#06110e] px-2 py-1 text-center text-xs font-semibold uppercase tracking-[0.22em] text-ice/85">Battery Energy Storage System</p>
            </li>
            {CROSS.slice(1).map(node)}
          </ul>
        </div>
      </div>
    </section>
  );
}
