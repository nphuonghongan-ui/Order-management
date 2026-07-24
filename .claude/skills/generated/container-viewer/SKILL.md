---
name: container-viewer
description: "Skill for the Container-viewer area of Order-management. 60 symbols across 11 files."
---

# Container-viewer

60 symbols | 11 files | Cohesion: 74%

## When to Use

- Working with code in `frontend/`
- Understanding how Toolbar, setTool, setSnapMm work
- Modifying container-viewer-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `frontend/src/components/container-viewer/Toolbar.tsx` | Toolbar, setTool, setSnapMm, setRotSnap, setShowWalls (+19) |
| `frontend/src/components/container-viewer/PackedBox.tsx` | PackedBoxes, PackedBox, selectBox, SelectedGizmo, updateBoxPosition (+5) |
| `frontend/src/components/container-viewer/Scene.tsx` | Scene, DemandInvalidator, invalidate, PrecompileShaders, CameraRig (+2) |
| `frontend/src/components/container-viewer/TopBar.tsx` | stats, TopBar, setContainerType, Stat |
| `frontend/src/components/ui/select.tsx` | Select, SelectValue, SelectTrigger, SelectItem |
| `frontend/src/components/container-viewer/registry.ts` | registerBoxGroup, getBoxGroup |
| `frontend/src/components/container-viewer/units.ts` | getContainerType, formatMm |
| `frontend/src/stores/useContainerStore.ts` | useContainerStore, computeStats |
| `frontend/src/components/container-viewer/AxisGizmo.tsx` | AxisGizmo, setView |
| `frontend/src/components/container-viewer/datExport.ts` | exportDat, copyDatToClipboard |

## Entry Points

Start here when exploring this area:

- **`Toolbar`** (Function) — `frontend/src/components/container-viewer/Toolbar.tsx:54`
- **`setTool`** (Function) — `frontend/src/components/container-viewer/Toolbar.tsx:56`
- **`setSnapMm`** (Function) — `frontend/src/components/container-viewer/Toolbar.tsx:58`
- **`setRotSnap`** (Function) — `frontend/src/components/container-viewer/Toolbar.tsx:60`
- **`setShowWalls`** (Function) — `frontend/src/components/container-viewer/Toolbar.tsx:62`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `Toolbar` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 54 |
| `setTool` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 56 |
| `setSnapMm` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 58 |
| `setRotSnap` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 60 |
| `setShowWalls` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 62 |
| `setShowGrid` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 64 |
| `setShowAxes` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 66 |
| `setShowLabels` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 68 |
| `setView` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 69 |
| `setAxisConstraint` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 79 |
| `setBoxPositionXYZ` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 82 |
| `setBoxRotation90` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 83 |
| `resetBoxTransform` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 84 |
| `recenterBox` | Function | `frontend/src/components/container-viewer/Toolbar.tsx` | 85 |
| `registerBoxGroup` | Function | `frontend/src/components/container-viewer/registry.ts` | 10 |
| `getContainerType` | Function | `frontend/src/components/container-viewer/units.ts` | 68 |
| `useContainerStore` | Function | `frontend/src/stores/useContainerStore.ts` | 64 |
| `computeStats` | Function | `frontend/src/stores/useContainerStore.ts` | 238 |
| `AxisGizmo` | Function | `frontend/src/components/container-viewer/AxisGizmo.tsx` | 8 |
| `setView` | Function | `frontend/src/components/container-viewer/AxisGizmo.tsx` | 9 |

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
| Ui | 12 calls |

## How to Explore

1. `context({name: "Toolbar"})` — see callers and callees
2. `query({search_query: "container-viewer"})` — find related execution flows
3. Read key files listed above for implementation details
4. `explain({target: "<file or symbol>"})` — persisted taint findings (source→sink data flows), when indexed with `--pdg`
