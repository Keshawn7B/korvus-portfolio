const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
const infoCard = document.getElementById('infoCard');
const positionLabel = document.getElementById('positionLabel');
const miniMap = document.getElementById('miniMap');
const stationList = document.getElementById('stationList');

const WORLD = {
  width: 34,
  height: 34,
  cell: 64,
};

const player = {
  x: 17 * WORLD.cell,
  y: 28 * WORLD.cell,
  angle: -Math.PI / 2,
  speed: 205,
};

const keys = new Set();
let dragging = false;
let lastPointerX = 0;
let lastTime = performance.now();
let activeStationId = 'spawn';
let targetStationId = 'spawn';
let activeStationIndex = 0;

const stations = [
  {
    id: 'spawn',
    x: 17,
    y: 26,
    color: '#76ff91',
    title: 'Spawn: Portfolio Plaza',
    kicker: 'Welcome',
    body: 'This section turns a normal About page into a tiny explorable world. Each sign is a real portfolio story instead of generic resume copy.',
    bullets: ['Blocky guided exploration', 'Simple left/right tour controls', 'Designed to drop into a portfolio site'],
  },
  {
    id: 'ai-system',
    x: 8,
    y: 20,
    color: '#58c7ff',
    title: 'AI Automation Workshop',
    kicker: 'What I build',
    body: 'I am building a practical personal AI system around Korvus / Hermes: Telegram, Discord, Notion, Gmail, scripts, profiles, and local Linux automation.',
    bullets: ['Multi-platform assistant workflows', 'Privacy-aware profile separation', 'Useful automations over chatbot gimmicks'],
  },
  {
    id: 'game-dev',
    x: 26,
    y: 19,
    color: '#ffe066',
    title: 'Game Dev Biome',
    kicker: 'Creative direction',
    body: 'I am working toward a zero-budget Roblox action game with fast iteration, compact HUDs, playable polish, and real game feel instead of just an idea board.',
    bullets: ['Roblox / Rojo / Vinegar workflow', 'Action-game systems and polish', 'Readable HUD and moment-to-moment feedback'],
  },
  {
    id: 'tools',
    x: 10,
    y: 9,
    color: '#ff8bd1',
    title: 'Builder Toolkit',
    kicker: 'How I work',
    body: 'My work leans practical: Linux, Python, web experiments, Discord/Telegram bots, API integrations, automation scripts, and creative prototypes.',
    bullets: ['Python + Linux automation', 'Web UI experiments', 'APIs, bots, and practical workflows'],
  },
  {
    id: 'learning',
    x: 23,
    y: 8,
    color: '#c9ff6a',
    title: 'Learning Tower',
    kicker: 'Where I am growing',
    body: 'I care about becoming better at shipping complete things: readable code, polished interfaces, testable systems, and projects that people can actually use.',
    bullets: ['Stronger project storytelling', 'Better UI/interaction design', 'More verified, demo-ready builds'],
  },
];

function renderStationButtons() {
  stationList.innerHTML = stations.map(station => `
    <button type="button" data-station="${station.id}" aria-current="${station.id === activeStationId ? 'true' : 'false'}">
      ${station.title}
    </button>
  `).join('');

  for (const button of stationList.querySelectorAll('[data-station]')) {
    button.addEventListener('click', () => focusStation(button.dataset.station));
  }
}

function focusStation(id) {
  const station = stations.find(s => s.id === id);
  if (!station) return;
  activeStationIndex = stations.findIndex(s => s.id === id);
  placeCameraForStation(station);
  targetStationId = station.id;
  setInfo(station, true);
  updateStationButtons(station.id);
  canvas.focus({ preventScroll: true });
}

function placeCameraForStation(station) {
  // Keep each sign close enough to feel like the visitor has walked up to it.
  // The carousel already controls navigation, so the camera can sit near the sign
  // instead of holding a distant first-person walking buffer.
  const offset = station.id === 'spawn' ? 1.15 : 1.0;
  player.x = station.x * WORLD.cell;
  player.y = (station.y + offset) * WORLD.cell;
  player.angle = Math.PI;
}

function navigateStation(direction) {
  activeStationIndex = (activeStationIndex + direction + stations.length) % stations.length;
  focusStation(stations[activeStationIndex].id);
}

function updateStationButtons(id) {
  activeStationId = id;
  for (const button of stationList.querySelectorAll('[data-station]')) {
    button.setAttribute('aria-current', button.dataset.station === id ? 'true' : 'false');
  }
}

