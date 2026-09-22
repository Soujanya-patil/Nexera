import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionContext, useMotionMode, useReveal } from "../lib/motion";
import Hero from "../components/Hero";
import ScaleStory from "../components/ScaleStory";
import ProductShowcase from "../components/ProductShowcase";
import Credibility from "../components/Credibility";
import WhyNexera from "../components/WhyNexera";
import Enquire from "../components/Enquire";

// Carries a ~4.6MB video asset — code-split so it's only fetched when needed.
const CabinetAnatomy = lazy(() => import("../components/CabinetAnatomy"));

/**
 * One continuous dark scene sequence, following the Show -> Interact -> Explore -> Trust -> Enquire
 * journey: HERO -> ANATOMY (scroll-scrubbed product video) -> CATEGORIES (Residential/C&I/Utility)
 * -> SHOWCASE (real products) -> PARTNERS (TCL/Hithium/CLOU) -> WHY NEXERA -> ENQUIRE.
 * `mode` (cinematic / light / static) is decided once here; changing it (resize, reduced-motion
 * toggle) remounts the sequence so no scroll state is left behind.
 */
function Scenes({ mode }) {
  const wrap = useRef(null);
  useReveal(wrap, mode === "light");
  return (
    <div ref={wrap} data-motion={mode} className="overflow-x-clip bg-night">
      <Hero />
      <Suspense fallback={null}>
        <CabinetAnatomy />
      </Suspense>
      <ScaleStory />
      <ProductShowcase />
      <Credibility />
      <WhyNexera />
      <Enquire />
    </div>
  );
}

export default function Home() {
  // The Home sequence is one dark scene: ground the page (and the translucent nav above it) in night while mounted
  useEffect(() => {
    document.body.classList.add("bg-night");
    return () => document.body.classList.remove("bg-night");
  }, []);

  const detected = useMotionMode();
  const [failed, setFailed] = useState(false);
  const fail = useCallback(() => setFailed(true), []);
  const mode = failed ? "static" : detected;
  const value = useMemo(() => ({ mode, fail }), [mode, fail]);

  return (
    <MotionContext.Provider value={value}>
      <Scenes key={mode} mode={mode} />
    </MotionContext.Provider>
  );
}
