(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  $("[data-year]").textContent = new Date().getFullYear();

  /* ---------- toast ---------- */
  const toastEl = $(".toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
  }

  /* ---------- copy email ---------- */
  $$("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const label = $("[data-copy-label]", btn);
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        toast("Email copied");
        if (label) { label.textContent = "Copied"; setTimeout(() => (label.textContent = "Copy"), 1800); }
      } catch (e) {
        location.href = "mailto:" + btn.dataset.copy;
      }
    });
  });

  /* ---------- masthead: mark the section in view ---------- */
  const navLinks = $$(".masthead__nav a");
  const sections = navLinks.map(a => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- data: projects and writing from data/feed.json ---------- */
  // The HTML ships with a static copy of these lists; the feed, refreshed daily by
  // .github/workflows/feeds.yml, replaces them when it loads.
  const HIGHLIGHTS = {
    infracity: "A social-good application in Rails — winner of a national-level hackathon.",
    "konva-ext": "Konva.js canvas editing, extended with interactive resize.",
    GameOfLife: "Conway's Game of Life in Ruby, built for the fun of it.",
  };
  const year = d => new Date(d).getFullYear();
  const fmtDate = d => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  function renderProjects(projects) {
    if (!projects.length) return;
    $("[data-projects]").innerHTML = projects.map(p => `
      <a class="item" href="${esc(p.url)}" target="_blank" rel="noopener">
        <span class="item__top"><span class="item__name">${esc(p.name)}</span><span class="item__meta">${esc(p.language)} · ${year(p.created)}</span></span>
        <span class="item__text">${esc(p.description)}</span>
      </a>`).join("");
  }

  function renderFeatures(posts) {
    if (!posts.length) return;
    $("[data-features]").innerHTML = posts.map(p => `
      <a class="item" href="${esc(p.url)}" target="_blank" rel="noopener">
        <span class="item__meta">${esc(p.source)} · ${fmtDate(p.date)}</span>
        <span class="item__title">${esc(p.title)}</span>
      </a>`).join("");
  }

  fetch("data/feed.json")
    .then(r => r.json())
    .then(data => {
      const names = Object.keys(HIGHLIGHTS);
      const projects = data.repos
        .filter(r => names.includes(r.name))
        .map(r => ({ ...r, description: HIGHLIGHTS[r.name] }))
        .sort((a, b) => names.indexOf(a.name) - names.indexOf(b.name));
      const katas = data.posts.filter(p => p.source !== "Medium").length;
      if (katas) $("[data-kata-count]").textContent = katas;
      renderProjects(projects);
      renderFeatures(data.posts.filter(p => p.source === "Medium").slice(0, 4));
    })
    .catch(() => {}); // the static lists in the HTML stay
})();
