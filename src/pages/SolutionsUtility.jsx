import { lazy, Suspense } from "react";
import {
  Activity,
  BarChart3,
  Clock,
  Cpu,
  Expand,
  Gauge,
  Layers,
  Leaf,
  MonitorCheck,
  Network,
  Repeat,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Thermometer,
  TrendingUp,
  UtilityPole,
  Wallet,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import { getProduct } from "../data/products";
import { CTA_TOPICS } from "../data/solutionTopics";
import { UTILITY_FAQ } from "../data/solutions";
import { guideFor } from "../data/articles";
import { AfterIdle, ArrowLink, KeywordTicker, NearViewport, SectionRail } from "../components/solutions/Interactive";
const SegmentSwitcher = lazy(() => import("../components/solutions/SegmentSwitcher"));
const LoadShiftChart = lazy(() => import("../components/solutions/LoadShiftChart"));
import {
  BenefitStrip,
  CardGrid,
  CompareProvider,
  CtaBand,
  FaqList,
  FeatureGrid,
  LayerStack,
  NumberedSteps,
  PartnerMark,
  Section,
  SolutionHero,
  SolutionProductCard,
  Stats,
} from "../components/solutions/SolutionBlocks";

/*
 * /solutions/utility-scale — copy from the director-approved Solutions content. Products, images and
 * the figures on product cards come from data/products.js; the FAQ text from data/solutions.js (the
 * same words become this page's FAQPage data at build time).
 */

const PARTNERS = [
  {
    id: "hithium",
    title: "Hithium — Energy Storage. Built for Scale.",
    copy: "Hithium is a specialist energy-storage company focused on battery cells, battery systems and large-scale energy storage. Its utility portfolio includes 5 MWh-class and 6.25 MWh-class liquid-cooled systems, designed for high-density, long-duration applications.",
    stats: [
      ["56.6 GWh", "energy-storage battery sales (2025)"],
      ["10.1 GWh", "energy-storage system sales (2025)"],
      ["4,700+", "global patents and patent applications"],
      ["40+", "countries and regions"],
    ],
    whyTitle: "Why Hithium",
    why: [
      ["Pure-play energy storage focus", "Dedicated entirely to energy-storage technologies."],
      ["High-capacity battery systems", "Large-format systems designed to maximise energy density and reduce project footprint."],
      ["Liquid cooling", "Advanced thermal management for consistent battery operating conditions."],
      ["Long-cycle battery technology", "Cells designed for thousands of cycles and long operating life."],
      ["Integrated safety architecture", "Battery, thermal, electrical and fire-protection systems designed as part of the complete solution."],
      ["Global deployment", "Operations across more than 40 countries and regions."],
    ],
    systems: [
      {
        product: "hithium-power-5016",
        name: "Hithium ∞Power 5.016 MWh",
        copy: "High-density liquid-cooled energy storage platform for utility-scale applications.",
        cta: "Explore ∞Power 5.016 MWh",
      },
      {
        product: "hithium-power-625",
        name: "Hithium ∞Power 6.25 MWh | 4-Hour",
        copy: "A 20-foot containerised system delivering up to 6.25 MWh of energy capacity, with a 0.25P charge/discharge configuration, liquid cooling, IP55 protection and an operating range of –30°C to +55°C.",
        alt: "Hithium ∞Power 6.25 MWh liquid-cooled utility-scale battery energy storage container",
        cta: "Explore ∞Power 6.25 MWh",
      },
    ],
  },
];

export default function SolutionsUtility() {
  return (
    <div className="solutions-page segment-page">
      <SolutionHero
        segment="utility"
        overlay="light"
        crumb="Utility-Scale"
        eyebrow="Utility-Scale Energy Storage"
        line1="Powering the"
        line2="Grid of Tomorrow."
        subheading="Grid-Scale Battery Energy Storage Systems Built for Renewable Integration"
        body={[
          "NEXERA brings utility-scale energy storage solutions from Hithium for large renewable energy projects, grid support, energy shifting and round-the-clock power management.",
          "From 5 MWh-class systems to multi-hundred-MWh projects, our solutions are designed for high energy throughput, intelligent thermal management, advanced safety and long-term operation.",
        ]}
        cta={{ label: "Explore Utility Solutions", target: "utility-solutions" }}
        image={{
          scene: "utility",
          alt: "Render of Hithium battery storage containers beside a solar plant at sunset",
          position: "object-[85%_50%]",
          credit: "Illustrative image",
        }}
      />
      {/* Sticky segment switcher (own chunk, mounted once the page is idle): shown once the hero has scrolled away. */}
      <AfterIdle>
        <Suspense fallback={null}>
          <SegmentSwitcher current="utility" />
        </Suspense>
      </AfterIdle>

      <BenefitStrip
        items={[
          { icon: Leaf, title: "Enable Higher Renewable Utilisation", text: "Store clean energy for when it's needed most" },
          { icon: Activity, title: "Improve Grid Stability", text: "Support frequency, voltage and grid reliability" },
          { icon: TrendingUp, title: "Better Project Economics", text: "Maximise asset utilisation and reduce curtailment" },
          { icon: ShieldCheck, title: "Built for Long-Term Operation", text: "Safe. Reliable. Scalable." },
        ]}
      />
      <KeywordTicker
        label="Utility-scale storage capabilities"
        items={["Renewable Integration", "Peak Shifting", "Grid Stabilisation", "24/7 Renewable Power", "Energy Arbitrage", "T&D Support"]}
      />

      <Section
        id="why-utility"
        push
        mark="Stabilise the Grid"
        eyebrow="Why utility-scale storage?"
        title="Store More. Shift More. Stabilise the Grid."
        intro="Utility-scale BESS enables renewable power to be stored when generation is high and dispatched when it is needed most."
      >
        <FeatureGrid
          items={[
            { icon: Sun, title: "Renewable Energy Integration", text: "Store excess solar and wind generation and dispatch it when renewable generation falls." },
            { icon: Repeat, title: "Peak Shifting", text: "Move energy from low-demand periods to high-demand periods to improve asset utilisation and project economics." },
            { icon: Activity, title: "Grid Stabilisation", text: "Support grid frequency, voltage and power quality requirements through fast-response energy storage." },
            { icon: Clock, title: "24/7 Renewable Power", text: "Combine renewable generation with storage to create more predictable and dispatchable power." },
            { icon: Wallet, title: "Energy Arbitrage", text: "Charge during lower-cost periods and discharge during higher-value periods." },
            { icon: UtilityPole, title: "Transmission & Distribution Support", text: "Deploy storage close to demand or generation to improve flexibility and reduce grid constraints." },
          ]}
        />
        {/* Illustrative chart (own chunk, loaded near; its box is reserved). */}
        <NearViewport className="mt-12 aspect-[4/3] w-full max-w-3xl sm:aspect-[16/10]">
          <Suspense fallback={null}>
            <LoadShiftChart variant="utility" />
          </Suspense>
        </NearViewport>
      </Section>

      <Section
        id="utility-solutions"
        tone="ice"
        mark="Delivered and Supported by NEXERA"
        eyebrow="Our global technology platform"
        title="Utility-Scale Storage from Hithium. Delivered and Supported by NEXERA."
        intro="NEXERA brings Hithium's dedicated platform for containerised battery storage to project developers, IPPs, EPCs and utilities, so they can select the BESS container architecture that best fits their project."
      >
        {/* One compare selection across the featured systems. */}
        <CompareProvider>
          <div className="mt-12 space-y-16">
            {PARTNERS.map((p) => (
              <div key={p.id} className="group/card rounded-card border border-line bg-white p-6 md:p-10">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                  <div>
                    <PartnerMark partner={p.id} decorative />
                    <h3 className="mt-5 text-h3 font-semibold text-ink">{p.title}</h3>
                    <p className="mt-3 text-body text-copy">{p.copy}</p>
                    <Stats items={p.stats} />
                    <ArrowLink to={`/partners/${p.id}`} className="mt-6">
                      All Hithium systems
                    </ArrowLink>
                  </div>
                  <div>
                    <p className="eyebrow text-muted">{p.whyTitle}</p>
                    <ul className="mt-4 divide-y divide-line">
                      {p.why.map(([t, d]) => (
                        <li key={t} className="py-3 text-small text-copy">
                          <strong className="font-semibold text-ink">{t}:</strong> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="mt-10 eyebrow text-muted">Featured systems</p>
                <CardGrid columns={2} className="mt-4">
                  {p.systems.map((s) => (
                    <SolutionProductCard key={s.name} {...s} level={4} product={getProduct(s.product)} />
                  ))}
                </CardGrid>
              </div>
            ))}
          </div>
        </CompareProvider>
      </Section>

      <Section
        id="grid-scale"
        mark="What Matters at Grid Scale"
        eyebrow="Built for utility-scale performance"
        title="Compare What Matters at Grid Scale"
        intro="Instead of simply comparing battery capacity, NEXERA evaluates the complete energy-storage system."
      >
        <FeatureGrid
          columns={4}
          items={[
            { icon: Layers, title: "High Energy Density", text: "More MWh within a standardised container footprint." },
            { icon: Thermometer, title: "Thermal Management", text: "Liquid cooling helps maintain consistent cell operating temperatures." },
            { icon: Gauge, title: "Battery Life", text: "Cell chemistry, operating window, thermal conditions and operating strategy all influence lifetime performance." },
            { icon: ShieldCheck, title: "Safety by Design", text: "Protection extends from the cell and module through the container and site-level protection system." },
            { icon: Zap, title: "Grid Compatibility", text: "Power quality, harmonic performance, reactive power capability and communication interfaces matter at the point of grid connection." },
            { icon: MonitorCheck, title: "Intelligent O&M", text: "Remote monitoring, fault detection, diagnostics and predictive maintenance help reduce unnecessary site intervention." },
            { icon: Expand, title: "Modular Architecture", text: "Projects can be expanded from individual containers to large multi-MWh installations." },
          ]}
        />
      </Section>

      <Section id="safety" tone="night" mark="It's a System" title="Safety Is Not One Feature. It's a System.">
        <LayerStack
          items={[
            { title: "Cell", text: "LFP chemistry and controlled operating conditions." },
            { title: "Module", text: "Individual module monitoring and protection." },
            { title: "Battery Rack", text: "Voltage, temperature and current monitoring." },
            { title: "Container", text: "Thermal management, fire detection and suppression." },
            { title: "PCS", text: "Electrical protection and controlled power conversion." },
            { title: "EMS", text: "System-level monitoring, control and operating strategy." },
            { title: "Grid", text: "Protection, communication and grid-code integration." },
          ]}
        />
      </Section>

      <Section
        id="india"
        push
        tone="ice"
        eyebrow="Designed for India's conditions"
        title="Built for Real-World Operating Conditions"
        intro="Utility-scale storage has to perform beyond laboratory conditions. Our selected platforms are designed around demanding operating environments, including:"
      >
        <ul className="mt-8 flex max-w-4xl flex-wrap gap-2.5">
          {[
            "High ambient temperatures",
            "Dust and outdoor exposure",
            "Long operating hours",
            "High energy throughput",
            "Variable renewable generation",
            "Grid fluctuations",
            "Remote project locations",
          ].map((c) => (
            <li key={c} className="rounded-full border border-line bg-white px-4 py-2 text-small font-medium text-ink">
              {c}
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-3xl text-body text-copy">
          For example, the Hithium ∞Power 6.25 MWh specifies operation from –30°C to +55°C and IP55 protection.
        </p>
      </Section>

      <Section
        id="applications"
        eyebrow="Where utility BESS fits"
        title="Powering Multiple Use Cases"
        intro="Utility-scale storage plays a critical role in building a cleaner, more flexible and more resilient power system."
      >
        <FeatureGrid
          items={[
            { icon: Sun, title: "Solar + Storage", text: "Store midday solar generation and dispatch it during evening demand." },
            { icon: Wind, title: "Wind + Storage", text: "Smooth variable wind generation and improve dispatchability." },
            { icon: Leaf, title: "Renewable Firming", text: "Increase renewable utilisation and reduce curtailment." },
            { icon: Activity, title: "Grid Support", text: "Provide fast-response power and improve grid flexibility." },
            { icon: BarChart3, title: "Peak Demand Management", text: "Shift large blocks of energy to high-demand periods." },
            { icon: Clock, title: "Round-the-Clock Renewable Power", text: "Combine renewable generation and storage for more predictable delivery." },
            { icon: Network, title: "Transmission & Distribution", text: "Support constrained grid infrastructure and improve network flexibility." },
          ]}
        />
      </Section>

      <Section id="lifecycle" tone="ice" eyebrow="From MWh to GWh" mark="Complete Project Lifecycle" title="NEXERA Supports the Complete Project Lifecycle">
        <NumberedSteps
          surface="bg-paper"
          items={[
            { title: "Project Assessment", text: "Understand generation profile, load profile, grid requirements and operating objective." },
            { title: "System Sizing", text: "Determine the right MW / MWh configuration and duration." },
            { title: "Technology Selection", text: "Select the appropriate Hithium architecture based on project requirements." },
            { title: "Engineering", text: "Electrical design, container configuration, PCS/MV integration and communication architecture." },
            { title: "Procurement & Logistics", text: "Coordinate equipment supply and project delivery." },
            { title: "Commissioning", text: "Support installation, testing and system commissioning." },
            { title: "Monitoring & O&M", text: "Long-term system monitoring, diagnostics and service support." },
          ]}
        />
      </Section>

      <Section
        id="why-nexera"
        eyebrow="Why NEXERA?"
        title="Global Technology. Local Expertise."
        intro="You don't just need a battery container. You need a system that works with your solar plant, grid connection, tariff structure, operating strategy and project economics."
      >
        <FeatureGrid
          items={[
            { icon: Cpu, title: "Technology Partner", text: "Hithium utility-scale platforms." },
            { icon: SlidersHorizontal, title: "Technical Engineering", text: "System sizing and architecture based on project requirements." },
            { icon: Wrench, title: "India-Focused Support", text: "Local technical and commissioning support." },
            { icon: Wallet, title: "Project Economics", text: "Evaluate CAPEX, energy throughput, degradation and expected project returns." },
            { icon: MonitorCheck, title: "Lifecycle Support", text: "Monitoring, diagnostics and technical service throughout the system lifecycle." },
          ]}
        />
        <ArrowLink to="/become-a-partner" className="mt-12">
          For EPCs: Become a Partner
        </ArrowLink>
      </Section>

      <FaqList id="faq" title="Utility-Scale BESS — Frequently Asked Questions" items={UTILITY_FAQ} guide={guideFor("utility")} />

      <CtaBand
        id="contact-utility"
        eyebrow="Ready to build your utility-scale project?"
        title="Let's Design the Right Storage Solution for Your Project."
        body="Tell us your project capacity, solar/wind capacity, required duration, grid voltage and location. Our team will help evaluate the appropriate Hithium solution, system configuration and project architecture."
        checklist={CTA_TOPICS.utility}
        segment="utility"
        button={{ label: "Talk to a Utility BESS Expert", to: "/contact?intent=utility" }}
      />
      {/* Last in the DOM, so keyboard users reach the page before the section dots. */}
      <SectionRail />
    </div>
  );
}
