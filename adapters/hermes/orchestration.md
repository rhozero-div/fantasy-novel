# Hermes Orchestration

本目录承接 Hermes 的执行层示例。

## 定位

Hermes 与 opencode、Codex 并列，都是 canonical repo 的 execution adapter。

## 执行约束

- Hermes 侧可以有自己的 worker / runtime glue
- 但不得改写 canonical skill family 的阶段边界
- dashboard 编辑的过程件必须是 Hermes 真正消费的文件

因此 Hermes 侧也应遵守：

- Scene Design 真产物：`scene{X}-design.md`
- Scene Write 真产物：`ep{N}-scene{X}.md`
- 最终稿：`ep{N}.md`（确认收尾后生成）
