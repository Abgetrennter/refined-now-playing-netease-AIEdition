# TypeScript Migration Plan

## 1. Project Assessment

### Code Audit
- **Total JavaScript Files:** 15
- **Key Directories:**
  - `src/utils/` (3 files)
  - `src/components/` (11 files)
  - `src/` (1 file: main.js)

### Dependencies Analysis
- **React Ecosystem:** `react`, `react-dom` (Types installed: `@types/react`, `@types/react-dom`)
- **Utilities:** `lodash` (Types installed: `@types/lodash`), `colorthief` (Types installed: `@types/colorthief`)
- **UI Libraries:** `@mui/material` (Includes types), `@emotion/react` (Includes types)
- **Others:** `fast-average-color` (Includes types), `compare-versions` (Includes types)

### Test Coverage
- **Current Status:** No automated tests detected.
- **Recommendation:** Implement basic unit tests for utility functions during Phase 1 to ensure regression testing.

## 2. Infrastructure Preparation (Completed)

- [x] **TypeScript Configuration:** `tsconfig.json` updated with `allowJs: true`, `noImplicitAny: true`.
- [x] **Type Definitions:** Installed `@types/react`, `@types/react-dom`, `@types/lodash`, `@types/colorthief`.
- [x] **Build System:** Webpack is already configured with `ts-loader`.

## 3. Phased Migration Strategy

### Phase 1: Utilities & Helpers (Low Risk)
**Goal:** Establish a typed foundation.
**Files:**
- `src/utils/color-utils.js`
- `src/utils/utils.js`
- `src/utils/webgl-utils.js`

**Tasks:**
1. Rename `.js` to `.ts`.
2. Define interfaces for utility function parameters and return types.
3. Fix `noImplicitAny` errors.

### Phase 2: Core Logic & Simple Modules (Medium Risk)
**Goal:** Type the main application logic and standalone modules.
**Files:**
- `src/components/compatibility/compatibility-check.js`
- `src/components/background/background.js`
- `src/components/cover-shadow/cover-shadow.js`
- `src/components/font-settings/font-settings.js`
- `src/components/whats-new/whats-new.js`

**Tasks:**
1. Rename to `.ts` or `.tsx` (if using JSX).
2. Define types for component props and state.
3. Address global variable usage (e.g., `window` augmentations).

### Phase 3: Complex UI Components & Main Entry (High Risk)
**Goal:** Full type safety for the UI and application entry point.
**Files:**
- `src/components/lyrics/lyrics.js`
- `src/components/lyrics/lyric-provider.js`
- `src/components/control-bar/refined-control-bar.js`
- `src/components/context-menu/context-menu.js`
- `src/components/mini-song-info/mini-song-info.js`
- `src/components/progressbar-preview/progressbar-preview.js`
- `src/main.js`

**Tasks:**
1. Convert complex React components to `.tsx`.
2. Define detailed interfaces for props, state, and context.
3. Refactor `main.js` to properly bootstrap the typed application.
4. Final `tsconfig.json` tightening (set `allowJs: false`).
