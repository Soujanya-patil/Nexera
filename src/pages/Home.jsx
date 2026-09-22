import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionContext, useMotionMode, useReveal } from "../lib/motion";
import Hero from "../components/Hero";
import Storage from "../components/Storage";
import ScaleStory from "../components/ScaleStory";
import Technology from "../components/Technology";
import Credibility from "../components/Credibility";
import FinalCta from "../components/FinalCta";

// Below the fold and carries a ~4.6MB video asset — code-split so it's only fetched when needed.
const CabinetAnatomy = lazy(() => import("../components/CabinetAnatomy"));

/**
 * One continuous dark scene sequence: ENERGY (Hero) -> STORAGE -> SCALE -> TECHNOLOGY ->
 * CONFIDENCE -> ENQUIRE. `mode` (cinematic / light / static) is decided once here; changing it
 * (resize, reduced-motion toggle) remounts the sequence so no scroll state is left behind.
 */
function Scenes({ mode }) {
  const wrap = useRef(null);
  useReveal(wrap, mode === "light");
  return (
    <div ref={wrap} data-motion={mode} className="overflow-x-clip bg-night">
      <Hero />
      <Storage />
      <ScaleStory />
      <Technology />
      <Suspense fallback={null}>
        <CabinetAnatomy />
      </Suspense>
      <Credibility />
      <FinalCta />
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
