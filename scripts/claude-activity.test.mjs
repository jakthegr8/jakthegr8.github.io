// node --test scripts/
import { test } from "node:test";
import assert from "node:assert/strict";
import { isPrompt } from "./claude-activity.mjs";

const user = (content, extra = {}) => ({ type: "user", message: { content }, ...extra });

test("counts typed prompts, including images and slash commands", () => {
  assert.ok(isPrompt(user("fix the header")));
  assert.ok(isPrompt(user([{ type: "image" }, { type: "text", text: "what is this?" }])));
  assert.ok(isPrompt(user("<command-message>review</command-message>")));
});

test("skips tool results, subagents, injected context and harness events", () => {
  assert.ok(!isPrompt(user([{ type: "tool_result", content: "ok" }])));
  assert.ok(!isPrompt(user("hi", { isSidechain: true })));
  assert.ok(!isPrompt(user("hi", { isMeta: true })));
  assert.ok(!isPrompt(user("summary", { isCompactSummary: true })));
  assert.ok(!isPrompt(user("<task-notification>done</task-notification>")));
  assert.ok(!isPrompt(user("<system-reminder>x</system-reminder>")));
  assert.ok(!isPrompt(user("Another Claude session sent a message: <agent-message>")));
  assert.ok(!isPrompt(user([{ type: "text", text: "[Request interrupted by user]" }])));
  assert.ok(!isPrompt({ type: "assistant", message: { content: "hi" } }));
});
