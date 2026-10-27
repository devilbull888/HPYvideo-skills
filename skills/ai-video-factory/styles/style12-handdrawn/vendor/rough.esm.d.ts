// Minimal typings for vendored Rough.js 4.6.6 (MIT) — only what Sketch.tsx uses.
export {};
declare global {}
declare module "../vendor/rough.esm.js" {
  type RoughOp = { op: string; data: number[] };
  type RoughSet = { type: string; ops: RoughOp[] };
  type RoughDrawable = { sets: RoughSet[]; options: Record<string, unknown> };
  interface Generator {
    line(x1: number, y1: number, x2: number, y2: number): RoughDrawable;
    linearPath(points: [number, number][]): RoughDrawable;
    curve(points: [number, number][]): RoughDrawable;
    polygon(points: [number, number][]): RoughDrawable;
    path(d: string): RoughDrawable;
  }
  const rough: {
    generator(options?: Record<string, unknown>): Generator;
    canvas(el: unknown, options?: Record<string, unknown>): unknown;
    svg(el: unknown, options?: Record<string, unknown>): unknown;
  };
  export default rough;
}
