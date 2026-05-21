---
name: fantasy-scene-write
description: 幻想小说 Scene 级写作。按 Scene 粒度写出本 EP 的正文过程稿，输出 `ep{N}-scene{X}.md`。当用户说「写 EP」「写作 EP」「开始写」+ EP 编号时触发。**不**做设计（走 fantasy-ep-spine），**不**做 QC（走 fantasy-write-qc）。
type: framework
pattern: sequential
category: creative
date_created: 2026-05-09
date_updated: 2026-05-14
---

# EP 写作

## 身份

Fantasy EP 的正文写作层。按 Scene 粒度写出本 EP 的正文过程稿，供后续 QC 与最终收尾阶段统一结稿。

## 输入

1. EP Spine：`ep{N}/workspace/ep-spine.md`
2. EP 级 skill_context：`skill_context/`（含 `地域设定集/`、`writing-rules.md`）
3. Scene Design 全量：`ep{N}/workspace/scene{X}-design.md`
4. **风格范文（可选）**：`skill_context/writing-style-sample.md`（用户自备）
5. 写作参考：
   - `ep{N}/workspace/scene{X}-design.md`（逐文件读取各 Scene 设计内容）
   - `fantasy-scene-write/references/writing-guidelines.md`（质感规则）

## 操作流程

### Step 1: 读取 Spine、逐 Scene Design 与写作上下文

1. 读取 `skill_context/genre.md` 确定题材（fantasy / mecha）
2. 读取 `ep{N}/workspace/ep-spine.md`，掌握 Scene 总数、Scene 顺序、每个 Scene 的事件流
3. 按 Scene 顺序读取 `ep{N}/workspace/scene1-design.md` 到 `scene{S}-design.md`，提取本 EP 涉及的**地域列表**（如「边境小镇」「旧王城」）
4. 对每个地域，尝试读取 `skill_context/地域设定集/{地域}.md`：
   - **已存在** → 读取作为写作背景，写作时使用已有 NPC，不得新建同名 NPC
   - **不存在** → 标记为「新地域」，写作时可新建 NPC（需遵守命名风格约束）
5. 读取 `skill_context/writing-rules.md`，提取：
   - **故事分类**（日式异世界 / 修仙 / 武侠 / 机甲）
   - **命名风格**（中式古典 / 中式现代 / 日式 / 西式）
6. 根据题材和分类，读取对应写作指南：
   - fantasy → `fantasy-scene-write/references/writing-guidelines.md`
   - mecha → `fantasy-scene-write/references/mecha-writing-guidelines.md`
8. **命名强制**：所有 NPC 命名必须符合「命名风格」栏位的约束，不允许使用与风格不符的姓名（如西式风格下出现李X、张X等中式姓名）
9. 确认 Scene 总数 {S}
10. **（可选）加载风格范文**：若 `skill_context/writing-style-sample.md` 存在，读一遍全文——只吸收语言风格（句式节奏、描写密度、对话长短、段落衔接），不在正文中复述范文情节或套用原文句式。范文是学语感，不是当模板。
    - 推荐范文长度：1000–2000 字。太短学不到节奏，太长浪费 context。

### Step 2: 写 Scene 正文过程稿

按 Scene 顺序逐个写完。执行层可串行，也可按 Scene 拆分给多个 worker，但每个 worker 只能写自己负责的 Scene 文件。

每个 Scene：

**武戏 Scene：** 先从对应 `scene{X}-design.md` 中解析本 Scene 的已标注战斗 Mode、力量层级、节奏骨架、对白压力、停顿点，再按题材执行写作。

**机甲武戏扩展（`mecha`）：**
- 机体名称一致性：写作中始终使用同一称呼规则（全称/简称/代号），不在同一 Scene 内混用
- 武装使用合理性：每件武装使用前确认已列在机体武装列表中，不使用未配置的武器
- 驾驶舱视角 POV 优先：除非 Scene 设计特别标注，否则机甲战斗以驾驶员 POV 为主视角
- 损伤有视觉后果：装甲破损、关节火花、能量泄露、驾驶舱警报
- 环境反馈：宇宙/大气层内/城市/殖民地的物理差异必须在描写中体现

