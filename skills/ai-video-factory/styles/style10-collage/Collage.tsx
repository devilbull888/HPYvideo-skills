import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { CJK_FONT_STACK } from "../brand/tokens";
import { prog } from "../motion/primitives";

// ---------- 10 拼贴 tokens ----------
export const K = {
  bg: "#EDE7DA",        // 板块一：米白纸
  bgData: "#DFE4E8",    // 板块二：数据·灰蓝纸
  bgYou: "#F2E7C8",     // 板块三：你·淡黄纸
  ink: "#26221B",
  inkSoft: "#6B6254",
  red: "#D93A2B",
  yellow: "#F2C230",
  blue: "#2B5DA8",
  white: "#FBF7EE",
  black: "#211D17",
  kraft: "#CBB58E",
  tape: "rgba(242,229,184,0.72)",
} as const;
export const HAND = '"ZCOOL KuaiLe", "Noto Sans SC", "Microsoft YaHei", sans-serif';
export const BODY = CJK_FONT_STACK;

// ---------- 定格抖动：1× 下 8 次/s（成片 1.5× 观感 ≈12/s，对齐参考片） ----------
// 逐元素相位：seed 相位偏移使各元素在不同帧更新（否则整帧齐晃）
const U = (f: number, seed: string) => Math.floor(((f + random(seed + "ph") * 4) * 8) / 30);
export const jit = (f: number, seed: string, amp = 1.6, rot = 0.4) => {
  const u = U(f, seed);
  const a = amp * (0.7 + random(seed + "amp") * 0.6);
  const dx = (random(`${seed}x${u}`) * 2 - 1) * a;
  const dy = (random(`${seed}y${u}`) * 2 - 1) * a;
  const dr = (random(`${seed}r${u}`) * 2 - 1) * rot;
  return `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${dr.toFixed(2)}deg)`;
};

// 拍板入场：at 帧起 9f 内下落+旋转落定（纸片被拍上板的动作）
export const slap = (f: number, at: number | undefined, seed: string) => {
  if (at == null) return { o: 1, dx: 0, dy: 0, dr: 0, sc: 1 };
  const t = prog(f, at, 9);
  const v = Math.floor(random(seed + "sv") * 3); // 入场变体由 seed 决定
  if (v === 1) return { o: t, dx: (1 - t) * -110, dy: 0, dr: (1 - t) * (random(seed + "sd") * 8 - 4), sc: 1 };
  if (v === 2) return { o: t, dx: 0, dy: (1 - t) * 12, dr: (1 - t) * (random(seed + "sd") * 12 - 6), sc: 0.55 + 0.45 * t };
  return { o: t, dx: 0, dy: (1 - t) * -64, dr: (1 - t) * (random(seed + "sd") * 16 - 8), sc: 1 };
};

// 一阵风：新镜头出现那一拍，元素被吹动一次再落定（逐元素错峰+方向随机）
export const GustCtx = React.createContext(0);
export const gust = (f: number, at: number, seed: string, mode: "pin" | "tape" | "free" = "free") => {
  const d = Math.floor(random(seed + "gd") * 9); // 逐元素延迟 0-8f
  const t = (f - at - d) / 34;
  if (t < 0 || t >= 1) return "";
  const a = 0.55 + random(seed + "ga") * 0.75;
  if (mode === "pin") {
    // 图钉卡：以钉为支点单摆衰减，约 1.5 次回摆后定格
    const ang = Math.sin(t * Math.PI * 3.0) * (1 - t) * 6.5 * a;
    return `rotate(${ang.toFixed(2)}deg)`;
  }
  // 胶带卡被按住：只轻微颤；自由纸片：被吹得平移+轻倾
  const m = mode === "tape" ? 0.35 : 1;
  const sway = Math.sin(t * Math.PI) * a * m;
  return `translate(${(sway * 26).toFixed(1)}px,${(sway * 5).toFixed(1)}px) rotate(${(sway * 1.8).toFixed(2)}deg)`;
};

