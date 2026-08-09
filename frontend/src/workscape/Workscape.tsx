import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react'
import {
  ArrowLeft,
  Check,
  Download,
  FileCode2,
  Image,
  Layers3,
  Map as MapIcon,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import './Workscape.css'

type WorkscapeEvent = {
  id: string
  label: string
  title: string
  outcome: string
  signal: string
  files: string[]
  accent: string
}

type WorkscapeSurface = {
  id: string
  label: string
  detail: string
  event: number
  x: number
  y: number
  width: number
  height: number
  accent: string
}

type WorkscapeManifest = {
  schemaVersion: number
  generatedAt: string
  mood: string
  project: string
  source: { mode: string; gitAvailable: boolean; note: string }
  summary: {
    sourceFiles: number
    sourceLines: number
    routes: number
    components: number
    designDocs: number
    decisionDocs: number
    cssTokens: number
  }
  stack: Array<{ name: string; requested: string; installed: string }>
  events: WorkscapeEvent[]
  surfaces: WorkscapeSurface[]
  connections: Array<{ from: string; to: string; event: number }>
  artifacts: Array<{ extension: string; files: number; lines: number }>
}

type ViewMode = 'flow' | 'snapshot'

const EVENT_ICONS = [Layers3, Sparkles, FileCode2, MapIcon, Play, Image]
const SVG_NS = 'http://www.w3.org/2000/svg'

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

function connectionPath(from: WorkscapeSurface, to: WorkscapeSurface) {
  const startX = from.x + from.width
  const startY = from.y + from.height / 2
  const endX = to.x
  const endY = to.y + to.height / 2
  const bend = Math.max(70, Math.abs(endX - startX) * 0.46)
  return `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`
}

function ProjectMap({ data, active, svgRef }: { data: WorkscapeManifest; active: number; svgRef: RefObject<SVGSVGElement | null> }) {
  const surfaces = useMemo(() => new Map(data.surfaces.map((surface) => [surface.id, surface])), [data.surfaces])

  return (
    <svg ref={svgRef} className="workscape-map" viewBox="0 0 1600 820" role="img" aria-labelledby="workscape-map-title workscape-map-description">
      <title id="workscape-map-title">AgentMS project state map</title>
      <desc id="workscape-map-description">A generated map connecting product planning, design, data, application surfaces, interactions, and Workscape.</desc>
      <defs>
        <pattern id="workscape-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#31403c" strokeWidth="1" opacity="0.28" />
        </pattern>
        <marker id="workscape-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#80918c" />
        </marker>
      </defs>
      <rect className="map-background" width="1600" height="820" />
      <rect width="1600" height="820" fill="url(#workscape-grid)" />
      <text className="map-kicker" x="70" y="62">CURRENT PROJECT STATE · GENERATED FROM WORKSPACE</text>
      <text className="map-stamp" x="1530" y="62" textAnchor="end">SCHEMA {data.schemaVersion}</text>

      <g className="map-connections">
        {data.connections.map((connection) => {
          const from = surfaces.get(connection.from)
          const to = surfaces.get(connection.to)
          if (!from || !to) return null
          const visible = connection.event <= active
          return (
            <path
              key={`${connection.from}-${connection.to}`}
              d={connectionPath(from, to)}
              className={visible ? 'map-connection revealed' : 'map-connection'}
              markerEnd="url(#workscape-arrow)"
              style={{ '--connection-delay': `${connection.event * 80}ms` } as CSSProperties}
            />
          )
        })}
      </g>

      <g className="map-surfaces">
        {data.surfaces.map((surface) => {
          const visible = surface.event <= active
          const current = surface.event === active
          return (
            <g
              key={surface.id}
              className={`map-node ${visible ? 'revealed' : ''} ${current ? 'current' : ''}`}
              transform={`translate(${surface.x} ${surface.y})`}
              style={{ '--node-accent': surface.accent, '--node-delay': `${surface.event * 90}ms` } as CSSProperties}
            >
              <rect className="node-shadow" x="7" y="9" width={surface.width} height={surface.height} rx="4" />
              <rect className="node-body" width={surface.width} height={surface.height} rx="4" />
              <rect className="node-accent" width="7" height={surface.height} rx="3" />
              <circle className="node-signal" cx={surface.width - 27} cy="25" r="6" />
              <text className="node-label" x="24" y="43">{surface.label}</text>
              <text className="node-detail" x="24" y="71">{surface.detail}</text>
              <text className="node-index" x="24" y={surface.height - 17}>{String(surface.event + 1).padStart(2, '0')}</text>
            </g>
          )
        })}
      </g>

      <g className="map-footer">
        <line x1="70" y1="750" x2="1530" y2="750" stroke="#34433f" />
        <text x="70" y="786">{data.summary.sourceFiles} SOURCE FILES</text>
        <text x="355" y="786">{data.summary.sourceLines.toLocaleString()} SOURCE LINES</text>
        <text x="720" y="786">{data.summary.routes} ROUTES</text>
        <text x="970" y="786">{data.summary.components} COMPONENTS</text>
        <text x="1530" y="786" textAnchor="end">{data.summary.cssTokens} CSS TOKENS</text>
      </g>
    </svg>
  )
}

function exportSvg(svg: SVGSVGElement, project: string) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', SVG_NS)
  clone.setAttribute('width', '1600')
  clone.setAttribute('height', '820')
  clone.classList.add('snapshot-export')

  const style = document.createElementNS(SVG_NS, 'style')
  style.textContent = `
    text { font-family: Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: 0; }
    .map-background { fill: #17211f; }
    .map-kicker, .map-stamp, .map-footer text { fill: #91a09b; font-size: 14px; font-weight: 700; }
    .map-connection { fill: none; stroke: #70817c; stroke-width: 2; opacity: .8; }
    .node-shadow { fill: #0b1210; opacity: .48; }
    .node-body { fill: #f7f8f4; stroke: var(--node-accent); stroke-width: 1.5; }
    .node-accent, .node-signal { fill: var(--node-accent); }
    .node-label { fill: #17211f; font-size: 20px; font-weight: 800; }
    .node-detail { fill: #66746f; font-size: 14px; }
    .node-index { fill: var(--node-accent); font-size: 12px; font-weight: 800; }
    .map-footer line { stroke: #34433f; }
  `
  clone.prepend(style)
  clone.querySelectorAll('.map-node, .map-connection').forEach((element) => element.classList.add('revealed'))

  const serialized = new XMLSerializer().serializeToString(clone)
  const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${project.toLowerCase()}-workscape.svg`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function Workscape({ navigate }: { navigate: (path: string) => void }) {
  const { data, error } = useWorkscapeManifest()
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [mode, setMode] = useState<ViewMode>('flow')
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || !playing || mode !== 'flow') return
    const timer = window.setTimeout(() => {
      setActive((current) => {
        if (current >= data.events.length - 1) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 1450)
    return () => window.clearTimeout(timer)
  }, [active, data, mode, playing])

  if (error) {
    return <main className="workscape-state"><FileCode2 /><h1>Workscape unavailable</h1><p>{error}</p><button onClick={() => navigate('/')}>Return to AgentMS</button></main>
  }

  if (!data) {
    return <main className="workscape-state" aria-live="polite"><span className="workscape-loader" /><p>Composing project map</p></main>
  }

  const event = data.events[active]
  const eventCount = data.events.length
  const progress = ((active + 1) / data.events.length) * 100
  const largestArtifact = Math.max(...data.artifacts.map((artifact) => artifact.lines), 1)

  function chooseMode(nextMode: ViewMode) {
    setMode(nextMode)
    if (nextMode === 'snapshot') {
      setPlaying(false)
      setActive(eventCount - 1)
    }
  }

  function replay() {
    setMode('flow')
    setActive(0)
    setPlaying(true)
  }

  return (
    <main className="workscape">
      <header className="workscape-header">
        <div className="workscape-brand">
          <button className="workscape-icon-button" onClick={() => navigate('/')} title="Return to AgentMS" aria-label="Return to AgentMS"><ArrowLeft /></button>
          <div className="workscape-mark"><span>W</span></div>
          <div><strong>Workscape</strong><span>{data.project} · workspace snapshot</span></div>
        </div>
        <code>mood = &quot;{data.mood}&quot;</code>
        <div className="workscape-actions">
          <div className="workscape-segmented" aria-label="View mode">
            <button className={mode === 'flow' ? 'active' : ''} onClick={() => chooseMode('flow')}><Play />Flow</button>
            <button className={mode === 'snapshot' ? 'active' : ''} onClick={() => chooseMode('snapshot')}><Image />Snapshot</button>
          </div>
          <button className="workscape-button" onClick={() => svgRef.current && exportSvg(svgRef.current, data.project)} title="Download SVG snapshot"><Download /><span>Download SVG</span></button>
        </div>
      </header>

      <section className="workscape-stage-band">
        <div className="workscape-stage-heading">
          <div><span className="workscape-eyebrow">Project signal</span><h1>{event.title}</h1></div>
          <p>{event.outcome}</p>
        </div>

        <div className="workscape-stage-layout">
          <div className="workscape-map-frame">
            <ProjectMap data={data} active={active} svgRef={svgRef} />
            <div className="workscape-playback">
              <button className="workscape-icon-button light" onClick={() => setPlaying((current) => !current)} title={playing ? 'Pause replay' : 'Play replay'} aria-label={playing ? 'Pause replay' : 'Play replay'}>
                {playing ? <Pause /> : <Play />}
              </button>
              <button className="workscape-icon-button light" onClick={replay} title="Replay from start" aria-label="Replay from start"><RotateCcw /></button>
              <div className="workscape-progress"><i style={{ width: `${progress}%` }} /></div>
              <span>{String(active + 1).padStart(2, '0')} / {String(data.events.length).padStart(2, '0')}</span>
            </div>
          </div>

          <aside className="workscape-focus" style={{ '--event-accent': event.accent } as CSSProperties}>
            <span className="workscape-event-number">{event.label}</span>
            <div className="workscape-focus-icon">{(() => { const Icon = EVENT_ICONS[active] ?? Sparkles; return <Icon /> })()}</div>
            <span className="workscape-eyebrow">In focus</span>
            <h2>{event.title}</h2>
            <p>{event.outcome}</p>
            <strong>{event.signal}</strong>
            <div className="workscape-file-list">
              {event.files.map((file) => <span key={file}><Check />{file}</span>)}
            </div>
          </aside>
        </div>
      </section>

      <nav className="workscape-timeline" aria-label="Project sequence">
        {data.events.map((item, index) => {
          const Icon = EVENT_ICONS[index] ?? Sparkles
          return (
            <button
              key={item.id}
              className={`${index === active ? 'active' : ''} ${index < active ? 'passed' : ''}`}
              onClick={() => { setActive(index); setPlaying(false) }}
              style={{ '--event-accent': item.accent } as CSSProperties}
            >
              <span><Icon /></span>
              <small>{item.label}</small>
              <strong>{item.title}</strong>
            </button>
          )
        })}
      </nav>

      <section className="workscape-metrics-band">
        <div className="workscape-section-heading"><span className="workscape-eyebrow">Measured output</span><h2>Current build, at a glance</h2></div>
        <div className="workscape-metrics">
          <div><span>Source</span><strong>{data.summary.sourceLines.toLocaleString()}</strong><small>lines across {data.summary.sourceFiles} files</small></div>
          <div><span>Coverage</span><strong>{data.summary.routes}</strong><small>public and role routes</small></div>
          <div><span>Interface</span><strong>{data.summary.components}</strong><small>component functions</small></div>
          <div><span>Decisions</span><strong>{data.summary.decisionDocs + data.summary.designDocs}</strong><small>plan, requirement, and design artifacts</small></div>
        </div>
      </section>

      <section className="workscape-detail-grid">
        <div className="workscape-artifacts">
          <div className="workscape-section-heading"><span className="workscape-eyebrow">Artifact density</span><h2>Where the work lives</h2></div>
          <div className="artifact-bars">
            {data.artifacts.slice(0, 7).map((artifact) => (
              <div key={artifact.extension}>
                <span>.{artifact.extension}</span>
                <div><i style={{ width: `${Math.max(4, (artifact.lines / largestArtifact) * 100)}%` }} /></div>
                <strong>{artifact.lines.toLocaleString()}</strong>
                <small>{artifact.files} files</small>
              </div>
            ))}
          </div>
        </div>

        <div className="workscape-stack">
          <div className="workscape-section-heading"><span className="workscape-eyebrow">Version ledger</span><h2>Verified implementation stack</h2></div>
          <div className="stack-table" role="table" aria-label="Installed package versions">
            <div className="stack-row stack-head" role="row"><span>Element</span><span>Requested</span><span>Installed</span></div>
            {data.stack.map((item) => <div className="stack-row" role="row" key={item.name}><strong>{item.name}</strong><code>{item.requested}</code><code>{item.installed}</code></div>)}
          </div>
          <p className="workscape-source-note"><FileCode2 />{data.source.note}</p>
          <small className="workscape-generated">Manifest refreshed {new Date(data.generatedAt).toLocaleString()}</small>
        </div>
      </section>
    </main>
  )
}
