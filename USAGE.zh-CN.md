# Mode 1 Video Edit Skill 能力介绍与使用教程

## 1. 这个 skill 是什么

`mode1-video-edit` 是一个面向“已有视频后期修改”的可复用 skill。它可以把已经录好的视频，按照自然语言修改需求转换成结构化 `edit_plan.json`，再通过 executor 重新渲染出新视频。

核心特点：

- 每次修改都基于原视频重新渲染，不破坏原视频。
- 修改逻辑写在 `edit_plan.json` 中，可以反复调整、反复渲染。
- 自动输出 `timeline.json` 和 `qa-report.json`，方便检查修改是否符合预期。
- 支持 QA 抽帧，能快速复查蓝框、字幕、冻结帧、放大区域等关键画面。

它不是录屏工具，也不是浏览器自动化工具，只处理已经存在的视频文件。

## 2. 适合什么场景

适合：

- 剪掉视频中的等待、卡顿、无效操作。
- 把长等待过程改成多倍速播放。
- 在关键操作处暂停，并添加蓝色高亮框。
- 给按钮、输入框、输出区域做局部放大。
- 添加说明字幕、备注提示、倍速提示。
- 调慢某段过渡，让放大或缩小更自然。
- 针对演示视频、教程视频、操作录屏做后期精修。

不适合：

- 从网页重新录制视频。
- 自动操作浏览器生成录屏。
- 做复杂影视级剪辑、转场、调色、配乐。
- 在没有源视频的情况下凭空生成视频。

## 3. 文件夹内容

```text
mode1-video-edit-skill/
├── SKILL.md
├── package.json
├── references/
│   └── edit-plan-protocol.md
├── scripts/
│   ├── run-mode1-edit.mjs
│   ├── validate-edit-qa.mjs
│   └── video-edit-executor.mjs
├── templates/
│   └── edit-plan.schema.json
└── examples/
    └── zegomcp-edit_plan.json
```

主要文件：

- `SKILL.md`：给 Codex / AI agent 读取的 skill 指南。
- `USAGE.zh-CN.md`：给人看的能力介绍和使用教程。
- `references/edit-plan-protocol.md`：完整 `edit_plan.json` 协议说明。
- `scripts/run-mode1-edit.mjs`：视频修改 executor。
- `scripts/validate-edit-qa.mjs`：QA 校验器。
- `templates/edit-plan.schema.json`：计划文件 schema。
- `examples/zegomcp-edit_plan.json`：示例计划。

## 4. 安装依赖

进入 skill 文件夹：

```bash
cd mode1-video-edit-skill
npm install
```

依赖包括：

- `ffmpeg-static`：用于视频剪辑和渲染。
- `sharp`：用于生成文字 overlay，避免依赖 FFmpeg 的 `drawtext`。

## 5. 快速开始

准备：

- 一个原视频，例如 `/path/to/source.mp4`
- 一个修改计划，例如 `edit_plan.json`
- 一个输出目录，例如 `output/`

运行渲染：

```bash
npm run mode1:run -- --source /path/to/source.mp4 --plan edit_plan.json --output output/final.mp4
```

运行 QA：

```bash
npm run mode1:validate -- --output output --write true
```

成功后会得到：

```text
output/
├── final.mp4
├── timeline.json
├── qa-report.json
└── qa-frames/
```

## 6. edit_plan.json 基本结构

```json
{
  "version": 1,
  "title": "教程视频后期修改",
  "source": {
    "path": "/path/to/source.mp4",
    "expectedWidth": 1280,
    "expectedHeight": 720,
    "expectedFps": 60,
    "expectedDurationSec": 197.16
  },
  "output": {
    "path": "output/final.mp4",
    "width": 1280,
    "height": 720,
    "fps": 60,
    "codec": "libx264",
    "pixelFormat": "yuv420p"
  },
  "actions": [],
  "qaChecks": []
}
```

所有时间字段都使用源视频时间，不是剪辑后的成片时间。

## 7. 支持的编辑动作

- `cut`：删除片段。
- `keep`：保留片段。
- `speed`：多倍速或慢放，`speed > 1` 加速，`speed < 1` 慢放。
- `freeze`：冻结帧。
- `highlight`：蓝色高亮框。
- `caption`：说明字幕。
- `note`：局部备注。
- `zoom`：局部放大。

更完整的字段示例见 `references/edit-plan-protocol.md`。

## 8. 从自然语言需求生成 edit_plan

推荐流程：

1. 先读取用户修改需求。
2. Probe 源视频，确认分辨率、fps、时长。
3. 对涉及位置的需求抽取源帧，例如 `T-1/T/T+1/T+2`。
4. 根据源帧确认真实目标时间和坐标。
5. 写 `edit_plan.json`。
6. 运行 executor。
7. 运行 QA。
8. 根据 QA 和人工反馈继续修改计划。

不要只根据用户文字猜坐标。比如用户说“框住输入区域”，必须看源帧确认输入区域的位置。

## 9. 如何连续迭代修改

连续迭代时，只改 `edit_plan.json`，然后重新运行：

```bash
npm run mode1:run -- --source /path/to/source.mp4 --plan edit_plan.json --output output/final.mp4
npm run mode1:validate -- --output output --write true
```

不要把上一版 `final.mp4` 当作新源视频继续加工。这样会导致画质损失、时间线混乱，也会让 QA 映射失效。

常见反馈和对应修改方式：

- “蓝框晚一点”：调整 `sourceStartSec` 或绑定的 `freeze.sourceAtSec`。
- “蓝框框错了”：调整 `targetBox`。
- “字幕挡住主体”：调整 `captionBox`。
- “这段太慢”：调大 `speed`。
- “过渡太突兀”：把对应片段设为 `speed < 1`。
- “说明时间太短”：调大 `durationSec` 或 `sourceEndSec`。

## 10. QA 规则

QA 会检查：

- 输出视频是否存在、可播放。
- 是否有视频轨和音频轨。
- 输出分辨率和 fps 是否低于源视频。
- 字幕、蓝框、放大区域是否在画面内。
- 字幕是否遮挡目标区域。
- 蓝框是否有 `expectedTarget`。
- 点击、输入、按钮等相关动作是否有 `interactionIntent`。
- 关键动作是否有 QA 抽帧。
- `zoom` 是否足够明显。

如果 `qa-report.json.status = "failed"`，这一版不能作为最终交付版本。

## 11. 常见问题

### 为什么文字不用 FFmpeg drawtext？

为了提高兼容性。这个 skill 用 `sharp` 先生成透明 PNG 文字层，再用 FFmpeg overlay 叠加，所以不依赖 FFmpeg 是否启用 `drawtext`。

### 可以直接给自然语言，不写 edit_plan 吗？

可以。推荐让 Codex 先根据自然语言和源视频生成 `edit_plan.json`，然后再运行 executor。最终可复用和可迭代的是 `edit_plan.json`。

### 修改后的视频会覆盖原视频吗？

不会。executor 只读取原视频，输出到你指定的 `output/final.mp4`。

### 为什么每次都要重新渲染？

这样可以保证每一版都基于原视频和当前计划生成，避免二次压缩和时间线漂移。

## 12. 分享给别人时怎么用

把整个文件夹或压缩包发给对方。对方解压后：

```bash
cd mode1-video-edit-skill
npm install
npm run mode1:run -- --source /path/to/source.mp4 --plan /path/to/edit_plan.json --output output/final.mp4
npm run mode1:validate -- --output output --write true
```

如果要试示例，把示例源视频放到 `examples/ZEGOMCP.mp4`，然后运行：

```bash
npm run mode1:demo
npm run mode1:validate -- --output output --write true
```
