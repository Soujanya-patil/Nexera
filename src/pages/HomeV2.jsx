import { lazy, Suspense } from "react";
import Hero from "../components/home2/Hero";

// Each section below the hero is its own chunk and its own Suspense boundary: the markup is in the
// pre-rendered page from the start, and the browser hydrates the sections one by one as they arrive
// (no single long hydration task).
const Why = lazy(() => import("../components/home2/Why"));
const Ledger = lazy(() => import("../components/home2/Ledger"));
const Cross = lazy(() => import("../components/home2/Cross"));
const Exploded = lazy(() => import("../components/home2/Exploded"));
const Capacity = lazy(() => import("../components/home2/Capacity"));
const Journey = lazy(() => import("../components/home2/Journey"));
const FinalCta = lazy(() => import("../components/home2/FinalCta"));
const SECTIONS = [Why, Ledger, Cross, Exploded, Capacity, Journey, FinalCta];

/**
 * Home v2 (preview at /home-v2: noindex, not in the sitemap or the nav — routes.js PREVIEW_ROUTES).
 * Typography-led: From drawing to energy (hero) → Why NEXERA exists → partners as credibility → the
 * BESS cross → inside the BESS → the capacity scale → the journey → Store today. Power tomorrow.
 * Art-directed media come from src/assets/home2/ through MediaSlot; until a file is there its
 * section shows a code-made visual.
 */
export default function HomeV2() {
  return (
    <div className="home2">
      <Hero />
      {SECTIONS.map((Section, i) => (
        <Suspense key={i} fallback={<div className="min-h-svh bg-deep" />}>
          <Section />
        </Suspense>
      ))}
    </div>
  );
}
