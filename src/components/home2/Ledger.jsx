import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { partnerOf } from "../../data/products";
import { onceInView } from "../../lib/inview";
import { LEDGER } from "./data";
import { Eyebrow, whenNear } from "./shared";

const BLOCKS = ["▮", "▯", "▪"];

/**
 * A figure that flips in like a departures board as its row enters: each character cell flips
 * through two or three BLOCK glyphs — never a digit or a letter, so no wrong figure ever shows — and
 * lands on its character, left to right, ≤ 0.8 s in all. The final text is in the HTML from the start
 * (and is what assistive tech reads); a cell is only put into its waiting block state once the row is
 * known to be below the viewport. Fast scroll, already on screen, reduced motion: the plain figure.
 */
function Flap({ text, onDone }) {
  const ref = useRef(null);
  const [cells, setCells] = useState(null); // null: the plain text
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return void onDone?.();
    const chars = [...text];
    const timers = [];
    const off = onceInView(el, {
      below: () => setCells(chars.map((c) => (c === " " ? " " : BLOCKS[0]))),
      show: () => {
        setCells(null);
        onDone?.();
      },
      enter: () => {
        const n = chars.length;
        // Every cell starts on a block, so no final character shows before its own flip.
        setCells(chars.map((c) => (c === " " ? " " : BLOCKS[0])));
        const step = Math.min(40, 380 / Math.max(1, n - 1));
        chars.forEach((c, i) => {
          if (c === " ") return;
          const flips = 2 + (i % 2);
          for (let k = 0; k <= flips; k++)
            timers.push(
              setTimeout(() => setCells((cur) => (cur ?? chars.map((x) => (x === " " ? " " : BLOCKS[0]))).map((x, j) => (j === i ? (k === flips ? c : BLOCKS[(k + i) % 3]) : x))), i * step + k * 90 + 20)
            );
        });
        timers.push(
          setTimeout(() => {
            setCells(null);
            onDone?.();
          }, (n - 1) * step + 4 * 90 + 40)
        );
      },
    });
    return () => {
      off();
      timers.forEach(clearTimeout);
    };
    // Once, for this text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  // Plain text (once, as in the pre-rendered page) except while the cells flip; the outer span stays
  // the same element (it is the one being watched).
  return (
    <span ref={ref} data-final={text} className="relative inline-block">
      {cells ? (
        <>
          <span className="sr-only">{text}</span>
          <span aria-hidden="true" className="inline-flex">
            {cells.map((c, i) =>
              c === " " ? (
                <span key={i} className="inline-block w-[0.28em]" />
              ) : (
                <span key={`${i}-${c}`} className="flap-cell flap-flip">
                  {c}
                </span>
              )
            )}
          </span>
        </>
      ) : (
        text
      )}
    </span>
  );
}

function Logo({ id, name }) {
  const p = partnerOf(id);
  return (
    <span className="ledger-logo grid h-12 w-36 shrink-0 place-items-center rounded-full bg-white px-5">
      {p ? (
        <img src={p.logo} alt={name} loading="lazy" decoding="async" className={`${id === "clou" ? "h-7" : "h-5"} w-auto`} />
      ) : (
        <span className="text-xl font-bold uppercase tracking-[0.02em] text-forest">{name}</span>
      )}
    </span>
  );
}

/**
 * Partners as credibility (dark): a credential ledger, one wide row per partner — logo, ONE figure
 * the site already shows (with its exact label), what NEXERA brings from them and a link. Figures flip
 * in; then each row sends a thin green line to the NEXERA spine on the right (a bar along the bottom
 * on phones): four partners feeding one platform. Hover / focus brightens a row and colours its logo.
 */
export default function Ledger() {
  const wrap = useRef(null);
  const spine = useRef(null);
  const rows = useRef([]);
  const [geo, setGeo] = useState(null);
  const [done, setDone] = useState(() => LEDGER.map(() => false));

  // The converging lines, measured from the rows and the spine (once the ledger is near the screen).
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect();
      const s = spine.current.getBoundingClientRect();
      const desk = window.matchMedia("(min-width: 1024px)").matches;
      const paths = rows.current.map((r) => {
        const b = r.getBoundingClientRect();
        if (desk) {
          const x0 = b.right - w.left;
          const y0 = b.top + b.height / 2 - w.top;
          const x1 = s.left - w.left;
          const y1 = s.top + s.height / 2 - w.top;
          const mx = x0 + (x1 - x0) * 0.55;
          return `M${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
        }
        const x0 = b.right - w.left;
        const y0 = b.top + b.height / 2 - w.top;
        const x1 = w.width - 8;
        const y1 = s.top - w.top;
        return `M${x0} ${y0} L${x1 - 8} ${y0} Q${x1} ${y0} ${x1} ${y0 + 8} L${x1} ${y1}`;
      });
      setGeo({ w: w.width, h: w.height, paths });
    };
    return whenNear(el, () => {
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    });
  }, []);

  return (
    <section aria-labelledby="home2-partners" className="relative bg-deep py-20 text-white lg:py-28">
      <div className="container-site">
        <Eyebrow dark>Our technology partners</Eyebrow>
        <h2 id="home2-partners" className="mt-4 max-w-4xl text-[clamp(2rem,1.2rem+2.6vw,3.6rem)] font-semibold leading-[1.02] tracking-tight [text-wrap:balance]">
          World-class storage technology. Delivered and supported in India by NEXERA.
        </h2>

        <div ref={wrap} className="relative mt-12 pr-5 lg:mt-16 lg:pr-24">
          {geo && (
            <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${geo.w} ${geo.h}`} fill="none">
              {geo.paths.map((d, i) => (
                <path key={i} d={d} pathLength="1" className="ledger-line" data-on={done[i]} stroke="#90D988" strokeWidth="1.25" />
              ))}
            </svg>
          )}
          <ul className="relative space-y-3 pb-14 lg:pb-0">
            {LEDGER.map((p, i) => (
              <li
                key={p.id}
                ref={(r) => (rows.current[i] = r)}
                className="ledger-row group grid items-center gap-x-8 gap-y-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 transition-[background-color,border-color] duration-300 hover:border-signal/40 hover:bg-white/[0.07] focus-within:border-signal/40 focus-within:bg-white/[0.07] md:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)] md:px-7"
              >
                <Logo id={p.id} name={p.name} />
                <div>
                  <p className="text-[clamp(2rem,1.3rem+2.4vw,3.4rem)] font-semibold leading-none tracking-tight tabular-nums text-white">
                    <Flap text={p.figure} onDone={() => setDone((d) => d.map((x, j) => (j === i ? true : x)))} />
                  </p>
                  <p className="mt-2 text-sm text-ice/75">{p.label}</p>
                </div>
                <div className="md:pr-6">
                  <p className="text-[0.95rem] leading-snug text-ice/90">{p.brings}</p>
                  <Link
                    to={p.link.to}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-signal underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
                  >
                    {p.link.text}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          {/* The spine: right on desktop, a bar along the bottom on phones. */}
          <div
            ref={spine}
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 grid h-9 place-items-center rounded-full border border-signal/40 bg-signal/10 text-xs font-bold uppercase tracking-[0.5em] text-signal lg:inset-x-auto lg:bottom-0 lg:right-0 lg:top-0 lg:h-auto lg:w-11 lg:[writing-mode:vertical-rl]"
          >
            NEXERA
          </div>
        </div>
        <p className="mt-6 text-xs text-ice/65">NEXERA is an authorized distributor and solutions partner. Figures as published by each partner.</p>
      </div>
    </section>
  );
}
