import React from "react";
import { useCurrentFrame } from "remotion";
import { Pt, polyLen } from "../motion/primitives";
import rough from "../vendor/rough.esm.js";

// Style 12 手绘线条 engine: Rough.js (MIT, vendored) produces the sketchy stroke;
// we rotate 3 seeded variants on a 2/3/2/3 frame cadence (~12 drawings/s, 一拍二).

export const INK = "#33302B";
export const INK_SOFT = "#8F887C";
export const PAPER12 = "#F4EFE3";
export const PENCIL = "#C94F3D"; // 铅笔红（强调）
export const BLUE12 = "#3E6FB0"; // 铅笔蓝（AI/回复侧）
export const HAND_FONT = '"ZCOOL KuaiLe", "Noto Sans SC", "Microsoft YaHei", sans-serif';

// Compensated for 1.25x final speedup: ~4.8 variant switches/s at 1x → ~6/s in
// the shipped video (deliberately slow hand-drawn cadence per user preference).
const WOBBLE = [6, 7, 6, 6];
const WOBBLE_CYCLE = WOBBLE.reduce((a, b) => a + b, 0);
const wobbleIdx = (f: number, n: number) => {
  const pos = ((Math.floor(f) % WOBBLE_CYCLE) + WOBBLE_CYCLE) % WOBBLE_CYCLE;
  let acc = 0;
  for (let i = 0; i < WOBBLE.length; i++) {
    acc += WOBBLE[i];
    if (pos < acc) return i % n;
  }
  return 0;
};

const numSeed = (s: number | string) => [...String(s)].reduce((a, c) => ((a * 31 + c.charCodeAt(0)) | 0) >>> 0, 7);

type RoughOp = { op: string; data: number[] };
const ops2d = (ops: RoughOp[]): string =>
  ops
    .map((o) => {
      if (o.op === "move") return `M${o.data[0].toFixed(1)} ${o.data[1].toFixed(1)}`;
      if (o.op === "lineTo") return `L${o.data[0].toFixed(1)} ${o.data[1].toFixed(1)}`;
      if (o.op === "bcurveTo" || o.op === "curveTo") return `C${o.data.map((n) => n.toFixed(1)).join(" ")}`;
      if (o.op === "qcurveTo") return `Q${o.data.map((n) => n.toFixed(1)).join(" ")}`;
      return "";
    })
    .join(" ");

export const SketchPath: React.FC<{
  pts: Pt[];
  seed: number | string;
  stroke?: string;
  width?: number;
  drawn?: number; // 0..1 draw-on progress (strokeDashoffset reveal)
  close?: boolean;
  fill?: string;
  fillOpacity?: number;
  amp?: number; // roughness
  still?: boolean; // freeze wobble
  opacity?: number;
}> = ({ pts, seed, stroke = INK, width = 4, drawn = 1, close = false, fill, fillOpacity = 1, amp = 1.4, still = false, opacity = 1 }) => {
  const f = useCurrentFrame();
  const v = still ? 0 : wobbleIdx(f, 3);
  const arr = pts.map((p) => [p.x, p.y] as [number, number]);
  const gen = rough.generator({
    roughness: amp,
    bowing: 1.1,
    seed: (numSeed(seed) + v * 101) >>> 0,
    maxRandomnessOffset: 1.8,
    ...(fill ? { fill, fillStyle: "solid" } : {}),
  });
  const drawable = close ? gen.polygon(arr) : gen.curve(arr);
  const L = polyLen(pts);
  const partial = drawn < 1;
  return (
    <g opacity={opacity}>
      {drawable.sets.map((set: { type: string; ops: { op: string; data: number[] }[] }, i: number) => (
        <path
          key={i}
          d={ops2d(set.ops as RoughOp[])}
          fill={set.type === "fillPath" ? (fill ?? "none") : "none"}
          fillOpacity={fillOpacity}
          stroke={set.type === "fillSketch" ? (fill ?? stroke) : stroke}
          strokeWidth={set.type === "fillSketch" ? Math.max(1.5, width * 0.4) : width}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={partial && set.type === "path" ? L : undefined}
          strokeDashoffset={partial && set.type === "path" ? L * (1 - drawn) : 0}
        />
      ))}
    </g>
  );
};

// ---- geometry helpers (all return point arrays for SketchPath) ----

export const linePts = (x1: number, y1: number, x2: number, y2: number, n = 8, bow = 0): Pt[] => {
  const pts: Pt[] = [];
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const b = bow * Math.sin(Math.PI * t);
    pts.push({ x: x1 + dx * t + nx * b, y: y1 + dy * t + ny * b });
  }
  return pts;
};

export const arcPts = (cx: number, cy: number, r: number, a0: number, a1: number, n = 20, ry?: number): Pt[] => {
  const pts: Pt[] = [];
  const ryy = ry ?? r;
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push({ x: cx + r * Math.cos(a), y: cy + ryy * Math.sin(a) });
  }
  return pts;
};

export const rectPts = (x: number, y: number, w: number, h: number, per = 7): Pt[] => {
  const pts: Pt[] = [];
  const edges: [number, number, number, number][] = [
    [x, y, x + w, y],
    [x + w, y, x + w, y + h],
    [x + w, y + h, x, y + h],
    [x, y + h, x, y],
  ];
  for (const [x1, y1, x2, y2] of edges) for (let i = 0; i <= per; i++) pts.push({ x: x1 + ((x2 - x1) * i) / per, y: y1 + ((y2 - y1) * i) / per });
  pts.push(pts[0]);
  return pts;
};

