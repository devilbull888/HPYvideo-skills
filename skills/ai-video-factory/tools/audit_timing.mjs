#!/usr/bin/env node
// Timing audit gate. Usage (sandbox root): node tools/audit_timing.mjs [src/audit.ts] [speed=1.25]
// src/audit.ts must `export const AUDIT = { shots, elements, presenters }` built from the SAME
// anchors as Episode.tsx (import A / SHOTS / PRESENTERS + SENTENCES from timing.ts). Never hand-type frames.
//   shots:      [{ id, from, to }]                        frames, 1x
//   elements:   [{ shot, name, in_f, out_f?, word_f?, readable?: true }]
//               out_f defaults to the shot's `to`; word_f = wordFrame() of the word it illustrates
//   presenters: [{ id, start_s, end_s, last_sid, group? }]  last_sid = last sentence spoken in this window
// Exit code 1 if any FAIL. Output: table + out/audit_timing.json
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const entry = process.argv[2] || "src/audit.ts";
const speed = Number(process.argv[3] || 1.25);
const FPS = 30;
const R = {
  minReadF: 45,        // readable element on screen >= 1.5s at 1x
  maxLateF: 9,         // element may not enter later than its word + 0.3s
  presTailS: 0.2,      // presenter window end >= last sentence end + 0.2s
  presMergeGapS: 8,    // gaps < 8s between presenter windows -> merge if same segment
  deadF: 15,           // >0.5s with no shot covering the timeline
  minFadeOutF: 18,
};

const outfile = path.resolve("work/.audit_bundle.mjs");
fs.mkdirSync(path.dirname(outfile), { recursive: true });
await build({ entryPoints: [path.resolve(entry)], bundle: true, format: "esm", platform: "node", outfile, loader: { ".json": "json" }, logLevel: "error", external: ["react", "remotion", "@remotion/*"] });
const mod = await import(pathToFileURL(outfile).href + `?t=${Date.now()}`);
const { AUDIT, SENTENCES } = mod;
if (!AUDIT) throw new Error(`${entry} must export AUDIT`);
const sentences = SENTENCES || AUDIT.sentences;
if (!sentences) throw new Error(`${entry} must also re-export SENTENCES from timing.ts`);
const sEnd = Object.fromEntries(sentences.map((s) => [s.sid, s.end_s]));

const rows = [];
const add = (level, rule, what, detail) => rows.push({ level, rule, what, detail });
const sec = (f) => (f / FPS).toFixed(2) + "s";
const out = (f) => (f / FPS / speed).toFixed(2) + "s(成片)";

// 1. readable dwell + 2. lateness
const shotById = Object.fromEntries(AUDIT.shots.map((s) => [s.id, s]));
for (const e of AUDIT.elements || []) {
  const shot = shotById[e.shot];
  if (!shot) { add("FAIL", "ref", e.name, `unknown shot ${e.shot}`); continue; }
  const outF = e.out_f ?? shot.to;
  const dwell = outF - e.in_f;
  if (e.readable !== false && dwell < R.minReadF)
    add("FAIL", "dwell>=45f", `${e.shot}/${e.name}`, `on screen ${dwell}f (${sec(dwell)} 1x, ${out(dwell)}) @${sec(e.in_f)}`);
  if (e.word_f != null && e.in_f - e.word_f > R.maxLateF)
    add("FAIL", "late<=9f", `${e.shot}/${e.name}`, `enters ${e.in_f - e.word_f}f after its word @${sec(e.word_f)}`);
  if (e.in_f < shot.from || e.in_f >= shot.to) add("WARN", "in-shot", `${e.shot}/${e.name}`, `in_f ${e.in_f} outside shot ${shot.from}-${shot.to}`);
}

// 3. dead frames between shots
const shots = [...AUDIT.shots].sort((a, b) => a.from - b.from);
for (let i = 1; i < shots.length; i++) {
  const gap = shots[i].from - shots[i - 1].to;
  if (gap > R.deadF) add("FAIL", "no-dead-frames", `${shots[i - 1].id}->${shots[i].id}`, `gap ${gap}f (${sec(gap)})`);
}

// 4. presenter windows
const pres = [...(AUDIT.presenters || [])].sort((a, b) => a.start_s - b.start_s);
for (const p of pres) {
  const need = (sEnd[p.last_sid] ?? NaN) + R.presTailS;
  if (!(p.end_s >= need - 1e-3)) add("FAIL", "presenter-tail", p.id, `end ${p.end_s}s < ${p.last_sid} end+0.2 = ${need.toFixed(2)}s`);
  if (p.fade_out_f != null && p.fade_out_f < R.minFadeOutF) add("FAIL", "fade>=18f", p.id, `fade-out ${p.fade_out_f}f`);
}
for (let i = 1; i < pres.length; i++) {
  const gap = pres[i].start_s - pres[i - 1].end_s;
  if (gap < R.presMergeGapS && !(pres[i].group && pres[i].group === pres[i - 1].group))
    add("WARN", "merge-presenters", `${pres[i - 1].id}+${pres[i].id}`, `gap ${gap.toFixed(2)}s < 8s: same segment? merge into one continuous card (set same group to silence)`);
}

const fails = rows.filter((r) => r.level === "FAIL").length;
fs.mkdirSync("out", { recursive: true });
fs.writeFileSync("out/audit_timing.json", JSON.stringify({ speed, rules: R, fails, rows }, null, 2));
for (const r of rows) console.log(`${r.level.padEnd(4)} ${r.rule.padEnd(18)} ${r.what.padEnd(28)} ${r.detail}`);
console.log(`\n${fails ? "AUDIT FAIL" : "AUDIT PASS"}: ${fails} fail, ${rows.length - fails} warn; elements=${(AUDIT.elements || []).length} shots=${shots.length} presenters=${pres.length}`);
process.exit(fails ? 1 : 0);
