/*
 * "First load": the page as it was opened — a direct visit, a reload, or the build-time pre-render —
 * as opposed to a page reached by client-side navigation. On a first load the first screen is
 * already painted from the pre-rendered HTML before any JavaScript runs, so nothing visible may be
 * hidden for an entrance (hero copy, LCP images and anything already on screen render visible; only
 * content below the fold waits for its reveal). Client-side navigations keep the full entrances.
 *
 * Layout marks the first navigation while it renders (before the new page renders), so a page reads
 * the right answer in its very first render.
 */
let navigated = false;

/** True until the first client-side navigation (always true while pre-rendering). */
export const isFirstLoad = () => !navigated;

export const markNavigated = () => {
  navigated = true;
};
