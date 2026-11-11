import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";
import { PRODUCTS, partnerOf } from "../../data/products";
import { DATASHEET_ONLY } from "../../data/datasheets";
import { docHref } from "../../lib/contactLinks";

/**
 * Datasheets & Brochures as product cards (data/products.js, or data/datasheets.js for a system with no
 * catalogue entry; nothing invented): the product image with its alt text, the partner and product
 * name, a DATASHEET / BROCHURE badge, the power / energy line and the one-line summary, and one link:
 * "Download Datasheet" where the PDF is on the site (`datasheet`), otherwise "Request Datasheet" /
 * "Request Brochure" — the homepage contact form with that request filled in (docHref). Both count as a
 * datasheet_request (lib/analytics; `data-doc` names the document). The link covers the whole card; it
 * is a real <a href>, so it works without JavaScript. Hover: the card lifts, its border firms, the
 * product rises a little over a soft light, the arrow slides. The cards arrive in turn (data-rv).
 *
 * Layout: equal-width cards — one column on phones, two from 768 px, three from 1024 px — with a short
 * last row centred, so no row ends in an empty slot.
 */
export default function DatasheetCards({ items }) {
  const two = items.length === 2;
  return (
    <ul className="mt-8 flex flex-wrap justify-center gap-5">
      {items.map(({ product: id, kind }) => {
        const product = PRODUCTS.find((p) => p.id === id) ?? DATASHEET_ONLY.find((p) => p.id === id);
        return product ? (
          <li key={id} data-rv="text" className={`w-full md:w-[calc((100%-1.25rem)/2)] ${two ? "" : "lg:w-[calc((100%-2.5rem)/3)]"}`}>
            <SheetCard product={product} kind={kind} />
          </li>
        ) : null;
      })}
    </ul>
  );
}

// The card's one link (a download or a request): an outline pill that fills green with the card's hover,
// its ::after stretched over the whole card.
const LINK =
  "mt-6 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-accent bg-white px-6 text-button font-semibold text-accent transition-colors duration-fast after:absolute after:inset-0 after:content-[''] group-hover/sheet:bg-accent group-focus-visible/sheet:bg-accent group-focus-within/sheet:bg-accent group-hover/sheet:text-on-accent group-focus-visible/sheet:text-on-accent group-focus-within/sheet:text-on-accent focus-visible:outline-none focus-visible:after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-link";

function SheetCard({ product, kind }) {
  const partner = partnerOf(product.partner);
  const name = `${partner.name} ${product.name}`;
  return (
    <article className="sheet-card group/sheet relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-white card-hover motion-reduce:transition-none">
      <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(80%_70%_at_50%_45%,var(--color-white)_0%,var(--color-white)_70%,var(--color-paper)_100%)]">
        <span
          aria-hidden="true"
          className="absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.95),color-mix(in_srgb,var(--accent)_10%,transparent)_60%,transparent)] opacity-0 transition-opacity duration-base group-hover/sheet:opacity-100 group-focus-visible/sheet:opacity-100 group-focus-within/sheet:opacity-100"
        />
        <span aria-hidden="true" className="absolute inset-x-[22%] bottom-[9%] h-5 rounded-[100%] bg-black/15 blur-lg" />
        {/* A product with responsive `sources` (AVIF / WebP sets) gets a <picture>; the <img> is the same. */}
        <picture>
          {product.sources?.map((s) => (
            <source key={s.type} type={s.type} srcSet={s.srcSet} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 85vw" />
          ))}
          <img
            src={product.image}
            alt={product.imageAlt}
            width={product.imageSize[0]}
            height={product.imageSize[1]}
            loading="lazy"
            decoding="async"
            className={`card-media absolute inset-0 m-auto object-contain motion-reduce:transition-none ${
              product.imageFallback ? "h-[16%] w-[44%] opacity-80" : "h-[82%] w-[82%]"
            }`}
          />
        </picture>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-muted">{partner.name}</p>
          <span className="rounded-full border border-line bg-ice px-2.5 py-1 eyebrow text-label">{kind}</span>
        </div>
        <h3 className="mt-2 text-h4 font-semibold text-ink">{product.name}</h3>
        {product.cardSpecs.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-small font-semibold text-accent">
            {product.cardSpecs.map((s, i) => (
              <span key={s} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden="true" className="h-3.5 w-px bg-line" />}
                {s}
              </span>
            ))}
          </p>
        )}
        <p className="mt-2 flex-1 text-small text-copy">{product.summary}</p>

        {product.datasheet ? (
          <a href={product.datasheet} download="" data-doc={name} className={LINK}>
            Download {kind}
            <span className="sr-only">: {name} (PDF)</span>
            <Download aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover/sheet:translate-y-0.5 group-focus-visible/sheet:translate-y-0.5 group-focus-within/sheet:translate-y-0.5 motion-reduce:transition-none" />
          </a>
        ) : (
          <Link to={docHref(product, kind)} className={LINK}>
            Request {kind}
            <span className="sr-only">: {name}</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover/sheet:translate-x-1 group-focus-visible/sheet:translate-x-1 group-focus-within/sheet:translate-x-1 motion-reduce:transition-none" />
          </Link>
        )}
      </div>
    </article>
  );
}
