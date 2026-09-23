import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionContext, useMotionMode, useReveal } from "../lib/motion";
import CabinetAnatomy from "../components/CabinetAnatomy";
import ScaleStory from "../components/ScaleStory";
import WhoWeAre from "../components/WhoWeAre";
import ProductShowcase from "../components/ProductShowcase";
import Credibility from "../components/Credibility";
import WhyNexera from "../components/WhyNexera";
import Enquire from "../components/Enquire";

/**
 * One continuous dark scene sequence, following the Show -> Interact -> Explore -> Trust -> Enquire
 * journey: ANATOMY (merged Hero + scroll-scrubbed product video, the page's opening moment) ->
 * CATEGORIES (Residential/C&I/Utility) -> WHO WE ARE (Nexera's own identity, before any partner
 * content) -> SHOWCASE (real products) -> PARTNERS (TCL/Hithium/CLOU) -> WHY NEXERA -> ENQUIRE.
 * WhoWeAre sits before Showcase/Partners deliberately: two consecutive partner-centric sections
 * with no Nexera identity in between read as a partner catalog. `Hero.jsx` is kept as a file (this
 * project's convention for retired scenes — see Storage/Technology/FinalCta) but no longer mounted
 * here; its headline/subcopy/CTAs now live inside CabinetAnatomy's opening-copy overlay. Not lazy:
 * this is the first thing on the page, so code-splitting it would only add a blank-page delay
 * before the opening moment renders. `mode` (cinematic / light / static) is decided once here;
 * changing it (resize, reduced-motion toggle) remounts the sequence so no scroll state is left
 * behind.
 */
function Scenes({ mode }) {
  const wrap = useRef(null);
  useReveal(wrap, mode === "light");
  return (
    <div ref={wrap} data-motion={mode} className="overflow-x-clip bg-night">
      <CabinetAnatomy />
      <ScaleStory />
      <WhoWeAre />
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
