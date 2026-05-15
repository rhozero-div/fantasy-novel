import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env file manually — Vite doesn't inject it into server plugin process.env
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env')
  try {
    const text = fs.readFileSync(envPath, 'utf-8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
      const eq = trimmed.indexOf('=')
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  } catch {}
}

const REPO_ROOT = path.resolve(__dirname, '..')

loadEnv()

// Scan directories for projects: comma-separated env var, or empty
function getScanDirs() {
  const envVal = process.env.PROJECTS_DIR
  if (!envVal) return []
  return envVal.split(',').map((d) => path.resolve(d.trim())).filter(Boolean)
}

function walkDir(dir, baseDir = dir) {
  const results = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...walkDir(fullPath, baseDir))
      } else if (entry.name.endsWith('.md')) {
        const relativePath = path.relative(baseDir, fullPath)
        results.push({ relativePath, fullPath })
      }
    }
  } catch (e) {
    console.error(`[project-reader] error reading ${dir}:`, e.message)
  }
  return results
}

function sendJson(res, data, status = 200) {
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = status
  res.end(JSON.stringify(data))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function scanProjects() {
  const results = []
  const scanDirs = getScanDirs()

  // Each configured scan directory
  for (const scanDir of scanDirs) {
    try {
      const entries = fs.readdirSync(scanDir, { withFileTypes: true })
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue
        const fullPath = path.join(scanDir, entry.name)
        if (fs.existsSync(path.join(fullPath, 'skill_context'))) {
          // Avoid duplicates
          if (!results.find((r) => r.path === fullPath)) {
            results.push({ label: entry.name, path: fullPath })
          }
        }
      }
    } catch (e) {
      console.error(`[project-reader] scan error reading ${scanDir}:`, e.message)
    }
  }

  // Check repo root directory
  try {
    if (fs.existsSync(path.join(REPO_ROOT, 'skill_context'))) {
      const repoName = path.basename(REPO_ROOT)
      if (!results.find((r) => r.path === REPO_ROOT)) {
        results.push({ label: `${repoName} (repo)`, path: REPO_ROOT })
      }
    }
  } catch (e) {
    console.error('[project-reader] scan repo error:', e.message)
  }

  return results.sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN'))
}

export function projectReaderPlugin() {
  let projectPath = process.env.PROJECT_PATH || path.resolve(__dirname, 'demo-project')

  console.log(`[project-reader] project path: ${projectPath}`)

  return {
    name: 'project-reader',
    configureServer(server) {
      // Use root-level middleware to avoid Connect's URL-prefix stripping
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''

        // POST /api/project/write — save a file
        if (req.method === 'POST' && url === '/api/project/write') {
          ;(async () => {
            try {
              const { relPath, content } = await readBody(req)

              // Security: prevent directory traversal
              const normalized = path.normalize(relPath || '')
              if (!normalized || normalized.startsWith('..') || path.isAbsolute(normalized)) {
                return sendJson(res, { error: 'Invalid path' }, 400)
              }

              const fullPath = path.resolve(projectPath, normalized)
              if (!fullPath.startsWith(path.resolve(projectPath))) {
                return sendJson(res, { error: 'Path outside project' }, 403)
              }

              if (!fullPath.endsWith('.md')) {
                return sendJson(res, { error: 'Only .md files can be written' }, 400)
              }

              // Ensure directory exists
              fs.mkdirSync(path.dirname(fullPath), { recursive: true })

              // Write file
              fs.writeFileSync(fullPath, content, 'utf-8')
              console.log(`[project-reader] wrote ${fullPath}`)

              // Reload and return updated file list
              const files = walkDir(projectPath).map(({ relativePath, fullPath }) => ({
                relativePath,
                fullPath: `/project/${relativePath}`,
                content: fs.readFileSync(fullPath, 'utf-8'),
              }))
              return sendJson(res, { files, projectPath, projectName: path.basename(projectPath) })
            } catch (err) {
              console.error('[project-reader] write error:', err)
              return sendJson(res, { error: err.message }, 500)
            }
          })()
          return
        }

        // GET /api/project/projects — scan available project directories
        if (req.method === 'GET' && url === '/api/project/projects') {
          try {
            const projects = scanProjects()
            return sendJson(res, { projects, currentPath: projectPath })
          } catch (err) {
            console.error('[project-reader] scan error:', err)
            return sendJson(res, { error: err.message }, 500)
          }
        }

        // POST /api/project/switch — switch to a different project path
        if (req.method === 'POST' && url === '/api/project/switch') {
          ;(async () => {
            try {
              const { path: newPath } = await readBody(req)
              if (!newPath || !fs.existsSync(newPath)) {
                return sendJson(res, { error: 'Path does not exist' }, 400)
              }
              if (!fs.existsSync(path.join(newPath, 'skill_context'))) {
                return sendJson(res, { error: 'Not a valid project (no skill_context)' }, 400)
              }
              projectPath = newPath
              console.log(`[project-reader] switched to: ${projectPath}`)

              const files = walkDir(projectPath).map(({ relativePath, fullPath }) => ({
                relativePath,
                fullPath: `/project/${relativePath}`,
                content: fs.readFileSync(fullPath, 'utf-8'),
              }))
              return sendJson(res, { files, projectPath, projectName: path.basename(projectPath) })
            } catch (err) {
              console.error('[project-reader] switch error:', err)
              return sendJson(res, { error: err.message }, 500)
            }
          })()
          return
        }

        // GET /api/project — list all files
        if (req.method === 'GET' && url === '/api/project') {
          try {
            const files = walkDir(projectPath).map(({ relativePath, fullPath }) => ({
              relativePath,
              fullPath: `/project/${relativePath}`,
              content: fs.readFileSync(fullPath, 'utf-8'),
            }))

            return sendJson(res, { files, projectPath, projectName: path.basename(projectPath) })
          } catch (err) {
            console.error('[project-reader] error:', err)
            return sendJson(res, { error: err.message }, 500)
          }
        }

        // Not our route, pass through
        next()
      })
    },
  }
}