const blocks = [];
const walkable = new Set();
for (let y = 7; y <= 28; y++) walkable.add(`17:${y}`);
for (let x = 8; x <= 26; x++) walkable.add(`${x}:20`);
for (let x = 10; x <= 23; x++) walkable.add(`${x}:9`);
for (let y = 9; y <= 20; y++) walkable.add(`10:${y}`);
for (let y = 8; y <= 20; y++) walkable.add(`23:${y}`);
for (const s of stations) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) walkable.add(`${s.x + dx}:${s.y + dy}`);
  }
}

for (let x = 0; x < WORLD.width; x++) {
  for (let y = 0; y < WORLD.height; y++) {
    const edge = x === 0 || y === 0 || x === WORLD.width - 1 || y === WORLD.height - 1;
    const path = walkable.has(`${x}:${y}`);
    const districtWall =
      (x === 5 && y > 6 && y < 27) ||
      (x === 29 && y > 7 && y < 26) ||
      (y === 5 && x > 6 && x < 28);
    const decorative = !path && !edge && !districtWall && pseudoRandom(x, y) > 0.78;
    if (edge || districtWall || decorative) {
      const r = pseudoRandom(x * 3.1, y * 4.7);
      const type = edge || districtWall ? 'stone' : r > 0.68 ? 'wood' : r > 0.38 ? 'leaf' : 'glass';
      const h = edge ? 2.8 : districtWall ? 2.1 + r * 1.4 : 0.8 + r * 2.4;
      blocks.push({ x, y, h, type });
    }
  }
}

const pathTiles = [...walkable].map(key => {
  const [x, y] = key.split(':').map(Number);
  return { x, y };
});

function pseudoRandom(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function isBlocked(nx, ny) {
  const cx = Math.floor(nx / WORLD.cell);
  const cy = Math.floor(ny / WORLD.cell);
  return blocks.some(b => b.x === cx && b.y === cy);
}

function update() {
  const station = stations[activeStationIndex] || stations[0];
  positionLabel.textContent = `${activeStationIndex + 1}/${stations.length}: ${station.title}`;
}

function draw() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);

  drawSky(w, h);
  drawGround(w, h);

  const renderables = [];
  for (const tile of pathTiles) renderables.push({ kind: 'path', ...tile, wx: (tile.x + 0.5) * WORLD.cell, wy: (tile.y + 0.5) * WORLD.cell });
  for (const block of blocks) renderables.push({ kind: 'block', ...block, wx: (block.x + 0.5) * WORLD.cell, wy: (block.y + 0.5) * WORLD.cell });
  for (const station of stations) renderables.push({ kind: 'station', ...station, wx: station.x * WORLD.cell, wy: station.y * WORLD.cell });

  renderables
    .map(item => ({ ...item, view: project(item.wx, item.wy) }))
    .filter(item => item.view.visible)
    .sort((a, b) => b.view.depth - a.view.depth)
    .forEach(drawRenderable);

  drawCrosshair(w, h);
  drawMiniMap();
}

function drawSky(w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, '#56b9ff');
  sky.addColorStop(0.46, '#c6f5ff');
  sky.addColorStop(0.48, '#255a31');
  sky.addColorStop(0.68, '#12371f');
  sky.addColorStop(1, '#06150d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#fff2a0';
  ctx.fillRect(w * 0.78, h * 0.09, 40, 40);
  ctx.fillStyle = 'rgba(255,255,255,.72)';
  pixelCloud(w * 0.10, h * 0.17, 18);
  pixelCloud(w * 0.60, h * 0.12, 15);
  pixelCloud(w * 0.34, h * 0.25, 13);

  ctx.fillStyle = 'rgba(7, 23, 13, .52)';
  for (let i = 0; i < 9; i++) {
    const mx = (i * 0.14 - 0.1) * w;
    const mh = h * (0.08 + pseudoRandom(i, 5) * 0.16);
    ctx.beginPath();
    ctx.moveTo(mx, h * 0.48);
    ctx.lineTo(mx + w * 0.12, h * 0.48 - mh);
    ctx.lineTo(mx + w * 0.25, h * 0.48);
    ctx.closePath();
    ctx.fill();
  }
}

function pixelCloud(x, y, s) {
  for (const [dx, dy, ww, hh] of [[0,1,4,1], [1,0,4,2], [3,-1,3,2], [6,1,3,1]]) {
    ctx.fillRect(x + dx * s, y + dy * s, ww * s, hh * s);
  }
}

