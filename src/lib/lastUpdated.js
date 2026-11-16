/* global __COMMIT_DATE__ */
// The date of the commit the site was built from (vite.config.js: `git log -1 --format=%cs`, or the build
// date without git history), for the legal pages' "Last updated" line.
const ISO = typeof __COMMIT_DATE__ !== "undefined" ? __COMMIT_DATE__ : new Date().toISOString().slice(0, 10);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-11-12" → "12 November 2026". */
export const LAST_UPDATED = (() => {
  const [y, m, d] = ISO.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
})();
export const LAST_UPDATED_ISO = ISO;
