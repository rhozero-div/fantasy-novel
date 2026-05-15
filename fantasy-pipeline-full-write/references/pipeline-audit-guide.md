# Pipeline 审计指南

> 如何系统性审查 fantasy skill 系统，发现断点、矛盾、旧残留。

## 何时使用
每次修改 skill 后，或接收新项目前，模拟走一遍完整流程。

## 审查步骤

### Step 1: 读取所有 SKILL.md
按 pipeline 顺序逐层读：
```
fantasy-pipeline-full-write/SKILL.md
  → fantasy-ep-spine/SKILL.md
  → fantasy-spine-qc/SKILL.md
  → fantasy-scene-design/SKILL.md
  → fantasy-design-qc/SKILL.md
  → fantasy-scene-write/SKILL.md
  → fantasy-write-qc/SKILL.md
```

## 2. 验证引用链
对每个被引用的 skill name：
1. 检查 skill 清单中是否存在该名称
2. 检查 SKILL.md frontmatter 的 `name:` 是否一致
3. 检查所有 support 文件引用的都是 canonical 名称

## 3. 扫描术语与职责残留
```bash
grep -rn "T0\|T1\|T2\|T3\|Unit\|unit\|逐Scene\|逐Scene设计\|变更前\|变更后" \
  --include="*.md"
```

### Step 4: 验证路径一致性
对每个 skill 的 Step 1 输入清单，确认：
1. 该文件在 project skeleton 中是否被创建
2. 上游 skill 是否真的写出了这个文件
3. 路径是否有 workspace/ 前缀不一致问题

### Step 5: 模拟 T0 流程
从零走一遍 T0，检查：
1. project-skeleton/ 的模板文件是否完整
2. T0 Step 3 派生的文件是否在所有下游 skill 的读取清单中

## 已知问题类型

| 问题 | 级别 |
|------|------|
| 路径不一致 | 断点 |
| 阶段职责混淆 | 设计矛盾 |
| 旧术语残留 | 残留 |
| 模板语义不足 | 文档错误 |
| 下游读取上游未产出的文件 | 潜在断点 |

## 修复优先级
1. P0：必须修，pipeline 直接跑不下去
2. P1：应该修，设计逻辑有问题
3. P2：可以修，文档错误或残留
