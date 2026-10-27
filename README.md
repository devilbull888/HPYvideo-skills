# HPYvideo-skills

用作知识类remotion视频制作，丰富的动态效果、音效。

Devin CLI 自定义 skills 仓库。

## English

Custom [Devin CLI](https://devin.ai) skills for producing short vertical (9:16) knowledge videos for the Chinese IP "AI不焦虑君" (Douyin, Xiaohongshu, Kuaishou, WeChat Channels).

**`ai-video-factory`** is a gated, human-in-the-loop production workflow:

1. **Script fact-check** – every data point needs a dated source; on-screen source labels.
2. **Shot semantic design** – for each sentence, classify its logic (list, comparison, correction "not A but B", reveal, quote, …), state what the viewer must understand, and pick the matching shot form from a mandatory mapping table. Reviewed by the user before any code is written.
3. **Voice** – user generates narration in ElevenLabs with a locked voice profile.
4. **TimingMap** – deterministic sentence alignment (silence gaps + dynamic programming, no ASR); all visuals and SFX are anchored to it.
5. **Real assets** – brand logos, public-domain/CC photos, original documents, fair-quote screenshots, or clearly labelled AI illustrations; each recorded in a manifest with source, license basis and SHA256.
6. **Optional talking-head presenter** – MuseTalk 1.5 on CPU, resumable and frame-verified, with mouth post-processing.
7. **Render** – Remotion procedural motion graphics + asset animations + CC0 / procedural sound effects, a cover frame, 1.25× pitch-preserved speed-up and loudness normalisation.
8. **QA** – machine checks (ffprobe/ffmpeg), a "mute read-through" self-check, and human gates (lip-sync, face, semantics, assets, pacing, SFX, cover, facts).

It also includes an implementation guide for 15 visual styles (Bauhaus geometric, flat vector, sticker explainer, cyberpunk HUD, isometric 2.5D, collage, hand-drawn, line drawing, morphing, liquid transitions, variety-show captions, synthwave, pixel, watercolor, 3D), with an interactive style picker, and lessons learned from real episodes.

Files: `SKILL.md` (workflow), `shots_assets.md` (shot semantics + asset layer), `styles.md` (15 styles), `lessons.md` (post-mortems and measured baselines), `hooks.md` (hook swipe file: three-layer hooks, taxonomy, fill-in formulas). Content is written in Chinese.

> Paths inside the skill refer to the author's local machine (Windows + WSL2, Intel iGPU, no CUDA) and must be adapted before use elsewhere.

---

## 目录

```
skills/
└── ai-video-factory/          # AI不焦虑君 竖屏知识短视频生产流程 + 15种视觉风格实现手册
    ├── SKILL.md               # 主流程（门禁、授权点、命令）
    ├── shots_assets.md        # 镜头语义设计对照表 + 真实素材来源/版权/组件
    ├── styles.md              # 15 种风格的 Remotion 实现方式
    ├── lessons.md             # 前两集复盘、实测基线与踩坑记录
    └── hooks.md               # 钩子库：三层钩子、类型、填空公式、本账号档案
```

## 使用方式

skill 需要放在 Devin 能扫描到的位置才会被识别：

- **全局生效（当前做法）**：复制或软链接到
  - Windows：`%APPDATA%\devin\skills\ai-video-factory\`
  - Linux/macOS：`~/.config/devin/skills/ai-video-factory/`
- **单个项目生效**：复制到项目根目录 `.devin/skills/ai-video-factory/`（提交进项目仓库，团队成员共享）。

之后在任意对话里输入 `/ai-video-factory`，或直接描述需求由模型自动匹配。

## 同步约定

工作副本在 `%APPDATA%\devin\skills\ai-video-factory\`（全局生效的那份）。
改动后把全部文件同步回本仓库再提交，保持两边一致；以仓库版本为准。

## 注意

- 本仓库只放 skill 文本，不放视频产物、脚本正文、音频或任何密钥。
- `ai-video-factory` 内引用的本机路径（D:\OPC\...、MuseTalk venv 等）属于当前机器环境，换机器需要先更新 SKILL.md 第 1 节。
