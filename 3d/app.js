/* Inside the sound: the scene.
 * Two generic speaker models (built in Blender, exported as glTF), driven in
 * five chapters: exterior, cutaway with explode, the bass mechanism, a computed
 * sound field, and image-source room reflections.  The acoustics are pure
 * functions in acoustics.js, tested in Node. */
import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mountLab, readColors, readTokens, onThemeChange, isDark } from '/assets/lab-kit/lab-kit.js';
import * as A from './acoustics.js';
import { UI, PRODUCTS } from './strings.js';

const ja = document.documentElement.lang === 'ja';
const L = (pair) => (ja ? pair[1] : pair[0]);
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const ASSETS = new URL('./assets/', import.meta.url).href;
const CHAPTERS = ['design', 'inside', 'bass', 'field', 'room'];
const MM = 0.001;
const params = new URLSearchParams(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

const state = {
  product: params.get('speaker') === 'bose' ? 'bose' : 'homepod',
  chapter: CHAPTERS.includes(params.get('chapter')) ? params.get('chapter') : 'design',
  finish: params.get('speaker') === 'bose' ? 'dark' : 'light',
  component: 'shell', explode: 0, phase: 0, playing: false, camera: 'hero',
  freq: 3000, steer: 0, focus: 1, wave: false,           // field, HomePod
  hfreq: 2000, ceiling: 2.7, listenX: 2.2,               // field, Bose (and room)
  placement: 'open', order: 2, beta: 0.7,                // room
};

// ------------------------------------------------------------------ DOM
const canvas = $('#scene');
const analysis = $('#analysis');
const labelLayer = $('#scene-labels');
let lab = null, controls = null, model = null, modelKey = '', meta = null, parts = new Map(), groups = new Map();
let fieldMesh = null, fieldTex = null, fieldN = 0, roomGroup = null, labels = [];
let transition = null;
let colors = {}, tcolors = {};
const TOKENS = ['--accent', '--ink', '--muted', '--paper', '--panel', '--rule'];
const readTheme = () => { colors = readTokens(TOKENS); tcolors = readColors(TOKENS); };
readTheme();

// ------------------------------------------------------------------ copy
function fill() {
  const P = PRODUCTS[state.product];
  const ch = P.chapters[state.chapter];
  $('#scene-kicker').textContent = L(P.name);
  $('#scene-mode').textContent = L(state.chapter === 'inside' && state.explode ? UI.modes.exploded : UI.modes[state.chapter]);
  $('#lesson-kicker').textContent = ja ? ch[3] : ch[0];
  $('#lesson-title').textContent = ja ? ch[4] : ch[1];
  $('#lesson-copy').textContent = ja ? ch[5] : ch[2];
  $$('[data-product]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.product === state.product));
  $$('[data-chapter]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.chapter === state.chapter));
  $$('[data-finish]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.finish === state.finish));
  $$('[data-camera]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.camera === state.camera));
  for (const c of CHAPTERS) { const el = $('#controls-' + c); if (el) el.hidden = state.chapter !== c; }
  $('#field-homepod').hidden = !(state.chapter === 'field' && state.product === 'homepod');
  $('#field-bose').hidden = !(state.chapter === 'field' && state.product === 'bose');
  $('#component-area').hidden = !['inside', 'bass'].includes(state.chapter);
  $('#transport').hidden = state.chapter !== 'bass';
  analysis.hidden = !['bass', 'field', 'room'].includes(state.chapter);
  $('#explode').value = state.explode; $('#explode-value').textContent = state.explode + '%';
  $('#phase').value = Math.round(state.phase * 100); $('#phase-value').textContent = Math.round(state.phase * 100) + '%';
  $('#play').textContent = L(state.playing ? UI.pause : UI.play); $('#play').setAttribute('aria-pressed', state.playing);
  $('#freq').value = state.freq; $('#freq-value').textContent = (state.freq / 1000).toFixed(1) + ' kHz';
  $('#steer').value = state.steer; $('#steer-value').textContent = state.steer + '°';
  $('#focus').value = Math.round(state.focus * 100); $('#focus-value').textContent = Math.round(state.focus * 100) + '%';
  $('#wave').checked = state.wave;
  $('#hfreq').value = state.hfreq; $('#hfreq-value').textContent = state.hfreq >= 1000 ? (state.hfreq / 1000).toFixed(1) + ' kHz' : state.hfreq + ' Hz';
  $('#ceiling').value = state.ceiling; $('#ceiling-value').textContent = state.ceiling.toFixed(1) + ' m';
  $('#ceiling2').value = state.ceiling; $('#ceiling2-value').textContent = state.ceiling.toFixed(1) + ' m';
  $('#listen').value = state.listenX; $('#listen-value').textContent = state.listenX.toFixed(1) + ' m';
  $('#placement').value = state.placement; $('#order').value = state.order;
  $('#beta').value = Math.round(state.beta * 100); $('#beta-value').textContent = Math.round(state.beta * 100) + '%';
  // part buttons
  const list = $('#components');
  if (list.dataset.product !== state.product) {
    list.replaceChildren(...Object.entries(P.components).map(([key, c]) => {
      const b = document.createElement('button'); b.textContent = ja ? c[3] : c[0]; b.dataset.component = key;
      b.addEventListener('click', () => { state.component = key; if (state.chapter === 'design') setChapter('inside', false); else update(); });
      return b;
    }));
    list.dataset.product = state.product;
  }
  if (!P.components[state.component]) state.component = 'shell';
  $$('[data-component]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.component === state.component));
  const c = P.components[state.component];
  $('#component-title').textContent = ja ? c[4] : c[1]; $('#component-copy').textContent = ja ? c[5] : c[2]; $('#component-source').href = c[6];
  $('#component-evidence').textContent = ja ? c[8] : c[7];
  const i = CHAPTERS.indexOf(state.chapter);
  $('#next').textContent = L(UI.next[state.chapter]) + ' →'; $('#step-count').textContent = `${i + 1} / 5`;
  $('#scale-tag').textContent = L(state.chapter === 'room' ? UI.scale.room : state.chapter === 'field' ? UI.scale.field : UI.scale[state.product]);
  $('#view-hint').textContent = L(state.chapter === 'room' ? UI.hintRoom : UI.hint3d);
  const url = new URL(location.href); url.searchParams.set('speaker', state.product); url.searchParams.set('chapter', state.chapter); history.replaceState(null, '', url);
  document.body.dataset.speaker = state.product; document.body.dataset.chapter = state.chapter;
}

// ------------------------------------------------------------------ model loading
const loader = new GLTFLoader();
const gltfCache = {};
async function loadModel(key) {
  if (!gltfCache[key]) {
    gltfCache[key] = Promise.all([
      new Promise((res, rej) => loader.load(ASSETS + key + '.glb', res, undefined, rej)),
      fetch(ASSETS + key + '-meta.json').then((r) => r.json()),
    ]);
  }
  return gltfCache[key];
}
const bl = (v) => new THREE.Vector3(v[0], v[2], -v[1]);   // Blender mm frame -> glTF metres (direction) times MM applied by caller
const blm = (v) => [v[0] * MM, v[2] * MM, -v[1] * MM];   // Blender mm point -> three.js metres
const cabinetHeight = () => (meta?.height ?? 168) * MM;

async function swapModel() {
  if (modelKey === state.product) return;
  const [gltf, m] = await loadModel(state.product);
  if (model) { lab.scene.remove(model); }
  model = gltf.scene.clone(true);   // clone so materials can be tuned per product without touching the cache
  meta = m; modelKey = state.product;
  parts.clear(); groups.clear();
  const byName = new Map(m.parts.map((p) => [p.name, p]));
  model.traverse((o) => {
    if (!o.isMesh) return;
    const p = byName.get(o.name); if (!p) return;
    o.material = o.material.clone();
    o.material.envMapIntensity = 0.9;
    o.userData.part = p; o.userData.base = o.position.clone();
    o.userData.explode = bl(p.explode);          // mm, in the model's own frame (the root is scaled to metres)
    o.userData.baseOpacity = o.material.transparent ? o.material.opacity : 1;
    parts.set(o.name, o);
    if (!groups.has(p.component)) groups.set(p.component, []);
    groups.get(p.component).push(o);
  });
  model.scale.setScalar(MM);                    // the glTF is written in millimetres
  lab.scene.add(model);
  applyFinish();
}

function applyFinish() {
  if (!model) return;
  const dark = state.finish === 'dark';
  for (const [name, o] of parts) {
    const mat = o.material;
    if (name.startsWith('shell_')) { mat.color.set(dark ? 0x1e1e20 : 0x9d9a93); }
    if (name === 'top_ring' || name === 'top_cap' || name === 'plinth') mat.color.set(dark ? 0x232325 : 0xd9d6d0);
  }
}

// per-frame visibility, dimming, explode and bass motion
function layout() {
  if (!model) return;
  const inside = ['inside', 'bass'].includes(state.chapter);
  const cut = inside || state.chapter === 'field';
  const s = state.chapter === 'inside' ? state.explode / 100 : 0;
  const hi = inside ? state.component : null;
  const wofferMove = state.chapter === 'bass' ? Math.sin(state.phase * Math.PI * 2) * 3.2 : 0;   // mm
  const axis = state.product === 'bose' ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
  for (const [name, o] of parts) {
    const p = o.userData.part;
    o.visible = !(cut && name === 'shell_front');
    o.position.copy(o.userData.base).addScaledVector(o.userData.explode, s * 1.4);
    if (state.chapter === 'bass' && /^woofer_(cone|dustcap|former|coil)$/.test(name)) o.position.addScaledVector(axis, wofferMove);
    const mat = o.material;
    const dim = hi && p.component !== hi && p.layer !== 'shell';
    const shellSeeThrough = cut && name.startsWith('shell_');
    mat.transparent = o.userData.baseOpacity < 1 || dim || shellSeeThrough;
    mat.opacity = shellSeeThrough ? 0.16 : dim ? 0.22 : name.startsWith('shell_') ? (state.chapter === 'design' ? 0.96 : o.userData.baseOpacity) : o.userData.baseOpacity;
    mat.depthWrite = mat.opacity > 0.5;
  }
  if (roomGroup) roomGroup.visible = roomWanted();
  if (fieldMesh) fieldMesh.visible = state.chapter === 'field';
  placeModelInRoom();
}

// ------------------------------------------------------------------ camera presets (metres; model stands at the origin)
function preset(which, instant = false) {
  state.camera = which; $$('[data-camera]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.camera === which));
  if (!lab) return;
  const room = state.chapter === 'room', field = state.chapter === 'field';
  const ex = state.chapter === 'inside' ? state.explode / 100 : 0;
  let target, pos;
  if (room) {
    const R = roomDims();
    target = new THREE.Vector3(R.L[0] / 2, 1.1, R.L[2] / 2);
    pos = { hero: [R.L[0] + 2.2, 3.2, R.L[2] + 3.4], front: [R.L[0] / 2, 1.4, R.L[2] + 6], rear: [R.L[0] / 2, 2.2, -5], top: [R.L[0] / 2, 9, R.L[2] / 2 + 0.01] }[which];
  } else if (field) {
    if (state.product === 'homepod') { target = new THREE.Vector3(0, 0.05, 0); pos = { hero: [1.6, 1.5, 2.1], front: [0.01, 1.0, 2.8], rear: [0.01, 1.0, -2.8], top: [0, 3.2, 0.01] }[which]; }
    else { const M = modelOffset(); target = new THREE.Vector3(M.x, state.ceiling / 2, M.z + 0.9); pos = { hero: [M.x + 3.2, state.ceiling * 0.6, M.z + 2.4], front: [M.x + 4.6, state.ceiling / 2, M.z + 0.9], rear: [M.x - 4.6, state.ceiling / 2, M.z + 0.9], top: [M.x, state.ceiling + 3, M.z + 0.91] }[which]; }
  } else {
    const h = cabinetHeight();
    target = new THREE.Vector3(0, h * 0.5 + ex * 0.05, 0);
    const d = 0.36 * (1 + ex * 0.55) * (state.chapter === 'bass' ? 0.7 : 1) * (h / 0.168);
    if (state.chapter === 'bass') { if (state.product === 'homepod') target.set(0, 0.12, 0); else { const w = blm(meta.woofer.p); target.set(w[0], w[1], w[2] + 0.02); } }
    pos = { hero: [d * 0.75, target.y + d * 0.55, d * 0.9], front: [0.001, target.y + d * 0.12, d * 1.3], rear: [0.001, target.y + d * 0.12, -d * 1.3], top: [0, target.y + d * 1.4, 0.001] }[which];
  }
  const end = new THREE.Vector3(...pos);
  controls.minDistance = room ? 2 : field ? 0.6 : 0.22; controls.maxDistance = room ? 16 : field ? 8 : 1.6; controls.maxPolarAngle = Math.PI * 0.9;
  if (instant || reduced.matches) { lab.camera.position.copy(end); controls.target.copy(target); controls.update(); transition = null; }
  else transition = { start: performance.now(), from: lab.camera.position.clone(), to: end, oldTarget: controls.target.clone(), target };
  lab.invalidate();
}
function zoom(f) { if (!lab) return; transition = null; const off = lab.camera.position.clone().sub(controls.target); off.setLength(THREE.MathUtils.clamp(off.length() * f, controls.minDistance, controls.maxDistance)); lab.camera.position.copy(controls.target).add(off); controls.update(); lab.invalidate(); }

// ------------------------------------------------------------------ the room (image-source model)
function roomDims() {
  // room [0, Lx] x [0, Ly(height)] x [0, Lz]; the speaker on a 0.8 m table, listener 2.2 m in front
  const Lx = 4.2, Lz = 5.0, Ly = state.ceiling;
  return { L: [Lx, Ly, Lz] };
}
function modelOffset() {
  // where the model's origin (floor centre of the cabinet) sits inside the room frame
  const { L } = roomDims();
  const backGap = state.placement === 'wall' ? 0.06 : state.placement === 'corner' ? 0.06 : 1.2;
  const x = state.placement === 'corner' ? 0.14 : L[0] / 2;
  return new THREE.Vector3(x, 0.8, backGap);
}
function placeModelInRoom() {
  if (!model) return;
  if (state.chapter === 'room' || (state.chapter === 'field' && state.product === 'bose')) { const o = modelOffset(); model.position.copy(o); }
  else model.position.set(0, 0, 0);
}
function listenerPos() { const o = modelOffset(); return [o.x, 1.15, o.z + state.listenX]; }
function mainSource() {
  const o = modelOffset();
  if (state.product === 'homepod') return [o.x, o.y + (meta?.woofer?.z ?? 146) * MM, o.z];
  const w = blm(meta?.woofer?.p ?? [0, -74, 72]); return [o.x + w[0], o.y + w[1], o.z + w[2]];
}
const roomWanted = () => state.chapter === 'room' || (state.chapter === 'field' && state.product === 'bose');
function buildRoom(withPaths = state.chapter === 'room') {
  if (roomGroup) { lab.scene.remove(roomGroup); roomGroup.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); }); }
  roomGroup = new THREE.Group();
  const { L: R } = roomDims();
  const ink = tcolors.ink || new THREE.Color('#222'), muted = tcolors.muted || new THREE.Color('#777'), accent = tcolors.accent || new THREE.Color('#b5542a');
  // floor, walls as thin planes
  const wallMat = new THREE.MeshStandardMaterial({ color: isDark() ? 0x2a2a2e : 0xe8e4dc, roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 0.55 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(R[0], R[2]), wallMat.clone()); floor.rotation.x = -Math.PI / 2; floor.position.set(R[0] / 2, 0, R[2] / 2); floor.material.opacity = 0.9; roomGroup.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(R[0], R[1]), wallMat); back.position.set(R[0] / 2, R[1] / 2, 0); roomGroup.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(R[2], R[1]), wallMat); left.rotation.y = Math.PI / 2; left.position.set(0, R[1] / 2, R[2] / 2); roomGroup.add(left);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(R[0], R[1], R[2])), new THREE.LineBasicMaterial({ color: muted }));
  edges.position.set(R[0] / 2, R[1] / 2, R[2] / 2); roomGroup.add(edges);
  // table
  const o = modelOffset();
  const table = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.45), new THREE.MeshStandardMaterial({ color: isDark() ? 0x4a4038 : 0xc9b79c, roughness: 0.8 }));
  table.position.set(o.x, 0.785, o.z + 0.1); roomGroup.add(table);
  for (const dx of [-0.4, 0.4]) for (const dz of [-0.16, 0.16]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.77, 0.03), table.material); leg.position.set(o.x + dx, 0.385, o.z + 0.1 + dz); roomGroup.add(leg); }
  // listener: a head
  const lp = listenerPos();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), new THREE.MeshStandardMaterial({ color: ink, roughness: 0.7 })); head.position.set(...lp); roomGroup.add(head);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.55, 20), head.material); body.position.set(lp[0], lp[1] - 0.4, lp[2]); roomGroup.add(body);
  // paths
  const src = mainSource();
  const imgs = withPaths ? A.imageSources(src, R, state.order, state.beta) : [];
  const lineMat = { 0: new THREE.LineBasicMaterial({ color: 0x39877a }), 1: new THREE.LineBasicMaterial({ color: 0xc58447 }), 2: new THREE.LineBasicMaterial({ color: muted, transparent: true, opacity: 0.22 }) };
  for (const im of imgs) {
    let pts;
    if (im.order === 0) pts = [src, lp];
    else if (im.order === 1) { const bp = A.bouncePoint(im, lp, R); pts = bp ? [src, bp, lp] : null; }
    else { const bp = A.bouncePoint(im, lp, R); if (!bp) continue; // second bounce: mirror the first bounce point construction once more
      const im1 = mirrorBack(im, R); const bp2 = im1 ? A.bouncePoint(im1, bp, R) : null; pts = bp2 ? [src, bp2, bp, lp] : null; }
    if (!pts) continue;
    const g = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p)));
    roomGroup.add(new THREE.Line(g, lineMat[im.order]));
  }
  lab.scene.add(roomGroup);
  setLabels(withPaths ? [
    { text: ja ? '受聴点' : 'listener', point: new THREE.Vector3(lp[0], lp[1] + 0.25, lp[2]) },
    { text: ja ? '音源' : 'source', point: new THREE.Vector3(src[0], src[1] + 0.2, src[2]) },
  ] : [{ text: ja ? '受聴点' : 'listener', point: new THREE.Vector3(lp[0], lp[1] + 0.25, lp[2]) }]);
}
// undo one mirroring of a second-order image so that the earlier bounce can be found
function mirrorBack(im, R) {
  for (let i = 0; i < 3; i++) {
    const c = im.p[i];
    if (c < 0) return { p: im.p.map((v, j) => (j === i ? -v : v)), order: 1 };
    if (c > R[i]) return { p: im.p.map((v, j) => (j === i ? 2 * R[i] - v : v)), order: 1 };
  }
  return null;
}

