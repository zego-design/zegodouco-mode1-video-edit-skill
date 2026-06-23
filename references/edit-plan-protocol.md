# edit_plan.json Protocol

Use this protocol for repeatable edits of an existing source video.

## Top-Level Shape

```json
{
  "version": 1,
  "title": "Demo edit",
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

## Common Action Fields

```json
{
  "id": "unique-id",
  "type": "highlight",
  "sourceStartSec": 20,
  "sourceEndSec": 24,
  "sourceAtSec": 30,
  "durationSec": 2,
  "bindToActionId": "freeze-target",
  "expectedTarget": "目标画面说明",
  "interactionIntent": "focus-only",
  "qaFrame": true,
  "sourceTimeAdjusted": {
    "requestedRange": "120.000-140.000",
    "actualSourceRange": "170.000",
    "reason": "目标画面在 170 秒才清晰出现。"
  }
}
```

`interactionIntent` values: `actual-click`, `pre-click-guidance`, `focus-only`, `typing-focus`, `result-focus`.

## Actions

### keep

```json
{ "id": "keep-opening", "type": "keep", "sourceStartSec": 0, "sourceEndSec": 15 }
```

### cut

```json
{ "id": "cut-waiting", "type": "cut", "sourceStartSec": 15, "sourceEndSec": 17 }
```

If a plan only contains `cut` segment actions, the executor derives the kept ranges automatically.

### speed

```json
{
  "id": "speed-waiting",
  "type": "speed",
  "sourceStartSec": 80,
  "sourceEndSec": 118,
  "speed": 3,
  "expectedTarget": "等待过程三倍速"
}
```

Use `speed: 0.42` for slow, smoother transitions.

### freeze

```json
{
  "id": "freeze-tools",
  "type": "freeze",
  "sourceAtSec": 30,
  "durationSec": 3,
  "expectedTarget": "ZEGO tools 面板",
  "interactionIntent": "focus-only"
}
```

### highlight

```json
{
  "id": "highlight-tools",
  "type": "highlight",
  "bindToActionId": "freeze-tools",
  "targetBox": { "x": 422, "y": 388, "width": 365, "height": 252 },
  "expectedTarget": "ZEGO(6) tools 面板中的全部工具内容",
  "interactionIntent": "focus-only"
}
```

For dynamic highlights, add `allowDynamicHighlight: true` and source timing.

### caption

```json
{
  "id": "caption-speed",
  "type": "caption",
  "sourceStartSec": 80,
  "sourceEndSec": 118,
  "text": "3 倍速播放中",
  "fontSize": 24,
  "captionBox": { "x": 524, "y": 26, "width": 232, "height": 44 },
  "expectedTarget": "三倍速播放提示",
  "interactionIntent": "focus-only"
}
```

### note

```json
{
  "id": "note-click-hint",
  "type": "note",
  "bindToActionId": "freeze-button",
  "text": "点这里",
  "fontSize": 24,
  "captionBox": { "x": 888, "y": 204, "width": 104, "height": 42 },
  "expectedTarget": "点击提示",
  "interactionIntent": "pre-click-guidance"
}
```

### zoom

```json
{
  "id": "zoom-create-rule",
  "type": "zoom",
  "bindToActionId": "freeze-button",
  "zoomBox": { "x": 402, "y": 184, "width": 230, "height": 58 },
  "outputBox": { "x": 420, "y": 168, "width": 455, "height": 116 },
  "expectedTarget": "Create new rule file 按钮",
  "interactionIntent": "pre-click-guidance"
}
```

## Validation

Run both:

```bash
npm run mode1:run -- --source /path/to/source.mp4 --plan path/to/edit_plan.json --output path/to/output/final.mp4
npm run mode1:validate -- --output path/to/output --write true
```

Treat `qa-report.json.status = "failed"` as non-deliverable.
