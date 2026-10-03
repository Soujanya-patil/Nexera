import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
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
import imgAquaC25_5mwh from "../assets/clou-aqua-c25-5mwh.png";
import { UTILITY_FAQ } from "../data/solutions";
import UseCaseMap from "../components/solutions/UseCaseMap";
import { KeywordTicker, SectionRail } from "../components/solutions/Interactive";
import {
  BenefitStrip,
  CardGrid,
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
      ["High-capacity battery systems", "Large-format systems designed to maximize energy density and reduce project footprint."],
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
        copy: "A 20-foot containerized system delivering up to 6.25 MWh of energy capacity, with a 0.25P charge/discharge configuration, liquid cooling, IP55 protection and an operating range of –30°C to +55°C.",
        alt: "Hithium ∞Power 6.25 MWh liquid-cooled utility-scale battery energy storage container",
        cta: "Explore ∞Power 6.25 MWh",
      },
    ],
  },
  {
    id: "clou",
    title: "CLOU — Intelligent Energy Storage. Engineered for the Grid.",
    copy: "CLOU, an energy technology company under the Midea Group, brings 30+ years of power-electronics experience together with dedicated battery energy-storage technology. Its utility portfolio includes 5 MWh-class and 6.25 MWh-class systems, alongside PCS and medium-voltage solutions.",
    stats: [
      ["16 GWh", "contracted and delivered energy-storage systems"],
      ["8.6 GWh", "contracted and installed outside China"],
      ["100+", "countries active"],
      ["1,900+", "patent applications"],
      ["30+ years", "in power electronics"],
    ],
    whyTitle: "Why CLOU",
    why: [
      ["30+ Years of Power Electronics Experience", "Its energy-storage platform is built on in-house expertise in power electronics, BMS, PCS and energy-management systems."],
      ["Integrated Energy Storage Architecture", "Battery systems, PCS, BMS and EMS integrated into a coordinated storage platform."],
      ["Advanced Thermal Management", "Liquid-cooled systems help maintain battery temperature consistency and long-term performance."],
      ["Grid-Ready Power Quality", "Designed around high-power AC integration, power-factor control and low harmonic distortion."],
      ["Advanced Safety", "Multi-level electrical protection, battery-health monitoring, and fire detection and suppression."],
      ["Intelligent O&M", "Rapid state detection, fault recording and active balancing to simplify maintenance and improve availability."],
    ],
    systems: [
      {
        product: "clou-aqua-c25s",
        name: "CLOU Aqua C2.5S",
        figures: "5 MWh-class | 2-Hour / 4-Hour Configurations",
        specs: [
          "314 Ah LFP cells",
          "Intelligent liquid cooling",
          "IP55",
          "5.0159 MWh nominal capacity",
          "Power factor ≥0.99",
          "<3% current THD",
          "–30°C to +55°C operating range",
          "Up to 4,000 m altitude",
          "IEEE 693 seismic qualification",
          "Multiple fire detection and suppression layers",
          "Ethernet / Modbus-TCP / IEC 104 / IEC 61850 communication",
        ],
        // A different configuration from the catalogue's Aqua C2.5S (the 2.089 MWh / 500 kVA model), so
        // this card has its own cutout (CLOU BESS deck) and asks for the datasheet instead of linking there.
        photo: {
          src: imgAquaC25_5mwh,
          width: 864,
          height: 459,
          alt: "CLOU Aqua C2.5S 5 MWh-class liquid-cooled utility-scale battery energy storage container",
        },
        to: "/contact?intent=utility",
        cta: "Request Datasheet",
      },
      {
        product: "clou-aqua-c25s",
        name: "CLOU Aqua C2.5S 2.089 MWh | 4-Hour",
        copy: "For projects requiring longer-duration storage, the 2.089 MWh / 500 kVA configuration provides a compact 4-hour architecture, with 314 Ah LFP cells, intelligent liquid cooling, IP55 protection and multi-level fire protection.",
        alt: "CLOU Aqua C2.5S 2.089 MWh 4-hour containerised battery energy storage system",
        cta: "Explore Aqua C2.5S 2.089 MWh",
      },
    ],
  },
];

