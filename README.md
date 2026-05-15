# 少年，还记得你的梦想吗？

> 每一个少年也许都曾有过一个梦想，梦想创造一个世界，然后在那个世界里成为英雄。
>
> 只是，岁月变迁，少年已不再年轻，被生活的重担压得抬不起头。曾经的梦想已是内心深处一点小小的火花，被用心地包起，埋藏在隐秘的角落。
>
> 也许，在夜深人静的时候，少年偶尔想起它，会心一笑，便很快进入了梦乡。
>
> 现在，少年，请拿起这个小小的工具，对着自己内心的花火说一声："**点火。**"

---

# fantasy-pipeline-ui

一个小说创作流程的工作台：在网页里看章节进度、管理全局设定、编辑稿件文件，底部对接文件系统，不依赖数据库。

## 前置要求

- Node.js >= 18
- npm

## 快速开始

```bash
cd dashboard
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`，默认加载 `demo-project/`。

## 切换项目

默认只显示 demo-project。要扫描更多项目，在 `dashboard/` 下创建 `.env` 文件：

```
PROJECTS_DIR=/Users/me/Hermes/projects
```

支持逗号分隔多个目录：

```
PROJECTS_DIR=/Users/me/Hermes/projects,/Users/me/Repos
```

参考模板见 [dashboard/.env.example](./dashboard/.env.example)。

### 项目识别规则

目录下存在 `skill_context/` 文件夹即视为有效项目，会出现在总览页的下拉切换框中。切换后页面刷新，数据自动从新项目的文件系统推导。

## 界面导航

```
总览                        ← 项目概览：EP 状态表 + 阻断提示 + 项目切换
├── 全局对象                ← skill_context/ 解析出的实体视图
│   ├── 人物锚点            ← 人物锚点.md 表格，每人可点进详情
│   ├── 技能锚点            ← 技能锚点.md
│   ├── 宝物锚点            ← 宝物锚点.md
│   ├── 地域设定集          ← 地域设定集/ 下的文件
│   └── EP锚点              ← EP锚点.md 表格
├── 项目设定                ← 非结构化文档
│   └── 写作纲领            ← 写作纲领.md 全文
├── 章节流程                ← ep{N}/workspace/ 推导状态
│   └── EP{N} → 📝 修改文稿 ← 编辑 ep{N}/workspace/ 下各文件
└── 章节成稿                ← 有完整正文的 EP 进入成稿
```

## 项目结构约定

```
my-project/
├── skill_context/           # 全局设定目录
│   ├── 人物锚点.md           # 表格：角色列表
│   ├── 技能锚点.md           # 表格：能力列表
│   ├── 宝物锚点.md           # 表格：宝物/线索列表
│   ├── EP锚点.md             # 表格：各EP出口状态
│   ├── 写作纲领.md           # 文档：写作约束
│   ├── 人物设定集/           # 人物详细履历（关联到人物锚点详情）
│   ├── 技能设定集/           # 技能详细设定
│   ├── 宝物设定集/           # 宝物详细设定
│   └── 地域设定集/           # 地域描述文件
├── ep1/
│   ├── user_input.md        # 本章输入
│   └── workspace/
│       ├── ep-spine.md      # 脊骨设计
│       ├── scene1-design.md # Scene设计
│       ├── ep1.md           # 正文稿件
│       ├── spine-qc.md      # 脊骨质检
│       ├── scene-design-qc.md # 设计质检
│       ├── write-qc.md      # 写作质检
│       └── anchor-update-draft.md # 锚点结算单
├── ep2/
└── ep3/
```

## 数据流

```
文件系统 → Vite 插件 (walkDir)
         → GET /api/project 返回所有 .md 文件
         → mock/data.js 推导出 EP 状态、全局对象、导航、dashboard 数据
         → React 组件渲染

文件写入 → POST /api/project/write
         → 直接写入文件系统 → 重扫文件列表 → 刷新页面后更新
```

所有数据从文件系统推导，无独立数据库。修改 `.md` 文件后刷新页面即生效。

## 技术栈

- Vite + React 19
- react-router-dom v7
- react-markdown + remark-gfm
- 纯 CSS（无 UI 框架）
