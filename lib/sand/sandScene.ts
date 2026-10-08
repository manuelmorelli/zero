import * as THREE from "three";

/**
 * Fiume di sabbia dorata in 3D dietro ai contenuti (docs/21_Motion_Guidelines.md, approvato da
 * Manuel il 2026-10-09 dopo la prova su localhost:4000). Il percorso del fiume è fissato alla
 * pagina: una S che scende per tutta la sua altezza, quindi scorrendo la curva scorre con i
 * contenuti mentre i granelli continuano a fluire. Due strati: il fiume con il suo alone di polvere
 * fine dietro alle card, e pochi granelli grandi e sfocati davanti, per la profondità. Il mouse apre
 * piano un varco nella sabbia. Nessun effetto legato alla velocità dello scroll (tolto su richiesta).
 *
 * Modulo caricato solo da computer (vedi components/common/SandBackground.tsx): three.js non
 * arriva mai su telefono.
 */

const FOV = 40;
/** Il punto di spinta del mouse lo insegue lentamente: la sabbia si apre con calma. */
const MOUSE_FOLLOW = 0.02;
const OFFSCREEN = 99999;

const RIVER_VERTEX = /* glsl */ `
  attribute float aT, aSpeed, aSize, aBright, aOff, aJit, aDepth, aHue;
  uniform float uTime, uScroll, uW, uH, uCamZ, uPR, uAlpha, uWidth;
  uniform vec2 uMouse;
  varying vec3 vColor;
  varying float vAlpha;

  float center(float yd) {
    return 0.5 * uW + sin(yd / (uH * 1.15) * 3.14159 + 0.4) * 0.30 * uW + sin(yd / (uH * 0.37) + 1.3) * 0.05 * uW;
  }
  float thick(float yd) {
    return uWidth * uW * (0.6 + 0.4 * sin(yd / (uH * 0.5) + uTime * 0.2));
  }

  void main() {
    float s = fract(aT + uTime * aSpeed);
    float yd = uScroll - 0.6 * uH + s * 2.2 * uH;
    float xd = center(yd) + aOff * thick(yd) + sin(uTime * 0.8 + aJit * 40.0 + yd * 0.01) * 8.0;
    float ydj = yd + cos(uTime * 0.6 + aJit * 30.0) * 6.0;
    vec3 pos = vec3(xd - 0.5 * uW, -(ydj - uScroll - 0.5 * uH), aDepth);

    vec2 d = pos.xy - uMouse;
    float r = length(d);
    pos.xy += normalize(d + 0.0001) * exp(-(r * r) / (2.0 * 160.0 * 160.0)) * 70.0;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // Mai sotto ~2px: un granello da un pixel che si sposta di meno di un pixel per immagine
    // salta da un pixel all'altro e il movimento sembra a scatti.
    float rawSize = aSize * (uCamZ / -mv.z);
    gl_PointSize = max(rawSize, 2.2) * uPR;
    float smallFade = clamp(rawSize / 2.2, 0.35, 1.0);

    float twinkle = 0.8 + 0.2 * sin(uTime * (0.5 + aJit * 1.0) + aJit * 60.0);
    float focus = 1.0 - smoothstep(140.0, 560.0, abs(pos.z));
    vAlpha = mix(0.2, 1.0, focus) * twinkle * uAlpha * smallFade;
    vec3 deep = vec3(1.0, 0.55, 0.12);
    vec3 gold = vec3(1.0, 0.78, 0.38);
    vec3 hot = vec3(1.0, 0.95, 0.82);
    vColor = mix(mix(deep, gold, aHue), hot, smoothstep(1.1, 1.9, aBright)) * aBright;
  }
`;

const RIVER_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = pow(smoothstep(0.5, 0.0, d), 1.8);
    gl_FragColor = vec4(vColor * glow, glow * vAlpha);
  }
