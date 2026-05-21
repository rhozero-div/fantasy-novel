# Codex 安装说明

本 repo 的 GitHub 版本是 canonical source，Codex 只是执行适配层之一。

## 推荐安装方式

将下列 skill 目录整体暴露给 Codex，而不是只复制 `SKILL.md`：

- `fantasy-pipeline-full-write/`
- `fantasy-ep-spine/`
- `fantasy-spine-qc/`
- `fantasy-scene-design/`
- `fantasy-design-qc/`
- `fantasy-scene-write/`
- `fantasy-write-qc/`

原因：

- 每个 skill 都依赖同目录下的 `references/`
- canonical 协议与模板均在 repo 中维护
- 平台适配不应反向改写 canonical skill 文本

## 当前建议

优先把 Codex 接入视为 **local skill family deployment**，而不是一开始就做 plugin。

Plugin 更适合后续场景：

- 一键安装整套 skill family
- 附带专用工具或 MCP server
- 做更产品化的分发体验

在 canonical repo 稳定之前，Codex plugin **不是必需前提**。
