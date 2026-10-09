import { useEffect, useId, useRef, useState } from "react";
import { useSceneMotion } from "./useScene";

// Sources (left) feed the battery when charging; the battery feeds the loads (right) when discharging.
const WIRES = {
  charging: [
    ["sun", "M76 58 C 120 58, 132 106, 168 112"],
    ["gridIn", "M76 190 C 120 190, 132 142, 168 136"],
  ],
  discharging: [
    ["home", "M232 108 C 270 98, 292 52, 320 50"],
    ["factory", "M232 124 L 318 124"],
    ["gridOut", "M232 140 C 270 150, 292 196, 320 198"],
  ],
};
const LEVEL = { charging: 0.88, discharging: 0.24 };
const LABEL = { charging: "Charging", discharging: "Discharging" };

/**
 * "How does a BESS work?": solar and the grid on the left, the battery in the middle, a home, a
 * factory and the grid on the right. Charging: energy flows in along the left wires and the battery
 * fills; discharging: it flows out to the right and the battery drains. Particles travel the wires
 * (MotionPath). It plays through both modes once when it arrives, follows the "Charging" /
 * "Discharging" points as they are read, and the Charging / Discharging switch (two radio buttons)
 * sets it by hand. Without motion: arrowheads on the active wires show the direction.
 */
