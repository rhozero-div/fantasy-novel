# Pipeline 架构约定

> 结构性修改后，用本文件核对路径、产物位置、设定集分工、锚点职责是否仍然一致。

---

## 路径约定

```
ep{N}/                          ← EP 根目录
├── user_input.md               ← 用户填写（Ignite 仅创建模板）
├── workspace/                  ← 中间产物
│   ├── ep-spine.md            ← Spine 输出
│   ├── spine-qc.md            ← Spine QC 报告
│   ├── scene{X}-design.md     ← Scene Design 输出
│   ├── scene-design-qc.md     ← Scene Design QC 报告
│   ├── ep{N}.md               ← 写作中间稿（所有 Scene 合并）
│   ├── anchor-update-draft.md ← write-qc 生成的全局锚点更新草案
│   └── write-qc.md            ← 全稿 QC 报告
└── ep{N}.md                   ← 最终稿（根目录，QC 后从 workspace 复制）
```

**规则：中间产物进 `workspace/`，最终稿放根目录。**

---

## 设定集架构

| 类型 | 位置 | 基本信息 | EP 信息 |
|------|------|---------|---------|
| 人物设定集 | `skill_context/人物设定集/{角色名}.md` | 外貌 / 性格 / 核心矛盾 | 履历表（EP / 弧光 / 结果状态） |
| 技能设定集 | `skill_context/技能设定集/{技能名}.md` | 效果/类型/修炼条件 | 进化路径（含 EP 标注） |
| 宝物设定集 | `skill_context/宝物设定集/{宝物名}.md` | 核心能力 / 类型 | 履历表（EP / 弧光 / 结果状态） |

**基本信息里不写 EP 相关内容。**

---

## 锚点职责

- Spine 产出的是**计划状态**，写在 `ep{N}/workspace/ep-spine.md`
- write-qc 只生成 `ep{N}/workspace/anchor-update-draft.md`，不直接写入全局锚点
- `anchor-update-draft.md` 必须按对象级变更单元组织，不得只写自由叙述
- 每个变更单元至少包含：`objectType`、`objectName`、`sourceEP`、`targetFile`、`targetSection`、`before`、`draftProposal`、`reviewedConclusion`、`reviewStatus`、`applyStatus`
- 全局锚点与设定集履历只在用户确认后写入
- 若用户未确认 draft，则下一次 `ignite` 前必须先结清

**跨 EP 的承接规则另见 `propagation-rules.md`。**

---

## 一致性检查点

| 症状 | 检查位置 |
|------|---------|
| 把中间稿或 QC 报告写到根目录 | 路径表、各阶段输出说明 |
| 把 planning state 直接写入全局锚点 | Spine / write-qc / anchor 相关说明 |
| 跳过 QC 后的用户确认直接推进下游 | 流程图、阶段推进规则 |
| `user_input.md` 写成僵硬字段表单 | `project-skeleton/user_input-template.md` |
| 设定集基本信息与履历混写 | 各设定集模板 |
| 同一阶段存在多个命名别名（如 `write-qc.md` / `ep{N}-qc.md`） | 路径表、QC skill 输出说明、cockpit 扫描逻辑 |

**命名硬规则：**
- QC 文件命名必须唯一，不允许别名并存：
  - `spine-qc.md`
  - `scene-design-qc.md`
  - `write-qc.md`
- 不允许再使用 `ep{N}-qc.md` 作为 write 阶段 QC 名称。