// ------------------------------------------------------------------ the sound-field raster
function fieldSources() {
  if (state.product === 'homepod') {
    const N = meta.tweeters.length;
    const r = Math.hypot(meta.tweeters[0].mouth[0], meta.tweeters[0].mouth[1]) * MM;
    const h = meta.tweeters[0].mouth[2] * MM;
    // the first tweeter faces -Y in Blender = +Z in three; tweeterRing measures azimuth from +x toward +z
    return A.tweeterRing(N, r, h, (90 - state.steer) * Math.PI / 180, state.focus, { offset: Math.PI / 2, width: 1.0 });
  }
  const o = modelOffset();
  const pu = blm(meta.upfire.p), pt = blm(meta.tweeter.p);
  const up = { p: [o.x + pu[0], o.y + pu[1], o.z + pu[2]], amp: 1, phase: 0, delay: 0, dir: (dx, dy) => Math.max(0.03, 0.5 + 0.5 * dy) ** 1.4 };
  const tw = { p: [o.x + pt[0], o.y + pt[1], o.z + pt[2]], amp: 0.7, phase: 0, delay: 0, dir: (dx, dy, dz) => Math.max(0.03, 0.5 + 0.5 * dz) ** 1.2 };
  const R = roomDims().L, out = [];
  for (const s of [up, tw]) {
    out.push(s);
    out.push({ ...s, p: [s.p[0], 2 * R[1] - s.p[1], s.p[2]], amp: s.amp * state.beta, dir: (dx, dy, dz) => s.dir(dx, -dy, dz) });   // ceiling image
    out.push({ ...s, p: [s.p[0], -s.p[1], s.p[2]], amp: s.amp * state.beta * 0.7, dir: (dx, dy, dz) => s.dir(dx, -dy, dz) });   // floor image (table shadows part of it)
  }
  return out;
}
function fieldPlane() {
  if (state.product === 'homepod') return { o: [0, 0.02, 0], u: [1, 0, 0], v: [0, 0, -1], hu: 1.3, hv: 1.3, f: state.freq };
  const o = modelOffset(); const R = roomDims().L;
  return { o: [o.x, R[1] / 2, o.z + 1.2], u: [0, 0, 1], v: [0, 1, 0], hu: 1.5, hv: R[1] / 2, f: state.hfreq };
}
const RAMP = [[0.06, 0.05, 0.12], [0.20, 0.13, 0.42], [0.55, 0.22, 0.42], [0.92, 0.45, 0.20], [0.99, 0.85, 0.35]];
function ramp(t, out, i) {
  t = Math.max(0, Math.min(1, t)) * (RAMP.length - 1); const k = Math.min(RAMP.length - 2, Math.floor(t)); const u = t - k;
  for (let c = 0; c < 3; c++) out[i + c] = Math.round(255 * (RAMP[k][c] * (1 - u) + RAMP[k + 1][c] * u));
}
function ensureField(n) {
  if (fieldMesh && fieldN === n) return;
  if (fieldMesh) { lab.scene.remove(fieldMesh); fieldMesh.geometry.dispose(); fieldTex.dispose(); }
  fieldN = n;
  fieldTex = new THREE.DataTexture(new Uint8Array(n * n * 4), n, n, THREE.RGBAFormat); fieldTex.colorSpace = THREE.SRGBColorSpace; fieldTex.magFilter = THREE.LinearFilter; fieldTex.minFilter = THREE.LinearFilter;
  fieldMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: fieldTex, transparent: true, opacity: 0.92, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
  lab.scene.add(fieldMesh);
}
let fieldDirty = true, lastField = null;
function updateField(t) {
  if (!meta) return;
  const P = fieldPlane();
  const n = state.wave ? 96 : 128;
  ensureField(n);
  const src = fieldSources();
  const data = fieldTex.image.data;
  if (state.wave) {
    const w = A.waveOnPlane(src, P.f, t, P.o, P.u, P.v, P.hu, P.hv, n);
    let max = 0; for (let i = 0; i < w.length; i++) max = Math.max(max, Math.abs(w[i]));
    const ref = lastField?.ref ?? max; lastField = { ref: Math.max(ref * 0.98, max), db: null };
    for (let i = 0; i < w.length; i++) { const v = Math.sign(w[i]) * Math.pow(Math.min(1, Math.abs(w[i]) / lastField.ref), 0.5); ramp(0.5 + 0.5 * v, data, i * 4); data[i * 4 + 3] = 235; }
  } else {
    const f = A.fieldOnPlane(src, P.f, P.o, P.u, P.v, P.hu, P.hv, n);
    // reference: the 96th percentile, so the 1/r peak beside the sources does not swallow the range
    const sorted = Float32Array.from(f.db).sort(); const ref = sorted[Math.floor(sorted.length * 0.995)];
    lastField = { db: f, ref };
    for (let i = 0; i < f.db.length; i++) { ramp(1 + (f.db[i] - ref) / 40, data, i * 4); data[i * 4 + 3] = 235; }
  }
  fieldTex.needsUpdate = true;
  // place the plane
  fieldMesh.position.set(...P.o);
  fieldMesh.scale.set(2 * P.hu, 2 * P.hv, 1);
  if (state.product === 'homepod') fieldMesh.rotation.set(-Math.PI / 2, 0, 0); else fieldMesh.rotation.set(0, -Math.PI / 2, 0);
  fieldMesh.material.opacity = state.product === 'homepod' ? 0.92 : 0.8;
  fieldDirty = false;
}

