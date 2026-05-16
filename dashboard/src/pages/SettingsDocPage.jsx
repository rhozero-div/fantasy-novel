import { useState } from 'react'
import { saveFile } from '../api'

export function SettingsDocPage({ doc }) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(doc?.rawText || '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  if (!doc) return <div className="content"><div className="empty-state large">文档不存在</div></div>

  async function handleSave() {
    setSaving(true)
    setSaveMsg('')
    try {
      const relPath = doc.filePath?.replace(/^project\//, '')
      if (!relPath) throw new Error('Missing file path')
      await saveFile(relPath, content)
      setSaveMsg('✅ 已保存')
      setTimeout(() => setSaveMsg(''), 2000)
    } catch (err) {
      setSaveMsg(`❌ 保存失败: ${err.message}`)
    }
    setSaving(false)
  }

  const handleEdit = () => {
    setContent(doc.rawText || '')
    setEditing(true)
  }

  const handleCancel = () => {
    setContent(doc.rawText || '')
    setEditing(false)
    setSaveMsg('')
  }

  return (
    <div className="content">
      <div className="topbar plain">
        <div className="topbar-left">
          <h2>{doc.label}</h2>
          <p>{doc.summary}</p>
        </div>
        <div className="topbar-actions">
          {editing ? (
            <>
              <button className="btn-sm" onClick={handleCancel} disabled={saving}>取消</button>
              <button className="btn-sm primary" onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '💾 保存'}
              </button>
              {saveMsg && <span className="save-msg">{saveMsg}</span>}
            </>
          ) : (
            <button className="btn-sm primary" onClick={handleEdit}>✏️ 编辑</button>
          )}
        </div>
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

          <div className="globals-inline-source">
            <h4>来源</h4>
            <div className="file-path-box file-path-box-soft">
              <strong>位置</strong>
              <code>{doc.filePath}</code>
            </div>
          </div>

          {editing ? (
            <div className="editor-split">
              <div className="editor-split-left">
                <div className="editor-split-header">源码</div>
                <textarea
                  className="editor-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div className="editor-split-right">
                <div className="editor-split-header">预览</div>
                <div className="editor-preview-scroll">
                  <pre className="final-raw-markdown globals-raw-markdown reading-surface">{content}</pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="globals-inline-reading">
              {doc.rawText ? (
                <pre className="final-raw-markdown globals-raw-markdown reading-surface">{doc.rawText}</pre>
              ) : (
                <div className="empty-state">暂无内容</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
