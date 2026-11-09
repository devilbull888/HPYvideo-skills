// 风格11·像素引擎：270x480逻辑画布→4x整数放大（DOM版）
import React from "react";
import { delayRender, continueRender, staticFile as sf } from "remotion";

export const PW = 270, PH = 480, SCALE = 4;
export const PAL = {
  bg: "#1a1c2c", wall: "#e05050", gold: "#f0a45d", ivory: "#f4f1de",
  ink: "#14131a", blue: "#5a7a9e", green: "#7ea05a", dim: "#3a3f5a",
  red: "#e5322d", paper: "#c9b896", shadow: "#0d0e18",
} as const;

let fontReady = false;
export const ensurePixelFont = () => {
  if (fontReady) return;
  fontReady = true;
  const h = delayRender("fusion-pixel");
  const f = new FontFace("FusionPixel", "url(" + sf("fonts/FusionPixel12.ttf") + ")");
  f.load().then((ff) => { document.fonts.add(ff); continueRender(h); }).catch(() => continueRender(h));
};

export const qf = (f: number, fps = 10) => Math.floor(f * fps / 30);
export const ipx = (v: number) => Math.round(v);

// 逻辑画布：270x480，整体 scale(4)
export const Pix: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = PAL.bg }) => (
  <div style={{
    position: "absolute", left: 0, top: 0, width: PW, height: PH,
    transform: "scale(" + SCALE + ")", transformOrigin: "0 0",
    background: bg, overflow: "hidden",
  }}>
    {children}
  </div>
);

export const R: React.FC<{ x: number; y: number; w: number; h: number; c: string; border?: string }> =
  ({ x, y, w, h, c, border }) => (
    <div style={{
      position: "absolute", left: ipx(x), top: ipx(y), width: ipx(w), height: ipx(h),
      background: c, border: border ? ("1px solid " + border) : undefined, boxSizing: "border-box",
    }} />
  );

export const PT: React.FC<{
  x: number; y: number; s?: number; c?: string;
  anchor?: "start" | "middle" | "end";
  children?: React.ReactNode;
}> = ({ x, y, s = 8, c = PAL.ivory, anchor = "start", children }) => (
  <div style={{
    position: "absolute", left: ipx(x), top: ipx(y),
    transform: anchor === "middle" ? "translateX(-50%)" : anchor === "end" ? "translateX(-100%)" : undefined,
    fontSize: s, color: c, fontFamily: "FusionPixel, monospace",
    textAlign: anchor === "middle" ? "center" : anchor === "end" ? "right" : "left",
    lineHeight: 1.2, whiteSpace: "nowrap",
  }}>
    {children}
  </div>
);

export const hashN = (a: number, b: number) => {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
};

export const Scanlines: React.FC<{ op?: number }> = ({ op = 0.08 }) => (
  <div style={{
    position: "absolute", inset: 0, opacity: op, pointerEvents: "none",
    background: "repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 4px)",
  }} />
);

// Kenney 1-Bit Pack: colored.png 815x373, 17px pitch/16px tile
export const SHEET = "pix/1bit/Tilesheet/colored.png";
export const tile = (col: number, row: number) => ({ x: col * 17, y: row * 17, w: 16, h: 16 });

// 贴图：裁 sheet (sx,sy,sw,sh) → 显示到 (x,y) 宽 w
export const PixImg: React.FC<{
  x: number; y: number; w: number; sx: number; sy: number; sw: number; sh: number;
  src?: string; flip?: boolean;
}> = ({ x, y, w, sx, sy, sw, sh, src = SHEET, flip }) => {
  const k = w / sw;
  return (
    <div style={{
      position: "absolute", left: ipx(x), top: ipx(y),
      width: ipx(w), height: ipx(w * sh / sw),
      overflow: "hidden", transform: flip ? "scaleX(-1)" : undefined,
    }}>
      <img src={sf(src)} style={{
        position: "absolute", left: -sx * k, top: -sy * k,
        width: 815 * k, height: 373 * k, maxWidth: "none",
        imageRendering: "pixelated",
      }} />
    </div>
  );
};

// 兼容旧接口
export const buildK = (f: number, at: number, n: number, dur: number, fps = 10) =>
  Math.min(n, Math.max(0, Math.round((qf(f, fps) - qf(at, fps)) * n / Math.max(1, qf(at + dur, fps) - qf(at, fps)))));
export const Sprite: React.FC<{ x: number; y: number; rows: string[]; map: Record<string, string>; flip?: boolean }> = () => null;

// 像素气泡：黑边白底+尾巴，像素字
export const Bubble: React.FC<{
  x: number; y: number; w: number; c?: string; tail?: "l" | "r";
  children?: React.ReactNode;
}> = ({ x, y, w, c = PAL.ivory, tail = "l", children }) => (
  <div style={{ position: "absolute", left: ipx(x), top: ipx(y), width: ipx(w) }}>
    <div style={{
      background: c, border: "2px solid " + PAL.ink, padding: "4px 6px",
      fontSize: 7, fontFamily: "FusionPixel, monospace", color: PAL.ink, lineHeight: 1.4,
    }}>
      {children}
    </div>
    <div style={{
      position: "absolute", bottom: -8, [tail === "l" ? "left" : "right"]: 10,
      width: 0, height: 0,
      borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
      borderTop: "6px solid " + PAL.ink,
    }} />
  </div>
);
