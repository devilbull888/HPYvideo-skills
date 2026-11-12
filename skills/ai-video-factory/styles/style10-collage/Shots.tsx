import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BODY, BigQ, HAND, Halftone, HiPen, K, LinedPaper, Person, RipGap, Seal, Starburst, StickerIcon, Tag, TornCard } from "./Collage";
import { prog } from "../motion/primitives";

const S = (f: number, at: number, d = 12) => prog(f, at, d); // shorthand entrance progress

// ===== 01 钩子：红头文件大卡 + 荧光笔涂词 + 文字钩 + 首提星爆 =====
export const HookDoc: React.FC<{ from: number; hiAt: number; burstAt: number }> = ({ from, hiAt, burstAt }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Halftone x={830} y={1120} r={300} />
      <Tag x={80} y={240} text="国家给AI替岗" fs={108} fill={K.black} color={K.yellow} seed="hk1" tape at={from} />
      <Tag x={110} y={380} text="失业留了缓冲期" fs={108} fill={K.black} color="#FFF" seed="hk2" tape at={from + 5} />
      <TornCard x={150} y={620} w={720} h={560} fill="#FBF6EA" rot={-2} seed="doc" pin jitter at={from + 9}>
        <div style={{ padding: "34px 40px", fontFamily: BODY, color: K.ink }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: K.red, letterSpacing: 3 }}>国务院办公厅文件</div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 14, color: K.inkSoft }}>国办发〔2026〕29号</div>
          <div style={{ marginTop: 26, height: 4, background: K.red, width: "70%" }} />
          <div style={{ fontSize: 44, fontWeight: 700, marginTop: 34, lineHeight: 1.6, letterSpacing: 2 }}>
            鼓励企业探索建立<span style={{ position: "relative" }}>失业缓冲期
              <HiPen x={-6} y={2} w={250} h={52} at={hiAt} /></span>制度
          </div>
          <div style={{ fontSize: 30, marginTop: 20, color: K.inkSoft }}>提前告知 · 转型转岗支持</div>
        </div>
      </TornCard>
      <Starburst x={890} y={640} r={96} text="首提！" seed="sb" fill={K.red} fs={44} />
      {f >= burstAt && <Seal x={880} y={1130} text="国办" />}
    </>
  );
};

// ===== 02 中心问题：对撞两条 + 大问号 =====
export const CoreQ: React.FC<{ from: number; qAt: number }> = ({ from, qAt }) => {
  return (
    <>
      <TornCard x={190} y={300} w={660} h={430} fill="#FBF6EA" rot={-2} seed="doc2" pin>
        <div style={{ padding: "30px 36px", fontFamily: BODY, color: K.ink }}>
          <div style={{ fontSize: 38, fontWeight: 900, color: K.red }}>国务院办公厅文件</div>
          <div style={{ fontSize: 46, fontWeight: 700, marginTop: 40, letterSpacing: 2 }}>失业缓冲期</div>
          <HiPen x={36} y={120} w={240} h={54} at={from + 4} />
        </div>
      </TornCard>
      <Tag x={110} y={820} text="AI在招新岗位↗" fs={62} fill={K.blue} seed="q1" tape jitter at={from + 4} />
      <Tag x={140} y={950} text="为什么还要缓冲？" fs={62} fill={K.black} color={K.yellow} seed="q2" tape jitter at={from + 10} />
      <BigQ x={770} y={700} fs={330} seed="bq" enter={qAt} />
      <Halftone x={240} y={1150} r={240} />
    </>
  );
};

