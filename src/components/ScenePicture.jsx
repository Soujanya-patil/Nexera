// The three approved dusk scenes (Residential, C&I, Utility), each exported at 800 (phones) / 1200 /
// 1600 / 2400 px as AVIF, WebP and JPG (src/assets/solutions-header). Shared by the /solutions header
// and the three segment heroes, so each file ships once.
const files = import.meta.glob("../assets/solutions-header/*.{avif,webp,jpg}", { eager: true, query: "?url", import: "default" });
const WIDTHS = [800, 1200, 1600, 2400];
const SIZE = { residential: [2400, 1351], ci: [2400, 1349], utility: [2400, 1351] };
const url = (name, w, ext) => files[`../assets/solutions-header/${name}-${w}.${ext}`];
const srcSet = (name, ext) => WIDTHS.map((w) => `${url(name, w, ext)} ${w}w`).join(", ");

/** A scene as a <picture> (AVIF → WebP → JPG), with its intrinsic size set. Other props go to the <img>. */
export default function ScenePicture({ name, sizes, imgRef, ...img }) {
  const [width, height] = SIZE[name];
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(name, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, "webp")} sizes={sizes} />
      <img ref={imgRef} src={url(name, 1600, "jpg")} srcSet={srcSet(name, "jpg")} sizes={sizes} width={width} height={height} {...img} />
    </picture>
  );
}
