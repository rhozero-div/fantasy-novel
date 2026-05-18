---
name: fantasy-spine-qc
description: 幻想小说 Spine 质量核验。接收 EP Spine 文档，扫描 Scene 完整性、弧光逻辑、节点关系图、出口状态一致性，输出结构化核验报告。触发：「QC Spine」「核验 Spine」「Spine 检查」。
type: protocol
pattern: sequential
category: creative
date_created: 2026-05-10
date_updated: 2026-05-13
---

# Spine 质量核验

## 身份

只核验，不创作。不修改 Spine 文档；允许输出 QC 报告文件，不改动被核验对象。

## 输入

1. EP Spine：`ep{N}/workspace/ep-spine.md`
2. EP user_input：`ep{N}/user_input.md`
3. 全局人物锚点：`skill_context/人物锚点.md`（验证入口状态）
4. 题材声明：`skill_context/genre.md`（确定 fantasy / mecha）

## 操作流程

### Step 1: 文件存在性确认

确认以下文件存在：

- `ep{N}/workspace/ep-spine.md`
- `ep{N}/user_input.md`

不完整 → 暂停，要求补充。

### Step 2: user_input 覆盖性核对

读取 `ep{N}/user_input.md`，提取用户明确提出的关键叙事要求（如核心事件、角色变化、禁区、地域要求）。

读取 `ep{N}/workspace/ep-spine.md`，检查 Spine 是否覆盖了这些要求，且没有擅自把用户未提出的关键方向升格为主节点。

检查重点：

- user_input 中明确要求的关键事件/方向，Spine 是否有对应 Scene 承接？
- user_input 中明确的禁区，Spine 是否避开？
- user_input 中提到的地域/角色变化，Spine 是否纳入？
- Spine 是否擅自新增会改变故事走向的关键节点？

**用户明确要求缺失 → FAIL。**
**Spine 擅自新增关键方向 → FAIL。**

> **判断规则**：user_input 是自然语言输入，不要求用户预先按 Scene 编号设计。Spine 的职责是把 user_input 整理为 Scene 骨架，但不得遗漏用户明确提出的方向，也不得擅自改写故事走向。
>
> 本 QC 只核验 Spine 是否忠实覆盖 user_input 的叙事要求；不涉及后续 write 阶段合并输出的 `ep{N}.md`。

### Step 3: EP 弧光完整性扫描

检查「EP 弧光」章节：

- 每角色是否都有入口状态、核心位移、终点状态？
- 核心位移是否在本 EP 内可完成？（不是跨 EP 的大坑）
- 主角弧光是否为主线？

**有角色缺失核心位移 → FAIL。**
**核心位移明显超出 EP 承载 → FAIL。**

### Step 4: Scene 完整性扫描

检查「场景结构」章节：

- 每个 Scene 是否都有：核心位移、涉及角色、文/武类型？
- Scene 之间是否有弧光状态的跳变？（不能连着两个 Scene 做同一件事）
- Scene 数量是否与 EP 核心位移匹配？（核心位移数 ≈ Scene 数）

**有 Scene 缺失核心位移 → FAIL。**
**相邻 Scene 弧光重叠 → FAIL。**

### Step 5: Combat Mode 标注质量扫描

检查每个 Scene 的 Combat Mode 标注（如为武戏）：

- 是否标注了俯视型/平视型/仰视型？
- 力量对比与 Scene 描述是否自洽？

**武戏 Scene 无 Mode 标注 → RECORD（建议，不阻塞）。**
**Mode 与描述明显矛盾 → FAIL。**

**题材扩展（`mecha`）：**
- 如为机甲武戏，检查交战距离（远/中/近）是否标注 → 未标注则 RECORD
- 如为机甲武戏，检查战场环境（宇宙/大气/城市/殖民地）是否标注 → 未标注则 RECORD

### Step 5.5: 机体设定集一致性扫描（仅 mecha）

读取 `skill_context/genre.md` 确认题材。如为 mecha，执行：

