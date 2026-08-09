import { access, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const frontendRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const workspaceRoot = resolve(frontendRoot, '..')
const outputPath = join(frontendRoot, 'public', 'workscape-data.json')

const textExtensions = new Set(['.css', '.html', '.js', '.json', '.md', '.mjs', '.ts', '.tsx'])
const excludedDirectories = new Set(['.git', 'dist', 'node_modules'])

const gitAvailable = await access(join(workspaceRoot, '.git', 'HEAD')).then(() => true).catch(() => false)

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

function countMatches(content, expression) {
  return [...content.matchAll(expression)].length
}

const [sourceFiles, planFiles, designFiles, requirementFiles, packageJsonText, packageLockText] = await Promise.all([
  inspectFiles(join(frontendRoot, 'src')),
  inspectFiles(join(workspaceRoot, 'plan')),
  inspectFiles(join(workspaceRoot, 'design')),
  inspectFiles(join(workspaceRoot, 'requirement')),
  readFile(join(frontendRoot, 'package.json'), 'utf8'),
  readFile(join(frontendRoot, 'package-lock.json'), 'utf8'),
])

const packageJson = JSON.parse(packageJsonText)
const packageLock = JSON.parse(packageLockText)
const routeSource = sourceFiles.find((file) => file.path.endsWith('src/pages/RouteScreens.tsx'))?.content ?? ''
const cssSource = sourceFiles.filter((file) => file.extension === 'css').map((file) => file.content).join('\n')
const typeSource = sourceFiles.filter((file) => file.extension === 'ts' || file.extension === 'tsx').map((file) => file.content).join('\n')

const staticRoutes = [...routeSource.matchAll(/path === '([^']+)'/g)].map((match) => match[1])
const routes = [...new Set([
  ...staticRoutes,
  '/workscape',
  '/listings/:id',
  '/agents/:id',
  '/agent/listings/:id/edit',
  '/admin/agents/:id',
])].sort()

const componentCount = countMatches(typeSource, /function\s+[A-Z][A-Za-z0-9]*\s*\(/g)
const cssTokenCount = new Set([...cssSource.matchAll(/--([a-z0-9-]+)\s*:/g)].map((match) => match[1])).size
const dataTypeCount = countMatches(typeSource, /export\s+type\s+[A-Z][A-Za-z0-9]*/g)

const stackNames = ['react', 'react-dom', 'vite', 'typescript', 'lucide-react']
const stack = stackNames.map((name) => ({
  name,
  requested: packageJson.dependencies?.[name] ?? packageJson.devDependencies?.[name] ?? 'transitive',
  installed: packageVersion(packageLock, name),
}))

const allArtifacts = [...sourceFiles, ...planFiles, ...designFiles, ...requirementFiles]
const extensionTotals = Object.values(allArtifacts.reduce((groups, file) => {
  const current = groups[file.extension] ?? { extension: file.extension, files: 0, lines: 0 }
  current.files += 1
  current.lines += file.lines
  groups[file.extension] = current
  return groups
}, {})).sort((a, b) => b.lines - a.lines)

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
    outcome: 'Typed records and seeded operational data connect listings, agents, inquiries, and moderation.',
    signal: `${dataTypeCount} typed contracts`,
    files: ['frontend/src/app/types.ts', 'frontend/src/data/mockData.ts', 'frontend/src/api/mockApi.ts'],
    accent: '#d06b50',
  },
  {
    id: 'built',
    label: '04',
    title: 'Interfaces built',
    outcome: 'Role-specific routes assemble a shared visual language into a working browser prototype.',
    signal: `${routes.length} routes · ${componentCount} components`,
    files: ['frontend/src/pages/RouteScreens.tsx', 'frontend/src/App.css'],
    accent: '#1d8b69',
  },
  {
    id: 'connected',
    label: '05',
    title: 'Behavior connected',
    outcome: 'Search, inquiry, moderation, editing, persistence, and reset flows respond to user input.',
    signal: 'Local persistence + mock API',
    files: ['frontend/src/api/mockApi.ts', 'frontend/src/pages/RouteScreens.tsx'],
    accent: '#8b69b1',
  },
  {
    id: 'visualized',
    label: '06',
    title: 'Work made visible',
    outcome: 'Repository evidence now drives this replayable map and its downloadable image.',
    signal: 'Generated manifest + SVG snapshot',
    files: ['frontend/scripts/generate-workscape.mjs', 'frontend/src/workscape/Workscape.tsx'],
    accent: '#ec7f32',
  },
]

const surfaces = [
  { id: 'intent', label: 'Product intent', detail: `${planFiles.length + requirementFiles.length} artifacts`, event: 0, x: 90, y: 115, width: 275, height: 118, accent: '#e0a43a' },
  { id: 'design', label: 'Experience system', detail: `${designFiles.length} artifacts`, event: 1, x: 90, y: 355, width: 275, height: 118, accent: '#4f8cc9' },
  { id: 'data', label: 'Domain data', detail: `${dataTypeCount} contracts`, event: 2, x: 505, y: 545, width: 275, height: 118, accent: '#d06b50' },
  { id: 'shell', label: 'Application shell', detail: `${componentCount} components`, event: 3, x: 505, y: 235, width: 275, height: 118, accent: '#1d8b69' },
  { id: 'student', label: 'Student', detail: `${routes.filter((route) => route.startsWith('/student') || route === '/' || route.startsWith('/listings')).length} routes`, event: 3, x: 920, y: 78, width: 235, height: 104, accent: '#1d8b69' },
  { id: 'agent', label: 'Agent', detail: `${routes.filter((route) => route.startsWith('/agent')).length} routes`, event: 3, x: 920, y: 250, width: 235, height: 104, accent: '#1d8b69' },
  { id: 'admin', label: 'Admin', detail: `${routes.filter((route) => route.startsWith('/admin')).length} routes`, event: 3, x: 920, y: 422, width: 235, height: 104, accent: '#1d8b69' },
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
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  mood: 'living visual changelog',
  project: 'AgentMS',
  source: {
    mode: 'workspace snapshot',
    gitAvailable,
    note: gitAvailable
      ? 'This milestone reports the current workspace snapshot; commit chronology can be added to the same manifest contract.'
      : 'No usable Git history was present, so this view reports current artifacts rather than commit chronology.',
  },
  summary: {
    sourceFiles: sourceFiles.length,
    sourceLines: sum(sourceFiles, 'lines'),
    routes: routes.length,
    components: componentCount,
    designDocs: designFiles.length,
    decisionDocs: planFiles.length + requirementFiles.length,
    cssTokens: cssTokenCount,
  },
  stack,
  events,
  surfaces,
  connections,
  artifacts: extensionTotals,
}

await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
console.log(`Workscape manifest generated: ${relative(frontendRoot, outputPath)}`)
console.log(`${sourceFiles.length} source files · ${routes.length} routes · ${componentCount} components · ${sum(allArtifacts, 'lines')} tracked lines`)
