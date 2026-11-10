// 04 复古未来复用组件（摘自 ep7 nvda-20261109 src/templates/NvdaShots.tsx 第 1-114 行 + src/brand/tokens.ts 的 R 色板）
// 用法：R 色板并入本集 src/brand/tokens.ts；本文件放 src/templates/Retro.tsx。依赖 SAFE/W（tokens）和 enter/prog（motion/primitives）。
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { R, SAFE, W } from "../brand/tokens";
import { enter, prog } from "../motion/primitives";

export const pop = (f: number, at: number, dur = 10) => {
  const t = prog(f, at, dur);
  const s = interpolate(t, [0, 0.7, 1], [0.3, 1.08, 1]);
  return { opacity: t, transform: `scale(${s})` };
};
// top=1140（内容坐标）：经 Shot focus 缩放+下移后落回 ~1200-1350，位于内容下方、字幕上方
export const srcTag = (f: number, at: number, text: string) => (
  <div style={{ position: "absolute", left: SAFE.left, top: 1140, width: 860, fontSize: 26, color: R.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...enter(f, at) }}>{text}</div>
);

// ---- 04 复古未来 primitives ----

// Persistent background: deep-purple→magenta sky + perspective grid floor +
// scanline/tape decor. Rendered once behind all shots in Episode.
const FOV_GRID = true; // A/B: retroSynthwave FOV/(FOV+z) 逐线透视网格 vs rotateX 斜面渐变
export const RetroStage: React.FC = () => {
  const f = useCurrentFrame();
  const gy = (f * 2.4) % 140;
  const skip = Math.floor(f / 9) % 11 === 0 ? 0.5 : 1;
  // FOV 透视网格：灭点 ~61% 高度，横线 z 随帧减小→越近越快越亮，纵线=扇形射线
  const VP = { x: 540, y: 1180 }, GROUND = 1980 - VP.y, FOVv = 2.6, SPAN = 58, SPEED = 0.55;
  const rows: { y: number; s: number }[] = [];
  for (let i = 0; i < 26; i++) {
    const z = 3 + (((i * 3.0 - f * SPEED) % SPAN) + SPAN) % SPAN;
    const s = FOVv / (FOVv + z);
    rows.push({ y: VP.y + GROUND * s, s });
  }
  const rays = Array.from({ length: 15 }, (_, i) => -900 + i * 210);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${R.sky0} 0%, ${R.sky1} 46%, ${R.sky2} 68%, ${R.horizon}88 82%, ${R.horizon} 100%)` }} />
      {FOV_GRID ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.9 }}>
          {rays.map((x2, i) => <line key={"r" + i} x1={VP.x} y1={VP.y} x2={x2} y2={1980} stroke={R.magenta + "30"} strokeWidth={2} />)}
          {rows.map((r, i) => <line key={"h" + i} x1={-80} y1={r.y} x2={1160} y2={r.y} stroke={R.cyan} strokeOpacity={0.1 + r.s * 0.6} strokeWidth={1 + r.s * 3.5} />)}
        </svg>
      ) : (
        <div style={{ position: "absolute", left: -400, right: -400, bottom: -120, height: "68%", transform: "perspective(720px) rotateX(60deg)", transformOrigin: "bottom center", opacity: 0.9 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${R.cyan}22 1px, transparent 1px), linear-gradient(90deg, ${R.magenta}22 1px, transparent 1px)`, backgroundSize: "140px 140px", backgroundPosition: `0 ${gy}px` }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${R.cyan}55 2px, transparent 2px), linear-gradient(90deg, ${R.magenta}55 2px, transparent 2px)`, backgroundSize: "700px 700px", backgroundPosition: `0 ${gy * 0.5}px`, opacity: 0.5 }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: "16%", height: 2, background: `linear-gradient(90deg, transparent, ${R.magenta}88, ${R.cyan}88, transparent)` }} />
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 2px, transparent 2px 5px)", opacity: 0.5 * skip }} />
    </AbsoluteFill>
  );
};

// Chrome title: metallic gradient text (bg-clip) + slam entrance + sheen sweep.
export const Chrome: React.FC<{ children: React.ReactNode; size?: number; at?: number; from?: number; color?: string; style?: React.CSSProperties; weight?: number }> = ({ children, size = 88, at, from, color, style, weight = 900 }) => {
  const f = useCurrentFrame();
  const t = prog(f, at ?? from ?? 0, 12);
  const s = interpolate(t, [0, 0.72, 1], [1.7, 0.96, 1]);
  const sheen = prog(f, (at ?? from ?? 0) + 8, 26);
  return (
    <div style={{ display: "inline-block", fontSize: size, fontWeight: weight, lineHeight: 1.12, whiteSpace: "nowrap", opacity: t, transform: `scale(${s})`, ...style }}>
      <span style={{
        backgroundImage: color ?? `linear-gradient(180deg,#FFFFFF 0%,#D5DCEA 30%,#8A93AC 52%,#F4F7FF 58%,#5C6680 100%)`,
        backgroundSize: "220% 100%",
        backgroundPosition: `${(1 - sheen) * 100}% 0%`,
        WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        filter: "drop-shadow(0 4px 0 rgba(12,5,26,0.95)) drop-shadow(0 10px 22px rgba(0,0,0,0.45))",
      }}>{children}</span>
    </div>
  );
};

