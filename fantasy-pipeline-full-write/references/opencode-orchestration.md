# opencode 多 Agent 派遣协议

> 本文件属于 **execution-layer implementation example**。不定义协议本体。
> 协议本体在 `../SKILL.md`（阶段边界/输入输出/停止点/推进权规则）。
>
> 本文件说明：如果你用 opencode 的 `task` 工具驱动 fantasy pipeline，应该怎么做。

## task 工具签名

在 opencode 中，Orchestrator Agent 通过 `task` 工具派发子任务：

```
task(
  description: "简短描述",
  prompt: "完整指令文本",
  subagent_type: "general"
)
```

- `description` — 调度日志用，简短标识（如「EP1 Spine」）
- `prompt` — 完整指令，包含 skill 加载、输入路径、输出路径、约束条件
- `subagent_type` — 固定 `"general"`
- 每个 sub-agent 拥有**独立的对话上下文**，不共享 Orchestrator 的 context

## 阶段间传递协议

- 所有产物通过文件系统传递（`ep{N}/workspace/`）
- sub-agent 执行完成后返回一条结构化文本消息（JSON）
- Orchestrator 根据返回消息判断是否继续下一阶段

## 结构化返回消息格式

所有 sub-agent 完成任务后按以下格式返回：

```json
{"status":"ok","产出":["ep{N}/workspace/..."],"摘要":"完成 X 个 Scene 设计","问题":[]}
{"status":"fail","产出":[],"摘要":"缺少输入文件","问题":["ep-spine.md 不存在"]}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| status | "ok" / "fail" | 任务是否成功完成 |
| 产出 | string[] | 本任务写入的文件路径列表 |
| 摘要 | string | 一段文字总结 |
| 问题 | string[] | 问题列表（仅 fail 时使用） |

---

## 阶段 A: Spine

**目标 skill：** `fantasy-ep-spine`

| 项目 | 内容 |
|------|------|
| **输入** | `ep{N}/user_input.md`, `skill_context/人物锚点.md`, `skill_context/技能锚点.md`（EP2+）, `skill_context/宝物锚点.md`（EP2+） |
| **输出** | `ep{N}/workspace/ep-spine.md`, `skill_context/人物设定集/{角色名}.md`, `skill_context/技能设定集/{技能名}.md`（如有）, `skill_context/宝物设定集/{宝物名}.md`（如有） |
| **约束** | 不改变 user_input 的关键方向；不自增未提出的关键节点；Scene 拆分忠实跟随 user_input 叙事节点 |

**task prompt 模板：**

```
请加载 skill「fantasy-ep-spine」。
按该 skill 的 Step 1-9 执行 EP{N} 骨架设计。
输入文件：
  - ep{N}/user_input.md
  - skill_context/人物锚点.md
  - skill_context/技能锚点.md（如存在）
  - skill_context/宝物锚点.md（如存在）
输出文件：
  - ep{N}/workspace/ep-spine.md
  - skill_context/人物设定集/（新建或追加）
  - skill_context/技能设定集/（如有）
  - skill_context/宝物设定集/（如有）
约束：只执行结构整理，不新增用户未给出的关键方向。
完成后以 JSON 格式返回结果。
```

---

## 阶段 B: Spine QC

**目标 skill：** `fantasy-spine-qc`

| 项目 | 内容 |
|------|------|
| **输入** | `ep{N}/workspace/ep-spine.md`, `ep{N}/user_input.md`, `skill_context/人物锚点.md` |
| **输出** | `ep{N}/workspace/spine-qc.md` |
| **行为** | 只核验不修改。FAIL 项阻塞管线，RECORD 项记入报告 |

**task prompt 模板：**

```
请加载 skill「fantasy-spine-qc」。
按该 skill 的 Step 1-9 执行 EP{N} Spine 核验。
输入文件：
  - ep{N}/workspace/ep-spine.md
  - ep{N}/user_input.md
  - skill_context/人物锚点.md
输出文件：
  - ep{N}/workspace/spine-qc.md
完成后以 JSON 格式返回结果。
```

---

## 阶段 C: Scene Design

**目标 skill：** `fantasy-scene-design`

| 项目 | 内容 |
|------|------|
| **输入** | `ep{N}/workspace/ep-spine.md`, `ep{N}/user_input.md`, `skill_context/人物锚点.md`, `skill_context/技能锚点.md`, `skill_context/宝物锚点.md`, `skill_context/写作纲领.md` |
| **输出** | `ep{N}/workspace/scene1-design.md` 到 `scene{S}-design.md`（全量 S 个） |
| **约束** | 不创作正文；不拆分 Scene；每个 Scene 的设计包含 Mode / Arc / 弧光位移 / 出口状态 |

**task prompt 模板：**

```
请加载 skill「fantasy-scene-design」。
按该 skill 的 Step 1-5 执行 EP{N} 全部 Scene 设计。
输入文件：
  - ep{N}/workspace/ep-spine.md（从该文件获取 Scene 总数 S）
  - ep{N}/user_input.md
  - skill_context/人物锚点.md
  - skill_context/技能锚点.md
  - skill_context/宝物锚点.md
  - skill_context/写作纲领.md
