---
name: fantasy-write-qc
description: 幻想小说 EP 全稿质量核验。接收 `ep{N}.md`（全部 Scene 合并稿），扫描弧光落地、文戏质感（含对白压力/词频）、武戏质感、人物一致性、衔接连贯性，只 RECORD 不 FAIL，输出结构化核验报告。触发词：「QC」「核验」「质量核验」。
type: protocol
pattern: sequential
category: creative
date_created: 2026-05-09
date_updated: 2026-05-14
---

# EP 全稿质量核验

## 身份

只核验，不创作。不修改正文；允许输出 QC 报告、锚点草案与最终稿复制，不改动被核验正文内容。**只 RECORD，不 FAIL**——所有问题记入报告，不阻塞流程。

## 输入

1. EP 全稿（中间稿）：`ep{N}/workspace/ep{N}.md`
2. EP Spine：`ep{N}/workspace/ep-spine.md`
3. Scene Design 全量：`ep{N}/workspace/scene{X}-design.md`
4. 题材参数：从 `ep{N}/user_input.md` 读取

## 操作流程

### Step 1: 输入验收

确认以下文件存在：

- `ep{N}/workspace/ep{N}.md`
- `ep{N}/workspace/ep-spine.md`
- `ep{N}/user_input.md`

不完整 → 暂停，要求补充。

### Step 2: 弧光完整性扫描

1. 从 `ep{N}/workspace/ep-spine.md` 提取每个 Scene 的弧光节点
2. 在全稿中搜索对应关键词（角色状态/行为变化）
3. 找到 → 标注「弧光已落地」。找不到 → 标注「弧光未落地」（RECORD）

### Step 3: 文戏质感扫描

按题材（从 `user_input.md` 读取）检查对话/内心独白/情绪传递。

**对白压力测试：**

每段对白检查三个维度，记录缺失项：

1. **潜台词**：读完对白后问——字面上说什么？实际传递什么情绪/意图？无第二层意思 → 记录「缺失潜台词」
2. **沉默或答非所问**：至少一次以沉默/不直接回答代替语言。通篇问→答→问→答 → 记录「缺失沉默/不对称」
3. **信息不对称**：说话者知道听话者不知道的事，影响对白张力。缺失 → 记录「缺失信息不对称」

**词频阈值扫描：**

可使用文本搜索、正则或脚本扫描等方法辅助定位。下列 grep 仅为**示例扫描方法**，不是唯一实现方式：

```bash
# 对空否定（对着空气否定）
grep -nE "不是.{0,30}(而是|——是|，是|。是)" "$FILE"
grep -nE "不是.{0,30}(。她|。他)" "$FILE"
```

| 类型 | 阈值 | 记录 |
|------|------|------|
| 对空否定「不是…是…」句式 | >3处 | 记录超限数量和位置 |
| 关键词同词重复 | >5次 | 记录超限词语 |
| 通篇问→答序列 | 0容忍 | 记录出现位置 |

**题材质感记录：**

- 日式异世界：对白简洁/角色声音/内心独白节制/情绪通过动作沉默传递
- 修仙：古意语言/顿悟节奏/宗门规矩融入
- 武侠：江湖气白话/写意动作/克制情感

### Step 3.5: AI 腔扫描

参考引用 `fantasy-pipeline-full-write/references/prose-standards.md` 第 2 章定义的 8 类通用禁止句式，逐类扫描全稿。

可使用文本搜索、正则或脚本扫描等方法辅助定位。下列正则仅为**示例扫描方法**：

```bash
# 对空否定句式
grep -nE "不是.{0,40}(而是|——|，是|。是)" "$FILE"
grep -nE "不是.{0,40}(。她|。他|。我|。你)" "$FILE"

# 读者称呼
grep -nE "(你可能会|你会觉得|你应该能|读到这里你)" "$FILE"

# 作者旁白
grep -nE "(这是.{0,20}[的].{0,6}(悲剧|关键|命运|意义)|这才是真正的)" "$FILE"

# 修辞设问（句号后紧跟疑问句，含全角？）
grep -nE "。([为什]|如何|难道|怎么).*[?？]" "$FILE"

# 假设性框架
grep -nE "(我们可以想象|如果有人|如果让.{0,10}来)" "$FILE"

# 空洞升华
grep -nE "(意味着一切|从未有人|(真正的|真正).{0,6}(开始|结束|意义)|这便是.{0,10}(宿命|终局))" "$FILE"

# 标签化解释
grep -nE "(用.{0,10}的话来说|用.{0,10}的说法|用.{0,10}的语言来说|在.{0,10}看来，这)" "$FILE"

# 现代对比打断
grep -nE "(在任何一个现代|在那个没有.{0,6}的时代|相比于现代)" "$FILE"
```

