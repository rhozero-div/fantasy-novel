# opencode Orchestration

本目录承接 opencode 的执行层示例。

## 定位

- canonical protocol：repo 中各 skill 与文件契约
- opencode adapter：如何用 opencode 的任务派发能力执行这些协议

## 执行约束

- 不修改 canonical 文件契约
- Scene Design 以 `scene{X}-design.md` 为真实输出
- Scene Write 以 `ep{N}-scene{X}.md` 为真实输出
- 最终稿 `ep{N}.md` 只在用户确认收尾后生成

更具体的 task prompt 模板可在后续补充到本目录，不应再回写进 canonical protocol。
