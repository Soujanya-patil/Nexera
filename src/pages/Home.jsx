import { useRef } from "react";
import StatBar, { HOME_STATS } from "../components/StatBar";
import HomeHero from "../components/HomeHero";
import HomeSolutions from "../components/HomeSolutions";
import HomePartners from "../components/HomePartners";
import HomeWhyNow from "../components/HomeWhyNow";
import HomeCta from "../components/HomeCta";
import { useEntrance } from "../lib/entrance";

/**
 * Home, per the approved mockup (home-mockup-v2-approved.png): Hero -> stat bar -> Solutions ->
 * Technology Partners -> Why Now -> final CTA (the site Footer follows from Layout).
 *
 * Each section after the hero has its own entrance rhythm (lib/entrance.js), so the page doesn't
 * animate the same way five times: the stat bar opens out from the centre (fast), Solutions' cards
 * rise out of their own frames in turn (medium), Partners slides its copy in from the left while the
 * logos wipe in from the right, Why Now reveals its image slowly then the benefits one by one, and
 * the closing band steps through Partner · Deploy · Accelerate (fast).
 *
 * This replaces the continuous cinematic scroll sequence. Its scenes (CabinetAnatomy, ScaleStory,
 * WhoWeAre, ProductShowcase, Credibility, WhyNexera, Enquire, JourneyRail — and the earlier Hero,
 * Storage, Technology, FinalCta) stay in the codebase unmounted, per this project's convention.
 */
export default function Home() {
  // Stat bar: the hero's story hands over here — the bar opens out from its centre as the figures
  // count up (StatBar's own count), a quick beat after the long product story.
  const stats = useRef(null);
  const statsEnter = useEntrance(stats, ({ tl, q }) => {
    tl.fromTo(q("[data-e]"), { opacity: 0, clipPath: "inset(0% 50% 0% 50%)", y: 12 }, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.8, clearProps: "all" });
  }, { start: "top 85%" });

  return (
    <>
      <HomeHero />
      <section ref={stats} data-enter={statsEnter} aria-label="Market outlook" className="bg-paper">
        <div data-e className="mx-auto max-w-4xl px-6 py-10">
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
