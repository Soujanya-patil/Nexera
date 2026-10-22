/*
 * The NEXERA palette as hex values, for the few places that need a colour as data rather than a CSS
 * variable (a GSAP tween interpolating one colour into another). Everything else uses the CSS tokens
 * (index.css @theme: bg-*, text-*, or var(--color-*)). Keep these in step with index.css.
 */
export const PALETTE = {
  deepGrid: "#06110E",
  forest: "#0B2A22",
  signal: "#86E08A",
  link: "#1F7A4D",
  amber: "#F5B841",
  paper: "#F5F7F4",
  white: "#FFFFFF",
  ink: "#0E1A16",
  copy: "#3A4A44",
  muted: "#5C6B65",
  ice: "#E8F1EC",
  line: "#E1E7E3",
};
