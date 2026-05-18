# Fantasy Novel 使用文档

给最终使用者看的说明书。

这个 repo 不是“点一个按钮自动出小说”的产品。
它更像一套协作式写作工作台：
- 任意能读取仓库文件、调用 skill 或按协议推进流程的 Agent 都可以负责推进 pipeline
- skill family 负责定义每个阶段怎么做
- 文件系统负责保存真实产物
- dashboard 负责把项目结构、状态和文稿可视化，并承接人工判断与人工修改

如果一句话概括：
“你用自然语言给方向，Agent 按 skill 推进流程，网页把全过程摊开给你看。”

## 1. 这是什么

repo 主要由四部分组成：

1. skill family
   - fantasy-pipeline-full-write
   - fantasy-ep-spine
   - fantasy-spine-qc
   - fantasy-scene-design
   - fantasy-design-qc
   - fantasy-scene-write
   - fantasy-write-qc

2. project skeleton
   - 约定项目目录结构
   - 约定 skill_context / epN / workspace 的文件职责

3. dashboard
   - 本地网页工作台
   - 用来浏览项目、切换项目、编辑 markdown、查看状态

4. references
   - 放在各 skill 目录下
   - 用来定义工作流、模板、质检规则、写作规则

## 2. 先理解核心分工

在这个系统里，Chatbox 和网页不是互相替代，而是分工不同。

Chatbox / Agent 负责：
- 调用 skill
- 推进阶段
- 读取和生成阶段文件
- 执行 QC
- 生成 anchor-update-draft

Dashboard 负责：
- 看项目当前状态
- 看全局对象
- 看章节流程文件
- 编辑 user_input / workspace 文档 / writing-rules
- 阅读最终稿

也就是说：
- “开始干活”主要在你使用的 Agent 对话里发生
- “查看、校对、修改、判断”主要在网页里发生

## 3. skill 是怎么调用的

最重要的一点：
你一般不是手动输入 skill 名去跑命令，而是在你使用的 Agent 对话里，用触发词触发对应 skill。

常用触发方式：

1. 点火 / 建项目
   - ignite fantasy
   - ignite mecha
   - ignite EP1
   - ignite EP2

2. 脊骨阶段
   - EP1 spine
   - EP2 spine
   - 创建骨架
   - 创建脊骨

3. Scene Design 阶段
   - 开始设计
   - EP1 设计
   - 开始 design

4. 写作阶段
   - 开始写
   - EP1 写作
   - 进入写作

5. QC 阶段
   - QC Spine
   - QC
   - 核验

背后的 skill 对应关系大致是：
- ignite fantasy / ignite EP{N} -> fantasy-pipeline-full-write
- EP{N} spine -> fantasy-ep-spine
- Spine QC -> fantasy-spine-qc
- 开始设计 -> fantasy-scene-design，然后进入 fantasy-design-qc
- 开始写 -> fantasy-scene-write，然后进入 fantasy-write-qc

你可以把它理解成：
“用户说人话，Agent 负责匹配 skill 并执行。”

## 4. 标准工作流

### 阶段 0：Ignite

你在 Agent 对话里说：
- ignite fantasy
或
- ignite EP1

系统会做这些事：
1. 先确认题材（fantasy / mecha）
2. 建立项目骨架
3. 创建 skill_context/
4. 创建 ep1/workspace/
5. 创建 ep1/user_input.md
6. 让你填写 user_input.md
7. Agent 读取 user_input.md
8. 从 user_input 派生出全局锚点文件

这里有一个重要原则：
user_input.md 是你的原始输入，是作品最终是否带有你的思想、带有你的灵魂的关键。

强烈建议你直接使用语音输入法，把脑子里想到的东西尽量完整地说出来。
不用担心条理是否工整，也不用急着先整理成大纲。
这个系统的设计前提就是：用户先尽可能充分表达，后面的工具和 skill 再帮助你整理、提取、结构化。

你只需要自然语言描述：
- 这一部作品想写什么，当前章节想写什么
- 主角起点是什么
- 世界大概是什么感觉
- 你明确想要或明确不要什么

不需要：
- 自己拆 Scene
- 自己写表格
- 自己先做结构化设计

### 阶段 1：Spine

当你确认输入没问题后，在 Agent 对话里说：
- EP1 spine

