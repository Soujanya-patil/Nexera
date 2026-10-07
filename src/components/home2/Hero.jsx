import MagneticButton from "../ui/MagneticButton";
import Wordmark from "../Wordmark";
import { isFirstLoad } from "../../lib/firstLoad";
import Blueprint from "./Blueprint";
import MediaSlot, { hasMedia } from "./MediaSlot";

// Chip icons: drawn as plain strokes with pathLength 1, so they can draw in with CSS from the first paint.
const ICONS = {
  battery: ["M4 8h13a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z", "M21 11v2", "M10 9.5l-2 2.5h3l-2 2.5"],
  layers: ["M12 3l9 5-9 5-9-5 9-5z", "M3 13l9 5 9-5", "M3 17l9 5 9-5"],
  chip: ["M7 7h10v10H7z", "M10 10h4v4h-4z", "M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"],
  pin: ["M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z", "M12 7.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4z"],
};
const CHIPS = [
  { icon: "battery", title: "Reliable", sub: "Energy Storage" },
  { icon: "layers", title: "Scalable", sub: "for Every Need" },
  { icon: "chip", title: "Advanced", sub: "Technology Partners" },
  { icon: "pin", title: "Support", sub: "Across India" },
];

const letters = (word, cls, from = 0) =>
  [...word].map((ch, i) => (
    <span key={i} className="seq-mask">
      <span className={`seq-ch ${cls}`} data-ch={ch} style={{ "--n": i + from }} />
    </span>
  ));

/**
 * The opening typography (decorative, aria-hidden; ≈ 2.6 s, CSS only so it starts with the first
 * paint): "Sun." → the "S" stays while "Stored." types beside it → "Shared." → the words collapse
 * into the NEXERA wordmark → "STORE TODAY · POWER TOMORROW" → the mark glides to the top-left of the
 * visual. It lives in the visual area only, never over the copy. Plays on a first load (a direct
 * visit); on a client-side visit and under reduced motion it shows its final state.
 */
function Sequence() {
  const settled = !isFirstLoad();
  return (
    <div aria-hidden="true" className={`seq pointer-events-none absolute inset-0 ${settled ? "seq-settled" : ""}`}>
      <div className="seq-words font-semibold leading-none tracking-tight text-white">
        {letters("S", "seq-s")}
        <span className="seq-stack">
          <span>{letters("un.", "seq-un", 1)}</span>
          <span>{letters("tored.", "seq-tored")}</span>
          <span>{letters("hared.", "seq-hared")}</span>
        </span>
      </div>
      <div className="seq-mark text-white">
        <Wordmark className="text-2xl" />
        <span className="seq-tag seq-ch mt-2 block text-[0.5rem] font-semibold uppercase tracking-[0.42em] text-signal" data-ch="Store today · Power tomorrow" />
      </div>
    </div>
  );
}

/**
 * Home v2 hero: "From drawing to energy". The real content (eyebrow, h1, text, buttons) is in the
 * pre-rendered page in its final place from the first paint — the h1 is the LCP. The visual
 * (hero-blueprint.mp4 when supplied, full-bleed on desktop; until then the code-drawn blueprint) and
 * the opening typography sit to the right on desktop and below the copy on phones.
 */
export default function Hero() {
  return (
    <section aria-labelledby="home2-title" className="hero2 relative overflow-hidden text-white">
      {/* Drafting paper: deep charcoal-green, a fine grid, a vignette. */}
      <div aria-hidden="true" className="hero2-paper absolute inset-0" />

      <div className="relative container-site grid gap-8 pb-6 pt-12 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-2 lg:items-center lg:pb-28 lg:pt-10">
        <div className="relative z-10 lg:max-w-[38rem]">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-signal">
            <span aria-hidden="true" className="h-px w-8 bg-signal/70" />
            Energy storage for a brighter tomorrow
          </p>
          <h1 id="home2-title" className="mt-5 text-[clamp(2.7rem,5.6vw,5.4rem)] font-semibold leading-[0.98] tracking-tight [text-wrap:balance]">
            Battery Energy Storage Systems <span className="grad-text">for a Smarter Energy Future</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ice/80">
            NEXERA Powertech brings advanced Battery Energy Storage Systems (BESS) from global technology partners to residential, commercial &amp;
            industrial and utility-scale projects across India.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton to="/products" arrow spotlight ripple>
              Explore BESS
            </MagneticButton>
            <MagneticButton to="/contact" variant="outline" sweep>
              Talk to NEXERA
            </MagneticButton>
          </div>
        </div>

        {/* Visual: full-bleed behind on desktop (its right half carries the drawing and the typography). */}
        <div className="hero2-visual relative -mx-6 aspect-[56/52] sm:mx-0 lg:absolute lg:inset-0 lg:mx-0 lg:aspect-auto">
          <MediaSlot
            file="hero-blueprint.mp4"
            poster="hero-blueprint-start.png"
            still="hero-blueprint-end.png"
            sizes="100vw"
            eager
            className="h-full w-full object-cover"
            fallback={
              <div className="absolute inset-0 grid place-items-center pl-10 pt-20 lg:left-1/2 lg:right-[3%] lg:p-0">
                <Blueprint className="w-[92%] max-w-[40rem] lg:w-[min(100%,calc((100svh-9rem)*1.08))]" />
              </div>
            }
          />
          {/* With the full-bleed video (desktop): a scrim keeps the copy readable over any frame. */}
          {hasMedia("hero-blueprint.mp4") && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden lg:block"
              style={{ background: "linear-gradient(90deg, rgba(7,19,15,0.94) 0%, rgba(7,19,15,0.82) 36%, rgba(7,19,15,0) 58%), linear-gradient(0deg, rgba(7,19,15,0.85), transparent 22%)" }}
            />
          )}
          <div className="seq-area absolute inset-0 lg:left-1/2 lg:right-[3%]">
            <Sequence />
          </div>
        </div>
      </div>

      {/* Bottom edge: the four chips, icons drawing in. */}
      <ul className="relative z-10 container-site grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 py-6 sm:grid-cols-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:bg-[#07130f]/85 lg:py-5">
        {CHIPS.map((c, k) => (
          <li key={c.title} className="flex items-center gap-3">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9 shrink-0 rounded-full border border-signal/35 p-2 text-signal" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[c.icon].map((d, j) => (
                <path key={j} d={d} pathLength="1" className="chip-draw" style={{ "--i": k * 2 + j }} />
              ))}
            </svg>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">{c.title}</span>
              <span className="block text-xs text-ice/70">{c.sub}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
