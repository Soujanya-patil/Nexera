import { Link } from "react-router-dom";
import {
  ArrowRight,
  BatteryCharging,
  Building2,
  EvCharger,
  Factory,
  Fuel,
  Gauge,
  Leaf,
  Network,
  Snowflake,
  Sun,
  Hotel,
  TrendingDown,
  Wallet,
  Warehouse,
} from "lucide-react";
import { getProduct } from "../data/products";
import { CI_FAQ } from "../data/solutions";
import {
  BenefitStrip,
  CardGrid,
  CtaBand,
  DataTable,
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
 * /solutions/commercial-industrial — copy from the director-approved Solutions content. Product
 * cards show the same values as data/products.js (where the content and the catalogue differ, the
 * catalogue's value is shown); the FAQ text comes from data/solutions.js and is also this page's
 * FAQPage data.
 */

const PARTNERS = [
  {
    id: "tcl",
    title: "TCL — A global technology group with massive industrial scale.",
    stats: [
      ["RMB 354+ billion", "total revenue"],
      ["160,000+", "employees"],
      ["1.3 billion+", "global users"],
      ["160+", "countries and regions"],
      ["RMB 60+ billion", "R&D investment (last six years)"],
      ["114,597", "patent applications"],
    ],
    copy: "TCL's energy-storage portfolio covers residential, C&I and energy-management solutions, including the BlueArk X5 and BlueArk W10.",
    statsFirst: true,
  },
  {
    id: "hithium",
    title: "Hithium — Energy storage is what Hithium does.",
    copy: "Founded in 2019, Hithium focuses specifically on energy-storage batteries and systems, supplying customers in 40+ countries and regions.",
    stats: [
      ["56.6 GWh", "energy-storage battery sales (2025)"],
      ["10.1 GWh", "energy-storage system sales (2025)"],
      ["1,080+", "R&D staff"],
      ["4,700+", "global patents and patent applications"],
    ],
  },
  {
    id: "clou",
    title: "CLOU — 30+ years of power-electronics experience.",
    copy: "Founded in 1996, CLOU entered the energy-storage sector in 2009. Part of the Midea Group, it has developed its own BMS, PCS, EMS and battery-system technologies.",
    stats: [
      ["16 GWh", "contracted and delivered systems"],
      ["100+", "countries active"],
      ["8.6 GWh", "contracted and installed outside China"],
    ],
  },
];
const PARTNER_NAMES = { tcl: "TCL", hithium: "Hithium", clou: "CLOU" };

const PORTFOLIO = [
  {
    product: "tcl-blueark-w10",
    name: "TCL BlueArk W10",
    figures: "125 kW / 261 kWh",
    tagline: "High-Density Energy Storage for Serious C&I Loads",
    copy: "Designed for businesses requiring higher storage capacity in a compact footprint: 261 kWh in a single cabinet, 125 kW power, liquid-cooled.",
    specs: [
      "314 Ah LFP cells",
      "Intelligent liquid cooling",
      "8,000-cycle specification at 70% SOH",
      "95% DOD",
      "IP55",
      "125 kVA rated output",
      "<2% current THD",
      "Three-phase operation",
      "Stable operation in weak-grid conditions",
      "Three-phase imbalance correction",
      "Integrated BMS, PCS and EMS",
      "Cloud-based monitoring and diagnostics",
      "Multiple fire-protection mechanisms",
    ],
    alt: "TCL BlueArk W10 liquid-cooled C&I battery energy storage cabinet",
    cta: "Explore BlueArk W10",
  },
  {
    product: "hithium-block-261",
    name: "Hithium 261",
    sub: "∞BLOCK C&I All-in-One ESS · model HCL 125kW-261kWh-400",
    figures: "125 kW / 261 kWh",
    tagline: "Energy Storage From a Battery Specialist",
    copy: "Hithium's C&I all-in-one system combines battery storage, power conversion and system controls in a compact cabinet.",
    specs: [
      "261 kWh rated energy",
      "125 kW adjustable PCS",
      "314 Ah LFP cells",
      "0.5P charge/discharge",
      "IP55 protection",
      "400 V AC connection",
      "2.7-tonne maximum specified weight",
    ],
    note: "Hithium's broader cell portfolio includes cycle-life specifications up to 11,000 cycles, depending on cell model.",
    alt: "Hithium 261 kWh liquid-cooled C&I all-in-one battery energy storage cabinet",
    cta: "Explore Hithium 261",
  },
  {
    product: "clou-aqua-e261",
    name: "CLOU Aqua-E261",
    figures: "125 kW / 261 kWh",
    tagline: "Liquid-Cooled C&I Energy Storage",
    copy: "An all-in-one C&I storage system, pre-installed and pre-commissioned, with intelligent temperature control, cloud-based monitoring and remote O&M.",
    specs: [
      "125 kW power",
      "261 kWh energy",
      "LFP 314 Ah cells",
      "Liquid cooling",
      "IP55",
      "≥7,000-cycle specification",
      "Self-powered auxiliary system",
      "Integrated fire detection and suppression",
      "Ethernet / CAN / RS485 / 4G communication",
      "IEC / UN38.3 compliance",
    ],
    alt: "CLOU Aqua-E261 all-in-one liquid-cooled C&I battery energy storage cabinet",
    cta: "Explore Aqua-E261",
  },
  {
    product: "tcl-blueark-x5",
    name: "TCL BlueArk X5",
    figures: "50 kW / 100 kWh",
    tagline: "Compact. Integrated. Flexible.",
    copy: "An all-in-one C&I energy storage platform for businesses looking to combine solar, storage and backup power, with direct PV access, diesel-generator integration, black-start capability and remote monitoring.",
    specs: [
      "100 kWh LFP battery",
      "50 kW rated AC power",
      "Direct PV integration",
      "Diesel-generator interface",
      // The content says "<20 ms"; the catalogue (TCL brochure) says 20 ms, so the catalogue's value is shown.
      "20 ms on/off-grid switching",
      "6 MPPT channels",
      "Up to 8,000-cycle battery specification",
      "Integrated protection and fire-safety architecture",
      "Battery IP55 / inverter IP66",
    ],
    alt: "TCL BlueArk X5 all-in-one C&I battery energy storage system",
    cta: "Explore BlueArk X5",
  },
];

export default function SolutionsCI() {
  return (
    <div>
      <SolutionHero
        crumb="Commercial & Industrial"
        eyebrow="Commercial & Industrial Energy Solutions"
        line1="Power Your Business."
        line2="Smarter."
        subheading="Intelligent Energy Storage for Commercial & Industrial Applications"
        body={[
          "Reduce peak demand. Store solar energy. Improve energy resilience. Take greater control of your electricity costs.",
          "NEXERA brings together advanced C&I Battery Energy Storage Systems from TCL, Hithium and CLOU, engineered for demanding commercial and industrial applications.",
        ]}
        tagline="Solar + Storage + Energy Management. Built for performance. Designed for scale."
        cta={{ label: "Explore C&I Solutions", target: "ci-products" }}
        image={{
          name: "ci-industrial",
          alt: "TCL floor-standing battery cabinets and inverter beside an industrial building",
          credit: "TCL commercial & industrial storage · technology partner imagery",
        }}
      />

      <BenefitStrip
        items={[
          { icon: Wallet, title: "Lower Operating Costs", text: "Peak shaving & energy arbitrage" },
          { icon: Sun, title: "Maximize Solar Usage", text: "Higher self-consumption" },
          { icon: BatteryCharging, title: "Reliable Backup Power", text: "Keep your operations running" },
          { icon: Leaf, title: "A Cleaner, Greener Future", text: "For your business and the planet" },
        ]}
      />

      <Section
        id="why-ci"
        eyebrow="Why C&I energy storage"
        title="Energy Storage Built Around Your Business"
        intro="Electricity consumption is not constant. Your energy system shouldn't be either. Our C&I BESS solutions help businesses with:"
      >
        <FeatureGrid
          items={[
            { icon: TrendingDown, title: "Peak Shaving", text: "Store energy when electricity is cheaper and discharge during high-demand periods." },
            { icon: Sun, title: "Solar Self-Consumption", text: "Capture excess daytime solar and use it when your facility needs it." },
            { icon: Gauge, title: "Demand Management", text: "Reduce peak demand and improve control over electricity costs." },
            { icon: BatteryCharging, title: "Backup Power", text: "Keep critical loads operating during grid interruptions." },
            { icon: Wallet, title: "Energy Arbitrage", text: "Charge and discharge intelligently based on your tariff structure." },
            { icon: Network, title: "Grid & Renewable Integration", text: "Integrate solar, diesel generation, grid supply and battery storage into one coordinated system." },
          ]}
        />
      </Section>

      <Section
        id="partners"
        tone="ice"
        eyebrow="Our global technology partners"
        title="Three Global Energy Storage Platforms. One NEXERA Energy Ecosystem."
        intro="We work with technology platforms that have significant global manufacturing, R&D and deployment experience."
      >
        <CardGrid>
          {PARTNERS.map((p) => (
            <article key={p.id} className="flex h-full flex-col rounded-2xl border border-line bg-paper p-6 md:p-8">
              <PartnerMark partner={p.id} decorative />
              <h3 className="mt-5 text-lg font-semibold leading-snug text-ink">{p.title}</h3>
              {p.statsFirst ? (
                <>
                  <Stats items={p.stats} />
                  <p className="mt-5 flex-1 text-sm leading-relaxed text-graphite">{p.copy}</p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-graphite">{p.copy}</p>
                  <Stats items={p.stats} className="mt-5 flex-1 content-start" />
                </>
              )}
              <Link
                to={`/products?partner=${p.id}`}
                className="group/all mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-forest hover:text-steel"
              >
                View {PARTNER_NAMES[p.id]} systems
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/all:translate-x-1" />
              </Link>
            </article>
          ))}
        </CardGrid>
      </Section>

      <Section
        id="ci-products"
        eyebrow="Our C&I BESS portfolio"
        title="Four Solutions. Multiple Applications."
        intro="From a compact 100 kWh all-in-one system to 261 kWh liquid-cooled cabinets, choose the platform that fits your site."
      >
        <CardGrid columns={4}>
          {PORTFOLIO.map((c) => (
            <SolutionProductCard key={c.product} {...c} product={getProduct(c.product)} />
          ))}
        </CardGrid>
      </Section>

      <Section
        id="quality"
        tone="ice"
        eyebrow="Quality you can measure"
        title="We Don't Judge BESS Quality by a Logo Alone."
        intro="We evaluate every system on the parameters that matter to an industrial customer."
      >
        <DataTable
          className="mt-10 max-w-4xl"
          caption="How NEXERA evaluates a BESS"
          head={["What matters", "What we look at"]}
          rows={[
            ["Battery Chemistry", "LFP cell technology"],
            ["Cycle Life", "Rated cycles & end-of-life criteria"],
            ["Thermal Management", "Air or liquid cooling architecture"],
            ["Safety", "BMS, thermal monitoring, fire detection & suppression"],
            ["Power Quality", "THD, power factor & grid response"],
            ["Protection", "IP rating, surge protection, isolation & fault protection"],
            ["Monitoring", "Remote diagnostics, EMS & cloud monitoring"],
            ["Scalability", "Parallel systems and capacity expansion"],
            ["Certifications", "IEC / CE / UN38.3 and model-specific standards"],
            ["Serviceability", "Remote O&M, diagnostics and component-level access"],
          ]}
        />
        <p className="mt-8 max-w-3xl font-semibold text-ink">
          The result? A BESS platform selected on engineering parameters, not marketing claims.
        </p>
      </Section>

      <Section
        id="safety"
        tone="night"
        title="Safety Isn't an Add-On. It's Designed In."
        intro="Modern BESS systems combine multiple layers of protection."
      >
        <LayerStack
          items={[
            { title: "Cell Level", text: "LFP chemistry plus temperature and voltage monitoring" },
            { title: "Module Level", text: "BMS-controlled protection and fault detection" },
            { title: "Battery Level", text: "Overcurrent, overvoltage and thermal protection" },
            { title: "Cabinet Level", text: "Smoke, gas and temperature detection, and fire suppression" },
            { title: "System Level", text: "EMS monitoring, alarms, remote diagnostics and controlled shutdown" },
          ]}
        />
        <p className="mt-10 max-w-3xl leading-relaxed text-ice/75">
          For example, the TCL BlueArk X5 incorporates battery protection, PV/AC surge protection, AFCI and fire-safety provisions, while the
          BlueArk W10 specifies liquid cooling and multiple fire-detection and suppression options.
        </p>
      </Section>

      <Section
        id="applications"
        eyebrow="Applications"
        title="One Platform. Multiple Business Cases."
        intro="From manufacturing to commercial buildings, our C&I energy storage solutions help businesses across sectors."
      >
        <FeatureGrid
          columns={4}
          items={[
            { icon: Factory, title: "Manufacturing", text: "Peak-demand management and solar self-consumption" },
            { icon: Building2, title: "Commercial Buildings", text: "Load shifting and backup power" },
            { icon: Snowflake, title: "Cold Storage", text: "Reliable power and tariff optimisation" },
            { icon: Hotel, title: "Hotels & Hospitality", text: "Backup, solar utilisation and demand management" },
            { icon: Warehouse, title: "Retail & Warehouses", text: "Peak shaving and energy arbitrage" },
            { icon: Sun, title: "Solar + Storage", text: "Store excess solar and use it when generation falls" },
            { icon: Fuel, title: "Diesel Hybrid", text: "Coordinate solar, battery, DG and grid" },
            { icon: EvCharger, title: "EV Charging", text: "Manage high-power charging loads and reduce grid demand peaks" },
          ]}
        />
      </Section>

      <Section
        id="nexera-difference"
        tone="ice"
        title="We Don't Just Sell a Battery. We Engineer the Energy System."
        intro="A battery is only one part of a successful BESS project. NEXERA evaluates:"
      >
        <NumberedSteps
          items={[
            { title: "Load Profile", text: "15-minute / 30-minute demand pattern" },
            { title: "Tariff Structure", text: "Peak demand, TOD and energy charges" },
            { title: "Solar Generation", text: "Existing or proposed PV capacity" },
            { title: "Battery Sizing", text: "Power vs. energy requirement" },
            { title: "Backup Requirement", text: "Which loads must continue during an outage?" },
            { title: "Operating Strategy", text: "Peak shaving, self-consumption, arbitrage or backup" },
            { title: "Financial Model", text: "CAPEX, savings, payback and project returns" },
            { title: "Monitoring & O&M", text: "Remote monitoring, alerts and performance tracking" },
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

      <FaqList id="faq" tone="paper" title="C&I Energy Storage — Frequently Asked Questions" items={CI_FAQ} />

      <CtaBand
        id="contact-ci"
        title="Your Factory. Your Loads. Your Energy Strategy."
        subheading="Let's design the right BESS for your business."
        body="Share your monthly electricity bill, sanctioned load, 15-minute load profile and existing solar capacity, and NEXERA will help evaluate:"
        checklist={[
          "Recommended BESS capacity",
          "Solar + storage configuration",
          "Peak-demand reduction potential",
          "Backup capability",
          "Expected savings",
          "System expansion options",
          "Project economics",
        ]}
        button={{ label: "Design My Energy Storage System", to: "/contact?intent=ci" }}
      />
    </div>
  );
}