- Spine 中有出场的机体，是否存在对应的 `skill_context/机体设定集/` 文件？
- 首次出场的机体是否已有设定文件或在 Spine 中标注「新增设定待补」？

**出场机体缺少设定文件且未标注「待补」→ FAIL。**

### Step 6: 节点关系图扫描

检查「节点关系图」章节：

- 图中 Scene 顺序是否与场景结构章节一致？
- 节点关系是否反映了弧光跳变？

**节点关系图与正文不一致 → FAIL。**

### Step 7: 出口状态一致性扫描

检查「锚点传递」章节：

- 出口状态是否与「EP 弧光」章节的终点状态一致？
- 出口状态是否为下一 EP 留下了合理的入点？

**出口状态与终点状态矛盾 → FAIL。**

### Step 8: FAIL vs RECORD 判定

| 类型 | 检查项 | 处置 |
|------|--------|------|
| **FAIL** | user_input 明确要求未被 Spine 覆盖 | 阻塞 |
| **FAIL** | Spine 擅自新增关键方向 | 阻塞 |
| **FAIL** | 角色缺失核心位移 | 阻塞 |
| **FAIL** | 核心位移超出 EP 承载 | 阻塞 |
| **FAIL** | Scene 缺失核心位移 | 阻塞 |
| **FAIL** | 相邻 Scene 弧光重叠 | 阻塞 |
| **FAIL** | 节点关系图与正文矛盾 | 阻塞 |
| **FAIL** | 出口状态与终点状态矛盾 | 阻塞 |
| **FAIL** | 出场机体缺少设定文件（mecha 题材） | 阻塞 |
| RECORD | 武戏 Scene 无 Mode 标注 | 记入报告，不阻塞 |
| RECORD | 机甲武戏无交战距离标注 | 记入报告，不阻塞 |
| RECORD | 机甲武戏无战场环境标注 | 记入报告，不阻塞 |

**判定逻辑**：有任何 FAIL → Spine QC FAIL。只有 RECORD → Spine QC PASS。

### Step 9: 输出报告 + 等待用户确认

按以下格式输出（同时写入 `ep{N}/workspace/spine-qc.md`）：

```markdown
# EP{N} Spine QC 报告

## 检查结果

| 项目 | 结果 |
|------|------|
| user_input 覆盖性 | PASS / FAIL |
| EP 弧光完整性 | PASS / FAIL |
| Scene 完整性 | PASS / FAIL |
| Combat Mode 标注 | PASS / FAIL |
| 机体设定集一致性 | PASS / FAIL / N/A |
| 节点关系图 | PASS / FAIL |
| 出口状态一致性 | PASS / FAIL |

## FAIL 项（如有）

（逐条列出：位置 + 问题描述 + 修复建议）

## RECORD 项（如有）

（逐条列出：位置 + 观察）
```

**PASS 时：** 报告已写入 `ep{N}/workspace/spine-qc.md`。**流程停止在此**，等用户确认。

> **Scene 总数：{S}**
>
> 报告已输出。请查看 `spine-qc.md` 确认。
>
> **确认后说「开始设计」（Scene Design）继续。**
>
> **注意：Spine QC 完成后不得自动进入 Scene Design 阶段。**

**FAIL 时：** 输出 FAIL 报告后，停下来，等用户决定。

> Spine QC FAIL。请查看 `spine-qc.md` 报告。
>
> 修复后说「重新 Spine」继续。

---

## 已知断点

- **Step 9 PASS 时必须停下来等用户确认**：不得在本步骤内自动进入 Scene Design 阶段。必须等用户说「开始设计」后，才允许进入下一阶段。

---

## 注意事项

- 本 skill 只检查 Spine 设计文档，不检查 Scene Design 或正文写稿
- 不检查文笔，只检查结构逻辑
- Combat Mode 标注是建议级，不强制
- Scene Arc 类型判定在 Scene Design 阶段做，Spine 阶段不检查

---


