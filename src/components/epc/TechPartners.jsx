import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import { APPLICATIONS, PARTNERS, PRODUCTS, applicationLabel } from "../../data/products";

// Per partner, straight from the catalogue data: its systems and the applications they cover.
const LINEUP = Object.fromEntries(
  PARTNERS.map((p) => {
    const products = PRODUCTS.filter((x) => x.partner === p.id);
    const apps = APPLICATIONS.filter((a) => products.some((x) => x.applications.includes(a.id))).map((a) => a.id);
    return [p.id, { products, apps }];
  })
);

/**
 * GLOBAL TECHNOLOGY. LOCAL EXECUTION. — the three technology partners as selectable logo tiles
 * (tabs). Pointing at, focusing or tapping a partner makes its logo active (full colour, a green
 * indicator) and swaps the panel to that partner's systems and applications — all read from the
 * product catalogue, so nothing here is written separately from it. The panel links into the
 * catalogue filtered to that partner.
 */
export default function TechPartners() {
  const [active, setActive] = useState(PARTNERS[0].id);
  const tabs = useRef([]);
  const partner = PARTNERS.find((p) => p.id === active);
  const { products, apps } = LINEUP[active];

  const onKeyDown = (e) => {
    const i = PARTNERS.findIndex((p) => p.id === active);
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    const next = (i + delta + PARTNERS.length) % PARTNERS.length;
    setActive(PARTNERS[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <section aria-labelledby="partners-title" className="border-y border-line bg-ice py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Technology partners</p>
          <AnimatedText id="partners-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Global Technology. Local Execution.
          </AnimatedText>
          <p className="mt-4 max-w-md leading-relaxed text-graphite">
            The systems are designed and manufactured by our technology partners. NEXERA is their authorized partner —
            bringing the technology to your projects with design, commissioning and after-sales support in India.
          </p>

          <div role="tablist" aria-label="Technology partners" onKeyDown={onKeyDown} className="mt-8 grid grid-cols-3 gap-3 lg:grid-cols-1">
            {PARTNERS.map((p, i) => {
              const on = p.id === active;
              return (
                <button
                  key={p.id}
                  ref={(el) => (tabs.current[i] = el)}
                  type="button"
                  role="tab"
                  id={`partner-tab-${p.id}`}
                  aria-selected={on}
                  aria-controls="partner-panel"
                  tabIndex={on ? 0 : -1}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(p.id)}
                  onClick={() => setActive(p.id)}
                  className={`group relative flex h-16 items-center justify-center overflow-hidden rounded-xl border bg-paper px-4 transition-[border-color,box-shadow,translate] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal lg:h-[4.5rem] lg:justify-between lg:px-6 ${
                    on ? "border-forest/25 shadow-[0_14px_30px_-22px_rgba(7,26,23,0.45)] lg:translate-x-1" : "border-line hover:border-forest/20"
                  }`}
                >
                  <span aria-hidden="true" className={`absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-signal transition-[scale] duration-300 ${on ? "scale-y-100" : "scale-y-0"}`} />
                  <img
                    src={p.logo}
                    alt={p.name}
                    className={`${p.id === "clou" ? "h-7" : "h-5"} w-auto max-w-full object-contain transition-[opacity,filter] duration-300 ${
                      on ? "opacity-100 grayscale-0" : "opacity-50 grayscale group-hover:opacity-80"
                    }`}
                  />
                  <span className={`hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] lg:flex ${on ? "text-forest" : "text-sage/70"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full transition-colors ${on ? "bg-signal" : "bg-line"}`} />
                    {LINEUP[p.id].products.length} systems
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          id="partner-panel"
          role="tabpanel"
          aria-labelledby={`partner-tab-${active}`}
          className="relative min-h-[23rem] overflow-hidden rounded-2xl border border-line bg-paper sm:min-h-[24rem]"
        >
          <div key={active} className="journey-detail flex h-full flex-col p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">{partner.name} · in the NEXERA catalogue</p>
              <ul className="flex flex-wrap gap-1.5" aria-label="Applications">
                {apps.map((a) => (
                  <li key={a} className="rounded-full bg-ice px-2.5 py-0.5 text-[0.6875rem] font-medium text-forest">
                    {applicationLabel(a)}
                  </li>
                ))}
              </ul>
            </div>
            <ul className="mt-5 flex-1 divide-y divide-line">
              {products.map((x) => (
                <li key={x.id}>
                  <Link
                    to={`/products/${x.id}`}
                    className="group/row flex items-center gap-4 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-ice">
                      <img src={x.image} alt="" loading="lazy" decoding="async" className="h-11 w-11 object-contain transition-[scale] duration-300 group-hover/row:scale-110" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{x.name}</span>
                      <span className="block truncate text-sm text-graphite">{x.type}</span>
                    </span>
                    <span className="hidden text-right text-sm font-semibold text-forest sm:block">{x.cardSpecs.join(" · ")}</span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-forest opacity-40 transition-[translate,opacity] duration-300 group-hover/row:translate-x-1 group-hover/row:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to={`/products?partner=${active}`}
              className="group/all mt-5 inline-flex items-center gap-2 self-start text-sm font-semibold text-forest hover:text-steel"
            >
              View {partner.name} systems
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/all:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
