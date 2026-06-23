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
