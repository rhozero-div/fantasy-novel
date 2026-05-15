# Hermes Kanban 多 Agent 编排协议

> 本文件属于 **execution-layer implementation example**。不定义协议本体。
> 协议本体在 `../SKILL.md`（阶段边界/输入输出/停止点/推进权规则）。
>
> 本文件说明：如果你用 Hermes Kanban 驱动 fantasy pipeline，应该怎么做。

## 背景

Kanban 的 worker 派遣机制天然适合 fantasy pipeline 的阶段拆分——每个阶段独立 profile 执行，产物通过文件系统传递，任务间通过 `parent` 依赖链控制推进顺序。

但 pipeline 协议定义了一些 **非自动推进节点**（QC 完成后必须等用户确认），因此不能简单把所有阶段串成一条无环依赖链。必须用 **block / unblock 机制** 在确认节点处停下。

---

## Profile 映射

P0 依赖、N1 Pro、deepseek-v4-flash 作为 orchestrator profile，纯调度不创作。各阶段用对应的 specialist profile：

| 阶段 | Profile | 加载的 skill | 说明 |
|------|---------|-------------|------|
| Spine | `spine` | `fantasy-ep-spine` | 骨架设计 + 设定集生成 |
| Spine QC | `qc` | `fantasy-spine-qc` | 结构核验，FAIL 项阻塞 |
| Scene Design | `design` | `fantasy-scene-design` | 全量 Scene 立题/破题 |
| Design QC | `qc` | `fantasy-design-qc` | 只 RECORD 不 FAIL |
| Write | `write` | `fantasy-scene-write`, `references/prose-standards.md` | 正文写作 |
| Write QC | `qc` | `fantasy-write-qc` | 全稿核验 + 锚点草案 |

> **注意**：`spine` / `design` / `write` profile 必须有 `skills.external_dirs` 指向 `~/.hermes/skills`，否则 worker 找不到 skill。

---

## 全局约定

### 产物传递

所有阶段产物走文件系统，不走 task body 或 metadata。路径约定由 `pipeline-architecture.md` 统一定义：

```
ep{N}/
├── user_input.md
├── workspace/
│   ├── ep-spine.md
│   ├── spine-qc.md
│   ├── scene{X}-design.md
│   ├── scene-design-qc.md
│   ├── ep{N}.md           ← 写作中间稿
│   ├── anchor-update-draft.md
│   └── write-qc.md
└── ep{N}.md               ← 用户最终稿
```

### 产物文件存在性校验

每个阶段 worker 启动后应校验上游输出文件是否已存在。不存在则 `kanban_block(reason="缺少上游输入：{路径}")`，不自行创建。

### 锚点草案跨 EP 阻断

`anchor-update-draft.md` 是跨 EP 结算项。下一 EP 的 Spine 任务创建前，必须先检查并结清。
Orchestrator 在 create EP{N+1} Spine task 前，应检查上一 EP 的 `anchor-update-draft.md` 的 `applyStatus` 是否为 `applied`。

---

## 任务创建模式

### 标准依赖模式

Kanban 通过 `--parent` 链接实现依赖链。子任务进入 `WAITING ON DEPENDENCIES` 状态，当所有 parent 到达 `done` 后自动升为 `ready`。

```
T1 Spine (spine)
    ↓ auto
T2 Spine QC (qc), parents=[T1]     ← 可自动衔接
    ↓ (等用户确认「开始设计」)
T3 Scene Design (design), parents=[T2]
    ↓ auto
T4 Design QC (qc), parents=[T3]    ← 可自动衔接
    ↓ (等用户确认「开始写」)
T5 Write (write), parents=[T4]
    ↓ auto
T6 Write QC (qc), parents=[T5]     ← 可自动衔接
    ↓ (等用户「确认锚点草案」或「更新全局锚点」)
```

### 创建一对创作+QC 任务的骨骼代码

