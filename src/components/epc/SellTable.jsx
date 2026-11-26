import { useRef } from "react";
import { Link } from "react-router-dom";
import AnimatedText from "../ui/AnimatedText";
import { applicationLabel, getProduct, productLabel } from "../../data/products";
import { productPage } from "../../data/productPages";
import { useScrollReveal } from "../../lib/scrollReveal";

/** A key spec's value from the catalogue (data/products.js `keySpecs`), by its label. */
const spec = (p, label) => p.keySpecs.find((k) => k.label === label)?.value;

// The rows, in catalogue order. Every figure is read from data/products.js (the manufacturers' datasheets)
// and "Best for" is the product page's own first "Who it's for" line (data/productPages.js), up to any colon.
const ROWS = [
  { id: "tcl-blueark-x1", key: (p) => p.cardSpecs.join(" · ") },
  { id: "tcl-blueark-x5", key: (p) => [...p.cardSpecs, spec(p, "Battery protection")].join(" · ") },
  { id: "tcl-blueark-w10", key: (p) => [...p.cardSpecs, `up to ${spec(p, "Scalability").replace(/^Up to /, "")}`].join(" · ") },
  // "Best for" says "generator", not "diesel generator" (approved wording for this table, 2026-11-26).
  { id: "tcl-blueark-x10", key: (p) => [...p.cardSpecs, `${spec(p, "Max. PV input")} PV input`].join(" · "), best: (b) => b.replace("diesel generator", "generator") },
  { id: "hithium-power-cabinet-1022", key: (p) => [spec(p, "Rated energy"), spec(p, "Cooling"), spec(p, "Grid connection")].join(" · ") },
  { id: "hithium-power-625", key: (p) => [spec(p, "Rated energy"), spec(p, "Duration"), spec(p, "Protection")].join(" · ") },
].map(({ id, key, best = (b) => b }) => {
  const p = getProduct(id);
  return {
    id,
    segment: p.applications.map(applicationLabel).join(", "),
    name: productLabel(p),
    key: key(p),
    best: best(productPage(id).audience[0].split(":")[0]),
  };
});

const COLS = ["Segment", "Product", "Key spec", "Best for"];

/**
 * PRODUCTS YOU CAN SELL — the six systems a distributor can offer, as a table (segment | product | key
 * spec | best for). On phones each row stacks into a card, its column names as labels. Each product links
 * to its page.
 */
export default function SellTable() {
  const root = useRef(null);
  const reveal = useScrollReveal(root);
  return (
    <section ref={root} data-sr-state={reveal} aria-labelledby="sell-title" className="bg-white py-section">
      <div className="container-site">
        <p className="eyebrow text-muted">TCL and Hithium</p>
        <AnimatedText id="sell-title" className="mt-3 max-w-2xl text-h2 font-semibold text-ink">
          Products You Can Sell
        </AnimatedText>
        <p data-sr className="mt-heading max-w-measure text-body text-copy">
          TCL and Hithium design and manufacture every system; NEXERA supplies them in India as an authorised partner.
        </p>
        <div data-sr className="mt-10 overflow-hidden rounded-card border border-line">
          <table className="w-full text-left text-small max-sm:block">
            <caption className="sr-only">Systems a NEXERA BESS distributor can sell, by segment</caption>
            <thead className="bg-ice text-ink max-sm:sr-only">
              <tr>
                {COLS.map((c) => (
                  <th key={c} scope="col" className="px-5 py-3 eyebrow text-label">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line max-sm:block">
              {ROWS.map((r) => (
                <tr key={r.id} className="align-top max-sm:block max-sm:px-5 max-sm:py-4">
                  <td data-label="Segment" className="px-5 py-4 text-copy max-sm:flex max-sm:gap-3 max-sm:p-0 max-sm:before:w-24 max-sm:before:shrink-0 max-sm:before:text-label max-sm:before:content-[attr(data-label)]">
                    {r.segment}
                  </td>
                  <th scope="row" data-label="Product" className="px-5 py-4 font-semibold text-ink max-sm:mt-1.5 max-sm:flex max-sm:gap-3 max-sm:p-0 max-sm:before:w-24 max-sm:before:shrink-0 max-sm:before:font-normal max-sm:before:text-label max-sm:before:content-[attr(data-label)]">
                    <Link to={`/products/${r.id}`} className="text-ink underline-offset-4 hover:text-link hover:underline focus-visible:text-link focus-visible:underline">
                      {r.name}
                    </Link>
                  </th>
                  <td data-label="Key spec" className="px-5 py-4 tabular-nums text-ink max-sm:mt-1.5 max-sm:flex max-sm:gap-3 max-sm:p-0 max-sm:before:w-24 max-sm:before:shrink-0 max-sm:before:text-label max-sm:before:content-[attr(data-label)]">
                    {r.key}
                  </td>
                  <td data-label="Best for" className="px-5 py-4 text-copy max-sm:mt-1.5 max-sm:flex max-sm:gap-3 max-sm:p-0 max-sm:before:w-24 max-sm:before:shrink-0 max-sm:before:text-label max-sm:before:content-[attr(data-label)]">
                    {r.best}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p data-sr className="mt-4 text-micro text-copy">
          Specifications from the manufacturers&rsquo; datasheets; the full specifications are on each product page.
        </p>
      </div>
    </section>
  );
}
