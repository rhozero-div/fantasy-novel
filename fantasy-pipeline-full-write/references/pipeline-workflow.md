# Fantasy 全写 Pipeline — 工作流图

```mermaid
flowchart TD
    subgraph IGNITE["① Ignite"]
        I1[/"用户：ignite fantasy"/]
        I2{"项目已存在？"}
        I3[/"用户填写 user_input.md（自然语言原文）"/]
        I4["Agent 创建 user_input 模板\n并生成 skill_context/"]
        I5["展示提取结果给用户\n人物锚点 + 写作纲领 + 技能/宝物锚点"]
        I6[/"用户确认"/]
        I1 --> I2
        I2 -->|"目录不存在"| I3
        I2 -->|"目录存在"| RESUME["读取锚点\n询问用户 EP 编号"]
        I3 --> I4 --> I5 --> I6
    end

    I6 --> SPINE_TRIGGER

    SPINE_TRIGGER[/"用户说 EP{N} spine\n/ EP{N} 脊骨 / 创建骨架"/]

    subgraph SPINE["② Spine"]
        S1["fantasy-ep-spine 执行"]
        S2["生成 ep{N}/workspace/ep-spine.md"]
        S3{"fantasy-spine-qc\nPASS？"}
        S4[/"用户检查 spine 确认"/]
        S1 --> S2 --> S3
        S3 -->|FAIL| S1
        S3 -->|PASS| S4
    end

    SPINE_TRIGGER --> S1

    S4 --> DESIGN_TRIGGER

    DESIGN_TRIGGER[/"用户说 开始设计\n/ 开始 design"/]

    subgraph DESIGN["③ Scene Design"]
        D1["fantasy-scene-design\n执行全部 {S} 个 Scene"]
        D2["生成 ep{N}/workspace/scene1-design.md ~ scene{S}-design.md"]
        D3["fantasy-design-qc\n一次扫描全部（只 RECORD）"]
        D4[/"用户手动触发写作"/]
        D1 --> D2 --> D3 --> D4
    end

    DESIGN_TRIGGER --> D1

    D4 --> WRITE_TRIGGER

    WRITE_TRIGGER[/"用户说 开始写\n/ 开始 write"/]

    subgraph WRITE["④ 写作"]
        W1["fantasy-scene-write\n一口气写完所有 Scene"]
        W2["写作产出只落在 ep{N}/workspace/ep{N}.md\nQC后复制为 ep{N}/ep{N}.md（唯一最终稿路径）"]
        W3["fantasy-write-qc\n全稿 QC（只 RECORD，输出 write-qc.md）"]
        W4["生成 anchor-update-draft.md（对象级变更单元）\n等待用户先确认草案、再决定是否写回全局锚点"]
        W5[/"EP{N} 完成"/]
        W1 --> W2 --> W3 --> W4 --> W5
    end

    WRITE_TRIGGER --> W1

    W5 --> IGNITE

    style I1 fill:#e1f5fe
    style SPINE_TRIGGER fill:#e3f2fd
    style S4 fill:#e8f5e9
    style DESIGN_TRIGGER fill:#e3f2fd
    style D4 fill:#fff3e0
    style WRITE_TRIGGER fill:#e3f2fd
    style W5 fill:#fce4ec
```

---

## 锚点文件位置

| 文件 | 路径 | 说明 |
| 人物锚点 | `skill_context/人物锚点.md` | 全局事实层，仅在用户确认后更新 |
| 技能锚点 | `skill_context/技能锚点.md` | 全局事实层，仅在用户确认后更新 |
| 宝物锚点 | `skill_context/宝物锚点.md` | 全局事实层，仅在用户确认后更新 |
| EP锚点 | `skill_context/EP锚点.md` | 全局事实层，仅在用户确认后更新 |
> **EP{N+1} 入点 = 已结清的全局锚点；若 EP{N} 仍有 pending `anchor-update-draft.md`，必须先结清再进入下一 EP。**

---

## QC 链路

| 阶段 | QC Skill | 判定 |
|------|---------|------|
| Spine | `fantasy-spine-qc` | PASS → 停在 QC 后，等用户确认是否进入 Scene Design；FAIL → 重跑 Spine |
| Scene Design | `fantasy-design-qc` | 一次扫描全部，只 RECORD，不 FAIL；QC 后等用户手动触发写作 |
| EP 全稿 | `fantasy-write-qc` | 只 RECORD，不 FAIL；输出 `ep{N}/workspace/write-qc.md`，生成 `anchor-update-draft.md` 并等待用户先确认草案、再决定是否更新全局锚点 |

---

## 四段式结构

| 阶段 | 触发 | 产出 | 确认节点 |
|------|------|------|---------|
| **① Ignite** | `ignite fantasy` / `ignite EP{N}` | skill_context + user_input | 展示结果 → 用户确认 |
| **② Spine** | `EP{N} spine` 等 | ep{N}/workspace/ep-spine.md | spine-qc PASS → 用户确认 |
| **③ Scene Design** | `开始设计` / `开始 design` / `EP{N} 设计` | scene{X}-design.md（全量） | design-qc → 用户手动触发写作 |
| **④ 写作** | `开始写` / `开始 write` / `进入写作` / `EP{N} 写作` | ep{N}.md + anchor-update-draft.md + write-qc.md | write-qc → 用户先确认锚点草案 / 再决定是否更新锚点 / 下次 ignite 前强制结清 → EP完成 |

---

## 手动确认节点（用户操作）

1. **Ignite** — Agent 生成 skill_context 后 → 展示关键文件 → 用户确认
2. **Spine QC PASS 后** — 用户检查 spine，确认后触发 Scene Design
3. **Scene Design QC 后** — 用户手动触发写作
4. **Write QC 完成后** — 用户先决定是否立即确认 `anchor-update-draft.md` 草案；若要真正写回全局锚点，再执行更新；若不应用，则下一章 ignite 前必须先结清

---

## EP 收尾规则

- `ep{N}/workspace/write-qc.md`：保存全稿 QC 报告
- `ep{N}/workspace/anchor-update-draft.md`：保存候选锚点更新
- `ep{N}/ep{N}.md`：保存最终稿
- 若 draft 未应用，则下一次 `ignite EP{N+1}` 前必须先结清
