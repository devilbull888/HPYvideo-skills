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
- `C:\Users\黄品颖\AppData\Roaming\devin\skills\ai-video-factory\styles.md`：15 种风格的实现方式，用户选了风格编号时必读
- `C:\Users\黄品颖\AppData\Roaming\devin\skills\ai-video-factory\lessons.md`：前两集踩过的坑和对应修法，开工前必读

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
REF=/mnt/d/OPC/sandbox/stylepack-trial-muse-20261018
mkdir -p $NEW/{inputs,data,out,public,work,assets}
cp -r $REF/src $REF/tools $REF/package.json $REF/tsconfig.json $REF/remotion.config.ts $NEW/
cp -r $REF/assets/sfx $NEW/assets/ && cp -r $REF/public/sfx $NEW/public/
cp $REF/public/cover_person.jpg $NEW/public/
ln -s /mnt/d/OPC/video-producer-v0/node_modules $NEW/node_modules
```

- **不要复制** `out/`、`work/`、`inputs/`、`data/` 和 `public/presenter_*`。这些都属于上一集。
- 复制完要做三件事：
  1. 把 `tools/presenter.py`、`tools/run_presenters.sh`、`tools/align_sentences.py` 里的路径和文件名（`script_A`、`voice_A`）改成新一集的。
  2. 把 `Root.tsx` 里的合成 id 改成新一集的。
  3. 把 `Episode.tsx` 里的镜头整体替换掉。上一集的镜头组件可以复用，但文案、锚点和音效 cue 都要重写。
- 最后执行 `npx tsc --noEmit`，类型检查必须通过。

## 2.5 风格选择（必须主动弹窗让用户选，不要让用户记编号）

用户没有明确指定风格时，**在阶段 A 脚本确认之后、阶段 D 样片之前**，用 `ask_user_question` 工具弹出选择。用户已经点名某个风格的，跳过这一步，但要复述一遍你理解的是哪种风格、效果是什么。

- 先读脚本内容，判断哪种风格最适合，在那个选项的 label 末尾加"（推荐）"，并在 description 里写一句推荐理由。
- `ask_user_question` 每题最多 4 个选项，所以分两轮问。

**第 1 轮（一次调用，2 个问题）：**

问题 1，header "风格类别"，单选：

| label | description |
|---|---|
| 只用主风格 | 几何白底（包豪斯+扁平）：米白底、深蓝字、蓝红点缀、严格网格。上一集就是这个，最稳、最快 |
| 主风格+功能风格 | 加一种辅助风格，用于部分镜头：贴纸科普 / 赛博HUD / 等轴2.5D（下一轮选具体哪种） |
| 主风格+叙事风格 | 加一种讲故事的风格：拼贴剪报 / 逐帧手绘（下一轮选） |
| 特别篇风格 | 3D / 80s合成波 / 像素 / 水彩。渲染慢或和IP调性不太搭，返工风险高，偶尔用 |

问题 2，header "动画手法"，多选（multi_select: true），可以和任何风格叠加：

| label | description |
|---|---|
| 线条绘制 | 线条一笔一笔画出来，"从种子画到城"，适合讲流程、从0到1 |
| 形变 | 一个形状连续变成下一个，适合"过去→以后"这类概念转换和转场 |
| 液体转场 | 品牌蓝液团粘连融合铺满画面再收缩，只做0.5秒转场，一条片最多2–3次 |
| 开场花字 | 综艺式多层描边+弹跳大字，只用于开场前2秒钩子 |

**第 2 轮（按第 1 轮的选择，问 1 个问题）：**
- 选了"只用主风格"：不问第 2 轮。
- 选了"主风格+功能风格"：header "功能风格"，选项如下：
  - `贴纸科普`：粗白描边贴纸、硬投影、弹出入场，适合小红书式知识拆解、列要点
  - `赛博HUD`：深色底、青色线框、扫描线、滚动数字，适合AI工具演示和数据对比
  - `等轴2.5D`：俯视积木微缩模型，适合讲Agent架构、平台和流量关系
- 选了"主风格+叙事风格"：header "叙事风格"，选项如下：
  - `拼贴剪报`：牛皮纸、网点印刷、剪纸边、纸片飞入，适合事件叙事（VOX感）
  - `逐帧手绘`：线条微微抖动、斜线涂色，温和，适合个人故事、"不焦虑"的叙事
- 选了"特别篇风格"：header "特别篇"，选项如下，每个 description 都要写明风险：
  - `3D渲染`：三维材质灯光弹跳；集显渲染很慢、需联网装包，建议用CSS伪3D替代
  - `80s合成波`：霓虹、透视网格、条纹落日；和IP调性不符，易廉价
  - `像素风`：低分辨率、少量颜色；中文像素字体可读性与许可需核验
  - `水彩`：晕染、自然过渡；程序模拟难逼真，返工风险最高

**选完以后：**
1. 用 2–3 行复述最终组合，例如"主风格几何白底 + 功能风格贴纸科普 + 动画手法：线条绘制、形变"。
2. 说明哪 2 个镜头会先做成新风格样片。
3. 打开 `styles.md` 里对应章节，按里面的做法实现。

**如果 `ask_user_question` 工具不可用：** 在聊天里输出同样内容的编号表格（类别、风格名、一句话效果、适合什么内容、是否推荐），请用户回复编号。

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
   - 数字人只用在 2–3 处：开场钩子、中段判断句、结尾 CTA。每段 4–7 秒，合计不超过约 16 秒，控制推理时间。
4. ★ 交给用户确认脚本和事实口径。
4.1 脚本确认后，如果用户还没指定风格，立即按第 2.5 节弹窗让用户选风格和动画手法。

### 阶段 A2：镜头语义设计表（每集必做，写任何镜头代码之前，用户审过才能往下走）
4.2 按 `shots_assets.md` 第 1 节，为每句话（或每个镜头）填一行，输出成 `data/shotlist_<X>.md` 并贴给用户：

    | 镜头 | 句子 | 逻辑关系 | 观众要看懂什么（一句话） | 画面方案（视觉比喻） | 真实素材 | 动效 & 音效 | 静音读图自检 |

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

### 阶段 C2：真实素材采集（按 `shots_assets.md` 第 2 节）
9.1 按镜头表里的"真实素材"列逐项采集，"两者结合"：
    - 能自动拿到且版权等级清楚的（Wikimedia Commons、Simple Icons、品牌官网/官方媒体资料、政府/机构原始文件），由你联网下载，放进 `public/assets/<类别>/`。
    - 下载不到、需要登录、或版权等级拿不准的，列成清单给用户，写明：用在哪个镜头、要什么样的图、建议去哪里找；用户下载后放进 `inputs/assets/`，你再复制进 `public/assets/`。
    - 没有真实素材、只需要示意（如"AI流水线"）时，可以用 AI 示意图：你写好生图提示词（9:16 或指定尺寸、风格与品牌色一致），用户在自己的生图工具里生成后交给你；画面角标必须写"AI 示意图"，**禁止用 AI 图冒充真实人物、真实品牌物料、真实截图**。
9.2 每个素材登记到 `data/assets_manifest.json`：文件名、SHA256、来源 URL、作者/权利人、许可证或使用依据（CC0 / CC BY 4.0 / 公有领域 / 官方 LOGO 指名使用 / 著作权法第24条适当引用 / AI 示意图）、用在哪个镜头、下载日期。CC BY 类素材要在画面角标或简介里署名。
9.3 ★ 把素材清单（缩略图联系表 + manifest 表格）交给用户确认后才能用进成片。

### 阶段 D：风格样片（新风格必做，主风格可以跳过；风格先按第 2.5 节弹窗选定）
10. 渲染 10–20 秒样片，选数据卡或流程镜头。
    - 命令：`node tools/render.mjs stills <帧列表>`，然后 `node tools/render.mjs video <from> <to> out/trial.mp4`
    - 再跑 `python3 tools/qa.py out/trial.mp4`，并出联系表。
11. ★ 用户看样片，判断三点：手机上中文是否可读、是否有高级感、是否符合 IP 调性。
    - 通过的版本冻结成风格包。
    - 不通过的记录原因；返工超过 3 轮就停。

### 阶段 E：数字人（可选，需要授权）
12. 在 `tools/run_presenters.sh` 里写好每段的 `id start_s end_s source_offset`。
    - 时间窗取自 TimingMap，起止各留约 0.2 秒余量。
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

## 4. 汇报格式
- 中文汇报，结论先行，然后用表格列出产物路径、哈希、耗时。
- 如实说明没做到的、没验证的部分，以及推断和估算。
- 需要授权时，给出一条可以直接复制执行的完整命令，并写清停止条件。
