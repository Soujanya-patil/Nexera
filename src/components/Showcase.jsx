import { Link } from "react-router-dom";
import Reveal from "./Reveal";

const segments = [
  {
    name: "Residential BESS",
    copy: "Backup power and load-shifting for Indian homes, powered by TCL BlueArk.",
    icon: (
      <path
        d="M4 11.5 12 5l8 6.5M6.5 10v8.5h11V10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    name: "Commercial & Industrial",
    copy: "Cut demand charges, add resilience, own your load curve.",
    icon: (
      <path
        d="M5 20V7l5-3 5 3v13M15 20v-6l4-2v8M9 10h1M9 13h1M9 16h1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    name: "Utility-Scale",
    copy: "Grid-scale storage, delivered and commissioned end to end.",
    icon: (
      <path
        d="M12 3v4M12 17v4M5 12H3M21 12h-2M6.3 6.3 5 5M19 5l-1.3 1.3M6.3 17.7 5 19M19 19l-1.3-1.3M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function Showcase() {
  return (
    <section className="bg-paper">
      <Reveal as="div" className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-5 gap-8">
        {/* Featured, larger — the real conversion goal, deliberately not sized like the others */}
        <Link
          to="/become-a-partner"
          className="group relative md:col-span-2 flex flex-col justify-between overflow-hidden rounded-lg bg-ink text-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-16px_rgba(0,167,142,0.35)]"
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(120% 100% at 0% 0%, color-mix(in srgb, var(--color-signal) 22%, transparent), transparent 60%)",
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <h3 className="font-serif text-2xl font-semibold leading-snug transition-transform duration-300 group-hover:translate-x-0.5">
              Run an EPC business?
            </h3>
            <p className="mt-3 text-ice/75 leading-relaxed">
              Add battery storage without building a supply chain from scratch.
              Authorized access, training, and after-sales support included.
            </p>
          </div>
          <span className="relative mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-signal">
            Apply to Become a Distributor
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path d="M3 8h9M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>

        {/* Three segments — quieter, equal weight to each other, secondary to the featured block */}
        <div className="md:col-span-3 grid sm:grid-cols-3 gap-6">
          {segments.map((seg) => (
            <Link
              key={seg.name}
              to="/solutions"
              className="group relative flex flex-col rounded-lg border border-line bg-white/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-signal/50 hover:shadow-[0_18px_40px_-18px_rgba(0,167,142,0.4)]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-ice text-steel transition-transform duration-300 group-hover:scale-110 group-hover:text-signal">
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  {seg.icon}
                </svg>
              </span>
              <h4 className="mt-4 font-serif text-lg font-semibold text-ink transition-transform duration-300 group-hover:translate-x-0.5">
                {seg.name}
              </h4>
              <p className="mt-2 text-sm text-graphite leading-relaxed">
                {seg.copy}
              </p>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
