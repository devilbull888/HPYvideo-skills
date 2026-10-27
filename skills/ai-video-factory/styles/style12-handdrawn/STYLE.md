# 12 号风格「手绘线条」复用库

来源：第五集 aibanlu（`D:\OPC\sandbox\aibanlu-20261026`，`aibanlu_v3`）沉淀。首次用 12 号风格的新集直接从这里复制，不要重新发明。

## 文件清单

| 文件 | 说明 | 许可 |
|---|---|---|
| `vendor/rough.esm.js` + `.d.ts` | Rough.js 4.6.6 单文件 ESM，`import rough from "../../vendor/rough.esm.js"` 直接用，不需要 npm 安装 | MIT（SHA256 见第五集 assets_manifest） |
| `tools/exlib_convert.mjs` | `.excalidrawlib` → `asset.js`（Remotion 可导入）+ `tags-index.json` + 预览图 | 自写 |
| `sketch/Sketch.tsx` | `handDrawn()`：seed 化 Rough 生成器画手绘几何；`handDrawnExcalidrawAsset()`：渲染转换后的 exlib 素材 | 参考实现 |
| `sketch/ExCatalog.tsx` | 素材目录渲染组件：把一批 exlib 素材平铺成审阅网格 | 参考实现 |
| `sketch/exlib-data.ts` | 示例：第五集选用的素材清单。**每集按选中的素材重新生成，不照抄** | — |
| `fonts/ZCOOLKuaiLe-Regular.ttf` | 站酷快乐体，手写中文，场景内标签/大字用 | SIL OFL |

## 用法

1. 新沙盒初始化时复制 `vendor/`、`tools/`、`sketch/`、`fonts/`。字体 `@font-face` 注册（`public/fonts/` 下，remotion 的 `staticFile`）。
2. **抖动线条**：每个元素的 path 用 seed 化 `rough.generator()` 生成，`useMemo` 按 `[base, seed, variant]` 记忆；wobble 不要重算 path，走 `pick([...标签], [帧段模式])` 在 3–4 个预生成变体间轮换。**禁止顶点随机抖动**（会像矢量图坏掉）。
3. **wobble 节奏按成片校准**（1.25× 之后）：第五集定稿 `pick(['bold','bold','bold','semibold'], [6,7,6,6])`，1× 约 12/s → 成片约 6/s。12/s 在成片里显紧张，先用 `[3,4,3,4]` 验证过仍偏快。**新 wobble 图案必须在动效测试卡里按成片速率看效果**。
4. **描边层级**（按语义权重，不是随手给）：bold 3px / roughness 1.8（主元素）、semibold 2.4/1.4、fine 1.6/0.9、文字线 1.2/0.6。混用不同作者的 exlib 素材时按这套层级统一 strokeWidth/roughness，否则画面割裂。
5. **exlib 素材流水线**：
   - 从 Excalidraw 社区库下载 `.excalidrawlib`（逐个核验许可，记进 manifest）；
   - `node tools/exlib_convert.mjs <lib文件> public/exlib/<名>` 生成 `asset.js` + `tags-index.json` + 预览；
   - 用 `ExCatalog.tsx` 渲染一整页目录给用户**按口播语义挑素材**（"这句话说的是什么 → 哪张画能表达"），语义不贴的就弃用、宁可自绘；
   - 选中的写进本集 `exlib-data.ts` 和 `assets_manifest.json`（许可 + 来源 + SHA256）。
   - **第三方素材本体不进 skill 仓库**，只有工具入。
6. **素材贴上纸面**（卡片/图片融进手绘纸纹）：`mixBlendMode:"lighten"` + `filter: contrast(1.08) saturate(1.05) sepia(0.12)`，再加随机小旋转/缩放（用 `affineTransform`，不要改原图）。
7. **场景内文字**用 ZCOOL KuaiLe（手写感）；**字幕仍然用 Noto Sans SC**——可读性优先。
8. **SVG 里禁止放 HTML 元素**：`<div>` 放进 `<svg>` 会整块消失（ep5 20 多处标签踩坑）。标签用 SVG `<text>`，或把标签放到 SVG 外层。
9. **IP 角标手绘版**：Rough 画红框 + ZCOOL 字体 + 波浪分隔线，`zIndex` 要在纸纹层（PaperTex zIndex 10）之上（ep5 用的是 15）。
10. **PresenterCard**：`style12` 用半透明白卡变体，不要默认深色卡——会压住纸纹。数字人和手绘场景的重叠**逐镜头判断**，挤就调构图，不一刀切禁止。
11. **动效测试卡（本风格强制）**：6 张关键帧之外，加渲一段 5–10 秒测试卡，内容含 wobble、2–3 个素材同框、数字人卡同屏——静帧看不出抖动是否舒服、描边是否打架。
