# API 文档

> 版本: 2.19.5  
> 最后更新时间: 2025-12-01

本文档主要面向开发者，介绍 Refined Now Playing 暴露的接口、事件系统以及核心工具函数。

## 1. 全局对象与劫持

### `window.onProcessLyrics(rawLyrics, songID)`

插件通过劫持 `orpheus://orpheus/pub/core` 替换了原生的 `onProcessLyrics` 函数，用于拦截和处理歌词数据。

- **参数**:
  - `rawLyrics` (Object | String): 原始歌词数据。可能是包含 `lrc`, `yrc` 等字段的对象，或者是本地歌词字符串。
  - `songID` (Number | String): 歌曲 ID。
- **返回值**: 调用原始的 `_onProcessLyrics` 处理后的结果，确保不破坏原生功能。
- **副作用**: 
  - 解析歌词并存储到 `window.currentLyrics`。
  - 触发 `lyrics-updated` 事件。

### `window.currentLyrics`

存储当前处理后的歌词对象。

- **结构**:
  ```javascript
  {
    lyrics: [
      {
        time: 12.5,           // 开始时间 (秒)
        duration: 3.0,        // 持续时间 (秒)
        originalLyric: "...", // 原词
        translatedLyric: "...", // 翻译 (可选)
        romanLyric: "...",    // 罗马音 (可选)
        dynamicLyric: [...],  // 逐字数据 (可选)
        isInterlude: false    // 是否为间奏
      },
      // ...
    ],
    contributors: { ... },    // 贡献者信息
    hash: "..."               // 歌词指纹
  }
  ```

## 2. 事件系统 (Custom Events)

插件大量使用 `CustomEvent` 进行模块间通信。你可以监听这些事件来扩展插件功能。

### `lyrics-updated`
- **触发时机**: 歌词数据解析完成并更新时。
- **Detail**: 
  ```javascript
  {
    lyrics: [...], // 解析后的歌词数组
    contributors: {...},
    amend: boolean // 是否为修正更新（如微调）
  }
  ```

### `recalc-lyrics`
- **触发时机**: 需要重新计算歌词布局时（如字体大小、窗口大小改变）。
- **用途**: 通知歌词组件重新测量 DOM 高度。

### `rnp-background-type`
- **触发时机**: 用户切换背景类型时。
- **Detail**: 
  ```javascript
  {
    type: 'fluid' | 'blur' | 'gradient' | 'solid' | 'none'
  }
  ```

### `rnp-accent-color-*`
- **说明**: CSS 变量更新事件（实际上主要通过直接修改 `document.body` 的 style 实现，部分逻辑也会分发事件）。

## 3. 工具函数 (`src/utils.js`)

### `waitForElement(selector, callback)`
等待 DOM 元素出现。
- **参数**:
  - `selector` (String): CSS 选择器。
  - `callback` (Function): 元素出现后的回调，接收元素 DOM 作为参数。

### `waitForElementAsync(selector)`
`waitForElement` 的 Promise 版本。
- **返回**: `Promise<HTMLElement>`

### `getSetting(option, defaultValue)`
获取插件设置。
- **参数**:
  - `option` (String): 设置键名（无需加 `refined-now-playing-` 前缀）。
  - `defaultValue` (Any): 默认值。
- **返回**: 设置值（自动处理 'true'/'false' 字符串转换）。

### `setSetting(option, value)`
保存插件设置。
- **参数**:
  - `option` (String): 设置键名。
  - `value` (Any): 要保存的值。

### `copyTextToClipboard(text)`
复制文本到剪贴板。
- **参数**:
  - `text` (String): 要复制的文本。

## 4. 样式 API (CSS Variables)

插件通过 CSS 变量控制外观，你可以通过覆盖这些变量来修改主题。

```css
:root {
  /* 主题色 */
  --rnp-accent-color: rgb(...);
  --rnp-accent-color-dark: rgb(...);
  --rnp-accent-color-light: rgb(...);
  
  /* 歌词设置 */
  --lyric-romaji-size-em: 0.6em;
  --lyric-translation-size-em: 1.0em;
  
  /* 背景设置 */
  --bg-blur: 90px;
  --bg-dim: 0.55;
}
```
