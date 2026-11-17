import { useId } from "react";

/*
 * The Step 11 posts' diagrams (data/blogPosts.js `figure` blocks): one original, static SVG per post, in
 * the site palette (navy ink, the navy-tint panels, sage, and the signal green as a fill behind navy
 * text). Each is an <svg role="img"> named by its aria-label and described by its <desc> (the alt text), drawn
 * on a 440-wide grid so its words stay readable at phone width. Pre-rendered with the page: no layout
 * shift, nothing to load, and the same without JavaScript.
 */

const INK = "var(--color-ink)";
const SAGE = "var(--color-sage)";
const ICE = "var(--color-ice)";
const WHITE = "var(--color-white)";
const GREEN = "var(--color-signal)";
const LINE = "rgb(28 44 92 / 0.25)";

function Svg({ h, title, desc, children }) {
  const id = useId();
  return (
    // Named by aria-label, not an SVG <title>: a <title> element anywhere in the page reads as a second
    // document title to tools that count them (and shows as a tooltip). The <desc> is the alt text.
    <svg viewBox={`0 0 440 ${h}`} role="img" aria-label={title} aria-describedby={`${id}-d`} className="block h-auto w-full" style={{ fontFamily: "inherit" }}>
      <desc id={`${id}-d`}>{desc}</desc>
      {children}
    </svg>
  );
}

/** Text: centred by default, navy, 15 units (≈ 11 px at phone width). */
function T({ x, y, children, size = 15, weight = 500, anchor = "middle", fill = INK }) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight={weight} textAnchor={anchor} fill={fill} dominantBaseline="middle">
      {children}
    </text>
  );
}

function Box({ x, y, w, h, fill = WHITE, stroke = INK, r = 10, children, size, weight = 600 }) {
  const lines = Array.isArray(children) ? children : [children];
  const fs = size ?? 15;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth="1.5" />
      {lines.map((l, i) => (
        <T key={i} x={x + w / 2} y={y + h / 2 + (i - (lines.length - 1) / 2) * (fs + 3)} size={fs} weight={i ? 400 : weight}>
          {l}
        </T>
      ))}
    </g>
  );
}

/** An arrow from (x1, y1) to (x2, y2), its head at the end. */
function Arrow({ x1, y1, x2, y2, color = INK, dashed = false }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const L = 9;
  const p = (da) => `${x2 - L * Math.cos(a - da)},${y2 - L * Math.sin(a - da)}`;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - 6 * Math.cos(a)} y2={y2 - 6 * Math.sin(a)} stroke={color} strokeWidth="2" strokeDasharray={dashed ? "5 4" : undefined} />
      <polygon points={`${x2},${y2} ${p(0.45)} ${p(-0.45)}`} fill={color} />
    </g>
  );
}

// 1. What Is a BESS? — charging and discharging.
function BessFlow() {
  return (
    <Svg
      h={250}
      title="How a BESS charges and discharges"
      desc="Solar power or cheaper grid power charges the battery energy storage system, which holds the battery, BMS, PCS and EMS. When the energy is needed, in the evening, in a power cut or in peak-tariff hours, the system discharges to a home, a factory or the grid. Energy produced at one time is used at another: time shifting."
    >
      <Box x={8} y={40} w={110} h={52} fill={ICE}>{["Solar", "midday surplus"]}</Box>
      <Box x={8} y={120} w={110} h={52} fill={ICE}>{["Grid", "off-peak hours"]}</Box>
      <Arrow x1={120} y1={66} x2={160} y2={96} />
      <Arrow x1={120} y1={146} x2={160} y2={118} />
      <T x={140} y={22} size={13} fill={SAGE}>Charging</T>
      <rect x={162} y={52} width={116} height={110} rx={12} fill={GREEN} stroke={INK} strokeWidth="1.5" />
      <T x={220} y={74} size={17} weight={700}>BESS</T>
      <T x={220} y={98} size={13}>Battery · BMS</T>
      <T x={220} y={118} size={13}>PCS · EMS</T>
      <T x={220} y={142} size={12}>stores the energy</T>
      <Arrow x1={280} y1={107} x2={318} y2={107} />
      <T x={300} y={22} size={13} fill={SAGE}>Discharging</T>
      <Box x={320} y={70} w={112} h={74} fill={ICE}>{["Home, factory", "or the grid", "when needed"]}</Box>
      <T x={220} y={212} size={14} weight={600}>Time shifting: produced at one time, used at another</T>
    </Svg>
  );
}

