const PROJECT_ROOT = '/project'

let _projectName = ''

async function loadProjectFiles() {
  if (!import.meta.env.DEV) return []

  try {
    const res = await fetch('/api/project')
    if (!res.ok) return []
    const { files, projectName } = await res.json()
    _projectName = projectName || ''
    return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath, 'zh-Hans-CN'))
  } catch {
    return []
  }
}

const rawFiles = await loadProjectFiles()

const fileMap = Object.fromEntries(rawFiles.map((file) => [file.relativePath, file]))
export const episodeNumbers = Array.from(
  new Set(
    rawFiles
      .map((file) => file.relativePath.match(/^ep(\d+)\//)?.[1])
      .filter(Boolean),
  ),
)
  .map(Number)
  .sort((a, b) => a - b)

function nowTime() {
  const date = new Date()
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function read(relativePath) {
  return fileMap[relativePath]?.content || ''
}

function exists(relativePath) {
  return Boolean(fileMap[relativePath])
}

function lines(text) {
  return text.split(/\r?\n/)
}

function trimParagraphs(text, limit = 3) {
  return text
    .split(/\n\s*\n/)
    .map((item) => item.replace(/^#+\s*/gm, '').trim())
    .filter(Boolean)
    .filter((item) => !/(^|\n)review status[:：]/i.test(item))
    .filter((item) => !/(^|\n)apply status[:：]/i.test(item))
    .slice(0, limit)
}

function extractBulletValues(text) {
  return lines(text)
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
}

function extractMarkdownTable(text) {
  const tableLines = lines(text).filter((line) => /^\|/.test(line.trim()))
  if (tableLines.length < 2) return []

  const rows = tableLines
    .map((line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim()))
    .filter((cells) => cells.some((cell) => cell))

  if (rows.length < 2) return []
  const headers = rows[0]

  return rows
    .slice(2)
    .filter((cells) => !cells.every((cell) => /^-+$/.test(cell)))
    .map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ''])))
}

function extractAfterLabel(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = text.match(new RegExp(`${escaped}[:：]\s*(.+)`))
  return match?.[1]?.trim() || ''
}

function summarizeStatus(text) {
  if (/unapplied/i.test(text)) return '待写回'
  if (/applied/i.test(text)) return '已写回'
  if (/confirmed/i.test(text)) return '已确认'
  return '待确认'
}

function toneFromStatus(text) {
  if (/待写回|待确认|阻断|blocked/i.test(text)) return 'red'
  if (/已完成|已写回|Final|存在/.test(text)) return 'green'
  if (/进行中|待填写|可准备|方向已定/.test(text)) return 'blue'
  if (/未开始|未生成|待补/.test(text)) return 'orange'
  return 'gray'
}

function getMarkdownHeadings(text) {
  return lines(text)
    .map((line) => line.match(/^(#{1,3})\s+(.+)/))
    .filter(Boolean)
    .map((match) => ({ level: match[1].length, text: match[2].trim() }))
}

function safeValue(row, keys) {
  for (const key of keys) {
    if (row[key]) return row[key]
  }
  return ''
}

function firstNonEmpty(...values) {
  return values.find((value) => String(value || '').trim()) || ''
}

function makeDisplayPath(relativePath) {
  return `project/${relativePath}`
}

function objectSummary(parts) {
  return parts.filter(Boolean).join(' · ')
}

function summarizeDraftRecord(file) {
  const ep = file.relativePath.match(/ep(\d+)/)?.[1]
  const reviewStatus = extractAfterLabel(file.content, 'review status') || 'pending'
  const applyStatus = extractAfterLabel(file.content, 'apply status') || 'unapplied'
  const bullet = extractBulletValues(file.content).find((item) => !/^(review|apply) status[:：]/i.test(item)) || trimParagraphs(file.content, 1).find((item) => !/(review|apply) status[:：]/i.test(item)) || '本章产生了待结算的锚点变化。'
  return {
    ep: `EP${ep}`,
    to: `/episodes/ep${ep}/draft`,
    reviewStatus,
    applyStatus,
    statusLabel: applyStatus === 'applied' ? '已写回' : reviewStatus === 'confirmed' ? '已确认待写回' : '待确认',
    summary: bullet,
  }
}

function buildStageSlots(epNumber) {
  const prefix = `ep${epNumber}`
  const workspace = `${prefix}/workspace`
  const hasSceneFiles = rawFiles.some((file) => file.relativePath.startsWith(`${workspace}/scene`))
  const finalExists = exists(`${workspace}/ep${epNumber}.md`) || exists(`${prefix}/ep${epNumber}.md`)
  const draftExists = exists(`${workspace}/anchor-update-draft.md`)

  return [
    {
      name: '用户输入',
      status: exists(`${prefix}/user_input.md`) ? '已存在' : '未创建',
      statusClass: exists(`${prefix}/user_input.md`) ? 'done' : 'empty',
      slots: [
        {
          name: '本章输入',
          badge: exists(`${prefix}/user_input.md`) ? '已就绪' : '未创建',
          tone: exists(`${prefix}/user_input.md`) ? 'blue' : 'gray',
          meta: exists(`${prefix}/user_input.md`) ? '保留用户原始意图，供后续骨架直接读取。' : '等待创建输入模板。',
          active: exists(`${prefix}/user_input.md`),
          missing: !exists(`${prefix}/user_input.md`),
        },
      ],
    },
    {
      name: 'Spine',
      status: exists(`${workspace}/ep-spine.md`) ? '已完成' : '未开始',
      statusClass: exists(`${workspace}/ep-spine.md`) ? 'done' : 'empty',
      slots: [
        {
          name: '章节骨架',
          badge: exists(`${workspace}/ep-spine.md`) ? '已生成' : '未生成',
          tone: exists(`${workspace}/ep-spine.md`) ? 'purple' : 'gray',
          meta: exists(`${workspace}/ep-spine.md`) ? '本章骨架已落盘。' : '等待输入确认后生成。',
          missing: !exists(`${workspace}/ep-spine.md`),
        },
        {
          name: '骨架核验',
          badge: exists(`${workspace}/spine-qc.md`) ? '已记录' : '未生成',
          tone: exists(`${workspace}/spine-qc.md`) ? 'orange' : 'gray',
          meta: exists(`${workspace}/spine-qc.md`) ? 'Spine QC 已落盘。' : '骨架完成后才会生成。',
          missing: !exists(`${workspace}/spine-qc.md`),
        },
      ],
    },
    {
      name: 'Scene Design',
      status: hasSceneFiles ? '已开始' : '未开始',
      statusClass: hasSceneFiles ? 'done' : 'empty',
      slots: rawFiles
        .filter((file) => file.relativePath.startsWith(`${workspace}/scene`) && file.relativePath.endsWith('.md'))
        .map((file) => ({
          name: file.relativePath.includes('qc') ? '设计核验' : file.relativePath.split('/').pop()?.replace('.md', ''),
          badge: '已生成',
          tone: file.relativePath.includes('qc') ? 'orange' : 'purple',
          meta: file.relativePath.includes('qc') ? '本章设计核验记录。' : '本场景写作依据。',
        }))
        .concat(
          exists(`${workspace}/scene-design-qc.md`)
            ? []
            : [{ name: '设计核验', badge: '未生成', tone: 'gray', meta: '设计阶段未完成。', missing: true }],
        ),
    },
    {
      name: 'Write',
      status: finalExists ? '已完成' : '等待上游',
      statusClass: finalExists ? 'done' : 'blocked',
      slots: [
        {
          name: '本章正文',
          badge: finalExists ? '已生成' : '未生成',
          tone: finalExists ? 'blue' : 'red',
          meta: finalExists ? '本章正文已生成。' : '写作阶段尚未完成。',
          missing: !finalExists,
          blocked: !finalExists,
        },
        {
          name: '锚点结算单',
          badge: draftExists ? summarizeStatus(read(`${workspace}/anchor-update-draft.md`)) : '尚未到达',
          tone: draftExists ? toneFromStatus(summarizeStatus(read(`${workspace}/anchor-update-draft.md`))) : 'gray',
          meta: draftExists ? '本章写作结束后的跨 EP 结算动作。' : '写作结束后才会出现。',
          active: draftExists,
          warning: draftExists && /unapplied/i.test(read(`${workspace}/anchor-update-draft.md`)),
          missing: !draftExists,
        },
      ],
    },
    {
      name: 'Final',
      status: finalExists ? '已存在' : '未生成',
      statusClass: finalExists ? 'done' : 'empty',
      slots: [
        {
          name: '最终稿',
          badge: finalExists ? '可阅读' : '未生成',
          tone: finalExists ? 'green' : 'gray',
          meta: finalExists ? '最终稿已可阅读。' : '最终稿尚不存在。',
          missing: !finalExists,
        },
      ],
    },
  ]
}

const characterRows = extractMarkdownTable(read('skill_context/人物锚点.md'))
const skillRows = extractMarkdownTable(read('skill_context/技能锚点.md'))
const treasureRows = extractMarkdownTable(read('skill_context/宝物锚点.md'))
const episodeAnchorRows = extractMarkdownTable(read('skill_context/EP锚点.md'))
const regionFiles = rawFiles.filter((file) => file.relativePath.startsWith('skill_context/地域设定集/'))

const anchorDraftFiles = rawFiles.filter((file) => file.relativePath.endsWith('anchor-update-draft.md'))
const blockerDrafts = anchorDraftFiles.filter((file) => /apply status:\s*unapplied/i.test(file.content))
const primaryBlocker = blockerDrafts[0]
const primaryBlockerEp = primaryBlocker?.relativePath.match(/ep(\d+)/)?.[1]
const latestEpisode = episodeNumbers[episodeNumbers.length - 1]
const latestInputEpisode = episodeNumbers.find((ep) => exists(`ep${ep}/user_input.md`) && !exists(`ep${ep}/workspace/ep-spine.md`))

function blockingDraftBefore(epNumber) {
  return blockerDrafts
    .map((file) => Number(file.relativePath.match(/ep(\d+)/)?.[1]))
    .filter((value) => Number.isFinite(value) && value < epNumber)
    .sort((a, b) => b - a)[0]
}

function buildDraftDetail(epNumber) {
  const draftPath = `ep${epNumber}/workspace/anchor-update-draft.md`
  const draftExists = exists(draftPath)

  if (!draftExists) {
    // No settlement doc yet — show pipeline progress
    return {
      episode: `EP${epNumber}`,
      title: '章节进度',
      subtitle: '本章尚未进入结算阶段',
      statusBar: null,
      helper: `EP${epNumber} 的流水线文件会在每个阶段自动生成。当前可以查看本章已有的成果，或继续推进到下一阶段。`,
      mode: '决策',
      filePath: null,
      editHint: '未进入结算阶段，暂不需要人工确认。',
      sideStages: buildStageSlots(epNumber),
      draftContent: null,
      decisions: null,
      actionSteps: ['1. 查看当前已有的文件', '2. 判断是否需要继续推进', '3. 推进到下一阶段', '4. 写作完成后返回草稿页确认结算单'],
      info: {
        meta: [
          ['位置', `ep${epNumber}/`],
          ['阶段', '流水线推进中'],
          ['下一动作', dashboardData.episodes.find(e => e.ep === `EP${epNumber}`)?.next || '继续推进'],
        ],
        identity: '当前 EP 的草稿页会随着流水线阶段自动更新内容。',
        jumps: [
          { label: `打开 EP${epNumber} 文稿编辑`, to: `/episodes/ep${epNumber}`, button: '打开' },
          { label: '返回总览', to: '/', button: '打开' },
        ],
      },
    }
  }

  const draftText = read(draftPath)
  const reviewStatus = extractAfterLabel(draftText, 'review status') || 'pending'
  const applyStatus = extractAfterLabel(draftText, 'apply status') || 'unapplied'
  const draftHeading = getMarkdownHeadings(draftText)[0]?.text || `EP${epNumber} 结束后建议写回的锚点变更`
  const draftParagraphs = trimParagraphs(draftText, 3)
  const draftBullets = extractBulletValues(draftText).slice(0, 6)
  const reviewLabel = reviewStatus === 'confirmed' ? '已完成人工确认' : reviewStatus === 'rejected' ? '已退回' : '等待人工确认'
  const applyLabel = applyStatus === 'applied' ? '已写回全局' : '尚未写回全局'

  return {
    episode: `EP${epNumber}`,
    title: '锚点结算单',
    subtitle: `${reviewLabel} · ${applyLabel}`,
    statusBar: applyStatus === 'unapplied'
      ? `EP${epNumber} 的锚点结算单仍未写回全局，因此继续阻断后续章节。`
      : `EP${epNumber} 的锚点结算单已写回全局，当前不再阻断后续章节。`,
    helper: '这个页面的核心不是润色正文，而是判断这些变化是否足够稳定，值得升级为全局锚点。',
    mode: '决策',
    filePath: makeDisplayPath(draftPath),
    editHint: '先确认变更是否成立，再决定是否写回全局对象。',
    sideStages: buildStageSlots(epNumber),
    draftContent: {
      heading: draftHeading,
      paragraphs: draftParagraphs.length ? draftParagraphs : ['当前结算单缺少可提取段落，请直接查看原文。'],
      bullets: draftBullets.length ? draftBullets : ['当前结算单缺少明确 bullet，建议直接按原文判断。'],
    },
    decisions: [
      {
        title: '为什么它会阻断后续章节',
        body: '因为全局锚点是后续 EP 的连续性基线。若本章结算单不先确认并写回，下一章就可能在旧锚点上继续展开。',
      },
      {
        title: '你现在要做的判断',
        body: '先确认这些变化是否稳定，再决定是否写回全局对象。只有真正写回后，阻断才会解除。',
      },
    ],
    actionSteps: ['1. 对照本章最终稿', '2. 检查是否夸大变化', '3. 确认并更新全局锚点', '4. 返回总览查看解阻结果'],
    info: {
      meta: [
        ['位置', makeDisplayPath(draftPath)],
        ['阶段', '跨 EP 结算动作'],
        ['人工确认', reviewLabel],
        ['全局写回', applyLabel],
      ],
      identity: '它不是普通存档文件，而是跨 EP 结算动作。应被顶到当前工作流最前面。',
      jumps: [
        { label: `查看 EP${epNumber} 最终稿`, to: `/episodes/ep${epNumber}/final`, button: '打开' },
        { label: '查看全局对象', to: '/globals', button: '打开' },
        { label: '返回总览', to: '/', button: '打开' },
      ],
    },
  }
}

function buildInputDetail(epNumber) {
  const inputPath = `ep${epNumber}/user_input.md`
  const inputText = read(inputPath)
  const previewHeading = getMarkdownHeadings(inputText)[0]?.text || `EP${epNumber} 输入摘要`
  const paragraphs = trimParagraphs(inputText, 2)
  const bullets = extractBulletValues(inputText)
  const blockingEp = blockingDraftBefore(epNumber)

  return {
    episode: `EP${epNumber}`,
    title: '本章输入',
    subtitle: blockingEp
      ? `当前可以继续准备，但上游 EP${blockingEp} 仍有跨 EP 阻断`
      : '当前没有跨 EP 阻断，这份输入可直接进入后续骨架阶段',
    statusBar: blockingEp
      ? `你现在可以先补充本章输入，但 EP${blockingEp} 的结算单尚未写回，因此这里只是“可准备”，不是“可继续下一章”。`
      : '当前没有跨 EP 阻断，这份输入可以作为下一步 Spine 的直接入口。',
    helper: '自然语言输入，不需要结构化表单。这里保留用户原文，不由 Agent 改写。',
    mode: '编辑',
    filePath: makeDisplayPath(inputPath),
    editHint: '直接修改 Markdown 原文即可，保持用户自然语言输入。',
    textarea: inputText,
    preview: {
      heading: previewHeading,
      intro: paragraphs[0] || '当前输入文件暂无可提取摘要。',
      rhythm: bullets.slice(0, 3),
      taboo: bullets.slice(3, 6),
    },
    sideStages: buildStageSlots(epNumber),
    info: {
      meta: [
        ['位置', makeDisplayPath(inputPath)],
        ['类型', '用户输入原文'],
        ['更新时间', nowTime()],
        ['阻断状态', blockingEp ? `受 EP${blockingEp} 结算单影响` : '无跨 EP 阻断'],
      ],
      risk: blockingEp
        ? `当前最大风险不是输入不够结构化，而是误以为“输入已填写 = 可以继续下一章”。上游 EP${blockingEp} 结算单未写回前，不应推进下一阶段。`
        : '当前主要风险是输入过于抽象，建议明确节奏、禁区和本章推进目标。',
      jumps: [
        ...(blockingEp ? [{ label: `查看 EP${blockingEp} 结算单`, to: `/episodes/ep${blockingEp}/draft`, button: '打开' }] : []),
        { label: '查看全局对象', to: '/globals', button: '打开' },
        { label: '返回总览', to: '/', button: '打开' },
      ],
    },
  }
}

function buildFinalDetail(epNumber) {
  const rootPath = `ep${epNumber}/ep${epNumber}.md`
  const workspacePath = `ep${epNumber}/workspace/ep${epNumber}.md`
  const finalPath = exists(rootPath) ? rootPath : workspacePath
  const finalText = read(finalPath)
  const title = getMarkdownHeadings(finalText)[0]?.text || `EP${epNumber}`
  const relatedDraft = exists(`ep${epNumber}/workspace/anchor-update-draft.md`)
  const draftText = read(`ep${epNumber}/workspace/anchor-update-draft.md`)
  const impactBullets = extractBulletValues(draftText).slice(0, 4)

  return {
    episode: `EP${epNumber}`,
    title,
    subtitle: relatedDraft
      ? '最终稿已生成；本章同时留有锚点结算单，可继续确认其对全局对象的影响。'
      : '最终稿已生成；当前以阅读和回看为主。',
    filePath: makeDisplayPath(finalPath),
    editHint: '结果页只负责阅读最终稿；流程回跳入口保留，但降为次级。',
    fullText: finalText,
    summary: [
      { label: '正文长度', value: `${finalText.length}`, sub: '字符数' },
      { label: '段落数量', value: `${trimParagraphs(finalText, 10).length}`, sub: '按自然段粗略统计' },
      { label: '结算状态', value: relatedDraft ? summarizeStatus(draftText) : '无额外结算', sub: relatedDraft ? '本章仍附带锚点结算动作' : '本章没有额外结算文件' },
    ],
    impacts: impactBullets.length
      ? impactBullets.map((item, index) => ({
          title: `影响点 ${index + 1}`,
          body: item,
        }))
      : [
          {
            title: '暂无单独影响摘要',
            body: '当前没有提取到结算单 bullet，可直接阅读最终稿并回看全局对象。',
          },
        ],
    related: [
      ...(relatedDraft ? [{ label: `回看 EP${epNumber} 结算单`, to: `/episodes/ep${epNumber}/draft`, tone: 'red' }] : []),
      { label: '查看全局对象', to: '/globals', tone: 'blue' },
      { label: '回总览', to: '/', tone: 'gray' },
    ],
  }
}

function buildCharacterObjects() {
  return characterRows.map((row, index) => {
    const name = safeValue(row, ['角色', '人物', '名称'])
    const settingPath = name ? `skill_context/人物設定集/${name}.md` : null
    const settingFile = settingPath && exists(settingPath) ? rawFiles.find(f => f.relativePath === settingPath) : null
    return {
      id: `character-${index}`,
      type: 'object',
      objectType: '人物',
      to: `/globals/人物锚点/${encodeURIComponent(name || `人物${index + 1}`)}`,
      label: name || `人物${index + 1}`,
      status: firstNonEmpty(safeValue(row, ['入口状态', '当前状态']), '状态待补'),
      summary: objectSummary([
        safeValue(row, ['弧线类型', '类型']),
        safeValue(row, ['入口状态', '当前状态']),
      ]),
      chips: [safeValue(row, ['弧线类型', '类型']), safeValue(row, ['出口目标', '目标'])].filter(Boolean),
      details: Object.entries(row).filter(([, value]) => value),
      rawText: settingFile?.content || null,
      filePath: settingFile ? makeDisplayPath(settingFile.relativePath) : null,
    }
  })
}

function buildSkillObjects() {
  return skillRows.map((row, index) => ({
    id: `skill-${index}`,
    type: 'object',
    objectType: '技能',
    to: `/globals/技能锚点/${encodeURIComponent(safeValue(row, ['技能', '名称']) || `技能${index + 1}`)}`,
    label: safeValue(row, ['技能', '名称']) || `技能${index + 1}`,
    status: firstNonEmpty(safeValue(row, ['阶段', '状态']), '状态待补'),
    summary: objectSummary([
      safeValue(row, ['阶段', '状态']),
      safeValue(row, ['说明', '备注']),
    ]),
    chips: [safeValue(row, ['来源', '类别']), safeValue(row, ['阶段', '状态'])].filter(Boolean),
    details: Object.entries(row).filter(([, value]) => value),
  }))
}

function buildTreasureObjects() {
  return treasureRows.map((row, index) => ({
    id: `treasure-${index}`,
    type: 'object',
    objectType: '宝物 / 线索',
    to: `/globals/宝物锚点/${encodeURIComponent(safeValue(row, ['宝物', '名称', '线索']) || `宝物${index + 1}`)}`,
    label: safeValue(row, ['宝物', '名称', '线索']) || `宝物${index + 1}`,
    status: firstNonEmpty(safeValue(row, ['状态', '阶段']), '状态待补'),
    summary: objectSummary([
      safeValue(row, ['状态', '阶段']),
      safeValue(row, ['说明', '备注']),
    ]),
    chips: [safeValue(row, ['来源', '类别']), safeValue(row, ['状态', '阶段'])].filter(Boolean),
    details: Object.entries(row).filter(([, value]) => value),
  }))
}

function buildRegionObjects() {
  return regionFiles.map((file, index) => {
    const title = file.relativePath.split('/').pop()?.replace('.md', '') || `地域${index + 1}`
    const paragraphs = trimParagraphs(file.content, 2)
    return {
      id: `region-${index}`,
      type: 'object',
      objectType: '地域',
      to: `/globals/地域设定集/${encodeURIComponent(title)}`,
      label: title,
      status: '可读取',
      summary: paragraphs[0] || '地域说明待补。',
      chips: [`标题 ${getMarkdownHeadings(file.content).length}`],
      details: [
        ['位置', makeDisplayPath(file.relativePath)],
        ['摘要', paragraphs[0] || '待补'],
        ['补充', paragraphs[1] || '无'],
      ],
      rawText: file.content,
      filePath: makeDisplayPath(file.relativePath),
    }
  })
}

const characterObjects = buildCharacterObjects()
const skillObjects = buildSkillObjects()
const treasureObjects = buildTreasureObjects()
const regionObjects = buildRegionObjects()
const episodeAnchorObjects = episodeAnchorRows.map((row, index) => ({
  id: `ep-${index}`,
  type: 'object',
  objectType: 'EP 出口',
  to: `/globals/EP锚点/${encodeURIComponent(safeValue(row, ['EP', '角色']) || `记录${index + 1}`)}`,
  label: safeValue(row, ['EP']) ? `${safeValue(row, ['EP'])} · ${safeValue(row, ['角色']) || ''}` : `记录${index + 1}`,
  status: safeValue(row, ['不可逆事件']) ? '已完成' : '待确认',
  summary: objectSummary([
    safeValue(row, ['入口状态']),
    safeValue(row, ['出口状态']),
  ]),
  chips: [safeValue(row, ['EP']), safeValue(row, ['角色'])].filter(Boolean),
  details: Object.entries(row).filter(([, value]) => value),
}))
// 项目设定 — 可编辑文档
const rulesDoc = {
  type: 'document',
  objectType: '项目配置',
  label: '写作规则',
  summary: '写作规则：禁区、风格偏好、参考范文路径。用户可自由编辑。',
  rawText: read('skill_context/writing-rules.md'),
  filePath: makeDisplayPath('skill_context/writing-rules.md'),
}

const styleSampleDoc = {
  type: 'document',
  objectType: '项目配置',
  label: '写作风格范文',
  summary: '用于 AI 模仿语言风格。推荐 1000–2000 字，仅学语感不抄内容。',
  rawText: read('skill_context/writing-style-sample.md'),
  filePath: makeDisplayPath('skill_context/writing-style-sample.md'),
}

const globalsSections = [
  {
    type: 'collection',
    to: '/globals/人物锚点',
    label: '人物锚点',
    summary: '人物对象视图：看角色当前状态、弧线与待处理影响。',
    metrics: [{ label: '人物数量', value: String(characterObjects.length), sub: '来自人物锚点表' }],
    children: characterObjects,
  },
  {
    type: 'collection',
    to: '/globals/技能锚点',
    label: '技能锚点',
    summary: '技能对象视图：看能力阶段、来源与状态。',
    metrics: [{ label: '技能数量', value: String(skillObjects.length), sub: '来自技能锚点表' }],
    children: skillObjects,
  },
  {
    type: 'collection',
    to: '/globals/宝物锚点',
    label: '宝物锚点',
    summary: '宝物 / 线索对象视图：看线索状态和待写回变化。',
    metrics: [{ label: '对象数量', value: String(treasureObjects.length), sub: '来自宝物锚点表' }],
    children: treasureObjects,
  },
  {
    type: 'collection',
    to: '/globals/地域设定集',
    label: '地域设定集',
    summary: '地域对象视图：看地点、摘要与当前可用信息。',
    metrics: [{ label: '地域数量', value: String(regionObjects.length), sub: '来自地域设定集文件' }],
    children: regionObjects,
  },
  {
    type: 'collection',
    to: '/globals/EP锚点',
    label: 'EP锚点',
    summary: 'EP 出口状态记录：各章各角色的入口状态→出口状态→不可逆事件。',
    metrics: [{ label: 'EP 记录', value: String(episodeAnchorObjects.length), sub: '来自 EP锚点.md 表格' }],
    children: episodeAnchorObjects,
  },
]

const globalsRouteMap = new Map()

const globalsOverview = {
  type: 'overview',
  label: 'Global Objects',
  summary: 'Globals 只回答对象现在处于什么状态、受哪些 EP 影响、是否还有待写回动作。',
  metrics: [
    { label: '人物对象', value: String(characterObjects.length), sub: '当前角色锚点' },
    { label: '技能对象', value: String(skillObjects.length), sub: '能力与阶段' },
    { label: '宝物对象', value: String(treasureObjects.length), sub: '线索与宝物' },
    { label: 'EP 记录', value: String(episodeAnchorObjects.length), sub: '出口状态记录' },
  ],
  meta: [
    ['对象页范围', '人物 / 技能 / 宝物 / 地域 / EP锚点'],
    ['说明', '这里只看对象状态，不替代过程文件浏览'],
    ['最后扫描', nowTime()],
  ],
  children: globalsSections,
}

globalsRouteMap.set('/globals', globalsOverview)

for (const section of globalsSections) {
  globalsRouteMap.set(section.to, section)
  globalsRouteMap.set(decodeURIComponent(section.to), section)
  for (const child of section.children) {
    globalsRouteMap.set(child.to, child)
    globalsRouteMap.set(decodeURIComponent(child.to), child)
  }
}

export const globalsNavTree = globalsSections.map((section) => ({
  to: section.to,
  label: section.label,
  badge: String(section.children.length),
  children: section.children.map((child) => ({
    to: child.to,
    label: child.label,
    badge: child.type === 'draftRecord' ? child.status : child.objectType || '对象',
  })),
}))

export function getSettingsDoc(name) {
  const map = {
    'writing-rules': rulesDoc,
    '写作风格范文': styleSampleDoc,
  }
  return map[name] || null
}

export function getGlobalsDetail(pathname) {
  const decodedPath = decodeURIComponent(pathname)
  const directMatch = globalsRouteMap.get(decodedPath) || globalsRouteMap.get(pathname)
  if (directMatch) return directMatch

  const parts = decodedPath.split('/').filter(Boolean)
  if (parts[0] !== 'globals') return globalsRouteMap.get('/globals')
  if (parts.length === 1) return globalsRouteMap.get('/globals')

  const sectionLabel = parts[1]
  const entryLabel = parts[2]
  const section = globalsSections.find((item) => item.label === sectionLabel)
  if (!section) return globalsRouteMap.get('/globals')
  if (!entryLabel) return section

  return section.children.find((child) => child.label === entryLabel) || section
}

export const projectMeta = {
  name: _projectName || '幻想小说项目',
  path: '项目根目录',
  lastScan: nowTime(),
}

export const mainNav = [{ to: '/', label: '总览', badge: '当前' }]

export const managementNav = episodeNumbers.map((ep) => {
  const hasDraft = exists(`ep${ep}/workspace/anchor-update-draft.md`)
  const hasInput = exists(`ep${ep}/user_input.md`)
  const hasSpine = exists(`ep${ep}/workspace/ep-spine.md`)
  const hasDesign = exists(`ep${ep}/workspace/ep${ep}-design.md`)
  const hasWrite = exists(`ep${ep}/workspace/ep${ep}.md`)
  let badge = '空'
  if (hasDraft) {
    badge = summarizeStatus(read(`ep${ep}/workspace/anchor-update-draft.md`))
  } else if (hasWrite) {
    badge = '写作'
  } else if (hasDesign) {
    badge = '设计'
  } else if (hasSpine) {
    badge = '脊骨'
  } else if (hasInput) {
    badge = '输入'
  }
  return {
    to: `/episodes/ep${ep}/draft`,
    label: `EP${ep}`,
    badge,
    children: [
      { to: `/episodes/ep${ep}`, label: '📝 修改文稿' },
    ],
  }
})

export const outcomeNav = episodeNumbers
  .filter((ep) => exists(`ep${ep}/workspace/ep${ep}.md`) || exists(`ep${ep}/ep${ep}.md`))
  .map((ep) => ({
    to: `/episodes/ep${ep}/final`,
    label: `EP${ep}`,
    badge: '成稿',
  }))

export const navSections = [
  {
    id: 'globals',
    title: '全局对象',
    defaultOpen: false,
    items: [
      {
        to: '/globals',
        label: '全局对象',
        badge: String(globalsSections.length),
        children: globalsNavTree,
      },
    ],
  },
  {
    id: 'project-settings',
    title: '项目设定',
    defaultOpen: false,
    items: [
      {
        to: '/settings/writing-rules',
        label: '写作规则',
        badge: '项目配置',
        editable: true,
      },
      {
        to: '/settings/写作风格范文',
        label: '写作风格范文',
        badge: '项目配置',
        editable: true,
      },
    ],
  },
  {
    id: 'episodes-management',
    title: '章节流程',
    defaultOpen: false,
    items: managementNav,
  },
  {
    id: 'episodes-outcome',
    title: '章节成稿',
    defaultOpen: false,
    items: outcomeNav,
  },
]

export const dashboardData = {
  hero: primaryBlocker
    ? {
        title: `先处理 EP${primaryBlockerEp} 锚点结算，再继续后续章节`,
        body: `下一章的本章输入可以先填写，但当前真正的项目阻断源仍是 EP${primaryBlockerEp} 的结算单尚未写回全局。`,
      }
    : {
        title: '当前没有跨 EP 阻断',
        body: '当前没有发现仍未写回全局的结算动作。接下来可以把注意力放在最新输入或未完成阶段。',
      },
  summary: [
    { label: '当前阻断源', value: primaryBlocker ? `EP${primaryBlockerEp} 结算单` : '无', sub: primaryBlocker ? '跨章阻断，不是下一章内部失败。' : '可继续推进。' },
    { label: '下一动作', value: primaryBlocker ? '确认并写回锚点' : '检查最新输入', sub: primaryBlocker ? '先结清结算单，再继续。' : '根据章节页决定进入哪个 EP。' },
    { label: '可并行准备', value: latestInputEpisode ? `EP${latestInputEpisode} 输入` : '无', sub: latestInputEpisode ? '可以先写本章输入，但不自动解除阻断。' : '暂无新的准备项。' },
  ],
  queue: [
    ...(primaryBlocker
      ? [
          {
            rank: 1,
            tone: 'red',
            tag: 'P0 / 必须先结清',
            title: `确认 EP${primaryBlockerEp} 的锚点结算单`,
            meta: ['阻断后续章节', '人工确认动作', '来源：写作质检'],
            body: '它不是普通文件，而是待决动作。如果不结清，下一 EP 即使输入填完，也不应该继续正式推进。',
            primaryTo: `/episodes/ep${primaryBlockerEp}/draft`,
            primaryLabel: '打开结算单',
            secondaryTo: `/episodes/ep${primaryBlockerEp}/final`,
            secondaryLabel: '查看最终稿',
          },
        ]
      : []),
    ...(latestInputEpisode
      ? [
          {
            rank: primaryBlocker ? 2 : 1,
            tone: 'blue',
            tag: 'P1 / 可并行准备',
            title: `填写 EP${latestInputEpisode} 的本章输入`,
            meta: ['自然语言原文', '供骨架阶段直接读取', primaryBlocker ? '不会解除阻断' : '当前可作为直接下一步'],
            body: primaryBlocker
              ? '你可以先写这一章方向，但它只是准备动作。真正解除阻断还得回头处理上一章结算单。'
              : '当前没有跨 EP 阻断，这份输入可作为后续 Spine 的直接入口。',
            primaryTo: `/episodes/ep${latestInputEpisode}/input`,
            primaryLabel: '打开本章输入',
            secondaryTo: '/episodes',
            secondaryLabel: '查看 EP 索引',
          },
        ]
      : []),
  ],
  pendingFiles: [
    ...blockerDrafts.map((file) => ({
      tone: 'red',
      label: '待确认',
      name: '锚点结算单',
      meta: `${file.relativePath.split('/')[0].toUpperCase()} · 尚未写回全局 · 阻断后续章节`,
      to: `/episodes/${file.relativePath.match(/ep\d+/)?.[0]}/draft`,
    })),
    ...(latestInputEpisode
      ? [{
          tone: 'blue',
          label: '待填写',
          name: '本章输入',
          meta: `EP${latestInputEpisode} · 输入文件已创建 · 可先填写`,
          to: `/episodes/ep${latestInputEpisode}/input`,
        }]
      : []),
  ],
  episodes: episodeNumbers.map((ep) => {
    const hasDraft = exists(`ep${ep}/workspace/anchor-update-draft.md`)
    const draftText = read(`ep${ep}/workspace/anchor-update-draft.md`)
    const hasFinal = exists(`ep${ep}/workspace/ep${ep}.md`) || exists(`ep${ep}/ep${ep}.md`)
    const hasInput = exists(`ep${ep}/user_input.md`)
    const hasSpine = exists(`ep${ep}/workspace/ep-spine.md`)
    const hasSpineQc = exists(`ep${ep}/workspace/spine-qc.md`)
    const hasDesign = exists(`ep${ep}/workspace/ep${ep}-design.md`)
    const hasDesignQc = exists(`ep${ep}/workspace/design-qc.md`)
    const hasWrite = exists(`ep${ep}/workspace/ep${ep}.md`)
    const hasWriteQc = exists(`ep${ep}/workspace/write-qc.md`)

    let      stage = '空白'
    let statusText = '未开始'
    let statusClass = 'status-pending'
    let note = '尚未创建有效文件'
    let next = '创建输入模板'

    if (hasDraft && /unapplied/i.test(draftText)) {
      stage = '待写回'
      statusText = '阻断源'
      statusClass = 'status-block'
      note = '本章结算单待写回，影响后续章节'
      next = '确认锚点结算单'
    } else if (hasFinal) {
      stage = '成稿'
      statusText = '已完成'
      statusClass = 'status-ok'
      note = '最终稿已存在，可阅读与回看锚点影响'
      next = hasDraft ? '可回看结算单' : '-'
    } else if (hasWriteQc) {
      stage = '写作核验'
      statusText = '待确认'
      statusClass = 'status-next'
      note = '正文写作核验已完成，等待锚点确认'
      next = '确认锚点结算单'
    } else if (hasWrite) {
      stage = '写作'
      statusText = '待核验'
      statusClass = 'status-next'
      note = '正文已写作，等待写作质检'
      next = '运行写作 QC'
    } else if (hasDesignQc) {
      stage = '设计核验'
      statusText = '待写作'
      statusClass = 'status-next'
      note = '设计核验通过，等待写作'
      next = '开始写作'
    } else if (hasDesign) {
      stage = '设计'
      statusText = '待核验'
      statusClass = 'status-next'
      note = 'Scene 设计已就绪，等待设计质检'
      next = '运行设计 QC'
    } else if (hasSpineQc) {
      stage = '脊骨核验'
      statusText = '待设计'
      statusClass = 'status-next'
      note = '脊骨核验通过，等待 Scene 设计'
      next = '开始 Scene 设计'
    } else if (hasSpine) {
      stage = '脊骨'
      statusText = '待核验'
      statusClass = 'status-next'
      note = '脊骨设计已就绪，等待脊骨质检'
      next = '运行脊骨 QC'
    } else if (hasInput) {
      stage = '输入'
      statusText = '待推进'
      statusClass = 'status-next'
      note = '本章输入已创建，等待脊骨阶段'
      next = '生成脊骨设计'
    }

    return {
      ep: `EP${ep}`,
      stage,
      statusText,
      statusClass,
      note,
      next,
      to: `/episodes/ep${ep}`, // Always point to editing page, matches sidebar nav
      progressStage: stage,
      // Pipeline dots for visualization
      dot_input: hasInput || hasSpine || hasDesign || hasWrite || hasFinal,
      dot_spine: hasSpine || hasDesign || hasWrite || hasFinal,
      dot_design: hasDesign || hasWrite || hasFinal,
      dot_write: hasWrite || hasFinal,
      dot_final: hasFinal,
    }
  }),
  feed: rawFiles.slice(-6).reverse().map((file, index) => ({
    tone: file.relativePath.includes('anchor-update-draft') ? 'red' : file.relativePath.includes('user_input') ? 'blue' : 'green',
    title: file.relativePath.replace('workspace/anchor-update-draft.md', 'workspace/锚点结算单').replace('user_input.md', '本章输入'),
    time: `${index + 1} 条前`,
  })),
}

export const episodeIndex = episodeNumbers.map((ep) => {
  const links = []
  if (exists(`ep${ep}/workspace/anchor-update-draft.md`)) links.push({ label: '打开结算单', to: `/episodes/ep${ep}/draft` })
  if (exists(`ep${ep}/workspace/ep${ep}.md`) || exists(`ep${ep}/ep${ep}.md`)) links.push({ label: '打开成稿', to: `/episodes/ep${ep}/final` })
  if (exists(`ep${ep}/user_input.md`)) links.push({ label: '打开输入', to: `/episodes/ep${ep}/input` })
  links.push({ label: '查看全局对象', to: '/globals' })

  const episodeStatus = dashboardData.episodes.find((item) => item.ep === `EP${ep}`)

  return {
    id: `ep${ep}`,
    label: `EP${ep}`,
    stage: episodeStatus?.stage || '未知',
    status: episodeStatus?.statusText || '未知',
    description: exists(`ep${ep}/workspace/anchor-update-draft.md`)
      ? '包含锚点结算单，可用于验证本章完成后的结算动作。'
      : exists(`ep${ep}/workspace/ep${ep}.md`) || exists(`ep${ep}/ep${ep}.md`)
        ? '已有成品稿，可作为成稿阅读页样板。'
        : '当前以输入 / 前期文件为主。',
    links,
  }
})

export const episodeDetailRoutes = episodeNumbers.flatMap((ep) => {
  const hasFinal = exists(`ep${ep}/workspace/ep${ep}.md`) || exists(`ep${ep}/ep${ep}.md`)
  const routes = [{
    type: 'draft',
    path: `/episodes/ep${ep}/draft`,
    data: buildDraftDetail(ep),
    statusTone: exists(`ep${ep}/workspace/anchor-update-draft.md`) ? 'red' : 'blue',
    helperTone: exists(`ep${ep}/workspace/anchor-update-draft.md`) ? 'red' : 'blue',
    secondaryAction: { to: `/episodes/ep${ep}`, label: `打开 EP${ep} 文稿编辑` },
  }]
  if (hasFinal) {
    routes.push({
      type: 'final',
      path: `/episodes/ep${ep}/final`,
      data: buildFinalDetail(ep),
    })
  }
  return routes
})
