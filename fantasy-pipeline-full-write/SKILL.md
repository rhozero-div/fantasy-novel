---
name: fantasy-pipeline-full-write
description: 幻想小说全写 Pipeline——ignite → Spine → Scene Design（全量） + QC → 用户手动触发写作 → 一口气写完 → 全稿QC（只RECORD） → 生成锚点更新草案 → 用户确认后更新全局锚点 → Pipeline结束。
type: protocol
pattern: sequential
category: creative
date_created: 2026-05-10
date_updated: 2026-05-14
---

## 多 Agent 协作建议

> 完整 EP pipeline 较长，拆分成专项 agent 可以提高质量、降低单次任务复杂度。
> 本节为设计建议，不绑定特定实现。

### 分工原则

> 每个阶段独立委派 Agent 执行，不在同一 Agent 内串行完成所有阶段。

| 阶段 | 职责 | 建议约束 | 备注 |
|------|------|---------|------|
| Orchestrator | 总调度，点火后驱动各阶段衔接 | 只调度，不创作 | 驱动 pipeline 流转 |
| Spine | 按 user_input 输出 Scene 骨架+设定集 | 忠实于输入，减少叙事裁量 | 独立 agent |
| Scene Design | 逐 Scene 完成立题/破题 | 按 Spine 规格执行 | 独立 agent |
| 写作 | 完整输出 EP 内所有 Scene | 按 Design 执行 | 独立 agent |

### 注意事项

- Spine 阶段如果 agent 裁量过多，可能偏离 user_input 设计意图。建议在该阶段的 prompt 里明确「只执行结构整理，不新增用户未给出的关键方向」。
- 各阶段之间有确认节点（见各阶段说明），建议保持不变，以确保人类监督。
- 各 agent 之间通过文件系统（workspace/）传递产物，不依赖内存。

### 待核实

- 各主流 agent 在「减少裁量」约束下的实际表现差异（需实测）
- Spine 阶段最合适的 prompt 结构（待补充案例）
- 多 agent 并行执行时的文件锁/冲突处理（待补充）

### Orchestration 执行

> 主 skill 只定义阶段边界、输入输出、停止点与确认节点。
> 任何特定调度器、worker 协议、平台命令或个人运行安排都属于执行层，不进入主 skill 的规范性正文。
> 如需具体实现示例，放入 `references/`，并明确标注为可替换实现，而不是协议本体。

---

## 身份

Pipeline 协议总控。负责定义 ignite / spine / design / write / QC 的阶段边界、输入输出、停止点与推进权规则；具体创作与核验由下游 skill 执行。

---

## 四段式结构

| 阶段 | 触发 | 产出 | 确认节点 |
|------|------|------|---------|
| **① Ignite** | `ignite fantasy` / `ignite EP{N}` | 锚点 + user_input | 展示结果 → 用户确认 |
| **② Spine** | `EP{N} spine` 等 | Scene骨架 + 三套设定集 | spine-qc PASS → 用户确认 |
| **③ Scene Design** | `开始设计` 等 | scene{X}-design.md（全量） | design-qc → 用户手动触发写作 |
| **④ 写作** | `开始写` 等 | ep{N}.md + anchor-update-draft.md | write-qc → 用户确认更新锚点 / 下次 ignite 前强制结清 → **Pipeline结束** |

> **锚点**在 Ignite 生成。**设定集**在 Spine 生成（人物/技能/宝物）。

---

## 推进权规则

pipeline 的推进规则统一如下：

| 路径 | 是否允许自动推进 |
|------|------------------|
| Spine → spine-qc | 允许 |
| spine-qc → Scene Design | 不允许 |
| Scene Design → design-qc | 允许 |
| design-qc → Write | 不允许 |
| Write → write-qc | 允许 |
| write-qc → Ignite EP{N+1} | 不允许 |

