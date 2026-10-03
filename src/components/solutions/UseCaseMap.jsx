import { lazy, Suspense, useRef, useState } from "react";
import SceneImg from "../SceneImg";
import { NearViewport } from "./Interactive";
import { useScrollReveal } from "../../lib/scrollReveal";

const UseCaseHotspots = lazy(() => import("./UseCaseHotspots"));

/**
 * Utility "Powering Multiple Use Cases" as an interactive map: the CLOU illustration of solar, wind,
 * storage, grid and city, with a pulsing hotspot per use case (`at`: [x%, y%] on the illustration).
 * The use cases themselves are a normal list (h3 + text) rendered here, beside the map on desktop and
 * below it on phones; hovering or focusing a list item highlights its hotspot, and a hotspot
 * highlights its list item. The hotspot layer is its own chunk, loaded when the map is near.
 */
export default function UseCaseMap({ items }) {
  const [active, setActive] = useState(null);
  const list = useRef(null);
  const reveal = useScrollReveal(list);
  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
      <figure>
        <div className="relative aspect-[2/1] rounded-2xl bg-ice ring-1 ring-line">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <SceneImg
              name="utility-grid"
              sizes="(min-width: 1024px) 58vw, 100vw"
              alt="Illustration of solar, wind, battery energy storage, the grid and a city connected in one power system"
              className="h-full w-full object-cover"
            />
          </div>
          <NearViewport className="absolute inset-0">
            <Suspense fallback={null}>
              <UseCaseHotspots items={items} active={active} setActive={setActive} />
            </Suspense>
          </NearViewport>
        </div>
        <figcaption className="mt-3 text-xs text-graphite">Illustration courtesy of CLOU.</figcaption>
      </figure>
      <ul ref={list} data-sr-state={reveal} className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-1">
        {items.map(({ icon: Icon, title, text }, i) => (
          <li
            data-sr
            key={title}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            tabIndex={-1}
            className={`flex gap-3.5 rounded-xl p-3 transition-colors duration-300 ${active === i ? "bg-signal/15" : ""}`}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                active === i ? "bg-signal text-forest" : "bg-ice text-forest"
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div>
              <h3 className="font-semibold text-ink">{title}</h3>
              <p className="mt-0.5 text-sm leading-relaxed text-graphite">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