export const bubblePts = (x: number, y: number, w: number, h: number, r = 24): Pt[] => {
  const pts: Pt[] = [];
  const per = 6;
  for (let i = 0; i <= per; i++) pts.push({ x: x + r + ((w - 2 * r) * i) / per, y });
  for (let i = 0; i <= per; i++) { const a = -Math.PI / 2 + (Math.PI / 2) * (i / per); pts.push({ x: x + w - r + r * Math.cos(a), y: y + r + r * Math.sin(a) }); }
  for (let i = 0; i <= per; i++) pts.push({ x: x + w - r - ((w - 2 * r) * i) / per, y: y + h });
  for (let i = 0; i <= per; i++) { const a = (Math.PI / 2) * (i / per); pts.push({ x: x + r - r * Math.cos(a), y: y + h - r + r * Math.sin(a) }); }
  for (let i = 0; i <= per; i++) pts.push({ x, y: y + h - r - ((h - 2 * r) * i) / per });
  for (let i = 0; i <= per; i++) { const a = Math.PI + (Math.PI / 2) * (i / per); pts.push({ x: x + r + r * Math.cos(a), y: y + r + r * Math.sin(a) }); }
  pts.push(pts[0]);
  return pts;
};

// Chat bubble outline (rounded-rect path; tails drawn separately where needed).
export const chatBubble = (x: number, y: number, w: number, h: number): Pt[] => bubblePts(x, y, w, h, 20);

export const SketchFigure: React.FC<{ x: number; y: number; h: number; seed: string | number; stroke?: string; width?: number; fill?: boolean; armUp?: boolean }> = ({ x, y, h, seed, stroke = INK, width = 4, fill = false, armUp = false }) => {
  const headR = h * 0.16;
  const bodyTop = y + headR * 2;
  const bodyBot = y + h * 0.72;
  const legY = y + h;
  return (
    <g>
      <SketchPath pts={arcPts(x, y + headR, headR, 0, Math.PI * 2, 14)} seed={`${seed}h`} stroke={stroke} width={width} close fill={fill ? stroke : "none"} fillOpacity={fill ? 0.9 : 0} />
      <SketchPath pts={linePts(x, bodyTop, x, bodyBot, 5)} seed={`${seed}b`} stroke={stroke} width={width} />
      <SketchPath pts={linePts(x - h * 0.22, armUp ? bodyTop - h * 0.18 : bodyTop + h * 0.3, x, bodyTop + h * 0.14, 4)} seed={`${seed}a1`} stroke={stroke} width={width} />
      <SketchPath pts={linePts(x + h * 0.22, armUp ? bodyTop - h * 0.18 : bodyTop + h * 0.3, x, bodyTop + h * 0.14, 4)} seed={`${seed}a2`} stroke={stroke} width={width} />
      <SketchPath pts={linePts(x, bodyBot, x - h * 0.24, legY, 4)} seed={`${seed}l1`} stroke={stroke} width={width} />
      <SketchPath pts={linePts(x, bodyBot, x + h * 0.24, legY, 4)} seed={`${seed}l2`} stroke={stroke} width={width} />
    </g>
  );
};

// Five-point star outline (the "心事" origami star).
export const starPts = (cx: number, cy: number, r: number, n = 5): Pt[] => {
  const pts: Pt[] = [];
  for (let i = 0; i <= n * 2; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / n;
    const rr = i % 2 === 0 ? r : r * 0.42;
    pts.push({ x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) });
  }
  return pts;
};

// Soft pencil halo (the only "glow" allowed in style 12: low-opacity extra strokes).
export const Halo: React.FC<{ cx: number; cy: number; r: number; color?: string; opacity?: number }> = ({ cx, cy, r, color = BLUE12, opacity = 1 }) => (
  <g opacity={opacity}>
    <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.12} stroke="none" />
    <circle cx={cx} cy={cy} r={r * 1.28} fill={color} fillOpacity={0.06} stroke="none" />
  </g>
);

// Absolute-positioned SVG wrapper; children draw in page coordinates.
export const Sketch: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity }) => (
  <svg style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity }} width={1080} height={1920}>
    {children}
  </svg>
);

import { EXLIB } from "./exlib-data";
import { prog } from "../motion/primitives";

// Excalidraw community-library item placed into the sketch scene.
// h = target height in page px; strokeWidth is held constant under scaling.
export const ExItem: React.FC<{
  lib: string;
  name: string;
  x: number;
  y: number;
  h: number;
  stroke?: string;
  width?: number;
  at?: number;   // draw-on start frame (absolute)
  dur?: number;
  opacity?: number;
}> = ({ lib, name, x, y, h, stroke = INK, width = 4, at, dur = 14, opacity = 1 }) => {
  const f = useCurrentFrame();
  const item = EXLIB[lib]?.[name];
  if (!item) return null;
  const s = h / item.h;
  const p = at == null ? 1 : prog(f, at, dur);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      {item.strokes.map((st, i) => (
        <SketchPath key={i} pts={st.pts} seed={`ex:${lib}:${name}:${i}`} stroke={stroke} width={Math.max(1.5, width / s)} close={st.close} drawn={p} />
      ))}
    </g>
  );
};