// ------------------------------------------------------------------ 2D analysis panel
const ctx = analysis.getContext('2d');
function sizeAnalysis() {
  const r = analysis.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1);
  if (analysis.width !== Math.round(r.width * dpr) || analysis.height !== Math.round(r.height * dpr)) { analysis.width = Math.round(r.width * dpr); analysis.height = Math.round(r.height * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w: r.width, h: r.height };
}
function drawAnalysis() {
  if (analysis.hidden) return;
  const { w, h } = sizeAnalysis();
  ctx.clearRect(0, 0, w, h);
  const ink = colors['ink'] || '#222', muted = colors['muted'] || '#777', accent = colors['accent'] || '#b5542a', rule = colors['rule'] || '#ccc';
  ctx.font = '10px system-ui, sans-serif'; ctx.fillStyle = muted; ctx.strokeStyle = rule; ctx.lineWidth = 1;
  if (state.chapter === 'bass') {
    ctx.fillText(L(UI.bassTitle), 12, 14);
    const x0 = 34, x1 = w - 12, y0 = 24, y1 = h - 22, ym = (y0 + y1) / 2;
    ctx.beginPath(); ctx.moveTo(x0, ym); ctx.lineTo(x1, ym); ctx.stroke();
    ctx.fillText('+3 mm', 4, y0 + 8); ctx.fillText('−3 mm', 4, y1);
    ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const t = i / 200; const y = ym - Math.sin(t * Math.PI * 2) * (y1 - y0) / 2 * 0.9; i ? ctx.lineTo(x0 + t * (x1 - x0), y) : ctx.moveTo(x0, y); }
    ctx.stroke();
    const px = x0 + state.phase * (x1 - x0), py = ym - Math.sin(state.phase * Math.PI * 2) * (y1 - y0) / 2 * 0.9;
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = muted; ctx.fillText(ja ? '力 F = B·l·i はコイルに、変位はばね（ダンパーとエッジ）に対して' : 'force F = B·l·i on the coil; displacement against the spider and surround stiffness', x0, h - 8);
    return;
  }
  if (state.chapter === 'field' && state.product === 'homepod') {
    ctx.fillText(L(UI.polarTitle), 12, 14);
    const src = fieldSources();
    const pol = A.polar(src, state.freq, [0, 0.02, 0], [1, 0, 0], [0, 0, 1], 2, 181);
    const cx = w / 2, cy = (h + 18) / 2, R = Math.min(w, h) / 2 - 26;
    for (const db of [0, -12, -24]) { ctx.strokeStyle = rule; ctx.beginPath(); ctx.arc(cx, cy, R * (1 + db / 36), 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = muted; ctx.fillText(db ? db + '' : '0 dB', cx + R * (1 + db / 36) + 3, cy - 2); }
    ctx.strokeStyle = accent; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let i = 0; i <= 181; i++) { const th = 2 * Math.PI * (i % 181) / 181; const r = R * Math.max(0, 1 + pol[i % 181] / 36); const x = cx + r * Math.cos(th), y = cy - r * Math.sin(th); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.closePath(); ctx.stroke();
    // steer marker (front = +z = up on the plot; azimuth in the ring is measured from +x toward +z)
    ctx.strokeStyle = muted; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos((90 - state.steer) * Math.PI / 180), cy - R * Math.sin((90 - state.steer) * Math.PI / 180)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = muted; ctx.fillText(ja ? '前' : 'front', cx - 10, cy - R - 6);
    ctx.fillText(L(state.focus < 0.05 ? UI.omni : UI.steered), 12, h - 8);
    return;
  }
  if (state.chapter === 'field' && state.product === 'bose') {
    ctx.fillText(L(UI.heightTitle), 12, 14);
    const o = modelOffset(); const R = roomDims().L; const lp = listenerPos();
    const pu = blm(meta.upfire.p); const up = [o.x + pu[0], o.y + pu[1], o.z + pu[2]], img = [o.x, 2 * R[1] - up[1], up[2]];
    const x0 = 34, x1 = w - 12, y0 = 22, y1 = h - 22;
    const fLo = 200, fHi = 8000, nF = 240;
    const dbAt = (db) => y1 - (db + 12) / 24 * (y1 - y0);
    ctx.strokeStyle = rule; for (const db of [-12, -6, 0, 6, 12]) { ctx.beginPath(); ctx.moveTo(x0, dbAt(db)); ctx.lineTo(x1, dbAt(db)); ctx.stroke(); ctx.fillStyle = muted; ctx.fillText((db > 0 ? '+' : '') + db, 6, dbAt(db) + 3); }
    for (const f of [200, 500, 1000, 2000, 5000]) { const x = x0 + Math.log(f / fLo) / Math.log(fHi / fLo) * (x1 - x0); ctx.fillText(f >= 1000 ? f / 1000 + 'k' : f, x - 6, h - 8); }
    ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.beginPath();
    const kk = (f) => 2 * Math.PI * f / A.C;
    const r0 = Math.hypot(lp[0] - up[0], lp[1] - up[1], lp[2] - up[2]), r1 = Math.hypot(lp[0] - img[0], lp[1] - img[1], lp[2] - img[2]);
    for (let i = 0; i < nF; i++) {
      const f = fLo * Math.pow(fHi / fLo, i / (nF - 1));
      const re = Math.cos(-kk(f) * r0) / r0 + state.beta * Math.cos(-kk(f) * r1) / r1, im = Math.sin(-kk(f) * r0) / r0 + state.beta * Math.sin(-kk(f) * r1) / r1;
      const db = 20 * Math.log10(Math.hypot(re, im) * r0);
      const x = x0 + i / (nF - 1) * (x1 - x0), y = Math.max(y0, Math.min(y1, dbAt(db)));
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    const dtms = (r1 - r0) / A.C * 1000;
    ctx.fillStyle = muted; ctx.textAlign = 'right'; ctx.fillText((ja ? '天井反射の遅れ ' : 'ceiling bounce arrives ') + dtms.toFixed(2) + ' ms ' + (ja ? '後、' : 'later, ') + (ja ? '最初の打ち消しは ' : 'first notch near ') + (A.C / (2 * (r1 - r0))).toFixed(0) + ' Hz', x1, 14); ctx.textAlign = 'left';
    const fx = x0 + Math.log(state.hfreq / fLo) / Math.log(fHi / fLo) * (x1 - x0); ctx.strokeStyle = muted; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(fx, y0); ctx.lineTo(fx, y1); ctx.stroke(); ctx.setLineDash([]);
    return;
  }
  if (state.chapter === 'room') {
    ctx.fillText(L(UI.echoTitle), 12, 14);
    const R = roomDims().L; const e = A.echogram(mainSource(), listenerPos(), R, state.order, state.beta);
    const x0 = 34, x1 = w - 12, y0 = 22, y1 = h - 22, tMax = 60;
    ctx.strokeStyle = rule; for (const db of [0, -10, -20, -30]) { const y = y1 - (db + 36) / 36 * (y1 - y0); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.fillStyle = muted; ctx.fillText(db + '', 8, y + 3); }
    for (const ms of [0, 10, 20, 30, 40, 50, 60]) { const x = x0 + ms / tMax * (x1 - x0); ctx.fillText(ms + (ms === 60 ? ' ms' : ''), x - 4, h - 8); }
    const col = { 0: '#39877a', 1: '#c58447', 2: muted };
    let n1 = 0, first = null;
    for (const a of e) {
      if (a.dt * 1000 > tMax) continue;
      const x = x0 + a.dt * 1000 / tMax * (x1 - x0), y = y1 - Math.max(0, a.db + 36) / 36 * (y1 - y0);
      ctx.strokeStyle = col[a.order]; ctx.lineWidth = a.order === 0 ? 3 : a.order === 1 ? 2 : 1; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y); ctx.stroke();
      if (a.order === 1) { n1++; if (!first) first = a; }
    }
    ctx.fillStyle = muted; ctx.lineWidth = 1;
    if (first) { ctx.textAlign = 'right'; ctx.fillText((ja ? '最初の反射：' : 'first reflection: ') + (first.dt * 1000).toFixed(1) + ' ms, ' + first.db.toFixed(1) + ' dB · ' + e.length + (ja ? ' 個の到来' : ' arrivals'), x1, 14); ctx.textAlign = 'left'; }
  }
}

