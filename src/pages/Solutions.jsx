import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const solutions = [
  {
    id: "residential",
    name: "Residential BESS",
    headline: "Home Battery Storage — Powered by TCL BlueArk",
    copy: "Backup power, load-shifting, and EV-ready storage for Indian homes.",
    points: ["Backup during outages", "Load-shifting to cut evening costs", "EV-ready configurations"],
  },
  {
    id: "ci",
    name: "Commercial & Industrial (C&I) BESS",
    headline: "C&I Battery Storage for Bangalore & South India",
    copy: "Cut demand charges. Add resilience. Own your load curve.",
    points: ["Peak shaving", "Demand charge reduction", "Backup for critical loads", "Pairs with rooftop solar"],
  },
  {
    id: "utility",
    name: "Utility-Scale BESS",
    headline: "Grid-Scale Storage, Delivered and Commissioned",
    copy: "Hithium 5MWh/6.25MWh DC blocks for grid balancing and renewable firming.",
    points: ["Grid balancing", "Renewable firming", "DISCOM-scale project support"],
  },
];

export default function Solutions() {
  return (
    <div>
      <PageHeader
        eyebrow="Solutions"
        title="Storage built for how you'll actually use it"
        subtitle="Three segments, one supply chain — residential, commercial & industrial, and utility-scale."
      />

      {solutions.map((sol, i) => (
        <section
          key={sol.id}
          id={sol.id}
          className={i % 2 === 0 ? "bg-paper" : "bg-ice"}
        >
          <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2">
              <p className="text-sm text-graphite">{sol.name}</p>
              <h2 className="mt-2 font-sans text-2xl font-semibold text-ink leading-snug">
                {sol.headline}
              </h2>
              <p className="mt-3 text-graphite leading-relaxed">{sol.copy}</p>
              <Link
                to="/become-a-partner"
                className="mt-6 inline-flex text-sm font-medium text-steel hover:text-steel/80"
              >
                Become a Partner
              </Link>
            </div>
            <div className="md:col-span-3">
              <ul className="grid sm:grid-cols-2 gap-4">
                {sol.points.map((p) => (
                  <li
                    key={p}
                    className="rounded-lg border border-line bg-white p-4 text-sm text-ink"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
