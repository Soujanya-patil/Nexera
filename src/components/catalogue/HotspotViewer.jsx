import { useState } from "react";
import { Info } from "lucide-react";

/**
 * Interactive product view: the Home hero's annotation language (green anchor with a breathing
 * ring, thin leader, dark technical label) applied to a still, with every point clickable.
 *
 *  - Hover / keyboard focus on a point: its leader draws up from the anchor and the label appears.
 *  - Click (or Enter) selects it: the information panel beside the image (below it on phones)
 *    shows that component. The same list is rendered in the panel as buttons, so touch and
 *    keyboard users get everything without hover.
 *
 * Points are percentages of the image (the stage keeps the image's own aspect, object-contain).
 */
export default function HotspotViewer({ hotspots, partnerName }) {
  const { image, imageAlt, caption, points } = hotspots;
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(points[0].id);
  const current = points.find((p) => p.id === selected);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start">
      <figure>
        <div className="relative aspect-[65/54] overflow-hidden rounded-2xl bg-[#161D1F] ring-1 ring-white/10 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75)]">
          <img src={image} alt={imageAlt} loading="lazy" decoding="async" className="h-full w-full object-contain" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(75% 70% at 50% 52%, transparent 60%, rgba(3,16,13,0.35) 100%)" }} />
          {points.map((p, i) => {
            const shown = hover === p.id || selected === p.id;
            const hot = hover === p.id;
            const [x, y] = p.anchor;
            return (
              <div key={p.id} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                {/* Soft light on the component while it is active */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-0 aspect-square w-[5.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300"
                  style={{ opacity: shown ? 1 : 0, background: "radial-gradient(closest-side, rgba(144,217,136,0.22), rgba(144,217,136,0.06) 55%, transparent)" }}
                />
                {/* Leader: draws upward from the anchor */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-0 h-7 w-px origin-bottom -translate-x-1/2 bg-signal/80 transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-50%) scaleY(${shown ? 1 : 0})` }}
                />
                {/* Label */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-7 left-0 whitespace-nowrap rounded-[3px] border border-signal/40 bg-deep/90 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-white backdrop-blur-sm transition-[opacity,transform] duration-300 ease-out"
                  style={{
                    transform: `translateX(${x < 20 ? "-20%" : x > 80 ? "-80%" : "-50%"}) translateY(${shown ? "0" : "4px"})`,
                    opacity: shown ? 1 : 0,
                    transitionDelay: shown ? "120ms" : "0ms",
                  }}
                >
                  {p.label}
                </span>
                {/* Anchor button (enlarged hit area) */}
                <button
                  type="button"
                  onPointerEnter={() => setHover(p.id)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(p.id)}
                  onBlur={() => setHover(null)}
                  onClick={() => setSelected(p.id)}
                  aria-label={`${i + 1}. ${p.label}`}
                  aria-pressed={selected === p.id}
                  className="absolute left-0 top-0 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-signal"
                >
                  <span className="relative block h-2 w-2">
                    <span className="animate-hotspot-pulse absolute inset-0 rounded-full bg-signal" style={{ animationDelay: `${i * 180}ms` }} />
                    <span
                      className={`relative block h-full w-full rounded-full bg-signal ring-2 transition-[transform,box-shadow] duration-200 ${
                        hot || selected === p.id ? "scale-150 shadow-[0_0_10px_2px_rgba(144,217,136,0.55)] ring-signal/35" : "ring-deep/70"
                      }`}
                    />
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        {caption && <figcaption className="mt-3 text-xs leading-relaxed text-ice/60">{caption}</figcaption>}
      </figure>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div aria-live="polite" className="min-h-[7.5rem]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">
            {String(points.indexOf(current) + 1).padStart(2, "0")} / {String(points.length).padStart(2, "0")}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">{current.label}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ice/75">{current.text}</p>
          <p className="mt-3 flex items-start gap-1.5 text-xs text-ice/50">
            <Info aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
            Name and location from {partnerName}&rsquo;s protection-architecture documentation.
          </p>
        </div>
        <ul className="mt-5 grid gap-1.5 border-t border-white/10 pt-4" aria-label="Components">
          {points.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelected(p.id)}
                onPointerEnter={() => setHover(p.id)}
                onPointerLeave={() => setHover(null)}
                aria-pressed={selected === p.id}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-signal ${
                  selected === p.id ? "bg-signal/10 text-white" : "text-ice/75 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.625rem] font-semibold ${selected === p.id ? "bg-signal text-forest" : "bg-white/10 text-ice/70"}`}>
                  {i + 1}
                </span>
                {p.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
