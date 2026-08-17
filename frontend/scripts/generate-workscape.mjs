import { access, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const frontendRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const workspaceRoot = resolve(frontendRoot, '..')
const outputPath = join(frontendRoot, 'public', 'workscape-data.json')
const run = promisify(execFile)

const textExtensions = new Set(['.css', '.html', '.js', '.json', '.md', '.mjs', '.py', '.txt', '.ts', '.tsx'])
const excludedDirectories = new Set(['.git', '__pycache__', 'dist', 'node_modules'])

const gitAvailable = await access(join(workspaceRoot, '.git', 'HEAD')).then(() => true).catch(() => false)

async function latestGitTimestamp() {
  if (!gitAvailable) return ''
  try {
    const { stdout } = await run('git', ['log', '-1', '--format=%cI'], { cwd: workspaceRoot })
    return stdout.trim()
  } catch {
    return ''
  }
}

async function previousGeneratedAt() {
  try {
    const current = JSON.parse(await readFile(outputPath, 'utf8'))
    return typeof current.generatedAt === 'string' ? current.generatedAt : ''
  } catch {
    return ''
  }
}

async function gitOutput(args) {
  if (!gitAvailable) return ''
  try {
    const { stdout } = await run('git', args, { cwd: workspaceRoot })
    return stdout
  } catch {
    return ''
  }
}

async function gitFileAtHead(path) {
  if (!gitAvailable) return ''
  try {
    const { stdout } = await run('git', ['show', `HEAD:${path}`], { cwd: workspaceRoot, maxBuffer: 1024 * 1024 * 8 })
    return stdout
  } catch {
    return ''
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    if (entry.name.startsWith('.') || excludedDirectories.has(entry.name)) return []
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) return walk(fullPath)
    return textExtensions.has(extname(entry.name)) ? [fullPath] : []
  }))
  return nested.flat()
}

async function inspectFiles(directory) {
  const files = await walk(directory)
  return Promise.all(files.map(async (file) => {
    const [content, metadata] = await Promise.all([readFile(file, 'utf8'), stat(file)])
    return {
      path: relative(workspaceRoot, file).replaceAll('\\', '/'),
      extension: extname(file).slice(1) || 'text',
      lines: content ? content.split(/\r?\n/).length : 0,
      bytes: metadata.size,
      content,
    }
  }))
}

function sum(items, property) {
  return items.reduce((total, item) => total + item[property], 0)
}

function packageVersion(lock, packageName) {
  return lock.packages?.[`node_modules/${packageName}`]?.version ?? 'not installed'
}

function requirementVersion(requirements, packageName) {
  const escaped = packageName.replaceAll('-', '[-_]')
  const expression = new RegExp(`^${escaped}==([^\\s#]+)`, 'im')
  return requirements.match(expression)?.[1] ?? 'not installed'
}

function countMatches(content, expression) {
  return [...content.matchAll(expression)].length
}

function departmentForPath(path) {
  if (path.startsWith('backend/')) return 'Backend'
  if (path.startsWith('frontend/src/workscape/') || path.includes('workscape')) return 'Workscape'
  if (path.startsWith('frontend/')) return 'Frontend'
  if (path.startsWith('plan/') || path.startsWith('requirement/')) return 'Planning'
  if (path.startsWith('design/')) return 'Design'
  return 'Workspace'
}

function statusLabel(code) {
  if (code.includes('A') || code === '??') return 'added'
  if (code.includes('D')) return 'deleted'
  if (code.includes('R')) return 'renamed'
  if (code.includes('M')) return 'modified'
  return 'changed'
}

