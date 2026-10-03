import { BatteryCharging, EvCharger, House, Lightbulb, Sun, UtilityPole, ZapOff } from "lucide-react";

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
 * Animated energy-flow diagram for "Solutions for Every Home" (decorative: aria-hidden; the page
 * carries a visually hidden summary of the selected system). Active lines carry moving dashes
 * (stroke-dashoffset, CSS; static under reduced motion); inactive nodes and lines fade back. Its own
 * chunk, loaded when the section is near.
 */
export default function EnergyFlow({ mode }) {
  const m = MODES[mode];
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