// 一次性再摆位：at 帧后元素永久偏移 (dx,dy,dr)，像被动画师又挪了一下
export const nudge = (f: number, at: number | undefined, d: [number, number, number]) =>
  at != null && f >= at ? `translate(${d[0]}px,${d[1]}px) rotate(${d[2]}deg)` : "";

// ---------- 撕边轮廓：沿矩形四边布点，每点 ±rough 抖动 ----------
const tornPts = (w: number, h: number, seed: string, rough = 7, step = 34): string => {
  const pts: [number, number][] = [];
  const j = (k: string, v: number, amp: number) => v + (random(seed + k) * 2 - 1) * amp;
  for (let x = 0; x <= w; x += step) pts.push([x, j("t" + x, 0, rough)]);
  for (let y = 0; y <= h; y += step) pts.push([j("r" + y, w, rough), y]);
  for (let x = w; x >= 0; x -= step) pts.push([x, j("b" + x, h, rough)]);
  for (let y = h; y >= 0; y -= step) pts.push([j("l" + y, 0, rough), y]);
  return `polygon(${pts.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(",")})`;
};

// ---------- 和纸胶带 ----------
export const Tape: React.FC<{ x: number; y: number; rot?: number; w?: number; seed: string }> = ({ x, y, rot = 0, w = 96, seed }) => (
  <div
    style={{
      position: "absolute", left: x, top: y, width: w, height: 30, background: K.tape,
      transform: `rotate(${rot}deg)`, clipPath: tornPts(w, 30, seed, 3, 16), opacity: 0.9,
    }}
  />
);

// ---------- 图钉 ----------
export const Pin: React.FC<{ x: number; y: number; c?: string }> = ({ x, y, c = K.red }) => (
  <svg width={44} height={44} style={{ position: "absolute", left: x - 22, top: y - 10 }} viewBox="0 0 44 44">
    <ellipse cx={22} cy={18} rx={13} ry={11} fill={c} />
    <ellipse cx={18} cy={14} rx={4} ry={3} fill="rgba(255,255,255,0.55)" />
    <polygon points="20,26 24,26 23,40 21,40" fill="#8A8578" />
  </svg>
);

// ---------- 撕纸卡：白边 + 撕边 + 投影 + 小旋转 + 逐元素定格抖 ----------
export const TornCard: React.FC<{
  x: number; y: number; w: number; h: number;
  fill?: string; rot?: number; seed: string; bw?: number;
  tape?: boolean; pin?: boolean; jitter?: boolean;
  shadow?: boolean; rough?: number; children?: React.ReactNode;
  at?: number; nudgeAt?: number; nudgeD?: [number, number, number];
}> = ({ x, y, w, h, fill = K.white, rot = 0, seed, bw = 10, tape, pin, jitter = true, shadow = true, rough = 7, children, at, nudgeAt, nudgeD = [0, 0, 0] }) => {
  const f = useCurrentFrame();
  const ga = React.useContext(GustCtx);
  const W2 = w + bw * 2, H2 = h + bw * 2;
  const gmode = pin ? "pin" : "free";
  return (
    <div style={{ position: "absolute", left: x - bw, top: y - bw, width: W2, height: H2, opacity: slap(f, at, seed).o, transformOrigin: pin ? `${W2 / 2}px -2px` : "center", transform: `translate(${slap(f, at, seed).dx}px, ${slap(f, at, seed).dy}px) scale(${slap(f, at, seed).sc}) ${jitter ? jit(f, seed) : ""} rotate(${rot + slap(f, at, seed).dr}deg) ${nudge(f, nudgeAt, nudgeD)} ${gust(f, ga, seed, gmode)}` }}>
      <div style={{ position: "absolute", inset: 0, filter: shadow ? "drop-shadow(3px 5px 4px rgba(38,34,27,0.35))" : undefined }}>
        <div style={{ position: "absolute", inset: 0, background: "white", clipPath: tornPts(W2, H2, seed + "o", rough + 2) }} />
        <div style={{ position: "absolute", left: bw, top: bw, width: w, height: h, background: fill, clipPath: tornPts(w, h, seed + "i", rough), overflow: "hidden" }}>
          {children}
        </div>
      </div>

      {pin && (
        <div style={{ opacity: at == null ? 1 : prog(f, at + 9, 4), transform: `translateY(${at == null ? 0 : (1 - prog(f, at + 9, 4)) * -26}px)` }}>
          <Pin x={W2 / 2} y={-2} />
        </div>
      )}
    </div>
  );
};