**总原则：**
- 创作阶段完成后，可以自动衔接本阶段 QC。
- **停止点统一在 QC 完成后。**
- QC 完成后，不得自动进入下一创作阶段。
- 下一创作阶段只能由用户显式触发（如「开始设计」「开始写」）。

---

## 完整流程

```
ignite EP1（新建项目）
    ↓ 用户填写 ep1/user_input.md → Agent 读取原文并生成 skill_context
    ↓ 用户确认

EP1 Spine: fantasy-ep-spine → ep1/workspace/ep-spine.md
    ↓ 自动进入 spine-qc → 生成 ep1/workspace/spine-qc.md
    ↓ 用户检查确认后，手动说「开始设计」

EP1 Scene Design: fantasy-scene-design → ep1/workspace/scene{X}-design.md（全量）
    ↓ 自动进入 Scene Design QC → 生成 ep1/workspace/scene-design-qc.md（只 RECORD）
    ↓ 用户手动触发写作

EP1 写作: fantasy-scene-write（一口气写完全部 Scene，合并输出 → ep1/workspace/ep1.md）
    ↓ 自动进入全稿 QC（只 RECORD，输出 ep1/workspace/write-qc.md）
    ↓ 生成 ep1/workspace/anchor-update-draft.md（按对象级变更单元组织）
    ↓ 用户可先确认「确认锚点草案」完成 review；只有真正执行「更新全局锚点」并写回全局后，才算 apply 完成
    ↓ 若未写回，则下次 ignite 前强制结清

EP1 完成

继续 EP{N}（现有项目，用户说 ignite EP{N}）
    → 先检查上一 EP 是否存在未结清的 anchor-update-draft.md
    → 读取 skill_context/EP锚点.md 了解进展
    → 创建 ep{N}/workspace/ + user_input 模板
    → 用户填写 ep{N}/user_input.md → Agent 读取原文并展示给用户确认
    → 用户确认 → EP{N} Spine...
```

---

## T0 点火（ignite）

> 用户只需要填写 `user_input.md` 并用自然语言描述项目，Agent 自动生成锚点文件。

### Step 1: 判断是新建还是继续

检查项目目录 `<project_root>` 是否已存在。存在则进入“继续现有项目”流程；不存在则进入“新建项目”流程。

**新建项目**（目录不存在）→ 继续 Step 2。

**继续现有项目**（目录存在）→ 询问用户：

> 项目已存在。你想继续写第几章？
>
> （可以告诉我要继续的 EP 编号，比如「EP3」，我会读取当前的锚点文件，了解故事进展。）

用户回复 EP{N} 后，直接跳到「继续 EP{N}」流程（见本 skill 最后「继续 EP{N}」章节）。

---

**新建项目**（目录不存在）执行以下骨架创建：

创建以下骨架：

- `<project_root>/skill_context/`
- `<project_root>/ep1/workspace/`
- `<project_root>/ep1/user_input.md`（由模板生成）

→ 继续 Step 2（询问描述）。

### Step 2: 引导用户填写 `ep1/user_input.md`

> 请直接打开 `ep1/user_input.md` 填写。
>
> 只需要用自然语言把你想到的内容写进去，不需要设计 Scene，不需要写结构化表格。
>
> `user_input.md` 保持用户原始输入，不做 Agent 改写。
>
> 写好后告诉我「写好了」或「确认」，我再继续读取并据此生成锚点文件。

### Step 3: Agent 自动生成锚点文件

**3.1** 读取模板文件（`references/project-skeleton/skill_context/` 下所有锚点模板）。

**3.2** 从 `ep1/user_input.md` 提取信息，**自动生成**以下锚点文件（覆盖模板内容）。

| 文件 | 来源 |
|------|------|
| `skill_context/人物锚点.md` | 从描述中识别角色 → 填充角色列表（弧线类型/入口状态）。**`##` 标题只用于角色名**，不可用于分类或注释 |
| `skill_context/技能锚点.md` | 从描述中识别技能 → 填充技能锚点表 |
| `skill_context/宝物锚点.md` | 从描述中识别宝物 → 填充宝物锚点表 |
| `skill_context/writing-rules.md` | 填充分类+命名风格（自动填写）；提取禁区填入；风格偏好留空 |
| `skill_context/EP锚点.md` | 由骨架模板生成；Ignite 阶段保持留空，待本 EP 完成并经用户确认后再写入出口状态 |