```python
import os, subprocess

def kanban_create(title, assignee, body="", parent=None):
    cmd = ["hermes", "kanban", "create", title, "--assignee", assignee,
           "--tenant", os.environ.get("HERMES_TENANT", "fantasy")]
    if body:
        cmd += ["--body", body]
    if parent:
        cmd += ["--parent", str(parent)]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip()

# 示例：创建 Spine + Spine QC 一对任务
spine_id = kanban_create(
    title="EP{N} Spine",
    assignee="spine",
    body="用户输入：ep{N}/user_input.md\n项目根：<project_root>"
)
qc_id = kanban_create(
    title="EP{N} Spine QC",
    assignee="qc",
    body="Spine 文件：ep{N}/workspace/ep-spine.md\nuser_input：ep{N}/user_input.md",
    parent=spine_id
)
```

---

## 阶段详情

### 阶段 A: Spine

| 项目 | 内容 |
|------|------|
| **Profile** | `spine` |
| **加载 skill** | `fantasy-ep-spine` |
| **输入** | `ep{N}/user_input.md`, `skill_context/人物锚点.md`, `skill_context/技能锚点.md`（EP2+）, `skill_context/宝物锚点.md`（EP2+） |
| **输出** | `ep{N}/workspace/ep-spine.md`, `skill_context/人物设定集/{角色名}.md`, `skill_context/技能设定集/{技能名}.md`, `skill_context/宝物设定集/{宝物名}.md` |
| **约束** | 不改变 user_input 的关键方向；不自增未提出的关键节点 |
| **创建时机** | 用户确认 user_input 后，Orchestrator 手动创建 |

**Task body 模板：**

```
加载 skill：fantasy-ep-spine
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
完成后调用 kanban_complete(summary="...")。
```

---

### 阶段 B: Spine QC

| 项目 | 内容 |
|------|------|
| **Profile** | `qc` |
| **加载 skill** | `fantasy-spine-qc` |
| **输入** | `ep{N}/workspace/ep-spine.md`, `ep{N}/user_input.md`, `skill_context/人物锚点.md` |
| **输出** | `ep{N}/workspace/spine-qc.md` |
| **行为** | 只核验不修改。FAIL 项阻塞管线，RECORD 项记入报告 |
| **依赖** | parent = Spine 任务 |
| **推进权** | **自动衔接**（创作 → QC 允许自动推进） |
| **完成后** | **不等于进入 Scene Design**。QC PASS 后必须等用户说「开始设计」。 |

**Task body 模板：**

```
加载 skill：fantasy-spine-qc
按该 skill 的 Step 1-9 执行 EP{N} Spine 核验。

输入文件：
  - ep{N}/workspace/ep-spine.md（依赖上游产物）
  - ep{N}/user_input.md
  - skill_context/人物锚点.md

输出文件：
  - ep{N}/workspace/spine-qc.md

行为：
- 只核验不修改
- FAIL 项 → kanban_block(reason="Spine QC FAIL: ...")
- 全部 PASS → kanban_complete(summary="Spine QC PASS")
- 注意：Spine QC PASS 后不等同于可以自动进入 Scene Design，需等待用户确认。
```

**QC FAIL 的处理：**

当 QC worker 发现 FAIL 项时，不应调用 `kanban_complete`，而应调用 `kanban_block` 告知用户具体问题：

```python
kanban_block(reason="Spine QC FAIL：user_input 中「XXX」未被 Spine 覆盖")
```

用户修复 Spine 后可手动标记当前 QC 任务为 blocked→failed，然后 Orchestrator 创建新的 Spine 任务（重跑）。QC 任务不覆盖，新任务从原 parent 的产物重新开始。

**QC PASS 后等待用户确认：**

Kanban 没有内置「等待用户确认」的自动挂起机制。在 `kanban_complete` 后，`T2 (Spine QC)` 变为 `done`，`T3 (Scene Design)` 从 `WAITING ON DEPENDENCIES` 自动升为 `ready`。

但 pipeline 协议要求 **QC 后不得自动进入下一创作阶段**。要满足这一约束，有两种实现方式：

**方案 A（推荐）：不创建下游任务 → 用户确认后再创建**

Orchestrator 不预创建 Scene Design 任务。Spine QC 任务完成后，Orchestrator 查看 QC 报告 → 向用户展示结果 → 等用户说「开始设计」→ 再手动 `kanban_create` Scene Design 任务。

这是最忠实于协议的做法，也是 Kanban "Dependency chain + human decision" 的自然模式。**会多出一次人工交互，但防止了自动推进导致的协议违背。**

