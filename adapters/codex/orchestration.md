# Codex Orchestration

本文件是 Codex 执行层说明，不是协议正文。

协议正文以 `fantasy-pipeline-full-write/SKILL.md` 为准；Codex 只负责按该协议调度。

## 基本原则

- Orchestrator 只调度，不创作
- QC 完成后不得自动进入下一创作阶段
- 各阶段通过文件系统传递产物
- Scene 是 design 与 write 的最小执行单元

## 推荐分工

- Spine：单 agent
- Spine QC：单 agent
- Scene Design：可按 Scene 拆分多个 agent
- Design QC：单 agent 汇总
- Scene Write：可按 Scene 拆分多个 agent
- Write QC：单 agent 汇总

## 真实写集合

- `scene{X}-design.md`：只允许对应的 design worker 写
- `ep{N}-scene{X}.md`：只允许对应的 write worker 写
- `write-qc.md`：只允许 QC worker 写
- `anchor-update-draft.md`：只允许 QC worker 写
- `ep{N}.md`：只允许最终收尾步骤写

禁止多个 agent 同时写同一个 merged file。
