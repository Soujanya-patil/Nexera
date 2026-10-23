/*
 * Pre-build: fails if Tailwind's underscore syntax appears in a plain CSS value.
 *
 * Inside a Tailwind class name, underscores stand for spaces (shadow-[0_0_24px_color-mix(in_srgb,…)]).
 * Anywhere else — an inline style, an SVG attribute (stroke, fill), a JS string handed to a style or
 * a tween, a CSS file — the browser reads them literally, and a value with a var() in it is then thrown
 * away when styles are computed, so the glow, line or shadow silently doesn't paint. (This happened
 * once: 53 values across 27 files.)
 *
 * What is checked: the string literals in src/**\/*.js(x) and the lines of src/**\/*.css, index.html and
 * public/**\/*.{html,svg,css} — with every [...] span removed first, since inside brackets it is a
 * Tailwind arbitrary value, where underscores are right. A hit is either a colour space written with an
 * underscore (in_srgb, in_oklab …) or an underscore between CSS value tokens: after a number, a unit or
 * a closing parenthesis, and before a number, var(, a colour or a CSS function. JS comments are not
 * checked.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPACE = /\bin_(?:srgb(?:-linear)?|display-p3|oklab|oklch|lab|lch|hsl|hwb|xyz(?:-d50|-d65)?)\b/;
const GAP = /(?:\d(?:px|%|rem|em|vh|vw|svh|deg|ms|s)?|\))_(?:-?\.?\d|var\(|transparent\b|#[0-9a-fA-F]|(?:rgba?|hsla?|color-mix|calc|linear-gradient|radial-gradient)\()/;
const STRINGS = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*?(?:`|$)/g;

/** `text` with every [...] span (nested included) removed. */
function dropBrackets(text) {
  let out = "";
  let depth = 0;
  for (const c of text) {
    if (c === "[") depth++;
    else if (c === "]" && depth > 0) depth--;
    else if (depth === 0) out += c;
  }
  return out;
}

function walk(dir, exts, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, exts, files);
    else if (exts.test(f.name)) files.push(p);
  }
  return files;
}

const files = [
  ...walk(path.join(root, "src"), /\.(jsx?|css)$/),
  ...walk(path.join(root, "public"), /\.(html|svg|css)$/),
  path.join(root, "index.html"),
].filter((f) => fs.existsSync(f));

const hits = [];
for (const file of files) {
  const js = /\.jsx?$/.test(file);
  fs.readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      // JS: only string literals (the code around them, and comments, are not CSS).
      const parts = js ? (line.replace(/^\s*(\/\/|\*|\/\*).*$/, "").match(STRINGS) ?? []) : [line];
      for (const part of parts) {
        const text = dropBrackets(part);
        const m = text.match(SPACE) ?? text.match(GAP);
        if (m) {
          hits.push(`${path.relative(root, file).replaceAll("\\", "/")}:${i + 1}  "${m[0]}"  ${line.trim().slice(0, 120)}`);
          break;
        }
      }
    });
}

if (hits.length) {
  console.error(`check-css-values: ${hits.length} plain CSS value(s) with Tailwind underscore syntax — write them with spaces (color-mix(in srgb, var(--accent) 16%, transparent)), or move them into a class name:`);
  for (const h of hits) console.error("  " + h);
  process.exit(1);
}
console.log(`check-css-values: ${files.length} files, no Tailwind underscore syntax outside class names`);
