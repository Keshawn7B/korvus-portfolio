const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
const infoCard = document.getElementById('infoCard');
const positionLabel = document.getElementById('positionLabel');
const miniMap = document.getElementById('miniMap');
const stationList = document.getElementById('stationList');

const WORLD = {
  width: 28,
  height: 28,
  cell: 64,
};

const player = {
  x: 14 * WORLD.cell,
  y: 22 * WORLD.cell,
  angle: -Math.PI / 2,
  speed: 180,
};

const keys = new Set();
let dragging = false;
let lastPointerX = 0;
let lastTime = performance.now();
let activeStationId = 'spawn';
let targetStationId = null;

const stations = [
  {
    id: 'spawn',
    x: 14,
    y: 20,
    color: '#76ff91',
    title: 'Spawn: Portfolio Plaza',
    kicker: 'Welcome',
    body: 'This section turns a normal About page into a tiny explorable world. Each sign is a real portfolio story instead of generic resume copy.',
    bullets: ['Blocky first-person exploration', 'Keyboard, mouse, and mobile controls', 'Designed to drop into a portfolio site'],
  },
  {
    id: 'ai-system',
    x: 7,
    y: 15,
    color: '#58c7ff',
    title: 'AI Automation Workshop',
    kicker: 'What I build',
    body: 'I am building a practical personal AI system around Korvus / Hermes: Telegram, Discord, Notion, Gmail, scripts, profiles, and local Linux automation.',
    bullets: ['Multi-platform assistant workflows', 'Privacy-aware profile separation', 'Useful automations over chatbot gimmicks'],
  },
  {
    id: 'game-dev',
    x: 20,
    y: 14,
    color: '#ffe066',
    title: 'Game Dev Biome',
    kicker: 'Creative direction',
    body: 'I am working toward a zero-budget Roblox action game with fast iteration, compact HUDs, playable polish, and real game feel instead of just an idea board.',
    bullets: ['Roblox / Rojo / Vinegar workflow', 'Action-game systems and polish', 'Readable HUD and moment-to-moment feedback'],
  },
  {
    id: 'tools',
    x: 9,
    y: 7,
    color: '#ff8bd1',
    title: 'Builder Toolkit',
    kicker: 'How I work',
    body: 'My work leans practical: Linux, Python, web experiments, Discord/Telegram bots, API integrations, automation scripts, and creative prototypes.',
    bullets: ['Python + Linux automation', 'Web UI experiments', 'APIs, bots, and practical workflows'],
  },
  {
    id: 'learning',
    x: 18,
    y: 6,
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
  const offset = station.id === 'spawn' ? 1.8 : 1.35;
  player.x = station.x * WORLD.cell;
  player.y = (station.y + offset) * WORLD.cell;
  player.angle = -Math.PI / 2;
  targetStationId = station.id;
  setInfo(station, true);
  updateStationButtons(station.id);
  canvas.focus({ preventScroll: true });
}

function updateStationButtons(id) {
  activeStationId = id;
  for (const button of stationList.querySelectorAll('[data-station]')) {
    button.setAttribute('aria-current', button.dataset.station === id ? 'true' : 'false');
  }
}

const blocks = [];
for (let x = 0; x < WORLD.width; x++) {
  for (let y = 0; y < WORLD.height; y++) {
    const edge = x === 0 || y === 0 || x === WORLD.width - 1 || y === WORLD.height - 1;
    const path = (x === 14 && y > 4 && y < 23) || (y === 14 && x > 5 && x < 22) || (y === 7 && x > 8 && x < 20);
    const decorative = !path && !edge && pseudoRandom(x, y) > 0.82;
    if (edge || decorative) {
      blocks.push({ x, y, h: edge ? 2.3 : 1 + pseudoRandom(y, x) * 1.8, type: edge ? 'stone' : 'leaf' });
    }
  }
}

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

function update(dt) {
  let forward = 0;
  let strafe = 0;
  if (keys.has('w') || keys.has('arrowup')) forward += 1;
  if (keys.has('s') || keys.has('arrowdown')) forward -= 1;
  if (keys.has('a') || keys.has('arrowleft')) strafe -= 1;
  if (keys.has('d') || keys.has('arrowright')) strafe += 1;

  const mag = Math.hypot(forward, strafe) || 1;
  if (forward || strafe) targetStationId = null;
  forward /= mag;
  strafe /= mag;

  const moveX = Math.cos(player.angle) * forward + Math.cos(player.angle + Math.PI / 2) * strafe;
  const moveY = Math.sin(player.angle) * forward + Math.sin(player.angle + Math.PI / 2) * strafe;
  const nx = player.x + moveX * player.speed * dt;
  const ny = player.y + moveY * player.speed * dt;

  if (!isBlocked(nx, player.y)) player.x = clamp(nx, WORLD.cell * 1.5, WORLD.cell * (WORLD.width - 1.5));
  if (!isBlocked(player.x, ny)) player.y = clamp(ny, WORLD.cell * 1.5, WORLD.cell * (WORLD.height - 1.5));

  const nearest = getNearestStation();
  if (nearest && nearest.dist < WORLD.cell * 2.1) {
    setInfo(nearest.station, true);
    updateStationButtons(nearest.station.id);
  } else if (!targetStationId) {
    setInfo(stations[0], false);
    updateStationButtons('spawn');
  }

  const cx = Math.floor(player.x / WORLD.cell);
  const cy = Math.floor(player.y / WORLD.cell);
  positionLabel.textContent = `x:${cx} z:${cy}`;
}

function draw() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);

  drawSky(w, h);
  drawGround(w, h);

  const renderables = [];
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
  sky.addColorStop(0, '#6bc9ff');
  sky.addColorStop(0.54, '#b9f0ff');
  sky.addColorStop(0.55, '#14331d');
  sky.addColorStop(1, '#07130e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(255,255,255,.75)';
  pixelCloud(w * 0.14, h * 0.16, 22);
  pixelCloud(w * 0.72, h * 0.11, 18);
}

