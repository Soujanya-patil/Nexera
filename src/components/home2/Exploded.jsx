import { useEffect, useId, useRef, useState } from "react";
import { Check } from "lucide-react";
import { COMPONENTS } from "./data";
import { Eyebrow } from "./shared";

/* Exploded isometric diagram: six slabs, top → bottom as in COMPONENTS. Footprint 200 × 200, 24 thick. */
const VB = [760, 820];
const CX = 380;
const A = 200;
const HW = A * 0.866;
const T = 24;
const GAP = 30; // closed spacing
const SPREAD = 64; // extra spacing when fully exploded
const Y0 = 400; // the middle of the closed stack
const ISO = (y) => `matrix(0.866 0.5 -0.866 0.5 ${CX} ${y})`;

const MOTIFS = {
  cells: (
    <path
      d={Array.from({ length: 36 }, (_, k) => {
        const cx = 38 + (k % 6) * 25;
        const cy = 38 + Math.floor(k / 6) * 25;
        return `M${cx - 8} ${cy}a8 8 0 1 0 16 0a8 8 0 1 0 -16 0`;
      }).join("")}
    />
  ),
  circuit: <path d="M30 40h50v40h40v-50h50M30 100h30v60h90M80 80v60h40M120 130h50v40M150 30v30" />,
  wave: (
    <>
      <path d="M28 70c12-30 24-30 36 0s24 30 36 0 24-30 36 0 24 30 36 0" />
      <path d="M28 140h144" strokeDasharray="10 8" />
      <path d="M100 96v24M92 112l8 8 8-8" />
    </>
  ),
  chart: (
    <>
      <path d="M30 30v140h140" />
      <path d="M40 140l30-40 28 18 30-52 32 22" />
      <path d="M50 170v-14M80 170v-24M110 170v-10M140 170v-30" />
    </>
  ),
  fan: (
    <>
      <circle cx="100" cy="100" r="64" />
      <circle cx="100" cy="100" r="44" />
      <circle cx="100" cy="100" r="9" />
      <path d="M100 91c-4-22 8-36 22-38M109 100c22-4 36 8 38 22M100 109c4 22-8 36-22 38M91 100c-22 4-36-8-38-22" />
    </>
  ),
  shield: (
    <>
      <path d="M100 30l52 18v42c0 36-24 62-52 76-28-14-52-40-52-76V48z" />
      <path d="M78 98l16 16 30-34" />
    </>
  ),
};
const SHORT = { fire: "Fire Protection", thermal: "Thermal", ems: "EMS", pcs: "PCS", bms: "BMS", modules: "Battery Modules" };

function Slab({ c, i, on, dim, onPick }) {
  const y = Y0 + (i - 2.5) * GAP - A / 2; // the top corner of this slab's top face
  const L = [CX - HW, y + A / 2];
  const R = [CX + HW, y + A / 2];
  const B = [CX, y + A];
  const left = i % 2 === 0;
  const lead = left ? L : R;
  const lx = left ? 40 : VB[0] - 40;
  return (
    <g
      role="button"
      tabIndex={-1}
      aria-label={c.title}
      aria-pressed={on}
      onClick={onPick}
      className="ex2-slab"
      data-on={on}
      data-dim={dim || undefined}
      style={{ "--i": i }}
    >
      <g className="ex2-lift">
      {/* side faces, then the top face and its motif */}
      <path d={`M${L} L${B} L${B[0]},${B[1] + T} L${L[0]},${L[1] + T} Z`} className="ex2-side-l" />
      <path d={`M${B} L${R} L${R[0]},${R[1] + T} L${B[0]},${B[1] + T} Z`} className="ex2-side-r" />
      <path d={`M${CX},${y} L${R} L${B} L${L} Z`} className="ex2-top" />
      <g transform={ISO(y)} className="ex2-motif">
        {MOTIFS[c.motif]}
      </g>
      <path d={`M${CX},${y} L${R} L${B} L${L} Z`} className="ex2-glow" />
      </g>
      {/* leader line and label (never dimmed: the label keeps full contrast) */}
      <path d={`M${lead[0]},${lead[1]} L${left ? lx + 120 : lx - 120},${lead[1]}`} className="ex2-lead" />
      <text x={lx} y={lead[1] + 6} textAnchor={left ? "start" : "end"} className="ex2-label">
        {SHORT[c.id]}
      </text>
    </g>
  );
}

