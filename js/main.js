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
    "Chittu on Hugging Face": "https://huggingface.co/Tulifo",
    "Hugging Face": "https://huggingface.co/jakthegr8",
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
    nav.classList.toggle("is-scrolled", scrollY > 40);
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
  ["top", "about", "tulifo", "models", "experience", "craft", "work", "writing", "credentials", "contact"].forEach(id => sectionIO.observe(document.getElementById(id)));

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

  /* ---------- rotating role in the hero (roles from the original site) ---------- */
  const roles = ["agentic AI platforms", "real-time voice agents", "cloud-native systems", "engineering teams", "microservices", "whole products"];
  const rot = $(".rotator");
  let ri = 0;
  if (!reduced) setInterval(() => {
    if (document.hidden) return;
    const cur = $(".rotator__word", rot);
    ri = (ri + 1) % roles.length;
    const nxt = document.createElement("span");
    nxt.className = "rotator__word in";
    nxt.textContent = roles[ri];
    cur.classList.add("out");
    cur.style.gridArea = nxt.style.gridArea = "1 / 1";
    rot.append(nxt);
    setTimeout(() => cur.remove(), 450);
  }, 2600);

  /* ---------- Tulifo pipeline: hover or tap a stage; cycles until touched ---------- */
  const STAGES = [
    { title: "Candidate joins", text: "Xiya introduces the role and explains how the session works, in the candidate's own language. Consent is recorded and versioned before anything is shared.", chips: ["Any role", "10 languages", "Consent first"] },
    { title: "Integrity checks", text: "Identity, live camera, faces in frame, editor input and window focus are fused into one picture of the session's integrity, and logged so results can be audited.", chips: ["Identity matched", "One face in frame", "Window focus"] },
    { title: "Xiya interviews", text: "A fully autonomous video interview: Xiya asks follow-ups, hears many languages and keeps a fair pace, with background verification running alongside.", chips: ["Follow-up questions", "Vernacular speech", "BGV built in"] },
    { title: "Rubric scoring", text: "Answers are scored against a rubric people can read — role knowledge, communication and problem solving — not a black-box number.", chips: ["Role knowledge", "Communication", "Problem solving"] },
    { title: "People decide", text: "Xiya recommends and explains in a single report with the background check. A person on the employer's team makes every hiring decision.", chips: ["Scored report", "Human in the loop", "ISO 27001 path"] },
  ];
  const flow = $("[data-flow]");
  if (flow) {
    const nodes = $$(".flow__node", flow), detail = $(".flow__detail", flow);
    let stage = 0, auto = !reduced, timer;
    const show = i => {
      if (i === stage && detail.dataset.ready) return;
      stage = i;
      detail.dataset.ready = 1;
      nodes.forEach((n, k) => { n.classList.toggle("is-on", k === i); n.setAttribute("aria-selected", String(k === i)); });
      $("[data-flow-title]", flow).textContent = STAGES[i].title;
      $("[data-flow-text]", flow).textContent = STAGES[i].text;
      $("[data-flow-chips]", flow).innerHTML = STAGES[i].chips.map(c => `<li>${c}</li>`).join("");
      flow.style.setProperty("--fx", 10 + i * 20 + "%");
      detail.classList.remove("swap"); void detail.offsetWidth; detail.classList.add("swap");
    };
    const stop = () => { auto = false; clearInterval(timer); };
    nodes.forEach((n, i) => {
      n.addEventListener("mouseenter", () => { stop(); show(i); });
      n.addEventListener("click", () => { stop(); show(i); });
      n.addEventListener("focus", () => { stop(); show(i); });
    });
    new IntersectionObserver(([en]) => {
      clearInterval(timer);
      if (en.isIntersecting && auto) timer = setInterval(() => show((stage + 1) % STAGES.length), 3200);
    }, { threshold: 0.4 }).observe(flow);
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

  /* ---------- AI playbook: tabs, each with an animated loop of stages ---------- */
  const PLAYBOOK = {
    fde: {
      core: "ship", title: "Forward deployed engineering", stages: ["Discover", "Prototype", "Deploy", "Measure", "Harden"],
      text: "I do my best work embedded with the customer — in their meetings, their codebase and their constraints — turning a fuzzy problem into software running in production.",
      points: [
        "Took Tulifo from a blank repo to a live production platform in three months.",
        "Worked inside fintech and mobility client programmes (MoneySmart, Spin) with teams across India and Dubai.",
        "Architected enterprise systems for Rosetta Stone and RPX Insight at Accenture.",
        "Partner with Product, Security and DevOps leaders so what ships lines up with the business.",
      ],
      chips: ["Customer discovery", "Rapid prototyping", "Production rollout", "Stakeholder alignment"],
    },
    agents: {
      core: "act", title: "Agentic AI", stages: ["Plan", "Retrieve", "Act", "Observe", "Reflect"],
      text: "Agents that plan, call tools and recover from mistakes — with the guardrails and observability you need before customers rely on them.",
      points: [
        "Xiya runs a fully autonomous interview: it asks its own follow-ups, scores against a rubric and explains its recommendation.",
        "Built with the Claude API and Agent SDK, orchestrated from Python and FastAPI.",
        "Tool use, structured outputs and human checkpoints wherever a wrong action would be costly.",
        "Workflow automation that turns multi-step manual processes into agent runs.",
      ],
      chips: ["Claude Agent SDK", "Tool use", "LiveKit / Pipecat", "Workflow automation"],
    },
    rag: {
      core: "ground", title: "Retrieval-augmented generation", stages: ["Ingest", "Chunk", "Embed", "Retrieve", "Generate"],
      text: "Answers grounded in your own data rather than the model's memory — ingestion, retrieval and generation tuned as one system.",
      points: [
        "RAG over candidate and job data powers Tulifo's matching.",
        "Retrieval quality is measured, not assumed: test sets of real questions with the sources they should find.",
        "Grounded responses that can point back to the evidence they used.",
        "Retrieval kept close to the data it serves, on PostgreSQL and Redis I already run.",
      ],
      chips: ["RAG pipelines", "Embeddings", "Re-ranking", "PostgreSQL"],
    },
    llm: {
      core: "own", title: "LLMs in production", stages: ["Select", "Prompt", "Evaluate", "Deploy", "Monitor"],
      text: "Model choice, prompts, latency and cost treated as engineering decisions — measured, versioned and owned.",
      points: [
        "Own model selection at Tulifo: our in-house Xiya and open Chittu models alongside Anthropic and OpenAI.",
        "Fine-tuned Chittu Guard from Qwen3-4B with MLX, and trained Chittu Story from scratch on 2.33M swept stories.",
        "Every release ships with a model card that lists every evaluation result and known failure — and comparisons published in the open.",
        "Observability and cost tracking from years of running production systems on New Relic and Datadog.",
      ],
      chips: ["Hugging Face", "Fine-tuning", "MLX", "Model cards", "Observability"],
    },
  };
  const pb = $("[data-playbook]");
  if (pb) {
    const tabs = $$("[data-pb]", pb), panel = $(".playbook__panel", pb), nodesEl = $(".loop__nodes", pb);
    let loopTimer, step = 0;
    const show = key => {
      const d = PLAYBOOK[key];
      tabs.forEach(t => { const on = t.dataset.pb === key; t.classList.toggle("is-on", on); t.setAttribute("aria-selected", String(on)); });
      $("[data-pb-core]", pb).textContent = d.core;
      $("[data-pb-title]", pb).textContent = d.title;
      $("[data-pb-text]", pb).textContent = d.text;
      $("[data-pb-points]", pb).innerHTML = d.points.map(x => `<li>${esc(x)}</li>`).join("");
      $("[data-pb-chips]", pb).innerHTML = d.chips.map(x => `<li>${esc(x)}</li>`).join("");
      nodesEl.innerHTML = d.stages.map((st, i) => {
        const a = (i / d.stages.length) * Math.PI * 2 - Math.PI / 2;
        return `<span class="loop__node" style="--x:${Math.cos(a).toFixed(3)};--y:${Math.sin(a).toFixed(3)}">${esc(st)}</span>`;
      }).join("");
      panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap");
      step = 0;
      clearInterval(loopTimer);
      const nodes = $$(".loop__node", nodesEl);
      const tick = () => { nodes.forEach((n, i) => n.classList.toggle("is-on", i === step)); step = (step + 1) % nodes.length; };
      tick();
      if (!reduced) loopTimer = setInterval(tick, 1200);
    };
    tabs.forEach(t => t.addEventListener("click", () => show(t.dataset.pb)));
    $(".playbook__tabs", pb).addEventListener("keydown", e => {
      if (!/Arrow(Left|Right)/.test(e.key)) return;
      const i = tabs.indexOf(document.activeElement), n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
      n.focus(); show(n.dataset.pb);
    });
    show("fde");
  }

  /* ---------- footprint: dot-matrix world map (Natural Earth 110m, 2.5° grid) ---------- */
  const MAP = {"cols": 144, "rows": 52, "lat0": 75, "step": 2.5, "rle": "m.4.8.2.1.1.c.e.t.2.a.c.b.1.f|0.1.8.1.f.5.3.2.1.7.8.c.u.2.4.3.1.l.1.8.b|5.l.1.1.1.1.4.3.1.2.2.3.6.a.i.8.6.1.1.4.1.1.1.16|0.4.2.w.4.5.4.7.7.1.b.9.1.1.2.1i|8.s.1.1.1.1.3.3.5.5.8.1.b.4.1.1q.1|6.s.7.2.9.3.j.5.2.1i.1.5.3|7.4.6.i.6.6.r.5.2.1c.7.1.7|8.1.a.i.4.6.n.1.4.1.1.1.2.1b.7.3.7|k.j.1.9.j.2.1.1.3.1h.6.2.8|l.t.k.1m.g|m.m.1.1.2.3.j.1m.g|m.o.p.d.1.1.1.5.1.y.h|m.m.r.4.1.1.1.5.5.3.1.y.3.1.e|m.l.p.5.4.2.1.4.1.2.1.4.2.u.4.1.f|n.j.q.4.6.1.1.1.2.9.2.p.3.1.5.1.f|n.j.u.4.9.z.3.1.2.2.g|p.g.s.7.a.y.5.1.i|p.1.1.c.t.b.1.3.1.1.1.z.n|q.8.5.1.s.n.1.t.n|s.5.6.1.q.k.1.5.2.q.o|t.4.x.k.1.8.4.k.1.1.n|u.3.3.1.s.m.1.8.4.7.2.6.t|u.4.1.2.6.2.l.l.1.7.6.5.4.4.1.1.s|x.4.s.n.1.4.8.4.6.4.5.1.n|10.3.q.q.b.2.7.5.4.2.m|16.1.1.1.l.n.2.1.a.2.7.1.1.2.t|13.1.1.7.j.p.j.1.a.1.l|15.8.j.5.1.i.c.1.7.1.v|15.b.o.f.k.2.4.2.p|14.c.o.e.m.2.2.3.p|14.e.m.d.n.2.2.3.1.1.3.2.i|14.h.j.c.p.1.6.1.5.4.e|14.i.j.b.q.1.c.4.d|14.i.j.b.v.2.1.1.5.1.f|15.g.k.b.1k|15.f.l.b.3.1.w.2.i|17.d.l.b.2.2.t.6.2.1.e|18.c.l.9.4.2.t.a.d|18.c.l.9.3.2.r.e.c|18.a.o.8.3.2.q.f.c|18.9.p.7.w.g.b|17.9.r.6.x.f.b|17.9.r.5.y.f.b|17.8.s.3.10.4.4.7.b|17.6.27.4.c|17.5.2a.1.b.1.1|16.4.2c.1.a.1.2|17.3.2m.1.3|16.3.2m.1.4|16.3.2r|16.2.4.1.2n|17.2.2r"};
  const mapEl = $("[data-map]");
  if (mapEl) {
    const land = new Uint8Array(MAP.cols * MAP.rows);
    MAP.rle.split("|").forEach((row, r) => {
      let c = 0, v = 0;
      row.split(".").forEach(run => { const n = parseInt(run, 36); if (v) land.fill(1, r * MAP.cols + c, r * MAP.cols + c + n); c += n; v ^= 1; });
    });
    const canvas = $(".map__dots", mapEl), ctx = canvas.getContext("2d"), svg = $(".map__arcs", mapEl);
    const pins = $$(".pin", mapEl), foot = $(".footprint");
    let geo = null, focus = null;
    const toGrid = (lat, lon) => ({ c: (lon + 180) / MAP.step, r: (MAP.lat0 - lat) / MAP.step });
    function layout() {
      const w = mapEl.clientWidth, h = mapEl.clientHeight, pad = 0.04;
      const cell = Math.min((w * (1 - pad * 2)) / MAP.cols, (h * (1 - pad * 2)) / MAP.rows);
      geo = { w, h, cell, ox: (w - cell * MAP.cols) / 2, oy: (h - cell * MAP.rows) / 2 };
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const pt = p => { const g = toGrid(+p.dataset.lat, +p.dataset.lon); return [geo.ox + g.c * cell, geo.oy + g.r * cell]; };
      pins.forEach(p => { const [x, y] = pt(p); p.style.setProperty("--px", x + "px"); p.style.setProperty("--py", y + "px"); });
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const home = pt(pins.find(p => p.dataset.country === "in"));
      svg.innerHTML = pins.filter(p => p.dataset.country !== "in").map(p => {
        const [x, y] = pt(p), mx = (x + home[0]) / 2, my = Math.min(y, home[1]) - Math.abs(x - home[0]) * 0.28;
        return `<path pathLength="1" d="M${home[0]},${home[1]} Q${mx},${my} ${x},${y}"/>`;
      }).join("");
      draw();
    }
    function draw() {
      const st = getComputedStyle(root), base = st.getPropertyValue("--cell").trim(), accent = st.getPropertyValue("--accent").trim();
      const fp = focus ? pins.filter(p => p.dataset.country === focus).map(p => toGrid(+p.dataset.lat, +p.dataset.lon)) : [];
      ctx.clearRect(0, 0, geo.w, geo.h);
      const rad = geo.cell * 0.32;
      for (let i = 0; i < land.length; i++) {
        if (!land[i]) continue;
        const c = i % MAP.cols, r = (i / MAP.cols) | 0;
        const near = fp.some(g => Math.hypot(c + 0.5 - g.c, r + 0.5 - g.r) < 6);
        ctx.fillStyle = near ? accent : base;
        ctx.beginPath(); ctx.arc(geo.ox + (c + 0.5) * geo.cell, geo.oy + (r + 0.5) * geo.cell, rad, 0, Math.PI * 2); ctx.fill();
      }
    }
    function setFocus(country) {
      focus = country;
      foot.classList.toggle("is-focus", !!country);
      pins.forEach(p => p.classList.toggle("is-on", p.dataset.country === country));
      $$(".countries li, .teams li", foot).forEach(li => li.classList.toggle("is-on", !!country && li.dataset.country.split(" ").includes(country)));
      draw();
    }
    $$(".pin, .countries li, .teams li", foot).forEach(el => {
      el.addEventListener("mouseenter", () => setFocus(el.dataset.country.split(" ")[0]));
      el.addEventListener("mouseleave", () => setFocus(null));
    });
    pins.forEach(p => {
      p.addEventListener("focus", () => setFocus(p.dataset.country));
      p.addEventListener("blur", () => setFocus(null));
    });
    new ResizeObserver(layout).observe(mapEl);
    new MutationObserver(() => geo && draw()).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
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

  /* ---------- craft accordion ---------- */
  $$(".craft__row").forEach((btn, idx) => {
    const item = btn.parentElement;
    btn.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      $$(".craft__item").forEach(i => { i.classList.remove("is-open"); $(".craft__row", i).setAttribute("aria-expanded", "false"); });
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
    if (idx === 0) btn.click();
  });

  /* ---------- pointer effects: cursor, magnetic buttons, tilt, spotlight ---------- */
  if (finePointer && !reduced) {
    root.classList.add("has-cursor");
    const cursor = $(".cursor");
    let cx = -100, cy = -100, tx = -100, ty = -100;
    addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    addEventListener("pointerdown", () => cursor.classList.add("is-down"));
    addEventListener("pointerup", () => cursor.classList.remove("is-down"));
    document.addEventListener("pointerover", e => cursor.classList.toggle("is-hover", !!e.target.closest("a, button, input, .card")));
    (function follow() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.setProperty("--cx", cx + "px");
      cursor.style.setProperty("--cy", cy + "px");
      requestAnimationFrame(follow);
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
        t.style.setProperty("--mx", px * 100 + "%");
        t.style.setProperty("--my", py * 100 + "%");
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
  $("[data-copy]").addEventListener("click", () => {
    copyEmail();
    const hint = $("[data-copy-hint]");
    hint.textContent = "Copied";
    setTimeout(() => (hint.textContent = "Click to copy"), 1800);
  });

  const codeBtn = $("[data-copy-code]");
  if (codeBtn) codeBtn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText($(".snippet code").textContent); codeBtn.textContent = "Copied"; }
    catch (e) { codeBtn.textContent = "Select and copy"; }
    setTimeout(() => (codeBtn.textContent = "Copy"), 1600);
  });

  /* ---------- data: projects and writing from data/feed.json ---------- */
  const LANG = { Ruby: "#cc342d", Go: "#00add8", Dart: "#00b4ab", JavaScript: "#f1e05a", Python: "#3572a5" };
  const MAIN = ["Ruby", "Go", "Dart", "JavaScript"];
  const FEATURED = ["GameOfLife", "infracity", "flutter_base", "konva-ext"];
  const HIDDEN = ["jakthegr8.github.io", "Sublime_and_np"];
  const CURATED = {
    GameOfLife: { description: "Conway's Game of Life in Ruby. The same rules are running in the hero of this page." },
    infracity: { description: "A social-good application in Rails — winner of a national-level hackathon." },
    flutter_base: { description: "A Flutter starter project, preconfigured so new apps begin from a working base." },
    "konva-ext": { description: "Konva.js canvas editing, extended with interactive resize." },
    go_code: { description: "Solutions to popular problems, written in Go." },
    leet_code_refresh: { description: "LeetCode problems, solved again in JavaScript." },
    "zero_to_mastery-data_structures": { description: "Data structures and algorithms in Ruby.", language: "Ruby" },
    Express_nodejs_app: { description: "A basic Express application on Node.js.", language: "JavaScript" },
    ruby_codes: { description: "Ruby practice code and snippets." },
    javascript_codes: { description: "JavaScript practice code and snippets." },
    python_code: { description: "Python practice code and snippets." },
    rest_api: { description: "A REST API written in Ruby." },
    loan_packages: { description: "Dart packages, published from a Flutter workspace." },
  };
  const year = d => new Date(d).getFullYear();
  const fmtDate = d => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

  let projects = [], posts = [];

  function renderProjects(filter = "all") {
    const list = projects.filter(p => filter === "all" || (filter === "Misc" ? !MAIN.includes(p.language) : p.language === filter));
    $("[data-projects]").innerHTML = list.map(p => `
      <a class="card${filter === "all" && FEATURED.slice(0, 2).includes(p.name) ? " is-featured" : ""}" href="${esc(p.url)}" target="_blank" rel="noopener" style="view-transition-name: p-${esc(p.name.replace(/[^\w-]/g, ""))}; --dot: ${LANG[p.language] || "var(--muted)"}">
        <div class="card__top"><span class="card__lang">${esc(p.language === "Misc" ? "Other" : p.language)}</span><span>${year(p.created)}</span></div>
        <h3>${esc(p.name.replace(/[_-]/g, " "))}</h3>
        <p>${esc(p.description || "Source on GitHub.")}</p>
        <span class="card__arrow">${ARROW}</span>
      </a>`).join("");
  }

  $$(".filters .chip").forEach(chip => chip.addEventListener("click", () => {
    $$(".filters .chip").forEach(c => { c.classList.toggle("is-on", c === chip); c.setAttribute("aria-pressed", String(c === chip)); });
    const run = () => renderProjects(chip.dataset.filter);
    if (document.startViewTransition && !reduced) document.startViewTransition(run); else run();
  }));

  function renderFeatures() {
    $("[data-features]").innerHTML = posts.filter(p => p.source === "Medium").slice(0, 4).map(p => `
      <a class="feature reveal" href="${esc(p.url)}" target="_blank" rel="noopener">
        <div class="feature__meta"><span>${esc(p.source)}</span><span>${fmtDate(p.date)}</span></div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.excerpt)}</p>
        <ul class="chips">${p.tags.slice(0, 3).map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      </a>`).join("");
    observeReveals($("[data-features]"));
  }

  let logLimit = 10;
  function renderLog() {
    const q = $("[data-log-search]").value.trim().toLowerCase();
    const all = posts.filter(p => p.source !== "Medium");
    const hits = q ? all.filter(p => (p.title + " " + p.tags.join(" ")).toLowerCase().includes(q)) : all;
    const shown = q ? hits : hits.slice(0, logLimit);
    const hl = s => {
      const safe = esc(s);
      if (!q) return safe;
      const at = s.toLowerCase().indexOf(q);
      return at < 0 ? safe : esc(s.slice(0, at)) + "<mark>" + esc(s.slice(at, at + q.length)) + "</mark>" + esc(s.slice(at + q.length));
    };
    $("[data-log-count]").textContent = q ? `${hits.length} of ${all.length}` : `${all.length} posts`;
    $("[data-log]").innerHTML = shown.length
      ? shown.map(p => `<li><a href="${esc(p.url)}" target="_blank" rel="noopener"><span class="log__date">${fmtDate(p.date)}</span><span class="log__title">${hl(p.title)}</span><span class="log__src">${esc(p.source)} ↗</span></a></li>`).join("")
      : `<li class="log__empty">No posts match “${esc(q)}”.</li>`;
    $("[data-log-more]").hidden = !!q || hits.length <= logLimit;
  }
  $("[data-log-search]").addEventListener("input", renderLog);
  $("[data-log-more]").addEventListener("click", () => { logLimit = Infinity; renderLog(); });

  fetch("data/feed.json")
    .then(r => r.json())
    .then(data => {
      projects = data.repos
        .filter(r => !HIDDEN.includes(r.name))
        .map(r => ({ ...r, ...CURATED[r.name], description: (CURATED[r.name] || {}).description || r.description }))
        .sort((a, b) => {
          const fa = FEATURED.indexOf(a.name), fb = FEATURED.indexOf(b.name);
          if (fa !== fb) return (fa < 0 ? 99 : fa) - (fb < 0 ? 99 : fb);
          return b.pushed.localeCompare(a.pushed);
        });
      posts = data.posts;
      $$(".filters .chip").forEach(c => {
        const f = c.dataset.filter;
        const n = f === "all" ? projects.length : projects.filter(p => (f === "Misc" ? !MAIN.includes(p.language) : p.language === f)).length;
        c.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
      });
      renderProjects();
      renderFeatures();
      renderLog();
    })
    .catch(() => {
      $("[data-projects]").innerHTML = `<p class="log__empty">Projects are on <a href="${LINKS.GitHub}">GitHub</a>.</p>`;
    });

  /* ---------- command palette ---------- */
  const dlg = $(".palette");
  const input = $(".palette__input");
  const listEl = $(".palette__list");
  const go = id => () => document.getElementById(id).scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  const open = url => () => window.open(url, "_blank", "noopener");
  const baseCommands = () => [
    { group: "Navigate", label: "About", hint: "01", run: go("about") },
    { group: "Navigate", label: "Tulifo", hint: "02", run: go("tulifo") },
    { group: "Navigate", label: "AI playbook and models", hint: "03", run: go("models") },
    { group: "Navigate", label: "Experience", hint: "04", run: go("experience") },
    { group: "Navigate", label: "Craft", hint: "05", run: go("craft") },
    { group: "Navigate", label: "Work", hint: "06", run: go("work") },
    { group: "Navigate", label: "Writing", hint: "07", run: go("writing") },
    { group: "Navigate", label: "Credentials", hint: "08", run: go("credentials") },
    { group: "Navigate", label: "Contact", hint: "09", run: go("contact") },
    { group: "Actions", label: "Copy email address", hint: EMAIL, run: copyEmail },
    { group: "Actions", label: "Toggle theme", hint: "light / dark", run: () => toggleTheme() },
    { group: "Game of Life", label: window.Life && !window.Life.running ? "Resume simulation" : "Pause simulation", hint: "space", run: () => window.Life && toast(window.Life.toggle() ? "Life resumed" : "Life paused") },
    { group: "Game of Life", label: "Reseed the grid", hint: "r", run: () => window.Life && window.Life.reseed() },
    { group: "Game of Life", label: "Launch gliders", hint: "g", run: () => window.Life && window.Life.glider() },
    { group: "Game of Life", label: "Clear the grid", hint: "c", run: () => window.Life && window.Life.clear() },
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

  /* ---------- global keys ---------- */
  addEventListener("keydown", e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); dlg.open ? dlg.close() : openPalette(); return; }
    if (typing || dlg.open || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "/") { e.preventDefault(); openPalette(); return; }
    const inHero = scrollY < innerHeight * 0.6;
    if (!inHero || !window.Life) return;
    if (e.key === " " && !document.activeElement.closest("a, button")) { e.preventDefault(); toast(window.Life.toggle() ? "Life resumed" : "Life paused"); }
    if (e.key === "r") window.Life.reseed();
    if (e.key === "g") window.Life.glider();
    if (e.key === "c") window.Life.clear();
  });
})();
