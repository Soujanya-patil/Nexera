import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import TiltSurface from "../ui/TiltSurface";
import RollValue from "../RollValue";
import { useScrollReveal } from "../../lib/scrollReveal";
import { PRODUCT_TILES } from "./data";
import { SectionHead } from "./shared";

const listOf = (names) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`);

/**
 * BESS Products (light): one tile per segment — a real catalogue cut-out, the segment, its energy
 * range and how many systems the catalogue lists (all computed from data/products.js), and a link to
 * the catalogue filtered to that segment (/products?app=…). The tiles float up as they enter, the
 * range rolls in; on hover (mouse) the tile tilts (≤ 4°), the product lifts 8 px and its shadow
 * widens.
 */
export default function Products() {
  const list = useRef(null);
  const reveal = useScrollReveal(list, { stagger: 0.1 });
  return (
    <section aria-labelledby="home2-products" className="bg-paper py-20 lg:py-28">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead id="home2-products" eyebrow="Our offerings" title="BESS Products" className="max-w-2xl">
            <p className="mt-5 text-lg leading-relaxed text-graphite">
              Reliable, scalable and high-performance battery energy storage solutions from our technology partners.
            </p>
          </SectionHead>
          <Link
            to="/products"
            className="group inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-forest underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          >
            View All Products
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
          </Link>
        </div>

        <ul ref={list} data-sr-state={reveal} className="mt-12 grid gap-5 md:grid-cols-3 lg:mt-14">
          {PRODUCT_TILES.map((t) => (
            <li key={t.app} data-sr>
              <TiltSurface degrees={4} className="h-full">
                <div className="group relative flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-shadow duration-300 hover:shadow-[0_24px_50px_-28px_rgba(7,26,23,0.35)] md:p-7">
                  <div className="relative h-56 lg:h-64">
                    <span
                      aria-hidden="true"
                      className="absolute bottom-2 left-1/2 h-4 w-1/2 -translate-x-1/2 rounded-[100%] bg-ink/25 blur-md transition-[scale,opacity] duration-500 ease-out group-hover:scale-x-[1.35] group-hover:opacity-70 motion-reduce:transition-none"
                    />
                    <img
                      src={t.product.image}
                      alt={t.product.imageAlt}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-x-0 bottom-5 top-0 mx-auto h-[calc(100%-1.25rem)] w-[80%] object-contain transition-[translate] duration-500 ease-out group-hover:-translate-y-2 motion-reduce:transition-none"
                    />
                  </div>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-sage">{t.name}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                    <RollValue value={t.energy} />
                  </p>
                  <p className="mt-1 text-sm text-graphite">
                    {`${t.count} ${t.count === 1 ? "system" : "systems"} from ${listOf(t.brands)}`}
                  </p>
                  <Link
                    to={`/products?app=${t.app}`}
                    aria-label={`Explore ${t.name} systems`}
                    className="mt-6 inline-flex items-center gap-1.5 self-start rounded-md text-sm font-semibold text-forest after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-signal"
                  >
                    Explore
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
                  </Link>
                </div>
              </TiltSurface>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
