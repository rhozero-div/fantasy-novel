---
name: fantasy-ep-spine
description: 幻想小说 EP 级脊骨设计。逐 EP 进行，输出 Scene 骨架 + 三套设定集（人物/技能/宝物）。当用户说「EP{N} spine」「EP{N} 脊骨」「创建骨架」时触发。**不**写正文，不做 QC，不拆分 Scene。
type: framework
pattern: sequential
category: creative
date_created: 2026-05-09
date_updated: 2026-05-13

---

# EP 脊骨设计

## 职责

- 输出 Scene 骨架（含每 Scene 核心位移）
- **生成/追加三套设定集**（人物/技能/宝物）
- **不含 Scene 拆分**：Scene 走 `fantasy-scene-design`
- **不写正文**：正文走 `fantasy-scene-write`

## 输入

| EP | 来源 |
|----|------|
| EP1 | `ep{N}/user_input.md` + `skill_context/人物锚点.md`（初始状态） |
| EP2+ | `ep{N}/user_input.md` + 全局锚点（`skill_context/人物锚点.md` / `技能锚点.md` / `宝物锚点.md` / `机体锚点.md` / `科技锚点.md` / `阵营锚点.md`）+ 可选 `skill_context/地域设定集/` |

> `user_input.md` 由用户以**自然语言**填写，不要求用户预先设计 Scene 或写结构化表格。Scene 骨架由 Spine 阶段负责派生。

**全局锚点文件：** `人物锚点.md` / `技能锚点.md` / `宝物锚点.md`。
题材为 `mecha` 时，额外包含 `机体锚点.md` / `科技锚点.md` / `阵营锚点.md`。

---

## 操作流程

### Step 1: 确定 EP 入口状态

**EP1：**
1. 读取 `skill_context/genre.md` 确定题材
2. 读取 `ep{N}/user_input.md`（题材/人物起点/剧情起点）
3. 读取 `skill_context/人物锚点.md`
4. 用 ep{N}/user_input.md 填充人物锚点的「入口状态」列

**EP2+：**
1. 读取 `skill_context/genre.md` 确定题材
2. 读取 `skill_context/人物锚点.md`，从「当前 EP 状态」列读取上一 EP 出口
3. 读取 `skill_context/技能锚点.md` + `宝物锚点.md`
4. 如题材为 `mecha`，额外读取 `skill_context/机体锚点.md` + `科技锚点.md` + `阵营锚点.md`
5. 读取 `skill_context/地域设定集/` — 检查有无比 EP{N} 更早升格的 NPC（如「EP3 升格 → 配角」），如有，将该角色纳入配角候选（升格角色作为配角处理，不需要 user_input 再次描述）
6. 检查 user_input 是否包含「升格XXX」指令，如有，按下方 Step 6.5 处理

> `地域设定集/` 与 NPC 升格机制属于 **optional subsystem**。若项目未启用该子系统，可跳过本步，spine 仍可独立工作。

> **注意**：EP 目录已在 pipeline Ignite 创建，锚点从全局读取，spine 不需要创建目录。

### Step 2: EP 级锚点读入

读取 `skill_context/人物锚点.md`（快照入口状态），用于 Step 3 弧线分析。

### Step 3: 弧线分析

- **弧线类型**：战力弧 / 心境弧 / 关系弧 / 认知弧
- **入口状态**：来自 Step 1
- **核心位移**：本 EP 必须完成的位移（A → B）
- **终点状态**：写入全局锚点的「当前 EP 状态」列

详见 `references/arc-analysis.md`

### Step 4: Scene 拆分

按**事件流**拆分 Scene：

- 一个完整的事件流（起→承→转→合）= 一个 Scene
- Scene 之间必须有叙事节奏的自然停顿点
- 每个 Scene 标注：
  - Scene 编号 + 标题
  - 弧光任务（这个 Scene 在 EP 弧光中的推进位置）
  - 涉及角色
  - 文戏 / 武戏 / 混合
  - **Combat Mode**（建议标注）：俯视型 / 平视型 / 仰视型，作为 Scene Design 的初始参考，不作为写作层直接合同