function visualProfileForFile(path, content = '') {
  const extension = extname(path).slice(1).toLowerCase()
  const count = (expression) => countMatches(content, expression)
  const colors = [...new Set([...content.matchAll(/#[0-9a-f]{3,8}\b/gi)].map((match) => match[0].toLowerCase()))].slice(0, 5)

  if (extension === 'css') {
    const animations = count(/@keyframes\s+/g)
    return {
      kind: 'style',
      mood: animations ? 'kinetic visual system' : 'visual system',
      accent: '#ff8a3d',
      palette: colors,
      signals: [`${count(/--[a-z0-9-]+\s*:/gi)} tokens`, `${animations} motions`, `${colors.length} colors`],
    }
  }
  if (extension === 'tsx' || extension === 'jsx') {
    return {
      kind: 'interface',
      mood: content.includes('<svg') ? 'spatial interactive interface' : 'interactive interface',
      accent: '#52d6c5',
      palette: colors,
      signals: [`${count(/function\s+[A-Z][A-Za-z0-9]*/g)} components`, `${count(/use(State|Effect|Memo|Ref)\s*\(/g)} hooks`, `${count(/on(Click|Pointer|Wheel|Change)=/g)} interactions`],
    }
  }
  if (extension === 'mjs' || extension === 'js' || extension === 'ts') {
    return {
      kind: 'automation',
      mood: path.includes('generate') ? 'generative pipeline' : 'logic flow',
      accent: '#f3c75f',
      palette: colors,
      signals: [`${count(/\bfunction\s+/g)} functions`, `${count(/\bawait\s+/g)} async steps`, `${count(/\b(import|export)\b/g)} modules`],
    }
  }
  if (extension === 'json') {
    return {
      kind: 'data',
      mood: 'structured live state',
      accent: '#a88cf5',
      palette: colors,
      signals: [`${count(/^\s*"[^"]+"\s*:/gm)} fields`, `${content.split(/\r?\n/).length} lines`, 'generated state'],
    }
  }
  if (extension === 'md' || extension === 'txt') {
    return {
      kind: 'narrative',
      mood: path.startsWith('plan/') ? 'future direction' : 'documented intent',
      accent: '#ef718a',
      palette: colors,
      signals: [`${count(/^#{1,6}\s+/gm)} sections`, `${count(/^-\s+/gm)} points`, `${content.split(/\r?\n/).length} lines`],
    }
  }
  if (extension === 'py') {
    return {
      kind: 'service',
      mood: 'backend service flow',
      accent: '#6fb8ff',
      palette: colors,
      signals: [`${count(/^\s*class\s+/gm)} classes`, `${count(/^\s*(async\s+)?def\s+/gm)} functions`, `${count(/\b(path|router\.register)\s*\(/g)} routes`],
    }
  }
  return {
    kind: 'artifact',
    mood: 'workspace element',
    accent: '#9caeaa',
    palette: colors,
    signals: [`${content.split(/\r?\n/).length} lines`, extension || 'file', 'tracked change'],
  }
}

function snapshotForFile(path, status, beforeContent, afterContent) {
  const before = visualProfileForFile(path, beforeContent)
  const after = visualProfileForFile(path, afterContent)
  const beforeLines = beforeContent ? beforeContent.split(/\r?\n/).length : 0
  const afterLines = afterContent ? afterContent.split(/\r?\n/).length : 0
  return {
    mode: status === 'added' ? 'created' : status === 'deleted' ? 'removed' : 'changed',
    focus: `${beforeLines} lines before · ${afterLines} lines after`,
    before: {
      ...before,
      empty: !beforeContent,
      lines: beforeLines,
      label: status === 'added' ? 'not present' : 'before request',
    },
    after: {
      ...after,
      empty: !afterContent,
      lines: afterLines,
      label: status === 'deleted' ? 'removed' : 'after request',
    },
  }
}

function parseStatus(statusText, numstatText) {
  const diffStats = new Map(numstatText.trim().split('\n').filter(Boolean).map((line) => {
    const [added, deleted, ...fileParts] = line.split(/\t+/)
    const path = fileParts.join('\t')
    return [path, {
      additions: Number.isFinite(Number(added)) ? Number(added) : 0,
      deletions: Number.isFinite(Number(deleted)) ? Number(deleted) : 0,
    }]
  }))

  return statusText.split('\n').filter(Boolean).map((line) => {
    const code = line.slice(0, 2).trim() || '??'
    const rawPath = line.slice(3).trim()
    const path = rawPath.includes(' -> ') ? rawPath.split(' -> ').at(-1) : rawPath
    const stats = diffStats.get(path) ?? { additions: 0, deletions: 0 }
    return {
      path,
      status: statusLabel(code),
      department: departmentForPath(path),
      additions: stats.additions,
      deletions: stats.deletions,
    }
  })
}

const [frontendFiles, backendFiles, planFiles, designFiles, requirementFiles, packageJsonText, packageLockText, backendRequirementsText, generatedAtFromGit, generatedAtFromPrevious, gitStatusText, gitNumstatText] = await Promise.all([
  inspectFiles(join(frontendRoot, 'src')),
  inspectFiles(join(workspaceRoot, 'backend')),
  inspectFiles(join(workspaceRoot, 'plan')),
  inspectFiles(join(workspaceRoot, 'design')),
  inspectFiles(join(workspaceRoot, 'requirement')),
  readFile(join(frontendRoot, 'package.json'), 'utf8'),
  readFile(join(frontendRoot, 'package-lock.json'), 'utf8'),
  readFile(join(workspaceRoot, 'backend', 'requirements.txt'), 'utf8'),
  latestGitTimestamp(),
  previousGeneratedAt(),
  gitOutput(['status', '--porcelain']),
  gitOutput(['diff', '--numstat']),
])

const packageJson = JSON.parse(packageJsonText)
const packageLock = JSON.parse(packageLockText)
const cssSource = frontendFiles.filter((file) => file.extension === 'css').map((file) => file.content).join('\n')
const typeSource = frontendFiles.filter((file) => file.extension === 'ts' || file.extension === 'tsx').map((file) => file.content).join('\n')
const backendSource = backendFiles.filter((file) => file.extension === 'py').map((file) => file.content).join('\n')

const staticRoutes = [...typeSource.matchAll(/path === '([^']+)'/g)].map((match) => match[1])
const frontendRoutes = [...new Set([
  ...staticRoutes,
  '/workscape',
  '/listings/:id',
  '/agents/:id',
  '/agent/listings/:id/edit',
  '/admin/agents/:id',
])].sort()
const apiRoutes = [...backendSource.matchAll(/\bpath\(['"]([^'"]*)['"]/g)].map((match) => match[1])
const backendApps = backendFiles.filter((file) => file.path.match(/^backend\/apps\/[^/]+\/apps\.py$/)).length

const componentCount = countMatches(typeSource, /function\s+[A-Z][A-Za-z0-9]*\s*\(/g)
const cssTokenCount = new Set([...cssSource.matchAll(/--([a-z0-9-]+)\s*:/g)].map((match) => match[1])).size
const dataTypeCount = countMatches(typeSource, /export\s+type\s+[A-Z][A-Za-z0-9]*/g)

const stackNames = ['react', 'react-dom', 'vite', 'typescript', 'lucide-react']
const stack = stackNames.map((name) => ({
  name,
  requested: packageJson.dependencies?.[name] ?? packageJson.devDependencies?.[name] ?? 'transitive',
  installed: packageVersion(packageLock, name),
})).concat([
  { name: 'django', requested: requirementVersion(backendRequirementsText, 'Django'), installed: requirementVersion(backendRequirementsText, 'Django') },
  { name: 'djangorestframework', requested: requirementVersion(backendRequirementsText, 'djangorestframework'), installed: requirementVersion(backendRequirementsText, 'djangorestframework') },
])

const appArtifacts = [...frontendFiles, ...backendFiles]
const allArtifacts = [...appArtifacts, ...planFiles, ...designFiles, ...requirementFiles]
const extensionTotals = Object.values(allArtifacts.reduce((groups, file) => {
  const current = groups[file.extension] ?? { extension: file.extension, files: 0, lines: 0 }
  current.files += 1
  current.lines += file.lines
  groups[file.extension] = current
  return groups
}, {})).sort((a, b) => b.lines - a.lines)

const artifactByPath = new Map(allArtifacts.map((file) => [file.path, file]))
const parsedChangedFiles = parseStatus(gitStatusText, gitNumstatText).filter((file) => file.status !== 'deleted')
const changedFileContents = await Promise.all(parsedChangedFiles.map(async (file) => {
  const scannedContent = artifactByPath.get(file.path)?.content
  if (scannedContent !== undefined) return scannedContent
  return readFile(resolve(workspaceRoot, file.path), 'utf8').catch(() => '')
}))
const changedFileBeforeContents = await Promise.all(parsedChangedFiles.map((file) => gitFileAtHead(file.path)))
const changedFiles = parsedChangedFiles.map((file, index) => ({
  ...file,
  ...visualProfileForFile(file.path, changedFileContents[index]),
  snapshot: snapshotForFile(file.path, file.status, changedFileBeforeContents[index], changedFileContents[index]),
}))
const changedPathSet = new Set(changedFiles.map((file) => file.path))
const changedDepartments = Object.values(changedFiles.reduce((groups, file) => {
  const current = groups[file.department] ?? { name: file.department, files: 0, additions: 0, deletions: 0 }
  current.files += 1
  current.additions += file.additions
  current.deletions += file.deletions
  groups[file.department] = current
  return groups
}, {})).sort((a, b) => b.files - a.files || b.additions + b.deletions - (a.additions + a.deletions))
const stableAnchors = [
  'README.md',
  'PROGRESS.md',
  'backend/backend/settings.py',
  'backend/backend/urls.py',
  'backend/docs/database-schema.md',
  'frontend/src/pages/RouteScreens.tsx',
  'frontend/src/api/backendApi.ts',
  'frontend/src/App.css',
  'plan/README.md',
  'design/README.md',
].filter((path) => !changedPathSet.has(path)).map((path) => ({ path, department: departmentForPath(path), status: 'unchanged' }))
const changeSummary = {
  changedFiles: changedFiles.length,
  stableAnchors: stableAnchors.length,
  additions: sum(changedFiles, 'additions'),
  deletions: sum(changedFiles, 'deletions'),
  departments: changedDepartments.length,
}

const events = [
  {
    id: 'grounded',
    label: '01',
    title: 'Product grounded',
    outcome: 'Scope, permissions, domains, and delivery phases are written down.',
    signal: `${planFiles.length + requirementFiles.length} decision artifacts`,
    files: ['plan/README.md', 'plan/requirements/mvp-scope.md', 'requirement/design/foundations.md'],
    accent: '#e0a43a',
  },
  {
    id: 'shaped',
    label: '02',
    title: 'Experience shaped',
    outcome: 'The visual direction and page-level behavior cover public, student, agent, and admin work.',
    signal: `${designFiles.length} design artifacts`,
    files: ['design/foundations/visual-direction.md', 'design/pages/page-inventory.md'],
    accent: '#4f8cc9',
  },
  {
    id: 'modeled',
    label: '03',
    title: 'System modeled',
    outcome: 'Django domain apps, models, serializers, and typed frontend records describe the AgentMS operating data.',
    signal: `${backendApps} backend apps · ${dataTypeCount} frontend contracts`,
    files: ['backend/apps/listings/models.py', 'backend/apps/agents/serializers.py', 'frontend/src/app/types.ts'],
    accent: '#d06b50',
  },
  {
    id: 'built',
    label: '04',
    title: 'Interfaces built',
    outcome: 'Role-specific frontend routes and backend API routes now form a working browser-to-API product surface.',
    signal: `${frontendRoutes.length} UI routes · ${apiRoutes.length} API routes`,
    files: ['frontend/src/pages/RouteScreens.tsx', 'frontend/src/App.css'],
    accent: '#1d8b69',
  },
  {
    id: 'connected',
    label: '05',
    title: 'Behavior connected',
    outcome: 'The frontend loads Django REST data while preserving local preview behavior for mutations and demos.',
    signal: 'DRF adapter + prototype fallback',
    files: ['frontend/src/api/backendApi.ts', 'backend/backend/urls.py', 'backend/apps/inquiries/views.py'],
    accent: '#8b69b1',
  },
  {
    id: 'visualized',
    label: '06',
    title: 'Work made visible',
    outcome: 'Repository evidence now drives an adaptive spatial canvas with context-aware artifact scenes.',
    signal: 'Semantic manifest + spatial renderer',
    files: ['frontend/scripts/generate-workscape.mjs', 'frontend/src/workscape/Workscape.tsx'],
    accent: '#ec7f32',
  },
]

const surfaces = [
  { id: 'intent', label: 'Product intent', detail: `${planFiles.length + requirementFiles.length} artifacts`, event: 0, x: 90, y: 115, width: 275, height: 118, accent: '#e0a43a' },
  { id: 'design', label: 'Experience system', detail: `${designFiles.length} artifacts`, event: 1, x: 90, y: 355, width: 275, height: 118, accent: '#4f8cc9' },
  { id: 'data', label: 'Domain data', detail: `${backendApps} apps`, event: 2, x: 505, y: 545, width: 275, height: 118, accent: '#d06b50' },
  { id: 'shell', label: 'Application shell', detail: `${componentCount} components`, event: 3, x: 505, y: 235, width: 275, height: 118, accent: '#1d8b69' },
  { id: 'student', label: 'Student', detail: `${frontendRoutes.filter((route) => route.startsWith('/student') || route === '/' || route.startsWith('/listings')).length} routes`, event: 3, x: 920, y: 78, width: 235, height: 104, accent: '#1d8b69' },
  { id: 'agent', label: 'Agent', detail: `${frontendRoutes.filter((route) => route.startsWith('/agent')).length} routes`, event: 3, x: 920, y: 250, width: 235, height: 104, accent: '#1d8b69' },
  { id: 'admin', label: 'Admin', detail: `${frontendRoutes.filter((route) => route.startsWith('/admin')).length} routes`, event: 3, x: 920, y: 422, width: 235, height: 104, accent: '#1d8b69' },
  { id: 'behavior', label: 'Interactive state', detail: 'Persistence + actions', event: 4, x: 920, y: 594, width: 235, height: 104, accent: '#8b69b1' },
  { id: 'workscape', label: 'Workscape', detail: 'Replay + image', event: 5, x: 1290, y: 267, width: 240, height: 132, accent: '#ec7f32' },
]

const connections = [
  { from: 'intent', to: 'shell', event: 0 },
  { from: 'design', to: 'shell', event: 1 },
  { from: 'data', to: 'shell', event: 2 },
  { from: 'shell', to: 'student', event: 3 },
  { from: 'shell', to: 'agent', event: 3 },
  { from: 'shell', to: 'admin', event: 3 },
  { from: 'data', to: 'behavior', event: 4 },
  { from: 'shell', to: 'behavior', event: 4 },
  { from: 'student', to: 'workscape', event: 5 },
  { from: 'agent', to: 'workscape', event: 5 },
  { from: 'admin', to: 'workscape', event: 5 },
  { from: 'behavior', to: 'workscape', event: 5 },
]

const manifest = {
  schemaVersion: 3,
  generatedAt: generatedAtFromGit || generatedAtFromPrevious || new Date().toISOString(),
  mood: 'adaptive spatial workspace',
  project: 'AgentMS',
  source: {
    mode: 'semantic workspace field',
    gitAvailable,
    note: gitAvailable
      ? 'This field profiles the current working tree by artifact kind, visual mood, code signals, and change intensity.'
      : 'No usable Git history was present, so this view reports current artifacts rather than commit chronology.',
  },
  summary: {
    sourceFiles: appArtifacts.length,
    sourceLines: sum(appArtifacts, 'lines'),
    frontendFiles: frontendFiles.length,
    frontendLines: sum(frontendFiles, 'lines'),
    backendFiles: backendFiles.length,
    backendLines: sum(backendFiles, 'lines'),
    routes: frontendRoutes.length,
    apiRoutes: apiRoutes.length,
    backendApps,
    components: componentCount,
    designDocs: designFiles.length,
    decisionDocs: planFiles.length + requirementFiles.length,
    cssTokens: cssTokenCount,
  },
  stack,
  change: {
    summary: changeSummary,
    files: changedFiles,
    departments: changedDepartments,
    stableAnchors,
  },
  events,
  surfaces,
  connections,
  artifacts: extensionTotals,
}

const manifestText = `${JSON.stringify(manifest, null, 2)}\n`
const currentManifestText = await readFile(outputPath, 'utf8').catch(() => '')
if (currentManifestText !== manifestText) {
  await writeFile(outputPath, manifestText, 'utf8')
}
console.log(`Workscape manifest generated: ${relative(frontendRoot, outputPath)}`)
console.log(`${appArtifacts.length} app source files · ${frontendRoutes.length} UI routes · ${apiRoutes.length} API routes · ${sum(allArtifacts, 'lines')} tracked lines`)