// ===== 03 公文条款（六）：逐字引用 + 双荧光笔 =====
export const Clause6: React.FC<{ from: number; hi1: number; hi2: number }> = ({ from, hi1, hi2 }) => (
  <>
    <TornCard x={110} y={330} w={860} h={860} fill="#FBF6EA" rot={-1} seed="c6" pin at={from + 2}>
      <div style={{ padding: "40px 48px", fontFamily: BODY, color: K.ink }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: K.red, letterSpacing: 2 }}>国办发〔2026〕29号 · 第六条</div>
        <div style={{ fontSize: 44, fontWeight: 700, marginTop: 40, lineHeight: 1.75 }}>
          鼓励企业探索建立失业缓冲期制度，在大规模推广应用人工智能过程中
          <span style={{ position: "relative" }}>提前告知受影响劳动者<HiPen x={-4} y={6} w={330} h={56} at={hi1} /></span>、
          提供<span style={{ position: "relative" }}>转型转岗就业支持<HiPen x={-4} y={6} w={330} h={56} at={hi2} /></span>。
        </div>
      </div>
    </TornCard>
    <Tag x={700} y={1230} text="2026-10-23 公布" fs={44} fill={K.kraft} color={K.ink} seed="d1" tape at={from + 12} />
  </>
);

// ===== 04 纠正：鼓励探索 ≠ 法定赔偿 =====
export const NotMust: React.FC<{ from: number; strikeAt: number }> = ({ from, strikeAt }) => {
  const f = useCurrentFrame();
  const st = S(f, strikeAt, 10);
  const tear = S(f, strikeAt + 14, 16);
  return (
    <>
      <Tag x={150} y={430} text="鼓励企业探索" fs={96} fill={K.black} color={K.yellow} seed="e1" tape at={from + 2} />
      <Tag x={190} y={640} text="提前告知 + 转岗支持" fs={54} fill={K.white} color={K.ink} seed="e2" at={from + 8} />
      <div style={{ position: "absolute", left: 170, top: 860, opacity: 1 - tear, transform: `translateY(${tear * 160}px) rotate(${tear * -18 - 3}deg)` }}>
        <Tag x={0} y={0} text="统一固定赔偿" fs={58} fill="#DAD3C4" color={K.inkSoft} seed="e3" jitter={false} />
        <div style={{ position: "absolute", left: -10, top: 48, width: 400 * st, height: 12, background: K.red, transform: "rotate(-2deg)" }} />
      </div>
      <Tag x={210} y={1070} text="不是法定赔偿" fs={64} fill={K.red} seed="e4" tape jitter at={from + 10} />
    </>
  );
};

// ===== 05 公文条款（七）：风险评估 + 印章 =====
export const Clause7: React.FC<{ from: number; hiAt: number; sealAt: number }> = ({ from, hiAt, sealAt }) => {
  const f = useCurrentFrame();
  const s = S(f, sealAt, 8);
  return (
    <>
      <TornCard x={110} y={330} w={860} h={860} fill="#FBF6EA" rot={1} seed="c7" pin at={from + 2}>
        <div style={{ padding: "40px 48px", fontFamily: BODY, color: K.ink }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: K.red, letterSpacing: 2 }}>国办发〔2026〕29号 · 第七条</div>
          <div style={{ fontSize: 44, fontWeight: 700, marginTop: 40, lineHeight: 1.75 }}>
            对市场准入领域可能造成较大就业冲击的人工智能应用场景项目，
            <span style={{ position: "relative" }}>在评审时同步开展就业风险评估<HiPen x={-4} y={6} w={470} h={56} at={hiAt} /></span>。
          </div>
        </div>
      </TornCard>
      <div style={{ opacity: s, transform: `scale(${1.6 - 0.6 * s})`, position: "absolute", left: 0, top: 0 }}>
        <Seal x={790} y={1120} text="就业风险\n评估" />
      </div>
      <Tag x={120} y={1230} text="比'鼓励'更硬的一条" fs={46} fill={K.black} color="#FFF" seed="s7" tape at={sealAt + 8} />
    </>
  );
};

