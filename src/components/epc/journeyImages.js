// Partnership Journey stage photos: src/assets/journey/<stage>-<width>.<avif|webp|jpg> (Vite
// fingerprints each file), exported at 600 / 900 / 1200 px wide (4:3) from the approved 1600 x 1200
// originals (nexera-reference/NEXERA_journey_6_photos/NEXERA_journey_<nn>_<stage>_1600x1200.jpg).
// Each stage's alt text and crop focus are in content.js (JOURNEY).
//
// To swap a stage: export the new 1600 x 1200 photo over the same file names at the same widths, and
// update that stage's alt (and focus, if the subject moves) in content.js.
const files = import.meta.glob("../../assets/journey/*.{avif,webp,jpg}", { eager: true, query: "?url", import: "default" });
const WIDTHS = [600, 900, 1200];
const url = (name, w, ext) => files[`../../assets/journey/${name}-${w}.${ext}`];
const set = (name, ext) => WIDTHS.map((w) => `${url(name, w, ext)} ${w}w`).join(", ");

/** A stage photo's sources for a <picture> (AVIF → WebP → JPG) and its intrinsic size. */
export function journeyImage(name) {
  return { avif: set(name, "avif"), webp: set(name, "webp"), srcSet: set(name, "jpg"), src: url(name, 900, "jpg"), width: 1200, height: 900 };
}
