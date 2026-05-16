---
name: fantasy-scene-design
description: 幻想小说 Scene 级设计。接收 EP Spine，一次完成 Spine 中全部 Scene 的立题与破题（事件流/文戏武戏类型/节点描述）。Scene 是最小写作单位，不拆分 Scene。当用户说「设计 Scene」「Scene 设计」时触发。**不**做 EP 级设计（走 fantasy-ep-spine），**不**写正文（走 fantasy-scene-write）。
type: framework
pattern: sequential
category: creative
date_created: 2026-05-09
date_updated: 2026-05-13
---

# Scene 级设计

## 身份

Fantasy EP 的 Scene 级设计层。一次完成 Spine 中全部 Scene 的立题与破题，为写作提供具体指令。

> `references/combat-mode.md` 与 `references/scene-arc.md` 虽放在本 skill 目录下，但其定位是 **design family shared references**：由 `fantasy-scene-design` 宿主维护，供 `fantasy-scene-design` 与 `fantasy-design-qc` 共同使用。

## 输入

1. EP Spine：`ep{N}/workspace/ep-spine.md`
2. 题材参数：从 `ep{N}/user_input.md` 读取
3. 锚点文件：
   - `skill_context/技能锚点.md`（全局，读取）
   - `skill_context/宝物锚点.md`（全局，读取）
## 操作流程

### Step 1: 加载上下文

读取：
- `ep{N}/workspace/ep-spine.md`
- `ep{N}/user_input.md`（题材参数 + 人物起点）
- `skill_context/人物锚点.md`（全局，确认当前角色弧光状态）
- `skill_context/技能锚点.md`（全局，确认当前技能状态）
- `skill_context/宝物锚点.md`（全局，确认当前宝物状态）

从 Spine 提取 Scene 总数 S，逐 Scene 执行 Step 2-5。

同时读取 `skill_context/写作纲领.md`，提取**故事分类**（日式异世界 / 修仙 / 武侠），作为立题和破题的调性基准。

**检查本 Scene 是否有技能/宝物变更：**
- 如有变更（获得/升级/易主），在设计文档中注明：「→ 变更需更新锚点」
- 变更触发由设计阶段判断，实际写入由写作阶段执行

### Step 2-5: 逐 Scene 设计

对 Spine 中每个 Scene（Scene 1 到 Scene S），依次执行以下步骤：

**Step 2: 确立立题**

这个 Scene 的 non-action 部分要制造什么张力？

- 角色当前处于弧线哪个位置？需要什么推力？
- 外部事件/互动如何暴露/激化矛盾？
- 立题必须让读者感到「不解决不行」

**立题 Scene 序列：** 立题由几个场景组成？每场景的叙事功能？（至少 1 个）

**Step 3: 设计破题**

**文戏破题 — 三问：**
1. 这个 Scene 要解决什么矛盾？
2. 对话的温度（冷/温/热）和攻防定位（谁主动/谁防守）
3. 收束后人物关系/状态前进了哪一步？

**武戏破题 — 五问：**
1. 战斗要解决什么矛盾？
2. 用哪个战斗 Mode？（碾压型/围猎型/对抗型/反杀型/奔逃型/防守型/暗杀型）
3. 逆转触发点是什么？（仅反杀型）
4. 弧光理由：为什么逆转/为什么无法逆转？
5. 战斗结束后，叙事节奏在哪里停顿？（战斗流结束 = 自然停顿点，本 Scene 必须在这里结束，不得把战斗延续到下一个 Scene）

详见 `references/combat-mode.md` 的判定流程确定战斗 Mode（按力量对比分三层：俯视型/平视型/仰视型）。

**Step 4: 匹配 Scene Arc**

用 `references/scene-arc.md` 的判定流程确定本 Scene 的 Scene Arc 类型。

标注主弧光 + 次弧光（如有混合）。

### Step 5: 输出综合 Scene 设计文档

按 `references/output-template.md` 格式输出，**所有 Scene 合并为一个综合文件**，写入 `ep{N}/workspace/ep{N}-design.md`。

每个 Scene 的设计内容必须显式包含一段 **Constraints Readback**，至少列出：
- 使用的人物锚点
- 使用的地域设定
- 使用的长期线索 / 技能 / 宝物约束
- 本 Scene 不可违背的既成事实

**综合文件格式：**
```markdown
# EP{N} Scene Designs

---

## Scene 1: {标题}

{完整 Scene 设计内容}

---

## Scene 2: {标题}

{完整 Scene 设计内容}

---

...直到 Scene S 全部完成
```

以 `## Scene {N}:` 为 Scene 分隔标题，确保下游（写/QC）可通过标题层级逐 Scene 解析。

---

## 输出

`ep{N}/workspace/ep{N}-design.md`（综合文件，含全部 Scene 设计）

**锚点变更标注：** 如本 Scene 有技能/宝物变更（获得/升级/易主），在设计文档末尾注明候选变更：
```
## 锚点变更
- 【技能】炎狱术 主角：入门→熟练 → 记入 anchor-update-draft 候选项
- 【宝物】黑铁短刃 前任持有者→主角 → 记入 anchor-update-draft 候选项（并标注相关人物锚点候选变更）
```

此处只记录 Scene 层候选线索，不承担 review/apply 状态。
状态化草案仅由 `fantasy-write-qc` 在 `anchor-update-draft.md` 中统一生成。

这些变更只作为写作阶段与 write-qc 汇总的候选信息，不在本 skill 内直接写入全局锚点。

---

## 已知断点

- **路径**：输出必须为 `ep{N}/workspace/ep{N}-design.md`，不得写至 ep{N}/ 根目录
- **全量输出**：本任务必须输出 Spine 中全部 Scene 的设计，不得遗漏

## 注意事项

- **战斗 Mode**：三层九型已定义（俯视型=碾压/围猎，平视型=对抗，仰视型=反杀/奔逃/防守/暗杀），详见 `references/combat-mode.md`。该文件属于 **design family shared references**。
- **Scene Arc**：七型已定义（外压/内爆/博弈/揭示/抉择/关系/积累），详见 `references/scene-arc.md`。该文件属于 **design family shared references**。
- **POV 默认**：所有在场角色 POV 全开，仅当显式写出「xxx 不开 POV」时关闭
- **技能/宝物锚点**：scene-design 只负责标注候选变更；实际写入与汇总由后续阶段处理