// ===== 06 天平：效率 vs 就业影响 =====
export const ScaleShot: React.FC<{ from: number; balAt: number }> = ({ from, balAt }) => {
  const f = useCurrentFrame();
  const t = S(f, balAt, 20);
  const tilt = interpolate(t, [0, 1], [-14, 0]);
  return (
    <>
      <Halftone x={540} y={700} r={360} />
      <svg width={720} height={620} style={{ position: "absolute", left: 180, top: 420, filter: "drop-shadow(4px 6px 5px rgba(38,34,27,0.3))" }} viewBox="0 0 720 620">
        <rect x={330} y={120} width={60} height={420} fill={K.black} />
        <rect x={200} y={520} width={320} height={46} rx={10} fill={K.black} />
        <g transform={`rotate(${tilt} 360 140)`}>
          <rect x={60} y={128} width={600} height={22} rx={11} fill={K.black} />
          <line x1={140} y1={150} x2={100} y2={300} stroke={K.black} strokeWidth={8} />
          <line x1={140} y1={150} x2={180} y2={300} stroke={K.black} strokeWidth={8} />
          <ellipse cx={140} cy={310} rx={90} ry={26} fill={K.blue} stroke="white" strokeWidth={8} />
          <line x1={580} y1={150} x2={540} y2={300} stroke={K.black} strokeWidth={8} />
          <line x1={580} y1={150} x2={620} y2={300} stroke={K.black} strokeWidth={8} />
          <ellipse cx={580} cy={310} rx={90} ry={26} fill={K.red} stroke="white" strokeWidth={8} />
        </g>
      </svg>
      <Tag x={120} y={860} text="效率提高" fs={56} fill={K.blue} seed="sc1" at={from + 4} />
      <Tag x={600} y={860} text="就业影响" fs={56} fill={K.red} seed="sc2" at={from + 8} />
      <Tag x={230} y={1090} text="评审多算一本账" fs={54} fill={K.black} color={K.yellow} seed="sc3" tape at={balAt + 10} />
    </>
  );
};

// ===== 07 rehook：大问号 + 招聘贴纸（数据板块开场） =====
export const RehookJobs: React.FC<{ from: number; qAt: number }> = ({ from, qAt }) => (
  <>
    <Halftone x={820} y={620} r={300} color="#7A8494" />
    <BigQ x={680} y={380} fs={380} seed="rq" enter={qAt} fill={K.blue} />
    <Tag x={120} y={520} text="AI不是正在" fs={84} fill={K.black} color="#FFF" seed="r1" tape at={from + 2} />
    <Tag x={150} y={680} text="大量招人吗" fs={84} fill={K.black} color={K.yellow} seed="r2" tape at={from + 8} />
    <Tag x={190} y={1020} text="招聘启事" fs={52} fill={K.white} color={K.ink} seed="r3" rot={-4} tape at={from + 14} />
    <StickerIcon x={600} y={960} s={150} src="assets/icons/briefcase_search.svg" rot={5} seed="r3i" at={from + 20} />
    <Tag x={560} y={1180} text="急招 · AI" fs={52} fill={K.white} color={K.blue} seed="r4" rot={3} tape at={from + 18} nudgeAt={from + 90} nudgeD={[10, -6, 2.5]} />
  </>
);

// ===== 08 数据：455% 四连撕纸数字 =====
export const Num455: React.FC<{ from: number; rollAt: number; rollEnd: number }> = ({ from, rollAt, rollEnd }) => {
  const f = useCurrentFrame();
  const t = S(f, rollAt, Math.max(16, rollEnd - rollAt));
  const v = Math.round(interpolate(t, [0, 1], [273, 455]));
  const digs = [...String(v).padStart(3, " "), "%"];
  const fills = [K.white, K.black, K.yellow, K.white];
  const cols = [K.ink, K.yellow, K.ink, K.ink];
  return (
    <>
      <Halftone x={540} y={620} r={380} color="#7A8494" />
      <Tag x={150} y={330} text="AI智能体职位数" fs={58} fill={K.black} color="#FFF" seed="n0" tape at={from + 2} />
      {digs.map((d, i) => (
        <TornCard key={i} x={108 + i * 218} y={560 + (i % 2) * 26} w={186} h={250} fill={fills[i]} rot={(i % 2 ? 2.5 : -2.5)} seed={`nd${i}`} bw={9} at={from + 6 + i * 4}>
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: d === "%" ? 110 : 150, fontWeight: 900, color: cols[i], fontFamily: BODY }}>
            {d === " " ? "" : d}
          </div>
        </TornCard>
      ))}
      <svg width={360} height={160} style={{ position: "absolute", left: 620, top: 430 }} viewBox="0 0 360 160">
        <polyline points="10,140 110,110 200,80 340,10" fill="none" stroke={K.red} strokeWidth={16} strokeLinecap="round"
          strokeDasharray={420} strokeDashoffset={420 * (1 - S(f, rollAt + 4, 14))} />
        <polygon points="340,10 296,18 336,52" fill={K.red} opacity={S(f, rollAt + 16, 6)} />
      </svg>
      <Tag x={170} y={940} text="同比 ↑455%" fs={64} fill={K.red} color="#FFF" seed="n5" tape at={rollAt + 12} />
      <Tag x={140} y={1120} text="智联招聘 · 2026节后前三周" fs={36} fill={K.white} color={K.inkSoft} seed="n6" at={rollAt + 18} />
    </>
  );
};

