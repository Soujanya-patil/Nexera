/**
 * Static edge blend for the C&I cabinet footage: the footage's own ground (FOOTAGE_EDGE) behind it,
 * and this overlay — the section's colour at the edges, clear in the middle — over it, so the clip
 * melts into the dark-green section instead of sitting in a visible box. A plain gradient (no mask on
 * the video, which is slow to composite while scrubbing). Goes above the video, below the labels.
 */
export const FOOTAGE_EDGE = "#161b1e";

export default function StageBlend() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background: [
          // The lighter floor along the clip's bottom edge.
          "linear-gradient(to top, var(--color-night) 0%, transparent 16%)",
          "radial-gradient(closest-side, transparent 62%, color-mix(in srgb, var(--color-night) 70%, transparent) 86%, var(--color-night) 100%)",
          "linear-gradient(to right, var(--color-night), transparent 9%, transparent 91%, var(--color-night))",
          "linear-gradient(to bottom, var(--color-night), transparent 8%)",
        ].join(", "),
      }}
    />
  );
}