输出文件（全部 S 个）：
  - ep{N}/workspace/scene1-design.md
  - ep{N}/workspace/scene2-design.md
  - ...（直到 scene{S}-design.md）
约束：只设计不写作；不拆分 Scene；每份设计必须包含 Mode / Arc / 位移 / 出口状态。
完成后以 JSON 格式返回结果。
```

---

## 阶段 D: Scene Design QC

**目标 skill：** `fantasy-design-qc`

| 项目 | 内容 |
|------|------|
| **输入** | `ep{N}/workspace/ep-spine.md`, `ep{N}/workspace/scene1-design.md` 到 `scene{S}-design.md`, `ep{N}/user_input.md` |
| **输出** | `ep{N}/workspace/scene-design-qc.md` |
| **行为** | 一次扫描全部 Scene Design，只 RECORD 不 FAIL |

**task prompt 模板：**

```
请加载 skill「fantasy-design-qc」。
按该 skill 的 Step 1-8 执行 EP{N} Scene Design 核验。
输入文件：
  - ep{N}/workspace/ep-spine.md
  - ep{N}/workspace/scene1-design.md（至 scene{S}-design.md）
  - ep{N}/user_input.md
输出文件：
  - ep{N}/workspace/scene-design-qc.md
完成后以 JSON 格式返回结果。
```

---

## 阶段 E: 写作

**目标 skill：** `fantasy-scene-write`

| 项目 | 内容 |
|------|------|
| **输入** | `ep{N}/workspace/ep-spine.md`, `ep{N}/workspace/scene1-design.md` 到 `scene{S}-design.md`, `skill_context/写作纲领.md`, `skill_context/地域设定集/`（如存在） |
| **输出** | `ep{N}/workspace/ep{N}.md`（中间稿，全部 Scene 合并） |
| **约束** | 一口气写完所有 Scene 不中断；写作时避免 `prose-standards.md` 定义的 8 类禁止句式；每完成一个 Scene 快速回检 |

**task prompt 模板：**

```
请加载 skill「fantasy-scene-write」。
按该 skill 的 Step 1-5 执行 EP{N} 全部 Scene 写作。
输入文件：
  - ep{N}/workspace/ep-spine.md（从该文件获取 Scene 总数 S）
  - ep{N}/workspace/scene1-design.md（至 scene{S}-design.md）
  - skill_context/写作纲领.md
  - skill_context/地域设定集/（如存在）
输出文件：
  - ep{N}/workspace/ep{N}.md（中间稿，所有 Scene 合并）
约束：一口气写完，中间不停止；写作时严格避免 prose-standards.md 第 2 章的 8 类禁止句式。
完成后以 JSON 格式返回结果。
```

---

## 阶段 F: 全稿 QC

**目标 skill：** `fantasy-write-qc`

| 项目 | 内容 |
|------|------|
| **输入** | `ep{N}/workspace/ep{N}.md`, `ep{N}/workspace/ep-spine.md`, `ep{N}/workspace/scene{X}-design.md`, `ep{N}/user_input.md` |
| **输出** | `ep{N}/workspace/write-qc.md`, `ep{N}/workspace/anchor-update-draft.md` |
| **后续** | 将 `ep{N}/workspace/ep{N}.md` 复制到 `ep{N}/ep{N}.md`（最终稿） |
| **行为** | 只 RECORD 不 FAIL；全稿 QC 完成后通知用户确认锚点更新 |

**task prompt 模板：**

```
请加载 skill「fantasy-write-qc」。
按该 skill 的 Step 1-9 执行 EP{N} 全稿核验。
输入文件：
  - ep{N}/workspace/ep{N}.md
  - ep{N}/workspace/ep-spine.md
  - ep{N}/workspace/scene{X}-design.md
  - ep{N}/user_input.md
输出文件：
  - ep{N}/workspace/write-qc.md
  - ep{N}/workspace/anchor-update-draft.md
后续：将 ep{N}/workspace/ep{N}.md 复制到 ep{N}/ep{N}.md
完成后以 JSON 格式返回结果。
```

---

## Orchestrator 伪代码

```
function run_ep(N):
    # Spine
    msg1 = task("EP{N} Spine", SPINE_PROMPT, "general")
    if msg1.status != "ok": return

    # Spine QC
    msg2 = task("EP{N} Spine QC", SPINE_QC_PROMPT, "general")
    if msg2 has FAIL: stop  # 等用户决定

    wait_user("开始设计?")  # 停止点

    # Scene Design
    msg3 = task("EP{N} Scene Design", DESIGN_PROMPT, "general")
    if msg3.status != "ok": return

    # Design QC
    msg4 = task("EP{N} Design QC", DESIGN_QC_PROMPT, "general")

    wait_user("开始写?")  # 停止点

    # Write
    msg5 = task("EP{N} Write", WRITE_PROMPT, "general")
    if msg5.status != "ok": return

    # Write QC
    msg6 = task("EP{N} Write QC", WRITE_QC_PROMPT, "general")

    wait_user("更新全局锚点?")  # 停止点
```

所有 `wait_user` 停止点对应 pipeline SKILL.md 的推进权规则（QC 完成后不自进下一创作阶段）。