// ===== 09 沟壑：新岗位 vs 受影响的人（纸被撕开一道缝） =====
export const GapShot: React.FC<{ from: number; tearAt: number }> = ({ from, tearAt }) => {
  return (
    <>
      <Tag x={110} y={330} text="新岗位" fs={80} fill={K.blue} seed="g1" at={from + 2} />
      <Tag x={610} y={330} text="受影响的人" fs={58} fill={K.black} color={K.yellow} seed="g4" at={from + 8} />
      <Tag x={130} y={510} text="智能体开发" fs={44} fill={K.white} color={K.ink} seed="g2" at={from + 6} />
      <Tag x={160} y={600} text="AI产品经理" fs={44} fill={K.white} color={K.ink} seed="g3" at={from + 10} />
      <StickerIcon x={720} y={500} s={150} src="assets/icons/headset.svg" rot={3} seed="gp1" at={from + 14} pin />
      <RipGap at={tearAt} y={830} h={230} />
      <Tag x={300} y={1130} text="中间隔着一道沟" fs={56} fill={K.black} color={K.yellow} seed="g5" at={tearAt + 10} />
    </>
  );
};

// ===== 10 断桥：文员客服 → AI工程师（两段纸桥从中间断开） =====
export const BrokenBridge: React.FC<{ from: number; breakAt: number }> = ({ from, breakAt }) => {
  const f = useCurrentFrame();
  const t = S(f, breakAt, 16);
  return (
    <>
      <StickerIcon x={110} y={420} s={170} src="assets/icons/account_tie.svg" rot={-3} seed="bp1" at={from + 2} pin />
      <Tag x={90} y={700} text="文员 · 客服" fs={46} fill={K.white} color={K.ink} seed="b1" at={from + 4} />
      <StickerIcon x={730} y={420} s={170} src="assets/icons/laptop_person.svg" rot={3} seed="bp2" at={from + 6} pin />
      <Tag x={700} y={700} text="AI工程师" fs={46} fill={K.blue} seed="b2" at={from + 8} />
      <svg width={760} height={260} style={{ position: "absolute", left: 160, top: 840 }} viewBox="0 0 760 260">
        {/* 左段桥：完好挂在崖上 */}
        <polygon points="0,40 330,40 310,110 20,116" fill={K.kraft} stroke="white" strokeWidth={10} />
        <polygon points="0,40 60,40 60,116 20,116" fill="#B79F74" opacity={0.7} />
        {/* 右段桥：断裂下垂（随 t 加大下垂角） */}
        <g transform={`rotate(${t * 26} 430 60)`}>
          <polygon points="430,40 760,40 745,110 450,105" fill={K.kraft} stroke="white" strokeWidth={10} />
        </g>
        {/* 断裂口：撕开的纸茬 */}
        <polygon points={`310,42 ${360 + t * 10},${80 + t * 30} 330,110`} fill={K.kraft} stroke="white" strokeWidth={8} opacity={Math.min(1, t * 2)} />
      </svg>
      <Tag x={240} y={1180} text="不会第二天就变过去" fs={54} fill={K.black} color="#FFF" seed="b3" at={breakAt + 8} />
    </>
  );
};

