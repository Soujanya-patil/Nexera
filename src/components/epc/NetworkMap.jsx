import { useState } from "react";
import AnimatedText from "../ui/AnimatedText";
import { OFFICES } from "./content";

// Schematic frame: longitude 70–86° E, latitude 8–32° N, longitude compressed by cos(20°) so the
// relative positions are true. No coastline or border is drawn — this is a network view, not a map.
const LON = [70, 86];
const LAT = [8, 32];
const K = 0.94;
const W = (LON[1] - LON[0]) * K;
const H = LAT[1] - LAT[0];
const pos = (o) => ({ x: (((o.lon - LON[0]) * K) / W) * 100, y: ((LAT[1] - o.lat) / H) * 100 });
const HQ = OFFICES.find((o) => o.id === "bangalore");

/**
 * PAN-INDIA NETWORK — the offices from Where We Operate as points on a minimal network schematic:
 * Bangalore (headquarters) and Kalaburagi (regional office, training center) as solid green points
 * with a solid link, Nagpur and Delhi as outlined points on dashed links, labelled "Planned".
 * Pointing at, focusing or tapping a point — or its row in the list — pulses it and opens a small
 * card with what that location does. Nothing is implied beyond the listed locations.
 */
export default function NetworkMap() {
  const [active, setActive] = useState("bangalore");
  const current = OFFICES.find((o) => o.id === active);
  const cp = pos(current);

  return (
    <section aria-labelledby="network-title" className="relative overflow-hidden bg-deep-grid py-20 text-white md:py-28">
      <div className="grid container-site items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow text-accent">Our network</p>
          <AnimatedText id="network-title" className="mt-3 text-h2 font-semibold">
            Rooted in Karnataka. Growing Across India.
          </AnimatedText>
          <p className="mt-4 max-w-md text-body text-paper/75">
            Headquartered in Bangalore, with a regional office and technician training center in Kalaburagi. Nagpur and
            Delhi are planned expansions.
          </p>

          <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {[...OFFICES].reverse().map((o) => {
              const on = o.id === active;
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(o.id)}
                    onFocus={() => setActive(o.id)}
                    onClick={() => setActive(o.id)}
                    className="group flex w-full items-center gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${o.status === "active" ? "bg-accent" : "border border-accent/70"}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className={`block font-semibold transition-colors ${on ? "text-accent" : "text-white group-hover:text-accent group-focus-visible:text-accent group-focus-within:text-accent"}`}>{o.city}</span>
                      <span className="block text-small text-paper/60">
                        {o.role}
                        {o.detail && ` · ${o.detail}`}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 eyebrow ${
                        o.status === "active" ? "bg-accent/15 text-accent" : "bg-white/8 text-paper/60"
                      }`}
                    >
                      {o.status === "active" ? "Active" : "Planned"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Schematic */}
        <div className="relative mx-auto w-full max-w-[17rem] sm:max-w-md" aria-hidden="true">
          <div className="relative" style={{ aspectRatio: `${W} / ${H}` }}>
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                backgroundImage: "radial-gradient(color-mix(in srgb, var(--color-paper) 13%, transparent) 1px, transparent 1.4px)",
                backgroundSize: "18px 18px",
                maskImage: "radial-gradient(60% 55% at 45% 55%, #000 30%, transparent 80%)",
                WebkitMaskImage: "radial-gradient(60% 55% at 45% 55%, #000 30%, transparent 80%)",
              }}
            />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              {OFFICES.filter((o) => o.id !== HQ.id).map((o) => {
                const a = pos(HQ);
                const b = pos(o);
                return (
                  <line
                    key={o.id}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    vectorEffect="non-scaling-stroke"
                    stroke={o.status === "active" ? "color-mix(in_srgb,var(--accent)_75%,transparent)" : "color-mix(in_srgb,var(--accent)_35%,transparent)"}
                    strokeWidth="1.25"
                    strokeDasharray={o.status === "active" ? undefined : "4 5"}
                  />
                );
              })}
            </svg>

            {OFFICES.map((o) => {
              const p = pos(o);
              const on = o.id === active;
              return (
                <span
                  key={o.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(o.id)}
                  onClick={() => setActive(o.id)}
                >
                  <span className="relative flex h-8 w-8 cursor-pointer items-center justify-center">
                    {on && <span className="animate-hotspot-pulse absolute h-3.5 w-3.5 rounded-full bg-accent/60" />}
                    <span
                      className={`relative rounded-full transition-[scale] duration-fast ${on ? "scale-125" : ""} ${
                        o.status === "active" ? "h-3.5 w-3.5 bg-accent ring-4 ring-accent/15" : "h-3 w-3 border-[1.5px] border-accent/80 bg-deep-grid"
                      }`}
                    />
                  </span>
                  <span
                    className={`absolute left-8 top-1/2 -translate-y-1/2 whitespace-nowrap text-micro font-semibold tracking-[0.06em] transition-[color,opacity] ${
                      on ? `text-white ${p.x > 52 ? "" : "sm:opacity-0"}` : "text-paper/55"
                    }`}
                  >
                    {o.city.replace(/ \(.*\)/, "")}
                  </span>
                </span>
              );
            })}

            {/* Info card for the active location (floats beside the point from sm up) */}
            <div
              key={current.id}
              className="journey-detail pointer-events-none absolute z-10 hidden w-52 rounded-lg border border-white/12 bg-deep-grid/90 p-3.5 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:block"
              style={{
                left: `${cp.x}%`,
                top: `${cp.y}%`,
                transform: cp.x > 52 ? "translate(calc(-100% - 1.25rem), -50%)" : "translate(1.25rem, -50%)",
              }}
            >
              <OfficeCard office={current} />
            </div>
          </div>
          {/* Phones: the same card, below the schematic */}
          <div key={`m-${current.id}`} className="journey-detail mt-4 rounded-lg border border-white/12 bg-deep-grid/90 p-3.5 sm:hidden">
            <OfficeCard office={current} />
          </div>
          <p className="mt-4 text-center eyebrow text-paper/40">
            Schematic · relative positions, not a map
          </p>
        </div>
      </div>
    </section>
  );
}

function OfficeCard({ office }) {
  return (
    <>
      <p className="eyebrow text-accent">
        {office.status === "active" ? office.role : "Planned expansion"}
      </p>
      <p className="mt-1 text-small font-semibold text-white">{office.city}</p>
      {office.detail && <p className="mt-1 text-micro text-paper/70">{office.detail}</p>}
    </>
  );
}
