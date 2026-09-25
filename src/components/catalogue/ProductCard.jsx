import { Link } from "react-router-dom";
import { ArrowRight, Check, Plus } from "lucide-react";
import { applicationLabel, partnerOf } from "../../data/products";

/**
 * Catalogue card: the product image dominates (a light plinth with a soft contact shadow), then
 * partner, name, applications, confirmed headline figures and a two-line summary. The whole card is
 * the "Explore Product" link (stretched), with the Compare toggle layered above it.
 *
 * Hover is deliberately small: the image eases up ~3%, the arrow nudges, the border warms towards
 * the accent and a short green accent line grows at the top edge. The card itself never moves.
 */
export default function ProductCard({ product, compared, compareFull, onToggleCompare }) {
  const partner = partnerOf(product.partner);
  const canAdd = compared || !compareFull;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-[border-color,box-shadow] duration-300 hover:border-signal/50 hover:shadow-[0_18px_40px_-28px_rgba(7,26,23,0.35)]">
      <span aria-hidden="true" className="absolute left-6 top-0 z-10 h-0.5 w-0 rounded-full bg-signal transition-[width] duration-500 ease-out group-hover:w-12" />

      <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(80%_70%_at_50%_45%,#ffffff_0%,#F4F7F4_70%,#ECF1EC_100%)]">
        <span aria-hidden="true" className="absolute inset-x-[22%] bottom-[9%] h-5 rounded-[100%] bg-black/15 blur-lg" />
        <img
          src={product.image}
          alt={product.imageAlt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 m-auto h-[82%] w-[82%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{partner.name}</p>
          <ul className="flex flex-wrap justify-end gap-1.5" aria-label="Applications">
            {product.applications.map((a) => (
              <li key={a} className="rounded-full bg-ice px-2.5 py-0.5 text-[0.6875rem] font-medium text-forest">
                {applicationLabel(a)}
              </li>
            ))}
          </ul>
        </div>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{product.name}</h3>
        <p className="mt-0.5 text-sm text-graphite">{product.type}</p>
        {product.cardSpecs.length > 0 && (
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-forest">
            {product.cardSpecs.map((s, i) => (
              <span key={s} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden="true" className="h-3.5 w-px bg-line" />}
                {s}
              </span>
            ))}
          </p>
        )}
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-graphite">{product.summary}</p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Link
            to={`/products/${product.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-forest after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-signal"
          >
            Explore Product
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            <span className="sr-only">: {partner.name} {product.name}</span>
          </Link>
          {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(product.id)}
            disabled={!canAdd}
            aria-pressed={compared}
            title={canAdd ? undefined : "You can compare up to 3 systems"}
            className={`relative z-10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:opacity-40 ${
              compared ? "border-forest bg-forest text-white" : "border-line bg-paper text-graphite hover:border-forest/40 hover:text-ink"
            }`}
          >
            {compared ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : <Plus aria-hidden="true" className="h-3.5 w-3.5" />}
            Compare
          </button>
          )}
        </div>
      </div>
    </article>
  );
}
