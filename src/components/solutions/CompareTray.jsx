import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { COMPARE_FIELDS, getProduct, partnerOf } from "../../data/products";
import { getLenis } from "../../lib/lenis";
import { useBottomClaim } from "../../lib/floatingBottom";

const fullName = (p) => `${partnerOf(p.partner).name} ${p.name}`;

/**
 * The Solutions compare tray (own chunk): from 2 ticked systems it slides up from the bottom with their
 * thumbnails, "Compare (n)" and "Clear"; "Up to 3 systems" shows as a short toast when a 4th pick has
 * replaced the oldest. It steps aside while the final CTA band or the footer is on screen, so it never
 * covers the CTA button (and it sits at the bottom, clear of the segment switcher at the top). While
 * shown it claims its height at the bottom of the viewport, so the call-back widget sits above it.
 * "Compare" opens the comparison dialog.
 */
export default function CompareTray({ ids, replaced, onClear }) {
  const [open, setOpen] = useState(false);
  const [endInView, setEndInView] = useState(false);
  const [toast, setToast] = useState(false);
  const products = ids.map(getProduct);
  const shown = ids.length >= 2 && !endInView;
  const tray = useRef(null);
  useBottomClaim("solutions-compare", tray, shown);

  useEffect(() => {
    const ends = [...document.querySelectorAll("[data-cta-band], body footer")];
    const inView = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? inView.add(e.target) : inView.delete(e.target);
      setEndInView(inView.size > 0);
    });
    ends.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!replaced) return;
    setToast(true);
    const t = setTimeout(() => setToast(false), 2600);
    return () => clearTimeout(t);
  }, [replaced]);

  useEffect(() => {
    if (ids.length < 2) setOpen(false);
  }, [ids.length]);

  return (
    <>
      <div
        ref={tray}
        aria-hidden={!shown || undefined}
        inert={!shown}
        className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-3 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none sm:px-6 sm:pb-5 ${
          shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <section
          aria-label="Compare"
          className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-white/10 bg-ink/95 p-2.5 text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur sm:gap-4 sm:p-3"
        >
          <ul className="flex min-w-0 flex-1 gap-2">
            {products.map((p) => (
              <li key={p.id} className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white sm:h-14 sm:w-14">
                <img src={p.image} alt={fullName(p)} className={p.imageFallback ? "h-auto w-[70%] opacity-80" : "h-[88%] w-[88%] object-contain"} />
              </li>
            ))}
            <li className="hidden self-center pl-1 text-xs text-ice/60 sm:block">Up to 3 systems</li>
          </ul>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-ice/75 hover:text-white focus-visible:outline-2 focus-visible:outline-signal"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-full bg-signal px-4 py-2.5 text-sm font-semibold text-forest transition-[background-color,scale] duration-200 hover:bg-[#a4e39d] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal motion-reduce:transition-none"
          >
            Compare ({ids.length})
          </button>
        </section>
        <p
          role="status"
          className={`pointer-events-none mx-auto mt-2 w-max rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white shadow transition-opacity duration-300 ${toast ? "opacity-100" : "opacity-0"}`}
        >
          {toast ? "Up to 3 systems" : ""}
        </p>
      </div>
      <CompareDialog products={products} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// The page doesn't scroll behind the open dialog: Lenis is stopped, or (no Lenis, e.g. reduced
// motion) the root's overflow is held.
const lockScroll = (on) => {
  const lenis = getLenis();
  if (lenis) on ? lenis.stop() : lenis.start();
  else document.documentElement.style.overflow = on ? "hidden" : "";
};

/**
 * Side-by-side comparison (native modal dialog: Esc closes; Tab and Shift+Tab cycle inside it — the
 * native dialog would let focus leave the page after its last control; the page doesn't scroll behind
 * it). Rows are the catalogue's own comparison fields
 * (data/products.js COMPARE_FIELDS / `compare`), shown when at least one of the systems has the field;
 * "—" (tooltip "Not specified") where the catalogue has no value. Nothing is computed or inferred.
 */
function CompareDialog({ products, open, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      lockScroll(true);
    }
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => () => lockScroll(false), []);
  const trap = (e) => {
    if (e.key !== "Tab") return;
    const items = [...ref.current.querySelectorAll("a[href], button:not([disabled])")];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const rows = [
    { id: "partner", label: "Technology partner", get: (p) => partnerOf(p.partner).name },
    ...COMPARE_FIELDS.map((f) => ({ ...f, get: (p) => p.compare?.[f.id] })),
  ].filter((r) => products.some((p) => r.get(p)));

  return (
    <dialog
      ref={ref}
      onClose={() => {
        lockScroll(false);
        onClose();
      }}
      onKeyDown={trap}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="sol-compare-title"
      className="m-auto max-h-[88svh] w-[min(60rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl bg-paper p-0 text-ink shadow-2xl backdrop:bg-deep/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[88svh] flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <h2 id="sol-compare-title" className="text-lg font-semibold tracking-tight">
            Compare
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full text-graphite hover:bg-ice hover:text-ink focus-visible:outline-2 focus-visible:outline-signal"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div data-lenis-prevent className="overflow-auto">
          <table className="w-full min-w-[34rem] table-fixed border-collapse text-left text-sm">
            <thead>
              <tr>
                <td className="w-32 px-5 py-4 sm:w-40 sm:px-6" />
                {products.map((p) => (
                  <th key={p.id} scope="col" className="px-4 py-4 align-bottom font-normal">
                    <div className="relative mb-3 aspect-[4/3] w-full max-w-[10rem] overflow-hidden rounded-xl bg-ice">
                      <img
                        src={p.image}
                        alt=""
                        className={`absolute inset-0 m-auto object-contain ${p.imageFallback ? "h-[18%] w-[50%] opacity-80" : "h-[80%] w-[80%]"}`}
                      />
                    </div>
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-sage">{partnerOf(p.partner).name}</span>
                    <span className="mt-0.5 block font-semibold text-ink">{p.name}</span>
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
                      {r.get(p) || (
                        <span title="Not specified" aria-label="Not specified" className="cursor-help text-graphite/60">
                          —
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-line">
                <td className="px-5 py-4 sm:px-6" />
                {products.map((p) => (
                  <td key={p.id} className="space-y-2 px-4 py-4">
                    <Link to={`/products/${p.id}`} onClick={onClose} className="block text-sm font-semibold text-forest hover:text-steel focus-visible:outline-2 focus-visible:outline-signal">
                      Explore<span className="sr-only"> {fullName(p)}</span>
                    </Link>
                    <Link
                      to={`/contact?product=${p.id}&intent=quote`}
                      onClick={onClose}
                      className="block text-sm font-semibold text-forest hover:text-steel focus-visible:outline-2 focus-visible:outline-signal"
                    >
                      Request a quote<span className="sr-only"> for {fullName(p)}</span>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </dialog>
  );
}
