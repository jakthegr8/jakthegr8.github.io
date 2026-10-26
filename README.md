# jakthegr8.github.io

Personal site of Arun Kumar Jayakodi — https://akj.is-a.dev (also https://jakthegr8.github.io, which redirects)

The custom domain comes from the `CNAME` file and the is-a.dev record in [is-a-dev/register](https://github.com/is-a-dev/register/blob/main/domains/akj.json).

Plain HTML, CSS and JavaScript; no build step.

- `index.html`, `css/main.css`, `js/main.js` — the page
- `scripts/stamp-assets.mjs` — run after editing `css/` or `js/`; it versions the asset links in `index.html` so browsers never mix new HTML with cached CSS/JS
- `data/feed.json` — Medium posts, Blogspot posts and GitHub repos, rebuilt daily by `.github/workflows/feeds.yml` via `scripts/fetch-feeds.mjs`

Run locally:

```bash
python3 -m http.server 4173
```

Refresh the feed by hand:

```bash
node scripts/fetch-feeds.mjs
```
