# 传播与衔接规则

> 本文件只保留跨 EP 衔接规则；阶段流程本身看 `pipeline-workflow.md`。

## EP 衔接检查

1. 读取 `skill_context/EP锚点.md`，确认上一 EP 出口状态
2. 本 EP 入口状态是否等于上一 EP 出口状态？
3. 不等 → 拒绝承接，要求修复上一 EP

---

## 下一 EP 启动规则

EP{N} 的 write-qc 完成后，流程在当前 EP 收尾处停止：
1. 输出 `ep{N}/workspace/anchor-update-draft.md`
2. 用户决定是否立即应用全局锚点更新
3. 若未应用，则下一次 `ignite EP{N+1}` 前必须先结清该 draft
4. draft 结清后，才能创建 `ep{N+1}/workspace/` 与 `ep{N+1}/user_input.md`

**EP{N+1} 入点 = 全局锚点的「当前 EP 状态」列，不是 EP{N} 快照。**
