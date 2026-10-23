// Builds data/feed.json from Medium, Blogspot and the GitHub API.
// Runs daily in .github/workflows/feeds.yml; no dependencies, Node 20+.
import { writeFile } from "node:fs/promises";

const USER = "jakthegr8";
const MEDIUM = "https://medium.com/feed/@arun.ranush";
const BLOGGER = "https://jak-ruby.blogspot.com/feeds/posts/default?alt=json&max-results=100";
const UA = { "user-agent": "Mozilla/5.0 (jakthegr8.github.io feed builder)" };

const decode = (s = "") =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
   .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
   .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

const tag = (xml, name) => decode((xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)) || [])[1]);

const excerpt = (html, n = 160) => {
  const text = decode(html).replace(/<figure[\s\S]*?<\/figure>/g, " ").replace(/<h[1-6][\s\S]*?<\/h[1-6]>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > n ? text.slice(0, n).replace(/\s\S*$/, "") + "…" : text;
};

async function medium() {
  const xml = await (await fetch(MEDIUM, { headers: UA })).text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => ({
    source: "Medium",
    title: tag(item, "title"),
    url: tag(item, "link").split("?")[0],
    date: new Date(tag(item, "pubDate")).toISOString(),
    tags: [...item.matchAll(/<category>([\s\S]*?)<\/category>/g)].map(m => decode(m[1])),
    excerpt: excerpt(tag(item, "content:encoded")),
  }));
}

async function blogger() {
  const { feed } = await (await fetch(BLOGGER, { headers: UA })).json();
  return (feed.entry || []).map(e => ({
    source: "Blog",
    title: e.title.$t,
    url: (e.link.find(l => l.rel === "alternate") || {}).href,
    date: new Date(e.published.$t).toISOString(),
    tags: (e.category || []).map(c => c.term),
    excerpt: excerpt(e.content?.$t || e.summary?.$t || ""),
  }));
}

async function repos() {
  const headers = { ...UA, accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const list = await (await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, { headers })).json();
  return list
    .filter(r => !r.fork && r.name !== USER && !/^test-project/i.test(r.name))
    .map(r => ({
      name: r.name,
      url: r.html_url,
      description: r.description || "",
      language: r.language || "Misc",
      stars: r.stargazers_count,
      pushed: r.pushed_at,
      created: r.created_at,
    }));
}

async function profile() {
  const u = await (await fetch(`https://api.github.com/users/${USER}`, { headers: UA })).json();
  return { repos: u.public_repos, gists: u.public_gists, since: u.created_at };
}

// A failed source keeps the site up: it just contributes nothing this run.
const safe = async (fn, label) => {
  try { return await fn(); } catch (e) { console.warn(`${label} failed: ${e.message}`); return null; }
};

const [m, b, r, p] = await Promise.all([
  safe(medium, "medium"), safe(blogger, "blogger"), safe(repos, "repos"), safe(profile, "profile"),
]);

const posts = [...(m || []), ...(b || [])].sort((a, z) => z.date.localeCompare(a.date));
const out = { generated: new Date().toISOString(), profile: p, posts, repos: r || [] };
await writeFile(new URL("../data/feed.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log(`posts: ${posts.length}, repos: ${out.repos.length}`);
