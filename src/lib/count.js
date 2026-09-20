/** "30–33%" -> counts up "30" then keeps "–33%"; "24×7" -> "24" then "×7"; "Quick" -> not countable. */
export function parseCount(value) {
  const m = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  return {
    target: parseFloat(m[1]),
    decimals: m[1].includes(".") ? m[1].split(".")[1].length : 0,
    suffix: m[2],
  };
}

/** t in 0–1, eased out, so numbers settle rather than stop dead. */
export function formatCount(parsed, t) {
  const eased = 1 - Math.pow(1 - t, 3);
  return `${(parsed.target * eased).toFixed(parsed.decimals)}${parsed.suffix}`;
}
