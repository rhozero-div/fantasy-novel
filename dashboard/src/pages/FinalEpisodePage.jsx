import { ButtonLink } from '../components/ui/ButtonLink'

export function FinalEpisodePage({ data }) {
  return (
    <div className="page page-detail page-detail-refined">
      <div className="detail-page-header card detail-hero-refined">
        <div className="detail-page-header-main">
          <div className="detail-page-kicker">{data.episode} / 成稿阅读</div>
          <h1>{data.title}</h1>
          <div className="detail-page-meta-row detail-meta-row-refined">
            <span className="tag green">最终稿</span>
            <span className="tag gray">只读</span>
          </div>
          <p>{data.subtitle}</p>
        </div>
        <div className="detail-page-header-actions detail-page-header-actions-refined">
          <ButtonLink to="/globals" tone="dark">查看全局对象</ButtonLink>
          <ButtonLink to="/" tone="subtle">返回总览</ButtonLink>
        </div>
      </div>

      <div className="layout detail-layout-refined final-detail-layout final-detail-layout-refined">
        <section className="panel main panel-document panel-document-refined">
          <div className="panel-header panel-header-compact document-header document-header-refined document-header-stack">
            <div>
              <h2>正文成稿</h2>
              <p>{data.editHint}</p>
            </div>
          </div>

          <div className="document-meta-strip document-meta-strip-compact">
            <span className="document-meta-label">位置</span>
            <code>{data.filePath}</code>
          </div>

          <section className="summary-inline-row">
            {data.summary.map((item) => (
              <div className="summary-inline-item" key={item.label}>
                <span className="summary-inline-label">{item.label}</span>
                <strong className="summary-inline-value">{item.value}</strong>
                <span className="summary-inline-sub">{item.sub}</span>
              </div>
            ))}
          </section>

          <div className="card section section-reading final-reading-section final-reading-section-refined final-reading-shell-lite">
            <div className="section-reading-head">
              <h3>正文原文</h3>
              <span className="tag gray">只读文本</span>
            </div>
            <pre className="final-raw-markdown globals-raw-markdown reading-surface reading-surface-refined reading-surface-lite">{data.fullText || '暂无正文内容。'}</pre>
          </div>
        </section>

        <aside className="panel panel-soft right-col right-col-compact side-panel-refined side-panel-lite">
          <div className="panel-header panel-header-compact side-panel-header-refined">
            <h3>影响与回跳</h3>
            <p>结果页只保留必要影响和回看入口。</p>
          </div>
          <div className="info-body info-body-refined info-body-lite">
            <div className="info-block info-block-refined info-block-lite">
              <h4>锚点影响</h4>
              <div className="impact-list impact-list-refined impact-list-lite">
                {data.impacts.map((impact) => (
                  <div className="impact-card impact-card-refined impact-card-lite" key={impact.title}>
                    <h4>{impact.title}</h4>
                    <p>{impact.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-block info-block-refined info-block-lite">
              <h4>相关入口</h4>
              <div className="mini-actions vertical-actions vertical-actions-refined actions-lite">
                {data.related.map((item, index) => (
                  <ButtonLink key={item.to} to={item.to} tone={index === 0 ? 'dark' : 'subtle'}>
                    {item.label}
                  </ButtonLink>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
