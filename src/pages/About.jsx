import { useRef } from "react";
import { Check, Container, Cpu, DraftingCompass, GraduationCap, Headset, Network, Package, ShieldCheck, Sun, Wrench, Activity } from "lucide-react";
import PageHeader from "../components/PageHeader";
import MagneticButton from "../components/ui/MagneticButton";
import { ArrowLink } from "../components/solutions/Interactive";
import { FeatureGrid } from "../components/solutions/SolutionBlocks";
import { ADDRESS, BRANCH_ADDRESS } from "../data/business";
import { useScrollReveal } from "../lib/scrollReveal";

// The director's "About Section", as written (Step 9). No projects or MW figures, no team photos.
const FIELD = [
  { icon: Sun, title: "EPC", text: "We have designed and built rooftop and ground-mounted solar plants for commercial and industrial customers." },
  {
    icon: Wrench,
    title: "Operations & maintenance",
    text: "We have maintained plants over many years, so we understand how systems age, where they fail, and what keeps them performing.",
  },
  {
    icon: Container,
    title: "Module trading",
    text: "We have imported and distributed solar modules for over a decade, and we know supply chains, logistics and import compliance.",
  },
  { icon: Network, title: "Inverter distribution", text: "We have built distributor and installer networks across India and supported them after the sale." },
];

const GOALS = [
  "Build an all-India network of trained distributors and EPC partners.",
  "Keep stock and spares in India so customers get fast delivery, not 60 to 90 day waits.",
  "Make every partner able to design, install and service storage systems with confidence.",
];

const SUPPORT = [
  {
    icon: DraftingCompass,
    title: "System design and sizing",
    text: "Load analysis, right-sized configurations, and a project single-line diagram, including earthing and neutral layout.",
  },
  {
    icon: Cpu,
    title: "Commissioning support",
    text: "We commission your system, or supervise your team, and issue the commissioning report and warranty registration.",
  },
  { icon: Activity, title: "Remote diagnostics", text: "Our team monitors and diagnoses issues from system data, so problems are caught early." },
  { icon: ShieldCheck, title: "Warranty and claims", text: "We register every system and handle claims with the manufacturer on your behalf." },
  { icon: Package, title: "India spares stock", text: "Parts are available locally, so downtime is short." },
  { icon: Headset, title: "Technical guidance", text: "From pre-sales questions to long-term performance, our engineers are a call away." },
];

const ACADEMY = [
  "how BESS systems are designed, installed and commissioned",
  "safe handling, protection and earthing practices",
  "troubleshooting and service, so partners can handle their own service calls",
  "certification, so every installer works to one standard",
];

// Leadership: simple cards, no photos, in the order given. Raviraj's role is to be confirmed, so none is shown.
const LEADERS = [
  { name: "Ankit Jain", role: "Co-founder" },
  { name: "Narendra", role: "Co-founder" },
  { name: "Siddhant S Patil", role: "Co-founder" },
  { name: "Raviraj" },
];

const H2 = "text-h2 font-semibold text-ink";
const BODY = "mt-heading max-w-measure text-body text-copy";