> **设定集（人物/技能/宝物）不在 Ignite 生成**，由 Spine Step 6 负责。

→ 展示 `skill_context/` 全部内容给用户确认，并附言：

> 这是我从你的描述中提取的结果。请确认有没有遗漏或错误。
> 可以直接说"没问题"继续，也可以告诉我需要改什么。
>
> **EP锚点.md** 不填充内容（留空），EP1 完成后由 Agent 写入出口状态。

**3.3** `ep1/user_input.md` 在骨架创建时已一并生成（见 Step 1）。

### Step 4: 等待用户确认

> skill_context 已生成，请查看上面的文件。
>
> 确认没问题后，说「EP1 Spine」继续。
>
> 如果有要改的，直接告诉我。

---

## EP{N} Scene Design + QC

**用户说「开始设计」后，执行以下工作：**

- 读取 Spine `ep{N}/workspace/ep-spine.md`，提取 Scene 总数 S
- 生成 `scene1-design.md` 到 `sceneS-design.md`（全量，一口气写完）
- `scene{X}-design.md` 是 **write-time contract**：必须显式写出供写作层直接执行的 Mode / Arc / 位移 / 收束信息，而不只是分类标签
- `combat-mode.md` 与 `scene-arc.md` 视为 **design-time references**：由 `fantasy-scene-design` 宿主维护，供 design family 共用；写作层不直接回读 taxonomy 文件
- 完成后执行 Scene Design QC（只 RECORD，不 FAIL），并额外检查 design 是否达到 **write-ready** 粒度

---

## EP{N} 写作

**全部 Scene Design+QC 完成后，用户手动触发写作任务，执行以下工作：**

- 读取 Spine + 全量 Scene Design（`scene1-design.md` 到 `sceneS-design.md`）
- 一口气将**全部 Scene 合并写成一个 EP 全稿** → `ep{N}/workspace/ep{N}.md`
- 写作完成后**自动衔接**全稿 QC（只 RECORD）
- 由 `fantasy-write-qc` 生成 `ep{N}/workspace/anchor-update-draft.md`
- `anchor-update-draft.md` 必须按“对象级变更单元”组织，不能只写自由叙述
- 每个变更单元至少包含：`objectType`、`objectName`、`sourceEP`、`targetFile`、`targetSection`、`before`、`draftProposal`、`reviewedConclusion`、`reviewStatus`、`applyStatus`
- 如已应用，还应补：`appliedResult`、`appliedAt`
- `anchor-update-draft.md` 之后至少区分两个状态：**review status**（pending / confirmed / rejected）与 **apply status**（unapplied / applied）
- 用户说「确认锚点草案」只代表 **review confirmed**；真正写回全局后才算 **apply applied**，这两个动作不得混成同一状态
- 若 draft 仍是 confirmed 但未 applied，下一次 `ignite EP{N+1}` 前仍必须先完成写回，不能视为已结清
- 最终稿 `ep{N}/ep{N}.md` 的复制由 `fantasy-write-qc` 完成；`ep{N}/ep{N}.md` 是唯一最终稿路径

Pipeline 结束。

---

## 触发词

### Ignite
- `ignite fantasy` / `点燃梦想` — 开始新项目，或继续现有项目（未指定 EP 时询问用户）
- `ignite EP{N}` — 继续现有项目的 EP{N}，前提是锚点文件存在

### Spine
- `EP{N} spine` / `EP{N} 脊骨` / `创建骨架` / `创建框架` / `创建脊骨`

### Scene Design
- `开始设计` / `开始 design` / `EP{N} 设计`

