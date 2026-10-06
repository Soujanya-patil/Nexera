import { lazy, Suspense } from "react";
import Hero from "../components/home2/Hero";
import EnergyLine from "../components/home2/EnergyLine";

// Everything below the hero is its own chunk; its markup is in the pre-rendered page from the start.
const Below = lazy(() => import("../components/home2/Below"));

/**
 * Home v2 (preview at /home-v2: noindex, not in the sitemap or the nav — routes.js PREVIEW_ROUTES).
 * Rhythm: dark Hero → light What is BESS → dark Inside the BESS → light Every Scale → light BESS
 * Products → light Partners + Why NEXERA → dark final CTA (the site Footer follows from Layout).
 * One signature "energy line" (desktop) runs from the hero's rail, past the flow and the explorer, to
 * the final CTA's button.
 */
export default function HomeV2() {
  return (
    <div className="home2 relative">
      <Hero />
      <Suspense fallback={<div className="min-h-[200svh] bg-paper" />}>
        <Below />
      </Suspense>
      <EnergyLine />
    </div>
  );
}