**混合 Scene：** 先从对应 `scene{X}-design.md` 中解析本 Scene 的主破题段、段落顺序、弧光落点，按 design 已定结构执行，不在写作阶段重排。

**文戏 Scene：** 查 `writing-guidelines.md` 第一章，按题材对号入座。

**Scene 之间：** 自然衔接，不重复前序动作，不回退弧光状态。

**通用写作约束**（跨题材适用，来源 `fantasy-pipeline-full-write/references/prose-standards.md` 第 2 章）：
写作全程严格避免以下模式：
- 对空否定句式（不是……而是……）
- 作者旁白总结（「这是他的悲剧所在」）
- 修辞设问引出下文（「做成这件事需要什么？」）
- 空洞升华（「意味着一切」「从未有人如此」）
- 标签化解释（「用当时的语言来说，这叫做……」）
- 现代对比打断（「在那个没有互联网的时代」）
- 直接称呼读者（「你可能会觉得……」）
- 假设性想象框架（「我们可以想象……」）

每完成一个 Scene 后，快速回看一遍该 Scene 是否有上述模式。有则修。

### Step 3: 保存输出

为每个 Scene 分别输出正文过程稿：

- `ep{N}/workspace/ep{N}-scene1.md`
- `ep{N}/workspace/ep{N}-scene2.md`
- ...
- `ep{N}/workspace/ep{N}-scene{S}.md`

> `scene-write` 不生成根目录最终稿，也不要求在本阶段生成合并稿；`ep{N}/ep{N}.md` 只在用户确认收尾后由 `fantasy-write-qc` 生成。 

### Step 4: 整理候选锚点变更（不写全局事实层）

1. **技能/宝物变更候选**（如有变更）：
   - 如有技能获得/升级：记录为 `anchor-update-draft.md` 的候选更新项
   - 如有宝物获得/易主：记录为 `anchor-update-draft.md` 的候选更新项
   - 如有宝物易主：同时记录相关人物锚点的候选变更

2. **地域锚点 + NPC 名册候选**：
   - 本 EP 新出现的地域（如「边境小镇」）→ 记录为地域设定集候选新增项
   - 本 EP 新创建的 NPC → 记录为对应地域 NPC 名册候选追加项（名字 / 身份 / 首次出现 EP / 备注）
   - 格式：

```markdown
# {地域名}

## 地点特点
- 简要描述

## NPC 名册
| 名字 | 身份 | 首次出现 | 备注 |
|------|------|---------|------|
| 艾伦 | 铁匠 | EP1 | 50岁，沉默寡言 |
```

3. **EP 锚点候选更新**：`fantasy-write-qc` Step 8 统一汇总到 `anchor-update-draft.md`，本 step 不写全局锚点。

> 以上候选信息只作为 `fantasy-write-qc` 生成 `anchor-update-draft.md` 的输入线索。
> `scene-write` 本身不定义最终 draft 结构，不直接产出自由格式的锚点草案。
> 最终草案必须由 `fantasy-write-qc` 按对象级变更单元模板统一汇总。 

> 本 skill 不直接更新 `skill_context/人物锚点.md`、`技能锚点.md`、`宝物锚点.md`、`EP锚点.md`。
> 全局事实层锚点只在用户确认后，由锚点更新流程统一写入。

### Step 5: 通知完成

写作完成后，告知用户正文已完成，并说明下一步进入 write-qc；此时本阶段尚未结束。

> EP{N} 各 Scene 正文过程稿已完成。
>
> 输出：`ep{N}/workspace/ep{N}-scene{X}.md`
>
> 下一步：进入 `fantasy-write-qc`，输出 `ep{N}/workspace/write-qc.md` 与 `ep{N}/workspace/anchor-update-draft.md`。
>
> 注意：**用户不在此处确认后直接进入下一创作阶段。** 本 EP 以 write-qc 完成为准。

---

## 注意事项

- Chapter 是物理切分单元，用户按篇幅手工切，本 skill 不处理
- 文戏/武戏的质感由题材参数决定（从 user_input.md 读取）
- `scene-write` 只执行逐 Scene 设计中已定好的 Mode / Arc / 位移 / 收束，不回退到 taxonomy 层重新分类

## 参考

- `references/architecture-decisions.md` — 写作层级的设计原则：Scene=最小单位、一口写完、QC只RECORD
