import { ButtonLink } from '../components/ui/ButtonLink'
import { StageCard } from '../components/episode/StageCard'
import { InfoMeta } from '../components/episode/InfoMeta'
import { EpisodeJumpList } from '../components/episode/EpisodeJumpList'

export function EpisodeDetailPage({ data, statusTone, helperTone, secondaryAction }) {
  const isDecision = data.mode === '决策'
  const isSettled = isDecision && data.draftContent && /已写回/i.test(data.subtitle || '')
  const effectiveTone = isSettled ? 'green' : statusTone

  let tagLabel = '输入原文'
  if (isDecision) {
    if (!data.draftContent) tagLabel = '推进中'
    else if (isSettled) tagLabel = '已结算'
    else tagLabel = '待确认动作'
  }

  return (
    <div className="page page-detail page-detail-refined">
      <div className="detail-page-header card detail-hero-refined">
        <div className="detail-page-header-main">
          <div className="detail-page-kicker">{data.episode} / {isDecision ? (data.draftContent ? '结算判断' : '章节进度') : '输入准备'}</div>
          <h1>{data.title}</h1>
          <div className="detail-page-meta-row detail-meta-row-refined">
            <span className={`tag ${effectiveTone}`}>{tagLabel}</span>
            <span className="tag gray">{data.episode}</span>
            <span className="tag gray">{isDecision ? (data.draftContent ? (isSettled ? '已写回全局' : '影响全局连续性') : '流水线概览') : '供后续骨架读取'}</span>
          </div>
          <p>{data.subtitle}</p>
        </div>
        <div className="detail-page-header-actions detail-page-header-actions-refined">
          <ButtonLink to="/">返回总览</ButtonLink>
          <ButtonLink to={secondaryAction.to}>{secondaryAction.label}</ButtonLink>
        </div>
      </div>

      <div className={`status-bar ${effectiveTone} status-bar-refined`}>{data.statusBar}</div>

      <div className="layout detail-layout-refined detail-layout-docs">
        <aside className="panel panel-soft rail-panel-refined">
          <div className="panel-header panel-header-compact rail-panel-header-refined">
            <h2>EP 流程状态</h2>
            <p>只保留帮助当前判断所需的阶段上下文。</p>
          </div>
          <div className="sidebar-nav stage-rail stage-rail-refined">
            {data.sideStages.map((stage) => (
              <StageCard key={stage.name} stage={stage} />
            ))}
          </div>
        </aside>

        <section className="panel main panel-document panel-document-refined">
          <div className="panel-header panel-header-compact document-header document-header-refined">
            <div>
              <h2>{isDecision ? '当前判断' : '输入原文与预览'}</h2>
              <p>{data.helper}</p>
            </div>
          </div>

          <div className="document-meta-strip">
            <span className="document-meta-label">位置</span>
            <code>{data.filePath}</code>
          </div>

          {isDecision ? <DraftBody data={data} helperTone={helperTone} /> : <InputBody data={data} helperTone={helperTone} />}
        </section>

        <aside className="panel panel-soft right-col right-col-compact side-panel-refined">
          <div className="panel-header panel-header-compact side-panel-header-refined">
            <h3>辅助信息</h3>
            <p>只放判断时需要顺手查看的背景信息。</p>
          </div>
          <div className="info-body info-body-refined">
            <div className="info-block info-block-refined">
              <h4>元信息</h4>
              <InfoMeta pairs={data.info.meta} />
            </div>

            <div className="info-block info-block-refined">
              <h4>{isDecision ? '身份提示' : '风险提示'}</h4>
              <p className="info-paragraph">{data.info.identity || data.info.risk}</p>
            </div>

            <div className="info-block info-block-refined">
              <h4>相关跳转</h4>
              <EpisodeJumpList items={data.info.jumps} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function DraftBody({ data, helperTone }) {
  return (
    <div className="draft-layout draft-layout-refined draft-layout-docs">
      {data.statusBar ? (
        <div className={`helper-banner helper-banner-inline ${helperTone} helper-banner-refined`}>
          {data.statusBar}
        </div>
      ) : null}

      {data.decisions ? (
        <div className="decision-card decision-card-priority decision-card-refined">
          <div className="subheader subheader-refined">关键判断</div>
          <div className="decision-body compact-decision-body">
            {data.decisions.map((item) => (
              <div className="decision-box decision-box-refined" key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data.draftContent ? (
        <div className="doc-card doc-card-reading doc-card-refined">
          <div className="subheader subheader-refined">结算内容</div>
          <div className="doc-body prose-reading prose-reading-refined">
            <h3>{data.draftContent.heading === 'Anchor Update Draft' ? '本章结算稿' : data.draftContent.heading}</h3>
            {data.draftContent.paragraphs.map((text) => <p key={text}>{text}</p>)}
            <p><strong>建议写回项</strong></p>
            <ul>
              {data.draftContent.bullets.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="decision-card decision-card-steps decision-card-refined">
        <div className="subheader subheader-refined">下一步</div>
        <div className="decision-actions decision-actions-vertical decision-actions-refined">
          {data.actionSteps.map((item, index) => (
            <span key={item} className={index === 0 ? 'btn dark action-pill-refined' : 'btn action-pill-refined'}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function InputBody({ data, helperTone }) {
  return (
    <div className="editor-shell editor-shell-refined editor-shell-docs">
      <div className={`helper-banner helper-banner-inline ${helperTone} helper-banner-refined`}>
        {data.helper}
      </div>
      <div className="editor editor-refined editor-card-refined">
        <div className="subheader subheader-refined">Markdown 原文</div>
        <textarea className="textarea-refined" defaultValue={data.textarea} />
      </div>
      <div className="preview preview-refined preview-card-refined">
        <div className="subheader subheader-refined">阅读预览</div>
        <div className="preview-body prose-reading prose-reading-refined">
          <h3>{data.preview.heading}</h3>
          <p>{data.preview.intro}</p>
          <p><strong>节奏预期</strong></p>
          <ul>{data.preview.rhythm.map((item) => <li key={item}>{item}</li>)}</ul>
          <p><strong>禁区</strong></p>
          <ul>{data.preview.taboo.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
    </div>
  )
}
