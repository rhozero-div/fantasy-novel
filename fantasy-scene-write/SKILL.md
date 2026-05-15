---
name: fantasy-scene-write
description: 幻想小说 Scene 级写作。一口气写完 EP 内所有 Scene，输出 `ep{N}.md`。当用户说「写 EP」「写作 EP」「开始写」+ EP 编号时触发。**不**做设计（走 fantasy-ep-spine），**不**做 QC（走 fantasy-write-qc）。
type: framework
pattern: sequential
category: creative
date_created: 2026-05-09
date_updated: 2026-05-14
---

# EP 写作

## 身份

Fantasy EP 的正文写作层。一口气写完本 EP 所有 Scene，不拆分，不中断。

## 输入

1. EP Spine：`ep{N}/workspace/ep-spine.md`
2. EP 级 skill_context：`skill_context/`（含 `地域设定集/`）
3. Scene Design 全量：`ep{N}/workspace/scene1-design.md`、`scene2-design.md`、...
4. 写作参考：
   - `ep{N}/workspace/scene{X}-design.md`（逐 Scene 读取已标注的战斗 Mode / Scene Arc / 弧光位移 / 收束状态）
   - `fantasy-scene-write/references/writing-guidelines.md`（质感规则）

## 操作流程

### Step 1: 读取 Spine 和全量 Scene Design + 分类 + 命名风格 + 地域锚点

1. 读取 `ep{N}/workspace/ep-spine.md`，掌握 Scene 总数、Scene 顺序、每个 Scene 的事件流
2. 按顺序读取所有 `ep{N}/workspace/scene{X}-design.md`，提取本 EP 涉及的**地域列表**（如「边境小镇」「旧王城」）
3. 对每个地域，尝试读取 `skill_context/地域设定集/{地域}.md`：
   - **已存在** → 读取作为写作背景，写作时使用已有 NPC，不得新建同名 NPC
   - **不存在** → 标记为「新地域」，写作时可新建 NPC（需遵守命名风格约束）
4. 读取 `skill_context/写作纲领.md`，提取：
   - **故事分类**（日式异世界 / 修仙 / 武侠）
   - **命名风格**（中式古典 / 中式现代 / 日式 / 西式）
5. 根据分类，读取 `fantasy-scene-write/references/writing-guidelines.md` 中对应分类的章节
6. **命名强制**：所有 NPC 命名必须符合「命名风格」栏位的约束，不允许使用与风格不符的姓名（如西式风格下出现李X、张X等中式姓名）
7. 确认 Scene 总数 {S}

### Step 2: 写 EP 正文

按 Scene 顺序逐个写完，**一口气，中间不停止**。

每个 Scene：

**武戏 Scene：** 先从对应的 `scene{X}-design.md` 读取已标注的战斗 Mode、力量层级、节奏骨架、对白压力、停顿点，再按题材执行写作。

**混合 Scene：** 先从对应的 `scene{X}-design.md` 读取主破题段、段落顺序、弧光落点，按 design 已定结构执行，不在写作阶段重排。

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

输出 `ep{N}/workspace/ep{N}.md`（中间稿，所有 Scene 合并）

> `scene-write` 只写中间稿，不生成根目录最终稿；`ep{N}/ep{N}.md` 只由 `fantasy-write-qc` 在收尾阶段复制生成。 

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

> EP{N} 写作正文已完成。
>
> 合并稿：`ep{N}/workspace/ep{N}.md`
>
> 下一步：进入 `fantasy-write-qc`，输出 `ep{N}/workspace/write-qc.md`。
>
> 注意：**用户不在此处确认后直接进入下一创作阶段。** 本 EP 以 write-qc 完成为准。

---

## 注意事项

- Chapter 是物理切分单元，用户按篇幅手工切，本 skill 不处理
- 文戏/武戏的质感由题材参数决定（从 user_input.md 读取）
- `scene-write` 只执行 `scene{X}-design.md` 中已经定好的 Mode / Arc / 位移 / 收束，不回退到 taxonomy 层重新分类

## 参考

- `references/architecture-decisions.md` — 写作层级的设计原则：Scene=最小单位、一口写完、QC只RECORD
