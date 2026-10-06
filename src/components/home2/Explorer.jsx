import { useEffect, useId, useRef, useState } from "react";
import { Check } from "lucide-react";
import openSrc from "../../assets/catalogue/tcl-blueark-w10-open.webp";
import { SectionHead } from "./shared";

/*
 * The image: TCL BlueArk W10 with its door open (the hero footage's open frame, 1040 × 864), the one
 * photo on the site where the components are actually visible. Zones and hotspots are in its pixels.
 *   - Battery modules: the five stacked packs — plainly visible.
 *   - Fire protection: the aerosol fire-suppression unit and the door's exhaust / intake valves — the
 *     anchors components/cabinet/Callouts.jsx already uses (from the partner reference).
 *   - BMS, PCS, EMS and thermal management: no reference locates them in this cabinet, so their
 *     hotspots sit on the cabinet's side and their zone is the whole system, never a guessed part.
 */
const W = 1040;
const H = 864;
const CABINET = [58, 146, 700, 676];
const COMPONENTS = [
  {
    id: "modules",
    title: "Battery Modules",
    sub: "Cells that store the energy",
    text: "Battery cells are grouped into modules and racks that store the system's energy.",
    bullets: ["Cells grouped into modules and racks", "Sized in kWh / MWh", "LFP chemistry in the systems NEXERA offers"],
    spot: [43, 40],
    zone: [236, 164, 384, 398],
  },
  {
    id: "bms",
    title: "Battery Management System (BMS)",
    sub: "Monitors and protects the battery",
    text: "The BMS monitors cell voltage, current and temperature, and protects the battery from unsafe conditions.",
    bullets: ["Cell-level monitoring", "Cell balancing", "Protection and alarms"],
    spot: [66, 30],
    zone: CABINET,
  },
  {
    id: "pcs",
    title: "Power Conversion System (PCS)",
    sub: "Converts DC to AC and vice versa",
    text: "Converts DC power from the battery to AC power for use in your facility or the grid, and back again to charge.",
    bullets: ["Bi-directional power flow", "High efficiency", "Grid support capabilities"],
    spot: [66, 46],
    zone: CABINET,
  },
  {
    id: "ems",
    title: "Energy Management System (EMS)",
    sub: "Optimizes performance and control",
    text: "The EMS decides when to charge and discharge, based on tariffs, solar generation and site demand.",
    bullets: ["Charge/discharge scheduling", "Peak shaving and solar self-consumption", "Remote monitoring"],
    spot: [66, 62],
    zone: CABINET,
  },
  {
    id: "thermal",
    title: "Thermal Management",
    sub: "Maintains ideal operating temperature",
    text: "Liquid or air cooling keeps cells within their ideal temperature range.",
    bullets: ["Liquid or air cooling", "Even cell temperatures", "Supports long battery life"],
    spot: [66, 78],
    zone: CABINET,
  },
  {
    id: "fire",
    title: "Fire Protection",
    sub: "Multi-level safety mechanisms",
    text: "Multi-level detection and suppression designed to identify and isolate faults early.",
    bullets: ["Gas, smoke and temperature detection", "Fire suppression", "Pressure relief"],
    spot: [26.8, 28.5],
    zone: [110, 182, 220, 350],
  },
];
const CYCLE_MS = 4000;
const DESKTOP = "(min-width: 1024px)";

function Bullets({ items, dark = true }) {
  return (
    <ul className="mt-4 space-y-2">
      {items.map((b) => (
        <li key={b} className={`flex items-start gap-2.5 text-sm ${dark ? "text-ice/85" : "text-graphite"}`}>
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-signal" strokeWidth={2.2} />
          {b}
        </li>
      ))}
    </ul>
  );
}

/**
 * Inside the BESS (dark). Desktop: the six components are a tablist (arrow keys, Home / End) beside
 * the photo; choosing one pulses its hotspot, draws an outline around its zone, dims the rest of the
 * photo and slides its card in. It steps through them by itself every 4 s until the visitor touches
 * anything, only while on screen and never under reduced motion. Phones / tablets: the photo with
 * numbered hotspots, and an accordion below (native <details>); a hotspot opens its item. Without
 * JavaScript the accordion shows at every width, so every component's text is there.
 */
