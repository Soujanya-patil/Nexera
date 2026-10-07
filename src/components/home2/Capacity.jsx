import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import RollValue from "../RollValue";
import { partnerOf } from "../../data/products";
import { cutoutOf, SCALE_ITEMS, SEGMENTS, segmentSummary } from "./data";
import { Eyebrow } from "./shared";

// Log scale. It starts at 5 kWh (not 10) because the smallest system, BlueArk X1, starts at 8 kWh.
const MIN = Math.log10(5);
const MAX = 4; // 10 MWh
const x = (kwh) => ((Math.log10(kwh) - MIN) / (MAX - MIN)) * 100;
const TICKS = [
  [10, "10 kWh"],
  [100, "100 kWh"],
  [1000, "1 MWh"],
  [10000, "10 MWh"],
];
const COLOR = { residential: "#C9861F", ci: "#2f7d3a", utility: "#2b6f86" };
// Darker versions for text (AA on the light ground).
const INK = { residential: "#7f520c", ci: "#2a6f34", utility: "#215468" };

/**
 * BESS Products (light): every catalogue system on a log-scale capacity axis — a dot at its rated
 * energy (a bar for a range), coloured by segment. Dots are buttons: hover, focus or tap shows the
 * name, the energy and a link to the product. The segment control highlights that segment's zone and
 * shows its computed range (digit roll), "N systems from …", a cut-out and a link to the filtered
 * catalogue. Every value comes from data/products.js.
 */
export default function Capacity() {
  const [seg, setSeg] = useState("residential");
  const [tip, setTip] = useState(null);
  const chart = useRef(null);
  const fromPointer = useRef(false);
  const sum = segmentSummary(seg);
  const cut = cutoutOf(seg);

  useEffect(() => {
    if (!tip) return;
    const esc = (e) => e.key === "Escape" && setTip(null);
    const away = (e) => !chart.current?.contains(e.target) && setTip(null);
    window.addEventListener("keydown", esc);
    window.addEventListener("pointerdown", away);
    return () => {
      window.removeEventListener("keydown", esc);
      window.removeEventListener("pointerdown", away);
    };
  }, [tip]);

  return (
    <section aria-labelledby="home2-products" className="bg-ice py-20 text-ink lg:py-28">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Our offerings</Eyebrow>
            <h2 id="home2-products" className="mt-3 text-[clamp(2rem,1.2rem+2.6vw,3.6rem)] font-semibold leading-[1.02] tracking-tight">
              BESS Products
            </h2>
          </div>
          <Link
            to="/products"
            className="group inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-forest underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f7d3a]"
          >
            View All Products
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
          </Link>
        </div>

        <div role="group" aria-label="Segment" className="mt-10 inline-flex rounded-full border border-line bg-white p-1">
          {SEGMENTS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={seg === s.id}
              onClick={() => setSeg(s.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f7d3a] sm:px-5 ${
                seg === s.id ? "bg-forest text-white" : "text-graphite hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-14">
          {/* The scale */}
          <div ref={chart} className="relative rounded-2xl border border-line bg-white px-4 pb-4 pt-6 sm:px-6">
            <div className="relative ml-1 mr-2">
              {/* the segment's zone */}
              <span
                aria-hidden="true"
                className="cap-zone absolute -top-3 bottom-9 rounded-lg"
                style={{ left: `${x(sum.lo)}%`, width: `max(10px, ${x(sum.hi) - x(sum.lo)}%)`, background: `${COLOR[seg]}1a`, boxShadow: `inset 0 0 0 1px ${COLOR[seg]}55` }}
              />
              <ul aria-label="Systems by rated energy" className="relative">
                {SCALE_ITEMS.map(({ product: p, energy, seg: own }) => {
                  const inSeg = p.applications.includes(seg);
                  const left = x(energy.lo.kwh);
                  const right = x(energy.hi.kwh);
                  const open = tip === p.id;
                  const flip = left > 58;
                  return (
                    <li
                      key={p.id}
                      className="relative h-8"
                      onPointerEnter={(e) => e.pointerType === "mouse" && setTip(p.id)}
                      onPointerLeave={(e) => e.pointerType === "mouse" && setTip((t) => (t === p.id ? null : t))}
                      onFocus={() => !fromPointer.current && setTip(p.id)}
                      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setTip((t) => (t === p.id ? null : t))}
                    >
                      <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-line/70" />
                      <button
                        type="button"
                        aria-label={`${p.name}, ${energy.text}`}
                        aria-expanded={open}
                        onPointerDown={() => (fromPointer.current = true)}
                        onClick={(e) => {
                          fromPointer.current = false;
                          // A mouse click keeps it open (hover opened it); a tap or Enter / Space toggles.
                          if (e.nativeEvent.pointerType === "mouse") setTip(p.id);
                          else setTip((t) => (t === p.id ? null : p.id));
                        }}
                        className="cap-dot absolute top-1/2 h-4 -translate-y-1/2 rounded-full transition-[opacity,scale] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f7d3a]"
                        style={{
                          left: `calc(${left}% - 8px)`,
                          width: `calc(${Math.max(0, right - left)}% + 16px)`,
                          background: COLOR[own],
                          opacity: inSeg ? 1 : 0.28,
                          scale: open ? "1.15" : "1",
                        }}
                      />
                      {open && (
                        <div
                          className="absolute bottom-full z-10 mb-1 w-60 rounded-xl border border-line bg-white p-3 text-left shadow-[0_14px_34px_-14px_rgba(7,26,23,0.35)]"
                          style={flip ? { right: `calc(${100 - left}% - 12px)` } : { left: `calc(${left}% - 12px)` }}
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-graphite">{partnerOf(p.partner)?.name}</p>
                          <p className="mt-0.5 font-semibold leading-snug">{p.name}</p>
                          <p className="text-sm text-graphite">{energy.text}</p>
                          <Link
                            to={`/products/${p.id}`}
                            className="mt-2 inline-flex items-center gap-1 rounded-md text-sm font-semibold text-[#2f7d3a] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f7d3a]"
                          >
                            View product
                            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {/* axis */}
              <div aria-hidden="true" className="relative mt-3 h-6 border-t border-graphite/40">
                {TICKS.map(([k, label]) => (
                  <span key={k} className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${x(k)}%` }}>
                    <span className="mx-auto block h-1.5 w-px bg-graphite/50" />
                    <span className="mt-1 block whitespace-nowrap text-[0.6875rem] text-graphite">{label}</span>
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-6 text-xs text-graphite">Rated energy, log scale. Each line is one system; bars show a range.</p>
          </div>

          {/* The segment */}
          <div className="flex flex-col">
            <div className="relative h-48 lg:h-56">
              <img key={cut.id} src={cut.image} alt={cut.imageAlt} loading="lazy" decoding="async" className="cap-cut absolute inset-0 m-auto h-full w-[75%] object-contain" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: INK[seg] }}>
              {SEGMENTS.find((s) => s.id === seg).name}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              <RollValue key={seg} value={sum.energy} />
            </p>
            <p className="mt-1 text-sm text-graphite">{sum.systems}</p>
            <Link
              to={`/products?app=${seg}`}
              className="mt-5 inline-flex items-center gap-1.5 self-start rounded-md text-sm font-semibold text-forest underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f7d3a]"
            >
              See products
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