// Dark retro card with neon edge + chrome label.
export const RCard: React.FC<{ x?: number; y?: number; w?: number; h?: number; accent?: string; at?: number; from?: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ x = SAFE.left, y = 300, w = 860, h = 300, accent = R.cyan, at, from, children, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: R.panel, border: `2px solid ${accent}66`, borderRadius: 18, boxShadow: `0 0 0 1px ${accent}22, 0 18px 50px rgba(0,0,0,0.45), inset 0 0 40px ${accent}0d`, ...enter(f, at ?? from ?? 0, 10, 0), ...style }}>
      <div style={{ position: "absolute", left: 14, top: 14, width: 26, height: 26, borderTop: `3px solid ${accent}`, borderLeft: `3px solid ${accent}` }} />
      <div style={{ position: "absolute", right: 14, bottom: 14, width: 26, height: 26, borderBottom: `3px solid ${accent}`, borderRight: `3px solid ${accent}` }} />
      {children}
    </div>
  );
};

export const RTag: React.FC<{ x: number; y: number; text: string; accent?: string; at?: number; from?: number; size?: number }> = ({ x, y, text, accent = R.magenta, at, from, size = 30 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, padding: "8px 22px", border: `2px solid ${accent}`, borderRadius: 8, color: accent, fontSize: size, fontWeight: 800, background: `${accent}14`, whiteSpace: "nowrap", ...pop(f, at ?? from ?? 0) }}>{text}</div>
  );
};

export const RollNum: React.FC<{ target: number; decimals?: number; suffix?: string; at?: number; from?: number; size?: number; color?: string }> = ({ target, decimals = 0, suffix = "", at, from, size = 120, color = R.cyan }) => {
  const f = useCurrentFrame();
  const t = prog(f, at ?? from ?? 0, 26);
  const v = (target * (0.6 + 0.4 * t)).toFixed(decimals);
  return (
    <span style={{ fontSize: size, fontWeight: 900, color, fontVariantNumeric: "tabular-nums", textShadow: `0 0 24px ${color}55` }}>{v}{suffix}</span>
  );
};

export const Photo: React.FC<{ src: string; x: number; y: number; w?: number; h?: number; at?: number; from?: number; name?: string; accent?: string }> = ({ src, x, y, w = 300, h = 340, at, from, name, accent = R.cyan }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, ...pop(f, at ?? from ?? 0) }}>
      <div style={{ height: h || 340, borderRadius: 14, overflow: "hidden", border: `2px solid ${accent}`, boxShadow: `0 0 26px ${accent}33, 0 16px 40px rgba(0,0,0,0.5)` }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {name && <div style={{ marginTop: 10, textAlign: "center", fontSize: 30, fontWeight: 800, color: R.ink }}>{name}</div>}
    </div>
  );
};

// ================= S01–S10 =================