// 2. Why India needs BESS — the duck curve.
function DuckCurve() {
  const X = (h) => 40 + (h / 24) * 380;
  const demand = [[0, 150], [4, 158], [7, 128], [10, 110], [13, 112], [16, 108], [18, 74], [20, 60], [22, 78], [24, 112]];
  const path = demand.map(([h, y], i) => `${i ? "L" : "M"}${X(h)},${y}`).join(" ");
  return (
    <Svg
      h={250}
      title="Midday solar surplus and the evening peak"
      desc="Over a 24-hour day, solar output rises to a peak around midday while demand is highest in the evening. A battery stores the midday surplus and supplies it into the evening peak after sunset."
    >
      <line x1={40} y1={190} x2={420} y2={190} stroke={LINE} strokeWidth="1.5" />
      {[0, 6, 12, 18, 24].map((h) => (
        <T key={h} x={X(h)} y={206} size={13} fill={SAGE} anchor={h === 24 ? "end" : "middle"}>{h === 24 ? "24 h" : `${h}`}</T>
      ))}
      <path d={`M${X(6)},190 C${X(9)},190 ${X(10)},60 ${X(12.5)},60 C${X(15)},60 ${X(16)},190 ${X(19)},190 Z`} fill={GREEN} fillOpacity="0.55" stroke={INK} strokeWidth="1.2" />
      <path d={path} fill="none" stroke={INK} strokeWidth="2.5" />
      <T x={X(12.5)} y={44} size={14} weight={600}>Solar: midday surplus</T>
      <T x={X(20.5)} y={42} size={14} weight={600}>Evening peak</T>
      <Arrow x1={X(14)} y1={130} x2={X(18.3)} y2={92} />
      <T x={X(10.5)} y={150} size={13}>Battery charges</T>
      <T x={X(21.2)} y={128} size={13}>and discharges</T>
      <rect x={X(1)} y={226} width={16} height={4} fill={INK} />
      <T x={X(1) + 22} y={228} size={13} anchor="start">Demand</T>
      <rect x={X(9)} y={221} width={16} height={12} fill={GREEN} fillOpacity="0.55" stroke={INK} />
      <T x={X(9) + 22} y={228} size={13} anchor="start">Solar output (illustrative shapes)</T>
    </Svg>
  );
}

// 3. DC vs AC vs hybrid — three ways to connect the battery.
function CouplingThree() {
  const row = (y, label) => <T x={8} y={y} size={14} weight={700} anchor="start">{label}</T>;
  return (
    <Svg
      h={340}
      title="AC-coupled, DC-coupled and hybrid battery storage"
      desc="AC-coupled: the solar array has its own PV inverter, and the battery joins the AC side through its own PCS. DC-coupled: the solar array and the battery share a DC bus and one inverter. Hybrid: one hybrid PCS takes solar, battery, grid and generator together and supplies the loads."
    >
      {row(18, "AC-coupled")}
      <Box x={8} y={32} w={72} h={44} fill={ICE}>PV</Box>
      <Arrow x1={80} y1={54} x2={104} y2={54} />
      <Box x={104} y={32} w={96} h={44}>{["PV", "inverter"]}</Box>
      <Arrow x1={200} y1={54} x2={226} y2={54} />
      <Box x={226} y={32} w={70} h={44} fill={GREEN}>AC bus</Box>
      <Arrow x1={350} y1={54} x2={298} y2={54} />
      <Box x={350} y={32} w={82} h={44}>PCS</Box>
      <T x={391} y={92} size={13}>Battery</T>
      <line x1={391} y1={76} x2={391} y2={84} stroke={INK} strokeWidth="2" />

      {row(126, "DC-coupled")}
      <Box x={8} y={140} w={72} h={44} fill={ICE}>PV</Box>
      <Arrow x1={80} y1={162} x2={104} y2={162} />
      <Box x={104} y={140} w={70} h={44}>MPPT</Box>
      <Arrow x1={174} y1={162} x2={198} y2={162} />
      <Box x={198} y={140} w={78} h={44} fill={GREEN}>DC bus</Box>
      <Arrow x1={276} y1={162} x2={300} y2={162} />
      <Box x={300} y={140} w={82} h={44}>Inverter</Box>
      <T x={412} y={162} size={13}>AC</T>
      <line x1={237} y1={184} x2={237} y2={198} stroke={INK} strokeWidth="2" />
      <T x={237} y={208} size={13}>Battery</T>

      {row(240, "Hybrid")}
      <T x={8} y={262} size={13} anchor="start">PV</T>
      <T x={8} y={282} size={13} anchor="start">Battery</T>
      <T x={8} y={302} size={13} anchor="start">Grid</T>
      <T x={8} y={322} size={13} anchor="start">Generator</T>
      {[262, 282, 302, 322].map((y) => (
        <Arrow key={y} x1={82} y1={y} x2={160} y2={292} />
      ))}
      <Box x={160} y={266} w={130} h={52} fill={GREEN}>{["Hybrid PCS", "one unit"]}</Box>
      <Arrow x1={290} y1={292} x2={330} y2={292} />
      <Box x={330} y={270} w={102} h={44}>Loads</Box>
    </Svg>
  );
}

