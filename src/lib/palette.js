/*
 * The NEXERA palette as hex values, for the few places that need a colour as data rather than a CSS
 * variable (a GSAP tween interpolating one colour into another). Everything else uses the CSS tokens
 * (index.css @theme: bg-*, text-*, or var(--color-*)). Keep these in step with index.css.
 */
export const PALETTE = {
  deepGrid: "#071B14",
  forest: "#103D2B",
  signal: "#8EF29A",
  link: "#1F7A4D",
  amber: "#F5B841",
  paper: "#F5F7F2",
  white: "#FFFFFF",
  ink: "#202D26",
  copy: "#3A4A44",
  muted: "#5C6B65",
  ice: "#E8F1EC",
  line: "#E1E7E3",
};
