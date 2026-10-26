---
name: ai-video-factory
description: AI不焦虑君 竖屏知识短视频生产流程（脚本核验→镜头语义设计表→ElevenLabs配音→TimingMap→真实素材采集（LOGO/人物/原始文件）→可选MuseTalk数字人→Remotion动画+素材动效+音效→封面→1.25倍速成片→机器QA+静音读图自检→人工门禁），含15种视觉风格的实现方式。做新一条口播视频或试新风格时使用。
argument-hint: "<脚本或选题> [风格编号1-15]"
triggers:
  - user
  - model
allowed-tools:
  - read
  - grep
  - glob
---

# AI 视频工厂：竖屏知识口播片制作流程（v2，2026-10-24；v1 由 Muse/Amazon 一集沉淀，v2 吸收第二集「不烧心」的复盘）

你在帮用户（IP「AI不焦虑君」，口号「伴你成长对抗AI焦虑，一起把 Token 变成 Money！」）做抖音/小红书/快手/视频号的 9:16 知识短视频。

**开始前必须先读完本目录下另外三个文件：**
- `C:\Users\黄品颖\AppData\Roaming\devin\skills\ai-video-factory\shots_assets.md`：**镜头语义设计 + 真实素材层**（逻辑关系→镜头形式对照表、素材来源与版权分级、素材类镜头组件）。每集必读
- `C:\Users\黄品颖\AppData\Roaming\devin\skills\ai-video-factory\styles.md`：00 + 15 种整片风格（编号同用户文档）、多变风格规则、IP 锚点套件，每集必读
- `C:\Users\黄品颖\AppData\Roaming\devin\skills\ai-video-factory\lessons.md`：历集踩过的坑和对应修法，开工前必读
- `tools/audit_timing.mjs`（本目录下）：时序审计脚本，初始化时复制进新沙盒，阶段 G 20.1 强制运行

**v2 的核心改变：** 画面不再是"把旁白关键词套进模板"，而是先回答"这句话要让观众看懂什么"，再决定画面。纯文字+几何的镜头最多占全片一半，其余镜头必须有和文案强相关的真实素材（LOGO、人物照片、原始文件/截图）或明确的视觉比喻。

## 0. 铁律（违反任何一条都要先停下问用户）

1. **每一步都有人工门禁。** 机器 QA 通过不等于用户验收通过，绝不自称"最终完成"。
2. **以下操作必须先列出完整命令、输入/输出路径、预计耗时和覆盖风险，拿到用户"授权"后才能执行：**
   - 整片渲染
   - MuseTalk 推理
   - 任何后台长任务
   - 联网安装依赖
   - 付费调用
   （素材下载不需要单独授权，但下载结果必须经过阶段 C2 的素材清单确认才能用进成片。）
3. **不覆盖已有成果。** 每个新版本都用新文件名（`_v1`、`_v2`、`_v2b`、`_fix`）。旧版本、旧模块一律保留。
4. **配音锁定后才能做口型、字幕和动画时间轴。** 配音一换，下游全部作废。
5. **"只做修改不重新生成"的意思是：** 不重做 TTS，不重跑数字人推理；后处理和重新合成可以做。
6. **事实核验。**
   - 每个数据点要有来源和日期，画面上要有来源角标。
   - 未核实的说法标为"待核验"，不写进脚本。
   - 分析性判断要标明是"分析"。
