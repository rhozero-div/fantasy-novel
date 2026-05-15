# Fantasy Family Runtime Policy

> 目的：定义 fantasy skill family 的 **public repo / local runtime** 分层关系，以及 runtime-only 差异的合法治理方式。
>
> 这份文档放在 public repo 中，不是为了携带某个用户的私有 runtime 内容，而是为了让任何下载 repo 并在本地部署的人，都能按同一套规则生成和维护自己的 runtime 层。

---

## 1. 核心定位

### Repo 是什么
`/Repos/fantasy-novel/` 是：
- **public canonical**
- **source of publication**
- fantasy family 的公开协议、流程、边界、模板与稳定 support files 的来源

### Runtime 是什么
`~/.hermes/skills/fantasy/` 是：
- **deployed local copy**
- **source of execution**
- public core 在本地的执行副本
- 以及本地运行时增强（如 dashboard 接法、联调脚手架、私有 glue）的承载层

### 两者关系
repo → runtime 是**单向关系**：
- public core 从 repo 同步到 runtime
- runtime 可以长出本地层增强
- 但 runtime 本地增强**不得反向污染 repo**，除非它被明确裁定为 public core

---

## 2. Repo 中定义的是 runtime 治理模型，不是私有 payload

公开 repo 的责任是：
- 定义 runtime 差异该如何分类
- 定义本地增强该放在哪里
- 定义哪些差异合法、哪些差异代表未收口
- 定义如何登记 runtime-only 差异

公开 repo **不负责**携带某个用户机器上的私有 runtime 内容本身。

也就是说：

> repo 提供的是 **runtime-diff governance model**，不是用户本地 runtime payload。

其他用户下载 repo 后，Agent 应能从这些规则中学到：
- 如果需要本地 dashboard 接法，该放到哪里
- 如果有联调中间态文档，该怎么标记
- 如果 skill 出现 runtime-only 差异，该如何登记
- 如何区分合法 runtime-only 差异与未收口分叉

---

## 3. runtime-only 差异的四类归属

任何 repo 没有、runtime 才有的内容，必须归入以下四类之一：

### 3.1 `public-candidate`
表示该内容已经显示出 public core 价值，应准备回流 repo。

处理方式：
1. 回流 repo
2. 从 runtime-only 登记表删除
3. runtime 用 repo 版本覆盖

### 3.2 `private/`
表示长期只在本地 runtime 保留的运行增强。

典型例子：
- 本地 dashboard 接法
- 本地路径 glue
- 本地 profile 说明
- 不适合公开发布的执行层补充

### 3.3 `transitional/`
表示联调 / 迁移 / 重构期间的中间态脚手架。

典型例子：
- cockpit 协议草稿
- consistency checklist
- simulation checklist
- 还没抽象成 public core 或 private 长期层的过渡文档

这类内容不能永久悬空，后续必须二选一：
- 吸收为 public core / private 长期层
- 删除

### 3.4 `for_deletion/`
表示已判定不再需要，只等待删除。

---

## 4. 硬规则

## Rule 1 — runtime-only 文件不得裸奔
任何 repo 没有、runtime 才有的文件，必须立即归入：
- `private/`
- `transitional/`
- `for_deletion/`
- 或回流 repo（若它其实属于 public-candidate）

未归类差异视为：
> **未收口分叉**

---

## Rule 2 — 有 runtime-only 差异的 skill 必须有 `RUNTIME_DIFF.md`
只要一个 skill 存在合法 runtime-only 差异，就必须在该 skill 根目录创建：

```text
RUNTIME_DIFF.md
```

它的作用是：
- 登记该 skill 的合法 runtime-only 差异
- 标明类别（private / transitional / for_deletion / public-candidate）
- 标明状态（keep / review-later / delete / merge-back 等）
- 作为下次 repo/runtime 对比时的**免重审白名单**

如果存在 runtime-only 差异，但没有 `RUNTIME_DIFF.md`，则视为未收口。

---

## Rule 3 — `references/` 默认视为 public core 区
因此：
- repo 没有、runtime 有的 reference 文件，**不得长期留在 `references/`**
- 必须迁入：
  - `private/`
  - `transitional/`
  - `for_deletion/`
- 若仍裸留在 `references/`，说明它尚未完成分层收口

这条规则的目的，是防止 runtime-only 内容伪装成 core support files。

---

## Rule 4 — `SKILL.md` 的 runtime-only 差异也必须登记
有些 runtime 差异不是文件，而是 `SKILL.md` 内的局部段落，例如：
- dashboard 启动问询
- runtime 本地治理说明
- 仅在本地执行层成立的提示

这类差异也必须在 `RUNTIME_DIFF.md` 中单独登记，例如：
- `SKILL.md :: Step 1.5 驾驶台问询`
- `SKILL.md :: runtime private/transitional 目录说明`

否则下次看到 `SKILL.md` diff 时，仍会被迫重新分析。

---

## Rule 5 — 未登记差异一律视为未收口
下次检查 repo/runtime 差异时：
- 若差异已出现在 `RUNTIME_DIFF.md`，则视为**已裁决差异**
- 若差异未登记，则视为**未收口差异**

也就是说：

> runtime-only 差异如果没有被显式登记，就不能默认它是合法的。

---

## 5. 推荐检查顺序

每次做 family 级 repo/runtime 检查时，按这个顺序：

### Step A — 检查 skill 根目录和 `references/`
如果发现 repo 没有、runtime 有的文件落在：
- skill 根目录
- `references/`

优先判定，因为这最容易伪装成 core 分叉。

### Step B — 检查 `private/` / `transitional/` / `for_deletion/`
这些目录里的差异默认允许存在，但仍要核对是否与 `RUNTIME_DIFF.md` 登记一致。

### Step C — 检查 `SKILL.md` 内容差异
若 `SKILL.md` 存在 repo/runtime 差异：
- 先查 `RUNTIME_DIFF.md` 是否已登记对应段落
- 未登记 → 视为未收口

### Step D — 判断是否需要回流 repo
如果某项本地差异已经不再依赖本地环境，且已形成稳定 public core 价值，就应回流 repo，不再长期停留在 runtime-only 状态。

---

## 6. 当前 fantasy family 的实践口径

当前 fantasy family 的推荐口径是：

- **无差异的 skill**：保持干净，不需要预建空 `RUNTIME_DIFF.md`
- **有 runtime-only 差异的 skill**：按本 policy 建立 `RUNTIME_DIFF.md`
- **不要为了制度完整性而提前制造空壳 private 目录或空差异登记册**

也就是：

> 规则 family 统一，文件按需出现。

---

## 7. 样板实现

当前已采用本 policy 的样板 skill：
- `fantasy-pipeline-full-write`

它展示了：
- 如何把本地 dashboard 接法归入 `private/`
- 如何把联调脚手架归入 `transitional/`
- 如何在 `RUNTIME_DIFF.md` 中登记文件级与 `SKILL.md` 段落级的 runtime-only 差异

> 上述 `private/` 和 `transitional/` 目录存在于本地 runtime 部署后的 skill 根目录，
> 不在 public repo 中。repo 只定义治理模型，不携带具体 runtime payload。

后续 fantasy family 其他 skill 若出现 runtime-only 差异，应直接复用这一模式。

---

## 8. 一句话总结

> **Public repo defines the runtime-diff governance model, not the user’s private runtime payload.**

中文：

> **公开 repo 定义的是 runtime 差异治理模型，不是用户私有 runtime 内容本身。**
