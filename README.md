# mode1-video-edit-skill

Reusable Codex skill and executor for editing existing videos from `edit_plan.json`.

## Quick Start

```bash
npm install
npm run mode1:run -- --source /path/to/source.mp4 --plan /path/to/edit_plan.json --output output/final.mp4
npm run mode1:validate -- --output output --write true
```

Read [USAGE.zh-CN.md](USAGE.zh-CN.md) for the Chinese capability overview and tutorial.

Read [SKILL.md](SKILL.md) for the Codex skill instructions.

Read [references/edit-plan-protocol.md](references/edit-plan-protocol.md) for the `edit_plan.json` protocol.
1. 这个 skill 是什么
mode1-video-edit 是一个面向“已有视频后期修改”的可复用 skill。它适合把一段已经录好的视频，按照自然语言修改需求转换成结构化 edit_plan.json，再通过 executor 重新渲染出新视频。
它的核心特点是：
每次修改都基于原视频重新渲染，不破坏原视频。
修改逻辑写在 edit_plan.json 中，可以反复调整、反复渲染。
自动输出 timeline.json 和 qa-report.json，方便检查修改是否符合预期。
支持 QA 抽帧，能快速复查蓝框、字幕、冻结帧、放大区域等关键画面。
它不是录屏工具，也不是浏览器自动化工具。它只处理已经存在的视频文件。
2. 适合什么场景
适合：
剪掉视频中的等待、卡顿、无效操作。
把长等待过程改成多倍速播放。
在关键操作处暂停，并添加蓝色高亮框。
给按钮、输入框、输出区域做局部放大。
添加说明字幕、备注提示、倍速提示。
调慢某段过渡，让放大或缩小更自然。
针对演示视频、教程视频、操作录屏做后期精修。
不适合：
从网页重新录制视频。
自动操作浏览器生成录屏。
做复杂影视级剪辑、转场、调色、配乐。
在没有源视频的情况下凭空生成视频。
3. 文件夹内容
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
主要文件说明：
SKILL.md：给 Codex / AI agent 读取的 skill 指南。
使用教程.md：给人看的能力介绍和使用教程。
references/edit-plan-protocol.md：完整 edit_plan.json 协议说明。
scripts/run-mode1-edit.mjs：视频修改 executor。
scripts/validate-edit-qa.mjs：QA 校验器。
templates/edit-plan.schema.json：计划文件 schema。
examples/zegomcp-edit_plan.json：示例计划。
4. 安装依赖
进入 skill 文件夹：
cd mode1-video-edit-skill
安装依赖：
npm install
依赖包括：
ffmpeg-static：用于视频剪辑和渲染。
sharp：用于生成文字 overlay，避免依赖 FFmpeg 的 drawtext。
5. 快速开始
准备：
一个原视频，例如 /path/to/source.mp4
一个修改计划，例如 edit_plan.json
一个输出目录，例如 output/
运行渲染：
npm run mode1:run -- --source /path/to/source.mp4 --plan edit_plan.json --output output/final.mp4
运行 QA：
npm run mode1:validate -- --output output --write true
成功后会得到：
output/
├── final.mp4
├── timeline.json
├── qa-report.json
└── qa-frames/
其中：
final.mp4 是修改后的视频。
timeline.json 记录源视频时间和成片时间的映射。
qa-report.json 记录 QA 是否通过。
qa-frames/ 保存关键修改点的抽帧图片。
