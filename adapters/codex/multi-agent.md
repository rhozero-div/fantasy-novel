# Codex Multi-Agent

本文件记录 Codex 下的推荐多 agent 形态。

## 推荐模式

1. Spine 与各层 QC 保持单 agent
2. Scene Design 可按 Scene 并行
3. Scene Write 可按 Scene 并行
4. 最终稿只在用户确认收尾后生成

## 为什么不在写作阶段直接合并

- dashboard 允许用户直接编辑过程件
- 过程件必须等于真实执行输入
- 若先生成可编辑的合并稿，容易与 Scene 级真实产物脱钩

因此 Codex 侧默认约定：

- 过程层真相：`scene{X}-design.md` 与 `ep{N}-scene{X}.md`
- 发布层真相：`ep{N}.md`

## Scene Write 的建议

若使用多 agent 写作，建议采用两段式：

1. 每个 worker 只写自己的 `ep{N}-scene{X}.md`
2. 最终收尾步骤顺序通读并生成 `ep{N}.md`

这样既降低 context 压力，也能把整章收束权留到最后确认节点。
