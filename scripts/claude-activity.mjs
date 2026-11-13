// Builds data/claude-activity.json: how many prompts I sent to Claude Code each day, plus every
// day with any Claude Code activity (agent and subagent work included), which the streak counts.
// The source is the local transcript folder (~/.claude/projects), so this runs on my machine,
// not in CI:  node scripts/claude-activity.mjs   (then commit data/claude-activity.json).
// Only dates and counts leave the machine; no prompt text, project name or path is written.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ROOT = process.env.CLAUDE_PROJECTS || join(homedir(), ".claude", "projects");
// Harness text that arrives as a "user" line but was not typed by me.
// shortcut: the first brief of a session another session started still counts (one per session); filter by entrypoint if that grows.
const NOT_TYPED = /^\s*(<system-reminder>|<task-notification>|<teammate-message|<local-command-|<agent-message|Another Claude session sent a message|<side-sessions-event>|<ci-monitor-event>|Caveat: |\[Request interrupted)/;

function* transcripts(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* transcripts(p);
    else if (name.endsWith(".jsonl")) yield p;
  }
}

// A typed prompt: a top-level user turn with text or an image, not a tool result or injected context.
export function isPrompt(o) {
  if (o.type !== "user" || o.isSidechain || o.isMeta || o.isCompactSummary) return false;
  const c = o.message?.content;
  if (typeof c === "string") return !NOT_TYPED.test(c);
  return Array.isArray(c) && c.length > 0 && c.every(x => x.type === "text" || x.type === "image")
    && !c.some(x => x.type === "text" && NOT_TYPED.test(x.text));
}

const localDate = iso => new Date(iso).toLocaleDateString("en-CA"); // YYYY-MM-DD in this machine's zone

if (import.meta.url === `file://${process.argv[1]}`) {
  const seen = new Set(); // resumed and forked sessions copy earlier lines; count each uuid once
  const perDay = {};
  const active = new Set(); // same rule as ~/.claude/streak-recompute.py: any timestamped line, any log
  for (const file of transcripts(ROOT)) {
    const sub = file.includes("/subagents/");
    for (const line of readFileSync(file, "utf8").split("\n")) {
      if (!line) continue;
      let o;
      try { o = JSON.parse(line); } catch { continue; }
      if (!o.timestamp) continue;
      active.add(localDate(o.timestamp));
      if (sub || !isPrompt(o) || seen.has(o.uuid)) continue;
      seen.add(o.uuid);
      const d = localDate(o.timestamp);
      perDay[d] = (perDay[d] || 0) + 1;
    }
  }
  // history.jsonl keeps typed prompts (ms epoch) even when a session log is gone.
  try {
    for (const line of readFileSync(join(ROOT, "..", "history.jsonl"), "utf8").split("\n")) {
      const t = line && JSON.parse(line).timestamp;
      if (t) active.add(localDate(new Date(t).toISOString()));
    }
  } catch {}
  const days = Object.entries(perDay).sort((a, z) => a[0].localeCompare(z[0]));
  if (!days.length) throw new Error(`no prompts found under ${ROOT}`);
  const out = {
    generated: new Date().toISOString(),
    since: [...active].sort()[0],
    until: localDate(new Date().toISOString()),
    total: days.reduce((n, d) => n + d[1], 0),
    days,
    active: [...active].sort(),
  };
  writeFileSync(new URL("../data/claude-activity.json", import.meta.url), JSON.stringify(out) + "\n");
  console.log(`prompts: ${out.total} on ${days.length} days, active days: ${out.active.length}, ${out.since} to ${out.until}`);
}