### 写作
- `开始写` / `开始 write` / `进入写作` / `EP{N} 写作`

---

## UX 设计原则

pipeline 所有面向用户的交互必须遵守：

### 用户只写 `user_input.md`，Agent 派生结构

- 用户输入入口统一为 `ep{N}/user_input.md`
- `user_input.md` 保持用户原始输入，不作为 Agent 重写产物
- 用户输入 = 自然语言描述，**不填任何结构化表格**，**不设计 Scene**
- 所有结构化文件（人物锚点/技能锚点/宝物锚点/writing-rules）由 Agent 从 `user_input.md` 中**提取信息并生成**
- **设定集**由 Spine 阶段生成，不在 Ignite 做
- 不要求用户预设任何设定集——用户没提 = 留空

### 每次提取后必须展示并等确认

- **T0**：`skill_context/` 全部生成后 → 展示关键文件 → 用户确认后才触发 Spine
- **EP{N+1}**：`user_input.md` 填充后 → 展示全文 → 用户确认后才触发 Spine
- 禁止跳过展示直接进入下一阶段

### 引导语要有人味

- 禁止「题材/主角/配角」这种冷冰冰的字段名
- 用 `user_input-template.md` 里的自然语言问题引导用户填写
- 可选项标注「如果你愿意多说一点」
- 禁区标注「这是你的故事，你有权利划定边界」
- **确认文案必须区分“原文展示”与“结构化结果展示”**：
  - Ignite 展示 `skill_context/` 时，可以明确说「这是我根据 `user_input.md` 提取并生成的结构化结果」
  - Continue EP 展示 `ep{N}/user_input.md` 时，只能说「这是你填写的原文，我将按此继续」；不得把原文误称为“提取结果”
- 参考：`references/project-skeleton/user_input-template.md`

### 禁区必须同步到全局约束

用户提到的禁区 → 写入 `skill_context/writing-rules.md` 的「禁区」章节，后续所有阶段都读该文件。

> writing-rules.md 只在首次 Ignite 时自动生成禁区章节。此后 pipeline 流程只会读取它，不会覆写你的编辑。
>
> 你还可以在 `skill_context/writing-style-sample.md` 放一段喜欢的范文（1000–2000 字），写作 Agent 会在动笔前吸收其语言风格。不用担心版权——工具只学风格，不抄内容。

---

## 注意事项

### 停止点统一在 QC 之后

- spine-qc / design-qc / write-qc 完成后，才允许出现用户检查或阶段暂停
- 上游创作 skill 不单独承担停止点，避免同一阶段重复停
- QC 后的停止点只负责**等待用户决定是否进入下一创作阶段**

### T0 不设门槛

Agent 自动生成所有 skill_context 文件，不依赖用户预先填写。不需要检查技能/宝物设定集是否存在。

### 设定集是只读的

写作阶段只读设定集，不修改。

### 设定集为可选

EP1 可以没有任何技能/宝物（由 Agent 从描述中提取；用户未提供时可留空）。

### skill_context 只派生不复制

EP{N+1} 的入点状态来自**全局**锚点（`skill_context/EP锚点.md` 等），不由 EP{N} 快照复制。

### 锚点更新草案是必经结算项

- `fantasy-write-qc` 只生成 `anchor-update-draft.md`，不直接写入全局锚点
- `anchor-update-draft.md` 必须按“对象级变更单元”组织，不能只写自由叙述
- 每个变更单元至少包含：
  - **objectType**
  - **objectName**
  - **sourceEP**
  - **targetFile**
  - **targetSection**
  - **before**
  - **draftProposal**
  - **reviewedConclusion**
  - **reviewStatus**
  - **applyStatus**
- 如已应用，还应补：
  - **appliedResult**
  - **appliedAt**
- `anchor-update-draft.md` 的“人工确认”和“真正写回”必须拆成两个状态：
  - **review status**：pending / confirmed / rejected
  - **apply status**：unapplied / applied
