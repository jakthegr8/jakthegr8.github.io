(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const EMAIL = "iam.arunkumar.tech@gmail.com";
  const LINKS = {
    LinkedIn: "https://www.linkedin.com/in/arunkumarjayakodi",
    Tulifo: "https://tulifo.com",
    "Hugging Face": "https://huggingface.co/Tulifo",
    GitHub: "https://github.com/jakthegr8",
    Medium: "https://medium.com/@arun.ranush",
    Blog: "https://jak-ruby.blogspot.com/",
    "Stack Overflow": "https://stackoverflow.com/users/936747/jak",
    HackerRank: "https://www.hackerrank.com/arun_ranush",
  };

  $("[data-year]").textContent = new Date().getFullYear();
  if (!/Mac|iP(hone|ad)/.test(navigator.platform)) $$("kbd").forEach(k => (k.textContent = k.textContent.replace("⌘K", "Ctrl K")));

  /* ---------- toast ---------- */
  const toastEl = $(".toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
  }

  /* ---------- theme, with a circular reveal from the toggle ---------- */
  function applyTheme(t) {
    root.dataset.theme = t;
    try { localStorage.setItem("theme", t); } catch (e) {}
    $('meta[name="theme-color"]').content = t === "light" ? "#efe9dc" : "#0e0d0b";
  }
  function toggleTheme(origin) {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    if (!document.startViewTransition || reduced) return applyTheme(next);
    const r = (origin || $("[data-theme-toggle]")).getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(() => applyTheme(next)).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(0.2, 0.7, 0, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  }
  $("[data-theme-toggle]").addEventListener("click", e => toggleTheme(e.currentTarget));

  /* ---------- nav: scrolled state and a sliding active pill ---------- */
  const nav = $(".nav");
  const links = $$(".nav__links a");
  const pill = document.createElement("span");
  pill.className = "pill";
  pill.style.opacity = 0;
  $(".nav__links").prepend(pill);
  function movePill(a) {
    if (!a) return (pill.style.opacity = 0);
    pill.style.opacity = 1;
    pill.style.left = a.offsetLeft + "px";
    pill.style.width = a.offsetWidth + "px";
  }
  addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", scrollY > (root.classList.contains("dock") ? $(".hero").offsetHeight * 0.55 : 40));
    if (!CSS.supports("animation-timeline: scroll()")) {
      $(".progress").style.setProperty("--p", scrollY / (root.scrollHeight - innerHeight || 1));
    }
  }, { passive: true });
  const sectionIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const a = links.find(l => l.hash === "#" + en.target.id);
      links.forEach(l => l.classList.toggle("is-active", l === a));
      movePill(a);
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  // Observe whatever sections the page has, so a renamed or removed section can't stop the script.
  $$("main > section[id]").forEach(el => sectionIO.observe(el));

  /* ---------- split headings into masked words ---------- */
  $$(".split").forEach(el => {
    let i = 0;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.append(" ");
        const w = document.createElement("span");
        w.className = "w";
        w.innerHTML = `<span style="--i:${i++}"></span>`;
        w.firstChild.textContent = part;
        frag.append(w);
      });
      node.replaceWith(frag);
    });
  });

  /* ---------- scroll reveals and counters ---------- */
  function countUp(el) {
    const end = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    if (reduced) return (el.textContent = pre + end + suf);
    const start = performance.now(), dur = 1400;
    (function tick(t) {
      const p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = pre + Math.round(end * e) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("in");
      $$("[data-count]", el).forEach(countUp);
      revealIO.unobserve(el);
    });
  }, { rootMargin: "0px 0px -12% 0px" });
  function observeReveals(scope = document) {
    $$(".reveal, .split", scope).forEach(el => {
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains("reveal"));
      el.style.setProperty("--rd", Math.min(sibs.indexOf(el), 6) * 80 + "ms");
      revealIO.observe(el);
    });
  }
  observeReveals();

  /* ---------- Tulifo interview flow: hover, tap or focus a stage ---------- */
  const STAGES = [
    { title: "Candidate joins", text: "Xiya introduces the role and explains how the session works, in the candidate's own language. Consent is recorded and versioned before anything is shared.", stack: "Any role · 10 languages · Consent first" },
    { title: "Integrity checks", text: "Identity, live camera, faces in frame, editor input and window focus are fused into one picture of the session's integrity, and logged so results can be audited.", stack: "Identity matched · One face in frame · Window focus" },
    { title: "Xiya interviews", text: "A fully autonomous video interview: Xiya asks follow-ups, hears many languages and keeps a fair pace, with background verification running alongside.", stack: "Follow-up questions · Vernacular speech · BGV built in" },
    { title: "Rubric scoring", text: "Answers are scored against a rubric people can read — role knowledge, communication and problem solving — not a black-box number.", stack: "Role knowledge · Communication · Problem solving" },
    { title: "People decide", text: "Xiya recommends and explains in a single report with the background check. A person on the employer's team makes every hiring decision.", stack: "Scored report · Human in the loop · ISO 27001 path" },
  ];
  const flow = $("[data-flow]");
  if (flow) {
    const nodes = $$(".flow__node", flow), detail = $(".flow__detail", flow);
    let stage = 0;
    const show = i => {
      if (i === stage && detail.dataset.ready) return;
      stage = i;
      detail.dataset.ready = 1;
      nodes.forEach((n, k) => { n.classList.toggle("is-on", k === i); n.setAttribute("aria-selected", String(k === i)); });
      $("[data-flow-title]", flow).textContent = STAGES[i].title;
      $("[data-flow-text]", flow).textContent = STAGES[i].text;
      $("[data-flow-chips]", flow).textContent = STAGES[i].stack;
      flow.style.setProperty("--fx", 10 + i * 20 + "%");
      detail.classList.remove("swap"); void detail.offsetWidth; detail.classList.add("swap");
    };
    nodes.forEach((n, i) => ["mouseenter", "click", "focus"].forEach(ev => n.addEventListener(ev, () => show(i))));
  }

  /* ---------- experience timeline fills as you scroll ---------- */
  const timeline = $("[data-timeline]");
  if (timeline) {
    const roleEls = $$(".role", timeline);
    const update = () => {
      const r = timeline.getBoundingClientRect(), mark = innerHeight * 0.55;
      timeline.style.setProperty("--tl", Math.max(0, Math.min(1, (mark - r.top) / r.height)).toFixed(4));
      roleEls.forEach(el => el.classList.toggle("is-past", el.getBoundingClientRect().top < mark));
    };
    addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    addEventListener("resize", update);
    update();
  }

  /* ---------- How I build with AI: pillars take the spotlight as they scroll past ---------- */
  // While a pillar is active, a light runs around the loop with your scroll; the first time a
  // pillar arrives, its points stream in word by word and its proof line decodes.
  const ai = $("[data-ai]");
  if (ai) {
    const pillars = $$(".pillar", ai), links = $$("[data-pillar]", ai), nodesEl = $(".loop__nodes", ai), core = $("[data-ai-core]", ai);
    const ring = $(".loop__ring", ai), spark = $(".loop__spark", ai);
    const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*";
    let current = -1, nodes = [];
    if (!reduced) pillars.forEach(p => {
      $$(".pillar__points li", p).forEach(li => {
        // One wrapper keeps the words in the text column of the point's grid
        li.innerHTML = "<span>" + li.textContent.trim().split(/\s+/).map(w => `<span class="tok">${esc(w)} </span>`).join("") + "</span>";
      });
      const proof = $(".pillar__proof b", p);
      proof.dataset.final = proof.textContent;
      proof.textContent = "—";
    });
    const decode = el => {
      const target = el.dataset.final, start = performance.now(), dur = 700;
      (function tick(now) {
        const t = Math.min(1, (now - start) / dur), fixed = Math.floor(t * target.length);
        el.textContent = t >= 1 ? target : target.split("").map((ch, k) => (k < fixed || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    };
    const stream = p => {
      if (reduced || p.dataset.streamed) return;
      p.dataset.streamed = "1";
      const toks = $$(".tok", p);
      toks.forEach((t, k) => setTimeout(() => t.classList.add("in"), k * 22));
      setTimeout(() => decode($(".pillar__proof b", p)), Math.min(toks.length * 22, 800));
    };
    const progress = () => {
      if (current < 0) return;
      const r = pillars[current].getBoundingClientRect();
      const p = reduced ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.55 - r.top) / r.height));
      ring.style.setProperty("--trail", (p * 100).toFixed(1));
      const a = p * Math.PI * 2 - Math.PI / 2;
      spark.setAttribute("cx", (100 + 78 * Math.cos(a)).toFixed(2));
      spark.setAttribute("cy", (100 + 78 * Math.sin(a)).toFixed(2));
      spark.style.opacity = p > 0.01 && p < 0.99 ? 1 : 0;
      const act = Math.min(nodes.length - 1, Math.floor(p * nodes.length));
      nodes.forEach((el, k) => { el.classList.toggle("is-on", k === act && p < 0.99); el.classList.toggle("is-done", k < act || p >= 0.99); });
    };
    const activate = (i, arrived) => {
      if (i !== current) {
        current = i;
        pillars.forEach((p, k) => p.classList.toggle("is-on", k === i));
        links.forEach((l, k) => l.classList.toggle("is-on", k === i));
        core.textContent = pillars[i].dataset.core;
        const stages = pillars[i].dataset.stages.split(",");
        nodesEl.innerHTML = stages.map((st, k) => {
          const a = (k / stages.length) * Math.PI * 2 - Math.PI / 2;
          return `<span class="loop__node" style="--x:${Math.cos(a).toFixed(3)};--y:${Math.sin(a).toFixed(3)};--k:${k}">${esc(st)}</span>`;
        }).join("");
        nodes = $$(".loop__node", nodesEl);
      }
      if (arrived) stream(pillars[i]);
      progress();
    };
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) activate(pillars.indexOf(en.target), true); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    pillars.forEach(p => io.observe(p));
    addEventListener("scroll", () => requestAnimationFrame(progress), { passive: true });
    links.forEach((l, i) => l.addEventListener("click", e => {
      e.preventDefault();
      pillars[i].scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    }));
    activate(0, false);
  }

  /* ---------- footprint: dot-matrix world map with a scroll-driven camera ---------- */
  const MAP = {"cols": 144, "rows": 52, "lat0": 75, "step": 2.5, "rle": "m.4.8.2.1.1.c.e.t.2.a.c.b.1.f|0.1.8.1.f.5.3.2.1.7.8.c.u.2.4.3.1.l.1.8.b|5.l.1.1.1.1.4.3.1.2.2.3.6.a.i.8.6.1.1.4.1.1.1.16|0.4.2.w.4.5.4.7.7.1.b.9.1.1.2.1i|8.s.1.1.1.1.3.3.5.5.8.1.b.4.1.1q.1|6.s.7.2.9.3.j.5.2.1i.1.5.3|7.4.6.i.6.6.r.5.2.1c.7.1.7|8.1.a.i.4.6.n.1.4.1.1.1.2.1b.7.3.7|k.j.1.9.j.2.1.1.3.1h.6.2.8|l.t.k.1m.g|m.m.1.1.2.3.j.1m.g|m.o.p.d.1.1.1.5.1.y.h|m.m.r.4.1.1.1.5.5.3.1.y.3.1.e|m.l.p.5.4.2.1.4.1.2.1.4.2.u.4.1.f|n.j.q.4.6.1.1.1.2.9.2.p.3.1.5.1.f|n.j.u.4.9.z.3.1.2.2.g|p.g.s.7.a.y.5.1.i|p.1.1.c.t.b.1.3.1.1.1.z.n|q.8.5.1.s.n.1.t.n|s.5.6.1.q.k.1.5.2.q.o|t.4.x.k.1.8.4.k.1.1.n|u.3.3.1.s.m.1.8.4.7.2.6.t|u.4.1.2.6.2.l.l.1.7.6.5.4.4.1.1.s|x.4.s.n.1.4.8.4.6.4.5.1.n|10.3.q.q.b.2.7.5.4.2.m|16.1.1.1.l.n.2.1.a.2.7.1.1.2.t|13.1.1.7.j.p.j.1.a.1.l|15.8.j.5.1.i.c.1.7.1.v|15.b.o.f.k.2.4.2.p|14.c.o.e.m.2.2.3.p|14.e.m.d.n.2.2.3.1.1.3.2.i|14.h.j.c.p.1.6.1.5.4.e|14.i.j.b.q.1.c.4.d|14.i.j.b.v.2.1.1.5.1.f|15.g.k.b.1k|15.f.l.b.3.1.w.2.i|17.d.l.b.2.2.t.6.2.1.e|18.c.l.9.4.2.t.a.d|18.c.l.9.3.2.r.e.c|18.a.o.8.3.2.q.f.c|18.9.p.7.w.g.b|17.9.r.6.x.f.b|17.9.r.5.y.f.b|17.8.s.3.10.4.4.7.b|17.6.27.4.c|17.5.2a.1.b.1.1|16.4.2c.1.a.1.2|17.3.2m.1.3|16.3.2m.1.4|16.3.2r|16.2.4.1.2n|17.2.2r"};
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const span = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)));
  const mapEl = $("[data-map]");
  if (mapEl) {
    const land = new Uint8Array(MAP.cols * MAP.rows);
    MAP.rle.split("|").forEach((row, r) => {
      let c = 0, v = 0;
      row.split(".").forEach(run => { const n = parseInt(run, 36); if (v) land.fill(1, r * MAP.cols + c, r * MAP.cols + c + n); c += n; v ^= 1; });
    });
    const canvas = $(".map__dots", mapEl), ctx = canvas.getContext("2d"), svg = $(".map__arcs", mapEl);
    const pins = $$(".pin", mapEl), foot = $(".footprint"), journey = $("[data-journey]");
    const home = pins.find(p => p.dataset.country === "in"), away = pins.filter(p => p !== home);
    const toGrid = (lat, lon) => ({ c: (lon + 180) / MAP.step, r: (MAP.lat0 - lat) / MAP.step });
    const WORLD = { c: MAP.cols / 2, r: MAP.rows / 2, z: 1 };
    let geo = null, cam = { ...WORLD }, focus = [], journeyFocus = [];

    // The camera looks at grid cell (c, r) with zoom z; z = 1 fits the whole world.
    const project = (c, r) => { const cell = geo.cell * cam.z; return [geo.w / 2 + (c - cam.c) * cell, geo.h / 2 + (r - cam.r) * cell]; };
    const pinPoint = p => { const g = toGrid(+p.dataset.lat, +p.dataset.lon); return project(g.c, g.r); };

    function layout() {
      const w = mapEl.clientWidth, h = mapEl.clientHeight, pad = 0.04;
      geo = { w, h, cell: Math.min((w * (1 - pad * 2)) / MAP.cols, (h * (1 - pad * 2)) / MAP.rows) };
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      if (!svg.children.length) svg.innerHTML = away.map(() => '<path pathLength="1"/>').join("");
      render();
    }
    function render() {
      if (!geo) return;
      pins.forEach(p => { const [x, y] = pinPoint(p); p.style.setProperty("--px", x + "px"); p.style.setProperty("--py", y + "px"); });
      const [hx, hy] = pinPoint(home);
      [...svg.children].forEach((path, i) => {
        const [x, y] = pinPoint(away[i]), mx = (x + hx) / 2, my = Math.min(y, hy) - Math.abs(x - hx) * 0.28;
        path.setAttribute("d", `M${hx},${hy} Q${mx},${my} ${x},${y}`);
      });
      draw();
    }
    function draw() {
      const st = getComputedStyle(root), base = st.getPropertyValue("--cell").trim(), accent = st.getPropertyValue("--accent").trim();
      const fp = pins.filter(p => focus.includes(p.dataset.country)).map(p => toGrid(+p.dataset.lat, +p.dataset.lon));
      const cell = geo.cell * cam.z, rad = cell * 0.32;
      const c0 = Math.max(0, Math.floor(cam.c - geo.w / 2 / cell) - 1), c1 = Math.min(MAP.cols, Math.ceil(cam.c + geo.w / 2 / cell) + 1);
      const r0 = Math.max(0, Math.floor(cam.r - geo.h / 2 / cell) - 1), r1 = Math.min(MAP.rows, Math.ceil(cam.r + geo.h / 2 / cell) + 1);
      ctx.clearRect(0, 0, geo.w, geo.h);
      for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) {
        if (!land[r * MAP.cols + c]) continue;
        const near = fp.some(g => Math.hypot(c + 0.5 - g.c, r + 0.5 - g.r) < 6);
        const [x, y] = project(c + 0.5, r + 0.5);
        ctx.fillStyle = near ? accent : base;
        ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      }
    }
    function setFocus(list) {
      focus = list || [];
      foot.classList.toggle("is-focus", focus.length > 0);
      pins.forEach(p => p.classList.toggle("is-on", focus.includes(p.dataset.country)));
      $$(".teams li", foot).forEach(li => li.classList.toggle("is-on", focus.length > 0 && li.dataset.country.split(" ").some(c => focus.includes(c))));
      if (geo) draw();
    }
    $$(".pin, .teams li", foot).forEach(el => {
      el.addEventListener("mouseenter", () => setFocus(el.dataset.country.split(" ")));
      el.addEventListener("mouseleave", () => setFocus(journeyFocus));
    });
    pins.forEach(p => {
      p.addEventListener("focus", () => setFocus([p.dataset.country]));
      p.addEventListener("blur", () => setFocus(journeyFocus));
    });

    // Journey: the map stays pinned while the camera flies between stops and a story card follows.
    // Phones and tablets get a static map: the scroll-driven camera redraws on every frame and lags there.
    const compact = matchMedia("(max-width: 960px), (pointer: coarse)").matches;
    if (journey && !reduced && !compact) {
      journey.classList.add("journey--live");
      const stops = $$("[data-stop]", journey).map(li => {
        const g = li.hasAttribute("data-overview") ? WORLD : { ...toGrid(+li.dataset.lat, +li.dataset.lon), z: +li.dataset.zoom };
        return { c: g.c, r: g.r, z: g.z, focus: li.dataset.focus ? li.dataset.focus.split(" ") : [], k: $("b", li).textContent, t: $("h4", li).textContent, x: $("p", li).textContent };
      });
      const card = $(".journey__card", journey), dots = $$(".journey__dots li", journey);
      let shown = -1;
      const showCard = i => {
        if (i === shown) return;
        shown = i;
        $("[data-k]", card).textContent = stops[i].k;
        $("[data-t]", card).textContent = stops[i].t;
        $("[data-x]", card).textContent = stops[i].x;
        dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
        card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
        journeyFocus = stops[i].focus;
        setFocus(journeyFocus);
      };
      const update = () => {
        const r = journey.getBoundingClientRect(), travel = Math.max(1, r.height - innerHeight);
        const f = Math.min(1, Math.max(0, -r.top / travel)) * (stops.length - 1);
        const i = Math.min(stops.length - 2, Math.floor(f)), m = easeInOut(span(f - i, 0.3, 1)); // rest at each stop, then fly
        const a = stops[i], b = stops[i + 1], far = Math.min(1, Math.hypot(b.c - a.c, b.r - a.r) / 60);
        cam = {
          c: a.c + (b.c - a.c) * m,
          r: a.r + (b.r - a.r) * m,
          z: a.z * Math.pow(b.z / a.z, m) * (1 - 0.45 * far * Math.sin(Math.PI * m)), // pull back on long flights
        };
        showCard(m > 0.5 ? i + 1 : i);
        render();
      };
      addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
      addEventListener("resize", () => requestAnimationFrame(update));
      layout();
      update();
    } else {
      layout();
    }
    new IntersectionObserver(([en]) => { if (en.isIntersecting) mapEl.classList.add("in"); }).observe(mapEl);
    new ResizeObserver(layout).observe(mapEl);
    new MutationObserver(() => geo && draw()).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* ---------- hero: parallax layers, and the name docking into the logo ---------- */
  const heroEl = $(".hero"), heroTitle = $(".hero__title"), logo = $(".nav__logo");
  if (heroEl && heroTitle && logo && !reduced) {
    const fades = $$(".hero__fade", heroEl), figure = $(".hero__portrait", heroEl), aurora = $(".aurora", heroEl);
    let base = null;
    const measure = () => {
      heroTitle.style.translate = heroTitle.style.scale = "";
      const t = heroTitle.getBoundingClientRect(), l = logo.getBoundingClientRect();
      base = { left: t.left, top: t.top + scrollY, s: Math.min(1, (l.height * 1.15) / t.height) };
      dock();
    };
    function dock() {
      const y = scrollY, p = span(y, 0, heroEl.offsetHeight * 0.55), k = easeInOut(p), l = logo.getBoundingClientRect();
      heroTitle.style.translate = `${(l.left - base.left) * k}px ${(l.top - (base.top - y)) * k}px`;
      heroTitle.style.scale = String(1 - (1 - base.s) * k);
      heroTitle.style.opacity = String(1 - span(p, 0.82, 1));
      root.style.setProperty("--logo-in", span(p, 0.82, 1).toFixed(3));
      fades.forEach(f => { f.style.opacity = String(1 - span(p, 0, 0.45)); f.style.translate = `0 ${-p * 60}px`; });
      if (figure) figure.style.translate = `0 ${y * 0.18}px`;   // the orb drifts slower than the page
      if (aurora) aurora.style.translate = `0 ${y * 0.42}px`;   // the aurora slowest of all
    }
    root.classList.add("dock");
    addEventListener("scroll", () => requestAnimationFrame(dock), { passive: true });
    addEventListener("resize", measure);
    measure();
    if (document.fonts) document.fonts.ready.then(measure);
  }

  /* ---------- 3D portrait follows the pointer ---------- */
  const portrait = $("[data-portrait]");
  if (portrait && finePointer && !reduced) {
    const stage = $(".p3d__stage", portrait);
    portrait.addEventListener("pointermove", e => {
      const r = portrait.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty("--ty", px * 18 + "deg");
      stage.style.setProperty("--tx", -py * 12 + "deg");
    });
    portrait.addEventListener("pointerleave", () => { stage.style.setProperty("--ty", "0deg"); stage.style.setProperty("--tx", "0deg"); });
  }

  /* ---------- pointer effects: cursor glow, card edge light, magnetic buttons, tilt ---------- */
  if (finePointer && !reduced) {
    // A soft light that trails the cursor (the hero has its own bloom inside the aurora),
    // and an accent edge on cards that brightens as the cursor approaches them.
    const SPOT = ".card, .product, .model, .feature, .cap";
    const glow = document.createElement("div");
    glow.className = "cursor-glow is-hidden";
    glow.setAttribute("aria-hidden", "true");
    document.body.append(glow);
    let gx = -999, gy = -999, cx = -999, cy = -999, dirty = false, out = true, inHero = false, onTarget = false;
    addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      if (out) { gx = e.clientX; gy = e.clientY; }
      cx = e.clientX; cy = e.clientY; dirty = true; out = false;
      inHero = !!e.target.closest(".hero");
      onTarget = !!e.target.closest("a, button, [data-copy]");
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => { out = true; dirty = true; });
    addEventListener("scroll", () => (dirty = true), { passive: true });
    (function frame() {
      requestAnimationFrame(frame);
      const settled = Math.abs(cx - gx) < 0.3 && Math.abs(cy - gy) < 0.3;
      if (!dirty && settled) return;
      gx += (cx - gx) * 0.16;
      gy += (cy - gy) * 0.16;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      glow.classList.toggle("is-hidden", out || inHero);
      glow.classList.toggle("is-target", onTarget);
      if (!dirty) return;
      dirty = false;
      $$(SPOT).forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const d = out ? 999 : Math.hypot(Math.max(r.left - cx, 0, cx - r.right), Math.max(r.top - cy, 0, cy - r.bottom));
        el.style.setProperty("--mx", cx - r.left + "px");
        el.style.setProperty("--my", cy - r.top + "px");
        el.style.setProperty("--spot", Math.max(0, 1 - d / 160).toFixed(3));
      });
    })();

    document.addEventListener("pointermove", e => {
      const m = e.target.closest(".magnetic");
      $$(".magnetic.is-pulled").forEach(b => { if (b !== m) { b.classList.remove("is-pulled"); b.style.transform = ""; } });
      if (m) {
        const r = m.getBoundingClientRect();
        m.classList.add("is-pulled");
        m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      }
      const t = e.target.closest(".tilt, .card");
      if (t) {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        t.style.setProperty("--rx", (0.5 - py) * 6 + "deg");
        t.style.setProperty("--ry", (px - 0.5) * 8 + "deg");
      }
    }, { passive: true });
    document.addEventListener("pointerout", e => {
      const t = e.target.closest(".tilt, .card");
      if (t && !t.contains(e.relatedTarget)) { t.style.setProperty("--rx", "0deg"); t.style.setProperty("--ry", "0deg"); }
    });
    $$(".magnetic").forEach(b => (b.style.transition = "transform 0.5s cubic-bezier(0.2, 0.7, 0, 1), border-color 0.3s, color 0.4s, background 0.3s"));
  }

  /* ---------- copy email ---------- */
  async function copyEmail() {
    try { await navigator.clipboard.writeText(EMAIL); toast("Email copied to clipboard"); }
    catch (e) { location.href = "mailto:" + EMAIL; }
  }
  $$("[data-copy]").forEach(btn => btn.addEventListener("click", () => {
    copyEmail();
    const label = $("[data-copy-hint], [data-copy-label]", btn), was = label.textContent;
    label.textContent = "Copied";
    setTimeout(() => (label.textContent = was), 1800);
  }));

  /* ---------- data: projects and writing from data/feed.json ---------- */
  const LANG = { Ruby: "#cc342d", JavaScript: "#f1e05a" };
  const HIGHLIGHTS = {
    GameOfLife: "Conway's Game of Life in Ruby, built for the fun of it.",
    infracity: "A social-good application in Rails — winner of a national-level hackathon.",
    "konva-ext": "Konva.js canvas editing, extended with interactive resize.",
  };
  const year = d => new Date(d).getFullYear();
  const fmtDate = d => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

  let projects = [], posts = [];

  function renderProjects() {
    $("[data-projects]").innerHTML = projects.map(p => `
      <a class="card" href="${esc(p.url)}" target="_blank" rel="noopener" style="--dot: ${LANG[p.language] || "var(--muted)"}">
        <div class="card__top"><span class="card__lang">${esc(p.language)}</span><span>${year(p.created)}</span></div>
        <h3>${esc(p.name.replace(/[_-]/g, " "))}</h3>
        <p>${esc(p.description)}</p>
        <span class="card__arrow">${ARROW}</span>
      </a>`).join("");
  }

  function renderFeatures() {
    $("[data-features]").innerHTML = posts.filter(p => p.source === "Medium").slice(0, 4).map(p => `
      <a class="feature reveal" href="${esc(p.url)}" target="_blank" rel="noopener">
        <div class="feature__meta"><span>${esc(p.source)}</span><span>${fmtDate(p.date)}</span></div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.excerpt)}</p>
        <p class="stack">${p.tags.slice(0, 3).map(esc).join(" · ")}</p>
      </a>`).join("");
    observeReveals($("[data-features]"));
  }

  fetch("data/feed.json")
    .then(r => r.json())
    .then(data => {
      const names = Object.keys(HIGHLIGHTS);
      projects = data.repos
        .filter(r => names.includes(r.name))
        .map(r => ({ ...r, description: HIGHLIGHTS[r.name] }))
        .sort((a, b) => names.indexOf(a.name) - names.indexOf(b.name));
      posts = data.posts;
      $("[data-kata-count]").textContent = posts.filter(p => p.source !== "Medium").length;
      renderProjects();
      renderFeatures();
    })
    .catch(() => {
      $("[data-projects]").innerHTML = `<p class="stack">Projects are on <a href="${LINKS.GitHub}">GitHub</a>.</p>`;
    });

  /* ---------- command palette ---------- */
  const dlg = $(".palette");
  const input = $(".palette__input");
  const listEl = $(".palette__list");
  const go = id => () => document.getElementById(id).scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  const open = url => () => window.open(url, "_blank", "noopener");
  const baseCommands = () => [
    { group: "Navigate", label: "At a glance", hint: "01", run: go("about") },
    { group: "Navigate", label: "How I build with AI", hint: "02", run: go("ai") },
    { group: "Navigate", label: "Tulifo", hint: "03", run: go("tulifo") },
    { group: "Navigate", label: "Experience", hint: "04", run: go("experience") },
    { group: "Navigate", label: "Work and writing", hint: "05", run: go("work") },
    { group: "Navigate", label: "Credentials", hint: "06", run: go("credentials") },
    { group: "Navigate", label: "Contact", hint: "07", run: go("contact") },
    { group: "Actions", label: "Copy email address", hint: EMAIL, run: copyEmail },
    { group: "Actions", label: "Toggle theme", hint: "light / dark", run: () => toggleTheme() },
    ...Object.entries(LINKS).map(([k, url]) => ({ group: "Elsewhere", label: "Open " + k, hint: "↗", run: open(url) })),
  ];
  let items = [], sel = 0;
  function renderPalette() {
    const q = input.value.trim().toLowerCase();
    const fuzzy = s => { let i = 0; for (const ch of s.toLowerCase()) if (ch === q[i]) i++; return i === q.length; };
    items = baseCommands().filter(c => !q || fuzzy(c.label));
    if (q.length > 1) {
      items.push(...projects.filter(p => p.name.toLowerCase().includes(q)).slice(0, 5).map(p => ({ group: "Projects", label: p.name, hint: p.language, run: open(p.url) })));
      items.push(...posts.filter(p => p.title.toLowerCase().includes(q)).slice(0, 6).map(p => ({ group: "Posts", label: p.title, hint: p.source, run: open(p.url) })));
    }
    sel = Math.min(sel, Math.max(items.length - 1, 0));
    let group = "";
    listEl.innerHTML = items.length ? items.map((c, i) => {
      const head = c.group !== group ? `<li class="palette__group" role="presentation">${esc((group = c.group))}</li>` : "";
      return head + `<li class="palette__item" role="option" id="opt-${i}" data-i="${i}" aria-selected="${i === sel}"><span>${esc(c.label)}</span><span>${esc(c.hint)}</span></li>`;
    }).join("") : `<li class="palette__group">No results</li>`;
    input.setAttribute("aria-activedescendant", items.length ? "opt-" + sel : "");
    const cur = $(`[data-i="${sel}"]`, listEl);
    if (cur) cur.scrollIntoView({ block: "nearest" });
  }
  function openPalette() { input.value = ""; sel = 0; renderPalette(); dlg.showModal(); input.focus(); }
  function runSel() { const c = items[sel]; if (!c) return; dlg.close(); c.run(); }
  $$("[data-open-palette]").forEach(b => b.addEventListener("click", openPalette));
  input.addEventListener("input", () => { sel = 0; renderPalette(); });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % items.length; renderPalette(); }
    if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + items.length) % items.length; renderPalette(); }
    if (e.key === "Enter") { e.preventDefault(); runSel(); }
  });
  listEl.addEventListener("pointermove", e => {
    const li = e.target.closest("[data-i]");
    if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; $$(".palette__item", listEl).forEach(x => x.setAttribute("aria-selected", String(+x.dataset.i === sel))); }
  });
  listEl.addEventListener("click", e => { if (e.target.closest("[data-i]")) runSel(); });
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

  /* ---------- back to top: appears after the first screen, ring shows how far down you are ---------- */
  const toTop = $("[data-to-top]");
  if (toTop) {
    toTop.hidden = false;
    const sync = () => {
      const max = root.scrollHeight - innerHeight;
      toTop.classList.toggle("is-on", scrollY > innerHeight * 0.9);
      toTop.style.setProperty("--done", ((scrollY / (max || 1)) * 100).toFixed(1));
    };
    addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
    toTop.addEventListener("click", () => {
      scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      const name = $(".hero__title");   // the name is what's visible at the top (the logo is hidden until it docks)
      name.setAttribute("tabindex", "-1");
      name.focus({ preventScroll: true });
    });
    sync();
  }

  /* ---------- global keys ---------- */
  addEventListener("keydown", e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); dlg.open ? dlg.close() : openPalette(); return; }
    if (typing || dlg.open || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "/") { e.preventDefault(); openPalette(); return; }
  });
})();
