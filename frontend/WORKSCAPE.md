# Workscape

Workscape turns the current AgentMS workspace into an adaptive spatial canvas. It scans frontend source, Django backend source, project documents, and Git working-tree status, then profiles each changed artifact by context, mood, palette, code signals, and change intensity.

The canvas is the navigation surface. It supports damped pan and zoom, collapsible department constellations, an expandable stable field, and focused artifact lenses. Visual treatments are generated from artifact semantics: interfaces become live UI surfaces, CSS becomes kinetic style systems, scripts become pipelines, data becomes scanning matrices, documents become spatial pages, and backend files become service networks.

When Git is available, each changed artifact also carries a before/after snapshot profile. The current implementation compares `HEAD` content with the working tree, then displays those states as ordered visual stages in the lens with the explanation and code signals beside them.

## Commands

```bash
npm run workscape:generate
npm run visualize-work
```

`npm run dev` and `npm run build` refresh the manifest automatically. The generated file is `public/workscape-data.json`; it should not be edited by hand.

## Verified Baseline

The first implementation was built against the exact installed versions on August 9, 2026:

| Element | Installed | Guidance used |
| --- | ---: | --- |
| React | 19.2.8 | [Effects and cleanup](https://react.dev/reference/react/useEffect) |
| Vite | 8.2.0 | [Static asset handling](https://vite.dev/guide/assets.html) |
| TypeScript | 6.0.3 | Existing project compiler configuration |
| Lucide React | 1.28.0 | Existing icon package and import pattern |
| GSAP | 3.x | Ordered reveal timing and damped camera movement |
| Lenis | 1.x | Smooth lens scrolling |
| CSS motion | Browser platform | [CSS animation](https://developer.mozilla.org/en-US/docs/Web/CSS/animation) and [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) |
| Spatial navigation | Browser platform | Pointer capture, wheel input, CSS transforms, and `ResizeObserver` |

## Data Contract

`schemaVersion` protects the boundary between scanning and presentation. The manifest contains measured summaries, frontend route counts, backend app/API counts, exact package versions, current changed files, semantic visual profiles, Git-backed snapshot profiles, unchanged anchor files, affected departments, positioned system surfaces, connections, and artifact totals.

Git history is intentionally not simulated. The field represents the current working tree after the AI request. Its scanner/renderer boundary is deliberately portable so a later IDE extension can feed the same visual workspace from other projects.