- 用户可在本 EP 完成后立即说「确认锚点草案」来完成 review；只有真正写回全局后，才算 apply 完成
- 如果 draft 为 `reviewStatus=confirmed` 但 `applyStatus=unapplied`，仍视为未结清
- 如果用户未当场确认，下一次 `ignite EP{N+1}` 前必须先检查并结清上一 EP 的 draft
- 未结清 draft 时，不允许直接进入下一 EP 的 Spine
- cockpit / project UI 必须把这类 **跨 EP 阻断关系** 直接可视化，而不是只把 draft 当普通文件列出来
- cockpit 还应同时说明：`ep{N+1}/user_input.md` 仍可先填写，但这只是并行准备动作，**不等于解除阻断**
- Dashboard 如果已经明确给出“当前唯一主动作”，则其它并行入口（如下游 `user_input`、EP 索引、Quick Access）必须明显降权；不能在文案上强调先处理 blocker、却在视觉上把次要入口做成平权 CTA
- `Episode Detail`（draft / input）与 `Final` 页应尽量共享同一套页面语法（header / meta / reading surface / side info 分层）；否则用户会把它们误判成两个系统
- `Final` 页若承担成品阅读，其顶部与侧栏不应再重复承担大段流程解释；流程回跳入口可以保留，但应降为次级，不要让结果页变成中转站

### Globals 是对象视图，不是文件视图

- 如果 pipeline 搭配 cockpit / project UI，`Globals` 页面应按 **设定对象** 组织，而不是按过程文件组织
- 最低限度应区分四块：人物锚点、地域设定集、anchor 变更对照、全局线索/宝物/技能索引
- `Globals` 负责回答：**对象现在是什么状态、受哪些 EP 影响、当前是否存在 pending draft**
- `Files` 页面才负责回答：**原始文件放在哪里**
- 不要把 `Globals` 做成另一个文件浏览器；它和 `Files` 的边界必须保持清楚
- 在 mock data / cockpit schema 层，Globals 节点应优先建模为 **object / collection / pending-impact**，而不是 `file / folder`；文件路径最多作为次级元信息出现
- 用户点进对象详情后，首屏应先看到：**当前状态、最近影响它的 EP、是否有待写回结算动作**；原文或源文件只作为参考层附属出现
- 详细映射与页面分工见 `references/globals-protocol.md`

### UI 文案必须做人话层翻译，不能裸露协议字段

- cockpit / mock UI 可以读取协议字段，但 **不能把协议字段原样暴露给用户**
- 下列内容都应视为协议层或实现层信息，只能作为内部 schema / parser 使用，不应直接进入主阅读面：
  - `review status` / `apply status`
  - `review=...` / `apply=...`
  - `anchor-update-draft.md` / `user_input.md` 这类原始文件名
  - `/mock-project/...`、绝对路径、实现期目录前缀
  - `Impact & Links`、`Final Manuscript`、`review / reading context` 这类 demo / 开发态标题
- UI 层应改写为人话表达，例如：
  - `anchor-update-draft.md` → `锚点结算单`
  - `user_input.md` → `本章输入`
  - `review status: confirmed` → `已完成人工确认`
  - `apply status: unapplied` → `尚未写回全局`
- 如果要保留路径感，显示层应使用 **抽象展示路径**（如 `project/...`），不要直接把 mock 根目录或本地绝对路径顶到主界面
- Draft / Input / Final / Globals 之间应共享同一套页面语法，但其阅读面必须优先呈现“这页对用户意味着什么”，而不是“底层文件名是什么”
- 读取原始 markdown 时，展示层还要过滤只供协议机读的状态行；例如 `review status:`、`apply status:` 不应作为正文段落直接显示

### Scene Design / Write 必须回读相关 Globals 约束

- Scene Design 在读取 Spine 后，必须同时读取本 EP 涉及的人物锚点与地域设定集，而不只是读 `ep-spine.md`
- 输出设计稿时，应显式体现“本 Scene 使用了哪些 global constraints”
- 写作阶段同样只在这些已确认的 Globals 约束内展开，不得把未确认的 draft 当成既成事实

