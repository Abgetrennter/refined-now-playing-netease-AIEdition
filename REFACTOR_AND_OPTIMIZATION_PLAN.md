# Refactoring and Optimization Plan for Refined Now Playing (Components)

This document outlines the findings from analyzing the `src/components` directory (excluding `lyrics`) and provides recommendations for refactoring and performance optimization.

## 1. Overview

The codebase primarily uses React but heavily relies on direct DOM manipulation, global variables, and `MutationObserver` to interact with the underlying Netease Cloud Music (NCM) application. This hybrid approach is necessary due to the nature of the plugin but introduces performance bottlenecks and maintainability challenges.

## 2. Performance Optimization

### 2.1. `MutationObserver` Usage
**Issue:** Multiple components (`cover-shadow`, `mini-song-info`, `refined-control-bar`, `background`) instantiate their own `MutationObserver`s to watch for similar DOM changes (e.g., image load, class changes).
**Impact:** Redundant observers increase CPU usage and can cause jank, especially during playback transitions.
**Recommendation:**
- Create a shared `useDOMObserver` hook or a central "DOM Watcher" context that broadcasts changes to interested components.
- Debounce observer callbacks where immediate updates are not critical.

### 2.2. `progressbar-preview` Optimization
**Issue:** The `updateHoverPercent` function in `progressbar-preview.tsx` performs expensive calculations (iterating through lyrics) on every `mousemove` event.
**Impact:** High main thread usage when hovering over the progress bar, potentially causing dropped frames in animations.
**Recommendation:**
- Use `requestAnimationFrame` to throttle `mousemove` updates.
- Memoize the lyric search or use a more efficient data structure (e.g., binary search) instead of linear iteration, although for typical lyric lengths linear might be fine if not running every pixel.
- Avoid direct style manipulation (`subprogressbarInnerRef.current.style.width`) inside the loop if possible, or ensure it's batched.

### 2.3. `background` WebGL and Animation
**Issue:** `FluidBackground` runs a continuous `requestAnimationFrame` loop.
**Impact:** Constant GPU/CPU usage even when the window might not be focused or the background is obscured.
**Recommendation:**
- Ensure the animation loop pauses completely when the component is unmounted or when the window is hidden (using Page Visibility API).
- The current implementation attempts to pause based on `playState`, but verification is needed to ensure `requestAnimationFrame` is actually cancelled or returns early effectively.

### 2.4. Frequent Re-renders due to Inline Styles
**Issue:** Components like `CoverShadow` and `FontSettings` inject `<style>` tags directly into the render output or DOM.
**Impact:** `CoverShadow` re-renders and updates the style tag on every state change, forcing browser style recalculation.
**Recommendation:**
- Use CSS variables (Custom Properties) for dynamic values (e.g., `--cover-url`) and update only the variable on the container, rather than regenerating the entire style block.

## 3. Refactoring and Code Quality

### 3.1. React Patterns vs. DOM Manipulation
**Issue:** Many components mix React state with direct DOM manipulation (e.g., `document.querySelector`, `appendChild`, `style.left = ...`).
**Impact:** Makes the data flow hard to trace and breaks React's declarative model.
**Recommendation:**
- Where possible, pass refs to elements instead of querying them by ID/Class.
- Move imperative logic (like showing context menus or wizards) into a Context-based solution where a global provider handles the mounting/unmounting of these overlays.

### 3.2. Global Variables and Types
**Issue:** Heavy reliance on `any` types and global variables like `betterncm`, `legacyNativeCmder`, `loadedPlugins`.
**Impact:** Lack of type safety and high risk of breakage if the underlying NCM API changes.
**Recommendation:**
- Create a `types` declaration file for `betterncm` and other globals to provide autocomplete and type checking.
- Encapsulate global API calls into service modules (e.g., `NCMService`, `PluginService`) to mock them for testing and centralize error handling.

### 3.3. Deprecated React APIs
**Issue:** Usage of `ReactDOM.render` and `unmountComponentAtNode` (React 17 legacy) mixed with `ReactDOM.createRoot` (React 18).
**Recommendation:**
- Standardize on React 18's `createRoot`.
- Replace imperative `ReactDOM.render` calls for modals/menus with a declarative `Portal` approach.

### 3.4. Hardcoded Values and Styles
**Issue:** Inline styles and hardcoded strings (e.g., colors, dimensions) are scattered.
**Recommendation:**
- Extract constants and configuration values.
- Move complex inline styles to SCSS modules or standard SCSS files.

## 4. Component-Specific Analysis

| Component | Findings | Priority |
| :--- | :--- | :--- |
| **CoverShadow** | Injects `<style>` tag causing style recalcs. Watches `image` src manually. | High |
| **FontSettings** | Direct DOM manipulation for style injection. | Medium |
| **RefinedControlBar** | Not a React component (Vanilla TS). Manually manages DOM. Could be converted to React if feasible, or kept as a utility but cleaned up. | Low |
| **ProgressbarPreview** | Heavy `mousemove` logic. Complex `isPureMusic` check. | High |
| **Background** | Complex WebGL logic mixed with React. Audio visualization logic duplicated. | Medium |
| **WhatsNew** | Imperative mounting. Inline SVGs. | Low |
| **ContextMenu** | Imperative mounting. Uses `dangerouslySetInnerHTML`. | Medium |
| **MiniSongInfo** | Relies on scraping DOM for title/artist. | Medium |
| **Compatibility** | Large component with many side effects. | Low |

## 5. Action Plan

1.  **Standardize Global Access:** Create a typed wrapper for `betterncm` and `legacyNativeCmder`.
2.  **Optimize Observers:** Implement a `useNCMObserver` hook to centralize DOM watching logic.
3.  **Refactor `CoverShadow`:** Switch to CSS variables for dynamic background images.
4.  **Optimize `ProgressbarPreview`:** Throttle mouse events and simplify the `isPureMusic` logic.
5.  **Modernize Mounting:** Replace `ReactDOM.render` calls in `context-menu` and `whats-new` with a global `OverlayProvider`.
