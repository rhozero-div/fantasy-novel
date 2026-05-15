# 锚点架构原则

> 来源：2026-05-10 BUG-1/2 修复——EP间快照复制机制废除的经验总结。

---

## 核心原则：全局锚点是唯一真实源

所有锚点文件（人物/技能/宝物/EP）**只存在于全局 `skill_context/` 目录**。

EP{N+1} 的入点状态直接读全局锚点，**不从 EP{N} 目录复制**。

```
✅ 正确：EP{N+1} spine 读取 skill_context/EP锚点.md（全局）
❌ 错误：EP{N+1} 点火时从 ep{N}/skill_context/ 复制快照
```

---

## 为什么废除 EP级快照

旧模式：`EP{N} 完成 → 复制锚点到 ep{N}/skill_context/ → EP{N+1} 从快照恢复`

问题：
1. **职责混淆**：`ep{N}/skill_context/` 不知道是"EP{N}出口快照"还是"EP{N+1}入点"
2. **数据冗余**：同一份锚点存在于两处，容易不一致
3. **路径复杂**：各 skill 要同时处理全局路径和 EP级路径

新模式：全局锚点在用户确认后更新，EP{N+1} 直接读已结清的全局锚点。

---

## 各文件的职责

| 文件 | 位置 | 职责 |
|------|------|------|
| 人物锚点 | `skill_context/` | 全局事实层。write-qc 生成 draft，用户确认后更新；EP{N+1} 直接读 |
| 技能锚点 | `skill_context/` | 全局事实层。write-qc 生成 draft，用户确认后更新 |
| 宝物锚点 | `skill_context/` | 全局事实层。write-qc 生成 draft，用户确认后更新 |
| EP锚点 | `skill_context/` | 全局事实层。记录已确认的各 EP 出口状态汇总表 |
| user_input | `ep{N}/user_input.md` | EP级，本EP弧光终点，由用户填写 |

---

## T0 创建什么

```
project/
├── skill_context/           ← 全局事实层（仅在用户确认后更新）
│   ├── 人物锚点.md
│   ├── 技能锚点.md
│   ├── 宝物锚点.md
│   ├── EP锚点.md
│   ├── 写作纲领.md
│   ├── 技能设定集/
│   └── 宝物设定集/
└── ep1/
    ├── user_input.md        ← 用户填
    └── workspace/           ← pipeline 创建
```

**不创建** `ep1/skill_context/`。EP级锚点快照不存在。

---

## 锚点更新时机

- **EP完成时（write-qc Step 8）**：生成 `anchor-update-draft.md`
- **用户确认后**：将 draft 写入全局锚点
- **EP{N+1} Ignite前**：若 draft 未结清，必须先应用后再继续
- **EP{N+1} Spine时（ep-spine Step 1）**：从全局锚点读取入点

不在任何中间步骤做"复制快照到EP目录"的动作。
