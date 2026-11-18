import { lazy, Suspense } from "react";
import DayStory from "../components/day/DayStory";
import HomeStats from "../components/HomeStats";

// Everything below the hero and the stat bar is its own chunk (it carries the catalogue data), so the
// first screen doesn't wait for it. In the pre-rendered page its markup is already there; the browser
// hydrates it when the chunk arrives.
const HomeBelow = lazy(() => import("../components/HomeBelow"));

/**
 * Home: the "One Day on Site" scroll story (the hero and six chapters, components/day) -> stat bar ->
 * Solutions ->
 * Technology Partners -> Why Now -> contact section (the site Footer follows from Layout). The quick
 * call-back is the site-wide floating widget (CallbackWidget, in Layout); the call-back strip that sat
 * under the hero (HomeQuickEnquiry) stays in the codebase, unmounted.
 *
 * Every section has its own interaction personality, so the page never animates the same way twice:
 *   Hero       cinematic — one day on a site, told by scrolling (3D on capable desktops, stills elsewhere)
 *   Stats      precision — a data-like reveal of the real figures (the story's business impact)
 *   Solutions  product discovery — a BESS selector with a cursor spotlight and partner preview
 *   Partners   technology — a sequenced reveal; each partner shows where its systems fit
 *   Why Now    editorial — the image, then the headline, then the benefits activating as you read
 *   Contact    the pitch, then the enquiry card rising in with a soft border glow
 *
 * The previous hero (HomeHero: the cabinet video) is retired from Home; HomeHero and HomeHeroCopy stay
 * in the codebase unmounted. Before that, this replaced the continuous cinematic scroll sequence. Its scenes (CabinetAnatomy, ScaleStory,
 * WhoWeAre, ProductShowcase, Credibility, WhyNexera, Enquire, JourneyRail — and the earlier Hero,
 * Storage, Technology, FinalCta) stay in the codebase unmounted, per this project's convention.
 *
 * Solutions → contact load as one chunk (HomeBelow); the placeholder keeps the footer below the fold
 * while it loads on a client-side visit.
 */
export default function Home() {
  return (
    <>
      <DayStory />
      <HomeStats />
      <Suspense fallback={<div className="min-h-[200svh] bg-white" />}>
        <HomeBelow />
      </Suspense>
    </>
  );
}
