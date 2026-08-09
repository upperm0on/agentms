# Workscape

Workscape turns the current AgentMS workspace into a generated visual changelog. It scans source and project documents, writes a versioned JSON manifest, and renders that evidence as an animated system map at `/workscape`.

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
| CSS motion | Browser platform | [CSS animation](https://developer.mozilla.org/en-US/docs/Web/CSS/animation) and [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) |
| SVG export | Browser platform | [`XMLSerializer.serializeToString()`](https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer/serializeToString) and [`URL.createObjectURL()`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static) |

## Data Contract

`schemaVersion` protects the boundary between scanning and presentation. The manifest contains measured summaries, exact package versions, staged events, positioned surfaces, connections, and artifact totals.

Git history is intentionally not simulated. When usable repository metadata becomes available, a future scanner can add commit events without replacing the visual layer.