export default function SolutionsUtility() {
  return (
    <div className="solutions-page">
      <SolutionHero
        segment="utility"
        overlay="light"
        crumb="Utility-Scale"
        eyebrow="Utility-Scale Energy Storage"
        line1="Powering the"
        line2="Grid of Tomorrow."
        subheading="Grid-Scale Battery Energy Storage Systems Built for Renewable Integration"
        body={[
          "NEXERA brings utility-scale energy storage solutions from Hithium and CLOU for large renewable energy projects, grid support, energy shifting and round-the-clock power management.",
          "From 5 MWh-class systems to multi-hundred-MWh projects, our solutions are designed for high energy throughput, intelligent thermal management, advanced safety and long-term operation.",
        ]}
        cta={{ label: "Explore Utility Solutions", target: "utility-solutions" }}
        image={{
          name: "utility-solar",
          alt: "Utility-scale battery energy storage containers beside a solar plant",
          position: "object-[50%_62%]",
          credit: "CLOU utility-scale storage · technology partner imagery",
        }}
      />

      <BenefitStrip
        items={[
          { icon: Leaf, title: "Enable Higher Renewable Utilization", text: "Store clean energy for when it's needed most" },
          { icon: Activity, title: "Improve Grid Stability", text: "Support frequency, voltage and grid reliability" },
          { icon: TrendingUp, title: "Better Project Economics", text: "Maximize asset utilization and reduce curtailment" },
          { icon: ShieldCheck, title: "Built for Long-Term Operation", text: "Safe. Reliable. Scalable." },
        ]}
      />
      <KeywordTicker
        label="Utility-scale storage capabilities"
        items={["Renewable Integration", "Peak Shifting", "Grid Stabilization", "24/7 Renewable Power", "Energy Arbitrage", "T&D Support"]}
      />

      <Section
        id="why-utility"
        push
        mark="Stabilize the Grid"
        eyebrow="Why utility-scale storage?"
        title="Store More. Shift More. Stabilize the Grid."
        intro="Utility-scale BESS enables renewable power to be stored when generation is high and dispatched when it is needed most."
      >
        <FeatureGrid
          items={[
            { icon: Sun, title: "Renewable Energy Integration", text: "Store excess solar and wind generation and dispatch it when renewable generation falls." },
            { icon: Repeat, title: "Peak Shifting", text: "Move energy from low-demand periods to high-demand periods to improve asset utilization and project economics." },
            { icon: Activity, title: "Grid Stabilization", text: "Support grid frequency, voltage and power quality requirements through fast-response energy storage." },
            { icon: Clock, title: "24/7 Renewable Power", text: "Combine renewable generation with storage to create more predictable and dispatchable power." },
            { icon: Wallet, title: "Energy Arbitrage", text: "Charge during lower-cost periods and discharge during higher-value periods." },
            { icon: UtilityPole, title: "Transmission & Distribution Support", text: "Deploy storage close to demand or generation to improve flexibility and reduce grid constraints." },
          ]}
        />
      </Section>

      <Section
        id="utility-solutions"
        tone="ice"
        mark="One NEXERA Utility Ecosystem"
        eyebrow="Two global technology platforms"
        title="Hithium + CLOU. Two Specialists. One NEXERA Utility Ecosystem."
        intro="NEXERA brings together two dedicated energy-storage technology platforms, so project developers, IPPs, EPCs and utilities can select the architecture that best fits their project."
      >
        <div className="mt-12 space-y-16">
          {PARTNERS.map((p) => (
            <div key={p.id} className="group/card rounded-3xl border border-line bg-paper p-6 md:p-10">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                <div>
                  <PartnerMark partner={p.id} decorative />
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-ink">{p.title}</h3>
                  <p className="mt-3 leading-relaxed text-graphite">{p.copy}</p>
                  <Stats items={p.stats} />
                  <Link
                    to={`/products?partner=${p.id}`}
                    className="group/all mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-steel"
                  >
                    All {p.id === "clou" ? "CLOU" : "Hithium"} systems
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/all:translate-x-1" />
                  </Link>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">{p.whyTitle}</p>
                  <ul className="mt-4 divide-y divide-line">
                    {p.why.map(([t, d]) => (
                      <li key={t} className="py-3 text-sm leading-relaxed text-graphite">
                        <strong className="font-semibold text-ink">{t}:</strong> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-sage">Featured systems</p>
              <CardGrid columns={2} className="mt-4">
                {p.systems.map((s) => (
                  <SolutionProductCard key={s.name} {...s} level={4} product={getProduct(s.product)} />
                ))}
              </CardGrid>
            </div>
          ))}
        </div>
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
            { icon: Layers, title: "High Energy Density", text: "More MWh within a standardized container footprint." },
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
            <li key={c} className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-forest">
              {c}
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-3xl leading-relaxed text-graphite">
          For example, the CLOU Aqua C2.5S platform specifies operation from –30°C to +55°C, IP55 protection and C4 corrosion protection, with C5
          available as an option.
        </p>
      </Section>

      <Section
        id="applications"
        eyebrow="Where utility BESS fits"
        title="Powering Multiple Use Cases"
        intro="Utility-scale storage plays a critical role in building a cleaner, more flexible and more resilient power system."
      >
        {/* Hotspot positions on the CLOU illustration: the feature each use case is pinned to. */}
        <UseCaseMap
          items={[
            { icon: Sun, at: [15, 74], title: "Solar + Storage", text: "Store midday solar generation and dispatch it during evening demand." },
            { icon: Wind, at: [88, 42], title: "Wind + Storage", text: "Smooth variable wind generation and improve dispatchability." },
            { icon: Leaf, at: [69, 22], title: "Renewable Firming", text: "Increase renewable utilization and reduce curtailment." },
            { icon: Activity, at: [25, 65], title: "Grid Support", text: "Provide fast-response power and improve grid flexibility." },
            { icon: BarChart3, at: [47, 27], title: "Peak Demand Management", text: "Shift large blocks of energy to high-demand periods." },
            { icon: Clock, at: [35, 86], title: "Round-the-Clock Renewable Power", text: "Combine renewable generation and storage for more predictable delivery." },
            { icon: Network, at: [52, 63], title: "Transmission & Distribution", text: "Support constrained grid infrastructure and improve network flexibility." },
          ]}
        />
      </Section>

      <Section id="lifecycle" tone="ice" eyebrow="From MWh to GWh" mark="Complete Project Lifecycle" title="NEXERA Supports the Complete Project Lifecycle">
        <NumberedSteps
          surface="bg-ice"
          items={[
            { title: "Project Assessment", text: "Understand generation profile, load profile, grid requirements and operating objective." },
            { title: "System Sizing", text: "Determine the right MW / MWh configuration and duration." },
            { title: "Technology Selection", text: "Select the appropriate Hithium or CLOU architecture based on project requirements." },
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
            { icon: Cpu, title: "Technology Partners", text: "Hithium and CLOU utility-scale platforms." },
            { icon: SlidersHorizontal, title: "Technical Engineering", text: "System sizing and architecture based on project requirements." },
            { icon: Wrench, title: "India-Focused Support", text: "Local technical and commissioning support." },
            { icon: Wallet, title: "Project Economics", text: "Evaluate CAPEX, energy throughput, degradation and expected project returns." },
            { icon: MonitorCheck, title: "Lifecycle Support", text: "Monitoring, diagnostics and technical service throughout the system lifecycle." },
          ]}
        />
        <Link
          to="/become-a-partner"
          className="group/p mt-12 inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-steel"
        >
          For EPCs: Become a Partner
          <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/p:translate-x-1" />
        </Link>
      </Section>

      <FaqList id="faq" title="Utility-Scale BESS — Frequently Asked Questions" items={UTILITY_FAQ} />

      <CtaBand
        id="contact-utility"
        eyebrow="Ready to build your utility-scale project?"
        title="Let's Design the Right Storage Solution for Your Project."
        body="Tell us your project capacity, solar/wind capacity, required duration, grid voltage and location. Our team will help evaluate the appropriate Hithium or CLOU solution, system configuration and project architecture."
        checklist={[
          "Project feasibility support",
          "Recommended system configuration",
          "Technical & commercial evaluation",
          "Grid integration guidance",
          "Local support in India",
          "End-to-end project collaboration",
        ]}
        button={{ label: "Talk to a Utility BESS Expert", to: "/contact?intent=utility" }}
      />
      {/* Last in the DOM, so keyboard users reach the page before the section dots. */}
      <SectionRail />
    </div>
  );
}
