import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BatteryCharging, Handshake, Layers, MapPin, RefreshCw } from "lucide-react";
import { partnerOf } from "../../data/products";
import { PARTNER_CARDS } from "./data";
import { reducedMotion, SectionHead, useDrawIn } from "./shared";

const AUTO_MS = 3500;
const DESKTOP = "(min-width: 1024px)";

/** A partner's mark: its logo where the site has one, otherwise its name set as a wordmark (Midea). */
function Mark({ id, name, grey }) {
  const p = partnerOf(id);
  if (!p)
    return (
      <span className={`text-[1.7rem] font-bold uppercase leading-none tracking-[0.02em] ${grey ? "text-graphite/70" : "text-forest"}`}>{name}</span>
    );
  return <img src={p.logo} alt={p.name} loading="lazy" decoding="async" className={`${id === "clou" ? "h-9" : "h-7"} w-auto ${grey ? "opacity-70 grayscale" : ""}`} />;
}

/**
 * A partner card that flips: front, the logo in grey; back (hover with a mouse, keyboard focus on its
 * link, or a tap on touch screens), the logo in colour, one figure the site already shows and a link.
 */
function PartnerCard({ c }) {
  const [flipped, setFlipped] = useState(false);
  const name = c.name ?? partnerOf(c.id)?.name;
  return (
    <li
      data-flipped={flipped}
      onClick={(e) => {
        if (e.target.closest("a")) return;
        setFlipped((f) => !f);
      }}
      className="flip-card w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-2.5rem)/2.6)]"
    >
      <div className="flip-inner relative h-60">
        <div className="flip-face absolute inset-0 grid place-items-center rounded-2xl border border-line bg-white">
          <Mark id={c.id} name={name} grey />
          <RefreshCw aria-hidden="true" className="absolute bottom-4 right-4 h-4 w-4 text-sage/60" strokeWidth={1.8} />
        </div>
        <div className="flip-face flip-back absolute inset-0 flex flex-col rounded-2xl border border-signal/50 bg-white p-6">
          <div className="flex h-9 items-center">
            <Mark id={c.id} name={name} />
          </div>
          <p className="mt-auto text-3xl font-semibold tracking-tight text-ink">{c.figure}</p>
          <p className="mt-1 text-sm text-graphite">{c.label}</p>
          <Link
            to={c.link.to}
            className="group mt-4 inline-flex items-center gap-1.5 self-start rounded-md text-sm font-semibold text-forest underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          >
            {c.link.text}
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
          </Link>
        </div>
      </div>
    </li>
  );
}

const WHY = [
  { icon: Handshake, title: "Proven Technology Partnerships", text: "Global brands, trusted solutions" },
  { icon: BatteryCharging, title: "BESS-Focused Expertise", text: "Deep understanding of energy storage" },
  { icon: Layers, title: "Solutions for Every Scale", text: "From residential to utility" },
  { icon: MapPin, title: "Local Support in India", text: "End-to-end support across the country" },
];

/**
 * Partners + Why NEXERA (light). The partner row is a scroller (swipe on touch) with ← → buttons;
 * on desktop it also advances by itself, slowly, paused while hovered, focused or off screen, and
 * not at all under reduced motion. Why NEXERA: each icon draws in and its ring fills like a charge.
 */
export default function Partners() {
  const track = useRef(null);
  const why = useRef(null);
  const paused = useRef(false);
  useDrawIn(why);

  const step = (dir) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild;
    const by = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "20") : el.clientWidth;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const behavior = reducedMotion() ? "auto" : "smooth";
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior });
    else if (dir < 0 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior });
    else el.scrollBy({ left: dir * by, behavior });
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (reducedMotion() || !window.matchMedia(DESKTOP).matches) return;
    let onScreen = false;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    const t = setInterval(() => {
      if (onScreen && !paused.current && !document.hidden) step(1);
    }, AUTO_MS);
    return () => {
      clearInterval(t);
      io.disconnect();
    };
    // `step` only reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hold = (on) => () => (paused.current = on);

  return (
    <section aria-labelledby="home2-partners" className="bg-ice py-20 lg:py-28">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead id="home2-partners" eyebrow="Powered by global leaders" title="Our Technology Partners" className="max-w-2xl">
            <p className="mt-5 text-lg leading-relaxed text-graphite">
              We work with leading energy storage technology providers to deliver reliable and future-ready solutions.
            </p>
          </SectionHead>
          <div className="flex gap-2">
            {[
              [-1, "Previous partners", ArrowLeft],
              [1, "Next partners", ArrowRight],
            ].map(([dir, label, Icon]) => (
              <button
                key={dir}
                type="button"
                aria-label={label}
                aria-controls="home2-partner-track"
                onClick={() => step(dir)}
                className="grid h-11 w-11 place-items-center rounded-full border border-forest/40 text-forest transition-colors duration-300 hover:border-forest hover:bg-forest hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>

        <ul
          ref={track}
          id="home2-partner-track"
          aria-label="Technology partners"
          onPointerEnter={hold(true)}
          onPointerLeave={hold(false)}
          onFocus={hold(true)}
          onBlur={hold(false)}
          className="no-scrollbar -mx-2 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 py-2 lg:mt-12"
        >
          {PARTNER_CARDS.map((c) => (
            <PartnerCard key={c.id} c={c} />
          ))}
        </ul>

        <div className="mt-20 border-t border-line pt-16 lg:mt-24 lg:pt-20">
          <SectionHead id="home2-why" eyebrow="Why choose NEXERA" title="More Than a Supplier. A Trusted Partner." className="max-w-3xl" />
          <ul ref={why} className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex flex-col">
                <span className="relative grid h-16 w-16 place-items-center">
                  <svg aria-hidden="true" viewBox="0 0 64 64" className="absolute inset-0 h-full w-full" fill="none">
                    <circle cx="32" cy="32" r="30" className="fill-signal/15" stroke="none" data-nodraw />
                    <circle cx="32" cy="32" r="30" pathLength="1" stroke="var(--color-signal)" strokeWidth="2.5" strokeLinecap="round" className="charge-ring" />
                  </svg>
                  <Icon aria-hidden="true" className="relative h-7 w-7 text-forest" strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-graphite">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
