# Pipeline Launch Checklist

> 点火前逐项确认。每次对新项目或新 EP 点火时都要过一遍。

## 1. 核心 skill 组件齐全

确认当前 skill 包包含：
- `fantasy-pipeline-full-write`
- `fantasy-ep-spine`
- `fantasy-spine-qc`
- `fantasy-scene-design`
- `fantasy-design-qc`
- `fantasy-scene-write`
- `fantasy-write-qc`

## 2. 目录骨架正确

应至少具备：

```text
<project_root>/
├── skill_context/
│   ├── 人物锚点.md
│   ├── 技能锚点.md
│   ├── 宝物锚点.md
│   ├── EP锚点.md
│   ├── writing-rules.md
│   ├── 人物设定集/
│   ├── 技能设定集/
│   └── 宝物设定集/
└── ep{N}/
    ├── user_input.md
    └── workspace/
```

## 3. 待结清 draft 检查

点火前确认上一 EP 没有未处理的：
- `ep{N-1}/workspace/anchor-update-draft.md`

如存在 pending draft，先处理，再进入新的 ignite。

## 4. 路径分层不混淆

- 中间产物：`ep{N}/workspace/`
- 最终稿：`ep{N}/ep{N}.md`
- 候选锚点更新：`ep{N}/workspace/anchor-update-draft.md`

## 5. 运行环境可读写

确认当前宿主环境的 skill 加载、工作目录约定、文件读写权限已正常配置。

> 这属于运行时要求，不属于 pipeline 协议本身。

> 阶段顺序与手动确认节点请看 `pipeline-workflow.md`；跨 EP 衔接请看 `propagation-rules.md`。