**方案 B（进阶）：预创建 + blocked 等待**

Orchestrator 一次性创建全部 EP 任务链，但 Scene Design 任务以 `blocked` 状态创建。Spine QC PASS 后，用户点击 unblock → Scene Design 自动变成 `ready`。

```python
design_id = kanban_create(
    title="EP{N} Scene Design",
    assignee="design",
    body="...",
    parent=qc_id,
    # 任务刚刚创建时为 todo，但 parent(qc_id) 完成后自动变成 ready
)
# 可以用 hermes kanban block <design_id> "等待用户确认开始设计" 来手动阻断
# 用户确认后 hermes kanban unblock <design_id>
```

**推荐方案 A**——更简单、更安全、更符合协议精神。

---

### QC PASS 后的用户确认模式

所有 QC 阶段（Spine QC / Design QC / Write QC）遵循同一个模式：

| 阶段 | QC 完成后 | 用户输入 | 下一阶段 |
|------|----------|---------|---------|
| Spine QC → Scene Design | 展示 QC 报告 | 「开始设计」「开始 design」 | 创建 Scene Design 任务 |
| Design QC → Write | 展示 QC 报告 | 「开始写」「开始 write」 | 创建 Write 任务 |
| Write QC → Ignite EP{N+1} | 展示 QC 报告 + 锚点草案 | 「确认锚点草案」/「更新全局锚点」 | 创建下一 EP |

---

### 阶段 C: Scene Design

| 项目 | 内容 |
|------|------|
| **Profile** | `design` |
| **加载 skill** | `fantasy-scene-design` |
| **输入** | `ep{N}/workspace/ep-spine.md`, `ep{N}/user_input.md`, `skill_context/人物锚点.md`, `skill_context/技能锚点.md`, `skill_context/宝物锚点.md`, `skill_context/写作纲领.md` |
| **输出** | `ep{N}/workspace/scene1-design.md` 到 `scene{S}-design.md`（全量 S 个） |
| **约束** | 不创作正文；不拆分 Scene；每份设计包含 Mode / Arc / 弧光位移 / 出口状态 |
| **创建时机** | 用户说「开始设计」后，Orchestrator 手动创建 |

**Task body 模板：**

```
加载 skill：fantasy-scene-design
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
完成后调用 kanban_complete(summary="完成 S 个 Scene 设计")。
```

**Scene 数量与 worker 超时：**

如果 S > 8，建议拆分为多个 Scene Design 任务并行执行（第一个负责 scene1-4，第二个负责 scene5-8），避免单 worker 超时。两个任务彼此独立，但 QC 任务以所有 design 任务为 parent。

```python
# 拆分示例（S=10）
d1 = kanban_create("EP{N} Scene Design (1-5)", "design", body="...", parent=qc_id)
d2 = kanban_create("EP{N} Scene Design (6-10)", "design", body="...", parent=qc_id)
qc_design = kanban_create("EP{N} Design QC", "qc", body="...", parent=[d1, d2])
```

---

### 阶段 D: Design QC

| 项目 | 内容 |
|------|------|
| **Profile** | `qc` |
| **加载 skill** | `fantasy-design-qc` |
| **输入** | `ep{N}/workspace/ep-spine.md`, `ep{N}/workspace/scene1-design.md` 到 `scene{S}-design.md`, `ep{N}/user_input.md` |
| **输出** | `ep{N}/workspace/scene-design-qc.md` |
| **行为** | 一次扫描全部 Scene Design，只 RECORD 不 FAIL |
| **依赖** | parent = 全部 Scene Design 任务 |
| **推进权** | **自动衔接**（创作 → QC 允许自动推进） |
| **完成后** | **不等于进入 Write**。QC 完成后必须等用户说「开始写」。|

**Task body 模板：**

```
加载 skill：fantasy-design-qc
按该 skill 的 Step 1-8 执行 EP{N} Scene Design 核验。

输入文件：
  - ep{N}/workspace/ep-spine.md
  - ep{N}/workspace/scene1-design.md（至 scene{S}-design.md）
  - ep{N}/user_input.md

输出文件：
  - ep{N}/workspace/scene-design-qc.md

行为：只 RECORD 不 FAIL。完成后调用 kanban_complete(summary="设计 QC 完成，RECORD 项详见报告")。

注意：QC 完成后不等同于可以自动进入写作，需等待用户确认。
```