---

## 陷阱

### QC PASS 后不得自动创建下游任务

Sequential pipeline 中，QC skill PASS 后不得直接创建下游任务。**必须停下来展示结果，等用户确认。** 确认后才由用户触发下一阶段。

正确模式：
```
spine-qc PASS → 展示报告 → 等用户说「开始设计」→ 创建 Scene Design 任务
```

**原则：QC 只核验，不推进流水线。推进权属于用户。**

---

### cockpit / mock data 改动后必须做真实路径模拟

只看静态结构不够。凡是改了 cockpit 页面、mock data、route、或页面间职责分工后，必须至少按以下路径手动模拟点击一遍：

- Dashboard
- blocker draft 页
- next EP input 页
- Globals 根页 + 至少一个子项
- Final 页

重点检查四类错误：
- **schema 漂移**：页面组件期待的字段与 mock data 实际提供字段不一致
- **硬编码入口**：Dashboard / Hero / CTA 仍写死某个 EP 或旧页面
- **页面身份混杂**：Final 像中转页、Globals 像文件浏览器、Detail 像第二套产品
- **入口权重矛盾**：文案说“先处理 blocker”，视觉上却把并行入口做成平权主按钮

如果模拟路径中发现任一问题，应先修协议与入口权重，再继续美化。

补充两条执行细则：
- **不要猜对象名 / slug**。验证 `Globals` 子项详情页时，先从 mock data、导航树或页面对象列表读取**真实 label**，再进入 `/globals/{section}/{label}`；不要用记忆里的旧角色名、旧地域名做路由验证，否则容易把“对象不存在”误判成“路由坏了”。
- **SPA 点击验证要做双确认**。如果浏览器点击后 snapshot 没刷新，不要立刻判定页面没跳转；先检查链接 `href`，再读 `window.location.pathname`，必要时直接 `browser_navigate` 到完整 URL 复核。这样可以区分“路由实现没通”和“browser 工具快照更新滞后”。

另外，UI 间距 / 贴边 / 边框呼吸感这类问题，**不能只靠 DOM snapshot 判断**。遇到这类视觉问题时，模拟后还应补一轮视觉检查（截图或视觉分析），因为 snapshot 只能确认结构，不足以判断 padding / gap / 层级拥挤是否真的解决。
- 视觉检查时要优先盯：**文本框里的文字排版、按钮/图标之间的间隔、字体层级、卡片内边距、整体留白**；不要只确认“路由通了/组件在”。
- 如果用户明确说页面“丑”、"贴边"、"像后台"，不要继续打零碎 spacing 补丁；应把它当成**页面语法没收口**的信号，先重整 header / meta / reading surface / side rail 的层级，再回头微调数值。

### 左栏 tree 的状态语义不能混在一起

cockpit 左栏里至少要区分三件事：
- **当前位置**（当前页）
- **流程状态**（draft / input / final / blocked）
- **节点类型**（overview / globals / episode）

不要把 `Now`、`Final`、`Input`、`未写回` 这类含义不同的 badge 全塞进同一视觉槽位，否则用户会把“当前所在”和“流程状态”混成一件事。


Spine 可以把自然语言 user_input 整理为 Scene 骨架，但不得遗漏用户明确要求，也不得擅自改写故事走向或升格用户未提出的次要线索。

### 不得擅自发明故事内容

骨架创建 (`skill_context/` + `user_input.md` 模板) 阶段，Agent 只能创建**空文件/模板**，不得自行填充任何故事内容。

- `user_input.md` 必须保持为空白模板，不得预填任何故事方向、角色名、情节设定
- `skill_context/` 下的锚点文件必须保持空表或模板占位符，不得预写角色名或设定
- 所有故事内容只能来源于**用户填写后的 `user_input.md`**，由 Agent 从原文中提取并派生
- 常见违例：点火时自行编造#雾隐镇#、#林启#、#师父失踪#等完整故事框架。这是错误的。用户没写之前，不应有任何故事出现。

