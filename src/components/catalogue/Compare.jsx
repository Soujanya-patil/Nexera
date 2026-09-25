import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GitCompareArrows, X } from "lucide-react";
import { COMPARE_FIELDS, applicationLabel, getProduct, partnerOf } from "../../data/products";

export const MAX_COMPARE = 3;

/** Fixed tray listing the systems picked for comparison; opens the comparison dialog. */
export function CompareTray({ ids, onRemove, onClear, onOpen }) {
  const products = ids.map(getProduct);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-4 transition-[transform,opacity] duration-300 ease-out sm:px-6 ${
        ids.length ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
      aria-hidden={!ids.length}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-ink/95 px-4 py-3 text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur sm:flex-nowrap sm:px-5">
        <p className="hidden shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-ice/70 md:block">Compare</p>
        <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
          {products.map((p) => (
            <li key={p.id} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/10 py-1 pl-3 pr-1 text-xs">
              <span className="truncate">
                {partnerOf(p.partner).name} {p.name}
              </span>
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                tabIndex={ids.length ? 0 : -1}
                aria-label={`Remove ${p.name} from comparison`}
                className="grid h-5 w-5 place-items-center rounded-full text-ice/70 hover:bg-white/15 hover:text-white"
              >
                <X aria-hidden="true" className="h-3 w-3" />
              </button>
            </li>
          ))}
          {ids.length < 2 && <li className="self-center text-xs text-ice/60">Select at least one more system</li>}
        </ul>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onClear} tabIndex={ids.length ? 0 : -1} className="rounded-full px-3 py-2 text-xs text-ice/70 hover:text-white">
            Clear
          </button>
          <button
            type="button"
            onClick={onOpen}
            disabled={ids.length < 2}
            tabIndex={ids.length ? 0 : -1}
            className="group/cmp inline-flex items-center gap-2 rounded-full bg-signal px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-forest transition-[background-color,scale] duration-300 hover:bg-[#a4e39d] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <GitCompareArrows aria-hidden="true" className="h-4 w-4" />
            Compare {ids.length} {ids.length === 1 ? "system" : "systems"}
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cmp:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Side-by-side comparison of the selected systems. Rows appear only for fields at least one of them
 * has; a dash means the partner's documentation doesn't state that value (it is never estimated).
 */
export function CompareDialog({ ids, open, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const products = ids.map(getProduct);
  const rows = [
    { id: "partner", label: "Technology partner", get: (p) => partnerOf(p.partner).name },
    { id: "application", label: "Application", get: (p) => p.applications.map(applicationLabel).join(", ") },
    ...COMPARE_FIELDS.map((f) => ({ ...f, get: (p) => p.compare?.[f.id] })),
  ].filter((r) => products.some((p) => r.get(p)));

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="compare-title"
      className="m-auto max-h-[88svh] w-[min(64rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-paper p-0 text-ink shadow-2xl backdrop:bg-deep/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[88svh] flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <h2 id="compare-title" className="text-lg font-semibold tracking-tight">
            Compare systems
          </h2>
          <button type="button" onClick={onClose} aria-label="Close comparison" className="grid h-9 w-9 place-items-center rounded-full text-graphite hover:bg-ice hover:text-ink">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div data-lenis-prevent className="overflow-auto">
          <table className="w-full min-w-[36rem] table-fixed border-collapse text-left text-sm">
            <thead>
              <tr>
                <th scope="col" className="w-36 px-5 py-4 align-bottom sm:w-44 text-xs font-semibold uppercase tracking-[0.14em] text-sage sm:px-6">
                  <span className="sr-only">Specification</span>
                </th>
                {products.map((p) => (
                  <th key={p.id} scope="col" className="px-4 py-4 align-bottom font-normal">
                    <div className="relative mb-3 aspect-[4/3] w-full max-w-[11rem] rounded-xl bg-ice">
                      <img src={p.image} alt="" className="absolute inset-0 m-auto h-[80%] w-[80%] object-contain" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage">{partnerOf(p.partner).name}</p>
                    <p className="mt-0.5 font-semibold text-ink">{p.name}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <th scope="row" className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-sage sm:px-6">
                    {r.label}
                  </th>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-ink">
                      {r.get(p) || <span className="text-graphite/60" aria-label="Not stated">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-line">
                <td className="px-5 py-4 sm:px-6" />
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-4">
                    <Link to={`/products/${p.id}`} onClick={onClose} className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-steel">
                      View product <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="border-t border-line px-5 py-3 text-xs text-graphite sm:px-6">
          — means the value isn't stated in the manufacturer's documentation available to us. Ask NEXERA for full specifications.
        </p>
      </div>
    </dialog>
  );
}