---

### 阶段 E: Write

| 项目 | 内容 |
|------|------|
| **Profile** | `write` |
| **加载 skill** | `fantasy-scene-write`, `fantasy-pipeline-full-write/references/prose-standards.md` |
| **输入** | `ep{N}/workspace/ep-spine.md`, `ep{N}/workspace/scene{X}-design.md`, `skill_context/写作纲领.md`, `skill_context/地域设定集/` |
| **输出** | `ep{N}/workspace/ep{N}.md`（中间稿，全部 Scene 合并） |
| **约束** | 一口气写完所有 Scene 不中断；遵守 `prose-standards.md` 第 2 章禁止句式 |
| **创建时机** | 用户说「开始写」后，Orchestrator 手动创建 |

**Task body 模板：**

```
加载 skill：fantasy-scene-write
按该 skill 的 Step 1-5 执行 EP{N} 全部 Scene 写作。

输入文件：
  - ep{N}/workspace/ep-spine.md
  - ep{N}/workspace/scene1-design.md（至 scene{S}-design.md）
  - skill_context/写作纲领.md
  - skill_context/地域设定集/（如存在）

输出文件：
  - ep{N}/workspace/ep{N}.md（中间稿，所有 Scene 合并）

约束：
- 一口气写完，中间不停止
- 写作时严格避免 prose-standards.md 第 2 章的 8 类禁止句式
- 每完成一个 Scene 后快速回检一次

完成后调用 kanban_complete(summary="EP{N} 正文写作完成")。
```

---

### 阶段 F: Write QC

| 项目 | 内容 |
|------|------|
| **Profile** | `qc` |
| **加载 skill** | `fantasy-write-qc` |
| **输入** | `ep{N}/workspace/ep{N}.md`, `ep{N}/workspace/ep-spine.md`, `ep{N}/workspace/scene{X}-design.md`, `ep{N}/user_input.md` |
| **输出** | `ep{N}/workspace/write-qc.md`, `ep{N}/workspace/anchor-update-draft.md` |
| **后续** | 将 `ep{N}/workspace/ep{N}.md` 复制到 `ep{N}/ep{N}.md`（最终稿） |
| **行为** | 只 RECORD 不 FAIL |
| **依赖** | parent = Write 任务 |
| **推进权** | **自动衔接**（创作 → QC 允许自动推进） |
| **完成后** | **不等于进入下一 EP**。等待用户「确认锚点草案」/「更新全局锚点」|

**Task body 模板：**

```
加载 skill：fantasy-write-qc
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

完成后调用 kanban_complete(summary="EP{N} 全稿 QC 完成，anchor-update-draft 已生成。等待用户确认锚点草案或更新全局锚点。")
```

---

## Orchestrator 职责

用 deepseek-v4-flash profile 作为 Orchestrator，职责如下：

### 1. 处理用户指令

| 用户说 | Orchestrator 行为 |
|--------|------------------|
| `ignite EP{N}` | 创建 EP 目录 + user_input 模板 → 引导用户填写 → 展示并确认 → 创建 Spine 任务 |
| `EP{N} spine` | 如 user_input 尚未确认，先展示。已确认则直接创建 Spine 任务 |
| `开始设计` | 检查 Spine QC 是否已完成并展示结果 → 创建 Scene Design 任务 |
| `开始写` | 检查 Design QC 是否已完成并展示结果 → 创建 Write 任务 |
| `确认锚点草案` / `更新全局锚点` | 根据用户指令更新 reviewStatus / applyStatus，写回全局锚点 |
| `ignite EP{N+1}` | 先检查上一 EP 锚点草案是否结清 → 结清后才继续 |

### 2. EP 内的任务创建顺序