function pixelCloud(x, y, s) {
  for (const [dx, dy, ww, hh] of [[0,1,4,1], [1,0,4,2], [3,-1,3,2], [6,1,3,1]]) {
    ctx.fillRect(x + dx * s, y + dy * s, ww * s, hh * s);
  }
}

function drawGround(w, h) {
  ctx.fillStyle = '#183d24';
  ctx.fillRect(0, h * 0.55, w, h * 0.45);

  ctx.strokeStyle = 'rgba(130, 255, 151, 0.12)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 34; i++) {
    const y = h * 0.56 + i * i * 0.95;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let i = -18; i <= 18; i++) {
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * 45, h * 0.56);
    ctx.lineTo(w / 2 + i * 150, h);
    ctx.stroke();
  }
}

function project(wx, wy) {
  const dx = wx - player.x;
  const dy = wy - player.y;
  const sin = Math.sin(-player.angle);
  const cos = Math.cos(-player.angle);
  const rx = dx * cos - dy * sin;
  const ry = dx * sin + dy * cos;
  const depth = Math.max(ry, 1);
  const fov = 420;
  const screenX = canvas.clientWidth / 2 + (rx / depth) * fov;
  const horizon = canvas.clientHeight * 0.54;
  const size = (WORLD.cell / depth) * fov;
  return { visible: ry > 20 && Math.abs(screenX - canvas.clientWidth / 2) < canvas.clientWidth * 0.8, x: screenX, y: horizon, depth, size };
}

function drawRenderable(item) {
  if (item.kind === 'block') drawBlock(item);
  else drawStation(item);
}

function drawBlock(item) {
  const { x, y, size } = item.view;
  const base = Math.max(8, size);
  const height = base * item.h;
  const palette = item.type === 'stone'
    ? ['#56625f', '#3a4542', '#6f7f7a']
    : ['#3fa44b', '#247333', '#62c964'];

  ctx.fillStyle = palette[1];
  ctx.fillRect(x - base / 2, y - height, base, height);
  ctx.fillStyle = palette[0];
  ctx.fillRect(x - base / 2, y - height, base * 0.75, height);
  ctx.fillStyle = palette[2];
  ctx.fillRect(x - base / 2, y - height, base, Math.max(4, base * 0.25));
  ctx.strokeStyle = 'rgba(0,0,0,.28)';
  ctx.strokeRect(x - base / 2, y - height, base, height);
}

function drawStation(item) {
  const { x, y, size } = item.view;
  const near = getNearestStation()?.station.id === item.id && getNearestStation()?.dist < WORLD.cell * 2.1;
  const signW = Math.max(42, size * 1.55);
  const signH = Math.max(28, size * 0.85);
  const poleH = Math.max(36, size * 1.3);

  ctx.save();
  ctx.shadowColor = item.color;
  ctx.shadowBlur = near ? 36 : 18;
  ctx.fillStyle = item.color;
  ctx.fillRect(x - 4, y - poleH, 8, poleH);
  ctx.fillStyle = '#301b0f';
  ctx.fillRect(x - signW / 2, y - poleH - signH, signW, signH);
  ctx.fillStyle = item.color;
  ctx.fillRect(x - signW / 2 + 5, y - poleH - signH + 5, signW - 10, 6);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff7d5';
  ctx.font = `${Math.max(10, Math.min(18, signW / 8))}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(item.kicker, x, y - poleH - signH / 2 + 5, signW - 12);
  ctx.restore();
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
  `;
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
window.addEventListener('keydown', e => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));

canvas.addEventListener('pointerdown', e => {
  dragging = true;
  lastPointerX = e.clientX;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - lastPointerX;
  player.angle += dx * 0.006;
  targetStationId = null;
  lastPointerX = e.clientX;
});

for (const btn of document.querySelectorAll('[data-move]')) {
  const map = { forward: 'w', back: 's', left: 'a', right: 'd' };
  const key = map[btn.dataset.move];
  btn.addEventListener('pointerdown', e => { e.preventDefault(); keys.add(key); targetStationId = null; });
  btn.addEventListener('pointerup', () => keys.delete(key));
  btn.addEventListener('pointerleave', () => keys.delete(key));
}

for (const btn of document.querySelectorAll('[data-look]')) {
  const direction = btn.dataset.look === 'left' ? -1 : 1;
  btn.addEventListener('click', e => {
    e.preventDefault();
    player.angle += direction * 0.26;
    targetStationId = null;
  });
}

renderStationButtons();
resizeCanvas();
setInfo(stations[0], false);
requestAnimationFrame(loop);
