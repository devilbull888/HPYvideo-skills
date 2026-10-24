# devin-skills

Devin CLI 自定义 skills 仓库。

## 目录

```
skills/
└── ai-video-factory/          # AI不焦虑君 竖屏知识短视频生产流程 + 15种视觉风格实现手册
    ├── SKILL.md               # 主流程（门禁、授权点、命令）
    ├── shots_assets.md        # 镜头语义设计对照表 + 真实素材来源/版权/组件
    ├── styles.md              # 15 种风格的 Remotion 实现方式
    └── lessons.md             # 前两集复盘、实测基线与踩坑记录
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
