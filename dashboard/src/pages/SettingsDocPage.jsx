export function SettingsDocPage({ doc }) {
  if (!doc) return <div className="content"><div className="empty-state large">文档不存在</div></div>

  return (
    <div className="content">
      <div className="topbar plain">
        <div className="topbar-left">
          <h2>{doc.label}</h2>
          <p>{doc.summary}</p>
        </div>
        <div className="topbar-actions"></div>
      </div>

      <div className="globals-detail-stack globals-detail-single-layer">
        <div className="card section section-soft globals-primary-card">
          <div className="globals-item-top globals-item-top-merged">
            <div>
              <div className="detail-page-kicker">项目设定 / {doc.objectType}</div>
              <h3>{doc.label}</h3>
              <p className="desc">{doc.summary}</p>
            </div>
            <span className="tag blue">项目配置</span>
          </div>

          {doc.rawText ? (
            <div className="globals-inline-reading">
              <h4>原文</h4>
              <pre className="final-raw-markdown globals-raw-markdown reading-surface">{doc.rawText}</pre>
            </div>
          ) : <div className="empty-state">暂无内容</div>}

          {doc.filePath ? (
            <div className="globals-inline-source">
              <h4>来源</h4>
              <div className="file-path-box file-path-box-soft">
                <strong>位置</strong>
                <code>{doc.filePath}</code>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
