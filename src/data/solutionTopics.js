/*
 * The final CTA checklists of the three Solutions pages ("…we'll help you determine:"), shared by the
 * pages (as selectable chips) and the contact page, which turns /contact?topics=<slugs> back into these
 * labels to pre-fill the message. Copy is from the director-approved Solutions content.
 */
export const CTA_TOPICS = {
  residential: [
    "Recommended solar capacity",
    "Battery capacity",
    "Backup loads",
    "Expected solar self-consumption",
    "Available government subsidy",
    "System configuration",
    "Expansion possibilities",
  ],
  ci: [
    "Recommended BESS capacity",
    "Solar + storage configuration",
    "Peak-demand reduction potential",
    "Backup capability",
    "Expected savings",
    "System expansion options",
    "Project economics",
  ],
  utility: [
    "Project feasibility support",
    "Recommended system configuration",
    "Technical & commercial evaluation",
    "Grid integration guidance",
    "Local support in India",
    "End-to-end project collaboration",
  ],
};

/** "Solar + storage configuration" → "solar-storage-configuration". */
export const topicSlug = (label) =>
  label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** The labels for a comma-separated `topics` value, in checklist order (unknown slugs are ignored). */
export function topicLabels(segment, topics) {
  const wanted = new Set(String(topics ?? "").split(",").filter(Boolean));
  const lists = CTA_TOPICS[segment] ? [CTA_TOPICS[segment]] : Object.values(CTA_TOPICS);
  return [...new Set(lists.flat().filter((t) => wanted.has(topicSlug(t))))];
}