// 4. Designing and sizing — the seven steps.
function SizingSteps() {
  const steps = ["Define the job", "Collect the data", "Size kW and kWh", "Choose the architecture", "Design the connection", "Plan civil works", "Operate and commission"];
  return (
    <Svg
      h={330}
      title="The seven steps of BESS design"
      desc="Step 1, define the job. Step 2, collect the data. Step 3, size power in kW and energy in kWh. Step 4, choose the architecture and equipment. Step 5, design the electrical connection. Step 6, plan the civil and mechanical work. Step 7, set the operating strategy and commission."
    >
      <line x1={36} y1={30} x2={36} y2={306} stroke={LINE} strokeWidth="2" />
      {steps.map((s, i) => {
        const y = 30 + i * 46;
        return (
          <g key={s}>
            <circle cx={36} cy={y} r={16} fill={i === 2 ? GREEN : INK} />
            <T x={36} y={y + 1} size={14} weight={700} fill={i === 2 ? INK : WHITE}>{`${i + 1}`}</T>
            <rect x={64} y={y - 17} width={368} height={34} rx={8} fill={i === 2 ? GREEN : ICE} fillOpacity={i === 2 ? 0.55 : 1} />
            <T x={80} y={y} size={15} weight={600} anchor="start">{s}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 5. Inside a BESS — cell to system.
function CellToSystem() {
  const items = [
    ["Cell", "3.2 V LFP"],
    ["Module", "cells + sensors"],
    ["Rack", "system voltage"],
    ["Cabinet", "cooling, fire"],
    ["System", "PCS, EMS, grid"],
  ];
  return (
    <Svg
      h={220}
      title="From cell to system"
      desc="A BESS is built up in stages: cells are joined into modules with sensors, modules are stacked into racks that reach the system voltage, racks sit in a cabinet or container with cooling, fire protection and controls, and the cabinet plus PCS, EMS and switchgear make the system connected to the network."
    >
      {items.map(([name, sub], i) => {
        const x = 6 + i * 87;
        const s = 26 + i * 12;
        return (
          <g key={name}>
            <rect x={x + (76 - s) / 2} y={118 - s} width={s} height={s} rx={5} fill={i === 4 ? GREEN : ICE} stroke={INK} strokeWidth="1.5" />
            <T x={x + 38} y={146} size={15} weight={700}>{name}</T>
            <T x={x + 38} y={168} size={12} fill={SAGE}>{sub}</T>
            {i < 4 && <Arrow x1={x + 72} y1={100} x2={x + 92} y2={100} />}
          </g>
        );
      })}
      <T x={220} y={204} size={13}>Protection works at every level, so a fault can be isolated before it spreads</T>
    </Svg>
  );
}

// 6. C&I BESS — the five business cases.
function CiCases() {
  const cases = [
    [220, 40, "ToD tariff savings"],
    [370, 118, "Peak shaving"],
    [322, 238, "Solar self-use, zero export"],
    [118, 238, "Backup, less diesel"],
    [70, 118, "Capacity relief"],
  ];
  return (
    <Svg
      h={280}
      title="Five business cases for C&I battery storage"
      desc="A commercial and industrial battery serves five main business cases: time-of-day tariff savings, peak shaving of demand charges, solar self-consumption and zero export, backup with less diesel generator use, and capacity relief when transformer capacity is short. Most projects combine two or three."
    >
      {cases.map(([x, y]) => (
        <line key={`${x}-${y}`} x1={220} y1={140} x2={x} y2={y} stroke={LINE} strokeWidth="2" />
      ))}
      <circle cx={220} cy={140} r={50} fill={GREEN} stroke={INK} strokeWidth="1.5" />
      <T x={220} y={132} size={16} weight={700}>C&amp;I</T>
      <T x={220} y={152} size={16} weight={700}>BESS</T>
      {cases.map(([x, y, label]) => {
        const w = label.length * 7.6 + 24;
        return (
          <g key={label}>
            <rect x={Math.min(Math.max(x - w / 2, 4), 436 - w)} y={y - 17} width={w} height={34} rx={17} fill={ICE} stroke={INK} strokeWidth="1.2" />
            <T x={Math.min(Math.max(x, 4 + w / 2), 436 - w / 2)} y={y} size={14} weight={600}>{label}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 7. ToD tariff in Karnataka — a day with the peak windows.
function TodDay() {
  const X = (h) => 30 + (h / 24) * 400;
  return (
    <Svg
      h={250}
      title="A working day under a time-of-day tariff"
      desc="A 24-hour day with two peak windows, 6 to 9 am and 6 to 10 pm, as in KERC's FY2024-25 order. The battery charges from solar during the day or from the grid in cheaper hours, and discharges in the peak windows so the site buys less power at the peak rate."
    >
      <rect x={X(6)} y={50} width={X(9) - X(6)} height={120} fill={INK} fillOpacity="0.14" />
      <rect x={X(18)} y={50} width={X(22) - X(18)} height={120} fill={INK} fillOpacity="0.14" />
      <rect x={X(9)} y={50} width={X(17) - X(9)} height={120} fill={GREEN} fillOpacity="0.4" />
      <T x={(X(6) + X(9)) / 2} y={34} size={13} weight={700}>Peak</T>
      <T x={(X(6) + X(9)) / 2} y={186} size={13}>6–9 am</T>
      <T x={(X(18) + X(22)) / 2} y={34} size={13} weight={700}>Peak</T>
      <T x={(X(18) + X(22)) / 2} y={186} size={13}>6–10 pm</T>
      <T x={(X(9) + X(17)) / 2} y={66} size={13} weight={700}>Daytime and solar hours</T>
      <Arrow x1={X(11)} y1={140} x2={X(15)} y2={90} color={INK} />
      <T x={(X(9) + X(17)) / 2} y={152} size={13}>Battery charges</T>
      <Arrow x1={X(18.4)} y1={90} x2={X(21.6)} y2={140} color={INK} />
      <T x={(X(18) + X(22)) / 2} y={74} size={13}>Discharges</T>
      <line x1={30} y1={170} x2={430} y2={170} stroke={LINE} strokeWidth="1.5" />
      {[0, 6, 12, 18, 24].map((h) => (
        <T key={h} x={X(h)} y={206} size={13} fill={SAGE} anchor={h === 24 ? "end" : "middle"}>{h === 24 ? "24 h" : `${h}`}</T>
      ))}
      <T x={220} y={234} size={13}>Peak slots as in KERC's FY2024-25 order: check your current bill</T>
    </Svg>
  );
}

// 8. Peak shaving — the load curve under a demand limit.
function PeakShave() {
  const X = (t) => 30 + t * 4;
  const pts = [[0, 150], [10, 140], [18, 132], [24, 70], [30, 135], [40, 128], [50, 120], [56, 60], [62, 64], [68, 122], [80, 130], [88, 140], [100, 150]];
  const limit = 100;
  const load = pts.map(([t, y], i) => `${i ? "L" : "M"}${X(t)},${y}`).join(" ");
  return (
    <Svg
      h={240}
      title="Peak shaving under a demand limit"
      desc="A site's load over time with two short spikes above a set demand limit. During the spikes the battery supplies the part above the limit, so the utility meter records a lower maximum demand. The battery recharges when the load falls."
    >
      <defs>
        <clipPath id="ps-above">
          <rect x="0" y="0" width="440" height={limit} />
        </clipPath>
      </defs>
      <path d={`${load} L${X(100)},190 L${X(0)},190 Z`} fill={ICE} />
      <path d={`${load} L${X(100)},190 L${X(0)},190 Z`} fill={GREEN} clipPath="url(#ps-above)" />
      <path d={load} fill="none" stroke={INK} strokeWidth="2.5" />
      <line x1={30} y1={limit} x2={430} y2={limit} stroke={INK} strokeWidth="1.8" strokeDasharray="6 5" />
      <T x={430} y={limit - 12} size={13} weight={700} anchor="end">Demand limit</T>
      <T x={X(24)} y={52} size={13}>Battery covers</T>
      <T x={X(59)} y={44} size={13}>the spikes</T>
      <T x={X(84)} y={168} size={13}>Grid supplies the rest</T>
      <line x1={30} y1={190} x2={430} y2={190} stroke={LINE} strokeWidth="1.5" />
      <T x={230} y={212} size={13} fill={SAGE}>Time (one day, illustrative)</T>
    </Svg>
  );
}

// 9. Solar plus storage — zero export.
function ZeroExport() {
  return (
    <Svg
      h={270}
      title="Solar plus storage on a zero-export site"
      desc="In the day, solar supplies the site's loads and the surplus charges the battery, so nothing is exported at the meter. In the evening, the battery supplies the loads."
    >
      <T x={110} y={16} size={14} weight={700}>Day</T>
      <Box x={8} y={34} w={92} h={44} fill={GREEN}>Solar</Box>
      <Arrow x1={100} y1={56} x2={124} y2={56} />
      <Box x={124} y={34} w={92} h={44}>Loads</Box>
      <Arrow x1={54} y1={78} x2={54} y2={112} />
      <Box x={8} y={112} w={92} h={44} fill={ICE}>{["Battery", "charges"]}</Box>
      <Box x={124} y={112} w={92} h={44} fill={WHITE}>{["Meter", "export: 0"]}</Box>
      <line x1={170} y1={78} x2={170} y2={112} stroke={INK} strokeWidth="2" />

      <line x1={232} y1={20} x2={232} y2={170} stroke={LINE} strokeWidth="1.5" />

      <T x={336} y={16} size={14} weight={700}>Evening</T>
      <Box x={248} y={112} w={92} h={44} fill={ICE}>{["Battery", "discharges"]}</Box>
      <Arrow x1={340} y1={134} x2={360} y2={78} />
      <Box x={340} y={34} w={92} h={44}>Loads</Box>
      <Box x={248} y={34} w={80} h={44} fill={WHITE}>{["Solar", "≈ 0"]}</Box>

      <T x={220} y={206} size={13}>The full array can be built: surplus is stored, not curtailed,</T>
      <T x={220} y={226} size={13}>and export stays within the DISCOM&apos;s approval</T>
    </Svg>
  );
}

// 10. TCL BlueArk and Hithium — the range by size.
function RangeBySize() {
  const rows = [
    ["TCL BlueArk X5", "100 kWh per cabinet, to 1 MWh in parallel", 100],
    ["TCL BlueArk W10", "261 kWh per cabinet, expandable to 6.3 MWh", 261],
    ["Hithium ∞Power 1022 kWh", "1022 kWh liquid-cooled cabinet", 1022],
    ["Hithium ∞Power 6.25 MWh", "6.25 MWh in a 20-foot container", 6250],
  ];
  const W = (kwh) => 40 + (Math.log10(kwh) - 1.8) * 70;
  return (
    <Svg
      h={290}
      title="The TCL BlueArk and Hithium range by size"
      desc="From smallest to largest: the TCL BlueArk X5, 100 kWh per cabinet and up to 1 MWh with ten in parallel; the TCL BlueArk W10, 261 kWh per cabinet and expandable to 6.3 MWh; the Hithium ∞Power 1022 kWh liquid-cooled cabinet; and the Hithium ∞Power 6.25 MWh in a 20-foot container. Bar lengths are on a logarithmic scale."
    >
      {rows.map(([name, sub, kwh], i) => {
        const y = 22 + i * 64;
        return (
          <g key={name}>
            <T x={8} y={y} size={15} weight={700} anchor="start">{name}</T>
            <rect x={8} y={y + 14} width={W(kwh)} height={18} rx={9} fill={i < 2 ? GREEN : INK} fillOpacity={i < 2 ? 0.8 : 0.85} />
            <T x={16 + W(kwh)} y={y + 23} size={13} anchor="start">{sub}</T>
          </g>
        );
      })}
      <T x={8} y={278} size={12} anchor="start" fill={SAGE}>Energy per unit; bar lengths on a log scale</T>
    </Svg>
  );
}

export const DIAGRAMS = {
  "bess-flow": BessFlow,
  "duck-curve": DuckCurve,
  "coupling-three": CouplingThree,
  "sizing-steps": SizingSteps,
  "cell-to-system": CellToSystem,
  "ci-cases": CiCases,
  "tod-day": TodDay,
  "peak-shave": PeakShave,
  "zero-export": ZeroExport,
  "range-by-size": RangeBySize,
};
