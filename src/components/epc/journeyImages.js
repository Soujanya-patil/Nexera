// Partnership Journey stage photography: src/assets/journey/<stage>-<width>.webp (Vite fingerprints
// each file). All six are real technology-partner imagery from the TCL and Hithium material
// (Downloads/TCL_photos.zip, Hithium_photos.zip), exported with one shared grade — slightly muted,
// a touch more contrast, a faint deep-green cast — so they read as one set. The engineering drawing
// (design) is left ungraded.
//
// To swap a stage for new photography (e.g. generated in Higgsfield): export it over the SAME file
// names at the same widths (640 plus a ~1000–1200 px master), update its DIMENSIONS entry, and update
// that stage's alt/caption in content.js.
//
// Sources:
//   select      TCL/TCL_Digital_Power_Product_Brochure_EN_260730-000.png   TCL BlueArk range (cropped to the products)
//   design      Hithium/Hithium_C_I_261kwh_Cabinet_Introduction_20250502-052.png  engineering drawing
//   deploy      Hithium/Hithium_6.25MWh_Solution-327.png   site with an excavator still on it
//   commission  TCL/TCL_Digital_Power_Product_Brochure_EN_260730-052.png   cabinets open on a test floor
//   support     Hithium/Hithium_6.25MWh_Solution-341.png   large storage site beside transmission masts
//   scale       Hithium/Hithium_6.25MWh_Solution-351.png   large installation from above
const files = import.meta.glob("../../assets/journey/*.webp", { eager: true, query: "?url", import: "default" });

const DIMENSIONS = {
  select: [1400, 675],
  design: [1007, 544],
  deploy: [1231, 714],
  commission: [1018, 746],
  support: [1054, 609],
  scale: [1052, 611],
};

export function journeyImage(name) {
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
