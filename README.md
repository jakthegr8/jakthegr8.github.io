# jakthegr8.github.io

Personal site of Arun Kumar Jayakodi — https://jakthegr8.github.io

Plain HTML, CSS and JavaScript; no build step.

- `index.html`, `css/main.css`, `js/main.js` — the page
- `js/life.js` — the Game of Life in the hero (draw with the pointer; `space`, `r`, `g`, `c` while it is on screen)
- `data/feed.json` — Medium posts, Blogspot posts and GitHub repos, rebuilt daily by `.github/workflows/feeds.yml` via `scripts/fetch-feeds.mjs`

Run locally:

```bash
python3 -m http.server 4173
```

Refresh the feed by hand:

```bash
node scripts/fetch-feeds.mjs
```