function Bullets({ items }) {
  return (
    <ul className="mt-4 space-y-2">
      {items.map((b) => (
        <li key={b} className="flex items-start gap-2.5 text-sm text-graphite">
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#2f7d3a]" strokeWidth={2.2} />
          {b}
        </li>
      ))}
    </ul>
  );
}

const CYCLE_MS = 4000;
const PIN = "(min-width: 1024px) and (min-height: 720px)";

/**
 * Inside the BESS (light): an exploded isometric diagram (an illustration, not a product photo).
 * Desktop with room: the section pins (CSS sticky, 90 vh of extra scroll) and the six slabs separate
 * with the scroll, each with a leader line to its label. Choose a component (the tab list, or click
 * a slab): it lifts and glows, the others drop to 40 %, its card shows. It steps through them by
 * itself every 4 s until the first interaction, only on screen, never under reduced motion. Phones:
 * no pin — shown exploded, with an accordion; without JavaScript the accordion shows at every width.
 */
export default function Exploded() {
  const uid = `ex${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const outer = useRef(null);
  const svg = useRef(null);
  const tabs = useRef([]);
  const [active, setActive] = useState(COMPONENTS.length - 1);
  const [auto, setAuto] = useState(true);
  const [picked, setPicked] = useState(0);
  const stop = () => setAuto(false);
  const select = (i, { focus = false, user = true } = {}) => {
    setActive(i);
    setPicked((n) => n + 1);
    if (user) stop();
    if (focus) tabs.current[i]?.focus();
  };

  // Scrubbed separation while pinned; fully exploded otherwise.
  useEffect(() => {
    const el = outer.current;
    const s = svg.current;
    if (!el || !s) return;
    const mq = window.matchMedia(PIN);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (!mq.matches || still) return s.style.setProperty("--sep", "1");
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
      s.style.setProperty("--sep", Math.min(1, p / 0.7).toFixed(3));
    };
    const onScroll = () => !raf && (raf = requestAnimationFrame(update));
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    mq.addEventListener("change", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mq.removeEventListener("change", onScroll);
    };
  }, []);

  // Auto-cycle (desktop, motion allowed, on screen) until the first interaction.
  useEffect(() => {
    const el = outer.current;
    if (!el || !auto) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(min-width: 1024px)").matches) return;
    let onScreen = false;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    const t = setInterval(() => {
      if (!onScreen || document.hidden) return;
      setActive((i) => (i + COMPONENTS.length - 1) % COMPONENTS.length);
      setPicked((n) => n + 1);
    }, CYCLE_MS);
    return () => {
      clearInterval(t);
      io.disconnect();
    };
  }, [auto]);

  const onKey = (e) => {
    const n = COMPONENTS.length;
    const at = Math.max(0, tabs.current.indexOf(e.target));
    const to = { ArrowDown: at + 1, ArrowRight: at + 1, ArrowUp: at - 1, ArrowLeft: at - 1, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    select((to + n) % n, { focus: true });
  };
  const c = COMPONENTS[active];

  return (
    <section ref={outer} aria-labelledby="home2-inside" onPointerDown={stop} className="ex2 relative bg-paper text-ink">
      <noscript>
        <style>{".ex2-tabs{display:none!important}.ex2-acc{display:block!important}.ex2-acc details::details-content{content-visibility:visible;display:block}.ex2-acc summary>span:last-child{display:none}"}</style>
      </noscript>
      <div className="ex2-sticky">
        <div className="container-site py-20 lg:py-0">
          <Eyebrow>Explore the technology</Eyebrow>
          <h2 id="home2-inside" className="mt-3 text-[clamp(2rem,1.2rem+2.6vw,3.6rem)] font-semibold leading-[1.02] tracking-tight">
            Inside the BESS
          </h2>

          <div className="mt-8 grid gap-10 lg:mt-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-12">
            <figure>
              <svg
                ref={svg}
                viewBox={`0 0 ${VB[0]} ${VB[1]}`}
                role="group"
                aria-label="Exploded diagram of a battery energy storage system: fire protection, thermal management, EMS, PCS, BMS and battery modules, top to bottom"
                className="ex2-svg mx-auto block h-auto w-full overflow-visible lg:max-h-[calc(100svh-15rem)] lg:w-auto"
                style={{ "--sep": 1 }}
              >
                {COMPONENTS.map((x, i) => (
                  <Slab key={x.id} c={x} i={i} on={i === active} dim={i !== active} onPick={() => select(i)} />
                )).reverse()}
              </svg>
              <figcaption className="mt-3 text-center text-xs leading-relaxed text-graphite">
                Illustrative diagram. Components and configuration vary by product; see each product page for exact specifications.
              </figcaption>
            </figure>

            <div>
              <div role="tablist" aria-orientation="vertical" aria-label="BESS components" onKeyDown={onKey} onFocus={stop} className="ex2-tabs hidden flex-col gap-1.5 lg:flex">
                {COMPONENTS.map((x, i) => {
                  const on = i === active;
                  return (
                    <button
                      key={x.id}
                      ref={(b) => (tabs.current[i] = b)}
                      id={`${uid}-tab-${x.id}`}
                      role="tab"
                      type="button"
                      aria-selected={on}
                      aria-controls={`${uid}-panel`}
                      tabIndex={on ? 0 : -1}
                      onClick={() => select(i)}
                      className={`relative flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-[background-color,border-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f7d3a] ${
                        on ? "border-[#2f7d3a]/50 bg-white" : "border-transparent hover:border-line hover:bg-white/60"
                      }`}
                    >
                      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${on ? "bg-[#2f7d3a]" : "bg-sage/40"}`} />
                      <span className={`text-[0.95rem] font-semibold ${on ? "text-ink" : "text-graphite"}`}>{x.title}</span>
                      {on && auto && (
                        <span aria-hidden="true" className="absolute inset-x-4 bottom-0 h-px overflow-hidden">
                          <span key={picked} className="ex-progress block h-full w-full bg-[#2f7d3a]/60" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${c.id}`} className="ex2-tabs mt-5 hidden min-h-[14rem] lg:block">
                <div key={picked} className="ex-card rounded-2xl border border-line bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f7d3a]">{c.sub}</p>
                  <h3 className="mt-2 text-xl font-semibold">{c.title}</h3>
                  <p className="mt-2 leading-relaxed text-graphite">{c.text}</p>
                  <Bullets items={c.bullets} />
                </div>
              </div>

              {/* Phones / tablets (and every width without JavaScript): an accordion. */}
              <div className="ex2-acc space-y-2 lg:hidden">
                {COMPONENTS.map((x, i) => (
                  <details
                    key={x.id}
                    name={`${uid}-acc`}
                    open={i === COMPONENTS.length - 1}
                    onToggle={(e) => e.currentTarget.open && i !== active && select(i)}
                    className="group rounded-xl border border-line bg-white open:border-[#2f7d3a]/40"
                  >
                    <summary className="flex cursor-pointer list-none items-start gap-3 rounded-xl px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f7d3a] [&::-webkit-details-marker]:hidden">
                      <span className="flex-1">
                        <span className="block font-semibold">{x.title}</span>
                        <span className="mt-0.5 block text-sm text-graphite">{x.sub}</span>
                      </span>
                      <span aria-hidden="true" className="mt-0.5 text-lg leading-none text-[#2f7d3a] transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="leading-relaxed text-graphite">{x.text}</p>
                      <Bullets items={x.bullets} />
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
