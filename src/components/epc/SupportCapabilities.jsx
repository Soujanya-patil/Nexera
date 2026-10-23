import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import { CAPABILITIES } from "./content";
import { useMediaQuery, useScrollSteps } from "../../lib/scrollSteps";
import { loadGsap } from "../../lib/motion";
import { useScrollReveal } from "../../lib/scrollReveal";
import { getLenis } from "../../lib/lenis";
import { SCROLL_DUR, STAGGER } from "../../lib/tokens";

// Pinned, scroll-driven track from tablet width up, at any viewport height (the cards size to the
// height); motion must be allowed.
const PIN = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const pad = (n) => String(n).padStart(2, "0");
// Pacing: 1 px of card travel takes SLOW px of scrolling, and the first and last HOLD of the pinned
// range hold still, so card 01 and card 06 each rest fully in view before the row moves on / releases.
const SLOW = 1.6;
const HOLD = 0.08;

/**
 * ONE PARTNER. THROUGH THE PROJECT. — what NEXERA brings to the project, as a horizontal showcase of
 * six large capability cards (the Partnership Journey above is the lifecycle; this is the toolkit).
 *
 * The only thing the visitor ever does is scroll DOWN. From tablet width up (motion allowed) the
 * section pins, and GSAP ScrollTrigger progress (useScrollSteps) advances the sequence to the RIGHT:
 * the cards stay in order 01 -> 06 left to right, and as the page scrolls down the row slides so that
 * 04, 05 and 06 arrive in turn from the right edge (01 leaves on the left). The section is as tall as
 * the travel needs at a calm pace (SLOW px of scroll per px of movement, with a short HOLD at each
 * end), and releases once card 06 has rested in view. There is no horizontal scroller anywhere: the
 * row sits in an `overflow: clip` stage, which cannot be scrolled sideways by wheel,
 * trackpad, drag or focus; tabbing to a card that is off-stage glides the PAGE to where it is shown.
 * The card in the reading position is at full strength, the rest slightly subdued; a counter and a
 * progress bar track it. Hover lifts a card only — the track position comes from scroll alone.
 * Phones: the cards simply stack, revealed as they scroll in. Reduced motion: a plain grid.
 */
