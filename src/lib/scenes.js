// Every photo is exported to src/assets/scenes/<name>-<width>.webp (real partner photography,
// cropped and resized from the original brochure files). Vite fingerprints each file.
const files = import.meta.glob("../assets/scenes/*.webp", { eager: true, query: "?url", import: "default" });

const DIMENSIONS = {
  "hero-cabinet": [811, 1196],
  "energy-night": [3166, 1784],
  "storage-tcl": [2160, 1699],
  "hithium-block": [733, 1366],
  "hithium-container": [1790, 974],
  "res-house": [1500, 966],
  "ci-industrial": [1895, 1216],
  "utility-yard": [2001, 1110],
  "tech-cabinet": [3840, 2160],
  "partner-tcl": [3585, 4894],
  "partner-hithium": [1342, 1650],
  "cta-desert": [4399, 2476],
};

export function scene(name) {
  const variants = Object.entries(files)
    .filter(([path]) => path.includes(`/${name}-`))
    .map(([path, url]) => ({ width: Number(path.match(/-(\d+)\.webp$/)[1]), url }))
    .sort((a, b) => a.width - b.width);
  const [width, height] = DIMENSIONS[name];
  return {
    src: variants[variants.length - 1].url,
    srcSet: variants.map((v) => `${v.url} ${v.width}w`).join(", "),
    width,
    height,
  };
}