// ===== 11 数据：约45% 替代指数 =====
export const Num45: React.FC<{ from: number; rollAt: number }> = ({ from, rollAt }) => {
  const f = useCurrentFrame();
  const t = S(f, rollAt, 16);
  const v = Math.round(interpolate(t, [0, 1], [27, 45]));
  return (
    <>
      <Halftone x={760} y={560} r={300} color="#7A8494" />
      <TornCard x={140} y={380} w={560} h={330} fill={K.black} rot={-2} seed="n45" bw={10} at={from + 2}>
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "baseline", justifyContent: "center", paddingTop: 40 }}>
          <span style={{ fontSize: 200, fontWeight: 900, color: K.yellow, fontFamily: BODY }}>{v}</span>
          <span style={{ fontSize: 110, fontWeight: 900, color: "#FFF" }}>%</span>
        </div>
      </TornCard>
      <Tag x={160} y={760} text="白领岗 技能替代指数较高" fs={52} fill={K.white} color={K.ink} seed="n45b" tape at={from + 8} />
      <Tag x={220} y={920} text="样本中 · 约四成半" fs={44} fill={K.kraft} color={K.ink} seed="n45c" />
      <Tag x={140} y={1090} text="北大国发院 × 智联招聘" fs={36} fill={K.white} color={K.inkSoft} seed="n45d" />
      <Tag x={740} y={850} text="工位" fs={44} fill={K.white} color={K.ink} seed="n45e" rot={5} />
      <Tag x={800} y={990} text="电脑" fs={44} fill={K.white} color={K.ink} seed="n45f" rot={-6} />
    </>
  );
};

// ===== 12 纠正：45%失业 ✗ → 替代可能性 =====
export const Fix45: React.FC<{ from: number; strikeAt: number }> = ({ from, strikeAt }) => {
  const f = useCurrentFrame();
  const st = S(f, strikeAt, 10);
  const rep = S(f, strikeAt + 10, 12);
  return (
    <>
      <div style={{ position: "absolute", left: 190, top: 520, opacity: 1 - rep * 0.85, transform: `translateY(${-rep * 60}px) scale(${1 - rep * 0.25})` }}>
        <Tag x={0} y={0} text="45%的人要失业" fs={70} fill="#DAD3C4" color={K.inkSoft} seed="f1" jitter={false} />
        <div style={{ position: "absolute", left: -14, top: 62, width: 560 * st, height: 14, background: K.red, transform: "rotate(-1.5deg)" }} />
      </div>
      <Tag x={150} y={760} text="技能被替代的可能性" fs={72} fill={K.black} color={K.yellow} seed="f2" tape jitter />
      <Tag x={210} y={960} text="不是已经失业的人数" fs={50} fill={K.white} color={K.ink} seed="f3" />
    </>
  );
};

// ===== 13 初级岗位下滑：纸柱子从高到矮 + 红箭头 =====
export const JuniorDown: React.FC<{ from: number; dropAt: number }> = ({ from, dropAt }) => {
  const f = useCurrentFrame();
  const t = S(f, dropAt, 18);
  const bars = [380, 300, 230, 150];
  return (
    <>
      <Tag x={120} y={360} text="初级岗位" fs={82} fill={K.black} color="#FFF" seed="j1" at={from + 2} />
      <svg width={620} height={560} style={{ position: "absolute", left: 230, top: 520 }} viewBox="0 0 620 560">
        {bars.map((h, i) => (
          <polygon key={i} points={`${i * 150 + 10},${560 - h} ${i * 150 + 120},${560 - h} ${i * 150 + 120},560 ${i * 150 + 10},560`} fill={i === 3 ? K.red : K.kraft} stroke="white" strokeWidth={8} />
        ))}
        <line x1={10} y1={560} x2={600} y2={560} stroke={K.ink} strokeWidth={6} />
        {/* 下滑箭头：随 dropAt 画出 */}
        <polyline points="60,140 220,230 380,330 540,470" fill="none" stroke={K.red} strokeWidth={16} strokeLinecap="round" strokeDasharray={700} strokeDashoffset={700 - t * 700} />
        <polygon points="540,470 488,456 524,418" fill={K.red} opacity={t} />
      </svg>
      <Tag x={560} y={1120} text="占比在下降" fs={62} fill={K.blue} seed="j2" at={dropAt + 10} />
      <Tag x={120} y={1240} text="智联跟踪 / 脉脉：1年内经验岗占比约1.23%" fs={32} fill={K.white} color={K.inkSoft} seed="j3" />
    </>
  );
};

