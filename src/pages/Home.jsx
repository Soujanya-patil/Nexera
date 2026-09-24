import StatBar, { HOME_STATS } from "../components/StatBar";
import HomeHero from "../components/HomeHero";
import HomeSolutions from "../components/HomeSolutions";
import HomePartners from "../components/HomePartners";
import HomeWhyNow from "../components/HomeWhyNow";
import HomeCta from "../components/HomeCta";

/**
 * Home, per the approved mockup (home-mockup-v2-approved.png): Hero -> stat bar -> Solutions ->
 * Technology Partners -> Why Now -> final CTA (the site Footer follows from Layout).
 *
 * This replaces the continuous cinematic scroll sequence. Its scenes (CabinetAnatomy, ScaleStory,
 * WhoWeAre, ProductShowcase, Credibility, WhyNexera, Enquire, JourneyRail — and the earlier Hero,
 * Storage, Technology, FinalCta) stay in the codebase unmounted, per this project's convention.
 */
export default function Home() {
  return (
    <>
      <HomeHero />
      <section aria-label="Market outlook" className="bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <StatBar stats={HOME_STATS} tone="light" />
        </div>
      </section>
      <HomeSolutions />
      <HomePartners />
      <HomeWhyNow />
      <HomeCta />
    </>
  );
}