// ---------- 撕纸标签条（文字专用，行内尺寸） ----------
export const Tag: React.FC<{
  x: number; y: number; text: string; fs?: number; fill?: string; color?: string;
  rot?: number; seed: string; font?: string; pad?: [number, number]; jitter?: boolean;
  tape?: boolean; pin?: boolean; weight?: number; nowrap?: boolean; ls?: number;
  at?: number; nudgeAt?: number; nudgeD?: [number, number, number];
}> = ({ x, y, text, fs = 46, fill = K.black, color = "#FFF", rot = 0, seed, font = BODY, pad = [26, 14], jitter = true, tape, pin, weight = 800, nowrap = true, ls = 2, at, nudgeAt, nudgeD }) => {
  const units = [...text].reduce((n, ch) => n + (/[A-Za-z0-9%]/.test(ch) ? 0.58 : 1), 0);
  const w = Math.ceil(units * fs * 1.08 + pad[0] * 2 + 100);
  const h = Math.ceil(fs * 1.18 + pad[1] * 2 + 24);
  return (
    <TornCard x={x} y={y} w={w} h={h} fill={fill} rot={rot} seed={seed} bw={8} tape={tape} pin={pin} jitter={jitter} rough={5} at={at} nudgeAt={nudgeAt} nudgeD={nudgeD}>
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, fontSize: fs, fontWeight: weight, color, letterSpacing: ls, whiteSpace: nowrap ? "nowrap" : "normal", padding: `0 ${pad[0]}px` }}>
        {text}
      </div>
    </TornCard>
  );
};

// ---------- 爆炸贴 ----------
export const Starburst: React.FC<{ x: number; y: number; r?: number; text: string; seed: string; fill?: string; color?: string; fs?: number }> = ({ x, y, r = 90, text, seed, fill = K.red, color = "#FFF", fs = 40 }) => {
  const f = useCurrentFrame();
  const n = 14;
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const ang = (Math.PI * i) / n - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.72;
    pts.push(`${(Math.cos(ang) * rr).toFixed(1)},${(Math.sin(ang) * rr).toFixed(1)}`);
  }
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, transform: jit(f, seed) }}>
      <svg width={r * 2} height={r * 2} viewBox={`${-r} ${-r} ${r * 2} ${r * 2}`} style={{ position: "absolute", filter: "drop-shadow(2px 4px 3px rgba(0,0,0,0.3))" }}>
        <polygon points={pts.join(" ")} fill={fill} stroke="white" strokeWidth={7} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HAND, fontSize: fs, fontWeight: 700, color, transform: "rotate(-8deg)" }}>{text}</div>
    </div>
  );
};

// ---------- 网点半调圆斑（元素衬底） ----------
export const Halftone: React.FC<{ x: number; y: number; r: number; color?: string; opacity?: number }> = ({ x, y, r, color = "#8A7E63", opacity = 0.5 }) => (
  <svg width={r * 2} height={r * 2} style={{ position: "absolute", left: x - r, top: y - r, opacity }} viewBox={`0 0 ${r * 2} ${r * 2}`}>
    <defs>
      <pattern id={`ht${x}${y}`} width={18} height={18} patternUnits="userSpaceOnUse">
        <circle cx={9} cy={9} r={3.4} fill={color} />
      </pattern>
      <mask id={`htm${x}${y}`}>
        <radialGradient id={`htg${x}${y}`} cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <rect width={r * 2} height={r * 2} fill={`url(#htg${x}${y})`} />
      </mask>
    </defs>
    <rect width={r * 2} height={r * 2} fill={`url(#ht${x}${y})`} mask={`url(#htm${x}${y})`} />
  </svg>
);

