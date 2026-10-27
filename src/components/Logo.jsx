import logo from "../assets/brand/nexera-logo.svg";

/**
 * The official NEXERA logo: navy (#182F58) letters with the lime (#AAC837) bolt in the X, used as is on
 * light grounds only (there is no reversed version). An <img> with the artwork's own aspect (viewBox
 * 1984 × 596) as width/height, so its box is reserved before it loads (no layout shift); the caller
 * sets the height (e.g. h-9) and the width follows. `alt=""` (and hidden from assistive tech) where the
 * surrounding link already names it.
 */
export default function Logo({ alt = "NEXERA Powertech", className = "" }) {
  return (
    <img
      src={logo}
      alt={alt}
      aria-hidden={alt === "" || undefined}
      width={1984}
      height={596}
      decoding="async"
      className={`block w-auto ${className}`}
    />
  );
}
