// Every photo is exported to src/assets/scenes/<name>-<width>.webp (real partner photography,
// cropped and resized from the original brochure files). Vite fingerprints each file.
const files = import.meta.glob("../assets/scenes/*.webp", { eager: true, query: "?url", import: "default" });

// TODO(india-imagery): these scene photos show non-Indian settings or signage. To swap one, re-export
// the new photo over the SAME file names (<name>-<width>.webp, same widths) in src/assets/scenes/,
// update its DIMENSIONS entry if the aspect ratio changes, and update the alt text where it is used.
// Search the codebase for "TODO(india-imagery)" for the usage sites. Originals are in Downloads/TCL_photos.zip
// and Hithium_photos.zip.
//   res-house        res-house-{800,1500}.webp          CGI render of a generic house. TCL/...Brochure_EN_260730-032.png
//   ci-industrial    ci-industrial-{800,1500,1895}.webp generic industrial site, review. TCL/...Brochure_EN_260730-022.png
//   utility-yard     utility-yard-{800,1280,1920}.webp  Chinese-language signage on a plant gantry. Hithium/Hithium_6.25MWh_Solution-310.png
//   cta-desert       cta-desert-{1280,1920}.webp        desert render from the EU brochure. Hithium/Hithium_DC_Block_1022kWh_EU_Products_20260525-126.png
//   energy-night     energy-night-{1280,1920}.webp      cityscape not identified as Indian. Hithium/Hithium_DC_Block_1022kWh_EU_Products_20260525-000.png
//   partner-hithium  partner-hithium-{640,1000}.webp    Hithium HQ, Chinese-character signage (partner HQ, may be intentional). Hithium/Hithium_C_I_261kwh_Cabinet_Introduction_20250502-000.png
//   partner-tcl      partner-tcl-{640,1000}.webp        TCL HQ tower, China (partner HQ, may be intentional). TCL/...Brochure_EN_260730-002.png
const DIMENSIONS = {
  "hero-cabinet": [811, 1196],
  "energy-night": [3166, 1784], // TODO(india-imagery)
  "storage-tcl": [2160, 1699],
  "hithium-block": [733, 1366],
  "hithium-container": [1790, 974],
  "res-house": [1500, 966], // TODO(india-imagery)
  "ci-industrial": [1895, 1216], // TODO(india-imagery): review
  "utility-yard": [2001, 1110], // TODO(india-imagery)
  "tech-cabinet": [3840, 2160],
  "partner-tcl": [3585, 4894], // TODO(india-imagery): partner HQ
  "partner-hithium": [1342, 1650], // TODO(india-imagery): partner HQ
  "cta-desert": [4399, 2476], // TODO(india-imagery)
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