**题材扩展（`mecha`）：**
- 战斗 Scene 额外标注：**交战距离**（远距离炮战 / 中距离格斗 / 近距离白兵）、**战场环境**（宇宙 / 大气层内 / 城市 / 殖民地内部 / 地面）
- 机甲特有 Scene 类型：整备 Scene、出击 Scene、撤退 Scene

详见 `references/scene-rules.md`
题材特有规则详见 `references/mecha-spine-extensions.md`

### Step 5: 节点关系图

```
Scene 1 | 核心位移 | 文/武
Scene 2 | 核心位移 | 文/武
Scene 3 | 核心位移 | 文/武
```

### Step 6: 生成/更新设定集

Spine 负责生成或追加设定集文件。题材通用设定集（人物）始终生成；题材特定设定集按 `skill_context/genre.md` 判断。

文件写入 `skill_context/` 下对应目录。

**操作原则：**
- user_input 提到 → 生成或追加
- user_input 没提 → 跳过（宝物/技能/机体/科技/阵营设定集）
- **主角必须有**人物设定集，无论 user_input 是否明确

**文件位置：**

通用：
- 人物设定集：`skill_context/人物设定集/{角色名}.md`

题材 `fantasy` 特有：
- 技能设定集：`skill_context/技能设定集/{技能名}.md`
- 宝物设定集：`skill_context/宝物设定集/{宝物名}.md`

题材 `mecha` 特有：
- 机体设定集：`skill_context/机体设定集/{机体名}.md`
- 科技设定集：`skill_context/科技设定集/{科技名}.md`
- 阵营设定集：`skill_context/阵营设定集/{阵营名}.md`
- 舰艇设定集：`skill_context/舰艇设定集/{舰艇名}.md`（可选）

> **升格角色**：地域锚点里有「EP{N} 升格」标记的角色 → 当配角处理，应为其生成人物设定集。
> 这一规则仅在项目启用 `地域设定集/` 子系统时生效；未启用时可忽略。

**模板：**
- 人物设定集：参照 `fantasy-pipeline-full-write/references/project-skeleton/skill_context/人物设定集/角色名.md`
- 技能设定集：参照 `fantasy-pipeline-full-write/references/skill-design-template.md`
- 宝物设定集：参照 `fantasy-pipeline-full-write/references/treasure-design-template.md`
- 机体设定集：参照 `fantasy-pipeline-full-write/references/mecha-setting-templates/机体名.md`
- 科技设定集：参照 `fantasy-pipeline-full-write/references/mecha-setting-templates/科技名.md`
- 阵营设定集：参照 `fantasy-pipeline-full-write/references/mecha-setting-templates/阵营名.md`
- 舰艇设定集：参照 `fantasy-pipeline-full-write/references/mecha-setting-templates/舰艇名.md`

**Frontmatter（新建时必须包含）：**

```yaml
---
锚点:
  类型: 人物 / 技能 / 宝物 / 机体 / 科技 / 阵营 / 舰艇
  最近更新EP: EP{N}
---
```

**追加规则（EP2+）：**
- 已有设定集文件 → 读取 → 在「本 EP 弧光」/「进化路径」/「当前状态」章节追加本 EP 条目
- 更新 frontmatter 的 `最近更新EP` 为 EP{N}
- **不覆盖已有内容，只追加**
- **`##` 标题在人物锚点.md 中只用于角色名**，不得用于分类、注释或其他用途。dashboard 按此格式解析角色列表。

**设定集内部锚点的更新**：在 `fantasy-write-qc` Step 8（锚点更新阶段）统一处理，不在本 skill 做。

### Step 6.5: NPC 升格处理（如 user_input 有指令）

> 本节是 **optional subsystem**。只有项目显式使用 `skill_context/地域设定集/` 并允许 NPC 升格为配角时才执行。