| 类型 | 阈值 | 记录 |
|------|------|------|
| 对空否定句式 | >3 处 | 记录超限数量和位置 |
| 读者称呼 | 0 容忍 | 记录每次出现位置 |
| 作者旁白总结 | 0 容忍 | 记录每次出现位置 |
| 修辞设问引出 | 0 容忍 | 记录每次出现位置 |
| 假设性想象框架 | 0 容忍 | 记录每次出现位置 |
| 空洞升华 | >2 处 | 记录超限数量和位置 |
| 标签化解释 | 0 容忍 | 记录每次出现位置 |
| 现代对比打断 | 0 容忍 | 记录每次出现位置 |

### Step 4: 武戏质感扫描

检查每个战斗场景（遭遇→试探→逆转→结果），记录：

- 节奏缺失（无遭遇/无逆转/无结果）→ 记录缺失位置
- 逆转无弧光理由 → 记录
- 力量感偏弱 → 记录

### Step 5: 人物一致性扫描

- 角色行为是否与弧线阶段一致 → 记录偏离项
- POV 是否稳定（无跳点）→ 记录跳点位置
- 对话是否符合角色设定（性格/身份/口吻）→ 记录不符项

### Step 6: 衔接连贯性扫描

- Scene 之间弧光状态是否连贯 → 记录回退点
- 有无重复动作（前序 Scene 写过的动作本 Scene 又写）→ 记录位置

### Step 7: 汇总 RECORD 报告

所有检查项无论通过与否，**一律记入报告**，不阻塞。

输出格式：`ep{N}/workspace/write-qc.md`

报告结构：
- **弧光落地**：逐 Scene 弧光节点检查结果
- **文戏 RECORD**：对白/词频/质感问题列表
- **武戏 RECORD**：战斗节奏/力量感/逆转理由问题列表
- **人物 RECORD**：行为偏离/POV跳点/对白不符列表
- **衔接 RECORD**：弧光回退/动作重复列表
- **总体评价**：本稿整体质量评估

### Step 8: 生成锚点更新草案 + 复制最终稿

**生成锚点更新草案：**
- 输出 `ep{N}/workspace/anchor-update-draft.md`
- 内容包括：
  - `skill_context/人物锚点.md` 的拟更新项
  - `skill_context/技能锚点.md` 的拟更新项（如有变更）
  - `skill_context/宝物锚点.md` 的拟更新项（如有变更）
  - `skill_context/EP锚点.md` 的拟更新项（本 EP 出口状态）
  - **设定集履历**的拟追加项：`skill_context/人物设定集/`、`技能设定集/`、`宝物设定集/`
- 草案必须按“对象级变更单元”组织，不得使用纯自由叙述替代结构字段
- 每个变更单元至少包含：
  - `objectType`
  - `objectName`
  - `sourceEP`
  - `targetFile`
  - `targetSection`
  - `before`
  - `draftProposal`
  - `reviewedConclusion`
  - `reviewStatus`
  - `applyStatus`
- 如该对象已写回，则补：
  - `appliedResult`
  - `appliedAt`

**最小模板：**
```markdown
# anchor-update-draft

## Meta
- sourceEP: EP{N}
- reviewStatus: pending
- applyStatus: unapplied

## Change 1
- objectType: 人物锚点
- objectName: 林昭
- sourceEP: EP{N}
- targetFile: skill_context/人物锚点.md
- targetSection: 林昭
- before: 对火焰失控仍有恐惧，尚未主动承担队长职责
- draftProposal: 首次主动接管战场指挥，形成“恐惧仍在但开始承担”的新阶段
- reviewedConclusion:
- reviewStatus: pending
- applyStatus: unapplied
```

**本 step 不直接写入全局锚点。**

**复制最终稿：**
- 将 `ep{N}/workspace/ep{N}.md` 复制到 `ep{N}/ep{N}.md`（根目录，用户最终稿）

### Step 9: 完成通知

**执行完成后，通知用户：**

```
EP{N} 全稿 QC 已完成。

最终稿：ep{N}/ep{N}.md
QC 报告：ep{N}/workspace/write-qc.md
锚点更新草案：ep{N}/workspace/anchor-update-draft.md

若现在确认草案内容，请说「确认锚点草案」。
若要真正写回全局锚点，请说「更新全局锚点」。
只有写回完成后，`applyStatus` 才能变为 `applied`。
```

**规则：**
- write-qc 完成后，不直接更新全局锚点
- 用户可先确认草案内容（`reviewStatus=confirmed`）
- 用户也可进一步执行全局写回（`applyStatus=applied`）
- 只有真正写回完成后，该 draft 才算结清
- 若用户未确认，则下一次 `ignite EP{N+1}` 前，必须先检查并结清该 `anchor-update-draft.md`
- 本 skill 只负责收尾当前 EP，不负责描述或触发下一 EP 的流程

---

## 注意事项

- 不检查错别字和语法细节
- 不修改正文，发现问题只报告位置和类型
- 所有项均为 RECORD，不 FAIL，不阻塞流程
