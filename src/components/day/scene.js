/*
 * "One Day on Site": the 3D scene behind the home story (desktop only; phones, low-power devices,
 * Save-Data, reduced motion and browsers without WebGL get one still per chapter instead, rendered
 * from this same scene).
 *
 * Loaded with a dynamic import() after the first paint and an idle moment, so three.js is never on
 * the first screen's critical path. Named imports only, so the bundler keeps just the classes used.
 *
 * Rebuilt from the approved concept (nexera-reference/day-story), with these changes:
 *   - our signal green (#86E08A) replaces the concept's lime;
 *   - the cabinet is the TCL BlueArk X5, which is air-cooled (air-conditioning unit and fans on the
 *     door, filtered intake below): the concept's red/blue coolant pipes are gone and the "Cooling"
 *     label points at the intake where "Chiller" used to be;
 *   - pixel ratio at most 1.5, shadow map 2048, textures as WebP files (not base64);
 *   - dispose() releases every geometry, material, texture, render target and the GL context.
 *
 * Progress p runs 0…6: 0 hero, 1 open, 2 noon, 3 peak, 4 outage, 5 scale, 6 signed.
 */
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Euler,
  Float32BufferAttribute,
  Fog,
  Group,
  HemisphereLight,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Points,
  PointsMaterial,
  Quaternion,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TextureLoader,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { Sky } from "three/addons/objects/Sky.js";

import texFront from "../../assets/day/front.webp";
import texPack from "../../assets/day/pack.webp";
import texPcs from "../../assets/day/pcs.webp";
import texDoorUp from "../../assets/day/door-up.webp";
import texDoorLo from "../../assets/day/door-lo.webp";
import texFacade from "../../assets/day/facade.webp";
import texFacadeEm from "../../assets/day/facade-em.webp";

export const GREEN = "#86E08A"; // charging, solar, the LED at rest
export const AMBER = "#F5A524"; // discharging
export const BLUE = "#5AA9FF"; // the grid

const V = (x, y, z) => new Vector3(x, y, z);
/** Smoothstep of t between a and b. */
export const sstep = (a, b, t) => {
  const n = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return n * n * (3 - 2 * n);
};
const lerp = (a, b, t) => a + (b - a) * t;
const DEG = Math.PI / 180;

// Light per chapter: sky elevation, sun [elevation, azimuth], key light colour and intensity,
// environment intensity, exposure, night amount, fog colour.
const LIGHT = [
  { sk: 14, sun: [29, 298], li: "#FFE9D4", I: 5.2, env: 0.42, ex: 0.42, night: 0, fog: "#C3D0DC" },
  { sk: 26, sun: [38, 305], li: "#FFF3E4", I: 5.2, env: 0.32, ex: 0.38, night: 0, fog: "#C9D6E2" },
  { sk: 64, sun: [64, 215], li: "#FFFFFF", I: 6, env: 0.26, ex: 0.3, night: 0, fog: "#BFD3E6" },
  { sk: 3.5, sun: [9, 255], li: "#FFA264", I: 3, env: 0.7, ex: 0.56, night: 0.5, fog: "#B98F7C" },
  { sk: -14, sun: [40, 300], li: "#9DBDFF", I: 0.5, env: 1, ex: 0.9, night: 1, fog: "#0B1424" },
  { sk: -4, sun: [24, 60], li: "#C9D8F8", I: 0.9, env: 1, ex: 0.8, night: 0.6, fog: "#2A3A58" },
  { sk: 14, sun: [29, 298], li: "#FFE9D4", I: 5.2, env: 0.42, ex: 0.42, night: 0, fog: "#C3D0DC" },
];
// Camera per chapter: [position, target].
const CAMERA = [
  [V(-3.4, 1.45, 7.4), V(0.7, 1.5, 0)],
  [V(-0.9, 1.75, 6), V(-0.35, 1.22, 0.5)],
  [V(8.4, 5.4, 15.5), V(0.6, 1.6, -6)],
  [V(10.5, 3, 13.5), V(-1, 2.3, -6)],
  [V(6.8, 2.5, 12.5), V(1.9, 2.5, -5)],
  [V(21, 11, 19), V(8.5, 0.6, -2.2)],
  [V(-1.7, 1.6, 7.4), V(0.55, 1.4, 0)],
];
// How far the view shifts sideways (fraction of the width) per chapter, so the subject clears the panel.
const SHIFT = [0.25, 0.2, 0.2, 0.2, 0.2, 0.15, 0.25];

/**
 * Builds the scene on `canvas`. Returns null when WebGL is unavailable.
 * @param {HTMLCanvasElement} canvas
 * @param {{ small?: boolean }} [opts] small: a phone-sized canvas (only used when rendering the stills)
 */