读取 user_input，检查「升格XXX」或类似把NPC升格为配角的指令：

对每个升格指令，执行：

1. **更新地域锚点**：读取 `skill_context/地域设定集/{该NPC所属地域}.md`，在 NPC 名册条目里追加「EP{N} 升格为配角」
2. **新建人物设定集**：按模板新建 `skill_context/人物设定集/{角色名}.md`，frontmatter `最近更新EP: EP{N}`
3. **列为配角**：将该角色纳入 Spine 的配角列表

> 如果该角色已在 `人物锚点.md` 中（之前已升格过），跳过步骤 1 和 3，只更新人物设定集的履历。

### Step 7: 输出验证

> ⚠️ **必须完整通过 verification-checklist.md 全部条目，不得跳过。** 每条验证前加上 `[x]` 表示通过，全部通过后再输出 spine 文件。如果有任何一条未通过，暂停并输出「未通过项列表」，等待修复指引。

逐条通过 `references/verification-checklist.md`。全部通过 → 输出 `ep{N}/workspace/ep-spine.md`。

### Step 8: 输出计划出口状态（不写全局人物锚点）

将本 EP 的弧线分析结果（核心位移/计划终点状态）保留在 `ep{N}/workspace/ep-spine.md` 内，**不更新** `skill_context/人物锚点.md`。

> 全局人物锚点只记录已发生事实，不记录 planning state。
> `fantasy-write-qc` 在正文落地后只生成 `anchor-update-draft.md`；全局锚点需用户确认后才实际更新。

### Step 9: 通知完成

Spine 验证通过后，告知用户 Spine 已完成，并说明下一步进入 Spine QC。

> Spine 已完成，请查看 `ep{N}/workspace/ep-spine.md`。
>
> 下一步：进入 `fantasy-spine-qc`，输出 `ep{N}/workspace/spine-qc.md`。
>
> **spine-qc PASS 后**再由用户决定是否说「开始设计」。

---

## 输出

`ep{N}/workspace/ep-spine.md` → 用户确认 → `fantasy-scene-design` → `fantasy-scene-write`

---

## 注意事项

- **不预设 Chapter 数**。Chapter 是物理切分单元，在写作阶段由用户按篇幅手工切。
- **Scene 骨架划分在本 skill 完成**；`fantasy-scene-design` 只负责对既有 Scene 做立题/破题细化，不再拆分 Scene。
- **主角弧光为主线**，配角弧光可并行但从属于主线位移。
- **设定集是按需查询工具库**，不等同于锚点。锚点记录进度，设定集记录细节。
- **设定集 Basic Info 里不写 EP 相关内容**，EP 信息只出现在履历表里。
- **设定集 frontmatter `最近更新EP`**：含义是"最近有内容更新"，不是"首次出现"。首次出现EP 不记录在 frontmatter，只出现在「履历」表首行。

## 已知 Pitfall

### 不得擅自改写 user_input 的关键方向

**现象：** Spine 为了“优化叙事”，擅自忽略 user_input 中明确提出的关键事件/角色变化，或把用户未提出的次要线索升格为主节点。

**原因：** Spine 作者把自然语言输入当成可自由改写的大纲，而不是需要忠实覆盖的方向约束。

**正确做法：** Spine 可以把自然语言 user_input 整理为 Scene 骨架，但不得遗漏用户明确要求，也不得擅自改写故事走向。

### Spine 阶段应降低裁量

**现象：** Spine 作者容易以“优化叙事”为由，重排 user_input 中已明确给出的关键事件顺序，或把用户未提出的次要线索升格为主轴。

**影响：** 一旦擅自改写关键方向，就会偏离 user_input 的设计意图。

**正确做法：** Spine 阶段应尽量降低裁量，忠实执行 user_input；可以丰富每个 Scene 的内部节奏，但不能擅自改写关键事件顺序或故事走向。
