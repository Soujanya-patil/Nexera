import HomeHero from "../components/HomeHero";
import HomeStats from "../components/HomeStats";
import HomeSolutions from "../components/HomeSolutions";
import HomePartners from "../components/HomePartners";
import HomeWhyNow from "../components/HomeWhyNow";
import HomeCta from "../components/HomeCta";

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
 */
export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeStats />
      <HomeSolutions />
      <HomePartners />
      <HomeWhyNow />
      <HomeCta />
    </>
  );
}
