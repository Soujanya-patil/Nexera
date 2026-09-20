import { useEffect, useRef, useState } from "react";
import SceneImg from "./SceneImg";

/**
 * Mount point for a real 3D cabinet model. No model asset exists in this project yet, so today
 * this renders only the real product photo (`poster`). It is fully wired so a model can be dropped in:
 *
 *   <ModelStage poster="hero-cabinet" modelSrc="/models/cabinet.glb" renderer={loadThreeRenderer} progress={ref} />
 *
 *   renderer(container, { src, progress }) -> Promise<{ update(p: number), dispose() }>
 *     - appends its own <canvas> to `container` (absolutely positioned, inset-0)
 *     - update(p) is called once per frame while on screen, p = the owning scene's scroll progress (0–1)
 *   `progress` is a { current } ref that the scene's ScrollTrigger writes; the renderer never touches scroll.
 *
 * States (data-model-state): "poster" (no model), "loading" (photo stays visible), "ready" (canvas
 * fades over the photo), "error" (photo stays). Model + renderer are only requested when `enabled`
 * (cinematic mode), so phones and reduced-motion users only ever load the photo.
 */
export default function ModelStage({
  poster,
  alt,
  sizes,
  eager,
  modelSrc,
  renderer,
  progress,
  enabled = true,
  className = "",
}) {
  const mountRef = useRef(null);
  const [state, setState] = useState("poster");

  useEffect(() => {
    if (!enabled || !modelSrc || !renderer) return;
    let cancelled = false;
    let instance;
    let raf;
    let visible = false;

    const loop = () => {
      instance.update(progress?.current ?? 0);
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      if (instance && visible) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(mountRef.current);

    setState("loading");
    renderer(mountRef.current, { src: modelSrc, progress })
      .then((r) => {
        if (cancelled) return r.dispose();
        instance = r;
        setState("ready");
        sync();
      })
      .catch(() => !cancelled && setState("error"));

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      instance?.dispose();
      setState("poster");
    };
  }, [enabled, modelSrc, renderer, progress]);

  return (
    <div ref={mountRef} data-model-state={state} className={`relative ${className}`}>
      <SceneImg
        name={poster}
        alt={alt}
        sizes={sizes}
        eager={eager}
        className={`block h-full w-full object-contain transition-opacity duration-500 ${
          state === "ready" ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