// ------------------------------------------------------------------ labels
function setLabels(items) {
  labels = items.map((it) => { const el = document.createElement('div'); el.className = 'scene-label'; el.textContent = it.text; return { ...it, el }; });
  labelLayer.replaceChildren(...labels.map((x) => x.el));
}
function componentLabels() {
  if (roomWanted()) return;
  if (!['inside', 'bass'].includes(state.chapter) || !model) { setLabels([]); return; }
  const g = groups.get(state.component); if (!g) { setLabels([]); return; }
  const box = new THREE.Box3(); for (const o of g) if (o.visible) box.expandByObject(o);
  if (box.isEmpty()) { setLabels([]); return; }
  const c = box.getCenter(new THREE.Vector3()); c.y = box.max.y;
  const P = PRODUCTS[state.product].components[state.component];
  setLabels([{ text: ja ? P[4] : P[1], point: c }]);
}
function projectLabels() {
  if (!lab) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  for (const l of labels) { const p = l.point.clone().project(lab.camera); const x = (p.x * 0.5 + 0.5) * w, y = (-p.y * 0.5 + 0.5) * h; l.el.style.left = Math.max(80, Math.min(w - 80, x)) + 'px'; l.el.style.top = Math.max(50, Math.min(h - 40, y)) + 'px'; l.el.hidden = p.z > 1; }
}

