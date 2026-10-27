/*
 * The NEXERA palette as hex values, for the few places that need a colour as data rather than a CSS
 * variable (a GSAP tween interpolating one colour into another). Everything else uses the CSS tokens
 * (index.css @theme: bg-*, text-*, or var(--color-*)). Keep these in step with index.css.
 */
export const PALETTE = {
  deepGrid: "#1C2C5C",
  forest: "#101827",
  signal: "#86E08A",
  link: "#1C2C5C",
  amber: "#F5B841",
  paper: "#F3F4F8",
  white: "#FFFFFF",
  ink: "#1C2C5C",
  copy: "#1C2C5C",
  muted: "#647B5C",
  ice: "#E6E9F1",
  line: "#E4E6EB",
};
