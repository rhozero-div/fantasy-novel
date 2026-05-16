# 少年，还记得你的梦想吗？

> 每一个少年也许都曾有过一个梦想，梦想创造一个世界，然后在那个世界里成为英雄。
>
> 只是，岁月变迁，少年已不再年轻，被生活的重担压得抬不起头。曾经的梦想已是内心深处一点小小的火花，被用心地包起，埋藏在隐秘的角落。
>
> 也许，在夜深人静的时候，少年偶尔想起它，会心一笑，便很快进入了梦乡。
>
> 现在，少年，请拿起这个小小的工具，对着自己内心的花火说一声："**点火。**"

---

# Fantasy Novel

一个面向长篇幻想小说创作的 Hermes Skill family：
它包含 **pipeline 协议、7 个执行 skill、project skeleton、workflow references，以及一个本地 dashboard**。

一句话说：**Agent 推进流程，文件系统保存产物，网页负责展示结构、承接人工判断与人工修改。**

## 前置要求

- Hermes Agent（用于加载与执行 skills）
- Node.js >= 18
- npm

## Repo 里有什么

```text
fantasy-novel/
├── fantasy-pipeline-full-write/   # 总管线协议 + workflow / orchestration / skeleton
├── fantasy-ep-spine/              # EP 脊骨设计
├── fantasy-spine-qc/              # Spine 核验
├── fantasy-scene-design/          # Scene 设计（每个 Scene 单独一个 design 文件）
├── fantasy-design-qc/             # Design 核验
├── fantasy-scene-write/           # EP 全稿写作
├── fantasy-write-qc/              # 全稿核验 + anchor-update-draft
├── dashboard/                     # 本地浏览器工作台
└── words_from_the_builder.md      # 项目引言长文
```

## 快速开始

### 1. 跑 dashboard

```bash
cd dashboard
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`，默认加载 `demo-project/`。

### 2. 切换到真实项目

默认只显示 demo-project。要扫描更多项目，在 `dashboard/` 下创建 `.env` 文件：

```bash
PROJECTS_DIR=/Users/me/Hermes/projects
```

支持逗号分隔多个目录：

```bash
PROJECTS_DIR=/Users/me/Hermes/projects,/Users/me/Repos
```

参考模板见 [dashboard/.env.example](./dashboard/.env.example)。

### 3. 在 Hermes 里跑 pipeline

这个 repo 本身不直接执行创作。真正的创作流程由 Hermes Agent 加载各 skill 后推进：

- `ignite` / `ignite EP{N}`
- `EP{N} spine`
- `开始设计`
- `开始写`
- `QC`

dashboard 负责看文件、看状态、改稿；Chatbox / Agent 负责真正推进各阶段。

## 项目识别规则

目录下存在 `skill_context/` 文件夹即视为有效项目，会出现在总览页的下拉切换框中。切换后页面刷新，数据自动从新项目的文件系统推导。

## 界面导航

```text
总览                              ← hero + EP 状态卡片 + 最近更新 + 项目切换
├── 全局对象                      ← skill_context/ 解析出的实体视图
│   ├── 人物锚点                  ← 人物锚点.md 表格，每人可点进详情
│   ├── 技能锚点                  ← 技能锚点.md
│   ├── 宝物锚点                  ← 宝物锚点.md
│   ├── 地域设定集                ← 地域设定集/ 下的文件
│   └── EP锚点                    ← EP锚点.md 表格
├── 项目设定                      ← 非结构化文档
│   ├── 写作规则                   ← writing-rules.md 全文（用户编辑写作规则）
│   └── 写作风格范文              ← writing-style-sample.md 全文（可选，AI 模仿语感）
├── 章节流程                      ← 过程件视图
│   └── EP{N}
│       ├── /episodes/ep{N}/draft ← 草稿/结算判断页
│       └── /episodes/ep{N}       ← 修改文稿编辑器（workspace 下各文件）
└── 章节成稿
    └── /episodes/ep{N}/final     ← 最终稿页面
```

## pipeline 与页面如何对应

同一个 EP，在文件系统里会同时存在 **输入 / 过程件 / 最终稿** 三层：

- `ep{N}/user_input.md` → 用户原始输入
- `ep{N}/workspace/` → 过程层（spine / scene design / QC / write / anchor draft）
- `ep{N}/ep{N}.md` → 最终稿

页面只是把这三层映射出来：

- **draft 页**：看本章结算状态、草案状态、是否阻塞下一章
- **editor 页**：直接编辑 `workspace/` 下各 markdown 文件，并实时预览
- **final 页**：阅读最终稿 `ep{N}/ep{N}.md`

## 项目结构约定