// ---------- 纸张背景：纹理 + 色调 + 暗角 + 颗粒 ----------
export const PaperBg: React.FC<{ fill?: string; children?: React.ReactNode }> = ({ fill = K.bg, children }) => (
  <AbsoluteFill style={{ background: fill }}>
    <Img src={staticFile("textures/paper.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55, mixBlendMode: "multiply" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 42%, transparent 55%, rgba(60,48,30,0.28) 100%)" }} />
    {children}
  </AbsoluteFill>
);

// ---------- 纸滑入转场：整张纸从左滑入盖屏，纸色=下一场景底色 ----------
export const PaperWipe: React.FC<{ from: number; fill: string; dur?: number }> = ({ from, fill, dur = 13 }) => {
  const f = useCurrentFrame();
  const t = prog(f, from, dur);
  const xPos = interpolate(t, [0, 1], [-115, 0]);
  if (t >= 1) return null;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", left: 0, top: 0, width: 1180, height: 1920, background: fill,
          transform: `translateX(${xPos}%)`,
          clipPath: tornPts(1180, 1920, "wipe" + fill, 16, 60),
          boxShadow: "inset -30px 0 40px rgba(0,0,0,0.18)",
        }}
      />
    </div>
  );
};

// ---------- 钩子轴：底部撕纸条 + 6 节点，当前节点黄块高亮滑动 ----------
export const HOOK_NODES = ["为何缓冲", "管什么", "岗位在涨", "跟你啥关系", "怎么办", "你选哪种"];
export const HookAxis: React.FC<{ nodes: { label: string; from: number; to: number }[] }> = ({ nodes }) => {
  const f = useCurrentFrame();
  const L = 74, R = 74, W = 1080 - L - R, Y = 1608;
  const cur = nodes.findIndex((n) => f >= n.from && f < n.to);
  const idx = cur < 0 ? nodes.length - 1 : cur;
  const seg = W / nodes.length;
  // 高亮块滑动（到新节点时用 8f 缓动滑过去）
  const prevEnd = idx > 0 ? nodes[idx - 1].to : -1e9;
  const slide = prog(f, prevEnd, 8);
  const hx = idx === 0 ? 0 : interpolate(slide, [0, 1], [(idx - 1) * seg, idx * seg]);
  return (
    <div style={{ position: "absolute", left: L, top: Y, width: W, height: 52 }}>
      <div style={{ position: "absolute", inset: 0, background: K.kraft, clipPath: tornPts(W, 52, "axis", 4, 40), boxShadow: "0 3px 5px rgba(38,34,27,0.25)" }} />
      <div style={{ position: "absolute", left: 8, right: 8, top: 7, borderTop: "3px dashed rgba(38,34,27,0.4)" }} />
      <div style={{ position: "absolute", left: 8, right: 8, bottom: 7, borderTop: "3px dashed rgba(38,34,27,0.4)" }} />
      <div style={{ position: "absolute", left: hx + 4, top: 6, width: seg - 8, height: 40, background: K.yellow, clipPath: tornPts(seg - 8, 40, "axh", 3, 26), transition: "none" }} />
      {nodes.map((n, i) => (
        <div key={i} style={{ position: "absolute", left: i * seg, top: 0, width: seg, height: 52, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HAND, fontSize: 30, fontWeight: 700, color: i === idx ? K.black : "rgba(38,34,27,0.55)", whiteSpace: "nowrap" }}>
          {n.label}
        </div>
      ))}
    </div>
  );
};

// ---------- 横线笔记本纸 ----------
export const LinedPaper: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; seed: string; jitter?: boolean; children?: React.ReactNode }> = ({ x, y, w, h, rot = 0, seed, jitter = true, children }) => (
  <TornCard x={x} y={y} w={w} h={h} fill="#FCFAF2" rot={rot} seed={seed} jitter={jitter}>
    <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(180deg, transparent 0 46px, rgba(43,93,168,0.35) 46px 48px)", marginTop: 20 }} />
    <div style={{ position: "absolute", left: 56, top: 0, bottom: 0, width: 3, background: "rgba(217,58,43,0.45)" }} />
    {children}
  </TornCard>
);