export function createDayScene(canvas, { small = false } = {}) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  if (!renderer.getContext()) return null;

  const tmpV = V(0, 0, 0);
  const tmpS = V(1, 1, 1);
  const noRot = new Quaternion();
  const m4 = new Matrix4();
  const disposables = new Set(); // canvas textures and anything not reachable from the scene graph

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, 0.2, 12000);
  scene.fog = new Fog("#D9C2B4", 80, 520);

  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  let pending = 0;
  let resolveReady;
  const ready = new Promise((r) => (resolveReady = r));
  const loader = new TextureLoader();
  const loadTex = (url) => {
    pending++;
    const done = () => --pending === 0 && resolveReady();
    const t = loader.load(url, done, undefined, done);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = aniso;
    return t;
  };
  const canvasTex = (w, h, draw, repeat, srgb = true) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new CanvasTexture(c);
    t.wrapS = t.wrapT = RepeatWrapping;
    if (repeat) t.repeat.set(repeat[0], repeat[1]);
    t.anisotropy = aniso;
    if (srgb) t.colorSpace = SRGBColorSpace;
    disposables.add(t);
    return t;
  };
  // Seeded random, so the noise (and the stills) are the same on every visit.
  const rnd = (() => {
    let s = 7;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  })();
  // n small grey squares at random alpha, blended straight into the pixels (one getImageData /
  // putImageData instead of n fillRect calls, which took ~0.4 s for the ground).
  const speckle = (g, w, h, n, a) => {
    const img = g.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 0; i < n; i++) {
      const v = Math.floor(rnd() * 255);
      const al = a * rnd();
      const sz = Math.max(1, Math.round(1 + rnd() * 3));
      const x0 = Math.floor(rnd() * w);
      const y0 = Math.floor(rnd() * h);
      for (let y = y0; y < Math.min(h, y0 + sz); y++)
        for (let x = x0; x < Math.min(w, x0 + sz); x++) {
          const o = (y * w + x) * 4;
          d[o] += (v - d[o]) * al;
          d[o + 1] += (v - d[o + 1]) * al;
          d[o + 2] += (v - d[o + 2]) * al;
        }
    }
    g.putImageData(img, 0, 0);
  };
  // Corrugation normal map (ribbed cladding).
  const ribs = (period, amp, repeat, vertical) =>
    canvasTex(
      256,
      256,
      (g, w, h) => {
        const img = g.createImageData(w, h);
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++) {
            const k = (((vertical ? y : x) % period) / period) * 6.283;
            const c = Math.cos(k) * amp;
            const o = (y * w + x) * 4;
            img.data[o] = vertical ? 128 : 128 + c * 127;
            img.data[o + 1] = vertical ? 128 + c * 127 : 128;
            img.data[o + 2] = 255;
            img.data[o + 3] = 255;
          }
        g.putImageData(img, 0, 0);
      },
      repeat,
      false
    );

  const groundMap = canvasTex(
    1024,
    1024,
    (g, w, h) => {
      g.fillStyle = "#8b8f94";
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 140000, 0.16);
      for (let i = 0; i < 60; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        const r = 40 + rnd() * 180;
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, `rgba(${rnd() > 0.5 ? "58,60,64" : "176,178,182"},.09)`);
        gr.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gr;
        g.fillRect(x - r, y - r, 2 * r, 2 * r);
      }
      g.strokeStyle = "rgba(52,54,58,.28)";
      g.lineWidth = 2;
      g.strokeRect(0, 0, w, h);
    },
    [140, 140]
  );
  const groundBump = canvasTex(
    512,
    512,
    (g, w, h) => {
      g.fillStyle = "#808080";
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 60000, 0.5);
    },
    [260, 260],
    false
  );
  const cellsMap = canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = "#0d1a33";
    g.fillRect(0, 0, w, h);
    for (let r = 0; r < 12; r++)
      for (let c = 0; c < 6; c++) {
        g.fillStyle = `rgb(${14 + rnd() * 6},${30 + rnd() * 10},${66 + rnd() * 16})`;
        g.fillRect((c * w) / 6 + 2, (r * h) / 12 + 2, w / 6 - 4, h / 12 - 4);
        g.fillStyle = "rgba(190,200,215,.5)";
        g.fillRect((c * w) / 6 + w / 12 - 0.5, (r * h) / 12 + 2, 1, h / 12 - 4);
      }
  });

  // Sky and image-based light (regenerated only when the sun moves enough).
  const sky = new Sky();
  sky.scale.setScalar(5000);
  const su = sky.material.uniforms;
  su.turbidity.value = 7;
  su.rayleigh.value = 1.9;
  su.mieCoefficient.value = 0.006;
  su.mieDirectionalG.value = 0.82;
  scene.add(sky);
  const pmrem = new PMREMGenerator(renderer);
  const envScene = new Scene();
  let envTarget = null;
  let envKey = -99;
  let envAt = -9;

  const hemi = new HemisphereLight("#BFD4F2", "#6A6B6E", 0.35);
  scene.add(hemi);
  const sun = new DirectionalLight("#fff", 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 160 });
  sun.shadow.bias = -25e-5;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 5;
  scene.add(sun, sun.target);

  const starPos = new Float32Array(1200);
  for (let i = 0; i < 400; i++) {
    const a = rnd() * 6.283;
    const e = 0.1 + rnd() * 1.35;
    starPos.set([Math.cos(a) * Math.cos(e) * 4000, Math.sin(e) * 4000, Math.sin(a) * Math.cos(e) * 4000], i * 3);
  }
  const starGeo = new BufferGeometry();
  starGeo.setAttribute("position", new Float32BufferAttribute(starPos, 3));
  const stars = new Points(
    starGeo,
    new PointsMaterial({ color: "#DCE8FF", size: 1.7, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false })
  );
  scene.add(stars);

  // Materials.
  const paint = (color, o = {}) => new MeshPhysicalMaterial({ color, roughness: 0.42, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.45, ...o });
  const std = (color, o = {}) => new MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1, ...o });
  const white = paint("#EDEFF1");
  const whiteShade = paint("#D3D7DC");
  const dark = std("#2B2F35", { roughness: 0.55, metalness: 0.5 });
  const steel = std("#B8BEC6", { metalness: 0.85, roughness: 0.3 });
  const gasket = std("#16181B", { roughness: 0.9 });
  const glow = (c, i = 1) => new MeshStandardMaterial({ color: "#111", emissive: c, emissiveIntensity: i, roughness: 0.4 });
  const box = (w, h, d, mat, x = 0, y = 0, z = 0, parent) => {
    const m = new Mesh(new BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    (parent || scene).add(m);
    return m;
  };

  const ground = new Mesh(new PlaneGeometry(1400, 1400), new MeshStandardMaterial({ color: "#A9AEB4", map: groundMap, bumpMap: groundBump, bumpScale: 0.6, roughness: 0.93, metalness: 0 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---- The cabinet (TCL BlueArk X5) ----
  const CW = 1; // width
  const CD = 1.35; // depth
  const BASE = 0.11;
  const CH = 2.25; // body height
  const WALL = 0.035;
  const LOWER = CH * 0.375; // lower (power) compartment
  const UPPER = CH - LOWER;
  const LOWER_TOP = BASE + LOWER;
  const cab = new Group();
  scene.add(cab);
  const plinth = box(1.5, 0.12, 1.85, std("#A4A8AD", { roughness: 0.95 }), 0, 0.06, 0, cab);
  plinth.material.map = canvasTex(
    64,
    64,
    (g) => {
      g.fillStyle = "#a9adb2";
      g.fillRect(0, 0, 64, 64);
      speckle(g, 64, 64, 500, 0.15);
    },
    [3, 3]
  );
  const PL = 0.12; // plinth top
  box(CW - 0.02, BASE, CD - 0.02, white, 0, PL + BASE / 2, 0, cab);
  const BT = PL + BASE; // body bottom
  box(WALL, CH, CD, white, -CW / 2 + WALL / 2, BT + CH / 2, 0, cab);
  box(WALL, CH, CD, whiteShade, CW / 2 - WALL / 2, BT + CH / 2, 0, cab);
  box(CW, CH, WALL, white, 0, BT + CH / 2, -CD / 2 + WALL / 2, cab);
  box(CW + 0.012, WALL, CD + 0.012, white, 0, BT + CH - WALL / 2 + 0.004, 0, cab);
  box(CW, WALL, CD, white, 0, BT + WALL / 2, 0, cab);
  box(CW - 2 * WALL, WALL, CD - WALL, white, 0, PL + LOWER_TOP, 0, cab);
  [[-0.42, 0.58], [0.42, 0.58], [-0.42, -0.58], [0.42, -0.58]].forEach(([x, z]) => {
    const eye = new Mesh(new TorusGeometry(0.035, 0.011, 8, 18), steel);
    eye.position.set(x, BT + CH + 0.045, z);
    eye.castShadow = true;
    cab.add(eye);
  });
  const doorSeal = (y, h) => {
    const z = CD / 2 - 0.012;
    const w = CW - 2 * WALL;
    const t = 0.022;
    [[w, t, 0, y + h / 2 - t / 2], [w, t, 0, y - h / 2 + t / 2], [t, h, -w / 2 + t / 2, y], [t, h, w / 2 - t / 2, y]].forEach(([a, b, x, yy]) => box(a, b, 0.02, gasket, x, yy, z, cab));
  };
  doorSeal(PL + LOWER_TOP + UPPER / 2 - WALL / 2, UPPER - WALL - 0.01);
  doorSeal(BT + LOWER / 2 + WALL / 4, LOWER - WALL - 0.02);

  const front = loadTex(texFront);
  const packTex = loadTex(texPack);
  const pcsTex = loadTex(texPcs);
  const doorUpTex = loadTex(texDoorUp);
  const doorLoTex = loadTex(texDoorLo);

  // Five battery packs on runners; the top one opens to show its cells.
  const packs = [];
  const PW = CW - 2 * WALL - 0.06;
  const PH = 0.215;
  const PD = CD - 0.22;
  const packBody = std("#33373D", { roughness: 0.5, metalness: 0.55 });
  const packFace = std("#ffffff", { map: packTex, roughness: 0.5, metalness: 0.35 });
  const SLIDE = [0.62, 0.5, 0.38, 0.26, 0.14];
  let lid;
  let cells;
  for (let i = 0; i < 5; i++) {
    const g = new Group();
    g.position.set(0, PL + LOWER_TOP + 0.05 + i * 0.262 + PH / 2, 0);
    cab.add(g);
    packs.push(g);
    const body = new Mesh(new BoxGeometry(PW, PH, PD), [packBody, packBody, packBody, packBody, packFace, packBody]);
    body.castShadow = body.receiveShadow = true;
    g.add(body);
    box(PW + 0.02, 0.012, PD, std("#1B1D21", { metalness: 0.7, roughness: 0.4 }), 0, -PH / 2 - 0.006, 0, g);
    if (i === 0) {
      lid = box(PW - 0.01, 0.014, PD - 0.01, std("#3A3F46", { metalness: 0.6, roughness: 0.45, transparent: true }), 0, PH / 2 + 0.008, 0, g);
      const blue = std("#2A56A0", { roughness: 0.42, metalness: 0.15 });
      const term = std("#C6CBD2", { roughness: 0.35, metalness: 0.85 });
      cells = new InstancedMesh(new BoxGeometry(0.054, 0.17, 0.2), [blue, blue, term, blue, blue, blue], 52);
      cells.castShadow = true;
      g.add(cells);
    }
  }
  // Power conversion compartment.
  const pcs = new Mesh(new PlaneGeometry(CW - 2 * WALL - 0.02, LOWER - 0.1), std("#ffffff", { map: pcsTex, roughness: 0.55, metalness: 0.2 }));
  pcs.position.set(0, BT + LOWER / 2 + 0.01, CD / 2 - 0.14);
  cab.add(pcs);
  box(CW - 2 * WALL, LOWER - 0.08, 0.02, dark, 0, BT + LOWER / 2, CD / 2 - 0.16, cab);

  // Doors, hinged on the left; the outside shows the cabinet front, the inside its own texture.
  const door = (h, y, v0, v1, inner) => {
    const hinge = new Group();
    hinge.position.set(-CW / 2, 0, CD / 2);
    cab.add(hinge);
    const outer = front.clone();
    outer.repeat.set(1, v1 - v0);
    outer.offset.set(0, v0);
    outer.needsUpdate = true;
    disposables.add(outer);
    const m = new Mesh(new BoxGeometry(CW, h, 0.045), [white, white, white, white, paint("#ffffff", { map: outer, roughness: 0.5, clearcoat: 0.2 }), std("#ffffff", { map: inner, roughness: 0.6 })]);
    m.position.set(CW / 2, y, 0.0235);
    m.castShadow = m.receiveShadow = true;
    hinge.add(m);
    return hinge;
  };
  const doorUp = door(UPPER, PL + LOWER_TOP + UPPER / 2, 0.375, 1, doorUpTex);
  const doorLo = door(LOWER, BT + LOWER / 2, 0, 0.375, doorLoTex);
  const estop = new Mesh(new SphereGeometry(0.034, 20, 12, 0, 6.283, 0, 1.6), new MeshStandardMaterial({ color: "#C8141E", emissive: "#FF1F2D", emissiveIntensity: 0.5, roughness: 0.25 }));
  estop.rotation.x = Math.PI / 2;
  estop.position.set(CW * 0.69, BT + CH * 0.947, 0.047);
  doorUp.add(estop);
  const led = box(0.014, 0.014, 0.008, glow(GREEN, 2), CW * 0.915, BT + CH * 0.895, 0.05, doorUp);
  box(0.022, 0.1, 0.03, dark, CW * 0.915, BT + CH * 0.59, 0.058, doorUp);
  box(0.022, 0.1, 0.03, dark, CW * 0.915, BT + CH * 0.155, 0.058, doorLo);

  // The handover outline on the floor (last chapter).
  const outline = new Group();
  const outlineMat = glow(GREEN, 0);
  scene.add(outline);
  [[2.5, 0.03, 0, 1.25], [2.5, 0.03, 0, -1.25], [0.03, 2.5, 1.25, 0], [0.03, 2.5, -1.25, 0]].forEach(([w, d, x, z]) => {
    const m = new Mesh(new BoxGeometry(w, 0.012, d), outlineMat);
    m.position.set(x, 0.012, z);
    outline.add(m);
  });
  const lamp = new PointLight("#E9F2C4", 0, 12, 1.5);
  lamp.position.set(0.6, 2.9, 2.6);
  scene.add(lamp);
  const contact = new Mesh(
    new PlaneGeometry(3.4, 3.8),
    new MeshBasicMaterial({
      map: canvasTex(128, 128, (g) => {
        const gr = g.createRadialGradient(64, 64, 6, 64, 64, 64);
        gr.addColorStop(0, "rgba(0,0,0,.55)");
        gr.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gr;
        g.fillRect(0, 0, 128, 128);
      }),
      transparent: true,
      depthWrite: false,
    })
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.125;
  scene.add(contact);

  // ---- The factory, its solar, the grid ----
  const factory = new Group();
  factory.position.set(-15, 0, -20);
  scene.add(factory);
  const FH = 8.4;
  const facadeTex = loadTex(texFacade);
  const facadeEm = loadTex(texFacadeEm);
  const clad = std("#6E747B", { normalMap: ribs(20, 0.5, [1, 34], true), roughness: 0.55, metalness: 0.35 });
  const roof = std("#3A3F46", { roughness: 0.8 });
  const facade = new MeshStandardMaterial({ color: "#B4B9BF", map: facadeTex, emissive: "#FFD9A6", emissiveMap: facadeEm, emissiveIntensity: 0, roughness: 0.55, metalness: 0.2 });
  const hall = new Mesh(new BoxGeometry(27.4, FH, 14), [clad, clad, roof, roof, facade, clad]);
  hall.castShadow = hall.receiveShadow = true;
  hall.position.y = FH / 2;
  factory.add(hall);
  box(27.8, 0.3, 14.4, std("#2E3238", { metalness: 0.6, roughness: 0.4 }), 0, FH + 0.12, 0, factory);
  box(
    29.4,
    0.14,
    1.6,
    std("#C4C6C8", {
      map: canvasTex(
        256,
        64,
        (g, w, h) => {
          g.fillStyle = "#c9cbcd";
          g.fillRect(0, 0, w, h);
          speckle(g, w, h, 5000, 0.14);
          g.fillStyle = "rgba(70,72,76,.5)";
          g.fillRect(0, 0, 2, h);
        },
        [20, 1]
      ),
      roughness: 0.9,
    }),
    0,
    0.07,
    7.8,
    factory
  );
  box(1.6, 0.14, 15.6, std("#C4C6C8", { roughness: 0.9 }), 14.5, 0.07, 0.8, factory);

  const glass = new MeshPhysicalMaterial({ map: cellsMap, color: "#ffffff", roughness: 0.18, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06 });
  const frame = std("#AEB5BD", { metalness: 0.8, roughness: 0.35 });
  const tilt = new Quaternion().setFromEuler(new Euler(0.32, 0, 0));
  const panelMats = [frame, frame, glass, frame, frame, frame];
  const roofPanels = new InstancedMesh(new BoxGeometry(2.3, 0.045, 1.5), panelMats, 44);
  for (let i = 0; i < 44; i++) {
    m4.compose(V(-12.6 + (i % 11) * 2.5, FH + 0.75, -4.4 + Math.floor(i / 11) * 2.9), tilt, tmpS.set(1, 1, 1));
    roofPanels.setMatrixAt(i, m4);
  }
  roofPanels.castShadow = true;
  factory.add(roofPanels);
  const fieldPanels = new InstancedMesh(new BoxGeometry(2.1, 0.045, 3.3), panelMats, 36);
  const legs = new InstancedMesh(new BoxGeometry(0.08, 1.25, 0.08), frame, 72);
  for (let i = 0; i < 36; i++) {
    const x = 6.5 + (i % 9) * 2.25;
    const z = -13.5 - Math.floor(i / 9) * 4.6;
    m4.compose(V(x, 1.42, z), tilt, tmpS.set(1, 1, 1));
    fieldPanels.setMatrixAt(i, m4);
    m4.compose(V(x - 0.8, 0.62, z - 0.6), noRot, tmpS.set(1, 1.3, 1));
    legs.setMatrixAt(i * 2, m4);
    m4.compose(V(x + 0.8, 0.45, z + 0.9), noRot, tmpS.set(1, 0.72, 1));
    legs.setMatrixAt(i * 2 + 1, m4);
  }
  fieldPanels.castShadow = legs.castShadow = true;
  fieldPanels.receiveShadow = true;
  scene.add(fieldPanels, legs);

  const pole = new Group();
  pole.position.set(6.4, 0, -8.5);
  scene.add(pole);
  const galv = std("#8C949C", { metalness: 0.75, roughness: 0.45 });
  const mast = new Mesh(new CylinderGeometry(0.11, 0.17, 9.6, 14), std("#9A9DA0", { roughness: 0.85 }));
  mast.position.y = 4.8;
  mast.castShadow = true;
  pole.add(mast);
  box(3.2, 0.12, 0.12, galv, 0, 8.9, 0, pole);
  box(2.3, 0.12, 0.12, galv, 0, 7.8, 0, pole);
  const insulator = std("#6B3A2A", { roughness: 0.4 });
  [-1.5, 0, 1.5].forEach((x) => {
    const m = new Mesh(new CylinderGeometry(0.06, 0.08, 0.3, 10), insulator);
    m.position.set(x, 9.1, 0);
    pole.add(m);
  });
  box(1.4, 1.5, 1.2, paint("#7C858E", { roughness: 0.5 }), 1.4, 0.95, 0.4, pole);
  for (let i = 0; i < 7; i++) box(0.03, 1.1, 1.3, galv, 0.86 + i * 0.18, 0.95, 0.4, pole);
  box(1.6, 0.2, 1.4, std("#9A9DA0", { roughness: 0.9 }), 1.4, 0.1, 0.4, pole);

  const wallMat = std("#B9B6AE", {
    map: canvasTex(
      256,
      128,
      (g, w, h) => {
        g.fillStyle = "#bdbab2";
        g.fillRect(0, 0, w, h);
        speckle(g, w, h, 6000, 0.12);
        g.fillStyle = "rgba(60,58,54,.35)";
        g.fillRect(0, 0, 2, h);
        g.fillStyle = "rgba(70,66,60,.18)";
        g.fillRect(0, h - 26, w, 26);
      },
      [40, 1]
    ),
    roughness: 0.92,
  });
  box(150, 2.4, 0.3, wallMat, 15, 1.2, -36);
  box(150, 0.12, 0.42, std("#8F8C86", { roughness: 0.9 }), 15, 2.46, -36);
  box(0.3, 2.4, 110, wallMat.clone(), 38, 1.2, 10);
  [[-34, -74, 30, 10, 18], [6, -82, 44, 12.5, 20], [58, -70, 26, 8.5, 16], [70, -20, 18, 9, 36], [74, 30, 20, 11, 30]].forEach(([x, z, w, h, d], i) => {
    box(w, h, d, std(i % 2 ? "#C9CCD0" : "#B4B9BF", { normalMap: ribs(32, 0.4, [w / 2, 1]), roughness: 0.6, metalness: 0.2 }), x, h / 2, z);
    box(w + 0.4, 0.3, d + 0.4, std("#4A4F56", { roughness: 0.7 }), x, h + 0.15, z);
  });
  box(
    0.5,
    0.025,
    13.4,
    std("#6F757C", {
      map: canvasTex(
        64,
        64,
        (g) => {
          g.fillStyle = "#7b8188";
          g.fillRect(0, 0, 64, 64);
          g.strokeStyle = "rgba(40,44,50,.5)";
          for (let o = -64; o < 64; o += 8) {
            g.beginPath();
            g.moveTo(o, 0);
            g.lineTo(o + 64, 64);
            g.stroke();
          }
          g.fillStyle = "rgba(30,32,36,.7)";
          g.fillRect(0, 0, 64, 2);
        },
        [1, 22]
      ),
      metalness: 0.7,
      roughness: 0.5,
    }),
    0.45,
    0.012,
    -7.6
  );
  const stripeMat = new MeshStandardMaterial({ color: "#E8E6DC", roughness: 0.8, transparent: true, opacity: 0.8 });
  const stripeGeo = new PlaneGeometry(0.12, 4.6);
  for (let i = 0; i < 9; i++) {
    const m = new Mesh(stripeGeo, stripeMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(-11 + i * 2.6, 0.006, 6.5);
    m.receiveShadow = true;
    scene.add(m);
  }
  const wireMat = new LineBasicMaterial({ color: "#22272E" });
  [-1.5, 0, 1.5].forEach((dx) => {
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      pts.push(V(6.4 + dx + t * 46, 9.2 - Math.sin(t * Math.PI) * 1.8, -8.5 - t * 60));
    }
    scene.add(new Line(new BufferGeometry().setFromPoints(pts), wireMat));
  });
  // Grid down: a red cross over the pole.
  const gridDown = new Sprite(
    new SpriteMaterial({
      map: canvasTex(64, 64, (g) => {
        g.strokeStyle = "#FF5A4D";
        g.lineWidth = 9;
        g.lineCap = "round";
        g.beginPath();
        g.moveTo(14, 14);
        g.lineTo(50, 50);
        g.moveTo(50, 14);
        g.lineTo(14, 50);
        g.stroke();
      }),
      transparent: true,
      opacity: 0,
      fog: false,
      depthTest: false,
    })
  );
  gridDown.position.set(6.4, 4.6, -8.4);
  gridDown.scale.setScalar(1.15);
  scene.add(gridDown);

  // Energy flows: a faint tube with beads running along it.
  const flow = (points, color) => {
    const curve = new CatmullRomCurve3(points, false, "catmullrom", 0.25);
    const tube = new Mesh(new TubeGeometry(curve, 80, 0.035, 6), new MeshBasicMaterial({ color, transparent: true, opacity: 0, fog: false }));
    scene.add(tube);
    const beads = new InstancedMesh(new SphereGeometry(0.12, 12, 8), new MeshBasicMaterial({ color, transparent: true, opacity: 0, fog: false }), 14);
    scene.add(beads);
    return { curve, tube, beads };
  };
  const flows = [
    flow([V(9, 1.3, -12.2), V(7.5, 0.22, -10.5), V(3.2, 0.2, -5.5), V(1.4, 0.2, -1.8), V(0.52, 0.7, -0.3)], GREEN), // solar → battery
    flow([V(0.1, 0.8, -0.7), V(0.5, 0.2, -2.6), V(0.4, 0.2, -9), V(-0.6, 0.2, -14.6), V(-1.28, 1.7, -15.6)], AMBER), // battery → factory
    flow([V(6.4, 7.8, -8.5), V(7.5, 2, -8.3), V(5.2, 0.22, -9.8), V(1.2, 0.2, -15), V(-0.5, 0.2, -18.6), V(-1.28, 1.7, -19.4)], BLUE), // grid → factory
  ];

  // Scale: 23 more cabinets rise beside the first, and a container appears.
  const fleetFront = std("#ffffff", { map: front, roughness: 0.5 });
  const fleet = new InstancedMesh(new BoxGeometry(CW, CH + BASE, CD), [white, whiteShade, white, white, fleetFront, white], 23);
  const fleetPlinths = new InstancedMesh(new BoxGeometry(1.5, 0.12, 1.85), std("#A4A8AD", { roughness: 0.95 }), 23);
  fleet.castShadow = fleetPlinths.receiveShadow = true;
  scene.add(fleet, fleetPlinths);
  const slot = (i) => V(1.95 * ((i + 1) % 12), 0, i + 1 >= 12 ? -3 : 0);
  const container = new Group();
  scene.add(container);
  container.visible = false;
  const ribbed = paint("#EEF0F2", { normalMap: ribs(28, 0.5, [22, 1]), roughness: 0.5 });
  const shell = new Mesh(new BoxGeometry(6.06, 2.9, 2.44), [white, white, white, white, ribbed, ribbed]);
  shell.castShadow = true;
  shell.position.y = 1.6;
  container.add(shell);
  box(6.1, 0.14, 2.48, dark, 0, 0.12, 0, container);
  box(6.1, 0.1, 2.48, dark, 0, 3.08, 0, container);

  // Label anchors (world positions, or points on a door that moves with it).
  const anchors = {
    packs: V(0.15, PL + LOWER_TOP + 1, CD / 2 + 0.32),
    cells: V(0.05, PL + LOWER_TOP + 0.5, CD / 2 + 0.95),
    pcs: V(0.12, BT + LOWER / 2, CD / 2 - 0.12),
  };
  const doorAnchors = {
    ems: [doorUp, V(CW * 0.42, PL + LOWER_TOP + UPPER * 0.55, -0.01)],
    cool: [doorLo, V(CW * 0.5, BT + LOWER * 0.5, -0.01)],
  };

  const cA = new Color();
  const cB = new Color();
  let width = 1;
  let height = 1;
  let p = 0; // progress 0…6
  let time = 0;
  let offX = 0;
  let offY = 0;
  const up = V(0, 1, 0);
  const look = V(0, 0, 0);

  /** Interpolates the chapter table `arr` at the current progress (eased between chapters). */
  const at = (arr, fn) => {
    const i = Math.min(arr.length - 2, Math.max(0, Math.floor(p)));
    const t = sstep(0.15, 0.85, Math.min(1, Math.max(0, p - i)));
    return fn(arr[i], arr[i + 1], t);
  };

  function update(dt) {
    time += dt;
    at(LIGHT, (a, b, t) => {
      const el = lerp(a.sun[0], b.sun[0], t) * DEG;
      const az = lerp(a.sun[1], b.sun[1], t) * DEG;
      const night = lerp(a.night, b.night, t);
      const skyEl = lerp(a.sk, b.sk, t) * DEG;
      sun.position.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).multiplyScalar(70);
      up.set(Math.cos(skyEl) * Math.sin(az), Math.sin(skyEl), Math.cos(skyEl) * Math.cos(az));
      su.sunPosition.value.copy(up);
      sun.color.copy(cA.set(a.li)).lerp(cB.set(b.li), t);
      sun.intensity = lerp(a.I, b.I, t);
      renderer.toneMappingExposure = lerp(a.ex, b.ex, t);
      scene.fog.color.copy(cA.set(a.fog)).lerp(cB.set(b.fog), t);
      hemi.intensity = 0.25 + night * 0.5;
      stars.material.opacity = Math.max(0, night - 0.45) * 1.6;
      facade.emissiveIntensity = night * 2.4;
      lamp.intensity = night * 16;
      const key = Math.round(lerp(a.sk, b.sk, t) / 3) * 3 + Math.round(az * 3) * 100;
      if (key !== envKey && time - envAt > 0.35) {
        envKey = key;
        envAt = time;
        scene.remove(sky);
        envScene.add(sky);
        const next = pmrem.fromScene(envScene, 0.02, 0.5, 20000);
        envScene.remove(sky);
        scene.add(sky);
        envTarget?.dispose();
        envTarget = next;
        scene.environment = next.texture;
      }
      scene.environmentIntensity = lerp(a.env, b.env, t);
    });
    at(CAMERA, (a, b, t) => {
      camera.position.lerpVectors(a[0], b[0], t);
      camera.position.x += Math.sin(time * 0.25) * 0.1;
      camera.position.y += Math.cos(time * 0.2) * 0.035;
      camera.lookAt(look.lerpVectors(a[1], b[1], t));
    });

    const open = sstep(0.5, 0.86, p) - sstep(1.25, 1.6, p);
    const lift = sstep(0.88, 1, p) - sstep(1.08, 1.2, p);
    doorUp.rotation.y = -open * 2.95;
    doorLo.rotation.y = -open * 2.88;
    packs.forEach((g, i) => {
      const s = sstep(0.68 + i * 0.03, 0.9, p) - sstep(1.18, 1.5, p);
      g.position.z = s * (i ? SLIDE[i] * (1 - 0.5 * lift) : 0.62 + 0.62 * lift);
    });
    lid.position.y = PH / 2 + 0.008 + sstep(0.2, 0.8, lift) * 0.1;
    lid.material.opacity = 1 - sstep(0.3, 0.8, lift);
    lid.visible = lift < 0.8;
    lid.castShadow = lift < 0.3;
    for (let i = 0; i < 52; i++) {
      const row = Math.floor(i / 13);
      const col = i % 13;
      m4.compose(tmpV.set(-0.372 + col * 0.062, sstep(0.45, 1, lift) * 0.2 - 0.012, -0.24 + row * 0.215), noRot, tmpS.setScalar(1));
      cells.setMatrixAt(i, m4);
    }
    cells.instanceMatrix.needsUpdate = true;

    const solar = sstep(1.6, 2, p) - sstep(2.5, 2.9, p);
    const out = sstep(2.6, 3, p) - sstep(4.6, 5, p);
    const grid = (sstep(1.55, 1.9, p) - sstep(3.6, 3.95, p)) * 0.8;
    [solar, out, grid].forEach((amt, k) => {
      const f = flows[k];
      f.tube.material.opacity = amt * 0.34;
      f.beads.material.opacity = Math.min(1, amt * 1.2);
      f.tube.visible = f.beads.visible = amt > 0.01;
      if (amt > 0.01) {
        for (let i = 0; i < 14; i++) {
          const u = (i / 14 + time * (0.16 + k * 0.02)) % 1;
          m4.compose(f.curve.getPointAt(u, tmpV), noRot, tmpS.setScalar(0.7 + 0.5 * Math.sin(u * Math.PI)));
          f.beads.setMatrixAt(i, m4);
        }
        f.beads.instanceMatrix.needsUpdate = true;
      }
    });
    gridDown.material.opacity = sstep(3.7, 4, p) - sstep(4.5, 4.8, p);
    led.material.emissive.set(out > 0.3 ? AMBER : GREEN);

    const rise = sstep(4.5, 5, p) - sstep(5.45, 5.85, p);
    for (let i = 0; i < 23; i++) {
      const k = Math.min(1, Math.max(0, rise * 30 - i));
      const s = slot(i);
      m4.compose(tmpV.set(s.x, 0.12 + ((CH + BASE) / 2) * k, s.z), noRot, tmpS.set(1, Math.max(0.001, k), 1));
      fleet.setMatrixAt(i, m4);
      m4.compose(tmpV.set(s.x, 0.06, s.z), noRot, tmpS.setScalar(k > 0 ? 1 : 0.001));
      fleetPlinths.setMatrixAt(i, m4);
    }
    fleet.instanceMatrix.needsUpdate = fleetPlinths.instanceMatrix.needsUpdate = true;
    fleet.visible = fleetPlinths.visible = rise > 0.005;
    container.visible = rise > 0.55;
    container.position.set(9.5, 0, -7.2);
    outlineMat.emissiveIntensity = sstep(5.6, 6, p) * (1.6 + Math.sin(time * 2.2) * 0.5);
    outline.visible = p > 5.55;

    const shift = at(SHIFT, (a, b, t) => lerp(a, b, t));
    camera.setViewOffset(width, height, -offX * shift * width, -offY * height, width, height);
  }

  return {
    ready,
    /** Story progress, 0 (hero) to 6 (signed off). */
    set(v) {
      p = Math.min(6, Math.max(0, v));
    },
    /** Sideways (fraction of SHIFT) and vertical (fraction of the height) view offsets. */
    offset(x, y) {
      offX = x;
      offY = y;
    },
    resize(w, h) {
      width = Math.max(1, w);
      height = Math.max(1, h);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < height || small ? 54 : 34;
      camera.updateProjectionMatrix();
    },
    /**
     * Compiles every shader for progress v without blocking the page (parallel compile where the GPU
     * driver offers it), so the first frame does not stall.
     */
    async prepare(v) {
      p = Math.min(6, Math.max(0, v));
      time = 0;
      envKey = -99;
      envAt = -9;
      update(0);
      await renderer.compileAsync(scene, camera);
    },
    /** Advances time by dt seconds (0 holds every idle motion still) and draws a frame. */
    render(dt) {
      update(dt);
      renderer.render(scene, camera);
    },
    /**
     * Draws progress v exactly as the stills were rendered: idle motion at its starting point and the
     * sky's light generated for this moment. The live scene's first frame, so the cross-fade from the
     * still has nothing to jump.
     */
    snapshot(v) {
      p = Math.min(6, Math.max(0, v));
      time = 0;
      envKey = -99;
      envAt = -9;
      update(0);
      renderer.render(scene, camera);
    },
    /** How open the cabinet is (0…1), for the labels' opacity. */
    open() {
      return sstep(0.86, 1, p) - sstep(1.08, 1.22, p);
    },
    /** Screen position (CSS px within the canvas) of label `key`, written to `out`. */
    project(key, out) {
      if (doorAnchors[key]) {
        const [obj, local] = doorAnchors[key];
        obj.updateMatrixWorld();
        obj.localToWorld(tmpV.copy(local));
      } else tmpV.copy(anchors[key]);
      tmpV.project(camera);
      out.x = (tmpV.x * 0.5 + 0.5) * width;
      out.y = (-tmpV.y * 0.5 + 0.5) * height;
      return out;
    },
    dispose() {
      const seen = new Set();
      scene.traverse((o) => {
        o.geometry?.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => {
          if (seen.has(m)) return;
          seen.add(m);
          Object.values(m).forEach((v) => v?.isTexture && v.dispose());
          m.dispose();
        });
      });
      sky.geometry.dispose();
      sky.material.dispose();
      disposables.forEach((t) => t.dispose());
      envTarget?.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
