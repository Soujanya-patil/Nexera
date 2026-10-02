import { useEffect, useState } from "react";

/**
 * Scroll-scrubbed footage helpers, shared by the Home hero's scroll story and the C&I page's
 * "Inside the cabinet" section. The footage is nexera-hero-cabinet-scrub.mp4 (a keyframe every 6
 * frames, so a seek decodes at most 6 frames).
 */

/**
 * The footage fetched whole into memory and returned as a blob: URL, so every scroll seek is a local
 * seek that never depends on the server honouring HTTP Range requests (or on the browser's media
 * cache keeping the file). `null` until it is ready (show the poster meanwhile); if the fetch fails,
 * the normal URL. The object URL is revoked when `enabled` turns off or the component unmounts.
 */
export function useBlobUrl(src, enabled) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    let blobUrl = null;
    let cancelled = false;
    fetch(src)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((blob) => {
        if (cancelled) return;
        blobUrl = URL.createObjectURL(blob);
        setUrl(blobUrl);
      })
      .catch(() => !cancelled && setUrl(src));
    return () => {
      cancelled = true;
      setUrl(null);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [src, enabled]);
  return url;
}

/**
 * Seeks `video` toward the latest requested time with one seek in flight at a time (newer targets
 * coalesce into the next one). Self-healing: if `seeked` hasn't arrived within `timeoutMs`, or the
 * media errors / is emptied (e.g. the source switches to the blob), the gate reopens — a lost event
 * can never freeze the scrub. `seek(t)` requests a time (clamped to the duration); `destroy()`
 * removes the listeners.
 */
export function createSeekGate(video, timeoutMs = 250) {
  let want = 0;
  let seeking = false;
  let watchdog = 0;
  const release = () => {
    seeking = false;
    clearTimeout(watchdog);
  };
  const apply = () => {
    if (seeking || video.readyState < 1) return;
    const t = Math.min(want, video.duration - 0.001);
    if (Math.abs(video.currentTime - t) < 0.02) return;
    seeking = true;
    clearTimeout(watchdog);
    watchdog = setTimeout(() => {
      release();
      apply();
    }, timeoutMs);
    video.currentTime = t;
  };
  const onSeeked = () => {
    release();
    apply();
  };
  video.addEventListener("seeked", onSeeked);
  video.addEventListener("loadedmetadata", apply);
  video.addEventListener("error", release);
  video.addEventListener("emptied", release);
  return {
    seek(t) {
      want = t;
      apply();
    },
    destroy() {
      clearTimeout(watchdog);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadedmetadata", apply);
      video.removeEventListener("error", release);
      video.removeEventListener("emptied", release);
    },
  };
}
