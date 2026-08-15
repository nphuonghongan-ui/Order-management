---
name: container-viewer
description: "Skill for the Container-viewer area of Order-management. 28 symbols across 9 files."
---

# Container-viewer

28 symbols | 9 files | Cohesion: 82%

## When to Use

- Working with code in `frontend/`
- Understanding how useClpStore, PackedBox, setSelectedId work
- Modifying container-viewer-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/container-viewer/Toolbar.tsx` | ToolButton, setTool, Section, Toolbar, setAxisConstraint (+5) |
| `frontend/src/components/container-viewer/Scene.tsx` | cameraPositionFor, ViewController, TransformGizmo, Scene, setSelectedId (+2) |
| `frontend/src/components/container-viewer/datExport.ts` | buildDatText, downloadDatFile, copyDatToClipboard |
| `frontend/src/components/container-viewer/PackedBox.tsx` | PackedBox, setSelectedId |
| `frontend/src/pages/CLPViewer.tsx` | handleGenerateDat, handleCopyDat |
| `frontend/src/stores/useClpStore.ts` | useClpStore |
| `frontend/src/lib/format.ts` | formatNumber |
| `frontend/src/components/QtyCell.tsx` | QtyCell |
| `frontend/src/components/ui/tabs.tsx` | TabsContent |

## Entry Points

Start here when exploring this area:

- **`useClpStore`** (Function) — `frontend/src/stores/useClpStore.ts:47`
- **`PackedBox`** (Function) — `frontend/src/components/container-viewer/PackedBox.tsx:9`
- **`setSelectedId`** (Function) — `frontend/src/components/container-viewer/PackedBox.tsx:11`
- **`Scene`** (Function) — `frontend/src/components/container-viewer/Scene.tsx:84`
- **`setSelectedId`** (Function) — `frontend/src/components/container-viewer/Scene.tsx:91`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `useClpStore` | Function | `frontend/src/stores/useClpStore.ts` | 47 |
| `PackedBox` | Function | `frontend/src/components/container-viewer/PackedBox.tsx` | 9 |
| `setSelectedId` | Function | `frontend/src/components/container-viewer/PackedBox.tsx` | 11 |
| `Scene` | Function | `frontend/src/components/container-viewer/Scene.tsx` | 84 |
| `setSelectedId` | Function | `frontend/src/components/container-viewer/Scene.tsx` | 91 |
| `setHighlightedPartNum` | Function | `frontend/src/components/container-viewer/Scene.tsx` | 92 |
| `onKey` | Function | `frontend/src/components/container-viewer/Scene.tsx` | 97 |
| `formatNumber` | Function | `frontend/src/lib/format.ts` | 2 |
| `QtyCell` | Function | `frontend/src/components/QtyCell.tsx` | 9 |
| `Toolbar` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 120 |
| `setAxisConstraint` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 132 |
| `setSpace` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 134 |
| `setView` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 136 |
| `toggleHighlightedPartNum` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 146 |
| `buildDatText` | Function | `frontend/src/components/container-viewer/datExport.ts` | 14 |
| `downloadDatFile` | Function | `frontend/src/components/container-viewer/datExport.ts` | 34 |
| `copyDatToClipboard` | Function | `frontend/src/components/container-viewer/datExport.ts` | 47 |
| `handleGenerateDat` | Function | `frontend/src/pages/CLPViewer.tsx` | 132 |
| `handleCopyDat` | Function | `frontend/src/pages/CLPViewer.tsx` | 138 |
| `cameraPositionFor` | Function | `frontend/src/components/container-viewer/Scene.tsx` | 19 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Toolbar → Cn` | cross_community | 3 |
| `Scene → CameraPositionFor` | intra_community | 3 |
| `HandleGenerateDat → BuildDatText` | intra_community | 3 |
| `HandleCopyDat → BuildDatText` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 9 calls |

## How to Explore

1. `context({name: "useClpStore"})` — see callers and callees
2. `query({search_query: "container-viewer"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
