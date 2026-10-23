import { Link } from "react-router-dom";
import { ArrowRight, Check, FileText, Plus } from "lucide-react";
import { applicationLabel, partnerOf } from "../../data/products";
import { discussHref, docHref } from "../../lib/contactLinks";
import { useProductTransition } from "../../lib/viewTransition";

/**
 * Catalogue card — one layout for /products, the partner pages and a product page's "More from …":
 *
 *   photo    the partner's own product photo, sharp, on a flat light ground across the card's full width
 *            (no vignette, no glow: just a small contact shadow); the optional Compare toggle sits on it
 *   name     partner, applications, the product name (the card's link to its page) and type
 *   specs    the product's key specifications (data/products.js `keySpecs`, label and value as written
 *            there) — the same figures as the product page's "At a glance". A product whose sources
 *            give fewer figures simply shows fewer rows; nothing is estimated or filled in.
 *   summary  two lines
 *   actions  "Request Datasheet" (the homepage form, pre-filled with the request — datasheets are sent
 *            on request) and "Discuss this system" (the contact page with the product pre-selected)
 *
 * The whole card opens the product page (the name's link is stretched over it); the two actions and
 * Compare sit above that link. Hover: the card rises 4 px and its border firms (card-hover), the product
 * lifts 4 px (a translate, so the photo stays sharp), the arrow moves. A card picked for comparison keeps
 * a green outline.
 *
 * The photo carries `view-transition-name: product-<id>` and the link runs a View Transition
 * (lib/viewTransition.js), so opening a product morphs this photo into the product page's hero image.
 */
export default function ProductCard({ product, compared, compareFull, onToggleCompare }) {
  const partner = partnerOf(product.partner);
  const canAdd = compared || !compareFull;
  const open = useProductTransition(product.id);
  const fullName = `${partner.name} ${product.name}`;
  const action =
    "relative z-10 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-button font-semibold transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2";
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-card border bg-white card-hover ${
        compared ? "border-accent shadow-[0_0_0_1px_var(--accent)]" : "border-line"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper">
        <span aria-hidden="true" className="absolute inset-x-[24%] bottom-[5%] h-4 rounded-[100%] bg-black/15 blur-md" />
        <img
          src={product.image}
          alt={product.imageAlt}
          loading="lazy"
          decoding="async"
          style={{ viewTransitionName: `product-${product.id}` }}
          className={`absolute inset-x-0 bottom-[6%] mx-auto object-contain object-bottom transition-transform duration-base ease-standard motion-reduce:transition-none ${
            // No product photo (data/products.js `imageFallback`): the partner's logo, small and centred.
            product.imageFallback
              ? "top-0 my-auto h-[16%] w-[44%] opacity-80"
              : "h-[88%] w-[88%] group-hover:-translate-y-1 group-focus-within:-translate-y-1"
          }`}
        />
        {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(product.id)}
            disabled={!canAdd}
            aria-pressed={compared}
            aria-label={`${compared ? "Remove" : "Compare"} ${fullName}`}
            title={canAdd ? undefined : "You can compare up to 3 systems"}
            className={`absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-micro font-medium pointer-coarse:min-h-11 transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
              compared ? "border-accent bg-forest text-white" : "border-line bg-white text-copy hover:border-accent/40 hover:text-ink focus-visible:border-accent/40"
            }`}
          >
            {compared ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : <Plus aria-hidden="true" className="h-3.5 w-3.5" />}
            {compared ? "Added" : "Compare"}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-label">{partner.name}</p>
          <ul className="flex flex-wrap justify-end gap-1.5" aria-label="Applications">
            {product.applications.map((a) => (
              <li key={a} className="rounded-full bg-ice px-2.5 py-0.5 text-micro font-medium text-copy">
                {applicationLabel(a)}
              </li>
            ))}
          </ul>
        </div>
        <h3 className="mt-2 text-h3 font-semibold text-ink">
          <Link
            to={`/products/${product.id}`}
            onClick={open}
            className="inline-flex items-center gap-2 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-link"
          >
            {product.name}
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-accent transition-transform duration-fast group-hover:translate-x-1 group-focus-within:translate-x-1" />
            <span className="sr-only">, {partner.name}</span>
          </Link>
        </h3>
        <p className="mt-0.5 text-small text-copy">{product.type}</p>

        {product.keySpecs.length > 0 && (
          <dl className="mt-4 divide-y divide-line border-y border-line text-small">
            {product.keySpecs.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-4 py-2">
                <dt className="text-copy">{s.label}</dt>
                <dd className="text-right font-semibold tabular-nums text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="mt-4 line-clamp-2 flex-1 text-small text-copy">{product.summary}</p>

        <div className="mt-6 grid gap-2">
          <a href={docHref(product)} className={`${action} border-line text-ink hover:border-accent hover:text-accent focus-visible:border-accent`}>
            <FileText aria-hidden="true" className="h-4 w-4 shrink-0" />
            Request Datasheet
            <span className="sr-only">: {fullName}</span>
          </a>
          <Link to={discussHref(product)} className={`${action} border-accent text-accent hover:bg-accent hover:text-on-accent focus-visible:bg-accent focus-visible:text-on-accent`}>
            Discuss this system
            <span className="sr-only">: {fullName}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