export default function EnergyFlow({ active, motion, mode: sceneMode, step }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const root = useRef(null);
  const [mode, setMode] = useState("charging");
  const byHand = useRef(false);
  const auto = useRef(null);
  const lastLevel = useRef(1); // the battery level the last tween reached (a mode change continues from it)

  // Arrival: charging, then discharging (once), unless the reader has taken over.
  useEffect(() => {
    if (!motion || !active || byHand.current) return;
    setMode("charging");
    auto.current = setTimeout(() => !byHand.current && setMode("discharging"), 3600);
    return () => clearTimeout(auto.current);
  }, [motion, active]);
  // Reading the "Charging:" / "Discharging:" points (stage).
  useEffect(() => {
    if (byHand.current || sceneMode !== "stage" || step < 0) return;
    clearTimeout(auto.current);
    setMode(step >= 1 ? "discharging" : "charging");
  }, [step, sceneMode]);

  useSceneMotion(
    root,
    motion,
    active,
    ({ gsap }, el) => {
      const dense = sceneMode === "stage" ? 3 : 2;
      const tl = gsap.timeline();
      const level = el.querySelector("[data-level]");
      tl.fromTo(
        level,
        { scaleY: lastLevel.current },
        { scaleY: LEVEL[mode], duration: 1.4, ease: "power2.inOut", onUpdate: () => (lastLevel.current = gsap.getProperty(level, "scaleY")) },
        0
      );
      for (const [name] of WIRES[mode]) {
        const path = el.querySelector(`[data-wire="${name}"]`);
        const dots = [...el.querySelectorAll(`[data-dot="${name}"]`)].slice(0, dense);
        const dur = 1.6;
        dots.forEach((dot, i) => {
          tl.fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0);
          tl.to(dot, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: dur, ease: "none", repeat: -1, delay: (dur / dense) * i }, 0);
        });
      }
      return tl;
    },
    [mode]
  );

  const pick = (m) => {
    byHand.current = true;
    clearTimeout(auto.current);
    setMode(m);
  };
  const on = (group) => mode === group;

  return (
    <div ref={root} data-mode={mode} className="flex h-full flex-col justify-center gap-3 px-4 py-3">
      <svg
        role="img"
        aria-label={`Energy flow, ${LABEL[mode].toLowerCase()}: ${
          mode === "charging" ? "solar power and the grid flow into the battery, which fills" : "the battery supplies a home, a factory and the grid, and drains"
        }`}
        viewBox="0 0 400 250"
        className="mx-auto h-auto max-h-[78%] w-full"
      >
        <defs>
          <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#90D988" />
          </marker>
        </defs>
        {/* Wires */}
        {Object.entries(WIRES).map(([group, wires]) =>
          wires.map(([name, d]) => (
            <path
              key={name}
              data-wire={name}
              d={d}
              fill="none"
              strokeWidth="2.2"
              strokeLinecap="round"
              className={`transition-[stroke,opacity] duration-500 ${on(group) ? "stroke-signal opacity-100" : "stroke-white/25 opacity-70"}`}
              markerEnd={!motion && on(group) ? `url(#${uid}-arrow)` : undefined}
            />
          ))
        )}
        {/* Particles (motion only) */}
        {motion &&
          Object.values(WIRES).flat().map(([name]) =>
            [0, 1, 2].map((i) => <circle key={`${name}-${i}`} data-dot={name} r="3.6" cx="0" cy="0" fill="#90D988" opacity="0" className="drop-shadow-[0_0_4px_rgba(144,217,136,0.9)]" />)
          )}

        {/* Sun */}
        <g transform="translate(56 56)" className="stroke-[#F4F7F4]" fill="none" strokeWidth="2" strokeLinecap="round">
          <circle r="11" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="0" y1="-16" x2="0" y2="-20" transform={`rotate(${a})`} />
          ))}
        </g>
        {/* Grid pylon (in) */}
        <Pylon x={56} y={190} />
        {/* Battery */}
        <g>
          <rect x="188" y="70" width="24" height="9" rx="2" fill="#F4F7F4" opacity="0.8" />
          <rect x="170" y="78" width="60" height="96" rx="9" fill="none" stroke="#F4F7F4" strokeWidth="2.2" />
          <rect
            data-level
            x="176"
            y="84"
            width="48"
            height="84"
            rx="5"
            fill="#90D988"
            // Without motion the level is set here; with motion GSAP owns it (a fill or a drain).
            style={{ transformBox: "fill-box", transformOrigin: "50% 100%", ...(motion ? {} : { transform: `scaleY(${LEVEL[mode]})` }) }}
          />
          <path d="M203 104 l-8 16 h10 l-8 16" fill="none" stroke="#071A17" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* Home */}
        <path d="M330 52 v-18 l14 -11 l14 11 v18 z M340 52 v-9 h8 v9" transform="translate(-6 -2)" fill="none" stroke="#F4F7F4" strokeWidth="2" strokeLinejoin="round" />
        {/* Factory */}
        <path d="M322 138 v-22 l10 6 v-6 l10 6 v-6 l10 6 v-14 h7 v30 z" fill="none" stroke="#F4F7F4" strokeWidth="2" strokeLinejoin="round" />
        {/* Grid pylon (out) */}
        <Pylon x={344} y={200} />

        <g className="fill-white/70 text-[11px] font-medium" textAnchor="middle">
          <text x="56" y="92">Solar</text>
          <text x="56" y="236">Grid</text>
          <text x="200" y="196">Battery</text>
          <text x="344" y="72">Home</text>
          <text x="344" y="156">Factory</text>
          <text x="344" y="240">Grid</text>
        </g>
      </svg>

      <fieldset className="mx-auto">
        <legend className="sr-only">Battery mode</legend>
        <div className="flex rounded-full border border-white/15 bg-white/5 p-1">
          {["charging", "discharging"].map((m) => (
            <label key={m} className="relative">
              <input type="radio" name={`${uid}-mode`} value={m} checked={mode === m} onChange={() => pick(m)} className="peer sr-only" />
              <span className="flex min-h-11 cursor-pointer items-center rounded-full px-4 text-sm font-semibold text-ice/75 transition-colors duration-300 peer-checked:bg-signal peer-checked:text-forest peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal">
                {LABEL[m]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function Pylon({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke="#F4F7F4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-9 18 L0 -18 L9 18 M-6 6 h12 M-4 -4 h8 M-13 -10 h26 M-6 6 L4 -4 M6 6 L-4 -4" />
    </g>
  );
}
