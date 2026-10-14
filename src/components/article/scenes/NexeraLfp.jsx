import { useEffect, useRef, useState } from "react";
import { useSceneMotion } from "./useScene";

// The section's three systems, in its order, with the cell wording the article gives each. `product`:
// its catalogue entry (photo and alt text from data/products.js); Midea has none (the site sets its
// name in type — no Midea photo or logo exists on the site).
const SYSTEMS = [
  { name: "TCL BlueArk W10", cell: "314 Ah LFP", product: "tcl-blueark-w10" },
  { name: "Hithium ∞BLOCK C&I", cell: "314 Ah LFP", product: "hithium-block-261" },
  { name: "Midea home batteries", cell: "LiFePO₄", wordmark: "Midea" },
];

/**
 * "Which NEXERA systems use LFP?": the three systems as thumbnails — the two catalogue photos with
 * their existing alt text, and Midea's name in type — fading in one after another; the one being read
 * is lit (phones: in turn while in view). The catalogue (images) is fetched when the scene mounts, not
 * with the article. Final state: all three shown.
 */
export default function NexeraLfp({ active, motion, mode, step }) {
  const root = useRef(null);
  const [catalogue, setCatalogue] = useState(null);
  useEffect(() => {
    let live = true;
    import("../../../data/products").then((m) => live && setCatalogue(m));
    return () => {
      live = false;
    };
  }, []);

  const [tour, setTour] = useState(-1);
  useEffect(() => {
    if (mode !== "inline" || !motion || !active) return;
    let i = 0;
    setTour(0);
    const t = setInterval(() => setTour((i = (i + 1) % SYSTEMS.length)), 1600);
    return () => clearInterval(t);
  }, [mode, motion, active]);

  useSceneMotion(
    root,
    motion,
    active,
    ({ gsap }, el) => gsap.timeline().from(el.querySelectorAll("[data-tile]"), { opacity: 0, y: 16, duration: 0.5, stagger: 0.18, ease: "power2.out", clearProps: "opacity,transform" }),
    [!!catalogue]
  );

  const lit = mode === "inline" ? tour : step;
  const any = motion && lit >= 0;
  const compact = mode === "inline";
  return (
    <div ref={root} className={`flex h-full items-center justify-center ${compact ? "px-3" : "px-5"}`}>
      <ul aria-label="NEXERA systems that use LFP cells" className={`grid w-full grid-cols-3 ${compact ? "gap-2" : "gap-3"}`}>
        {SYSTEMS.map((s, i) => {
          const p = s.product && catalogue?.getProduct(s.product);
          const on = any && i === lit;
          return (
            <li
              key={s.name}
              data-tile
              className={`flex flex-col overflow-hidden rounded-2xl border transition-[border-color,box-shadow] duration-500 ${
                on ? "border-signal/70 shadow-[0_0_26px_rgba(144,217,136,0.3)]" : any ? "border-white/10 opacity-55" : "border-white/15"
              }`}
            >
              <div className={`grid place-items-center bg-ice ${compact ? "h-24" : "h-36"}`}>
                {p ? (
                  <img src={p.image} alt={p.imageAlt} loading="lazy" decoding="async" className="h-full w-full object-contain p-2" />
                ) : s.wordmark ? (
                  <span className={`font-bold uppercase tracking-tight text-ink ${compact ? "text-lg" : "text-2xl"}`}>{s.wordmark}</span>
                ) : null}
              </div>
              <div className={compact ? "p-2" : "p-3"}>
                <p className={`font-semibold leading-snug text-white ${compact ? "text-[11px]" : "text-[13px]"}`}>{s.name}</p>
                <p className={`mt-1 font-semibold text-signal ${compact ? "text-[10px]" : "text-xs"}`}>{s.cell}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