### 重跑 Spine 后需重新 QC

Spine 重写完成后需手动创建新一轮 spine-qc 任务，不能假设自动循环。

---

## Support Files

- `references/project-skeleton/` — 项目骨架模板
- `references/pipeline-architecture.md` — 架构约定（术语对照/路径/设定集规则/文件布局）
- `references/pipeline-workflow.md` — 流程图与阶段职责总览
- `references/launch-checklist.md` — 点火前检查项（发布时应保持路径占位与平台无关）
- `references/orchestration-guide.md` — 可替换的执行层说明；仅放实现映射，不放协议本体
- `references/opencode-orchestration.md` — opencode 多 Agent 派遣实现示例；task prompt 模板 + 结构化返回协议 + 伪代码
- `references/kanban-orchestration.md` — Hermes Kanban 多 Agent 编排实现示例；profile 映射 + 阶段 task 模板 + 依赖链 + QC 后停止点处理 + 并行 Scene Design 拆分
- `references/project-cockpit-protocol.md` — companion UI / project cockpit 协议：Dashboard、Episode Detail、文件身份与阻断项展示原则
- `references/globals-protocol.md` — Globals 页的数据映射、对象视图边界、anchor diff 三态与 Episodes/Files 的职责分工
- `references/protocol-consistency-checklist.md` — 修改文件协议 / 命名 / anchor draft 结构时的四层一致性检查清单（主协议 / 执行层 / references / UI语义）
- `references/cockpit-simulation-checklist.md` — 每次改 cockpit / mock data / 页面协议后，按真实点击路径模拟跑一遍并检查 schema 漂移、硬编码入口、页面身份混杂
- `references/prose-standards.md` — 跨题材散文质感标准：叙事声音 5 原则 + 8 类 AI 腔禁止清单（含正则扫描模式）+ 幻想题材补充 4 章 + 精修检查流程

---

## 继续 EP{N}（现有项目）

> 用户说「ignite EP{N}」时，执行本流程。

### Step 1: 检查上一 EP 的锚点更新草案是否已结清

如果上一 EP 存在未应用的 `ep{N-1}/workspace/anchor-update-draft.md`：

- 先展示该 draft
- 若仅确认草案内容，等待用户说「确认锚点草案」
- 若真正写回全局，等待用户说「更新全局锚点」
- 只有 `applyStatus=applied` 后，才允许继续本次 `ignite EP{N}`

### Step 2: 读取锚点，了解故事进展

读取 `skill_context/EP锚点.md`、`人物锚点.md`、`技能锚点.md`、`宝物锚点.md`，了解：
- 已完成哪些 EP，各 EP 出口状态
- 主角当前状态、技能/宝物已有哪些

### Step 3: 创建 EP{N} workspace 目录

创建以下内容：

- `<project_root>/ep{N}/workspace/`
- `<project_root>/ep{N}/user_input.md`（由模板生成）

### Step 4: 引导用户填写 `ep{N}/user_input.md`

> 请直接打开 `ep{N}/user_input.md` 填写。
>
> 只需要用自然语言描述这一 EP 想往哪里走，不需要设计 Scene，不需要写结构化表格。
>
> `user_input.md` 保持用户原始输入，不做 Agent 改写。
>
> 写好后告诉我「写好了」或「确认」，我再继续读取原文并展示给你确认。

### Step 5: 读取 `user_input.md` 并展示结果

→ 读取 `ep{N}/user_input.md` 原文后，展示全文，并附言：

> 这是你填写的 `user_input.md` 原文，我将按此继续。请确认有没有遗漏或错误。
> 可以直接说"没问题"继续，也可以告诉我需要改什么。

### Step 6: 等待用户确认

> 确认没问题后，说「EP{N} spine」继续。
>
> 如果有要改的，直接告诉我。