系统会：
1. 读取 ep1/user_input.md
2. 读取全局锚点
3. 设计本 EP 的 Scene 骨架
4. 生成 ep1/workspace/ep-spine.md
5. 生成或追加人物/技能/宝物设定集
6. 自动进入 spine-qc
7. 输出 ep1/workspace/spine-qc.md

如果题材是 mecha，Spine 还会额外读取并推进：
- 机体锚点
- 科技锚点
- 阵营锚点
- 对应设定集（机体 / 科技 / 阵营 / 舰艇）

这一步结束后不会自动进入下一个创作阶段。
必须由你决定是否继续。

### 阶段 2：Scene Design

当 spine-qc 通过并且你确认继续后，在 Agent 对话里说：
- 开始设计

系统会：
1. 读取 ep-spine.md
2. 读取人物锚点 / 题材对象锚点 / writing-rules.md
   - fantasy：技能锚点 / 宝物锚点
   - mecha：机体锚点 / 科技锚点 / 阵营锚点
3. 为本 EP 的全部 Scene 生成设计稿
4. 输出综合文件：epN/workspace/epN-design.md
5. 自动进入 design-qc
6. 输出 design-qc.md

这一层的作用是把“骨架”变成“可直接写作的合同”。

### 阶段 3：Write

当 design-qc 完成且你决定继续后，在 Agent 对话里说：
- 开始写

系统会：
1. 读取 ep-spine.md
2. 读取 epN-design.md
3. 读取 skill_context 下的全局约束
4. 可选读取 writing-style-sample.md
5. 一口气写完整个 EP
6. 输出中间稿：epN/workspace/epN.md
7. 自动进入 write-qc

### 阶段 4：Write QC + 锚点结算

write-qc 会继续做：
1. 输出 QC 报告：epN/workspace/write-qc.md
2. 生成锚点结算单：epN/workspace/anchor-update-draft.md
3. 复制最终稿到：epN/epN.md

到这里，一个 EP 才算真正收尾。

但要注意：
anchor-update-draft 不是自动写回全局锚点的。

它分两个动作：
1. 你确认草案内容
2. 你真正执行“更新全局锚点”

只有真的写回后，applyStatus 才算 applied。
如果没写回，下一章会被阻断。

## 5. 项目目录怎么理解

一个标准项目大概长这样（fantasy / mecha 共用主骨架，按题材决定附加对象）：

```text
my-project/
├── skill_context/
│   ├── genre.md                   # 题材：fantasy / mecha
│   ├── 人物锚点.md
│   ├── EP锚点.md
│   ├── writing-rules.md
│   ├── writing-style-sample.md
│   ├── 人物设定集/
│   ├── （fantasy）技能锚点.md
│   ├── （fantasy）宝物锚点.md
│   ├── （fantasy）技能设定集/
│   ├── （fantasy）宝物设定集/
│   ├── （fantasy）地域设定集/
│   ├── （mecha）机体锚点.md
│   ├── （mecha）科技锚点.md
│   ├── （mecha）阵营锚点.md
│   ├── （mecha）机体设定集/
│   ├── （mecha）科技设定集/
│   ├── （mecha）阵营设定集/
│   └── （mecha）舰艇设定集/
├── ep1/
│   ├── user_input.md
│   ├── ep1.md
│   └── workspace/
│       ├── ep-spine.md
│       ├── ep1-design.md
│       ├── ep1.md
│       ├── spine-qc.md
│       ├── design-qc.md
│       ├── write-qc.md
│       └── anchor-update-draft.md
└── ep2/
```

请把这三层分清：

1. 全局层：skill_context/
   - 全书范围的约束、锚点、设定集

2. 过程层：epN/workspace/
   - 某一章在 pipeline 各阶段产生的过程文件

3. 成稿层：epN/epN.md
   - 用户最终阅读的该章成稿

## 6. dashboard 怎么启动

在 repo 里进入 dashboard：

```bash
cd dashboard
npm install
npm run dev
```

默认地址：
- http://localhost:5173

默认情况下，如果没有额外配置，只会加载 demo-project。

## 7. 怎么让 dashboard 读取真实项目

