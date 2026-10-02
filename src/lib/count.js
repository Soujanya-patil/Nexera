/**
 * "30–33%" -> counts up "30" then keeps "–33%"; "24×7" -> "24" then "×7"; "Quick" -> not countable.
 * A leading non-numeric part is kept as a prefix ("RMB 354+ billion", "US$64.3 billion", "~190,000",
 * "#231"), and thousands separators are kept ("114,597" counts as 114,597, written with commas).
 */
export function parseCount(value) {
  const m = value.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/s);
  if (!m) return null;
  const digits = m[2];
  return {
    prefix: m[1],
    target: parseFloat(digits.replace(/,/g, "")),
    decimals: digits.includes(".") ? digits.split(".")[1].length : 0,
    grouped: digits.includes(","),
    suffix: m[3],
  };
}

/** t in 0–1, eased out, so numbers settle rather than stop dead. */
export function formatCount(parsed, t) {
  const eased = 1 - Math.pow(1 - t, 3);
  const n = parsed.target * eased;
  const num = parsed.grouped
    ? n.toLocaleString("en-US", { minimumFractionDigits: parsed.decimals, maximumFractionDigits: parsed.decimals })
    : n.toFixed(parsed.decimals);
  return `${parsed.prefix ?? ""}${num}${parsed.suffix}`;
}