// ---------- 印章 ----------
export const Seal: React.FC<{ x: number; y: number; r?: number; text: string; rot?: number }> = ({ x, y, r = 78, text, rot = -14 }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, transform: `rotate(${rot}deg)`, border: `6px solid ${K.red}`, borderRadius: "50%", opacity: 0.88, display: "flex", alignItems: "center", justifyContent: "center", color: K.red, fontFamily: HAND, fontSize: 34, fontWeight: 700, textAlign: "center", lineHeight: 1.2, filter: "drop-shadow(1px 2px 1px rgba(0,0,0,0.15))" }}>
    {text}
  </div>
);

// ---------- 照片贴纸：真图装进白边撕纸框 ----------
export const StickerPhoto: React.FC<{ x: number; y: number; w: number; h: number; src: string; rot?: number; seed: string; at?: number; pin?: boolean }> = ({ x, y, w, h, src, rot = 0, seed, at, pin }) => (
  <TornCard x={x} y={y} w={w} h={h} fill="#fff" rot={rot} seed={seed} bw={12} at={at} pin={pin}>
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.55) contrast(1.12) brightness(1.04)" }} />
  </TornCard>
);

// ---------- 撕开的沟壑：纸面被撕开一道缝（非黑色块） ----------
export const RipGap: React.FC<{ y?: number; h?: number; at: number; dur?: number; fill?: string }> = ({ y = 820, h = 240, at, dur = 14, fill = "#C7CDD3" }) => {
  const f = useCurrentFrame();
  const t = prog(f, at, dur);
  if (t <= 0) return null;
  const jag = (i: number) => (random("rg" + i) * 2 - 1) * 26;
  const top = [0, 120, 260, 400, 540, 680, 840, 980, 1080].map((x, i) => [x, 60 + jag(i)] as const);
  const bot = [1080, 980, 840, 680, 540, 400, 260, 120, 0].map((x, i) => [x, 60 + h + jag(20 + i)] as const);
  const open = t; // 0->1 撕口张开
  const midY = 60 + h / 2;
  const poly = [...top, ...bot].map((pt) => `${(pt[0])},${(midY + (pt[1] - midY) * open).toFixed(1)}`).join(" ");
  return (
    <svg width={1080} height={h + 120} style={{ position: "absolute", left: 0, top: y - 60 }} viewBox={`0 0 1080 ${h + 120}`}>
      <polygon points={poly} fill={fill} stroke="white" strokeWidth={9} style={{ filter: "drop-shadow(0 6px 6px rgba(38,34,27,0.35))" }} />
    </svg>
  );
};

// ---------- 图标贴纸：CC 图标装进白边撕纸卡 ----------
export const StickerIcon: React.FC<{ x: number; y: number; s: number; src: string; rot?: number; seed: string; at?: number; pin?: boolean; fill?: string; pad?: number }> = ({ x, y, s, src, rot = 0, seed, at, pin, fill = K.white, pad = 26 }) => (
  <TornCard x={x} y={y} w={s + pad * 2} h={s + pad * 2} fill={fill} rot={rot} seed={seed} bw={10} at={at} pin={pin}>
    <Img src={staticFile(src)} style={{ width: s, height: s, margin: pad }} />
  </TornCard>
);

// ---------- 小人贴纸（简笔，自绘） ----------
export const Person: React.FC<{ x: number; y: number; s?: number; c?: string; seed: string; flip?: boolean }> = ({ x, y, s = 1, c = K.blue, seed, flip }) => {
  const f = useCurrentFrame();
  return (
    <svg width={90 * s} height={120 * s} viewBox="0 0 90 120" style={{ position: "absolute", left: x, top: y, transform: `${jit(f, seed)} scaleX(${flip ? -1 : 1})`, transformOrigin: "center" }}>
      <ellipse cx={45} cy={26} rx={18} ry={19} fill={c} stroke="white" strokeWidth={6} />
      <rect x={18} y={46} width={54} height={52} rx={20} fill={c} stroke="white" strokeWidth={6} />
      <rect x={22} y={92} width={16} height={26} rx={7} fill={c} stroke="white" strokeWidth={5} />
      <rect x={52} y={92} width={16} height={26} rx={7} fill={c} stroke="white" strokeWidth={5} />
    </svg>
  );
};

