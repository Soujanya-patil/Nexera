import { useEffect, useRef, useState } from "react";
import { BatteryCharging, EvCharger, House, Lightbulb, Sun, UtilityPole, ZapOff } from "lucide-react";
import { loadGsap } from "../../lib/motion";
import { onceInView } from "../../lib/inview";

// Nodes of the home energy diagram (viewBox 900 × 300).
const NODES = {
  solar: { x: 110, y: 70, Icon: Sun, label: "Solar" },
  grid: { x: 110, y: 230, Icon: UtilityPole, label: "Grid" },
  battery: { x: 420, y: 150, Icon: BatteryCharging, label: "Battery" },
  home: { x: 660, y: 150, Icon: House, label: "Home" },
  ev: { x: 820, y: 62, Icon: EvCharger, label: "EV charger" },
  backup: { x: 820, y: 238, Icon: Lightbulb, label: "Backup loads" },
};
// Lines between them, drawn from source to destination (the dashes travel that way).
const LINES = {
  solarHome: "M146 66 C 330 40, 520 90, 622 138",
  solarBattery: "M144 86 C 250 120, 320 140, 384 148",
  batteryHome: "M456 150 L 622 150",
  gridHome: "M146 232 C 330 250, 520 210, 622 164",
  homeEv: "M694 132 C 735 96, 760 76, 784 68",
  batteryBackup: "M452 168 C 560 236, 680 246, 784 240",
};
/** What each system (the four cards, "01"–"04") switches on. */
export const MODES = {
  1: { nodes: ["solar", "grid", "home"], lines: ["solarHome", "gridHome"] },
  2: { nodes: ["solar", "battery", "home"], lines: ["solarBattery", "batteryHome", "solarHome"] },
  3: { nodes: ["solar", "battery", "home", "backup"], lines: ["solarBattery", "batteryHome", "solarHome", "batteryBackup"], outage: true },
  4: { nodes: Object.keys(NODES), lines: Object.keys(LINES) },
};

/**
 * "A day with home storage" (the slider under the diagram, in the Complete Smart Home Energy mode):
 * which lines carry energy at each hour, and during a power cut. Captions are the slider's live text.
 */
export const DAY = [
  { from: 6, to: 10, nodes: ["solar", "home"], lines: ["solarHome"], caption: "Morning: solar powers the home" },
  { from: 10, to: 16, nodes: ["solar", "home", "battery"], lines: ["solarHome", "solarBattery"], caption: "Midday: solar powers the home and charges the battery" },
  { from: 16, to: 23, nodes: ["battery", "home", "ev"], lines: ["batteryHome", "homeEv"], caption: "Evening: the battery powers the home" },
  { from: 23, to: 30, nodes: ["grid", "home"], lines: ["gridHome"], caption: "Night: the grid takes over" }, // 23:00 → 06:00
];
export const OUTAGE = { nodes: ["battery", "backup"], lines: ["batteryBackup"], outage: true, caption: "Power cut: the battery keeps essential loads running" };
/** The DAY entry for an hour 0–24. */
export const dayAt = (hour) => {
  const h = hour < 6 ? hour + 24 : hour;
  return DAY.find((d) => h >= d.from && h < d.to) ?? DAY[3];
};

/**
 * Animated energy-flow diagram for "Solutions for Every Home" (decorative: aria-hidden; the page
 * carries a visually hidden summary of the selected system, and the day slider a live caption). Active
 * lines carry moving dashes (stroke-dashoffset, CSS; static under reduced motion); inactive nodes and
 * lines fade back. `day` ({ hour, outage }, from the day slider) overrides the system `mode`. Its own
 * chunk, loaded when the section is near.
 */