// ------------------------------------------------------------------ update pipeline
async function update() {
  fill();
  if (!lab) return;
  await swapModel();
  placeModelInRoom();
  if (roomWanted()) buildRoom(); else if (roomGroup) roomGroup.visible = false;
  if (state.chapter === 'field') { fieldDirty = true; }
  layout();
  componentLabels();
  drawAnalysis();
  lab.setOnDemand(!(state.playing || (state.chapter === 'field' && state.wave)));
  lab.invalidate();
}
function setChapter(ch, selectDefault = true) {
  state.chapter = ch; state.playing = false; state.phase = 0; state.explode = 0; state.camera = 'hero';
  if (selectDefault) state.component = ch === 'design' ? 'shell' : 'woofer';
  update().then(() => preset('hero'));
}
function selectProduct(p) {
  state.product = p; state.finish = p === 'homepod' ? 'light' : 'dark'; state.component = state.chapter === 'design' ? 'shell' : 'woofer'; state.explode = 0; state.phase = 0; state.playing = false;
  update().then(() => preset('hero'));
}

// ------------------------------------------------------------------ mount
fill();
lab = await mountLab(canvas, {
  maxDpr: 1.75,
  camera: new THREE.PerspectiveCamera(34, 1, 0.01, 60),
  fallback: $('#fallback'),
  async setup({ renderer, scene, camera }) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new RoomEnvironment(); scene.environment = pmrem.fromScene(env, 0.04).texture; scene.environmentIntensity = 0.55; env.dispose?.();
    scene.add(new THREE.HemisphereLight(0xfffcf6, 0xb5b3ad, 0.9));
    const key = new THREE.DirectionalLight(0xfffcf7, 1.8); key.position.set(-3, 5, 4); scene.add(key);
    const fill2 = new THREE.DirectionalLight(0xe9eff4, 0.9); fill2.position.set(4, 2, -2); scene.add(fill2);
    controls = new OrbitControls(camera, canvas); controls.enableDamping = false; controls.enablePan = false; controls.enableZoom = false; controls.rotateSpeed = 0.6;
    controls.touches.ONE = THREE.TOUCH.ROTATE; controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    controls.addEventListener('change', () => lab.invalidate());
    controls.addEventListener('start', () => { transition = null; state.camera = 'custom'; $$('[data-camera]').forEach((b) => b.setAttribute('aria-pressed', 'false')); });
    camera.position.set(0.3, 0.25, 0.4);
    return {
      update(dt, elapsed) {
        if (transition) { const t = Math.min((performance.now() - transition.start) / 500, 1), e = 1 - Math.pow(1 - t, 3); camera.position.lerpVectors(transition.from, transition.to, e); controls.target.lerpVectors(transition.oldTarget, transition.target, e); controls.update(); if (t >= 1) transition = null; else lab.invalidate(); }
        if (state.playing) { state.phase = (state.phase + dt / 3.5) % 1; layout(); $('#phase').value = Math.round(state.phase * 100); $('#phase-value').textContent = Math.round(state.phase * 100) + '%'; drawAnalysis(); }
        if (state.chapter === 'field' && (fieldDirty || state.wave)) { const f = state.product === 'homepod' ? state.freq : state.hfreq; updateField(elapsed * 0.6 / f); }
        projectLabels();
      },
    };
  },
});
if (lab) {
  $('#loading').hidden = true;
  await update();
  preset('hero', true);
  window.__lab = { state, lab, parts, groups, update, preset };
  onThemeChange(() => { readTheme(); if (state.chapter === 'room') buildRoom(); drawAnalysis(); lab.invalidate(); });
  new ResizeObserver(() => drawAnalysis()).observe(analysis);
  // click to select a part
  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5 || !['inside', 'bass'].includes(state.chapter) || !model) return;
    const rect = canvas.getBoundingClientRect(); const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1), lab.camera);
    const hit = ray.intersectObject(model, true).find((h) => h.object.visible && h.object.userData.part && h.object.userData.part.layer !== 'shell');
    if (hit) { state.component = hit.object.userData.part.component; update(); }
  });
  canvas.addEventListener('keydown', (e) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-']; if (!keys.includes(e.key)) return; e.preventDefault(); transition = null;
    const off = lab.camera.position.clone().sub(controls.target), sph = new THREE.Spherical().setFromVector3(off);
    if (e.key === 'ArrowLeft') sph.theta -= 0.13; if (e.key === 'ArrowRight') sph.theta += 0.13; if (e.key === 'ArrowUp') sph.phi = Math.max(0.08, sph.phi - 0.13); if (e.key === 'ArrowDown') sph.phi = Math.min(Math.PI * 0.9, sph.phi + 0.13);
    if (['+', '=', '-'].includes(e.key)) sph.radius = THREE.MathUtils.clamp(sph.radius * (e.key === '-' ? 1.12 : 0.89), controls.minDistance, controls.maxDistance);
    lab.camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sph)); controls.update(); state.camera = 'custom'; $$('[data-camera]').forEach((b) => b.setAttribute('aria-pressed', 'false')); lab.invalidate();
  });
}

