import Reveal from "./Reveal";
import CountUp from "./CountUp";

const stats = [
  { value: "30–33%", label: "Projected CAGR" },
  { value: "24×7", label: "Availability" },
  { value: "Quick", label: "Response times" },
];

export default function StatBar() {
  return (
    <section className="bg-ice border-b border-line">
      <Reveal as="div" className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-3 divide-x divide-line">
        {stats.map((stat) => (
          <div key={stat.label} className="px-6 first:pl-0 text-center">
            <p className="font-serif text-3xl md:text-4xl font-semibold text-ink">
              <CountUp value={stat.value} />
            </p>
            <p className="mt-1 text-sm text-graphite">{stat.label}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
