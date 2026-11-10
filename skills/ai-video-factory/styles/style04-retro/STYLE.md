# 04 号风格「复古未来」复用库

来源：第七集 nvda（`D:\OPC\sandbox\nvda-20261109`，`ep7_final.mp4` 验收发布）沉淀。新集首次用 04 号风格时从这里起步。

> 调性：原定位怀旧类题材；硬新闻也可用，但要靠隐喻圆回（ep7 用"芯片霸权黄金时代"）。纯数据硬新闻优先考虑 07 科幻 HUD / 14 贴纸科普。

## 文件清单

| 文件 | 说明 |
|---|---|
| `Retro.tsx` | 复用组件：`RetroStage`（天空 + FOV 透视网格 + 地平线光带 + 扫描线）、`Chrome` 金属铬字、`RCard` 霓虹边卡片、`RTag` 胶囊标签、`RollNum` 数字滚动、`Photo` 照片容器、`pop`、`srcTag`。放进本集 `src/templates/` |
| `tokens_R.ts` | 色板 `R`，并入本集 `src/brand/tokens.ts`。以这里为准（ep7 沙盒 STYLE.md 里的色值是早期版本，已过时） |

## 色板与纪律

`sky0 #140726` / `sky1 #2A0E52` / `sky2 #4A1163` / `horizon #B01E6E` 做天空渐变；`magenta #FF2E88` = 警示 / 冲突 / 否定；`cyan #00E5FF` = 数据 / 确认 / 中性信息；`ink #F2E8FF` 主文字；`dim #9C86C4` 次要文字和来源行。

**只允许品红、青两个高饱和色**，其余都在紫灰域。IP 角标等品牌锚点用 `C`，不受 `R` 约束。

## 背景：FOV 透视网格（默认，已实装）

`RetroStage` 里 `FOV_GRID = true`：
- 借鉴 retroSynthwave（MIT）的 `s = FOV / (FOV + z)` 方程：每条横线有自己的深度 z，随帧减小，越近越快、越亮、越粗，形成"驶向镜头"的纵深感；纵线是从灭点放射的扇形射线。
- 参数：灭点 `VP = (540, 1180)`（约 61% 高度）、`FOVv = 2.6`、`SPAN = 58`、`SPEED = 0.55`、横线 26 条、射线 15 条；横线用青色，透明度 `0.1 + s×0.6`，线宽 `1 + s×3.5`；射线用品红 `30` 透明度。
- 用 SVG `<line>` 画（不含 HTML 元素，没有 SVG 里放 div 的问题）。
- 旧版 `rotateX(60deg)` 斜面平铺网格保留为 `FOV_GRID = false` 的备选，纵深感弱，只在性能吃紧时用。

扫描线：`repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 2px, transparent 2px 5px)`，约每 3 秒一次轻微跳帧。

## 镜头与组件要点

- **Chrome 铬字**：金属渐变 + `backgroundClip:text`，砸落进场 + 扫光；`whiteSpace: nowrap`。超宽时**缩短文案，不缩字号**。
- **逐镜 focus 放大平移**：见 SKILL 阶段 F"镜头放大由边界反推"。本风格的"前 70% 缓慢推近"就是"驶入"动效。
- **来源角标 `srcTag`** 放在变换层内，`top` 写 1140（变换后落在 1200–1350），不能写 1330。
- **口语和画面数字分开写**：口播"十几个百分点"，画面写"≈17%"。

## 实测成本（Intel 集显，WSL node）

8030 帧（1×，约 268 秒）整片渲染 25–50 分钟，单帧 1.2–2 秒；封面静帧约 20 秒。

## 待增强

- 字体：Audiowide / Orbitron（OFL）替换黑体做铬字，更贴风格。
- 构图参考：linear-vaporwave-three.js（MIT）的场景层次；ui-beats RetroGrid 的网格参数设计。
- 霓虹装饰：lottiefiles 搜 vaporwave 点缀（逐个核验许可）。
