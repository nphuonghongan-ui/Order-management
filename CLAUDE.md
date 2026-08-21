<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Order-management** (1723 symbols, 3820 relationships, 140 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Order-management/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Order-management/clusters` | All functional areas |
| `gitnexus://repo/Order-management/processes` | All execution flows |
| `gitnexus://repo/Order-management/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |
| Work in the Ui area (118 symbols) | `.claude/skills/generated/ui/SKILL.md` |
| Work in the Controllers area (85 symbols) | `.claude/skills/generated/controllers/SKILL.md` |
| Work in the Pages area (74 symbols) | `.claude/skills/generated/pages/SKILL.md` |
| Work in the Packing-list area (53 symbols) | `.claude/skills/generated/packing-list/SKILL.md` |
| Work in the Services area (31 symbols) | `.claude/skills/generated/services/SKILL.md` |
| Work in the Container-viewer area (29 symbols) | `.claude/skills/generated/container-viewer/SKILL.md` |
| Work in the Po area (26 symbols) | `.claude/skills/generated/po/SKILL.md` |
| Work in the Apis area (18 symbols) | `.claude/skills/generated/apis/SKILL.md` |
| Work in the Stores area (16 symbols) | `.claude/skills/generated/stores/SKILL.md` |
| Work in the Part-num area (15 symbols) | `.claude/skills/generated/part-num/SKILL.md` |
| Work in the Notification area (12 symbols) | `.claude/skills/generated/notification/SKILL.md` |
| Work in the Google area (12 symbols) | `.claude/skills/generated/google/SKILL.md` |
| Work in the Oauth area (11 symbols) | `.claude/skills/generated/oauth/SKILL.md` |
| Work in the Hooks area (9 symbols) | `.claude/skills/generated/hooks/SKILL.md` |
| Work in the Config area (5 symbols) | `.claude/skills/generated/config/SKILL.md` |

<!-- gitnexus:end -->
