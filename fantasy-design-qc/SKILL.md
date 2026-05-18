---
name: fantasy-design-qc
description: 幻想小说 Scene Design 质量核验。一次扫描综合 Scene Design 文件（`ep{N}/workspace/ep{N}-design.md`），扫描弧光落地/Combat Mode/Scene Arc/锚点变更/衔接连贯性，只 RECORD 不 FAIL，输出结构化核验报告。触发词：「QC Scene Design」「核验 Scene 设计」。
type: protocol
pattern: sequential
category: creative
date_created: 2026-05-10
date_updated: 2026-05-13
---

# Scene Design 质量核验

## 身份

只核验，不创作。不修改设计文档；允许输出 QC 报告文件，不改动被核验对象。**只 RECORD，不 FAIL**——所有问题记入报告，不阻塞流程。

> 本 skill 读取 `fantasy-scene-design` 宿主目录下的 **design family shared references**：`references/combat-mode.md` 与 `references/scene-arc.md`。

## 输入

1. EP Spine：`ep{N}/workspace/ep-spine.md`
2. Scene Design 综合文件：`ep{N}/workspace/ep{N}-design.md`
3. 题材参数：从 `ep{N}/user_input.md` 读取

## 操作流程

### Step 1: 输入验收

确认以下文件存在：

- `ep{N}/workspace/ep-spine.md`
- `ep{N}/user_input.md`
- `ep{N}/workspace/ep{N}-design.md`

不完整 → 暂停，要求补充。

从 `ep{N}/workspace/ep-spine.md` 读取 Scene 总数 S，校验设计文档中是否包含全部 Scene。

### Step 2: 弧光落地扫描

逐 Scene 检查设计文档中的「弧光任务」是否能在写作层面落地：

1. 从每个设计文档提取 Scene 的弧光任务（小位移：A → B）
2. 检查设计文档是否写明了「收束后角色状态前进了哪一步」
3. 没有明确位移终点 → 记录「弧光落地不明确：Scene X」

### Step 3: Combat Mode 判定扫描

检查每个武戏 Scene 的 Combat Mode 标注：

1. 对照 `references/combat-mode.md` 的三层九型判定树
2. 战斗场景存在但 Mode 未标注 → 记录「武戏 Scene 缺失 Mode 标注：Scene X」
3. Mode 标注但力量对比（俯视/平视/仰视）与战斗描述不符 → 记录「Mode 与描述不符：Scene X」

**题材扩展 — 机甲（`mecha`）：**
4. 交战距离未标注（远距离炮战/中距离格斗/近距离白兵）→ 记录「机甲武戏缺失交战距离标注：Scene X」
5. 战场环境未标注（宇宙/大气层内/城市/殖民地内部）→ 记录「机甲武戏缺失战场环境标注：Scene X」
6. 机体状态（能量/装甲/武装）未在设计中有体现 → 记录「机甲武戏缺失机体状态基线：Scene X」

### Step 4: Scene Arc 标注扫描

检查每个 Scene 的 Scene Arc 标注：

1. 从设计文档提取 Scene Arc 类型
2. 对照 `references/scene-arc.md`
3. 文戏/武戏 Scene 但无 Arc 标注 → 记录「Scene Arc 缺失标注：Scene X」
4. Arc 类型与 Scene 叙事功能不符 → 记录「Arc 类型与叙事功能轻度不符：Scene X」

### Step 5: 锚点变更标注扫描（题材通用）

检查每个设计文档末尾是否有「锚点变更」标注：

1. 如本 Scene 有变更，设计文档必须注明变更内容
2. fantasy：技能/宝物变更（获得/升级/易主）漏注 → 记录「锚点变更漏注：Scene X（技能/宝物变更未标注）」
3. mecha：机体/科技/阵营变更（机体受损/升级、科技解锁、阵营关系变化）漏注 → 记录「锚点变更漏注：Scene X（机体/科技/阵营变更未标注）」

### Step 6: 衔接连贯性扫描

检查 Scene 之间弧光状态是否衔接：

1. 按 Scene 顺序检查弧光状态流（Scene1 → Scene2 → ... → Scene{S}）
2. 出现弧光回退（状态倒退）→ 记录「弧光回退：Scene X（相比 Scene X-1 状态倒退）」
3. Scene 之间弧光重叠（相邻 Scene 做同一件事）→ 记录「弧光重叠：Scene X 与 Scene X-1」

### Step 6.5: write-ready 扫描

检查每个 Scene Design 是否已经提供足够的写作合同，使 `scene-write` 无需回到 taxonomy 层重新判定：

1. **武戏 Scene** 必须明确写出：Combat Mode、力量层级、节奏骨架、停顿点
2. **混合 Scene** 必须明确写出：主破题段、段落顺序、弧光落点
3. **所有 Scene** 必须明确写出：弧光落地动作、出口状态
4. 缺失 → 记录：
   - `写作合同不完整：Scene X`
   - `武戏执行参数缺失：Scene X`
   - `混合 Scene 结构未定：Scene X`
   - `Arc 落地动作不明确：Scene X`

### Step 7: 汇总 RECORD 报告

所有检查项无论通过与否，**一律记入报告**，不阻塞。

输出格式：`ep{N}/workspace/design-qc.md`

报告结构：
- **弧光落地**：逐 Scene 弧光节点检查结果
- **Combat Mode**：武戏 Scene Mode 标注情况
- **Scene Arc**：各 Scene Arc 标注情况
- **锚点变更**：漏注情况
- **衔接连贯**：跨 Scene 弧光连贯性问题
- **write-ready**：是否已达到可直接写作、无需重判的合同粒度
- **总体评价**：全部 Design 整体质量评估

### Step 8: 输出完成状态

QC 完成后，告知用户：

```
EP{N} Scene Design QC 完成。

全部 {S} 个 Scene Design 已扫描，RECORD 报告已写入 ep{N}/workspace/design-qc.md。

下一步：用户手动触发 EP{N} 写作。
```

是否根据报告返工，由用户或上层调度决定，本 skill 不裁决。

---

## 注意事项

- 不修改设计文档，发现问题只报告位置和类型
- 所有项均为 RECORD，不 FAIL，不阻塞流程
- 不自动触发下游任务（由 pipeline 控制）
- 是否返工由用户或上层调度决定，本 skill 只 RECORD，不裁决

