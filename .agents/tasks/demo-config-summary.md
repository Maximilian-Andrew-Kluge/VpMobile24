# Demo Configurator: Implementation Summary

## Changed files

| File | Change |
|------|--------|
| `website/index.html` | Added `#demoConfig` section between `#demo` and `#installation` |
| `website/style.css` | Appended ~65 lines of new CSS for demo config section |
| `website/script.js` | `const DEMO_SLOTS` → `let DEMO_SLOTS`; ~390 lines appended inside IIFE |

## New functions

| Function | Purpose |
|----------|---------|
| `scheduleToSlots()` | Converts `SCHEDULE` array to the `DEMO_SLOTS` shape used by `renderDemo()` |
| `loadSchedule()` | Reads saved schedule from `localStorage`; falls back to `DEFAULT_SCHEDULE` |
| `saveSchedule()` | Persists `SCHEDULE` to `localStorage` (wrapped in try/catch) |
| `resetSchedule()` | Restores `DEFAULT_SCHEDULE`, rerenders editor and demo |
| `validateSchedule()` | Returns `[{ idx, field, message }]` — checks format, end>start, overlaps, duplicates, max 12 |
| `renderScheduleEditor()` | Full innerHTML rebuild of `#scheduleEditorRows`; used for structural changes only |
| `_updateScheduleErrorsInPlace(errors)` | Walks existing DOM to toggle `.invalid` / `.has-error` / `.sr-error` without losing focus |
| `applyScheduleChange()` | 300 ms debounce; calls `_updateScheduleErrorsInPlace`, updates demo on valid schedule |
| `addLesson()` | Appends new lesson row with auto-incremented period number |
| `addBreak()` | Appends new break row |
| `moveRow(idx, dir)` | Swaps two adjacent rows; triggers full structural re-render |
| `deleteRow(idx)` | Splices row; triggers full structural re-render |
| `applyDemoTheme(themeId)` | Sets inline CSS vars on `#demoCard`, saves to localStorage, rerenders preview/grid |
| `renderDemoThemeGrid(activeId)` | Renders 7 theme-card buttons into `#demoThemeGrid` |
| `renderThemePreview(t)` | Renders a read-only mini card preview into `#themePreviewCard` |
| `_esc(str)` | HTML-escape helper used in all innerHTML builders |

## Available themes

| ID | Name |
|----|------|
| `demo-default` | VpMobile24 Blue |
| `demo-ha-dark` | Home Assistant Dark |
| `demo-ha-light` | Home Assistant Light |
| `demo-midnight` | Midnight |
| `demo-ocean` | Ocean |
| `demo-green` | Forest Green |
| `demo-contrast` | High Contrast |

## Persistence (localStorage)

| Key | Content |
|-----|---------|
| `vpm24-demo-theme` | Selected theme ID string |
| `vpm24-schedule` | JSON-serialized `SCHEDULE` array |

All reads/writes wrapped in `try/catch` — degrades gracefully if localStorage unavailable.

## Review findings fixed

| # | Finding | Fix |
|---|---------|-----|
| 1 | `.cc-th.active` class not highlighted | Added `.cc-th.active` CSS rule mirroring `.cc-th-active` |
| 2 | Theme card swatches invisible | Added `.cc-th-p / .cc-normal / .cc-sub / .cc-cancel` CSS rules consuming `--th-p/--th-w/--th-d` |
| 3 | `--th-bg/--th-p` CSS vars unused | Resolved by #2 — CSS rules now consume them |
| 4 | Theme only touches `#demoCard` | **Pending user decision** — see below |
| 5 | Focus lost on debounced re-render | `applyScheduleChange` uses `_updateScheduleErrorsInPlace` (no innerHTML replace); structural changes use `renderScheduleEditor` directly |
| 6 | `.demo-cfg-tab` touch target 42 px | Changed `min-height` to `44px` |
| 7 | `.sr-btn` touch targets 36 px | Changed `width`, `height`, `min-height` to `44px` |

## Open point: finding #4 (site-wide theme)

The spec requires the demo theme to update navigation, buttons, FAQ, cards, etc. — the whole site. However the spec also says "Dark Mode und Light Mode erhalten" (preserve dark/light mode). These two requirements conflict if the demo theme also sets background/text colors.

Two options were presented to the user:
1. **Accent-only** (recommended): Override only `--accent`, `--accent-2`, `--success`, `--warning`, `--danger` on `:root`. Buttons, badges, progress bars, status colors change. Background/text stay under the dark/light toggle.
2. **Full override**: Override all CSS vars including `--bg`, `--bg-2`, `--text`, etc. The dark/light toggle is effectively overridden while a demo theme is active.

Waiting for user answer before implementing.

## Validation rules enforced

- Time format must match `HH:MM` (leading-zero zero-padded)
- End time must be lexicographically after start time
- Adjacent entries must not overlap
- Lesson period numbers must be unique
- Maximum 12 entries
- All start/end fields required
- Inline error messages shown at the offending field, not just a global banner

## Accessibility

- `.demo-cfg-tab` buttons: `role="tab"`, `aria-selected` toggled
- Theme cards: `role="radio"`, `aria-checked` toggled
- `#scheduleEditorRows`: `aria-live="polite"`
- `#themePreviewCard`: `aria-live="polite"`, `aria-label`
- `#scheduleValidation`: `role="status"`, `aria-live="polite"`
- Individual error `<div>`s: `role="alert"`
- All buttons have `aria-label`
- Touch targets: 44 × 44 px minimum (tabs and sr-btn)