function drawGround(w, h) {
  const ground = ctx.createLinearGradient(0, h * 0.48, 0, h);
  ground.addColorStop(0, '#245b31');
  ground.addColorStop(0.48, '#10391f');
  ground.addColorStop(1, '#061b10');
  ctx.fillStyle = ground;
  ctx.fillRect(0, h * 0.48, w, h * 0.52);

  ctx.strokeStyle = 'rgba(141, 255, 165, 0.16)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 42; i++) {
    const y = h * 0.50 + i * i * 0.72;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let i = -24; i <= 24; i++) {
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * 32, h * 0.50);
    ctx.lineTo(w / 2 + i * 128, h);
    ctx.stroke();
  }

  const vignette = ctx.createRadialGradient(w / 2, h * 0.55, h * 0.15, w / 2, h * 0.65, h * 0.85);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,.28)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function project(wx, wy) {
  const dx = wx - player.x;
  const dy = wy - player.y;
  const sin = Math.sin(-player.angle);
  const cos = Math.cos(-player.angle);
  const rx = dx * cos - dy * sin;
  const ry = dx * sin + dy * cos;
  const depth = Math.max(ry, 1);
  const fov = canvas.clientWidth < 520 ? 330 : 450;
  const screenX = canvas.clientWidth / 2 + (rx / depth) * fov;
  const horizon = canvas.clientHeight * (canvas.clientWidth < 520 ? 0.49 : 0.52);
  const foregroundLift = clamp(1 - depth / 950, 0, 1) * canvas.clientHeight * (canvas.clientWidth < 520 ? 0.28 : 0.34);
  const screenY = horizon + foregroundLift;
  const size = (WORLD.cell / depth) * fov;
  const visibleWidth = canvas.clientWidth < 520 ? 1.05 : 0.9;
  return { visible: ry > 24 && Math.abs(screenX - canvas.clientWidth / 2) < canvas.clientWidth * visibleWidth, x: screenX, y: screenY, depth, size };
}

function drawRenderable(item) {
  if (item.kind === 'path') drawPathTile(item);
  else if (item.kind === 'block') drawBlock(item);
  else drawStation(item);
}

function drawPathTile(item) {
  const { x, y, size, depth } = item.view;
  const w = Math.max(14, size * 0.92);
  const h = Math.max(5, size * 0.22);
  const alpha = clamp(1 - depth / 1500, 0.08, 0.42);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#8d6a3d';
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y + h * 0.2);
  ctx.lineTo(x + w / 2, y + h * 0.2);
  ctx.lineTo(x + w * 0.34, y + h);
  ctx.lineTo(x - w * 0.34, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 238, 174, .38)';
  ctx.stroke();
  ctx.restore();
}

function drawBlock(item) {
  const { x, y, size, depth } = item.view;
  const base = Math.max(8, size);
  const height = base * item.h;
  const palettes = {
    stone: ['#6f7f7a', '#3a4542', '#91a29b'],
    leaf: ['#3fa44b', '#1f6b31', '#6ee274'],
    wood: ['#8a5b32', '#4b2c18', '#c48749'],
    glass: ['#48c7d9', '#14626e', '#a2f7ff'],
  };
  const palette = palettes[item.type] || palettes.leaf;
  const fog = clamp(depth / 1450, 0, 0.55);

  ctx.save();
  ctx.globalAlpha = 1 - fog * 0.55;
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.fillRect(x - base * 0.55, y + base * 0.05, base * 1.1, Math.max(4, base * 0.18));

  ctx.fillStyle = palette[1];
  ctx.fillRect(x - base / 2, y - height, base, height);
  ctx.fillStyle = palette[0];
  ctx.fillRect(x - base / 2, y - height, base * 0.72, height);
  ctx.fillStyle = palette[2];
  ctx.fillRect(x - base / 2, y - height, base, Math.max(4, base * 0.22));
  ctx.fillStyle = 'rgba(255,255,255,.08)';
  for (let yy = y - height + base * 0.28; yy < y; yy += base * 0.42) {
    ctx.fillRect(x - base / 2 + 3, yy, base - 6, Math.max(1, base * 0.04));
  }
  ctx.strokeStyle = 'rgba(0,0,0,.34)';
  ctx.strokeRect(x - base / 2, y - height, base, height);
  ctx.restore();
}

