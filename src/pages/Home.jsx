import { lazy, Suspense } from "react";
import HomeHero from "../components/HomeHero";
import HomeStats from "../components/HomeStats";

// Everything below the hero and the stat bar is its own chunk (it carries the catalogue data), so the
// first screen doesn't wait for it. In the pre-rendered page its markup is already there; the browser
// hydrates it when the chunk arrives.
const HomeBelow = lazy(() => import("../components/HomeBelow"));

/**
 * Home, per the approved mockup (home-mockup-v2-approved.png): Hero -> stat bar -> Solutions ->
 * Technology Partners -> Why Now -> final CTA (the site Footer follows from Layout).
 *
 * Every section has its own interaction personality, so the page never animates the same way twice:
 *   Hero       cinematic — the pinned, scroll-driven product story
 *   Stats      precision — a data-like reveal of the real figures (the story's business impact)
 *   Solutions  product discovery — a BESS selector with a cursor spotlight and partner preview
 *   Partners   technology — a sequenced reveal; each partner shows where its systems fit
 *   Why Now    editorial — the image, then the headline, then the benefits activating as you read
 *   CTA        culmination — Partner · Deploy · Accelerate, the light lines, then the actions
 *
 * This replaces the continuous cinematic scroll sequence. Its scenes (CabinetAnatomy, ScaleStory,
 * WhoWeAre, ProductShowcase, Credibility, WhyNexera, Enquire, JourneyRail — and the earlier Hero,
 * Storage, Technology, FinalCta) stay in the codebase unmounted, per this project's convention.
 *
 * Solutions → CTA load as one chunk (HomeBelow); the placeholder keeps the footer below the fold
 * while it loads on a client-side visit.
 */
export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeStats />
      <Suspense fallback={<div className="min-h-[200svh] bg-paper" />}>
        <HomeBelow />
      </Suspense>
    </>
  );
}
