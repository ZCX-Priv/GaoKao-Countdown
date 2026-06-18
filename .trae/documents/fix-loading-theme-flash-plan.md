# 修复 Loading 页面主题闪烁与拼写检查计划

## 摘要

修复三个体验问题：
1. 夜间模式下进入页面时，Loading 页面由白突然变黑。
2. Loading 页面会先露出背景色，再显示 Loading。
3. 全局禁用空的拼写检查（已完成则忽略）。

## 当前状态分析

### 1. 主题闪烁（白变黑）

- `:root` 默认变量使用浅色主题（`--bg-color: var(--bg-light)`），`body` 默认背景为浅蓝渐变（`base.css:48`）。
- 主题实际生效逻辑位于 `scripts/settings.js` 的 `applySettings()`，该脚本在 `<body>` 底部按顺序加载并执行（`index.html:291-298`）。
- 浏览器在 `<head>` 中的 CSS 加载完成后即开始首次渲染，此时 `data-theme` 尚未设置，页面按浅色渲染；待 JS 初始化后才切换到深色主题，导致“白变黑”闪烁。

### 2. Loading 先露出背景色

- `#loading-page` 的全屏覆盖、背景色等关键样式定义在外部 `styles/loading.css` 中（`loading.css:1-13`）。
- 双击本地打开 `index.html` 时，浏览器可能在 `loading.css` 加载完成前就开始渲染页面；此时 `#loading-page` 只是一个普通 `<div>`，没有 `position: fixed` 和 `background`，导致 body 背景先露出来。
- 待 `loading.css` 加载后，`#loading-page` 才获得全屏样式并盖住 body 背景。
- 此外，`body` 默认背景为固定渐变（`base.css:48`），与 `#loading-page` 的 `var(--bg-color)` 不一致，也会加剧闪烁感。

### 3. 拼写检查

- `index.html` 中三个文本输入框已设置 `spellcheck="false"`（第 271、275、279 行）。
- 复选框、单选按钮不属于文本输入，无需 spellcheck。
- 当前没有 `contenteditable` 元素。

## 修改方案

### 修改 1：在 `<head>` 中内联同步主题脚本

**文件**：`index.html`

**位置**：在 `<head>` 末尾、`</head>` 之前。

**内容**：

```html
<script>
(function() {
    try {
        var stored = localStorage.getItem('gaokao_countdown_settings');
        var themeMode = 'system';
        if (stored) {
            var settings = JSON.parse(stored);
            if (settings.themeMode) themeMode = settings.themeMode;
        }
        if (themeMode === 'system') {
            themeMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', themeMode);
    } catch (e) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();
</script>
```

**原因**：在浏览器首次渲染前设置 `data-theme`，避免默认浅色主题一闪而过。

### 修改 2：内联 Loading 关键样式，防止 CSS 加载前的 FOUC

**文件**：`index.html`

**位置**：`<head>` 中、同步主题脚本之后、`</head>` 之前。

**修改内容**：

添加内联 `<style>`，在 `loading.css` 到达前就为 `#loading-page` 提供全屏覆盖和背景色：

```html
<style>
    #loading-page {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 100;
        background: #f5f5f7;
    }
    [data-theme="dark"] #loading-page {
        background: #000000;
    }
</style>
```

**原因**：外部 CSS 加载前，`#loading-page` 立即以正确颜色全屏覆盖，避免 body 背景先露出来。

### 修改 3：统一 body 默认背景

**文件**：`styles/base.css`

**位置**：`body` 规则（第 39-52 行）。

**修改内容**：

将 body 的默认背景从固定渐变改为与 `--bg-color` 一致，待 JS 初始化完成后再由 `applyVisualSettings` 设置为具体渐变/图片。

```css
body {
    background-color: var(--bg-color);
    color: #f5f5f7;
    transition: background-color 0.3s, color 0.3s;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 100vh;
    width: 100vw;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    background: var(--bg-color);
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
}
```

**原因**：确保 Loading 显示期间 body 背景与 `#loading-page` 背景完全一致；即使内联样式出现极短暂的失效或半透明过渡，也不会露出不一致的背景色。

### 修改 4：全局禁用拼写检查

**文件**：`index.html`

**位置**：`<html>` 标签（第 2 行）。

**修改内容**：

```html
<html lang="zh-CN" spellcheck="false">
```

**原因**：为整个页面设置默认 `spellcheck="false"`，即使未来新增文本输入框也不会默认启用拼写检查。已有文本框的显式 `spellcheck="false"` 可保留，也可移除。

## 假设与决策

1. **保留现有设置存储键名**：继续使用 `gaokao_countdown_settings`，与 `scripts/settings.js` 保持一致，避免数据迁移。
2. **同步脚本仅读取 themeMode**：内联脚本只做最小化主题判断，不重复完整设置加载逻辑，减少阻塞和出错风险。
3. **body 默认背景改为纯色**：JS 初始化后 `applyVisualSettings` 会立即重新应用渐变/图片背景，因此不影响正常视觉效果。
4. **不在 base.css 中同步加载主题样式**：`themes.css` 已在 `<head>` 加载，配合同步脚本设置 `data-theme` 即可生效，无需额外改动。

## 验证步骤

1. 在浏览器中清除缓存并打开页面。
2. **夜间模式**：将系统或设置设为深色主题，刷新页面。观察 Loading 页面首次渲染即为深色，无白色闪烁。
3. **日间模式**：将系统或设置设为浅色主题，刷新页面。观察 Loading 页面首次渲染即为浅色。
4. **Loading 背景**：在 Loading 显示期间及淡出过程中，确认没有露出与 Loading 背景不一致的 body 背景色。
5. **拼写检查**：在设置弹窗的文本输入框中输入内容，确认不出现拼写检查下划线。
