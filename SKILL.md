---
name: mode1-video-edit
description: Use when modifying an existing video from natural-language edit requests, especially screen-recording edits that need cuts, speed changes, freeze frames, captions, highlights, zooms, QA frames, or repeatable edit_plan.json based rendering.
---

# Mode 1 Video Edit

## 适合场景

用于“已有视频”的后期修改，不用于重新录屏或浏览器自动化录制。典型任务包括：删掉等待片段、冻结关键帧、给操作位置加蓝框、添加说明文字、局部放大、慢放突兀过渡、长等待多倍速播放，并输出可复查的 timeline 和 QA 抽帧。

不要猜坐标。遇到“当前操作位置、输入区域、输出区域、点击这里、框住某区域”时，先抽取源视频目标时间点前后帧确认画面，再写 `edit_plan.json`。

## 安装

把整个 `mode1-video-edit-skill/` 文件夹放到可访问位置后，在该文件夹里安装依赖：

```bash
npm install
```

## 输入

- 原视频路径，例如 `/path/to/source.mp4`。
- 自然语言修改需求，时间点一律按源视频时间理解。
- `edit_plan.json`。若用户只给自然语言，先根据源帧分析生成计划。

协议细节见 [references/edit-plan-protocol.md](references/edit-plan-protocol.md)。

## 输出

executor 输出到指定目录：

- `final.mp4`：修改后视频。
- `timeline.json`：动作、源时间到成片时间映射、输出时长。
- `qa-report.json`：媒体信息、QA 状态、失败原因或 warning。
- `qa-frames/`：关键动作抽帧。

QA 失败时不要交付 `final.mp4` 作为通过版本。

## 支持的编辑动作

- `keep`：保留源片段。
- `cut`：删除源片段。
- `speed`：统一变速，`speed > 1` 加速，`speed < 1` 慢放。
- `freeze`：冻结某个源时间点。
- `highlight`：蓝色高亮框。
- `caption`：说明字幕。
- `note`：局部备注。
- `zoom`：局部放大。

兼容旧类型 `speed-up` 和 `slow-down`，新计划优先使用 `speed`。

## 执行流程

1. Probe 原视频，确认时长、分辨率、fps、音频轨。
2. 按自然语言需求抽源帧，确认目标时间和坐标。
3. 写 `edit_plan.json`，所有时间使用源视频时间。
4. 渲染：

```bash
npm run mode1:run -- --source /path/to/source.mp4 --plan path/to/edit_plan.json --output path/to/output/final.mp4
```

5. 校验：

```bash
npm run mode1:validate -- --output path/to/output --write true
```

6. 检查 `qa-report.json` 和 `qa-frames/`。若 failed，修改计划后重新从原视频渲染。

## 连续迭代修改

每次迭代只改 `edit_plan.json`，不要在上一次 `final.mp4` 上继续二次加工。重新运行 executor，让每个版本都从同一个原视频和当前计划生成。

用户反馈如“蓝框晚一点”“字幕挡住了”“这段再快一点”，直接调整对应 action 的时间、box、text 或 speed，再重新渲染和 QA。

## 注意事项

- 所有 `sourceStartSec`、`sourceEndSec`、`sourceAtSec` 都是源视频时间。
- 蓝框默认应绑定 `freeze`；动态播放中显示蓝框时必须写 `allowDynamicHighlight: true`。
- 每个 `highlight` 必须写 `expectedTarget`，方便语义 QA。
- 涉及点击、按钮、输入、输出区域的动作必须写 `interactionIntent`。
- 字幕和备注不要遮挡主体，底块保持紧凑，文字居中。
- `zoom` 要明显，`outputBox` 宽高通常至少是 `zoomBox` 的约 1.45 倍。
- 如果用户给的时间和目标画面不匹配，可以调整到真实目标时间，但必须写 `sourceTimeAdjusted`。
- 用 `ffmpeg-static` 渲染视频，用 `sharp` 生成文字 overlay；不要依赖 FFmpeg `drawtext`。

## 示例

`examples/zegomcp-edit_plan.json` 是一个可参考的计划文件。把源视频放到 `examples/ZEGOMCP.mp4` 后可运行：

```bash
npm run mode1:demo
npm run mode1:validate -- --output output --write true
```
