# 修复 Bing 背景渐变不同步 与 h1 被装饰线穿过 两个缺陷

## 摘要

修复两个视觉缺陷：
1. **Bing 加载时背景色不是白/夜对应的渐变**：Bing 图片加载期间显示纯色而非渐变；切换白/夜主题时，渐变兜底背景不会同步更新。
2. **h1 被彩色横线穿过**：`.header-decoration` 装饰线因 CSS 绘制顺序规则被绘制在 h1 文字上方，形成"穿模"。

## 当前状态分析

### 缺陷 1：Bing 背景渐变不同步

相关代码位于 [scripts/main.js](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/scripts/main.js) 的 `applyVisualSettings()` 方法（第 435-541 行）。

**根因 1a — 加载期间显示纯色而非渐变**：
- 第 499-527 行的 Bing 分支在 `if (bgChanged)` 块内。进入该分支后，代码通过 `new Image()` 预加载 Bing 图片，但**没有立即设置 `defaultGradient` 作为加载期间的背景**。
- 只有在 `onload`（成功）、`onerror`（失败）、`setTimeout`（5 秒超时）时才设置背景。
- 因此加载期间（最长 5 秒），body 背景保持 [base.css:48](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/styles/base.css#L48) 的 `var(--bg-color)`（纯色 `#f5f5f7` 或 `#000000`），而非渐变。

**根因 1b — 切换主题时渐变不同步**：
- 第 473 行：`const bgChanged = isInit || bgSourceChanged || bgColorChanged;` —— **不包含 `themeChanged`**。
- Bing 分支和 none 分支都在 `if (bgChanged)` 块内（第 499 行）。
- 当仅主题改变时（`themeChanged=true, bgChanged=false`），整个 `if (bgChanged)` 块被跳过，背景不更新。
- 若 Bing 图片加载失败且正在显示 `defaultGradient`，切换主题后渐变仍是**旧主题**的。

**根因 1c — `waitForBgLoaded()` 重复加载并清空背景**：
- [main.js:347-367](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/scripts/main.js#L347-367) 的 `waitForBgLoaded()` 在 init 中被调用（第 340 行），与 `applyVisualSettings(settings, true)`（第 329 行）**重复加载同一张 Bing 图片**。
- 其 `onerror`/`setTimeout` 回调执行 `document.body.style.backgroundImage = ''`，**清空背景**（回退到纯色），覆盖了 `applyVisualSettings` 可能设置的渐变。
- 两个并发的 `Image()` 加载存在竞态：后完成的回调覆盖先完成的。

### 缺陷 2：h1 被装饰线穿过

相关代码位于 [styles/layout.css](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/styles/layout.css)。

**根因 — CSS 绘制顺序导致装饰线绘制在 h1 之上**：

HTML 结构（[index.html:82-85](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/index.html#L82-85)）：
```html
<header class="app-header">
    <div class="header-decoration"></div>
    <h1>高考倒计时</h1>
</header>
```

样式：
- `.app-header`：`position: relative`（[layout.css:23](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/styles/layout.css#L23)）
- `.header-decoration`：`position: absolute`，`width: 200px; height: 2px`，`background: linear-gradient(90deg, transparent, var(--primary-color), transparent)`，`opacity: 0.3`（[layout.css:37-46](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/styles/layout.css#L37-46)）
- `.app-header h1`：**无 `position`**（即 `position: static`）（[layout.css:26-35](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/styles/layout.css#L26-35)）

根据 CSS 绘制顺序规则（CSS 2.1 Appendix E）：
1. 先绘制非定位后代（`position: static` 的 h1）
2. 后绘制定位后代（`position: absolute` 的 `.header-decoration`，z-index 为 auto）

因此 `.header-decoration`（2px 彩色渐变线）被绘制在 h1 文字**上方**，形成"一条彩色横线穿过文字"的视觉缺陷。这与通盈效果无关（用户确认无论是否开启都出现）。

## 修改方案

### 修改 1：修复 h1 被装饰线穿过（缺陷 2）

**文件**：`styles/layout.css`

**位置**：`.app-header h1` 规则（第 26-35 行）

**修改内容**：添加 `position: relative;`，使 h1 成为定位元素，与 `.header-decoration` 同属"定位后代"组，按 DOM 顺序绘制（h1 在后，绘制在上）。

```css
.app-header h1 {
    font-family: var(--header-font);
    font-size: 4.5rem;
    font-weight: normal;
    letter-spacing: 4px;
    color: var(--text-color, #f5f5f7);
    text-shadow: 0 2px 15px rgba(0, 0, 0, 0.6);
    margin-bottom: 10px;
    transition: color 0.3s ease;
    position: relative;
}
```

**原因**：使 h1 参与定位后后的绘制顺序组，因其 DOM 位置在 `.header-decoration` 之后，将绘制在装饰线上方。装饰线仍可见于文字周围（上下方），符合设计意图。

### 修改 2：添加 `bingLoaded` 状态追踪（缺陷 1 前置）

**文件**：`scripts/main.js`

**位置**：`App` 构造函数，`this.isInitializing = true;` 附近（第 273 行附近）

**修改内容**：添加 `this.bingLoaded = false;`

```javascript
this.isInitializing = true;
this.bingLoaded = false;
```

**原因**：需要追踪 Bing 图片是否成功加载，以决定主题切换时是更新渐变（未加载）还是保持 Bing 图片（已加载）。

### 修改 3：重构 `applyVisualSettings` 的背景逻辑（缺陷 1 核心）

**文件**：`scripts/main.js`

**位置**：`applyVisualSettings` 方法中，从第 468 行（`const isDark = ...`）到第 535 行（`if (bgChanged)` 块结束）

**修改内容**：将原来的 `if (bgChanged)` 单一条件块，重构为按 `bgSource` 分支处理，并增加 `themeChanged` 条件：

```javascript
const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
const themeChanged = this.currentSettings.themeMode !== settings.themeMode;
const bgSourceChanged = this.currentSettings.bgSource !== settings.bgSource;
const bgColorChanged = this.currentSettings.bgColor !== settings.bgColor;

const bgChanged = isInit || bgSourceChanged || bgColorChanged;
const defaultGradient = isDark 
    ? 'linear-gradient(135deg, #1a237e 0%, #880e4f 100%)'
    : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';

// 渐变背景（color 模式）—— 逻辑不变
if (settings.bgSource === 'color' && (isInit || themeChanged || bgSourceChanged || bgColorChanged)) {
    const colorMap = {
        'blue': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'orange': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'purple': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'green': 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
    };
    
    const darkColorMap = {
        'blue': 'linear-gradient(135deg, #1a237e 0%, #880e4f 100%)',
        'orange': 'linear-gradient(135deg, #bf360c 0%, #4a148c 100%)',
        'purple': 'linear-gradient(135deg, #4a148c 0%, #1a237e 100%)',
        'green': 'linear-gradient(135deg, #004d40 0%, #0d47a1 100%)'
    };
    
    const activeColorMap = isDark ? darkColorMap : colorMap;
    document.body.style.backgroundImage = activeColorMap[settings.bgColor] || activeColorMap['blue'];
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    updateOverlayBg();
}

// Bing 每日一图
if (settings.bgSource === 'bing') {
    if (bgChanged) {
        // 初始化或背景源改变：立即设置默认渐变作为加载期间背景，再加载 Bing 图片
        document.body.style.backgroundImage = defaultGradient;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
        this.bingLoaded = false;
        updateOverlayBg();
        
        const bgUrl = 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN';
        const img = new Image();
        const timeoutId = setTimeout(() => {
            img.onload = null;
            img.onerror = null;
            img.src = '';
            document.body.style.backgroundImage = defaultGradient;
            this.bingLoaded = false;
            updateOverlayBg();
        }, 5000);
        img.onload = () => {
            clearTimeout(timeoutId);
            document.body.style.backgroundImage = `url('${bgUrl}')`;
            this.bingLoaded = true;
            updateOverlayBg();
        };
        img.onerror = () => {
            clearTimeout(timeoutId);
            document.body.style.backgroundImage = defaultGradient;
            this.bingLoaded = false;
            updateOverlayBg();
        };
        img.src = bgUrl;
    } else if (themeChanged && !this.bingLoaded) {
        // 主题改变但 Bing 未加载成功：更新默认渐变以匹配新主题
        document.body.style.backgroundImage = defaultGradient;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
        updateOverlayBg();
    }
    // 若主题改变但 Bing 已加载成功，保持 Bing 图片不变（Bing 图片与主题无关）
}

// 纯渐变背景（none 模式）
if (settings.bgSource === 'none' && (bgChanged || themeChanged)) {
    document.body.style.backgroundImage = defaultGradient;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    updateOverlayBg();
}
```

**关键改动说明**：
1. `defaultGradient` 提取到外层，供所有分支使用
2. Bing 分支：`bgChanged` 时**立即设置 `defaultGradient`**（修复根因 1a），再加载图片；加载成功设 `bingLoaded=true`，失败/超时设 `bingLoaded=false` 并保持渐变
3. Bing 分支新增 `else if (themeChanged && !this.bingLoaded)`：主题切换时若 Bing 未加载成功，更新渐变（修复根因 1b）；若已加载成功则保持 Bing 图片
4. none 分支条件从 `bgChanged` 改为 `bgChanged || themeChanged`（修复根因 1b 对 none 模式的影响）

### 修改 4：移除冗余的 `waitForBgLoaded`（缺陷 1 根因 1c）

**文件**：`scripts/main.js`

**修改内容**：
1. 删除 `init()` 方法中第 340 行的 `this.waitForBgLoaded();` 调用
2. 删除第 347-367 行的 `waitForBgLoaded()` 方法整体

**原因**：
- `applyVisualSettings(settings, true)` 已在 init 第 329 行处理 Bing 加载（修改 3 后会立即设置渐变再加载图片）
- `waitForBgLoaded()` 重复加载同一 Bing URL，产生竞态
- 其失败回调 `document.body.style.backgroundImage = ''` 会清空背景（回退纯色），覆盖 `applyVisualSettings` 设置的渐变
- 该方法不与 `loadingManager` 交互，移除不影响加载流程

## 假设与决策

1. **h1 修复用 `position: relative` 而非 `z-index`**：`position: relative` 使 h1 进入定位后代绘制组，按 DOM 顺序自然排在 `.header-decoration` 之后，无需显式 z-index。这是最小改动。
2. **`bingLoaded` 状态而非检查 `backgroundImage` 字符串**：状态变量更可靠，不受 `backgroundImage` 字符串格式（`url(...)` vs `linear-gradient(...)`）影响。
3. **保留 Bing 分支的 `bgChanged` 条件用于重新加载图片**：主题切换时不重新加载 Bing 图片（Bing 图片与主题无关），避免闪烁和带宽浪费。仅在背景源改变或初始化时才加载。
4. **移除 `waitForBgLoaded` 而非修复它**：该方法与 `applyVisualSettings` 完全重复，修复它不如移除它。移除消除竞态和清空背景的 bug。
5. **none 分支也加入 `themeChanged` 条件**：none 模式使用 `defaultGradient`，主题切换时理应更新，原代码遗漏了这一点。

## 验证步骤

### 缺陷 1 验证
1. **Bing 加载期间显示渐变**：将背景来源设为"每日一图"，刷新页面。观察 Loading 淡出后、Bing 图片加载完成前，背景应显示对应主题的渐变（日间：`#a8edea → #fed6e3`；夜间：`#1a237e → #880e4f`），而非纯色。
2. **Bing 加载失败显示渐变**：断网后将背景来源设为"每日一图"，刷新页面。5 秒超时后背景应显示对应主题的渐变。
3. **切换主题时渐变同步**：将背景来源设为"每日一图"，断网（确保 Bing 加载失败，显示渐变），在设置中切换白/夜主题。渐变应立即更新为新主题对应的颜色。
4. **Bing 加载成功后切换主题保持图片**：将背景来源设为"每日一图"，等待 Bing 图片加载成功，切换白/夜主题。背景应保持 Bing 图片不变。
5. **none 模式切换主题同步**：将背景来源设为"渐变背景"并选择任意颜色，再切换白/夜主题。渐变应同步更新。（注：none 模式当前未在 UI 中暴露，但代码逻辑应正确）

### 缺陷 2 验证
1. **h1 不再被横线穿过**：打开页面，仔细观察"高考倒计时"标题文字。文字上不应有彩色横线穿过。装饰线应仅可见于文字上下方。
2. **装饰线仍可见**：确认 `.header-decoration` 装饰线仍然存在（在 h1 文字周围可见），只是不再覆盖文字本身。
3. **不同主题下均正常**：在白/夜两种主题下检查 h1 显示是否正常。
