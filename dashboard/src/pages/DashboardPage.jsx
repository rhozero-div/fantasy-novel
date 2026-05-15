import { useState, useEffect } from 'react'
import { ButtonLink } from '../components/ui/ButtonLink'

async function loadProjectOptions() {
  try {
    const res = await fetch('/api/project/projects')
    if (!res.ok) return []
    const { projects } = await res.json()
    return projects || []
  } catch {
    return []
  }
}

async function switchProject(path) {
  try {
    await fetch('/api/project/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    })
  } catch {}
}

export function DashboardPage({ projectMeta, data }) {
  const [projects, setProjects] = useState([])
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    loadProjectOptions().then(setProjects)
  }, [])

  const handleSwitch = async (path) => {
    if (!path) return
    setSwitching(true)
    await switchProject(path)
    window.location.reload()
  }

  return (
    <div className="content">
      <div className="topbar plain">
        <div className="topbar-left">
          <h2>项目总览{projectMeta.name ? <span className="brand-project-name"> / {projectMeta.name}</span> : null}</h2>
          <p>
            {projectMeta.name} / <span className="muted">{projectMeta.path}</span> / 最近扫描：{projectMeta.lastScan}
          </p>
        </div>
        <div className="topbar-actions">
          {projects.length > 1 ? (
            <select
              className="project-selector"
              value=""
              onChange={(e) => handleSwitch(e.target.value)}
              disabled={switching}
            >
              <option value="">切换项目...</option>
              {projects.map((p) => (
                <option key={p.path} value={p.path}>{p.label}</option>
              ))}
            </select>
          ) : null}
          <span className="btn primary">刷新状态</span>
        </div>
      </div>

      {/* Hero banner — only section above the table */}
      <section className="hero-alert hero-alert-priority">
        <div>
          <div className="detail-page-kicker">当前阻断 / 下一动作</div>
          <h3>{data.hero.title}</h3>
          <p>{data.hero.body}</p>
        </div>
        <div className="hero-actions hero-actions-priority">
          <ButtonLink to="/globals" tone="primary">查看全局对象</ButtonLink>
        </div>
      </section>

      {/* EP status table + recent updates side by side */}
      <section className="bottom-grid">
        <div className="card section">
          <h3>EP 状态概览</h3>
          <p className="desc">这里看章节状态；具体文件差异到章节详情页再看。</p>
          <div className="ep-status-list">
            {data.episodes.map((item) => (
              <a href={item.to} className={`ep-status-row ${item.statusClass}`} key={item.ep}>
                {/* Progress indicator bar */}
                <span className={`ep-bar ep-bar-${item.progressStage || 'none'}`}></span>

                {/* EP number + stage chip */}
                <span className="ep-status-ep">
                  <span className="ep-number">{item.ep}</span>
                  <span className={`ep-stage-chip ${item.statusClass}`}>{item.stage}</span>
                </span>

                {/* Pipeline progress dots */}
                <span className="ep-pipeline">
                  {['input', 'spine', 'design', 'write', 'final'].map((stage) => (
                    <span
                      key={stage}
                      className={`pipeline-dot ${item[`dot_${stage}`] ? 'done' : ''}`}
                      title={stage}
                    ></span>
                  ))}
                </span>

                {/* Note and next action */}
                <span className="ep-info">
                  <span className="ep-note">{item.note}</span>
                  <span className="ep-next muted">{item.next}</span>
                </span>

                {/* Action button */}
                <span className={`ep-action-btn ${item.statusClass}`}>
                  打开
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="card section section-soft dashboard-log-panel">
          <h3>最近更新</h3>
          <p className="desc">仅作轻量日志，不参与优先级判断。</p>
          <div className="micro-feed micro-feed-muted">
            {data.feed.map((item) => (
              <div className="feed-item" key={item.title}>
                <div className="feed-dot" style={{ background: `var(--${item.tone})` }}></div>
                <div>
                  <p><strong>{item.title}</strong></p>
                  <div className="meta">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
