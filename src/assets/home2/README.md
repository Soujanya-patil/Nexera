# Home v2 media (drop-in)

Put the art-directed files here with exactly these names, then run `npm run build`.
`scripts/home2-media.mjs` writes the web versions to `web/` (WebP sizes, H.264 1080p/720p,
posters, manifest.json) and /home-v2 uses them. No code changes are needed. Anything missing
keeps its code-made visual.

| File | Used for |
| --- | --- |
| `hero-blueprint.mp4` | Hero, full-bleed (poster: first frame) |
| `hero-blueprint-start.png` | Hero poster (preferred over the first frame) |
| `hero-blueprint-end.png` | Hero still for reduced motion / Save-Data (the lit drawing) |
| `why-dusk.png` | "Why NEXERA exists" background |
| `bess-core.png` | BESS cross, centre |
| `bess-core.mp4` | BESS cross, centre loop (optional, desktop) |
| `arm-solar.png`, `arm-industry.png`, `arm-commercial.png`, `arm-utility.png` | BESS cross nodes |
| `journey-road.png` | Journey background |
| `cta-tomorrow.png` | Final CTA background |

Images can be .png, .jpg or .webp; videos .mp4, .mov or .webm. Needs ffmpeg on the machine
that builds (commit the generated `web/` folder so the deploy build has it).
