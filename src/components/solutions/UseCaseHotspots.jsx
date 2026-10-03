import { useEffect, useState } from "react";

const DESKTOP = "(min-width: 1024px)";

/**
 * Hotspots over the utility use-case illustration (its own chunk, loaded when the map is near).
 * Each is a real <button> named by its use case; hover, focus or tap makes it the active one (shared
 * with the list beside the map). On desktop the active hotspot opens a small glass card with the use
 * case's title and text (aria-hidden — the list beside the map is the real text); on phones there are
 * no popovers, the list below highlights instead.
 */
export default function UseCaseHotspots({ items, active, setActive }) {
  const [desktop, setDesktop] = useState(() => window.matchMedia(DESKTOP).matches);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const on = () => setDesktop(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return (
    <div className="absolute inset-0" onPointerLeave={() => desktop && setActive(null)}>
      {items.map((it, i) => {
        const [x, y] = it.at;
        const on = active === i;
        return (
          <div key={it.title} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
            <button
              type="button"
              aria-label={it.title}
              aria-pressed={on}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(on && !desktop ? null : i)}
              className="group/hs relative -ml-4 -mt-4 grid h-8 w-8 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <span aria-hidden="true" className="hotspot-ring absolute inset-1 rounded-full bg-signal" style={{ animationDelay: `${i * 0.3}s` }} />
              <span
                aria-hidden="true"
                className={`relative h-3.5 w-3.5 rounded-full border-2 border-white shadow-[0_0_0_3px_rgba(7,26,23,0.25)] transition-[scale,background-color] duration-300 ${
                  on ? "scale-125 bg-forest" : "bg-signal group-hover/hs:scale-110"
                }`}
              />
            </button>
            {desktop && on && (
              <div
                aria-hidden="true"
                className={`journey-detail pointer-events-none absolute z-20 w-64 rounded-xl border border-white/60 bg-white/75 p-4 text-left shadow-[0_18px_40px_-20px_rgba(7,26,23,0.5)] backdrop-blur-md ${
                  y < 40 ? "top-6" : "bottom-6"
                } ${x > 62 ? "right-0" : "-left-4"}`}
              >
                <p className="font-semibold text-ink">{it.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-graphite">{it.text}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
