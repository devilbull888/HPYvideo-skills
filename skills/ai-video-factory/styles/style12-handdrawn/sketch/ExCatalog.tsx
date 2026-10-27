import React from "react";
import { AbsoluteFill } from "remotion";
import { CJK_FONT_STACK } from "../brand/tokens";
import { EXLIB } from "./exlib-data";
import { ExItem, INK, PAPER12, Sketch } from "./Sketch";

// Temporary catalog page to eyeball converted Excalidraw items before retrofitting.
export const ExCatalog: React.FC = () => {
  const cells: { lib: string; name: string }[] = [];
  for (const lib of Object.keys(EXLIB)) for (const name of Object.keys(EXLIB[lib])) cells.push({ lib, name });
  const COLS = 6, CW = 180, CH = 210;
  return (
    <AbsoluteFill style={{ background: PAPER12 }}>
      <Sketch>
        {cells.map((c, i) => {
          const x = 20 + (i % COLS) * CW, y = 40 + Math.floor(i / COLS) * CH;
          return (
            <g key={`${c.lib}:${c.name}`}>
              <ExItem lib={c.lib} name={c.name} x={x + 15} y={y} h={130} stroke={INK} width={3} />
              <text x={x + 5} y={y + 165} fontSize={17} fill="#555" fontFamily={CJK_FONT_STACK}>{c.name}</text>
              <text x={x + 5} y={y + 185} fontSize={13} fill="#999" fontFamily={CJK_FONT_STACK}>{c.lib}</text>
            </g>
          );
        })}
      </Sketch>
    </AbsoluteFill>
  );
};