dashboard 的项目扫描规则是：
- 读取 PROJECTS_DIR 环境变量
- 扫描这些目录下的子目录
- 只要某个子目录里存在 skill_context/，就把它识别为可切换项目

在 dashboard 目录下创建 .env：

```bash
PROJECTS_DIR=/path/to/projects
```

也可以一次扫多个目录：

```bash
PROJECTS_DIR=/path/to/projects,/another/path/to/projects
```

补充两点：
1. skill_context/ 是项目识别标志
2. dashboard 内也支持通过 PROJECT_PATH 指定当前打开的项目

如果你是从 pipeline 的 Ignite 阶段选择启动 dashboard，协议里约定的启动方式是：

```bash
PROJECT_PATH=<project_root> npm run dev
```

这样 dashboard 会直接打开你当前正在写的那个项目，而不是 demo-project。

## 8. dashboard 的页面布局

整个网页的导航逻辑，可以理解成四层：

```text
总览
├── 全局对象
├── 项目设定
├── 章节流程
└── 章节成稿
```

下面分开说。

### 8.1 总览页

总览页是入口页。

它主要有三块：

1. 顶部项目栏
   - 显示当前项目名
   - 显示项目路径
   - 显示最近扫描时间
   - 如果扫描到多个项目，会有项目切换下拉框

2. Hero 区
   - 显示“当前阻断 / 下一动作”
   - 它不是装饰，而是提醒你现在最该处理什么

3. 下方双栏
   - 左边：EP 状态概览
   - 右边：最近更新

其中最有用的是 EP 状态概览。
每一行都是一个 EP，里面会显示：
- 当前阶段
- pipeline 进度点
- 当前说明
- 下一动作
- 打开入口

如果你不知道下一步该干嘛，先看这里。

### 8.2 全局对象页

这是 skill_context 的“对象视图”，不是文件浏览器。

它会把全局信息按对象重新组织，而不是直接把 markdown 文件堆给你看。

这里通常包括：
- 人物设定集
- fantasy：技能锚点 / 宝物锚点 / 地域设定集
- mecha：机体设定集 / 科技设定集 / 阵营设定集 / 舰艇设定集
- EP锚点
- 待写回结算项

它的重点不是“文件放哪”，而是：
- 这个对象现在是什么状态
- 最近受哪些 EP 影响
- 有没有 pending 的结算动作

如果你要检查角色状态是否连续，或者某个设定有没有被更新，这页最重要。

### 8.3 项目设定页

这里主要承载两类文档：
- writing-rules.md
- writing-style-sample.md

用途分别是：

1. writing-rules.md
   - 写禁区
   - 写风格偏好
   - 写少量关键规则
   - 不建议写得过长，否则会稀释模型执行力

2. writing-style-sample.md
   - 放你喜欢的范文
   - 作用是让写作 Agent 学语感，而不是抄文本
   - 推荐长度 1000-2000 字

网页里这两个页面都支持编辑和保存。
保存时会直接写回 markdown 文件。

### 8.4 章节流程页

这一页本质上是某个 EP 的工作区浏览器。
路径形态是：
- /episodes/epN

它有四个 tab：
- Ignite
- Spine
- Design
- Write

每个 tab 对应一组文件。

例如：
1. Ignite tab
   - epN/user_input.md

2. Spine tab
   - epN/workspace/ep-spine.md
   - epN/workspace/spine-qc.md

3. Design tab
   - epN/workspace/epN-design.md
   - epN/workspace/design-qc.md

4. Write tab
   - epN/workspace/epN.md
   - epN/workspace/write-qc.md
   - epN/workspace/anchor-update-draft.md

这一页是双栏编辑器：
- 左边源码
- 右边预览

你可以直接在这里改文档，保存后会写回文件系统。

这非常适合处理：
- 改 user_input
- 修 spine
- 调整 design
- 看 anchor-update-draft

### 8.5 draft 页

路径类似：
- /episodes/epN/draft

它不是正文页，而是"当前判断页"。

它主要回答：
- 这一章现在卡在哪
- 有没有 anchor draft 阻断
- 下一步应该是确认草案，还是更新全局，还是回去补上游

如果某个 EP 已经写完，但还没做锚点写回，这页会很关键。
因为它直接关系到下一 EP 能不能继续。

### 8.6 final 页

路径类似：
- /episodes/epN/final

