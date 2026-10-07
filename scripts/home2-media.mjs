/*
 * Home v2 media pipeline (runs before `vite build`).
 *
 * Drop the art-directed files into src/assets/home2/ with their exact names (README.md there lists
 * them) and build. For every file present this writes web versions to src/assets/home2/web/:
 *   - images  → WebP at 640 / 1280 / 1920 px wide (+ 2560 for the 21:9 backdrops), never upscaled;
 *   - videos  → H.264 MP4, muted, faststart: 1080p ≤ 2.5 MB (desktop) and 720p ≤ 700 KB (phone),
 *               plus a WebP poster from the first frame;
 * and a manifest.json (sizes, dimensions, a hash of each source). The page reads only web/ — the
 * originals are never bundled — and shows its code-made visual for anything missing. Unchanged
 * sources (same hash) are skipped. Needs ffmpeg/ffprobe; without them it leaves web/ as it is.
 */
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = process.env.HOME2_MEDIA_DIR ?? path.join(root, "src/assets/home2");
const out = path.join(dir, "web");

const WIDE = [640, 1280, 1920, 2560];
const STD = [640, 1280, 1920];
const SMALL = [640, 1280];
/** Every slot on Home v2: name → kind and output widths. */
const SLOTS = {
  "hero-blueprint": { kind: "video", poster: STD, desktopOnly: false },
  "hero-blueprint-start": { kind: "image", widths: STD },
  "hero-blueprint-end": { kind: "image", widths: STD },
  "why-dusk": { kind: "image", widths: WIDE },
  "bess-core": { kind: "image", widths: SMALL },
  "bess-core-loop": { kind: "video", source: "bess-core", poster: SMALL },
  "arm-solar": { kind: "image", widths: SMALL },
  "arm-industry": { kind: "image", widths: SMALL },
  "arm-commercial": { kind: "image", widths: SMALL },
  "arm-utility": { kind: "image", widths: SMALL },
  "journey-road": { kind: "image", widths: WIDE },
  "cta-tomorrow": { kind: "image", widths: WIDE },
};
const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"];
const VIDEO_EXT = [".mp4", ".mov", ".webm"];
const BUDGET = { 1080: 2.5e6, 720: 7e5 };

const run = (cmd, args) => spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 26 });
const has = (cmd) => run(cmd, ["-version"]).status === 0;
const kb = (n) => `${Math.round(n / 1024)} KB`;

const sources = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
const find = (name, exts) => {
  const f = sources.find((s) => exts.includes(path.extname(s).toLowerCase()) && path.basename(s, path.extname(s)) === name);
  return f && path.join(dir, f);
};
const wanted = Object.entries(SLOTS)
  .map(([name, s]) => [name, s, find(s.source ?? name, s.kind === "video" ? VIDEO_EXT : IMAGE_EXT)])
  .filter(([, , src]) => src);

const manifestPath = path.join(out, "manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

// A source that was removed: delete exactly the web files made from it, and its manifest entry.
const outputs = (name, m) =>
  m.kind === "image" ? m.widths.map((w) => `${name}-${w}.webp`) : [`${name}-1080.mp4`, `${name}-720.mp4`, ...m.poster.map((w) => `${name}-poster-${w}.webp`)];
for (const [name, m] of Object.entries(manifest)) {
  if (wanted.some(([n]) => n === name)) continue;
  for (const f of outputs(name, m)) fs.rmSync(path.join(out, f), { force: true });
  delete manifest[name];
  console.log(`home2-media: ${name} removed (no source) → its web files deleted`);
}
if (!wanted.length) {
  if (fs.existsSync(manifestPath)) {
    fs.rmSync(manifestPath);
    if (!fs.readdirSync(out).length) fs.rmdirSync(out);
  }
  console.log("home2-media: no Home v2 media in src/assets/home2/ yet; the page uses its code-made visuals.");
  process.exit(0);
}
if (!has("ffmpeg") || !has("ffprobe")) {
  console.warn("home2-media: ffmpeg/ffprobe not found; keeping src/assets/home2/web/ as it is.");
  process.exit(0);
}
fs.mkdirSync(out, { recursive: true });

const probe = (file) => {
  const r = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", file]);
  const j = JSON.parse(r.stdout || "{}");
  return { width: j.streams?.[0]?.width, height: j.streams?.[0]?.height, duration: Number(j.format?.duration) || 0 };
};
const ff = (args) => {
  const r = run("ffmpeg", ["-v", "error", "-y", ...args]);
  if (r.status !== 0) throw new Error(r.stderr);
};
/** WebP at each width ≤ the source's (at least the smallest); returns the widths written. */
const webp = (input, name, widths, srcWidth, extra = []) => {
  const use = widths.filter((w) => w <= srcWidth);
  if (!use.length) use.push(Math.min(widths[0], srcWidth));
  for (const w of use) ff([...extra, "-i", input, "-frames:v", "1", "-vf", `scale=${w}:-2:flags=lanczos`, "-c:v", "libwebp", "-quality", "80", path.join(out, `${name}-${w}.webp`)]);
  return use;
};
const encode = (input, file, height, duration) => {
  // Target bitrate from the size budget; one retry at 80 % if it lands over.
  for (const k of [0.9, 0.72, 0.55]) {
    const kbps = Math.max(150, Math.floor(((BUDGET[height] * 8) / Math.max(duration, 1) / 1000) * k));
    ff(["-i", input, "-an", "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p", "-vf", `scale=-2:${height}:flags=lanczos`,
      "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 1.3)}k`, "-bufsize", `${kbps * 2}k`, "-movflags", "+faststart", file]);
    if (fs.statSync(file).size <= BUDGET[height]) return;
  }
};

const hash = (file) => crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex");
for (const [name, slot, src] of wanted) {
  const h = hash(src);
  if (manifest[name]?.hash === h) continue;
  const info = probe(src);
  if (slot.kind === "image") {
    const widths = webp(src, name, slot.widths, info.width);
    manifest[name] = { kind: "image", hash: h, width: info.width, height: info.height, widths };
  } else {
    for (const height of [1080, 720]) encode(src, path.join(out, `${name}-${height}.mp4`), height, info.duration);
    const poster = webp(src, `${name}-poster`, slot.poster, info.width, ["-ss", "0"]);
    manifest[name] = { kind: "video", source: slot.source ?? name, hash: h, width: info.width, height: info.height, duration: info.duration, poster };
  }
  console.log(`home2-media: ${path.basename(src)} → web/ (${name})`);
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

// Report the compressed sizes.
const files = fs.readdirSync(out).filter((f) => f !== "manifest.json");
for (const [name] of wanted)
  console.log(
    `  ${name.padEnd(22)} ` +
      files
        .filter((f) => f.startsWith(name + "-") && !Object.keys(SLOTS).some((o) => o !== name && o.startsWith(name + "-") && f.startsWith(o + "-")))
        .map((f) => `${f.slice(name.length + 1)} ${kb(fs.statSync(path.join(out, f)).size)}`)
        .join(" · ")
  );
