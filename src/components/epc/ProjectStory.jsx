import { useRef } from "react";
import AnimatedText from "../ui/AnimatedText";
import { STORY } from "./content";
import { getProduct, partnerOf } from "../../data/products";
import { useMediaQuery, useScrollSteps } from "../../lib/scrollSteps";

const STAGE = "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";
const PRODUCT_ID = "hithium-block-261";

/**
 * SCROLL-DRIVEN PROJECT STORY — project requirement → BESS system → deployment → support.
 *
 * On tall desktop screens the section sticks while it scrolls (CSS sticky, ScrollTrigger progress
 * via useScrollSteps): one real product (Hithium ∞BLOCK 261 kWh cutout from the catalogue) rises
 * and scales by a few percent as --progress advances, a site frame, the product's confirmed
 * headline figures, a ground line and a support ring appear stage by stage, and the stage text
 * changes. Movement is scrubbed and small. Elsewhere (phones, short screens, reduced motion) the
 * four stages read as a plain numbered sequence under the product.
 */
export default function ProjectStory() {
  const staged = useMediaQuery(STAGE);
  const root = useRef(null);
  const step = useScrollSteps(root, STORY.length, { start: "top 64px", end: "bottom bottom", enabled: staged });
  const product = getProduct(PRODUCT_ID);
  const partner = partnerOf(product.partner);

  const productFigure = (
    <div className="relative mx-auto aspect-[733/1366] h-[min(30rem,58svh)]">
      {/* Stage 1: site frame corners (requirement) */}
      <span
        aria-hidden="true"
        className={`absolute -inset-x-[22%] -inset-y-[6%] transition-opacity duration-700 ${!staged || step >= 0 ? "opacity-100" : "opacity-0"}`}
      >
        {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((c) => (
          <span key={c} className={`absolute h-6 w-6 border-signal/50 ${c}`} />
        ))}
      </span>
      {/* Stage 4: support ring */}
      <span
        aria-hidden="true"
        className={`absolute left-1/2 top-1/2 aspect-square w-[190%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal/25 transition-[opacity,scale] duration-1000 ease-out ${
          staged && step >= 3 ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      />
      {/* Stage 3: ground line */}
      <span
        aria-hidden="true"
        className={`absolute -inset-x-[40%] bottom-[1%] h-px origin-center bg-gradient-to-r from-transparent via-signal/60 to-transparent transition-[scale] duration-1000 ease-out ${
          staged && step >= 2 ? "scale-x-100" : "scale-x-0"
        }`}
      />
      <span aria-hidden="true" className="absolute inset-x-[8%] bottom-[0.5%] h-[3%] rounded-[100%] bg-black/50 blur-lg" />
      <div className="relative h-full w-full" style={staged ? { transform: "translate3d(0, calc((0.5 - var(--progress, 0)) * 36px), 0) scale(calc(0.94 + var(--progress, 0) * 0.08))" } : undefined}>
        <img src={product.image} alt={product.imageAlt} loading="lazy" decoding="async" className="h-full w-full object-contain" />
      </div>
      {/* Stage 2: the product's confirmed headline figures */}
      <div
        className={`absolute left-[92%] top-[18%] w-max rounded-[3px] border border-signal/35 bg-deep/85 px-3 py-2 leading-tight backdrop-blur-sm transition-[opacity,translate] duration-500 ease-out ${
          !staged || step >= 1 ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
        } ${staged ? "" : "hidden sm:block"}`}
      >
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-signal">{partner.name}</p>
        <p className="mt-0.5 text-sm font-semibold text-white">{product.cardSpecs.join(" · ")}</p>
      </div>
    </div>
  );

  return (
    <section ref={root} aria-labelledby="story-title" className="relative bg-night text-white stage:h-[300vh]">
      <div className="relative overflow-hidden stage:sticky stage:top-16 stage:h-[calc(100svh-4rem)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(45% 55% at 30% 55%, rgba(144,217,136,0.09), transparent 70%), linear-gradient(rgba(244,247,244,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(244,247,244,0.035) 1px, transparent 1px)",
            backgroundSize: "100% 100%, 56px 56px, 56px 56px",
            maskImage: "radial-gradient(70% 80% at 35% 50%, #000, transparent 80%)",
            WebkitMaskImage: "radial-gradient(70% 80% at 35% 50%, #000, transparent 80%)",
          }}
        />
        <div className="relative mx-auto grid h-full max-w-6xl items-center gap-12 px-6 py-20 md:py-24 lg:grid-cols-2 stage:py-0">
          <div className="order-2 lg:order-1">{productFigure}</div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">From requirement to support</p>
            <AnimatedText id="story-title" className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              How a Project Comes Together
            </AnimatedText>

            {staged ? (
              <div className="mt-10">
                <ol className="flex gap-2" aria-hidden="true">
                  {STORY.map((s, i) => (
                    <li key={s.label} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/12">
                      <span className={`block h-full origin-left bg-signal transition-[scale] duration-500 ${i <= step ? "scale-x-100" : "scale-x-0"}`} />
                    </li>
                  ))}
                </ol>
                <div className="relative mt-8 min-h-[12rem]">
                  {STORY.map((s, i) => (
                    <div
                      key={s.label}
                      className={`absolute inset-0 transition-[opacity,translate] duration-500 ease-out ${
                        i === step ? "translate-y-0 opacity-100" : i < step ? "-translate-y-3 opacity-0" : "translate-y-3 opacity-0"
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ice/60">
                        {String(i + 1).padStart(2, "0")} · {s.label}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold md:text-3xl">{s.title}</h3>
                      <p className="mt-3 max-w-md leading-relaxed text-ice/75">{s.copy}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs uppercase tracking-[0.16em] text-ice/40">
                  Pictured: {partner.name} {product.name}
                </p>
              </div>
            ) : (
              <ol className="mt-8 space-y-6">
                {STORY.map((s, i) => (
                  <li key={s.label} className="border-l border-signal/40 pl-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">
                      {String(i + 1).padStart(2, "0")} · {s.label}
                    </p>
                    <h3 className="mt-1.5 text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ice/75">{s.copy}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