```
（用户确认 user_input 后）
T1  create: EP{N} Spine (spine)
    └─ T2  create: EP{N} Spine QC (qc) [parent=T1]

（T2 完成后，展示 QC 报告，等用户说「开始设计」）

T3  create: EP{N} Scene Design (design)   [parent=T2]
T3b (可选) create: EP{N} Scene Design part2 (design) [parent=T2]
    └─ T4  create: EP{N} Design QC (qc) [parent=T3, T3b]

（T4 完成后，展示 QC 报告，等用户说「开始写」）

T5  create: EP{N} Write (write) [parent=T4]
    └─ T6  create: EP{N} Write QC (qc) [parent=T5]

（T6 完成后，展示 QC 报告 + anchor-update-draft，等用户确认锚点）

Pipeline 结束。
```

### 3. 跨 EP 锚点草案结算检查

创建 `ignite EP{N+1}` Spine 任务前，Orchestrator 必须：

1. 检查 `ep{N}/workspace/anchor-update-draft.md` 是否存在
2. 如果存在，读取 `applyStatus` 字段
3. 如果 `applyStatus != "applied"`，展示给用户，要求先结清
- 4. 用户说「更新全局锚点」后，执行写回 → 更新 `applyStatus=applied`
5. 全部完成后，才允许创建 EP{N+1} Spine 任务

---

## 注意事项

### 不要在 QC 任务体内创建下游任务

QC skill 的职责是核验，不是调度。**QC worker 不应调用 `kanban_create` 创建下一阶段任务。** 推进权属于用户，由 Orchestrator 在收到用户指令后创建。

唯一的例外是 Write QC 完成后的锚点更新确认——但那也是 QC 报告展示 + 等待用户确认，而非自动创建下一 EP。

### 并行 Scene Design 的依赖处理

如果 S > 8，拆分为多个 Scene Design 任务并行。QC 任务以所有 design 任务为 parent：

```python
d1 = kanban_create("EP{N} Scene Design (1-4)", "design", body="...", parent=qc_id)
d2 = kanban_create("EP{N} Scene Design (5-8)", "design", body="...", parent=qc_id)
# Design QC 等待两个 parent 都完成
qc_design = kanban_create("EP{N} Design QC", "qc", body="...", parents=[d1, d2])
```

### Worker 超时处理

单个 Scene 较多的写作任务可能超时。Write 阶段 task body 应预估 EP 长度，如果预期 >2000 字，建议在 body 里提示 worker 注意 heartbeat：

```
注意：本任务正文量较大，写作过程中请定期调用 kanban_heartbeat(note="Scene X/10 完成")
避免被 STALE_LOCK 回收。
```

### 任务重跑与产物清理

如果某个任务因 QC FAIL 需要重跑：

1. QC worker 调用 `kanban_block` 说明原因
2. Orchestrator 查看后，archive 原 QC 任务
3. 创建新的创作任务（如新的 Spine 任务），assignee 与原创作 profile 一致
4. **不覆盖原 QC 任务**——创建新 QC 任务作为新创作任务的 parent

产物文件是否需要清理？原则：新创作任务会覆盖同名输出文件，无需显式删除旧文件。但如果旧文件中有不应保留的中间产物，应由任务体约定清理方式。

### 硬锁与 STALE_LOCK

Kanban worker 有锁机制。如果 worker 因模型调用超时或进程挂起而触发 STALE_LOCK，检查 worker log 确认输出文件是否已写入：

```bash
hermes kanban log <task_id> | grep -E "write_file|Write to"
```

如果输出文件已存在且完整，手动 `kanban_complete` 标记完成；不完整则 recreate 任务。

---

## 推荐工作流总结

```
用户确认 user_input
  └─ Orchestrator kanban_create EP{N} Spine
      └─ (自动) EP{N} Spine QC
          └─ Orchestrator 展示 QC 报告 → 等用户「开始设计」
              └─ Orchestrator kanban_create EP{N} Scene Design
                  └─ (自动) EP{N} Design QC
                      └─ Orchestrator 展示 QC 报告 → 等用户「开始写」
                          └─ Orchestrator kanban_create EP{N} Write
                              └─ (自动) EP{N} Write QC
                                  └─ Orchestrator 展示 QC 报告 + 锚点草案
                                      └─ 等用户「确认锚点草案」或「更新全局锚点」
                                          └─ 检查结清 → ignie EP{N+1}
```

所有圆角自动推进步骤符合 pipeline 协议（创作 → QC 允许自动衔接）。
所有方角停止点对应协议定义的「QC 后不自进下一创作阶段」规则。