function drawStation(item) {
  const { x, y, depth } = item.view;
  const visualSize = clamp(item.view.size, 34, canvas.clientWidth < 520 ? 118 : 150);
  const nearest = getNearestStation();
  const near = nearest?.station.id === item.id && nearest?.dist < WORLD.cell * 2.1;
  const signW = Math.max(58, visualSize * 1.55);
  const signH = Math.max(36, visualSize * 0.7);
  const poleH = Math.max(40, visualSize * 0.95);
  const beaconH = Math.max(78, visualSize * 1.75);
  const fog = clamp(depth / 1400, 0, 0.42);

  ctx.save();
  ctx.shadowColor = item.color;
  ctx.shadowBlur = near ? 42 : 22;
  ctx.globalAlpha = near ? 0.42 : 0.25;
  ctx.fillStyle = item.color;
  ctx.fillRect(x - Math.max(4, visualSize * 0.08), y - beaconH, Math.max(8, visualSize * 0.16), beaconH);
  ctx.globalAlpha = 1 - fog;

  ctx.fillStyle = '#2a170d';
  ctx.fillRect(x - 4, y - poleH, 8, poleH);
  ctx.fillStyle = '#3a2112';
  roundRect(x - signW / 2, y - poleH - signH, signW, signH, Math.max(5, signH * 0.16));
  ctx.fill();
  ctx.strokeStyle = item.color;
  ctx.lineWidth = near ? 3 : 2;
  ctx.stroke();
  ctx.fillStyle = item.color;
  ctx.fillRect(x - signW / 2 + 7, y - poleH - signH + 7, signW - 14, 5);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff7d5';
  ctx.font = `900 ${Math.max(10, Math.min(16, signW / 8.5))}px ui-sans-serif, system-ui`;
  ctx.textAlign = 'center';
  ctx.fillText(item.kicker, x, y - poleH - signH / 2 + 5, signW - 12);
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCrosshair(w, h) {
  ctx.strokeStyle = 'rgba(255,255,255,.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 8, h / 2);
  ctx.lineTo(w / 2 + 8, h / 2);
  ctx.moveTo(w / 2, h / 2 - 8);
  ctx.lineTo(w / 2, h / 2 + 8);
  ctx.stroke();
}

function drawMiniMap() {
  miniMap.innerHTML = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${WORLD.width} ${WORLD.height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.innerHTML = `<rect width="${WORLD.width}" height="${WORLD.height}" fill="#0b1d12"/>`;
  for (const s of stations) {
    svg.innerHTML += `<circle cx="${s.x}" cy="${s.y}" r="0.8" fill="${s.color}"/>`;
  }
  svg.innerHTML += `<polygon points="0,-1 0.8,1 -0.8,1" fill="#fff" transform="translate(${player.x / WORLD.cell} ${player.y / WORLD.cell}) rotate(${player.angle * 180 / Math.PI + 90})"/>`;
  miniMap.appendChild(svg);
}

function setInfo(station, active) {
  infoCard.classList.toggle('active', active);
  infoCard.innerHTML = `
    <p class="card-kicker">${station.kicker}</p>
    <h2>${station.title}</h2>
    <p>${station.body}</p>
    <ul>${station.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
    <button class="detail-toggle" type="button" aria-label="Toggle full station details">Details</button>
  `;
  infoCard.querySelector('.detail-toggle')?.addEventListener('click', () => {
    infoCard.classList.toggle('expanded');
  });
}

function getNearestStation() {
  let best = null;
  for (const station of stations) {
    const dx = station.x * WORLD.cell - player.x;
    const dy = station.y * WORLD.cell - player.y;
    const dist = Math.hypot(dx, dy);
    if (!best || dist < best.dist) best = { station, dist };
  }
  return best;
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  if (e.repeat) return;
  if (key === 'arrowleft' || key === 'a') {
    e.preventDefault();
    navigateStation(-1);
  }
  if (key === 'arrowright' || key === 'd') {
    e.preventDefault();
    navigateStation(1);
  }
});

canvas.addEventListener('pointerdown', e => {
  dragging = true;
  lastPointerX = e.clientX;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointerup', e => {
  if (!dragging) return;
  const dx = e.clientX - lastPointerX;
  dragging = false;
  if (Math.abs(dx) > 42) navigateStation(dx < 0 ? 1 : -1);
});
canvas.addEventListener('pointercancel', () => { dragging = false; });

for (const btn of document.querySelectorAll('[data-tour]')) {
  const direction = btn.dataset.tour === 'prev' ? -1 : 1;
  btn.addEventListener('click', e => {
    e.preventDefault();
    navigateStation(direction);
  });
}

renderStationButtons();
resizeCanvas();
focusStation('spawn');
requestAnimationFrame(loop);
