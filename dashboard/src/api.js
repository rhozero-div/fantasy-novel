const API_BASE = '/api/project'

export async function fetchProject() {
  const res = await fetch(API_BASE)
  if (!res.ok) throw new Error(`Failed to fetch project: ${res.status}`)
  return res.json()
}

export async function saveFile(relPath, content) {
  const res = await fetch(`${API_BASE}/write`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ relPath, content }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Save failed: ${res.status}`)
  }
  return res.json()
}