export default function About() {
  // The site's scroll reveal: headings rise from their masks, copy and cards fade up (lib/scrollReveal).
  const root = useRef(null);
  const reveal = useScrollReveal(root);
  return (
    <div ref={root} data-sr-state={reveal}>
      <PageHeader
        eyebrow="About Us"
        crumb="About"
        title="About Nexera Powertech"
        subtitle="Powering India’s energy storage future, backed by 15 years of hands-on solar experience"
      />

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-section">
          <p data-sr className="max-w-measure text-body text-copy">
            Nexera Powertech is an energy storage company built by people who have spent 15+ years in Indian solar. Our promoters have
            designed, installed and maintained solar plants, traded solar modules at container scale, and distributed inverters across the
            country. We know what works on Indian rooftops and factory floors, and what fails. Nexera brings that experience to battery
            energy storage (BESS).
          </p>
          <p data-sr className="mt-4 max-w-measure text-body text-copy">
            We are an authorised partner of TCL and Hithium, two leading global energy storage manufacturers. We supply their systems across
            India and back each one with local design, commissioning, training and service.
          </p>
        </div>
      </section>

      <section className="bg-paper border-y border-line">
        <div className="container-site py-section">
          <h2 data-sr="heading" className={H2}>
            Experience that comes from the field
          </h2>
          <FeatureGrid columns={4} className="mt-10" items={FIELD} />
          <p data-sr className="mt-10 max-w-measure text-body text-copy">
            This background shapes how we work. We don&rsquo;t just ship equipment. We think like the EPC who has to install it and the
            customer who has to live with it for 10 years.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-site grid gap-12 py-section md:grid-cols-2">
          <div>
            <h2 data-sr="heading" className={H2}>
              Our vision
            </h2>
            <p data-sr className={BODY}>
              To make reliable, safe and affordable energy storage a normal part of every Indian business, home and grid, and to build the
              skilled network that keeps those systems running.
            </p>
          </div>
          <div>
            <h2 data-sr="heading" className={H2}>
              Our goal
            </h2>
            <ul data-sr className="mt-heading space-y-3 text-body text-copy">
              {GOALS.map((g) => (
                <li key={g} className="flex gap-3">
                  <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-label" strokeWidth={2.4} />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-paper border-y border-line">
        <div className="container-site py-section">
          <h2 data-sr="heading" className={H2}>
            Support that goes beyond the sale
          </h2>
          <p data-sr className={BODY}>
            A battery system is only as good as its design and commissioning. Nexera stands behind every project:
          </p>
          <FeatureGrid columns={3} className="mt-10" items={SUPPORT} />
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-section">
          <span data-sr aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-ice text-ink">
            <GraduationCap className="h-5 w-5" strokeWidth={1.7} />
          </span>
          <h2 data-sr="heading" className={`mt-5 ${H2}`}>
            The Nexera Training Academy
          </h2>
          <p data-sr className={BODY}>
            Energy storage needs skilled people, and India doesn&rsquo;t have enough of them yet. So we are building the Nexera Training
            Academy, a dedicated hands-on training centre for commercial and industrial battery storage, opening in Kalaburagi in 2027.
          </p>
          <p data-sr className="mt-4 max-w-measure text-body text-copy">
            Technicians and engineers from EPC companies will work on live systems and learn:
          </p>
          <ul data-sr className="mt-4 space-y-2 text-body text-copy">
            {ACADEMY.map((a) => (
              <li key={a} className="flex gap-3">
                <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-label" strokeWidth={2.4} />
                {a}
              </li>
            ))}
          </ul>
          <p data-sr className="mt-6 max-w-measure text-body text-copy">
            Nexera-certified installers deliver better projects, protect warranties, and give customers confidence.
          </p>
        </div>
      </section>

      <section className="bg-paper border-y border-line">
        <div className="container-site grid gap-12 py-section md:grid-cols-2">
          <div>
            <h2 data-sr="heading" className={H2}>
              Leadership
            </h2>
            <ul data-sr className="mt-8 grid gap-4 sm:grid-cols-2">
              {LEADERS.map((l) => (
                <li key={l.name} className="rounded-card border border-line bg-white p-6">
                  <p className="text-h4 font-semibold text-ink">{l.name}</p>
                  {l.role && <p className="mt-1 text-small text-copy">{l.role}</p>}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 data-sr="heading" className={H2}>
              Where we are
            </h2>
            <dl data-sr className="mt-8 space-y-5 text-small text-copy">
              <div>
                <dt className="text-h4 font-semibold text-ink">Bengaluru</dt>
                <dd className="mt-2">
                  <span className="block font-semibold text-ink">Head office</span>
                  {ADDRESS}
                  <span className="mt-2 block font-semibold text-ink">Branch office</span>
                  {BRANCH_ADDRESS}
                </dd>
              </div>
              <div>
                <dt className="text-h4 font-semibold text-ink">Kalaburagi</dt>
                <dd className="mt-2">Nexera Training Academy, opening 2027</dd>
              </div>
            </dl>
            <ArrowLink to="/where-we-operate" className="mt-6 min-h-11">
              Where we operate
            </ArrowLink>
          </div>
        </div>
      </section>

      {/* Work with us: the page's closing band (in place of the shared one, so the page ends on one ask). */}
      <section aria-labelledby="work-with-us" className="bg-deep-grid hero-ground text-white">
        <div className="container-site py-section">
          <h2 id="work-with-us" data-sr="heading" className="text-h2 font-semibold">
            Work with us
          </h2>
          <p data-sr className="mt-heading max-w-measure text-body text-paper/80">
            Whether you are an EPC company, a distributor or a business planning to add storage, we&rsquo;d like to hear from you.
          </p>
          <div data-sr className="mt-8 flex flex-wrap items-center gap-4">
            <MagneticButton to="/contact" arrow spotlight>
              Talk to our team
            </MagneticButton>
            <MagneticButton to="/become-a-partner" variant="outline" sweep>
              Become a partner
            </MagneticButton>
            <MagneticButton to="/service-training#training" variant="outline" sweep>
              Join the Academy
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
}
