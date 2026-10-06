import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SceneImg from "../SceneImg";
import { usePanels } from "../../lib/panels";
import { useScrollReveal } from "../../lib/scrollReveal";
import { useRouteTransition } from "../../lib/viewTransition";
import { SCALE_CARDS } from "./data";
import { SectionHead } from "./shared";

/**
 * One segment card: a photo in a dark gradient frame, the title and text at the bottom, a round
 * arrow. Desktop (mouse, motion allowed): one of the expanding panels (lib/panels.js — clip-path and
 * transform, nothing in the layout moves), the photo drifts slowly in (Ken Burns, .scale-card in
 * index.css) and the arrow turns to point up-right. Opening it morphs the photo into the segment
 * page's hero (View Transition, as from the Solutions hub).
 */
function ScaleCard({ s }) {
  const open = useRouteTransition(s.page, `[data-vt-hero="${s.id}"]`, { segment: s.id });
  return (
    <Link
      to={s.page}
      onClick={open}
      data-vt-card={s.id}
      className="scale-card group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-night text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal md:aspect-[4/5]"
    >
      <div data-vt-img className="absolute inset-0 overflow-hidden">
        <SceneImg
          name={s.img}
          alt={s.alt}
          sizes="(min-width: 1024px) 45vw, (min-width: 768px) 33vw, 100vw"
          className="scale-photo absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/0" />
      <span aria-hidden="true" className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
      <div
        data-panel-text
        className="relative flex items-end gap-4 rounded-2xl p-6 group-focus-visible:outline-2 group-focus-visible:-outline-offset-4 group-focus-visible:outline-signal md:p-7"
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-2xl font-semibold transition-colors duration-300 group-hover:text-signal">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ice/85">{s.text}</p>
        </div>
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/40 transition-[background-color,border-color,color] duration-300 group-hover:border-signal group-hover:bg-signal group-hover:text-forest group-focus-visible:border-signal group-focus-visible:bg-signal group-focus-visible:text-forest"
        >
          <ArrowRight className="h-5 w-5 transition-transform duration-300 ease-out group-hover:-rotate-45 group-focus-visible:-rotate-45 motion-reduce:transition-none" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

/** Energy Storage for Every Scale (light): the three segment cards. */
export default function Scale() {
  const grid = useRef(null);
  const reveal = useScrollReveal(grid, { stagger: 0.1 });
  usePanels(grid);
  return (
    <section aria-labelledby="home2-scale" className="bg-ice py-20 lg:py-28">
      <SectionHead id="home2-scale" eyebrow="Real impact across industries" title="Energy Storage for Every Scale" className="container-site" />
      <ul ref={grid} data-sr-state={reveal} className="seg-panels container-site mt-12 grid gap-5 md:grid-cols-3 lg:mt-14">
        {SCALE_CARDS.map((s) => (
          <li key={s.id} data-sr>
            <ScaleCard s={s} />
          </li>
        ))}
      </ul>
    </section>
  );
}
