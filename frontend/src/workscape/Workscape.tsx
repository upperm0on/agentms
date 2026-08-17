import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import gsap from 'gsap'
import Lenis from 'lenis'
import {
  ArrowLeft,
  Box,
  CircleDot,
  Focus,
  Minus,
  Orbit,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import './Workscape.css'

type ChangeFile = {
  path: string
  status: string
  department: string
  additions: number
  deletions: number
  kind?: string
  mood?: string
  accent?: string
  palette?: string[]
  signals?: string[]
  snapshot?: {
    mode: string
    focus: string
    before: SnapshotProfile
    after: SnapshotProfile
  }
}

type SnapshotProfile = {
  kind?: string
  mood?: string
  accent?: string
  palette?: string[]
  signals?: string[]
  empty?: boolean
  lines?: number
  label?: string
}

type WorkscapeManifest = {
  generatedAt: string
  mood: string
  project: string
  source: { mode: string; gitAvailable: boolean; note: string }
  summary: { sourceFiles: number; sourceLines: number; routes: number; apiRoutes: number; backendApps: number; components: number }
  change: {
    summary: { changedFiles: number; stableAnchors: number; additions: number; deletions: number; departments: number }
    files: ChangeFile[]
    departments: Array<{ name: string; files: number; additions: number; deletions: number }>
    stableAnchors: Array<{ path: string; department: string; status: string }>
  }
}

type Camera = { x: number; y: number; scale: number }
type PositionedFile = ChangeFile & { x: number; y: number; sequence: number }
type PositionedDepartment = WorkscapeManifest['change']['departments'][number] & { x: number; y: number; filesInSpace: PositionedFile[] }

const SPACE_WIDTH = 2200
const SPACE_HEIGHT = 1400
const FILE_OFFSETS = [
  [-300, -225], [300, -225], [-300, 225], [300, 225], [-385, 0], [385, 0], [0, -285], [0, 285],
]

const FALLBACK_PROFILES: Record<string, Pick<ChangeFile, 'kind' | 'mood' | 'accent'>> = {
  css: { kind: 'style', mood: 'kinetic visual system', accent: '#ff8a3d' },
  tsx: { kind: 'interface', mood: 'interactive interface', accent: '#52d6c5' },
  ts: { kind: 'automation', mood: 'logic flow', accent: '#f3c75f' },
  mjs: { kind: 'automation', mood: 'generative pipeline', accent: '#f3c75f' },
  json: { kind: 'data', mood: 'structured live state', accent: '#a88cf5' },
  md: { kind: 'narrative', mood: 'documented intent', accent: '#ef718a' },
  py: { kind: 'service', mood: 'backend service flow', accent: '#6fb8ff' },
}

function fileName(path: string) {
  return path.split('/').at(-1) ?? path
}

function profileFor(file: ChangeFile) {
  const extension = file.path.split('.').at(-1)?.toLowerCase() ?? ''
  const fallback = FALLBACK_PROFILES[extension] ?? { kind: 'artifact', mood: 'workspace element', accent: '#9caeaa' }
  return {
    kind: file.kind ?? fallback.kind,
    mood: file.mood ?? fallback.mood,
    accent: file.accent ?? fallback.accent,
    palette: file.palette?.length ? file.palette : [file.accent ?? fallback.accent, '#17211f', '#eef1eb'],
  }
}

function snapshotProfileFor(file: ChangeFile, phase: 'before' | 'after') {
  const fallback = profileFor(file)
  const snapshot = file.snapshot?.[phase]
  return {
    kind: snapshot?.kind ?? fallback.kind,
    mood: snapshot?.mood ?? fallback.mood,
    accent: snapshot?.accent ?? fallback.accent,
    palette: snapshot?.palette?.length ? snapshot.palette : fallback.palette,
    signals: snapshot?.signals ?? file.signals ?? [],
    empty: snapshot?.empty ?? false,
    lines: snapshot?.lines ?? 0,
    label: snapshot?.label ?? phase,
  }
}

function useWorkscapeManifest() {
  const [data, setData] = useState<WorkscapeManifest | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}workscape-data.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`)
        return response.json() as Promise<WorkscapeManifest>
      })
      .then(setData)
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'The Workscape manifest could not be loaded.')
      })
    return () => controller.abort()
  }, [])

  return { data, error }
}

function ArtifactVisual({ file, expanded = false, snapshot }: { file: ChangeFile; expanded?: boolean; snapshot?: ReturnType<typeof snapshotProfileFor> }) {
  const baseProfile = profileFor(file)
  const profile = {
    ...baseProfile,
    signals: file.signals ?? [],
    empty: false,
    lines: 0,
    label: '',
    ...snapshot,
  }
  const style = {
    '--artifact-accent': profile.accent,
    '--palette-one': profile.palette[0] ?? profile.accent,
    '--palette-two': profile.palette[1] ?? '#52d6c5',
    '--palette-three': profile.palette[2] ?? '#a88cf5',
  } as CSSProperties

  if (profile.empty) {
    return (
      <div className={`artifact-visual empty-visual ${expanded ? 'expanded' : ''}`} style={style}>
        <span /><i /><i /><i />
      </div>
    )
  }

  if (profile.kind === 'style') {
    return (
      <div className={`artifact-visual style-visual ${expanded ? 'expanded' : ''}`} style={style}>
        <span className="style-orbit orbit-a" /><span className="style-orbit orbit-b" /><span className="style-orbit orbit-c" />
        <div className="style-palette">{profile.palette.slice(0, 5).map((color) => <i key={color} style={{ background: color }} />)}</div>
      </div>
    )
  }

  if (profile.kind === 'interface') {
    return (
      <div className={`artifact-visual interface-visual ${expanded ? 'expanded' : ''}`} style={style}>
        <div className="interface-chrome"><i /><i /><i /></div>
        <div className="interface-shell"><span className="interface-nav" /><div className="interface-content"><b /><b /><b /><em /><em /></div></div>
        <span className="interface-cursor" />
      </div>
    )
  }

  if (profile.kind === 'automation') {
    return (
      <div className={`artifact-visual automation-visual ${expanded ? 'expanded' : ''}`} style={style}>
        <span className="automation-line" />
        {[0, 1, 2, 3].map((index) => <i key={index} style={{ '--step': index } as CSSProperties}><b /></i>)}
      </div>
    )
  }

  if (profile.kind === 'data') {
    return (
      <div className={`artifact-visual data-visual ${expanded ? 'expanded' : ''}`} style={style}>
        {Array.from({ length: 24 }, (_, index) => <i key={index} style={{ '--cell': index } as CSSProperties} />)}
        <span className="data-scan" />
      </div>
    )
  }

  if (profile.kind === 'narrative') {
    return (
      <div className={`artifact-visual narrative-visual ${expanded ? 'expanded' : ''}`} style={style}>
        {[0, 1, 2].map((page) => <div className={`narrative-page page-${page}`} key={page}><b />{[0, 1, 2, 3].map((line) => <i key={line} />)}</div>)}
      </div>
    )
  }

  if (profile.kind === 'service') {
    return (
      <div className={`artifact-visual service-visual ${expanded ? 'expanded' : ''}`} style={style}>
        <span className="service-core" />
        {[0, 1, 2, 3, 4].map((index) => <i key={index} style={{ '--service-index': index } as CSSProperties} />)}
      </div>
    )
  }

  return <div className={`artifact-visual artifact-generic ${expanded ? 'expanded' : ''}`} style={style}><Box /><span /><span /><span /></div>
}

function SnapshotComparison({ file }: { file: ChangeFile }) {
  const before = snapshotProfileFor(file, 'before')
  const after = snapshotProfileFor(file, 'after')
  return (
    <div className="snapshot-comparison">
      <div className="snapshot-stage before" style={{ '--snapshot-accent': before.accent } as CSSProperties}>
        <span>{before.label}</span>
        <ArtifactVisual file={file} snapshot={before} />
        <small>{before.lines} lines</small>
      </div>
      <div className="snapshot-transfer" aria-hidden="true"><i /><i /><i /></div>
      <div className="snapshot-stage after" style={{ '--snapshot-accent': after.accent } as CSSProperties}>
        <span>{after.label}</span>
        <ArtifactVisual file={file} snapshot={after} />
        <small>{after.lines} lines</small>
      </div>
    </div>
  )
}

function makeSpace(data: WorkscapeManifest): PositionedDepartment[] {
  const departments = data.change.departments.length
    ? data.change.departments.slice(0, 6)
    : [{ name: 'Workspace', files: 0, additions: 0, deletions: 0 }]

  return departments.map((department, index) => {
    let x = 1100
    let y = 700
    if (departments.length === 1) x = 680
    else if (departments.length === 2) x = index === 0 ? 650 : 1550
    else {
      const angle = (-90 + (index * 360) / departments.length) * Math.PI / 180
      x += Math.cos(angle) * 560
      y += Math.sin(angle) * 390
    }
    const files = data.change.files.filter((file) => file.department === department.name)
    const filesInSpace = files.map((file, fileIndex) => {
      const offset = FILE_OFFSETS[fileIndex % FILE_OFFSETS.length]
      const sequence = data.change.files.findIndex((changedFile) => changedFile.path === file.path)
      return { ...file, sequence: sequence < 0 ? fileIndex : sequence, x: x + offset[0], y: y + offset[1] }
    })
    return { ...department, x, y, filesInSpace }
  })
}

export function Workscape({ navigate }: { navigate: (path: string) => void }) {
  const { data, error } = useWorkscapeManifest()
  const viewportRef = useRef<HTMLDivElement>(null)
  const lensScrollRef = useRef<HTMLElement>(null)
  const dragRef = useRef<{ pointerId: number; x: number; y: number; cameraX: number; cameraY: number } | null>(null)
  const cameraTargetRef = useRef<Camera>({ x: 0, y: 0, scale: .7 })
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: .7 })
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string> | null>(null)
  const [stableExpanded, setStableExpanded] = useState(false)
  const [selected, setSelected] = useState<ChangeFile | null>(null)
  const departments = useMemo(() => data ? makeSpace(data) : [], [data])

  const animateCamera = useCallback((next: Camera, duration = .62) => {
    gsap.killTweensOf(cameraTargetRef.current)
    gsap.to(cameraTargetRef.current, {
      x: next.x,
      y: next.y,
      scale: next.scale,
      duration,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: () => setCamera({ ...cameraTargetRef.current }),
      onComplete: () => setCamera({ ...cameraTargetRef.current }),
    })
  }, [])

  const fitSpace = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const fittedScale = Math.min(viewport.clientWidth / SPACE_WIDTH, viewport.clientHeight / SPACE_HEIGHT) * 1.12
    const scale = viewport.clientWidth < 720 ? Math.max(.42, fittedScale) : fittedScale
    animateCamera({
      scale,
      x: (viewport.clientWidth - SPACE_WIDTH * scale) / 2,
      y: (viewport.clientHeight - SPACE_HEIGHT * scale) / 2,
    }, .74)
  }, [animateCamera])

  useEffect(() => {
    if (!data) return
    requestAnimationFrame(fitSpace)
    const observer = new ResizeObserver(fitSpace)
    if (viewportRef.current) observer.observe(viewportRef.current)
    return () => observer.disconnect()
  }, [data, fitSpace])

  useEffect(() => () => {
    gsap.killTweensOf(cameraTargetRef.current)
  }, [])

  useEffect(() => {
    const wrapper = lensScrollRef.current
    if (!selected || !wrapper) return undefined
    const content = wrapper.firstElementChild
    if (!(content instanceof HTMLElement)) return undefined
    const lenis = new Lenis({
      wrapper,
      content,
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: .8,
    })
    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [selected])

  const zoomAtCenter = (factor: number) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const centerX = viewport.clientWidth / 2
    const centerY = viewport.clientHeight / 2
    const current = cameraTargetRef.current
    const scale = Math.min(1.6, Math.max(.28, current.scale * factor))
    const worldX = (centerX - current.x) / current.scale
    const worldY = (centerY - current.y) / current.scale
    animateCamera({ scale, x: centerX - worldX * scale, y: centerY - worldY * scale })
  }

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointerX = event.clientX - bounds.left
    const pointerY = event.clientY - bounds.top
    const current = cameraTargetRef.current
    if (event.ctrlKey || event.metaKey) {
      const scale = Math.min(1.6, Math.max(.28, current.scale * Math.exp(-event.deltaY * .0014)))
      const worldX = (pointerX - current.x) / current.scale
      const worldY = (pointerY - current.y) / current.scale
      animateCamera({ scale, x: pointerX - worldX * scale, y: pointerY - worldY * scale }, .42)
      return
    }
    const xDelta = event.shiftKey ? event.deltaY : event.deltaX
    animateCamera({
      ...current,
      x: current.x - xDelta,
      y: current.y - event.deltaY,
    }, .48)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    gsap.killTweensOf(cameraTargetRef.current)
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, cameraX: cameraTargetRef.current.x, cameraY: cameraTargetRef.current.y }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.classList.add('dragging')
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const next = { ...cameraTargetRef.current, x: drag.cameraX + event.clientX - drag.x, y: drag.cameraY + event.clientY - drag.y }
    Object.assign(cameraTargetRef.current, next)
    setCamera({ ...cameraTargetRef.current })
  }

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    event.currentTarget.classList.remove('dragging')
  }

  const toggleDepartment = (name: string) => {
    setExpandedDepartments((current) => {
      const next = new Set(current ?? (data?.change.departments ?? []).map((department) => department.name))
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const departmentIsExpanded = (name: string) => expandedDepartments === null || expandedDepartments.has(name)

  if (error) return <main className="workscape-state"><CircleDot /><h1>Workscape unavailable</h1><p>{error}</p><button onClick={() => navigate('/')}>Return to AgentMS</button></main>
  if (!data) return <main className="workscape-state" aria-live="polite"><span className="workscape-loader" /><p>Building spatial context</p></main>

  const stableCenter = { x: 1100, y: 1190 }

  return (
    <main className="workscape">
      <header className="workscape-header">
        <div className="workscape-brand">
          <button className="workscape-icon-button" onClick={() => navigate('/')} title="Return to AgentMS" aria-label="Return to AgentMS"><ArrowLeft /></button>
          <div className="workscape-mark"><Orbit /></div>
          <div><strong>Workscape</strong><span>{data.project} · {data.mood}</span></div>
        </div>
        <div className="workscape-live"><i />{data.change.summary.changedFiles} live changes</div>
        <div className="workscape-actions">
          <button className="workscape-icon-button" onClick={() => zoomAtCenter(.82)} title="Zoom out" aria-label="Zoom out"><Minus /></button>
          <span className="workscape-zoom">{Math.round(camera.scale * 100)}%</span>
          <button className="workscape-icon-button" onClick={() => zoomAtCenter(1.22)} title="Zoom in" aria-label="Zoom in"><Plus /></button>
          <button className="workscape-icon-button fit" onClick={fitSpace} title="Fit space" aria-label="Fit space"><Focus /></button>
        </div>
      </header>

      <div
        ref={viewportRef}
        className="workscape-viewport"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        <div className="workscape-space" style={{ transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})` }}>
          <div className="space-grid" />
          <svg className="space-connections" viewBox={`0 0 ${SPACE_WIDTH} ${SPACE_HEIGHT}`} aria-hidden="true">
            {departments.map((department, index) => (
              <g key={department.name}>
                <path className="space-flow main" style={{ '--flow-delay': `${index * 180}ms` } as CSSProperties} d={`M 1100 700 C ${1100 + (department.x - 1100) * .42} ${610 + index * 38}, ${1100 + (department.x - 1100) * .72} ${department.y}, ${department.x} ${department.y}`} />
                {departmentIsExpanded(department.name) && department.filesInSpace.map((file) => (
                  <path className="space-flow branch" style={{ '--flow-delay': `${260 + file.sequence * 150}ms` } as CSSProperties} key={file.path} d={`M ${department.x} ${department.y} Q ${(department.x + file.x) / 2} ${(department.y + file.y) / 2 - 35}, ${file.x} ${file.y}`} />
                ))}
              </g>
            ))}
            <path className="space-flow stable-line" d={`M 1100 700 C 1100 870, 1100 1010, ${stableCenter.x} ${stableCenter.y}`} />
          </svg>

          <button className="project-core" style={{ left: 1100, top: 700 } as CSSProperties} onClick={() => setSelected(null)}>
            <span className="project-radar radar-outer" /><span className="project-radar radar-inner" />
            <Sparkles /><strong>{data.project}</strong><small>request complete</small>
          </button>

          {departments.map((department) => {
            const expanded = departmentIsExpanded(department.name)
            return (
              <div className="department-constellation" key={department.name}>
                <button
                  className={`department-node ${expanded ? 'expanded' : 'collapsed'}`}
                  style={{ left: department.x, top: department.y, '--cluster-accent': department.filesInSpace[0] ? profileFor(department.filesInSpace[0]).accent : '#ff8a3d' } as CSSProperties}
                  onClick={() => toggleDepartment(department.name)}
                  aria-expanded={expanded}
                >
                  <span className="department-ring" /><Box /><strong>{department.name}</strong><small>{department.files} elements</small>
                </button>
                {expanded && department.filesInSpace.map((file) => {
                  const profile = profileFor(file)
                  return (
                    <button
                      className={`visual-node ${selected?.path === file.path ? 'selected' : ''}`}
                      style={{ left: file.x, top: file.y, '--node-accent': profile.accent, '--node-delay': `${420 + file.sequence * 150}ms` } as CSSProperties}
                      key={file.path}
                      onClick={() => setSelected(file)}
                    >
                      <ArtifactVisual file={file} />
                      <span className="visual-node-copy"><strong>{fileName(file.path)}</strong><small>{profile.mood}</small></span>
                      <i className="change-volume">{file.additions + file.deletions}</i>
                    </button>
                  )
                })}
              </div>
            )
          })}

          <div className="stable-constellation">
            <button className={`stable-cluster ${stableExpanded ? 'expanded' : ''}`} style={{ left: stableCenter.x, top: stableCenter.y }} onClick={() => setStableExpanded((current) => !current)} aria-expanded={stableExpanded}>
              <span /><CircleDot /><strong>Stable field</strong><small>{data.change.summary.stableAnchors} anchors</small>
            </button>
            {stableExpanded && data.change.stableAnchors.slice(0, 10).map((anchor, index) => {
              const angle = (-165 + index * (330 / Math.max(data.change.stableAnchors.length - 1, 1))) * Math.PI / 180
              const x = stableCenter.x + Math.cos(angle) * 430
              const y = stableCenter.y + Math.sin(angle) * 125
              return <button className="stable-node" key={anchor.path} style={{ left: x, top: y, '--stable-delay': `${index * 55}ms` } as CSSProperties} title={anchor.path}><i /><span>{fileName(anchor.path)}</span></button>
            })}
          </div>
        </div>

        <div className="space-status">
          <span><i className="active" />+{data.change.summary.additions} / -{data.change.summary.deletions}</span>
          <span><i className="quiet" />{data.summary.sourceFiles} source elements</span>
        </div>

        {selected && (
          <aside ref={lensScrollRef} className="artifact-lens" style={{ '--lens-accent': profileFor(selected).accent } as CSSProperties}>
            <div className="artifact-lens-content">
              <button className="lens-close" onClick={() => setSelected(null)} title="Close" aria-label="Close"><X /></button>
              <span className="lens-kind">{profileFor(selected).kind}</span>
              <SnapshotComparison file={selected} />
              <div className="lens-copy">
                <small>{selected.department}</small>
                <h2>{fileName(selected.path)}</h2>
                <p>{selected.snapshot?.focus ?? profileFor(selected).mood}</p>
              </div>
              <div className="lens-signals">{selected.signals?.map((signal) => <span key={signal}>{signal}</span>)}</div>
              <div className="lens-delta"><span>+{selected.additions}</span><span>-{selected.deletions}</span><code>{selected.path}</code></div>
            </div>
          </aside>
        )}
      </div>
    </main>
  )
}
