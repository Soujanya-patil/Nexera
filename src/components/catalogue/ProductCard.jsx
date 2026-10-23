import { Link } from "react-router-dom";
import { ArrowRight, Check, Plus } from "lucide-react";
import { applicationLabel, partnerOf } from "../../data/products";
import { useProductTransition } from "../../lib/viewTransition";

/**
 * Catalogue card: the product image dominates (a light plinth with a soft contact shadow), then
 * partner, name, applications, confirmed headline figures and a two-line summary. The whole card is
 * the "Explore Product" link (stretched), with the optional Compare toggle layered above it.
 *
 * Hover (component level, restrained): the card rises 4 px, its border firms up and a short green
 * accent grows at the top edge; the product lifts slightly and zooms ~3% over a soft light that
 * brightens *behind* it (never a glow on the hardware); the arrow moves; Compare comes forward.
 * A card picked for comparison keeps a green outline.
 *
 * The image carries `view-transition-name: product-<id>` and the link runs a View Transition
 * (lib/viewTransition.js), so opening a product morphs this image into the product page's hero image
 * (browsers without View Transitions simply navigate).
 */
export default function ProductCard({ product, compared, compareFull, onToggleCompare }) {
  const partner = partnerOf(product.partner);
  const canAdd = compared || !compareFull;
  const open = useProductTransition(product.id);
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-card border bg-white card-hover ${
        compared ? "border-accent shadow-[0_0_0_1px_var(--accent)]" : "border-line"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-6 top-0 z-10 h-0.5 w-12 origin-left rounded-full bg-accent transition-[scale] duration-base ease-standard ${compared ? "" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100 group-focus-within:scale-x-100"}`}
      />

      <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(80%_70%_at_50%_45%,var(--color-white)_0%,var(--color-white)_70%,var(--color-paper)_100%)]">
        {/* Soft light behind the product, brightening on hover */}
        <span
          aria-hidden="true"
          className="absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.95),color-mix(in_srgb,var(--accent)_10%,transparent)_60%,transparent)] opacity-0 transition-opacity duration-base group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-within:opacity-100"
        />
        <span aria-hidden="true" className="absolute inset-x-[22%] bottom-[9%] h-5 rounded-[100%] bg-black/15 blur-lg" />
        <img
          src={product.image}
          alt={product.imageAlt}
          loading="lazy"
          decoding="async"
          style={{ viewTransitionName: `product-${product.id}` }}
          className={`card-media absolute inset-0 m-auto object-contain ${
            // No product photo (data/products.js `imageFallback`): the partner's logo, small.
            product.imageFallback ? "h-[16%] w-[44%] opacity-80" : "h-[82%] w-[82%]"
          }`}
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-muted">{partner.name}</p>
          <ul className="flex flex-wrap justify-end gap-1.5" aria-label="Applications">
            {product.applications.map((a) => (
              <li key={a} className="rounded-full bg-ice px-2.5 py-0.5 text-micro font-medium text-copy">
                {applicationLabel(a)}
              </li>
            ))}
          </ul>
        </div>
        <h3 className="mt-2 text-h3 font-semibold text-ink">{product.name}</h3>
        <p className="mt-0.5 text-small text-copy">{product.type}</p>
        {product.cardSpecs.length > 0 && (
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-small font-semibold text-accent">
            {product.cardSpecs.map((s, i) => (
              <span key={s} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden="true" className="h-3.5 w-px bg-line" />}
                {s}
              </span>
            ))}
          </p>
        )}
        <p className="mt-3 line-clamp-2 flex-1 text-small text-copy">{product.summary}</p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Link
            to={`/products/${product.id}`}
            onClick={open}
            className="inline-flex items-center gap-2 text-button font-semibold text-accent after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-link"
          >
            Explore Product
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 group-focus-within:translate-x-1.5" />
            <span className="sr-only">: {partner.name} {product.name}</span>
          </Link>
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(product.id)}
              disabled={!canAdd}
              aria-pressed={compared}
              title={canAdd ? undefined : "You can compare up to 3 systems"}
              className={`relative z-10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-micro pointer-coarse:min-h-11 font-medium transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
                compared
                  ? "border-accent bg-forest text-white"
                  : "border-line bg-white text-copy group-hover:border-accent/40 group-focus-visible:border-accent/40 group-focus-within:border-accent/40 group-hover:text-ink group-focus-visible:text-ink group-focus-within:text-ink hover:bg-ice focus-visible:bg-ice"
              }`}
            >
              {compared ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : <Plus aria-hidden="true" className="h-3.5 w-3.5" />}
              {compared ? "Added" : "Compare"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