// ------------------------------------------------------------------ controls
$$('[data-product]').forEach((b) => b.addEventListener('click', () => selectProduct(b.dataset.product)));
$$('[data-chapter]').forEach((b) => b.addEventListener('click', () => setChapter(b.dataset.chapter)));
$$('[data-camera]').forEach((b) => b.addEventListener('click', () => preset(b.dataset.camera)));
$$('[data-finish]').forEach((b) => b.addEventListener('click', () => { state.finish = b.dataset.finish; applyFinish(); update(); }));
$$('[data-jump]').forEach((b) => b.addEventListener('click', () => { state.product = b.dataset.jump; state.chapter = 'field'; selectProduct(b.dataset.jump); $('.lab').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' }); }));
$('#explode').addEventListener('input', (e) => { state.explode = +e.target.value; update(); if (['hero', 'front', 'rear', 'top'].includes(state.camera)) preset(state.camera, true); });
$('#phase').addEventListener('input', (e) => { state.playing = false; state.phase = +e.target.value / 100; update(); });
$('#play').addEventListener('click', () => { state.playing = !state.playing; update(); });
$('#freq').addEventListener('input', (e) => { state.freq = +e.target.value; update(); });
$('#steer').addEventListener('input', (e) => { state.steer = +e.target.value; update(); });
$('#focus').addEventListener('input', (e) => { state.focus = +e.target.value / 100; update(); });
$('#wave').addEventListener('change', (e) => { state.wave = e.target.checked; lastField = null; update(); });
$('#hfreq').addEventListener('input', (e) => { state.hfreq = +e.target.value; update(); });
for (const id of ['#ceiling', '#ceiling2']) $(id).addEventListener('input', (e) => { state.ceiling = +e.target.value; update().then(() => { if (state.chapter !== 'design') preset(state.camera === 'custom' ? 'hero' : state.camera, true); }); });
$('#listen').addEventListener('input', (e) => { state.listenX = +e.target.value; update(); });
$('#placement').addEventListener('change', (e) => { state.placement = e.target.value; update(); });
$('#order').addEventListener('change', (e) => { state.order = +e.target.value; update(); });
$('#beta').addEventListener('input', (e) => { state.beta = +e.target.value / 100; update(); });
$('#next').addEventListener('click', () => setChapter(CHAPTERS[(CHAPTERS.indexOf(state.chapter) + 1) % CHAPTERS.length]));
$('#zoom-in').addEventListener('click', () => zoom(0.84)); $('#zoom-out').addEventListener('click', () => zoom(1.19));
$('#reset').addEventListener('click', () => { state.finish = state.product === 'homepod' ? 'light' : 'dark'; state.placement = 'open'; state.ceiling = 2.7; state.steer = 0; state.focus = 1; state.freq = 3000; state.hfreq = 2000; state.wave = false; setChapter('design'); });
reduced.addEventListener('change', () => { if (reduced.matches) { state.playing = false; transition = null; update(); } });