// ---------- 大问号贴纸 ----------
export const BigQ: React.FC<{ x: number; y: number; fs?: number; seed: string; fill?: string; enter?: number }> = ({ x, y, fs = 210, seed, fill = K.red, enter: at }) => {
  const f = useCurrentFrame();
  const t = at != null ? prog(f, at, 10) : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: HAND, fontSize: fs, fontWeight: 700, color: fill, opacity: t, transform: `${jit(f, seed)} rotate(-6deg) scale(${0.6 + 0.4 * t})`, transformOrigin: "center", textShadow: "3px 4px 0 rgba(38,34,27,0.25)" }}>
      ？
    </div>
  );
};

// ---------- 荧光笔高亮带（覆盖在文字行上的黄色涂抹） ----------
export const HiPen: React.FC<{ x: number; y: number; w: number; h?: number; at: number; dur?: number }> = ({ x, y, w, h = 40, at, dur = 10 }) => {
  const f = useCurrentFrame();
  const t = prog(f, at, dur);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w * t, height: h, background: "rgba(242,194,48,0.55)", transform: "rotate(-0.6deg)", borderRadius: 4 }} />
  );
};

// ---------- 数字人剪纸贴片卡：撕边框+图钉，内容顺滑不抖 ----------
import { OffthreadVideo, Sequence } from "remotion";
import { FPS } from "../brand/tokens";
export const CollagePresenter: React.FC<{ id: string; startS: number; endS: number; placeholder?: boolean; top?: number; scale?: number; id2?: string; splitS?: number; moveAt?: number; top2?: number; scale2?: number }> = ({ id, startS, endS, placeholder, top = 560, scale = 1, id2, splitS, moveAt, top2, scale2 }) => {
  const f = useCurrentFrame();
  const from = Math.round(startS * FPS);
  const to = Math.round(endS * FPS);
  const split = splitS != null ? Math.round(splitS * FPS) : to;
  const inT = prog(f, from, 10);
  const outT = prog(f, to - 18, 18);
  const t = inT * (1 - outT);
  const geo = moveAt != null ? prog(f, moveAt, 14) : 0;
  const topNow = interpolate(geo, [0, 1], [top, top2 ?? top]);
  const scaleNow = interpolate(geo, [0, 1], [scale, scale2 ?? scale]);
  const W2 = 620, H2 = 540;
  const left = (1080 - W2) / 2;
  return (
    <div style={{ position: "absolute", left, top: topNow + outT * 36, width: W2, height: H2, opacity: t, transform: `scale(${(0.94 + 0.06 * t) * scaleNow}) rotate(-1.2deg)`, transformOrigin: "center top" }}>
      <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(4px 8px 6px rgba(38,34,27,0.35))" }}>
        <div style={{ position: "absolute", inset: 0, background: "white", clipPath: tornPts(W2, H2, "pres" + id + "o", 9) }} />
        <div style={{ position: "absolute", left: 12, top: 12, width: W2 - 24, height: H2 - 24, background: "#3A382F", clipPath: tornPts(W2 - 24, H2 - 24, "pres" + id + "i", 7), overflow: "hidden" }}>
          {placeholder ? (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#999", fontFamily: BODY }}>presenter {id}</div>
          ) : (
            <>
              <Sequence from={from} durationInFrames={split - from} layout="none">
                <OffthreadVideo muted src={staticFile(`presenter_${id}.mp4`)} style={{ width: W2 - 24, height: H2 - 24 }} />
              </Sequence>
              {id2 && (
                <Sequence from={split} durationInFrames={to - split} layout="none">
                  <OffthreadVideo muted src={staticFile(`presenter_${id2}.mp4`)} style={{ width: W2 - 24, height: H2 - 24 }} />
                </Sequence>
              )}
            </>
          )}
        </div>
      </div>
      <Pin x={W2 / 2} y={-4} />
    </div>
  );
};
