import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroVisual, { HeroVisualStatic } from "./HeroVisual";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export default function Hero() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const useAnimatedVisual = isDesktop && !prefersReducedMotion;

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* Ambient aurora glow — pure CSS, painted first so text/CTA never wait on it */}
      <div className="bg-aurora pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28 grid md:grid-cols-5 gap-12 items-center">
        {/* Left: message — 3 of 5 columns. Renders immediately; nothing here waits on the visual layer. */}
        <div className="md:col-span-3">
          <h1 className="font-serif text-4xl md:text-5xl leading-tight font-semibold text-balance">
            Battery Energy Storage Systems for India's Commercial &amp; Industrial Sector
          </h1>
          <p className="mt-6 text-lg text-ice/80 max-w-xl leading-relaxed">
            Nexera Powertech brings TCL and Hithium battery storage systems to EPCs
            across Bangalore, South India, and beyond — backed by local design,
            commissioning, and hands-on technician training.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/become-a-partner"
              className="group inline-flex items-center rounded-md bg-signal px-6 py-3 text-sm font-medium text-white shadow-[0_0_0_0_rgba(0,167,142,0.5)] transition-all duration-300 hover:bg-signal/90 hover:shadow-[0_0_28px_4px_rgba(0,167,142,0.45)]"
            >
              Become a Distributor
            </Link>
            <Link
              to="/brands"
              className="inline-flex items-center rounded-md border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:border-white/60 hover:bg-white/5"
            >
              Explore Our Brands
            </Link>
          </div>
          <p className="mt-10 text-sm text-ice/60">
            Authorized Partner: TCL, Hithium &nbsp;·&nbsp; Founding team: 15+ years in
            solar &amp; storage EPC &nbsp;·&nbsp; HQ: Bangalore
          </p>
        </div>

        {/* Right: hero visual — energy-pulse animation on desktop, static on mobile/reduced-motion */}
        <div className="md:col-span-2">
          <div className="relative aspect-[4/5] rounded-lg border border-white/15 bg-gradient-to-b from-white/5 to-transparent overflow-hidden">
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:28px_28px]" />
            {useAnimatedVisual ? <HeroVisual /> : <HeroVisualStatic />}
          </div>
        </div>
      </div>
    </section>
  );
}