`;

type RiverOptions = {
  count: number;
  size: () => number;
  depth: () => number;
  /** Quanto i granelli si allargano attorno al centro del fiume. */
  spread: number;
  alpha: number;
  /** Larghezza del fiume rispetto alla larghezza della finestra. */
  width: number;
};

type SharedUniforms = Record<"uTime" | "uScroll" | "uW" | "uH" | "uCamZ" | "uPR", { value: number }> & {
  uMouse: { value: THREE.Vector2 };
};

function gauss(): number {
  let u = 0;
  let v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function river(shared: SharedUniforms, { count, size, depth, spread, alpha, width }: RiverOptions) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const fill = (name: string, value: () => number) => {
    const values = new Float32Array(count);
    for (let i = 0; i < count; i++) values[i] = value();
    geometry.setAttribute(name, new THREE.BufferAttribute(values, 1));
  };
  fill("aT", Math.random);
  fill("aSpeed", () => 0.005 + Math.random() * 0.012);
  fill("aSize", size);
  fill("aBright", () => 0.35 + Math.pow(Math.random(), 3) * 1.6);
  fill("aOff", () => gauss() * spread);
  fill("aJit", Math.random);
  fill("aDepth", depth);
  fill("aHue", Math.random);
  const material = new THREE.ShaderMaterial({
    uniforms: { ...shared, uAlpha: { value: alpha }, uWidth: { value: width } },
    vertexShader: RIVER_VERTEX,
    fragmentShader: RIVER_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, dispose: () => (geometry.dispose(), material.dispose()) };
}

/** Risoluzione massima dei due strati: i granelli sono punti morbidi, a risoluzione piena non si
 * vede differenza ma la scheda grafica lavora il doppio (e il resto della pagina perde fluidità). */
const BACK_PIXEL_RATIO = 1.25;
const FRONT_PIXEL_RATIO = 1;

function layer(canvas: HTMLCanvasElement, maxPixelRatio: number) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
  renderer.setClearColor(0x000000, 0);
  return { renderer, scene: new THREE.Scene() };
}

/**
 * Avvia la sabbia sui due canvas (dietro e davanti ai contenuti). `animate: false` disegna un solo
 * fotogramma fermo (chi ha chiesto meno movimento). Restituisce la funzione che ferma tutto e
 * libera la scheda grafica.
 */
export function startSand(back: HTMLCanvasElement, front: HTMLCanvasElement, { animate }: { animate: boolean }) {
  const shared: SharedUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uW: { value: 1 },
    uH: { value: 1 },
    uCamZ: { value: 1 },
    uPR: { value: Math.min(window.devicePixelRatio, BACK_PIXEL_RATIO) },
    uMouse: { value: new THREE.Vector2(OFFSCREEN, OFFSCREEN) },
  };

  const backLayer = layer(back, BACK_PIXEL_RATIO);
  const frontLayer = layer(front, FRONT_PIXEL_RATIO);
  const halo = river(shared, { count: 6000, size: () => 0.8 + Math.random() * 1.6, depth: () => gauss() * 300, spread: 2.6, alpha: 0.35, width: 0.11 });
  const main = river(shared, {
    count: 24000,
    size: () => (Math.random() < 0.04 ? 6 + Math.random() * 10 : 1.2 + Math.pow(Math.random(), 2.5) * 4),
    depth: () => gauss() * 220,
    spread: 0.55,
    alpha: 0.9,
    width: 0.11,
  });
  const bokeh = river(shared, { count: 900, size: () => 5 + Math.random() * 12, depth: () => 250 + Math.random() * 300, spread: 1.6, alpha: 0.3, width: 0.14 });
  backLayer.scene.add(halo.points, main.points);
  frontLayer.scene.add(bokeh.points);
  const layers = [backLayer, frontLayer];

  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 6000);
  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    // A z = 0 un'unità corrisponde a un pixel dello schermo.
    camera.position.z = window.innerHeight / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    camera.updateProjectionMatrix();
    shared.uW.value = window.innerWidth;
    shared.uH.value = window.innerHeight;
    shared.uCamZ.value = camera.position.z;
    layers.forEach(({ renderer }) => renderer.setSize(window.innerWidth, window.innerHeight, false));
  };
  resize();

  const mouseTarget = { x: OFFSCREEN, y: OFFSCREEN };
  const mouseNow = { x: OFFSCREEN, y: OFFSCREEN };
  const onPointerMove = (event: PointerEvent) => {
    mouseTarget.x = event.clientX - window.innerWidth / 2;
    mouseTarget.y = window.innerHeight / 2 - event.clientY;
    if (mouseNow.x === OFFSCREEN) Object.assign(mouseNow, mouseTarget);
  };
  const onPointerLeave = () => {
    Object.assign(mouseTarget, { x: OFFSCREEN, y: OFFSCREEN });
    Object.assign(mouseNow, mouseTarget);
  };

  const render = () => {
    shared.uScroll.value = window.scrollY;
    layers.forEach(({ renderer, scene }) => renderer.render(scene, camera));
  };

  const clock = new THREE.Clock();
  let frame = 0;
  const tick = () => {
    frame = requestAnimationFrame(tick);
    // Scheda non visibile: niente lavoro per la scheda grafica.
    if (document.hidden) return;
    mouseNow.x += (mouseTarget.x - mouseNow.x) * MOUSE_FOLLOW;
    mouseNow.y += (mouseTarget.y - mouseNow.y) * MOUSE_FOLLOW;
    shared.uMouse.value.set(mouseNow.x, mouseNow.y);
    shared.uTime.value = clock.getElapsedTime();
    render();
  };

  const onResize = () => {
    resize();
    if (!animate) render();
  };
  window.addEventListener("resize", onResize);
  if (animate) {
    window.addEventListener("pointermove", onPointerMove);
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    frame = requestAnimationFrame(tick);
  } else {
    // Fermo: un fotogramma, ridisegnato solo quando cambia lo scroll o la finestra.
    shared.uTime.value = 12;
    render();
    window.addEventListener("scroll", render, { passive: true });
  }

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", render);
    document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    [halo, main, bokeh].forEach((part) => part.dispose());
    layers.forEach(({ renderer }) => renderer.dispose());
  };
}