export default function EnergyFlow({ mode, day }) {
  const m = day ? (day.outage ? OUTAGE : dayAt(day.hour)) : MODES[mode];
  return (
    <svg viewBox="0 0 900 300" aria-hidden="true" className="h-auto w-full" role="presentation">
      {Object.entries(LINES).map(([id, d]) => {
        const on = m.lines.includes(id);
        return (
          <g key={id}>
            <path d={d} fill="none" stroke="currentColor" className="text-forest/12" strokeWidth="3" strokeLinecap="round" />
            <path
              d={d}
              fill="none"
              data-on={on}
              className="flow-line text-signal transition-opacity duration-500"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 8"
              style={{ opacity: on ? 1 : 0 }}
            />
          </g>
        );
      })}
      {Object.entries(NODES).map(([id, { x, y, Icon, label }]) => {
        const on = m.nodes.includes(id);
        const out = id === "grid" && m.outage;
        return (
          <g key={id} className="transition-opacity duration-500" style={{ opacity: on || out ? 1 : 0.35 }}>
            <circle cx={x} cy={y} r="34" className={on ? "fill-white stroke-signal" : "fill-white stroke-forest/20"} strokeWidth="2" />
            <Icon x={x - 14} y={y - 14} width="28" height="28" className={out ? "text-graphite/50" : on ? "text-forest" : "text-sage"} strokeWidth={1.8} />
            {out && (
              <g>
                <circle cx={x + 26} cy={y - 26} r="13" className="fill-amber" />
                <ZapOff x={x + 18} y={y - 34} width="16" height="16" className="text-white" strokeWidth={2.2} />
              </g>
            )}
            <text x={x} y={y + 56} textAnchor="middle" className="fill-forest text-[15px] font-semibold">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const hhmm = (hour) => {
  const h = Math.floor(hour) % 24;
  const m = Math.round((hour % 1) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/**
 * "A day with home storage": a 24-hour range slider under the diagram (sun thumb by day, moon by
 * night) and a "Power cut" toggle chip. Moving either puts the diagram in the Complete Smart Home
 * Energy mode with the flows of that hour (`onDay({ hour, outage })`); a caption under it says what is
 * happening (aria-live). When the slider first scrolls into view at a normal pace it plays the 24 h
 * once (4 s) and then is the visitor's; any interaction stops that at once. Reduced motion: no
 * auto-play. Same chunk as the diagram.
 */
export function DaySlider({ day, hour, onDay }) {
  const root = useRef(null);
  const stop = useRef(() => {});
  const [auto, setAuto] = useState(false); // auto-playing: the caption isn't announced meanwhile
  const outage = !!day?.outage;
  const caption = outage ? OUTAGE.caption : dayAt(hour).caption;

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let off;
    let tween;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      off = onceInView(el, {
        initial: true,
        enter: () => {
          const p = { h: 0 };
          setAuto(true);
          tween = gsap.to(p, {
            h: 24,
            duration: 4,
            ease: "none",
            onUpdate: () => onDay({ hour: Math.round(p.h * 4) / 4, outage: false }),
            onComplete: () => setAuto(false),
          });
          stop.current = () => {
            tween.kill();
            setAuto(false);
          };
        },
        show: () => {},
      });
    });
    return () => {
      cancelled = true;
      off?.();
      tween?.kill();
    };
    // Set up once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const night = hour < 6 || hour >= 18;
  return (
    <div ref={root} onPointerDownCapture={() => stop.current()} onKeyDownCapture={() => stop.current()} className="mt-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <input
          type="range"
          min="0"
          max="24"
          step="0.25"
          value={hour}
          onChange={(e) => onDay({ hour: Number(e.target.value), outage: false })}
          aria-label="Time of day"
          aria-valuetext={`${hhmm(hour)}, ${dayAt(hour).caption}`}
          data-phase={night ? "moon" : "sun"}
          className="day-range min-w-[12rem] flex-1"
        />
        <button
          type="button"
          aria-pressed={outage}
          onClick={() => onDay({ hour, outage: !outage })}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
            outage ? "border-amber bg-amber/15 text-ink" : "border-line bg-paper text-forest hover:border-forest/40"
          }`}
        >
          <ZapOff aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          Power cut
        </button>
      </div>
      <p aria-live={auto ? "off" : "polite"} className={`mt-3 min-h-[1.5rem] text-sm font-medium transition-opacity duration-300 ${day ? "text-forest" : "text-graphite/70"}`}>
        {caption}
      </p>
    </div>
  );
}
