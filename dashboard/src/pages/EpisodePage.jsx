import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchProject, saveFile } from '../api'
import { MarkdownViewer } from '../components/MarkdownViewer'

const TABS = [
  { key: 'ignite', label: 'Ignite', icon: '🔥' },
  { key: 'spine', label: 'Spine', icon: '🦴' },
  { key: 'design', label: 'Design', icon: '🎨' },
  { key: 'write', label: 'Write', icon: '✍️' },
]

// Files to look up per tab, in display order
const TAB_FILES = {
  ignite: [
    { key: 'user_input', label: '用户输入', path: (ep) => `ep${ep}/user_input.md`, editable: true },
  ],
  spine: [
    { key: 'spine', label: '脊骨设计', path: (ep) => `ep${ep}/workspace/ep-spine.md`, editable: true },
    { key: 'spine_qc', label: '脊骨核验', path: (ep) => `ep${ep}/workspace/spine-qc.md`, editable: true },
  ],
  design: [
    { key: 'design', label: 'Scene 设计', path: (ep) => `ep${ep}/workspace/ep${ep}-design.md`, editable: true },
    { key: 'design_qc', label: '设计核验', path: (ep) => `ep${ep}/workspace/design-qc.md`, editable: true },
  ],
  write: [
    { key: 'manuscript', label: '正文（中间稿）', path: (ep) => `ep${ep}/workspace/ep${ep}.md`, editable: true },
    { key: 'write_qc', label: '写作核验', path: (ep) => `ep${ep}/workspace/write-qc.md`, editable: true },
    { key: 'draft', label: '锚点结算单', path: (ep) => `ep${ep}/workspace/anchor-update-draft.md`, editable: true },
  ],
}

export function EpisodePage() {
  const { pathname } = useLocation()
  const epNum = Number(pathname.match(/ep(\d+)/)?.[1] || 0)
  const [files, setFiles] = useState([])
  const [activeTab, setActiveTab] = useState('ignite')
  const [activeFile, setActiveFile] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const loadFiles = useCallback(async () => {
    try {
      const data = await fetchProject()
      setFiles(data.files || [])
    } catch {
      setFiles([])
    }
  }, [])

  useEffect(() => { loadFiles() }, [loadFiles])

  function fileExists(relPath) {
    return files.some((f) => f.relativePath === relPath)
  }

  function readFileContent(relPath) {
    return files.find((f) => f.relativePath === relPath)?.content || ''
  }

  function makeFullPath(relPath) {
    return `project/${relPath}`
  }

  // Available files for current tab
  const tabFiles = TAB_FILES[activeTab] || []
  const availableFiles = tabFiles
    .map((def) => {
      const relPath = def.path(epNum)
      const exists = fileExists(relPath)
      return { ...def, relPath, exists, content: exists ? readFileContent(relPath) : '' }
    })
    // Show all pipeline entries regardless of existence, so user sees what's next

  // Auto-select first file when tab changes or files load
  useEffect(() => {
    if (availableFiles.length > 0) {
      const first = availableFiles[0]
      setActiveFile(first)
      setEditContent(first.content)
    } else {
      setActiveFile(null)
    }
  }, [activeTab, files.length])

  async function handleSave() {
    if (!activeFile || !activeFile.editable) return
    setSaving(true)
    setSaveMsg('')
    try {
      await saveFile(activeFile.relPath, editContent)
      setSaveMsg('✅ 已保存')
      // Refresh
      await loadFiles()
      setTimeout(() => setSaveMsg(''), 2000)
    } catch (err) {
      setSaveMsg(`❌ 保存失败: ${err.message}`)
    }
    setSaving(false)
  }

  async function handleCopyPath(relPath) {
    try {
      await navigator.clipboard.writeText(relPath)
    } catch {
      // fallback
    }
  }

  return (
    <div className="page page-episode-detail">
      <div className="episode-header">
        <h1>EP{epNum} 文稿浏览</h1>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* File bar — horizontal row of file buttons */}
      <div className="file-bar">
        {availableFiles.length === 0 ? (
          <div className="empty-state file-bar-empty">本阶段暂无文档</div>
        ) : (
          <div className="file-bar-row">
            {availableFiles.map((f) => (
              <button
                key={f.key}
                className={`file-bar-btn ${activeFile?.key === f.key ? 'file-bar-btn-active' : ''} ${!f.exists ? 'file-bar-btn-missing' : ''}`}
                onClick={() => {
                  setActiveFile(f)
                  setEditContent(f.content)
                  setSaveMsg('')
                }}
              >
                <span className="file-bar-icon">{f.editable ? '📝' : '📄'}</span>
                <span className="file-bar-label">{f.label}</span>
                {f.exists && <span className="file-bar-check">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content area: left=editor / right=preview */}
      <section className="file-content-panel">
        {!activeFile ? (
          <div className="empty-state large">选择一个文档</div>
        ) : (
          <div className="file-content-wrapper">
            <div className="file-content-meta">
              <code className="file-path">{makeFullPath(activeFile.relPath)}</code>
              <div className="file-actions">
                <button
                  className="btn-sm"
                  onClick={() => handleCopyPath(activeFile.relPath)}
                  title="复制路径"
                >
                  📋 复制路径
                </button>
                {activeFile.editable && (
                  <>
                    <button className="btn-sm primary" onClick={handleSave} disabled={saving}>
                      {saving ? '保存中...' : '💾 保存'}
                    </button>
                    {saveMsg && <span className="save-msg">{saveMsg}</span>}
                  </>
                )}
              </div>
            </div>

            {activeFile.editable ? (
              <div className="editor-split">
                <div className="editor-split-left">
                  <div className="editor-split-header">源码</div>
                  <textarea
                    className="editor-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                </div>
                <div className="editor-split-right">
                  <div className="editor-split-header">预览</div>
                  <div className="editor-preview-scroll">
                    <MarkdownViewer content={editContent} />
                  </div>
                </div>
              </div>
            ) : activeFile.exists ? (
              <div className="markdown-wrapper">
                <MarkdownViewer content={activeFile.content} />
              </div>
            ) : (
              <div className="empty-state large">文件不存在</div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
