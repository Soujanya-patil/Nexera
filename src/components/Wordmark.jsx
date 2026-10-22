/**
 * The single source of truth for the NEXERA wordmark — reused in Nav, the CabinetAnatomy opening
 * overlay, and Footer, so the brand mark never drifts between plain text in one place and styled
 * text in another. Code-built (no rasterized image), so it stays crisp at every size.
 *
 * Font size is controlled by the caller via `className` (e.g. `text-lg`, `text-3xl`); "Power Tech"
 * scales proportionally off that via an em-relative size instead of a second fixed size.
 *
 * The X keeps the logo's own green (#90D988, as in the favicon), not the palette's signal token: the
 * logo and favicon are unchanged until the new logo replaces both.
 */
export default function Wordmark({ className = "" }) {
  return (
    <span className={`inline-flex flex-col leading-[0.95] ${className}`}>
      <span className="font-sans font-semibold uppercase tracking-tight">
        NE<span className="text-[#90D988]">X</span>ERA
      </span>
      <span className="mt-1 font-sans font-normal uppercase tracking-[0.3em] text-[0.4em] text-current/70">
        Power Tech
      </span>
    </span>
  );
}
