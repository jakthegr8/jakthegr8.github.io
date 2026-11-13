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
        <span class="item__top"><span class="item__name">${esc(p.name)} ↗</span><span class="item__meta">${esc(p.language)} · ${year(p.created)}</span></span>
        <span class="item__text">${esc(p.description)}</span>
      </a>`).join("");
  }


  /* ---------- activity heatmaps: one column per week, Sunday on top; days before `from` stay blank ---------- */
  const DAY = 864e5;
  const utc = iso => Date.parse(iso + "T00:00:00Z");
  function renderHeat(key, days, from, to, total, unit, active) {
    const fig = $(`[data-heat="${key}"]`);
    const counts = new Map(days);
    // A streak day is any active day; for GitHub that is any day with a contribution.
    const isActive = new Set(active || days.filter(d => d[1]).map(d => d[0]));
    const sorted = days.map(d => d[1]).filter(Boolean).sort((a, b) => a - b);
    if (!fig || !sorted.length) return;
    // Levels 1–4 split the active days into quarters, so a few huge days don't wash out the rest.
    const cut = [0.25, 0.5, 0.75].map(q => sorted[Math.floor(q * (sorted.length - 1))]);
    const level = n => (n ? 1 + cut.filter(c => n > c).length : 0);
    // Both maps share one axis: the 53 weeks ending at `to`, so the same week sits in the same column.
    const end = utc(to);
    const start = end - 364 * DAY - new Date(end - 364 * DAY).getUTCDay() * DAY;
    let html = "";
    for (let t = start; t <= end; t += DAY) {
      const iso = new Date(t).toISOString().slice(0, 10);
      if (t < utc(from)) { html += "<i class=\"out\"></i>"; continue; }
      const n = counts.get(iso) || 0;
      html += n || !isActive.has(iso)
        ? `<i class="l${level(n)}" title="${n} ${unit} on ${fmtDate(iso)}"></i>`
        : `<i class="l1" title="Agent work, no ${unit}, on ${fmtDate(iso)}"></i>`;
    }
    const cells = $("[data-heat-cells]", fig);
    cells.innerHTML = html;
    cells.style.setProperty("--weeks", Math.ceil((end - start + DAY) / (7 * DAY)));
    cells.setAttribute("aria-label", `${total.toLocaleString("en-US")} ${unit}, ${fmtDate(from)} to ${fmtDate(to)}`);
    $("[data-heat-total]", fig).textContent = total.toLocaleString("en-US");
    // Today with nothing yet doesn't break the current streak.
    let run = 0, longest = 0;
    for (let t = utc(from); t <= end; t += DAY) {
      run = isActive.has(new Date(t).toISOString().slice(0, 10)) ? run + 1 : 0;
      longest = Math.max(longest, run);
    }
    let current = 0;
    for (let t = isActive.has(to) ? end : end - DAY; isActive.has(new Date(t).toISOString().slice(0, 10)); t -= DAY) current++;
    const nDays = n => `${n} day${n === 1 ? "" : "s"}`;
    $("[data-heat-streak]", fig).textContent = `Longest streak ${nDays(longest)} · current ${nDays(current)}`;
    fig.hidden = false;
    $("[data-activity]").hidden = false;
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
      if (data.contributions) {
        const d = data.contributions.days;
        renderHeat("github", d, d[0][0], d[d.length - 1][0], data.contributions.total, "contributions");
      }
    })
    .catch(() => {}); // the static lists in the HTML stay

  fetch("data/claude-activity.json")
    .then(r => r.json())
    .then(c => {
      renderHeat("claude", c.days, c.since, c.until, c.total, "prompts", c.active);
      $("[data-heat-since]").textContent = fmtDate(c.since);
    })
    .catch(() => {});
})();