// ===== 14 rehook：你板块开场 =====
export const RehookYou: React.FC<{ from: number; qAt: number }> = ({ from, qAt }) => (
  <>
    <Halftone x={300} y={620} r={300} color="#A8956A" />
    <StickerIcon x={400} y={360} s={200} src="assets/icons/account_grad.svg" rot={-3} seed="yp" at={from + 4} pin />
    <Tag x={140} y={700} text="这对年轻人" fs={84} fill={K.black} color="#FFF" seed="y1" tape at={from + 2} />
    <Tag x={190} y={860} text="意味着什么" fs={84} fill={K.black} color={K.yellow} seed="y2" tape at={from + 8} />
    <BigQ x={780} y={620} fs={330} seed="yq" enter={qAt} />
  </>
);

// ===== 15 阶梯第一级被撕掉：小人够不着第二级 =====
export const StairGap: React.FC<{ from: number; tearAt: number }> = ({ from, tearAt }) => {
  const f = useCurrentFrame();
  const t = S(f, tearAt, 16);
  const hop = Math.max(0, Math.sin((f - tearAt - 8) * 0.55)) * S(f, tearAt + 8, 10) * 26;
  return (
    <>
      <svg width={720} height={560} style={{ position: "absolute", left: 200, top: 480 }} viewBox="0 0 720 560">
        {/* 第二、三级台阶：完好 */}
        {[1, 2, 3].map((i) => (
          <polygon key={i} points={`${i * 170 + 40},${500 - i * 140} ${i * 170 + 200},${500 - i * 140} ${i * 170 + 200},560 ${i * 170 + 40},560`} fill={K.kraft} stroke="white" strokeWidth={8} />
        ))}
        {/* 第一级：撕掉后只留虚线残影 */}
        <polygon points="40,500 200,500 200,560 40,560" fill="none" stroke={K.ink} strokeWidth={5} strokeDasharray="14 12" opacity={0.5} />
        {/* 撕掉的碎片正在掉落 */}
        <g transform={`translate(${40 + t * 60},${500 + t * 240}) rotate(${-t * 50})`} opacity={1 - t * 0.85}>
          <polygon points="0,0 160,0 160,60 0,60" fill={K.kraft} stroke="white" strokeWidth={8} />
          <text x="80" y="44" textAnchor="middle" fontSize={40} fontWeight={800} fill={K.ink}>第一级</text>
        </g>
      </svg>
      {/* 小人在缺口下向上够：身体+上举手臂+弹跳 */}
      <div style={{ position: "absolute", left: 250, top: 1150 - hop }}>
        <svg width={180} height={240} viewBox="0 0 180 240">
          <line x1="40" y1="120" x2="40" y2="200" stroke={K.red} strokeWidth={22} strokeLinecap="round" />
          <circle cx="40" cy="90" r={34} fill={K.red} />
          <line x1="40" y1="140" x2="130" y2="40" stroke={K.red} strokeWidth={18} strokeLinecap="round" />
          <line x1="40" y1="140" x2="10" y2="80" stroke={K.red} strokeWidth={18} strokeLinecap="round" />
          <line x1="40" y1="200" x2="15" y2="240" stroke={K.red} strokeWidth={16} strokeLinecap="round" />
          <line x1="40" y1="200" x2="70" y2="240" stroke={K.red} strokeWidth={16} strokeLinecap="round" />
        </svg>
      </div>
      <Tag x={430} y={560} text="入行第一步" fs={48} fill={K.white} color={K.ink} seed="st0" at={from + 4} />
      <Tag x={430} y={1240} text="够不着第二级" fs={56} fill={K.black} color={K.yellow} seed="st2" at={tearAt + 8} />
    </>
  );
};

