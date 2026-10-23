// Neural aurora behind the hero: a slow WebGL gradient field in the theme's accent colours.
// Renders at reduced resolution, caps at ~30fps, pauses off-screen and when the tab is hidden,
// draws a single still frame for reduced motion, and leaves the CSS backdrop alone without WebGL.
(function () {
  const canvas = document.querySelector(".aurora");
  if (!canvas) return;
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false });
  if (!gl) return canvas.remove();

  const hero = canvas.parentElement;
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SCALE = 0.45;
  const FRAME = 1000 / 30;

  const vert = "attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }";
  const frag = `
    precision mediump float;
    uniform vec2 res; uniform float t; uniform vec2 m;
    uniform vec3 c1; uniform vec3 c2; uniform vec3 c3; uniform float strength;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
    }
    float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }
    float blob(vec2 uv, vec2 c, float r) { vec2 d = uv - c; return exp(-dot(d, d) / (r * r)); }
    void main() {
      vec2 uv = gl_FragCoord.xy / res; float ar = res.x / res.y; vec2 q = vec2(uv.x * ar, uv.y);
      vec2 warp = vec2(fbm(q * 1.4 + vec2(t * 0.025, -t * 0.02)), fbm(q * 1.4 + vec2(-t * 0.018, t * 0.03))) - 0.5;
      vec2 w = q + warp * 0.55;
      vec2 lean = m * vec2(0.18, 0.12);
      float b1 = blob(w, vec2(ar * 0.74 + 0.10 * sin(t * 0.09), 0.58 + 0.10 * cos(t * 0.11)) + lean, 0.42);
      float b2 = blob(w, vec2(ar * 0.88 + 0.12 * cos(t * 0.07), 0.30 + 0.12 * sin(t * 0.13)) + lean * 0.6, 0.34);
      float b3 = blob(w, vec2(ar * 0.58 + 0.10 * sin(t * 0.12 + 1.7), 0.82 + 0.08 * cos(t * 0.08)) + lean * 1.3, 0.30);
      vec3 col = c1 * b1 + c2 * b2 * 0.8 + c3 * b3 * 0.7;
      float a = clamp((b1 + b2 * 0.8 + b3 * 0.7) * strength, 0.0, 1.0);
      a *= smoothstep(0.18, 0.62, uv.x);             // fade out toward the text on the left
      a *= smoothstep(0.0, 0.32, uv.y) * smoothstep(1.0, 0.82, uv.y); // melt into the page below and the nav above
      a *= 0.85 + 0.15 * fbm(q * 3.0 + t * 0.05);    // a little living texture
      gl_FragColor = vec4(col / max(b1 + b2 * 0.8 + b3 * 0.7, 0.001), a);
    }`;

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  const vs = shader(gl.VERTEX_SHADER, vert), fs = shader(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return canvas.remove();
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return canvas.remove();
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const u = name => gl.getUniformLocation(prog, name);
  const U = { res: u("res"), t: u("t"), m: u("m"), c1: u("c1"), c2: u("c2"), c3: u("c3"), strength: u("strength") };

  // Theme colours come from CSS custom properties so light and dark stay in sync.
  const probe = document.createElement("canvas").getContext("2d");
  const rgb = v => { probe.fillStyle = "#000"; probe.fillStyle = v.trim(); const h = probe.fillStyle; return h[0] === "#" ? [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255) : (h.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(n => n / 255); };
  function readTheme() {
    const st = getComputedStyle(root);
    gl.uniform3fv(U.c1, rgb(st.getPropertyValue("--aurora-1")));
    gl.uniform3fv(U.c2, rgb(st.getPropertyValue("--aurora-2")));
    gl.uniform3fv(U.c3, rgb(st.getPropertyValue("--aurora-3")));
    gl.uniform1f(U.strength, parseFloat(st.getPropertyValue("--aurora-strength")) || 0.6);
  }

  function resize() {
    const w = Math.max(1, Math.round(hero.clientWidth * SCALE)), h = Math.max(1, Math.round(hero.clientHeight * SCALE));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.res, w, h);
  }

  let mx = 0, my = 0, tx = 0, ty = 0, visible = true, last = 0, start = performance.now();
  hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = 0.5 - (e.clientY - r.top) / r.height;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { tx = 0; ty = 0; });

  function draw(now) {
    mx += (tx - mx) * 0.04;
    my += (ty - my) * 0.04;
    gl.uniform1f(U.t, (now - start) / 1000 + 20);
    gl.uniform2f(U.m, mx, my);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  function loop(now) {
    requestAnimationFrame(loop);
    if (!visible || document.hidden || now - last < FRAME) return;
    last = now;
    draw(now);
  }

  readTheme();
  resize();
  new ResizeObserver(() => { resize(); if (reduced) draw(start); }).observe(hero);
  new MutationObserver(() => { readTheme(); if (reduced) draw(start); }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(hero);
  root.classList.add("has-aurora");
  if (reduced) draw(start);
  else requestAnimationFrame(loop);
})();
