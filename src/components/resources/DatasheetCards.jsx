import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PRODUCTS, partnerOf } from "../../data/products";

/**
 * The homepage contact form asking for a product's document: its segment preselects the interest, and
 * `doc` (+ `kind` for a brochure) pre-fills the message (HomeContact) — "Please send me the datasheet
 * for TCL BlueArk W10." — which the visitor can still edit.
 */
export const docHref = (product, kind) => {
  const interest = product.applications.includes("utility") && !product.applications.includes("ci") ? "utility" : "ci";
  const name = `${partnerOf(product.partner).name} ${product.name}`;
  const q = new URLSearchParams({ interest, doc: name });
  if (kind === "Brochure") q.set("kind", "brochure");
  return `/#contact?${q}`;
};

/**
 * Datasheets & Brochures as product cards (data/products.js, nothing invented): the product image with
 * its alt text, the partner and product name, a DATASHEET / BROCHURE badge, the power / energy line and
 * the one-line summary, and one link — "Download Datasheet" / "Download Brochure" — to the homepage
 * contact form with that request filled in (docHref). The link covers the whole card; it is a real
 * <a href>, so it works without JavaScript. Hover: the card lifts, its border firms, the product rises a
 * little over a soft light, the arrow slides. The cards arrive in turn (data-rv, the page's reveal).
 */
export default function DatasheetCards({ items }) {
  return (
    <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map(({ product: id, kind }) => {
        const product = PRODUCTS.find((p) => p.id === id);
        return product ? (
          <li key={id} data-rv="text">
            <SheetCard product={product} kind={kind} />
          </li>
        ) : null;
      })}
    </ul>
  );
}

function SheetCard({ product, kind }) {
  const partner = partnerOf(product.partner);
  const name = `${partner.name} ${product.name}`;
  return (
    <article className="sheet-card group/sheet relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper transition-[border-color,box-shadow,translate] duration-300 ease-out hover:-translate-y-1 hover:border-forest/40 hover:shadow-[0_22px_44px_-28px_rgba(7,26,23,0.4)] focus-within:-translate-y-1 motion-reduce:transition-none">
      <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(80%_70%_at_50%_45%,#ffffff_0%,#F4F7F4_70%,#ECF1EC_100%)]">
        <span
          aria-hidden="true"
          className="absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.95),rgba(144,217,136,0.10)_60%,transparent)] opacity-0 transition-opacity duration-500 group-hover/sheet:opacity-100"
        />
        <span aria-hidden="true" className="absolute inset-x-[22%] bottom-[9%] h-5 rounded-[100%] bg-black/15 blur-lg" />
        <img
          src={product.image}
          alt={product.imageAlt}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 m-auto object-contain transition-[scale,translate] duration-500 ease-out group-hover/sheet:-translate-y-1 group-hover/sheet:scale-[1.03] motion-reduce:transition-none ${
            product.imageFallback ? "h-[16%] w-[44%] opacity-80" : "h-[82%] w-[82%]"
          }`}
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{partner.name}</p>
          <span className="rounded-full border border-forest/20 bg-ice px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-forest">{kind}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-ink">{product.name}</h3>
        {product.cardSpecs.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-forest">
            {product.cardSpecs.map((s, i) => (
              <span key={s} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden="true" className="h-3.5 w-px bg-line" />}
                {s}
              </span>
            ))}
          </p>
        )}
        <p className="mt-2 flex-1 text-sm leading-relaxed text-graphite">{product.summary}</p>

        <Link
          to={docHref(product, kind)}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors duration-200 after:absolute after:inset-0 after:content-[''] group-hover/sheet:bg-forest focus-visible:outline-none focus-visible:after:rounded-3xl focus-visible:after:ring-2 focus-visible:after:ring-signal"
        >
          Download {kind}
          <span className="sr-only">: {name}</span>
          <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/sheet:translate-x-1 motion-reduce:transition-none" />
        </Link>
      </div>
    </article>
  );
}