这是最终稿阅读页。

特点：
- 只读
- 显示 epN/epN.md
- 会带少量"影响与回跳"信息
- 重点就是读成稿，而不是继续流程解释

如果你只是想当读者看这一章，去 final 页就行。

### 8.7 上下文感知的入口路由

总览页 EP 状态表中的"打开"链接不是固定路径，而是根据文件状态自动推导：

- 存在 `anchor-update-draft.md`（未写回） → `/episodes/epN/draft`
- 存在最终稿（已写完） → `/episodes/epN/final`
- 其他情况 → `/episodes/epN`（编辑器）

这意味着你不需要手动判断该点进哪个页面，系统会引导你去当前最该处理的地方。

## 9. dashboard 的编辑能力有哪些

当前网页可以直接编辑的，主要是 markdown：
- user_input.md
- workspace 里的阶段文档
- writing-rules.md
- writing-style-sample.md

保存机制是：
1. 前端 POST 到 /api/project/write
2. Vite 插件校验路径
3. 只允许写 .md 文件
4. 直接写回项目目录
5. 重新扫描文件并刷新状态

也就是说，网页不是在改一份缓存，而是在改真实文件。

## 10. 一个最实用的使用姿势

如果你第一次用，建议这样：

1. 启动 dashboard
2. 在 Agent 对话里说 ignite fantasy
3. 打开生成的 ep1/user_input.md
4. 在网页或编辑器里填输入
5. 回 Agent 对话里说“写好了”或直接说 EP1 spine
6. 看 spine-qc 结果
7. 确认后说“开始设计”
8. 看 design-qc
9. 确认后说“开始写”
10. 去 final 页读成稿
11. 去 draft 页处理锚点结算
12. 完成后再进入下一 EP

这个节奏最接近它真实设计出来的工作方式。

## 11. 使用时最容易踩的坑

### 坑 1：以为 dashboard 会自动替你跑 pipeline
不会。

dashboard 负责展示和编辑，不负责自动创作推进。
推进动作还是要在 Agent 对话里触发。

### 坑 2：把 user_input 当成结构化表单
不用。

正确写法是自然语言原文。
结构化工作交给 Agent 派生。

### 坑 3：spine-qc 过了就以为会自动继续
不会。

协议明确要求：
QC 之后必须停住，等用户决定是否进入下一创作阶段。

### 坑 4：确认锚点草案 = 已写回全局
不是。

“确认锚点草案”只是 review confirmed。
真正执行“更新全局锚点”之后，才是 apply applied。

### 坑 5：Globals 页当成文件页看
不对。

Globals 看的是对象状态。
如果你只想找源文件路径，再去对应文档页看。

### 坑 6：把 workspace/epN.md 和 epN/epN.md 混掉
要分清：
- workspace/epN.md = 写作中间稿
- epN/epN.md = 最终稿

## 12. 给用户的最短操作清单

如果你只想记住最短版，就记这几句：

1. 在 Agent 对话里：ignite fantasy
2. 填 ep1/user_input.md
3. 在 Agent 对话里：EP1 spine
4. 确认后：开始设计
5. 确认后：开始写
6. 在网页里看：
   - 总览页看状态
   - Globals 看全局对象
   - episodes/epN 看过程文档
   - final 看成稿
   - draft 处理锚点结算

## 13. 附：repo 内各目录的职责

```text
fantasy-pipeline-full-write/
  总管线协议，定义阶段边界、停止点、触发词、项目骨架规则

fantasy-ep-spine/
  负责 EP 脊骨设计

fantasy-spine-qc/
  负责 Spine 质量核验

fantasy-scene-design/
  负责全部 Scene 的设计合同输出

fantasy-design-qc/
  负责 Scene Design 核验

fantasy-scene-write/
  负责整章写作

fantasy-write-qc/
  负责全稿 QC、锚点结算单、最终稿复制

dashboard/
  本地网页工作台
```

## 14. 附：几句最常用的对话指令

```text
ignite fantasy
ignite EP1
EP1 spine
开始设计
开始写
确认锚点草案
更新全局锚点
```

如果要一句话结束这份文档：
这个 repo 的最佳使用方式，不是把它当“写小说按钮”，而是把它当“人与 Agent 共写长篇幻想小说的工作流系统”。