7. **新工作一律放进新沙盒** `D:\OPC\sandbox\<episode-id>-<yyyymmdd>\`。不改 `D:\OPC\video-producer-v0`，也不改旧沙盒。
8. **任何一步失败就停下来报告原因**，不自动重试，不自行改环境。返工最多 3 轮，超过交给用户决定。
9. **优先使用开源/免费工具，但只在能明确解决卡点时才用。**
   - 用之前记录来源、许可证和文件哈希。
   - 系统 emoji、表情包、新闻剪报、他人照片都要先核验版权才能用。
10. 不要创建说明文档来描述你的改动。项目信息写进沙盒里的 `AGENTS.md`。

## 1. 环境事实（已核实）

| 项 | 值 |
|---|---|
| 机器 | Windows + WSL2 Ubuntu-24.04，Intel 集显，无 CUDA |
| Shell | 在 WSL 里执行。Windows 路径 `D:\X` 对应 `/mnt/d/X`。Node 需先执行 `source ~/.nvm/nvm.sh` |
| Remotion 4.0.529 / React 19.2.3 / TS 5.9.3 | 复用 `/mnt/d/OPC/video-producer-v0/node_modules`（新沙盒里建软链接，不联网安装） |
| ffmpeg / ffprobe | WSL 内已安装 |
| MuseTalk 1.5 CPU | Python：`/mnt/d/GPT视频项目/_v1_presenter_runtime/musetalk-cpu/.venv/bin/python` |
| 字体 | Noto Sans SC（`CJK_FONT_STACK`） |
| 参考实现（照抄起点） | `D:\OPC\sandbox\stylepack-trial-muse-20261018\`（Muse 一集，v2b 机器 QA 全过） |
| 音效素材 | `assets/sfx/kenney_interface/`（Kenney Interface Sounds，CC0）+ `tools/make_sfx.py` 程序合成的 whoosh/thud；产物在 `public/sfx/*.wav` |
| 声音档案（已锁定） | ElevenLabs，音色 Yu，模型 v4，参数 `pvc_sp120_s40_sb40`，用户在网页端自己生成并下载 |
| 数字人母版 | `h3_source.mp4`（192 帧，24fps）+ 已有的几何/latent 缓存。只能用这个人物，换人需要重建缓存（另行授权） |
| 实测成本 | 数字人每帧 8.4–8.8 秒（CPU），每段另加 26–82 秒模型加载；整片 2063 帧 Remotion 渲染约 98–128 秒，峰值内存约 0.9 GB |

**工具环境注意：**
- 工具会预先展开命令里的 `$VAR`，所以命令里要写完整路径，不要用 shell 变量。
- WSL 里的后台进程会随会话断开被杀掉。长任务要从 Windows 侧用 `powershell Start-Process wsl.exe ...` 启动，参数不能带空格，做法见 `tools/launch_presenters.sh`。

## 2. 新沙盒初始化

```bash
NEW=/mnt/d/OPC/sandbox/<episode-id>-<yyyymmdd>
REF=/mnt/d/OPC/sandbox/peixun-20261024
SKILL=/mnt/c/Users/黄品颖/AppData/Roaming/devin/skills/ai-video-factory
mkdir -p $NEW/{inputs,data,out,public,work}
cp -r $REF/src $REF/tools $REF/style_packs $REF/package.json $REF/tsconfig.json $REF/remotion.config.ts $NEW/
cp -r $REF/public/sfx $REF/public/textures $NEW/public/
cp $REF/public/cover_person.jpg $NEW/public/
cp $SKILL/tools/audit_timing.mjs $NEW/tools/
ln -s /mnt/d/OPC/video-producer-v0/node_modules $NEW/node_modules
```

- 参考实现取第四集 `peixun-20261024`（v10 FINAL_READY）：已含 6f 交叉淡化的 `Shot`、双段联播 `PresenterCard`、`SUF` 通用后缀、Windows 内存守卫修复（读不到即不安全，`tools/winmem_writer.ps1` 兜底）、9 号剪报风格包。参考沙盒只读。
- **不要复制** `out/`、`work/`、`inputs/`、`data/` 和 `public/presenter_*`、`public/voice_*`。这些都属于上一集。
- 复制完要做三件事：
  1. 工具脚本用环境变量 `SUF=<集后缀>` 指定 `script_<SUF>`/`voice_<SUF>`/`timing_<SUF>`，不要再手改文件名；`src/timing.ts` 的 import 改成新的 `timing_<SUF>.json`。
  2. 把 `Root.tsx` 里的合成 id 改成新一集的。
  3. 把 `Episode.tsx` 里的镜头整体替换掉。上一集的镜头组件可以复用，但文案、锚点和音效 cue 都要重写；数字人窗口（`PRESENTERS`）只在一处定义，`PresenterCard` 和 `run_presenters.sh` 都从它推导，不写死秒数。
- 最后执行 `npx tsc --noEmit`，类型检查必须通过。
- **依赖策略：** `node_modules` 是所有沙盒共享的软链接，**禁止 npm 安装任何包**（会影响全部沙盒）。中文断行用数据里按短语手动 `\n` 预分 + `whiteSpace:"nowrap"`（第二集实测够用）；`budoux`/`@remotion/layout-utils` 不用。确需新依赖时停下请用户决定。

## 2.5 风格选择（先展示全部 15 种，再弹窗收敛）

用户没有明确指定风格时，**在阶段 A 脚本确认之后、阶段 D 样片之前**执行本节。用户已经点名某个风格的，跳过，但要复述一遍你理解的是哪种风格、效果是什么。

风格是**整片风格**，规则见 `styles.md` 第 0 节（多变风格四条规则、IP 锚点套件）。

**第一步：查轮换。** 读 `D:\OPC\ledger\opc.db` 最近 3 集的 `episodes.style_id`，这 3 种本集不推荐（用户点名除外）。

**第二步：输出完整风格表。** 列出 00–15 全部 16 种（编号、名称、一句话画风、适合什么选题、档位、渲染成本、是否最近 3 集用过），标出你按"选题适配度 + 新鲜度"推荐的 1–3 种及理由。

**第三步：`ask_user_question` 收敛**：header "本集风格"，放最多 4 个推荐候选（label 末尾加"（推荐）"），其他风格由用户选 Other 填编号。

**选完以后：**
1. 复述：本集风格编号与名称，以及该风格的五件事（材质/线条、配色、镜头、运动、文字）和"别做成"清单。
2. 说明这一风格在 9:16 口播里的适配做法（`styles.md` 对应条目的"口播适配"），以及需要特别处理的冲突（例如 09 的慢动作与 1.25 倍速）。
3. 进入阶段 D 的 6 张关键帧门禁。

**如果 `ask_user_question` 工具不可用：** 只输出第一步的编号表，请用户回复编号即可。

## 3. 流水线（按顺序做，每个 ★ 处停下等用户）

### 阶段 A：选题和脚本
1. 先核验用户给的脚本或选题。每个数据点都给出：来源、日期、原文要点、是否需要改写。
   - 不要断言官方理由是假的。
   - 不要夸大，例如把"挡在门外"说成"全面封禁"。
2. 改成口播稿：
   - 时长 60–70 秒（1 倍速），约 4.5–5 字/秒，最终 1.25 倍速后是 48–56 秒。
   - 前 3 秒是钩子，不要用"哈喽大家好"开场。
   - 结尾固定："……评论区聊聊。我是AI不焦虑君，一起把Token变成Money。"
   - 数字写成汉字（"六百八十亿美元""百分之十六"），否则 TTS 会读错。
   - 引号用逗号停顿代替。
3. 拆成句子表 `inputs/script_<X>.json`，格式是 `ScriptVariant.v0`，见参考实现的 `inputs/script_A.json`。每句包含：
   - `sid`
   - `text`：必须和配音逐字一致
   - `presenter`：是否数字人出镜，可选
   - `claim`：来源，可选
   - 数字人只用在 2–3 处：开场钩子、中段判断句、结尾 CTA。每段 4–7 秒，合计约 16 秒是**推理成本的软约束**：为了"句子念完"或"同段连续在场"可以超出，在汇报里写明即可；不能为了卡预算剪掉句尾。
   - 相邻两段间隔 <8 秒、语义上属于同一段（例如结尾的"判断→提问→slogan"）时，合并成一张卡连续在场，不要退场再进场。
4. ★ 交给用户确认脚本和事实口径。
4.1 脚本确认后，如果用户还没指定风格，立即按第 2.5 节弹窗让用户选风格和动画手法。

### 阶段 A2：镜头语义设计表（每集必做，写任何镜头代码之前，用户审过才能往下走）
4.2 按 `shots_assets.md` 第 1 节，为每句话（或每个镜头）填一行，输出成 `data/shotlist_<X>.md` 并贴给用户：

    | 镜头 | 句子 | 逻辑关系 | 观众要看懂什么（一句话） | 画面方案（视觉比喻） | 焦点元素与落点 | 真实素材 | 动效 & 音效 | 静音读图自检 |

    - **焦点元素与落点**：本镜最重要的那个元素（梗词/LOGO/数字）和它最终必须到达的位置（x 居中、y 400–900、占宽 ≥50% 之类）。焦点元素入场后必须**位移**到落点，不能只原地 pop 在角落（第二集"不烧心"缩在左上角被点名）。

    - **逻辑关系**必须从对照表里选（引入/列举/数据/并列对比/因果/纠正"不是A是B"/转折/引用证据/金句/提问），并使用对照表规定的镜头形式；**禁止跨关系套模板**（例如"不是A是B"禁止用 ≠）。
    - **观众要看懂什么**要写成一句完整的话，不能只写关键词。
    - **屏幕文字不能只是复读字幕**：每个镜头至少提供一项字幕之外的信息（素材、证据、比喻、结构关系）。
    - 复用上一集的组件前，检查组件里固化的语义（图标、编号、占比格、标题措辞）是否适用于这句话；不适用就改或新写。
    - 标出纯文字镜头的数量，超过全片镜头数的一半要改。
4.3 ★ 用户审镜头表。可以逐行改，审过才进入阶段 B 之后的工作（配音可以并行准备）。

### 阶段 B：配音（用户自己在 ElevenLabs 生成）
5. 给用户一段可以直接粘贴的整段文稿，同时说明：
   - 整段一次生成，不要逐句生成。
   - 情绪标签最多留 `[short pause]`、`[calm]` 和 1 处 `[thoughtful]`。
   - 不要用 `[sighs]`、`[chuckles]`、`[excited]`、`[annoyed]`，也不要点"自动标记"。
   - 可以生成 2–3 个 take，用户选一个。
   - 选定后不要变速、不要变调。
6. ★ G-Voice 门禁：自然度、人设、咬字三项都要通过。
7. 把音频复制到 `inputs/voice_<X>.mp3`，原文件不动。记录 SHA256 和实测时长，同时复制一份到 `public/`。

### 阶段 C：TimingMap
8. 运行 `python3 tools/align_sentences.py`，生成 `data/timing_<X>.json`。
   - 原理：静音间隙加动态规划，按已知文本对齐，不用 ASR。
   - 检查每句的字/秒是否在 3.5–6.5 之间，超出说明边界错位。
   - 句尾停顿太短时，就把相邻两句合并成一句。
9. **所有画面和音效时间都从 TimingMap 推导**：`startF`、`endF`、`wordFrame(sid, "词")`。禁止手写帧号。
   - **关键信息要在旁白说到之前或同时出现**，不能晚于旁白 0.3 秒以上。例如"不是AI，是网友"，"网友"这一侧必须在说到"网友"时已经是画面主体（第二集这里晚了 2.5 秒，画面和旁白矛盾）。
   - **语义画面跟字位进场，不跟句子的形式起点**：画面在"这句话开始讲这个意思"的那个字进场。例如承诺卡要跟着"对方说"进场，不是等下一句句首（第四集 v6）。
   - **锚在句尾字位的元素要算停驻**：从入场到镜头切走 <45 帧（1×）就是一闪而过，宁可提前到句中字位进场（第四集 S06/S07/S09/S10 都是这样）。会"出现又消失"的动画（例如虚阶坠落），出现到消失之间 <30 帧就是闪烁，宁可常驻。
   - 每个镜头的锚点同时写进 `src/audit.ts`，供阶段 G 的时序审计使用，见第 20.1 步。

### 阶段 C2：真实素材采集（按 `shots_assets.md` 第 2 节）
9.1 按镜头表里的"真实素材"列逐项采集，"两者结合"：
    - 能自动拿到且版权等级清楚的（Wikimedia Commons、Simple Icons、品牌官网/官方媒体资料、政府/机构原始文件），由你联网下载，放进 `public/assets/<类别>/`。
    - 下载不到、需要登录、或版权等级拿不准的，列成清单给用户，写明：用在哪个镜头、要什么样的图、建议去哪里找；用户下载后放进 `inputs/assets/`，你再复制进 `public/assets/`。
    - 没有真实素材、只需要示意（如"AI流水线"）时，可以用 AI 示意图：你写好生图提示词（9:16 或指定尺寸、风格与品牌色一致），用户在自己的生图工具里生成后交给你；画面角标必须写"AI 示意图"，**禁止用 AI 图冒充真实人物、真实品牌物料、真实截图**。
9.2 每个素材登记到 `data/assets_manifest.json`：文件名、SHA256、来源 URL、作者/权利人、许可证或使用依据、用在哪个镜头、下载日期；另加 `canonical_form`（为什么选这个形象）和 `processing`（下载后的裁剪/转换记录）。CC BY 类素材要在画面角标或简介里署名。
9.3 ★ 把素材清单交给用户确认后才能用进成片，清单包含：缩略图联系表 + manifest 表格 + **按目标显示尺寸渲染的预览图**（LOGO 类必须有，因为容器缩放会暴露空白边/占比问题；第二集费大厨官网原图 2813×1025 有效内容只占左侧，原样渲染缩成一个点）。确认时重点看"是否是受众一眼认出的形象"和"画面里清不清晰"。

### 阶段 D：6 张关键帧门禁（每集必做，在写动画之前；风格先按第 2.5 节选定）
10. 用本集真实内容渲染 6 张静帧（`node tools/render.mjs stills <帧列表>`，每张几秒）：
    ① 钩子帧 ② 数据帧 ③ 流程/论证帧 ④ 数字人 + 字幕帧 ⑤ 转场中间帧（检验该风格的转场语法） ⑥ 结尾 CTA 帧。
    - 拼成一张 `out/keyframes_v<n>.jpg` 联系图。
    - 交付前逐张对照 `styles.md` 该风格的"画风规则"和"别做成"清单自查，结果写进汇报（例如"06：无圆角 ✓、无过冲 ✓、只用红黄蓝黑 ✓"）。
    - 同时检查 IP 锚点套件是否齐全（角标、数字人卡、字幕、slogan 卡）。
11. ★ 用户看关键帧，判断：风格是否到位、手机上是否可读、IP 锚点是否在。
    - 风格问题在这一步改静帧解决，不要带进动画。返工超过 3 轮就停。
    - 首次使用的风格通过后，写 `style_packs/<id>/STYLE.md`（参数、关键帧哈希、渲染实测、返工轮数）。
    - 动画阶段可以先渲染 10–20 秒动态样片确认运动语法，但不再作为风格对齐的主要手段。

### 阶段 E：数字人（可选，需要授权）
12. 在 `tools/run_presenters.sh` 里写好每段的 `id start_s end_s source_offset`。
    - 时间窗取自 TimingMap，起止各留约 0.2 秒余量。**窗口尾 ≥ 该段最后一句句尾 + 0.2 秒是硬规则**，"话没说完人就没了"是第四集返工最多的问题（P01"学费"那一句前后出了 3 次）。尾帧可以断点续推，成本只是增量几帧。
    - 退场：窗口最后 ≥18 帧渐隐 + 轻微下沉缩小（"说着话淡出"），禁止 ≤8 帧纯透明度闪没；`PresenterCard` 播完要随窗口渐出，不能留空壳卡片。
    - 合并段用 `PresenterCard` 的双段联播（`id2` + `splitS`），配合 `moveAt/top2/scale2` 在新句进场时把小卡平滑移到大卡位。
    - 延长已推过的窗口时，先删 `work/presenter/<P>/body16k.wav` 和 `audio_features.npy`（音频缓存会对长度做断言），帧缓存保留续用。
    - 各段的 `source_offset` 要错开，避免几段动作一样。母版共 192 帧，往返循环使用（`source_index`）。
    - 每段 `N = round((end-start)*24)` 帧。
13. 请求授权前先做只读检查：
    - 有没有已在运行的进程；
    - 输入哈希；
    - 输出路径是否已存在；
    - 内存：WSL 可用内存不低于 1.5 GiB，Windows 不低于 1 GiB，**读不到就视为不安全**；
    - 预计耗时：帧数 × 9 秒 + 每段 1 分钟。
14. 启动方式（从 Windows 侧启动，带 `flock`，可断点续跑，已校验的帧会跳过）：
    ```
    powershell.exe -NoProfile -Command "Start-Process -WindowStyle Hidden wsl.exe -ArgumentList '-e','bash','/mnt/d/OPC/sandbox/<sandbox>/tools/launch_presenters.sh','presenters_batch_<date>_run1.log'"
    ```
15. 监控时只读日志和 `work/presenter/<P>/progress.jsonl`。完成后运行 `tools/verify_frames.py <P>`，逐帧校验。
16. 用修复版重新合成模块（不重新推理），输出 `public/presenter_<P>_fix.mp4`：
    ```
    MODULE_VARIANT=fix <musetalk-python> -B tools/presenter.py <P> <start> <end> <offset> module
    ```
    修复内容是嘴部后处理：LAB 颜色校正、颗粒匹配、蒙版收缩加宽羽化、牙缝闭运算、USM 锐化，见 `tools/mouth_fix.py`。
    用 `tools/mouth_ab.py` 出修复前后对比图，交给用户看。

### 阶段 F：整片合成（需要授权）
17. `Episode.tsx` 的结构：
    - 每个镜头用 `<Shot from to>` 包住，镜头边界从 TimingMap 推导。
    - 动画锚点放在常量 `A` 里。
    - 音效列表 `CUES` 和动画共用同一组锚点，参考实现里大约 35 处。
    - 转场用 whoosh，音量约 0.22；重点用 thud；列表项用 tick 或 pop；数字用 scroll 加 confirm；数据揭示用 bong。
    - 音效音量控制在 0.18–0.5，不能盖过人声。
    - **镜头之间不能有空档**：前一个镜头要一直保持到下一个镜头开始。
    - **转场默认值**：`Shot` 统一 6 帧交叉淡化（`from-6` 挂载淡入，`to-6` 起淡出），不要退回硬切。元素入场动画按成片时长来定：1.25 倍速后 10 帧只剩约 0.27 秒，入场至少 14 帧，退场至少 12 帧。
18. 封面：`Cover` 合成，15 帧，内容如下：
    - 真人原片的闭口微笑帧（`public/cover_person.jpg`）。**不要用生成的嘴**。
    - 蓝色副标题条
    - 两行主标题，关键词分别用蓝色和红色
    - 一句补充，口径必须和脚本一致
    - 底部 IP slogan
    封面还要单独输出一张 PNG，用于平台上传。
19. 依次执行，每一步失败就停：
    ```
    source ~/.nvm/nvm.sh
    COMP=Cover STILL_PREFIX=cover node tools/render.mjs stills 0
    COMP=Cover node tools/render.mjs video 0 14 out/cover_v1.mp4
    PROPS='{"presenterVariant":"fix","sfx":true}' node tools/render.mjs video 0 <duration_f-1> out/<ep>_v1_1x.mp4
    python3 tools/finalize.py out/<ep>_v1_1x.mp4 out/cover_v1.mp4 out/<ep>_v1.mp4 1.25
    python3 tools/qa.py out/<ep>_v1.mp4
    ```
    - `finalize.py` 做的事：画面和声音一起加速 1.25 倍（`setpts` + `atempo`，音高不变，口型仍然同步）；前面接 0.5 秒封面；`loudnorm I=-16`；`-shortest` 去掉尾部多出的静音。

### 阶段 G：验收
20.1 **时序审计（硬门禁，在整片渲染之前跑，不过就不渲染、不交片）：**
    ```
    node tools/audit_timing.mjs src/audit.ts 1.25
    ```
    - `src/audit.ts` 导出 `AUDIT = { shots, elements, presenters }` 和 `SENTENCES`，**必须从 `Episode.tsx` 用的同一组常量（A / 镜头边界 / PRESENTERS）推导，禁止手写帧号**。字段格式见脚本头部注释。
    - 检查内容：可读元素停驻 ≥45 帧；入场不晚于对应字位 9 帧；镜头间死帧 ≤15 帧；数字人窗口尾 ≥ 句尾 +0.2 秒；退场渐隐 ≥18 帧；数字人相邻间隔 <8 秒时提示合并（同段用同一 `group` 消除提示）。
    - 有 FAIL 就退出码 1，结果写入 `out/audit_timing.json`，汇报时附上 FAIL/WARN 数量。
    - 背景：这些规则第四集之前就写在 skill 里，但只靠抽帧"看元素出没出现"，没有逐元素核算帧数，结果同类问题返工了 5 轮以上。规则必须由脚本来执行。

20. 机器 QA（`tools/qa.py`）检查：
    - 解码、1080×1920、30fps、帧数
    - 有音轨，音画时长差不超过 1 帧
    - 无黑屏、无长静音
    - 静止超过 1.5 秒的片段只作为提示，不判失败
21. 自己先看联系表和首帧。重点查：空白帧、文字越界、文字重叠、来源角标是否都在。
21.1 **静音读图自检**（交给用户之前必须做，结果写进汇报）：每 1.5 秒抽一帧拼成联系表（`ffmpeg -vf "fps=1/1.5,scale=270:480,tile=6x3"`），遮住字幕区只看画面，逐镜头回答：
    - 不听声音，能不能看懂这个镜头想表达的意思？和镜头表里"观众要看懂什么"一致吗？
    - 画面上的逻辑符号（≠、→、⊘、编号、占比格）和这句话的真实逻辑一致吗？
    - 画面中部（y 400–1300）有没有大面积空白？内容是不是都挤在上面三分之一？
    - 有没有素材镜头？纯文字镜头是否超过一半？
    - 关键信息是不是在旁白说到时已经出现？
    - 每个可读元素入场后完整可读时间是否 ≥1.5 秒（1 倍速）？镜头衔接处有没有 0.5 秒以上的"死帧"（只剩标题的空屏）？
    - 中文关键词有没有被换行从中间劈开？来源角标是不是单行可读？
    - 素材在卡片里是否清晰可辨（不能缩成一个点）？示意图类画面是否带常驻角标（如「示意图 · 非真实剧照」）？
    任何一项不过，先自己改，改完再交给用户。
22. ★ 交给用户做人工门禁，逐项回复过或不过：

    | 门禁 | 看什么 |
    |---|---|
    | G-Lip | 口型和声音是否对得上 |
    | G-Face | 嘴部边缘有没有撕裂、牙齿有没有黑点、段落之间人物有没有跳变 |
    | 视觉/节奏 | 手机上是否可读，是否有高级感，节奏是否合适 |
    | 画面语义 | 每个镜头的画面是否和这句话的意思对得上、不看字幕能否看懂 |
    | 素材 | 真实素材是否相关、清晰、来源和版权可接受 |
    | 音效 | 是否加分，有没有太吵或盖过人声 |
    | 封面 | 是否吸引点击 |
    | 编辑/事实 | 内容和来源标注是否满意 |

23. 把所有意见合并成一次修改，再请求授权重新合成 v(n+1)。两项都通过才算 FINAL_READY。
24. 交付时附上：成片路径、SHA256、联系表、封面 PNG、QA JSON，以及实测耗时和费用（推理、渲染、付费调用）。

### 阶段 H：入账与数据回填（每集交付后 + 发布后）
25. 交付 FINAL_READY 时，在生产账本登记本集：编辑 `D:\OPC\ledger\seed_episodes.py` 的 `EPISODES`（episode_id、标题、栏目、风格编号、数字人秒数、帖子标题关键词），运行后会自动关联到平台帖子。
26. 发布后按 T+1 / T+3 / T+7 天采集视频号数据（只读、每天最多一次）：
    ```
    powershell.exe -NoProfile -Command "cd D:\OPC\ledger; .\.venv\Scripts\python.exe -X utf8 channels_stats.py"
    ```
    - 登录态保存在 `D:\OPC\ledger\profiles\channels\`（私密，不入仓库）；过期时会弹出 Edge 让用户扫码。
    - 已校准字段：`readCount` 播放、`likeCount`、`commentCount`、`forwardCount` 转发、`favCount`、`followCount` 涨粉、`fullPlayRate` 完播率、`avgPlayTimeSec` 平均观看秒数、`fastFlipRate` 快速划走率。原始响应留在 `raw/channels/<时间>/`，字段变化时校准后用 `--reparse` 重解析。
    - 视频号助手也有官方"导出数据"，可作交叉校验。
27. 看数据：`python opc_ledger.py report`。**至少积累 15–20 条再按风格、栏目、钩子类型下结论**；在那之前，数据只用于发现明显问题（例如快速划走率 >60% 说明前 3 秒钩子失效）。

## 4. 汇报格式
- 中文汇报，结论先行，然后用表格列出产物路径、哈希、耗时。
- 如实说明没做到的、没验证的部分，以及推断和估算。
- 需要授权时，给出一条可以直接复制执行的完整命令，并写清停止条件。