```text
my-project/
├── skill_context/                 # 全局设定目录
│   ├── 人物锚点.md                 # 表格：角色列表
│   ├── 技能锚点.md                 # 表格：能力列表
│   ├── 宝物锚点.md                 # 表格：宝物/线索列表
│   ├── EP锚点.md                   # 表格：各EP出口状态
│   ├── writing-rules.md            # 文档：写作规则（用户编辑）
│   ├── writing-style-sample.md     # 文档：写作风格范文（可选）
│   ├── 人物设定集/                 # 人物详细履历（关联到人物锚点详情）
│   ├── 技能设定集/                 # 技能详细设定
│   ├── 宝物设定集/                 # 宝物详细设定
│   └── 地域设定集/                 # 地域描述文件
├── ep1/
│   ├── user_input.md              # 本章输入
│   ├── ep1.md                     # 最终稿
│   └── workspace/
│       ├── ep-spine.md            # 脊骨设计
│       ├── ep{N}-design.md         # Scene 设计综合文件
│       ├── ep1.md                 # 写作中间稿
│       ├── spine-qc.md            # 脊骨质检
│       ├── design-qc.md            # 设计质检
│       ├── write-qc.md            # 写作质检
│       └── anchor-update-draft.md # 锚点结算单
├── ep2/
└── ep3/
```

## 数据流

```text
文件系统 → Vite 插件 (walkDir)
         → GET /api/project 返回所有 .md 文件
         → mock/data.js 推导出 EP 状态、全局对象、导航、dashboard 数据
         → React 组件渲染

文件写入 → POST /api/project/write
         → 直接写入文件系统 → 重扫文件列表 → 刷新页面后更新
```

所有数据从文件系统推导，无独立数据库。修改 `.md` 文件后刷新页面即生效。

## 文档分工

- `words_from_the_builder.md`：为什么做这个项目、它想把手伸向谁
- `README.md`：repo 导航与 dashboard / 文件结构说明
- `fantasy-pipeline-full-write/references/pipeline-workflow.md`：正式工作流图
- `fantasy-pipeline-full-write/references/opencode-orchestration.md`：opencode 多 agent 执行样例
- `FAMILY_RUNTIME_POLICY.md`：public repo 与本地 runtime 的分层治理规则

## 技术栈

- Vite + React 19
- react-router-dom v7
- react-markdown + remark-gfm
- 纯 CSS（无 UI 框架）

---

## 版本更新历史

### v2.0 — 2026-05-16

**写作规则系统重做：**

- 废除「写作纲领.md」的模板壳模式。原有文件内容八成为空洞通用套话（文戏质感/武戏质感/题材特定规则），Agent 无需依赖此文件也能写出合格小说。
- 新增 `skill_context/writing-rules.md`：用户可编辑的写作规则文件。只保留三个区块——**禁区**（Ignite 时从 user_input 自动提取）、**风格偏好**（用户自行填写）、**参考范文路径**。文件开头附引导语「只挑最关键的写，规则太长反而会稀释 AI 的执行力」。
- 新增 `skill_context/writing-style-sample.md`：可选范文文件。用户在 dashboard 中直接粘贴自己欣赏的文字（1000–2000 字），写作 Agent 在动笔前读一遍，只吸收语言风格（句式节奏、描写密度、对话长短），不复制内容。含版权提示。
- 顶部 Agent 自动填充元数据保留（分类 + 命名风格），以 HTML 注释包裹，不受用户编辑影响。
- 写作流程（`fantasy-scene-write`）Step 1 增加可选范文加载步骤。
- 所有 skill 引用从 写作纲领.md 改为 writing-rules.md，并声明「`##` 标题只用于角色名」，对齐 dashboard 解析器。
- pipeline-full-write 增加说明：writing-rules.md 只在首次 Ignite 时自动生成禁区章节，后续只读不覆写。

**Dashboard 编辑器：**

- 侧边栏「项目设定」入口：写作规则 + 写作风格范文（均可编辑）。
- SettingsDocPage 从纯只读改为双栏编辑器（源码 + 预览），支持保存到文件系统。

**Scene Design 文件格式变更：**

- 从每 Scene 一个独立文件（scene1-design.md / scene2-design.md）改为综合文件 `ep{N}-design.md`，以 `## Scene {N}:` 标题分隔。
- `fantasy-scene-design/fantasy-scene-write/fantasy-design-qc` 均同步更新输入/输出路径。
- QC 输出文件名从 `scene-design-qc.md` 改为 `design-qc.md`。

**Dashboard 人物锚点解析修复：**

- 人物锚点.md 使用 `## 角色名` 分段 + 每段内「项目\|内容」小表的格式，但 `extractMarkdownTable()` 把全部 `|` 行当一张大表解析，导致显示大量空行角色。
- 新增 `parseCharacterSections()` 函数，按 `##` 标题分段解析，每段独立 key-value 转对象。