// ===== 16 金句：岗位数 vs 能转过去的人 =====
export const Reachable: React.FC<{ from: number; balAt: number }> = ({ from, balAt }) => {
  const f = useCurrentFrame();
  const t = S(f, balAt, 20);
  return (
    <>
      {[0, 1, 2].map((i) => (
        <TornCard key={i} x={130 + i * 12} y={560 - i * 14} w={300} h={120} fill={K.white} rot={-2 + i} seed={`rk${i}`} bw={6} />
      ))}
      <Tag x={140} y={720} text="岗位数" fs={62} fill={K.blue} seed="rk9" at={from + 4} />
      {[0, 1].map((i) => (
        <TornCard key={i} x={620 + i * 10} y={760 - i * 12} w={300} h={110} fill={K.white} rot={1 - i} seed={`rl${i}`} bw={6} />
      ))}
      <Person x={700} y={620} s={0.8} c={K.red} seed="rlp" />
      <Tag x={600} y={920} text="能转过去的人" fs={58} fill={K.red} seed="rl9" at={from + 10} />
      <svg width={600} height={80} style={{ position: "absolute", left: 240, top: 1090 }} viewBox="0 0 600 80">
        <rect x={20} y={28} width={560} height={20} rx={10} fill={K.black} transform={`rotate(${interpolate(t, [0, 1], [-8, 0])} 300 38)`} />
        <rect x={280} y={38} width={40} height={42} fill={K.black} />
      </svg>
      <Tag x={250} y={1200} text="能不能转过去才算数" fs={52} fill={K.black} color={K.yellow} seed="rlb" tape at={balAt + 8} />
    </>
  );
};

// ===== 17 数字人金句段：机器换系统 vs 人换谋生 =====
export const Essence: React.FC<{ from: number; gearAt: number; pathAt: number }> = ({ from, gearAt, pathAt }) => (
  <>
    <Tag x={120} y={300} text="机器换一套系统" fs={54} fill={K.white} color={K.ink} seed="es1" rot={-2} at={from + 2} />
    <StickerIcon x={110} y={430} s={140} src="assets/icons/robot_industrial.svg" rot={-3} seed="esg" at={gearAt} />
    <Tag x={650} y={310} text="vs" fs={60} fill={K.red} seed="esv" rot={-8} />
    <Tag x={640} y={430} text="人换一种谋生" fs={54} fill={K.white} color={K.ink} seed="es2" rot={2} at={from + 8} />
    <Tag x={180} y={1230} text="不是一回事" fs={78} fill={K.black} color={K.yellow} seed="es3" tape at={pathAt + 4} />
  </>
);

// ===== 18 双责任：企业留空间 / 自己提前备 =====
export const TwoDuties: React.FC<{ from: number; youAt: number }> = ({ from, youAt }) => (
  <>
    <Tag x={110} y={430} text="企业要留转型空间" fs={62} fill={K.black} color="#FFF" seed="d1" tape at={from + 2} />
    <Tag x={180} y={620} text="提前告知 · 转岗支持" fs={44} fill={K.white} color={K.ink} seed="d2" />
    <Tag x={150} y={870} text="自己要提前准备" fs={62} fill={K.red} seed="d3" tape at={youAt + 2} />
    <Tag x={220} y={1060} text="别把准备留到调整那天" fs={44} fill={K.white} color={K.ink} seed="d4" />
  </>
);

