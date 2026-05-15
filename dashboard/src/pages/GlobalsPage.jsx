import { ButtonLink } from '../components/ui/ButtonLink'
import { Link } from 'react-router-dom'

function ObjectList({ items }) {
  return (
    <div className="globals-folder-grid">
      {items.map((item) => (
        <div key={item.to} className="globals-folder-card static folder-card-minimal">
          <div className="globals-folder-card-top">
            <strong>{item.label}</strong>
            <span className="badge-mini">{item.status || item.objectType}</span>
          </div>
          <p>{item.summary}</p>
          <div className="inline-meta">
            {(item.chips || []).map((chip) => (
              <span className="meta-chip" key={chip}>{chip}</span>
            ))}
          </div>
          <Link to={item.to} className="mini-btn">打开</Link>
        </div>
      ))}
    </div>
  )
}

function ObjectMeta({ detail }) {
  return (
    <div className="globals-detail-stack globals-detail-single-layer">
      <div className="card section section-soft globals-primary-card">
        <div className="globals-item-top globals-item-top-merged">
          <div>
            <div className="detail-page-kicker">全局对象 / 详情</div>
            <h3>{detail.label}</h3>
            <p className="desc">{detail.summary}</p>
          </div>
          <span className="tag purple">{detail.objectType}</span>
        </div>

        <div className="inline-meta inline-meta-wrap globals-object-chips">
          {(detail.chips || []).map((chip) => (
            <span className="meta-chip" key={chip}>{chip}</span>
          ))}
        </div>

        <div className="globals-meta-list compact-meta-list">
          {detail.details.map(([label, value]) => (
            <div className="globals-meta-row" key={`${label}-${value}`}>
              <strong>{label}</strong>
              <span>{value}</span>
            </div>
          ))}
        </div>

        {detail.rawText ? (
          <div className="globals-inline-reading">
            <h4>原文参考</h4>
            <pre className="final-raw-markdown globals-raw-markdown reading-surface">{detail.rawText}</pre>
          </div>
        ) : null}

        {detail.filePath ? (
          <div className="globals-inline-source">
            <h4>来源</h4>
            <div className="file-path-box file-path-box-soft">
              <strong>位置</strong>
              <code>{detail.filePath}</code>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function CollectionMeta({ detail }) {
  return (
    <div className="globals-detail-stack globals-detail-single-layer">
      <div className="card section section-soft globals-primary-card">
        <div className="globals-item-top globals-item-top-merged">
          <div>
            <div className="detail-page-kicker">全局对象 / 分组</div>
            <h3>{detail.label}</h3>
            <p className="desc">{detail.summary}</p>
          </div>
          <span className="tag green">对象集合</span>
        </div>

        <section className="summary-grid compact-summary-grid">
          {detail.metrics.map((item) => (
            <div className="card metric" key={item.label}>
              <div className="label">{item.label}</div>
              <div className="value">{item.value}</div>
              <div className="sub">{item.sub}</div>
            </div>
          ))}
        </section>

        <h4>对象列表</h4>
        <p className="desc">这里按对象看当前状态，而不是按过程文件看目录。</p>
        <ObjectList items={detail.children} />
      </div>
    </div>
  )
}

function DraftCollection({ detail }) {
  return (
    <div className="globals-detail-stack globals-detail-single-layer">
      <div className="card section section-soft globals-primary-card">
        <div className="globals-item-top globals-item-top-merged">
          <div>
            <div className="detail-page-kicker">全局对象 / 待写回</div>
            <h3>{detail.label}</h3>
            <p className="desc">{detail.summary}</p>
          </div>
          <span className="tag orange">待处理</span>
        </div>

        <section className="summary-grid compact-summary-grid">
          {detail.metrics.map((item) => (
            <div className="card metric" key={item.label}>
              <div className="label">{item.label}</div>
              <div className="value">{item.value}</div>
              <div className="sub">{item.sub}</div>
            </div>
          ))}
        </section>

        <h4>待写回清单</h4>
        <p className="desc">这些 EP 的结算动作仍会阻断后续章节，应优先处理。</p>
        <ObjectList items={detail.children} />
      </div>
    </div>
  )
}

function OverviewMeta({ detail }) {
  return (
    <div className="globals-detail-stack globals-detail-single-layer">
      <div className="card section section-soft globals-primary-card">
        <div className="globals-item-top globals-item-top-merged">
          <div>
            <div className="detail-page-kicker">全局对象 / 概览</div>
            <h3>{detail.label}</h3>
            <p className="desc">{detail.summary}</p>
          </div>
          <span className="tag blue">总览</span>
        </div>

        <section className="summary-grid compact-summary-grid">
          {detail.metrics.map((item) => (
            <div className="card metric" key={item.label}>
              <div className="label">{item.label}</div>
              <div className="value">{item.value}</div>
              <div className="sub">{item.sub}</div>
            </div>
          ))}
        </section>

        <h4>边界说明</h4>
        <div className="globals-meta-list compact-meta-list">
          {detail.meta.map(([label, value]) => (
            <div className="globals-meta-row" key={label}>
              <strong>{label}</strong>
              <span>{value}</span>
            </div>
          ))}
        </div>

        <h4>对象分区</h4>
        <ObjectList items={detail.children} />
      </div>
    </div>
  )
}

export function GlobalsPage({ detail }) {
  return (
    <div className="content">
      <div className="topbar plain">
        <div className="topbar-left">
          <h2>全局对象</h2>
          <p>这里负责看全局对象，不再承担 Files 页职责。</p>
        </div>
        <div className="topbar-actions">
        </div>
      </div>

      <section className="globals-browser-main single-column">
        {detail.type === 'overview' ? <OverviewMeta detail={detail} /> : null}
        {detail.type === 'collection' ? <CollectionMeta detail={detail} /> : null}
        {detail.type === 'drafts' ? <DraftCollection detail={detail} /> : null}
        {detail.type === 'object' ? <ObjectMeta detail={detail} /> : null}
        {detail.type === 'draftRecord' ? <ObjectMeta detail={detail} /> : null}
      </section>
    </div>
  )
}
