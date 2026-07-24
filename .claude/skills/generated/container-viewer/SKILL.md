---
name: container-viewer
description: "Skill for the Container-viewer area of Order-management. 60 symbols across 11 files."
---

# Container-viewer

60 symbols | 11 files | Cohesion: 77%

## When to Use

- Working with code in `frontend/`
- Understanding how registerBoxGroup, getContainerType, useContainerStore work
- Modifying container-viewer-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/container-viewer/Toolbar.tsx` | Toolbar, setTool, setSnapMm, setRotSnap, setShowWalls (+10) |
| `frontend/src/components/container-viewer/useContainerStore.ts` | useContainerStore, computeStats, setContainerType, setBoxes, commitHistory (+6) |
| `frontend/src/components/container-viewer/PackedBox.tsx` | PackedBoxes, PackedBox, selectBox, SelectedGizmo, updateBoxPosition (+5) |
| `frontend/src/components/container-viewer/Scene.tsx` | Scene, DemandInvalidator, invalidate, PrecompileShaders, CameraRig (+2) |
| `frontend/src/components/container-viewer/TopBar.tsx` | stats, TopBar, setContainerType, Stat |
| `frontend/src/components/ui/select.tsx` | Select, SelectValue, SelectTrigger, SelectItem |
| `frontend/src/components/container-viewer/registry.ts` | registerBoxGroup, getBoxGroup |
| `frontend/src/components/container-viewer/units.ts` | getContainerType, formatMm |
| `frontend/src/components/container-viewer/AxisGizmo.tsx` | AxisGizmo, setView |
| `frontend/src/components/container-viewer/datExport.ts` | exportDat, copyDatToClipboard |

## Entry Points

Start here when exploring this area:

- **`registerBoxGroup`** (Function) — `frontend/src/components/container-viewer/registry.ts:10`
- **`getContainerType`** (Function) — `frontend/src/components/container-viewer/units.ts:68`
- **`useContainerStore`** (Function) — `frontend/src/components/container-viewer/useContainerStore.ts:56`
- **`computeStats`** (Function) — `frontend/src/components/container-viewer/useContainerStore.ts:176`
- **`AxisGizmo`** (Function) — `frontend/src/components/container-viewer/AxisGizmo.tsx:8`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `registerBoxGroup` | Function | `frontend/src/components/container-viewer/registry.ts` | 10 |
| `getContainerType` | Function | `frontend/src/components/container-viewer/units.ts` | 68 |
| `useContainerStore` | Function | `frontend/src/components/container-viewer/useContainerStore.ts` | 56 |
| `computeStats` | Function | `frontend/src/components/container-viewer/useContainerStore.ts` | 176 |
| `AxisGizmo` | Function | `frontend/src/components/container-viewer/AxisGizmo.tsx` | 8 |
| `setView` | Function | `frontend/src/components/container-viewer/AxisGizmo.tsx` | 9 |
| `Container` | Function | `frontend/src/components/container-viewer/Container.tsx` | 9 |
| `PackedBoxes` | Function | `frontend/src/components/container-viewer/PackedBox.tsx` | 20 |
| `Scene` | Function | `frontend/src/components/container-viewer/Scene.tsx` | 17 |
| `stats` | Function | `frontend/src/components/container-viewer/TopBar.tsx` | 21 |
| `Toolbar` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 43 |
| `setTool` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 45 |
| `setSnapMm` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 47 |
| `setRotSnap` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 49 |
| `setShowWalls` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 51 |
| `setShowGrid` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 53 |
| `setShowAxes` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 55 |
| `setShowLabels` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 57 |
| `setView` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 58 |
| `formatMm` | Function | `frontend/src/components/container-viewer/units.ts` | 83 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `HandleDownload → GetContainerType` | cross_community | 4 |
| `HandleCopy → GetContainerType` | cross_community | 4 |
| `ContainerViewer → GetContainerType` | cross_community | 3 |
| `Toolbar → Cn` | cross_community | 3 |
| `Scene → UseContainerStore` | intra_community | 3 |
| `Scene → Invalidate` | intra_community | 3 |
| `Scene → AnimateCamera` | intra_community | 3 |
| `TopBar → Cn` | cross_community | 3 |
| `SelectedGizmo → GetBoxGroup` | intra_community | 3 |
| `PackedBoxes → UseContainerStore` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 8 calls |

## How to Explore

1. `context({name: "registerBoxGroup"})` — see callers and callees
2. `query({search_query: "container-viewer"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