// ===== 19 横线纸清单 + 撕角提醒 =====
export const LinedList: React.FC<{ from: number; warnAt: number }> = ({ from, warnAt }) => {
  const f = useCurrentFrame();
  const t = S(f, warnAt, 12);
  return (
    <>
      <LinedPaper x={140} y={360} w={760} h={640} rot={-1} seed="ll">
        <div style={{ padding: "50px 60px 0 90px", fontFamily: HAND, color: K.ink }}>
          <div style={{ fontSize: 52, fontWeight: 700 }}>现在就能查：</div>
          {["你所在的行业", "正在需要哪些", "新能力？"].map((s, i) => (
            <div key={i} style={{ fontSize: 50, marginTop: 40, display: "flex", gap: 18 }}>
              <span style={{ color: K.red }}>☐</span>{s}
            </div>
          ))}
        </div>
      </LinedPaper>
      <div style={{ position: "absolute", left: 240, top: 1060, transform: `rotate(${-3 - t * 8}deg)`, opacity: 1 - t * 0.8 }}>
        <Tag x={0} y={0} text="会用AI=铁饭碗" fs={54} fill="#DAD3C4" color={K.inkSoft} seed="w1" jitter={false} />
      </div>
    </>
  );
};

// ===== 20 纸桥接上：走到机会面前 =====
export const BridgeRebuilt: React.FC<{ from: number; joinAt: number }> = ({ from, joinAt }) => {
  const f = useCurrentFrame();
  const t = S(f, joinAt, 16);
  const px = interpolate(t, [0, 1], [300, 640]);
  return (
    <>
      <Person x={px} y={760} s={1.0} c={K.red} seed="brp" />
      <Tag x={700} y={560} text="新岗位" fs={56} fill={K.blue} seed="br1" tape />
      <svg width={560} height={120} style={{ position: "absolute", left: 260, top: 900 }} viewBox="0 0 560 120">
        <polygon points="0,50 270,50 255,90 20,95" fill={K.kraft} stroke="white" strokeWidth={8} />
        <polygon points={`${290 + (1 - t) * 60},50 560,50 545,95 ${305 + (1 - t) * 60},90`} fill={K.kraft} stroke="white" strokeWidth={8} />
      </svg>
      <Tag x={240} y={1080} text="走到机会面前" fs={64} fill={K.black} color={K.yellow} seed="br2" tape at={joinAt + 6} />
    </>
  );
};

// ===== 21 CTA：三选项牌 + 评论框 =====
export const CtaChoices: React.FC<{ from: number; o1: number; o2: number; o3: number; sloganAt: number }> = ({ from, o1, o2, o3, sloganAt }) => {
  const f = useCurrentFrame();
  const opt = (at: number, x: number, text: string, seed: string, fill: string, col: string) => {
    const t = S(f, at, 10);
    return (
      <div style={{ position: "absolute", left: x, top: 0, opacity: t, transform: `translateY(${(1 - t) * 60}px) rotate(${(1 - t) * -10}deg)` }}>
        <Tag x={0} y={0} text={text} fs={46} fill={fill} color={col} seed={seed} pin jitter />
      </div>
    );
  };
  const s = S(f, sloganAt, 14);
  return (
    <>
      <div style={{ position: "absolute", left: 90, top: 1130, width: 900, height: 120 }}>
        {opt(o1, 0, "提前通知", "o1", K.white, K.ink)}
        {opt(o2, 330, "内部转岗", "o2", K.yellow, K.ink)}
        {opt(o3, 660, "培训补贴", "o3", K.black, "#FFF")}
      </div>
      <Tag x={90} y={1710} text="评论区聊聊" fs={46} fill={K.white} color={K.ink} seed="cc" />
      <div style={{ position: "absolute", left: 330, top: 1830, fontFamily: HAND, fontSize: 48, fontWeight: 700, color: K.ink, opacity: s, transform: `translateX(${(1 - s) * 40}px)` }}>
        一起把 <span style={{ color: K.blue }}>Token</span> 变成 <span style={{ color: K.red }}>Money</span>
      </div>
    </>
  );
};