export default function SupportCapabilities() {
  const pinned = useMediaQuery(PIN);
  const root = useRef(null);
  const viewport = useRef(null);
  const track = useRef(null);
  const active = useScrollSteps(root, CAPABILITIES.length, { start: "top 64px", end: "bottom bottom", enabled: pinned });
  const reveal = useScrollReveal(track);

  // Horizontal travel = how far the row overflows its viewport; the section's height is the pinned
  // viewport plus that travel x SLOW.
  const [travel, setTravel] = useState(0);
  useLayoutEffect(() => {
    if (!pinned) return;
    // Layout positions (offsetLeft/Width ignore transforms): card 01 at the left, 06 at the right.
    const measure = () => {
      const cards = track.current.children;
      const last = cards[cards.length - 1];
      const span = last.offsetLeft + last.offsetWidth - cards[0].offsetLeft;
      setTravel(Math.max(0, span - track.current.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport.current);
    ro.observe(track.current);
    return () => ro.disconnect();
  }, [pinned]);
  // The section's height follows the travel, so re-measure every trigger on the page when it changes.
  useLayoutEffect(() => {
    if (pinned) loadGsap().then(({ ScrollTrigger }) => ScrollTrigger.refresh());
  }, [pinned, travel]);

  /** Keyboard: a card focused while off-stage — move the PAGE (never the row) to where it is centred. */
  const showCard = (e) => {
    if (!pinned || !travel) return;
    const li = e.currentTarget.parentElement;
    const w = track.current.clientWidth;
    const progress = parseFloat(root.current.style.getPropertyValue("--progress")) || 0;
    const x = li.offsetLeft - Math.max(0, Math.min(1, (progress - HOLD) / (1 - 2 * HOLD))) * travel;
    if (x >= 0 && x + li.offsetWidth <= w) return; // already fully visible
    const move = Math.max(0, Math.min(1, (li.offsetLeft - (w - li.offsetWidth) / 2) / travel));
    const p = HOLD + move * (1 - 2 * HOLD);
    const y = root.current.getBoundingClientRect().top + window.scrollY - 64 + p * travel * SLOW;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: SCROLL_DUR });
    else window.scrollTo({ top: y });
  };

  return (
    <section
      ref={root}
      aria-labelledby="capabilities-title"
      className="relative bg-white"
      style={pinned ? { height: `calc(100svh - 4rem + ${Math.round(travel * SLOW)}px)` } : undefined}
    >
      <div
        className={`relative flex flex-col justify-center overflow-clip ${
          pinned ? "sticky top-16 h-[calc(100svh-4rem)] py-8" : "py-section"
        }`}
      >
        <div className="container-site">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-muted">What NEXERA brings</p>
              <AnimatedText id="capabilities-title" className="mt-3 text-h2 font-semibold text-ink">
                One Partner. Through the Project.
              </AnimatedText>
            </div>
            <div className="md:text-right">
              <p className="max-w-sm text-copy">Technology access, engineering support and service — not just at the sale.</p>
              {pinned && (
                <div className="mt-4 flex items-center gap-4 md:justify-end" aria-hidden="true">
                  <span className="text-micro font-semibold tracking-[0.18em] text-muted">
                    <span className="text-accent">{pad(active + 1)}</span> / {pad(CAPABILITIES.length)}
                  </span>
                  <span className="relative h-0.5 w-32 overflow-hidden rounded-full bg-forest/10">
                    <span className="absolute inset-0 origin-left bg-accent" style={{ scale: "var(--progress, 0) 1" }} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card row. Pinned: a clipped stage, the track translated by scroll only. Otherwise: stacked
            cards (phones) or a grid (reduced motion) — never a horizontal scroller. */}
        <div ref={viewport} className={`container-site ${pinned ? "mt-8 lg:mt-10" : "mt-12"}`}>
          <ul
            ref={track}
            data-sr-state={pinned ? undefined : reveal}
            className={pinned ? "relative flex gap-5 will-change-transform" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}
            style={
              pinned
                ? { transform: `translate3d(calc(clamp(0, (var(--progress, 0) - ${HOLD}) / ${1 - 2 * HOLD}, 1) * -${travel}px), 0, 0)` }
                : undefined
            }
          >
            {CAPABILITIES.map((c, i) => {
              const Icon = c.icon;
              const dim = pinned && i !== active;
              return (
                <li
                  key={c.title}
                  data-sr={pinned ? undefined : ""}
                  className={
                    pinned
                      ? `w-[22rem] shrink-0 transition-[opacity,scale] duration-base ease-standard lg:w-[24rem] ${dim ? "scale-[0.97] opacity-60" : "scale-100 opacity-100"}`
                      : undefined
                  }
                >
                  <Link
                    to={c.to}
                    onFocus={showCard}
                    className={`group relative flex ${pinned ? "h-[clamp(16.5rem,calc(100svh-19rem),24rem)]" : "h-full min-h-[17rem]"} flex-col overflow-hidden rounded-card border border-line bg-ice/60 p-8 card-hover hover:bg-white focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-offset-2`}
                  >
                    {/* Background: faint grid + soft light, sliding in on hover */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 translate-x-6 opacity-0 transition-[opacity,translate] duration-slow ease-standard group-hover:translate-x-0 group-focus-within:translate-x-0 group-hover:opacity-100 group-focus-within:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                      style={{
                        backgroundImage:
                          "radial-gradient(60% 70% at 100% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%), linear-gradient(color-mix(in srgb, var(--color-forest) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-forest) 5%, transparent) 1px, transparent 1px)",
                        backgroundSize: "100% 100%, 28px 28px, 28px 28px",
                        maskImage: "linear-gradient(to left, #000, transparent 85%)",
                        WebkitMaskImage: "linear-gradient(to left, #000, transparent 85%)",
                      }}
                    />
                    <span aria-hidden="true" className="absolute left-8 top-0 h-0.5 w-14 origin-left scale-x-0 rounded-full bg-accent transition-[scale] duration-base ease-standard group-hover:scale-x-100 group-focus-within:scale-x-100 group-focus-visible:scale-x-100" />

                    <div className="relative flex items-start justify-between">
                      <span className="text-display tabular-nums font-semibold leading-none text-accent/15 transition-colors duration-fast group-hover:text-accent/30 group-focus-visible:text-accent/30 group-focus-within:text-accent/30">
                        {pad(i + 1)}
                      </span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-control border border-line bg-white text-ink transition-[background-color,border-color,color] duration-fast group-hover:text-on-accent group-focus-visible:text-on-accent group-focus-within:text-on-accent group-hover:border-accent group-focus-visible:border-accent group-focus-within:border-accent group-hover:bg-accent group-focus-visible:bg-accent group-focus-within:bg-accent">
                        <Icon aria-hidden="true" className="h-5 w-5 transition-transform duration-base ease-standard group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5 group-focus-within:-translate-y-0.5 group-hover:rotate-[-6deg] group-focus-visible:rotate-[-6deg] group-focus-within:rotate-[-6deg]" strokeWidth={1.75} />
                      </span>
                    </div>
                    <h3 className="relative mt-auto text-h3 font-semibold uppercase tracking-[0.06em] text-ink">{c.title}</h3>
                    <p className="relative mt-3 text-body text-copy">{c.copy}</p>
                    <span className="relative mt-6 inline-flex items-center gap-2 text-small font-semibold text-accent">
                      {c.cta}
                      <ArrowRight aria-hidden="true" className="h-4 w-4 -translate-x-1 opacity-60 transition-[translate,opacity] duration-fast group-hover:translate-x-1 group-focus-visible:translate-x-1 group-focus-within:translate-x-1 group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-within:opacity-100" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
