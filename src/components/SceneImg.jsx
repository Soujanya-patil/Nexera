import { scene } from "../lib/scenes";

/** Responsive real-photo <img>: srcset from the exported widths, intrinsic size to prevent layout shift. */
export default function SceneImg({ name, alt = "", sizes = "100vw", eager = false, className = "", ...rest }) {
  const s = scene(name);
  return (
    <img
      src={s.src}
      srcSet={s.srcSet}
      sizes={sizes}
      width={s.width}
      height={s.height}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
      {...rest}
    />
  );
}
