// Conway's Game of Life for the hero canvas. Toroidal grid, paintable with the
// pointer, paused when off-screen or when the tab is hidden.
(function () {
  const canvas = document.querySelector(".life");
  if (!canvas) return;
  const hero = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const genEl = document.querySelector("[data-gen]");
  const aliveEl = document.querySelector("[data-alive]");

  const CELL = 14;
  const TICK = 150;
  let cols = 0, rows = 0, cells, next, age, gen = 0, alive = 0;
  let running = !reduced, visible = true, last = 0, colors = {};

  function readColors() {
    const s = getComputedStyle(document.documentElement);
    colors = { cell: s.getPropertyValue("--cell").trim(), accent: s.getPropertyValue("--accent").trim() };
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = hero.clientWidth, h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const c = Math.ceil(w / CELL), r = Math.ceil(h / CELL);
    if (c === cols && r === rows) return draw();
    const old = cells, oc = cols;
    cols = c; rows = r;
    cells = new Uint8Array(cols * rows);
    next = new Uint8Array(cols * rows);
    age = new Uint8Array(cols * rows);
    if (old) for (let y = 0; y < rows; y++) for (let x = 0; x < Math.min(cols, oc); x++) cells[y * cols + x] = old[y * oc + x] || 0;
    else seed();
    draw();
  }

  // Denser toward the right so the headline on the left stays legible.
  function seed() {
    cells.fill(0); age.fill(0); gen = 0;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const bias = Math.pow(x / cols, 1.6);
      if (Math.random() < 0.04 + bias * 0.18) { cells[y * cols + x] = 1; age[y * cols + x] = 3; }
    }
    for (let i = 0; i < 4; i++) glider(Math.random() * cols * 0.5 | 0, Math.random() * rows | 0);
  }

  function set(x, y, v = 1) {
    x = (x + cols) % cols; y = (y + rows) % rows;
    const i = y * cols + x;
    if (v && !cells[i]) age[i] = 0;
    cells[i] = v;
  }

  function glider(x, y) {
    const flip = Math.random() < 0.5 ? 1 : -1;
    [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]].forEach(([dx, dy]) => set(x + dx * flip, y + dy));
  }

  // An acorn runs for ~5000 generations, so a quiet grid comes back to life.
  function acorn(x, y) {
    [[1, 0], [3, 1], [0, 2], [1, 2], [4, 2], [5, 2], [6, 2]].forEach(([dx, dy]) => set(x + dx, y + dy));
  }

  function step() {
    alive = 0;
    for (let y = 0; y < rows; y++) {
      const up = ((y - 1 + rows) % rows) * cols, mid = y * cols, dn = ((y + 1) % rows) * cols;
      for (let x = 0; x < cols; x++) {
        const l = (x - 1 + cols) % cols, r = (x + 1) % cols;
        const n = cells[up + l] + cells[up + x] + cells[up + r] + cells[mid + l] + cells[mid + r] + cells[dn + l] + cells[dn + x] + cells[dn + r];
        const i = mid + x, on = n === 3 || (n === 2 && cells[i]);
        next[i] = on ? 1 : 0;
        if (on) { alive++; age[i] = cells[i] ? Math.min(age[i] + 1, 255) : 0; }
      }
    }
    [cells, next] = [next, cells];
    gen++;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const s = CELL - 3;
    ctx.fillStyle = colors.cell;
    let count = 0;
    for (let i = 0; i < cells.length; i++) {
      if (!cells[i]) continue;
      count++;
      if (age[i] < 3) continue;
      ctx.fillRect((i % cols) * CELL + 1.5, ((i / cols) | 0) * CELL + 1.5, s, s);
    }
    // Newborn cells glow in the accent colour and fade into the grid.
    ctx.fillStyle = colors.accent;
    for (let i = 0; i < cells.length; i++) {
      if (!cells[i] || age[i] >= 3) continue;
      ctx.globalAlpha = 0.5 - age[i] * 0.15;
      ctx.fillRect((i % cols) * CELL + 1.5, ((i / cols) | 0) * CELL + 1.5, s, s);
    }
    ctx.globalAlpha = 1;
    alive = count;
    if (genEl) genEl.textContent = String(gen).padStart(4, "0");
    if (aliveEl) aliveEl.textContent = alive.toLocaleString();
  }

  function loop(t) {
    requestAnimationFrame(loop);
    if (!running || !visible || document.hidden) return;
    if (t - last < TICK) return;
    last = t;
    step();
    if (gen % 30 === 0 && alive < cols * rows * 0.04) acorn((cols * (0.45 + Math.random() * 0.45)) | 0, (Math.random() * rows) | 0);
    draw();
  }

  // Painting: drag or hover with a fine pointer leaves a trail of live cells.
  let lastPaint = null;
  function paint(e) {
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / CELL) | 0, y = ((e.clientY - r.top) / CELL) | 0;
    const from = lastPaint || { x, y };
    const steps = Math.max(Math.abs(x - from.x), Math.abs(y - from.y), 1);
    for (let k = 0; k <= steps; k++) {
      const px = Math.round(from.x + ((x - from.x) * k) / steps), py = Math.round(from.y + ((y - from.y) * k) / steps);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (Math.random() < 0.55) set(px + dx, py + dy);
    }
    lastPaint = { x, y };
    if (!running) draw();
  }
  hero.addEventListener("pointermove", e => {
    if (e.target.closest("a, button")) return (lastPaint = null);
    if (e.pointerType === "mouse" || e.buttons) paint(e);
  });
  hero.addEventListener("pointerleave", () => (lastPaint = null));
  hero.addEventListener("pointerdown", e => {
    if (e.target.closest("a, button")) return;
    const r = canvas.getBoundingClientRect();
    glider(((e.clientX - r.left) / CELL) | 0, ((e.clientY - r.top) / CELL) | 0);
    if (!running) draw();
  });

  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(hero);
  new ResizeObserver(resize).observe(hero);
  new MutationObserver(() => { readColors(); draw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  window.Life = {
    toggle() { running = !running; return running; },
    reseed() { seed(); draw(); },
    clear() { cells.fill(0); gen = 0; draw(); },
    glider() { for (let i = 0; i < 6; i++) glider(Math.random() * cols | 0, Math.random() * rows | 0); draw(); },
    get running() { return running; },
  };

  readColors();
  resize();
  requestAnimationFrame(loop);
})();