export default function Explorer() {
  const uid = `ex${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const root = useRef(null);
  const tabs = useRef([]);
  const items = useRef([]);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [picked, setPicked] = useState(0); // restarts the outline / card animations
  const stop = () => setAuto(false);

  const select = (i, { focus = false, user = true } = {}) => {
    setActive(i);
    setPicked((n) => n + 1);
    if (user) stop();
    if (focus) tabs.current[i]?.focus();
  };

  // Auto-cycle: desktop layout, motion allowed, on screen, tab visible, until the visitor interacts.
  useEffect(() => {
    const el = root.current;
    if (!el || !auto) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia(DESKTOP).matches) return;
    let onScreen = false;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const t = setInterval(() => {
      if (!onScreen || document.hidden) return;
      setActive((i) => (i + 1) % COMPONENTS.length);
      setPicked((n) => n + 1);
    }, CYCLE_MS);
    return () => {
      clearInterval(t);
      io.disconnect();
    };
  }, [auto]);

  const onKey = (e) => {
    const n = COMPONENTS.length;
    const at = Math.max(0, tabs.current.indexOf(e.target)); // from the focused tab
    const to = { ArrowDown: at + 1, ArrowRight: at + 1, ArrowUp: at - 1, ArrowLeft: at - 1, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    select((to + n) % n, { focus: true });
  };

  // A hotspot: on desktop it selects the tab; on smaller screens it opens that accordion item.
  const fromSpot = (i) => {
    select(i);
    if (window.matchMedia(DESKTOP).matches) return;
    const d = items.current[i];
    if (!d) return;
    d.open = true;
    d.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const c = COMPONENTS[active];
  const [zx, zy, zw, zh] = c.zone;

  return (
    <section
      ref={root}
      aria-labelledby="home2-inside"
      onPointerDown={stop}
      onKeyDown={(e) => e.key === "Tab" || stop()}
      className="relative overflow-hidden bg-night py-20 text-white lg:py-28"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_75%_40%,rgba(144,217,136,0.08),transparent_70%)]" />
      {/* Without JavaScript: the accordion at every width, every item shown open, no tabs (the markup is the same either way). */}
      <noscript>
        <style>{".ex-tabs{display:none!important}.ex-acc{display:block!important}.ex-acc details::details-content{content-visibility:visible;display:block}.ex-acc summary>span:last-child{display:none}"}</style>
      </noscript>
      <div className="relative container-site">
        <SectionHead id="home2-inside" eyebrow="Explore the technology" title="Inside the BESS" dark className="max-w-2xl">
          <p className="mt-5 text-lg leading-relaxed text-ice/75">Discover the key components that make a BESS safe, reliable and high-performing.</p>
        </SectionHead>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          {/* Desktop tablist (JS only; see .ex-tabs in index.css). */}
          <div role="tablist" aria-orientation="vertical" aria-label="BESS components" onKeyDown={onKey} onFocus={stop} className="ex-tabs hidden flex-col gap-2 lg:flex">
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
                  className={`group relative flex items-start gap-4 rounded-xl border px-5 py-4 text-left transition-[background-color,border-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
                    on ? "border-signal/50 bg-white/[0.06]" : "border-white/10 hover:border-white/25 hover:bg-white/[0.03]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums transition-colors duration-300 ${
                      on ? "bg-signal text-forest" : "border border-white/25 text-ice/70"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className={`block font-semibold transition-colors duration-300 ${on ? "text-white" : "text-ice/85"}`}>{x.title}</span>
                    <span className="mt-0.5 block text-sm text-ice/60">{x.sub}</span>
                  </span>
                  {on && auto && (
                    <span aria-hidden="true" className="absolute inset-x-5 bottom-0 h-px origin-left overflow-hidden">
                      <span key={picked} className="ex-progress block h-full w-full bg-signal/70" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div>
            {/* Stage: the photo, the dimmer with a window on the selected zone, its outline, the hotspots. */}
            <figure className="relative">
              <div className="relative overflow-hidden rounded-2xl bg-deep" style={{ aspectRatio: `${W} / ${H}` }}>
                <img
                  src={openSrc}
                  width={W}
                  height={H}
                  loading="lazy"
                  decoding="async"
                  alt="TCL BlueArk W10 cabinet with its door open: five stacked battery modules above the power electronics, fire-protection devices on the door"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full">
                  <defs>
                    <mask id={`${uid}-mask`}>
                      <rect width={W} height={H} fill="white" />
                      <rect x={zx} y={zy} width={zw} height={zh} rx="14" fill="black" />
                    </mask>
                  </defs>
                  <rect width={W} height={H} fill="rgba(3,16,13,0.58)" mask={`url(#${uid}-mask)`} />
                  <rect
                    key={`zone-${picked}`}
                    x={zx}
                    y={zy}
                    width={zw}
                    height={zh}
                    rx="14"
                    pathLength="1"
                    fill="none"
                    stroke="var(--color-signal)"
                    strokeWidth="2.5"
                    className="zone-outline"
                  />
                </svg>
                {COMPONENTS.map((x, i) => {
                  const on = i === active;
                  return (
                    <button
                      key={x.id}
                      type="button"
                      tabIndex={-1}
                      aria-label={`${i + 1}. ${x.title}`}
                      aria-pressed={on}
                      onClick={() => fromSpot(i)}
                      style={{ left: `${x.spot[0]}%`, top: `${x.spot[1]}%` }}
                      className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                    >
                      {on && <span key={picked} aria-hidden="true" className="hotspot-pulse absolute inset-1 rounded-full bg-signal" />}
                      <span
                        aria-hidden="true"
                        className={`relative grid h-6 w-6 place-items-center rounded-full text-[0.6875rem] font-bold tabular-nums shadow-[0_2px_10px_rgba(0,0,0,0.45)] transition-[background-color,color,scale] duration-300 ${
                          on ? "scale-110 bg-signal text-forest" : "bg-white/90 text-forest"
                        }`}
                      >
                        {i + 1}
                      </span>
                    </button>
                  );
                })}
                <span data-energy="explorer" aria-hidden="true" className="absolute right-0 top-1/2 h-px w-px" />
              </div>
              <figcaption className="mt-3 text-xs leading-relaxed text-ice/55">
                Representative system shown. Components and configuration vary by product; see each product page for exact specifications.
              </figcaption>
            </figure>

            {/* Desktop detail card (the tab panel). */}
            <div
              id={`${uid}-panel`}
              role="tabpanel"
              aria-labelledby={`${uid}-tab-${c.id}`}
              className="ex-tabs mt-6 hidden min-h-[13.5rem] lg:block"
            >
              <div key={picked} className="ex-card rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal">
                  {String(active + 1).padStart(2, "0")} / {String(COMPONENTS.length).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{c.title}</h3>
                <p className="mt-2 leading-relaxed text-ice/80">{c.text}</p>
                <Bullets items={c.bullets} />
              </div>
            </div>

            {/* Phones / tablets (and every width without JavaScript): an accordion. */}
            <div className="ex-acc mt-6 space-y-2 lg:hidden">
              {COMPONENTS.map((x, i) => (
                <details
                  key={x.id}
                  ref={(d) => (items.current[i] = d)}
                  name={`${uid}-acc`}
                  open={i === 0}
                  onToggle={(e) => e.currentTarget.open && i !== active && select(i)}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] open:border-signal/40"
                >
                  <summary className="flex cursor-pointer list-none items-start gap-4 rounded-xl px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal [&::-webkit-details-marker]:hidden">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/25 text-xs font-bold tabular-nums text-ice/70 group-open:border-transparent group-open:bg-signal group-open:text-forest"
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold text-white">{x.title}</span>
                      <span className="mt-0.5 block text-sm text-ice/60">{x.sub}</span>
                    </span>
                    <span aria-hidden="true" className="mt-1 text-lg leading-none text-signal transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 pl-16">
                    <p className="leading-relaxed text-ice/80">{x.text}</p>
                    <Bullets items={x.bullets} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
