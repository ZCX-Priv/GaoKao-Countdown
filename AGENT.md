# AGENT.md - 高考倒计时项目模块详解

本文档详细介绍高考倒计时项目的各个模块，帮助开发者快速理解项目架构和代码逻辑。

---

## 目录

- [项目概述](#项目概述)
- [技术架构](#技术架构)
- [JavaScript 模块](#javascript-模块)
  - [main.js - 主应用入口](#mainjs---主应用入口)
  - [settings.js - 设置管理](#settingsjs---设置管理)
  - [time.js - 倒计时核心](#timejs---倒计时核心)
  - [device.js - 设备检测](#devicejs---设备检测)
  - [loading.js - 加载管理](#loadingjs---加载管理)
  - [inspire.js - 励志语录](#inspirejs---励志语录)
  - [notice.js - 通知提示](#noticejs---通知提示)
  - [snow.js - 雪花特效](#snowjs---雪花特效)
- [CSS 模块](#css-模块)
  - [base.css - 基础样式](#basecss---基础样式)
  - [layout.css - 布局样式](#layoutcss---布局样式)
  - [components.css - 组件样式](#componentscss---组件样式)
  - [themes.css - 主题样式](#themescss---主题样式)
  - [animations.css - 动画样式](#animationscss---动画样式)
  - [countdown.css - 倒计时卡片](#countdowncss---倒计时卡片)
  - [modal.css - 弹窗样式](#modalcss---弹窗样式)
  - [notice.css - 通知样式](#noticecss---通知样式)
  - [loading.css - 加载页样式](#loadingcss---加载页样式)
- [HTML 结构](#html-结构)
- [数据流与状态管理](#数据流与状态管理)
- [扩展指南](#扩展指南)

---

## 项目概述

高考倒计时是一个纯原生 HTML + CSS + JS 实现的倒计时应用，无任何外部依赖。主要功能包括：

- 精确到毫秒的倒计时显示
- 自定义目标日期和事件名称
- 多种背景模式（渐变/Bing每日一图）
- 励志语录展示
- 雪花特效和流光效果
- 深色/浅色主题切换
- 响应式布局

---

## 技术架构

### 模块化设计

项目采用 IIFE（立即执行函数表达式）模式实现模块化，所有模块挂载到全局命名空间 `GaoKao` 下：

```javascript
(function(GaoKao) {
    'use strict';
    GaoKao.ModuleName = class ModuleName {
        // ...
    };
})(window.GaoKao = window.GaoKao || {});
```

### 文件加载顺序

```html
<script src="scripts/settings.js"></script>
<script src="scripts/device.js"></script>
<script src="scripts/time.js"></script>
<script src="scripts/loading.js"></script>
<script src="scripts/inspire.js"></script>
<script src="scripts/notice.js"></script>
<script src="scripts/snow.js"></script>
<script src="scripts/main.js"></script>
```

---

## JavaScript 模块

### main.js - 主应用入口

**文件位置**: `scripts/main.js`

**职责**: 应用主控制器，协调所有模块的初始化和交互。

#### LiquidManager 类

流光效果管理器，实现卡片边缘的液态玻璃效果。

| 属性 | 类型 | 说明 |
|------|------|------|
| `overlay` | HTMLElement | 流光遮罩层元素 |
| `clipPath` | SVGClipPathElement | SVG 裁剪路径 |
| `rafId` | number | requestAnimationFrame ID |
| `isRunning` | boolean | 运行状态标志 |

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getCards()` | - | HTMLElement[] | 获取所有需要应用效果的卡片 |
| `start()` | - | void | 启动流光效果 |
| `stop()` | - | void | 停止流光效果 |
| `update()` | - | void | 更新裁剪区域（每帧调用） |
| `setBackground(style)` | style: string | void | 同步背景样式 |

#### App 类

主应用控制器。

| 属性 | 类型 | 说明 |
|------|------|------|
| `deviceManager` | DeviceManager | 设备检测管理器 |
| `settingsManager` | SettingsManager | 设置管理器 |
| `countdown` | Countdown | 倒计时实例 |
| `loadingManager` | LoadingManager | 加载管理器 |
| `quoteManager` | QuoteManager | 语录管理器 |
| `noticeManager` | NoticeManager | 通知管理器 |
| `snowManager` | SnowManager | 雪花特效管理器 |
| `liquidManager` | LiquidManager | 流光效果管理器 |
| `previousValues` | Object | 上一次的时间值（用于动画检测） |
| `isDateMode` | boolean | 是否为日期显示模式 |
| `currentSettings` | Object | 当前设置快照 |
| `isInitializing` | boolean | 是否正在初始化 |
| `dom` | Object | DOM 元素引用缓存 |

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init()` | - | Promise<void> | 初始化应用 |
| `waitForBgLoaded()` | - | void | 等待背景图片加载 |
| `syncSettingsUI(settings)` | settings: Object | void | 同步设置到 UI |
| `updateThemeModeState(liquidEnabled)` | liquidEnabled: boolean | void | 更新主题模式状态 |
| `applyVisualSettings(settings, isInit)` | settings: Object, isInit: boolean | void | 应用视觉设置 |
| `bindEvents()` | - | void | 绑定所有事件监听器 |
| `updateUI(data)` | data: Object | void | 更新倒计时显示 |
| `animateChangedValues(data)` | data: Object | void | 为变化的数值添加动画 |

#### 初始化流程

```
DOMContentLoaded
    ↓
new App()
    ↓
app.init()
    ├── settingsManager.init()     // 加载设置
    ├── countdown.setTarget()      // 设置目标日期
    ├── countdown.start()          // 启动倒计时
    ├── syncSettingsUI()           // 同步 UI
    ├── applyVisualSettings()      // 应用视觉设置
    ├── bindEvents()               // 绑定事件
    ├── loadingManager.start()     // 启动加载动画
    ├── quoteManager.load()        // 加载语录
    └── waitForBgLoaded()          // 等待背景加载
```

---

### settings.js - 设置管理

**文件位置**: `scripts/settings.js`

**职责**: 管理用户设置的存储、读取和应用。

#### 常量定义

| 常量 | 值 | 说明 |
|------|-----|------|
| `STORAGE_KEY` | `'gaokao_countdown_settings'` | localStorage 存储键 |
| `DEFAULT_SETTINGS` | Object | 默认设置对象 |
| `ANIMATION_SETTING_KEY` | `'gaokao_animation_set'` | 动画设置标记键 |

#### DEFAULT_SETTINGS 结构

```javascript
{
    themeMode: 'system',      // 主题模式: 'system' | 'light' | 'dark'
    showMs: false,            // 显示毫秒
    snowEffect: false,        // 雪花特效
    liquidEffect: false,      // 流光效果
    eventName: '高考',        // 事件名称
    targetDate: null,         // 目标日期 (YYYY/MM/DD)
    targetTime: '09:00',      // 目标时间 (HH:mm)
    bgSource: 'bing',         // 背景来源: 'color' | 'bing'
    bgColor: 'blue',          // 背景颜色: 'blue' | 'orange' | 'purple' | 'green'
    quoteType: ['all'],       // 语录类型数组
    textColor: 'white',       // 文字颜色: 'white' | 'black'
    timeFormat: '24h'         // 时间制式: '12h' | '24h'
}
```

#### SettingsManager 类

| 属性 | 类型 | 说明 |
|------|------|------|
| `settings` | Object | 当前设置对象 |
| `deviceManager` | DeviceManager | 设备检测器引用 |
| `animationSetByUser` | boolean | 用户是否手动设置过动画 |

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init()` | - | Promise<Object> | 初始化，加载并应用设置 |
| `loadSettings()` | - | void | 从 localStorage 加载设置 |
| `saveSettings(newSettings)` | newSettings: Object | void | 保存设置到 localStorage |
| `applySettings()` | - | void | 应用设置（触发 settingsChanged 事件） |
| `getSettings()` | - | Object | 获取当前设置 |

#### 事件

设置变更时触发自定义事件：

```javascript
window.dispatchEvent(new CustomEvent('settingsChanged', { 
    detail: this.settings 
}));
```

---

### time.js - 倒计时核心

**文件位置**: `scripts/time.js`

**职责**: 倒计时逻辑的核心实现。

#### Countdown 类

| 属性 | 类型 | 说明 |
|------|------|------|
| `updateCallback` | Function | 更新回调函数 |
| `timerId` | number | 定时器 ID |
| `targetDate` | Date | 目标日期 |
| `eventName` | string | 事件名称 |
| `isRunning` | boolean | 运行状态 |
| `showMs` | boolean | 是否显示毫秒 |
| `statusText` | string | 状态文本 |

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setTarget(customDate, eventName)` | customDate: Date, eventName: string | void | 设置目标日期 |
| `start(showMs)` | showMs: boolean | void | 启动倒计时 |
| `stop()` | - | void | 停止倒计时 |
| `tick()` | - | void | 计时器回调，计算并更新时间 |

#### 目标日期计算逻辑

```javascript
// 1. 如果提供了自定义日期，使用自定义日期
// 2. 否则使用默认高考时间：
//    - 当前年份 6月7日 9:00（高考开始）
//    - 当前年份 6月9日 18:30（高考结束）
//    - 如果当前时间在高考期间，显示"结束还有"
//    - 如果当前时间已过今年高考，显示明年高考
```

#### 回调数据结构

```javascript
{
    days: number,        // 天数
    hours: number,       // 小时
    minutes: number,     // 分钟
    seconds: number,     // 秒数
    milliseconds: number,// 毫秒
    statusText: string,  // 状态文本
    targetDate: Date     // 目标日期
}
```

---

### device.js - 设备检测

**文件位置**: `scripts/device.js`

**职责**: 检测设备性能，决定是否启用动画。

#### 常量

| 常量 | 值 | 说明 |
|------|-----|------|
| `MEMORY_THRESHOLD_GB` | 4 | 低内存设备阈值（GB） |

#### DeviceManager 类

| 属性 | 类型 | 说明 |
|------|------|------|
| `deviceMemory` | number | 设备内存（GB） |
| `isLowMemoryDevice` | boolean | 是否为低内存设备 |
| `detectionFailed` | boolean | 检测是否失败 |

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `detect()` | - | DeviceManager | 执行设备检测 |
| `checkDeviceMemory()` | - | void | 检测设备内存 |
| `shouldEnableAnimation()` | - | boolean | 判断是否应启用动画 |
| `getDeviceMemory()` | - | number | 获取设备内存 |
| `isDetectionFailed()` | - | boolean | 检测是否失败 |

#### 检测逻辑

```javascript
// 使用 Navigator.deviceMemory API
// - 如果 API 不可用，默认禁用动画（保守策略）
// - 如果内存 < 4GB，禁用动画
// - 否则启用动画
```

---

### loading.js - 加载管理

**文件位置**: `scripts/loading.js`

**职责**: 管理加载页面的显示和过渡。

#### LoadingManager 类

| 属性 | 类型 | 说明 |
|------|------|------|
| `loadingPage` | HTMLElement | 加载页元素 |
| `app` | HTMLElement | 主应用元素 |
| `isFinished` | boolean | 是否已完成 |
| `canFinish` | boolean | 是否可以结束 |
| `loadedResources` | boolean | 资源是否加载完成 |

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `start()` | - | void | 启动加载（当前为空实现） |
| `setLoaded()` | - | void | 标记资源加载完成 |
| `checkAndFinish()` | - | void | 检查是否可以结束 |
| `finish()` | - | void | 执行结束过渡 |

#### 加载完成条件

需要同时满足：
1. `canFinish` = true（2秒超时后自动设置）
2. `loadedResources` = true（语录加载完成后设置）

---

### inspire.js - 励志语录

**文件位置**: `scripts/inspire.js`

**职责**: 获取和显示励志语录。

#### QuoteManager 类

| 属性 | 类型 | 说明 |
|------|------|------|
| `contentEl` | HTMLElement | 语录内容元素 |
| `authorEl` | HTMLElement | 作者元素 |
| `containerEl` | HTMLElement | 容器元素 |
| `intervalId` | number | 定时器 ID |
| `currentTypes` | string[] | 当前语录类型 |
| `lastClickTime` | number | 上次点击时间戳 |
| `clickCooldown` | number | 点击冷却时间（ms） |

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `initClickEvent()` | - | void | 初始化点击事件 |
| `load(types)` | types: string[] | Promise<void> | 加载语录 |
| `startInterval()` | - | void | 启动定时刷新（30秒） |
| `stopInterval()` | - | void | 停止定时刷新 |
| `fetchQuote()` | - | Promise<void> | 从 API 获取语录 |
| `showLocalQuote()` | - | void | 显示本地备用语录 |

#### API 说明

使用 [Hitokoto](https://hitokoto.cn/) API：
- 基础 URL: `https://v1.hitokoto.cn/?encode=json`
- 类型参数: `c=a`（动画）、`c=b`（漫画）、`c=c`（游戏）等
- 超时时间: 5秒
- 超时或失败时显示本地备用语录

#### 本地备用语录

包含 12 条精选励志语录，涵盖：
- 古诗词
- 名人名言
- 动漫台词

---

### notice.js - 通知提示

**文件位置**: `scripts/notice.js`

**职责**: 显示临时通知消息。

#### NoticeManager 类

| 属性 | 类型 | 说明 |
|------|------|------|
| `container` | HTMLElement | 通知容器元素 |

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `show(message, type, duration)` | message: string, type: string, duration: number | void | 显示通知 |
| `remove(bubble)` | bubble: HTMLElement | void | 移除通知 |

#### 通知类型

| type | 说明 | 图标 |
|------|------|------|
| `'info'` | 普通通知 | ✓ |
| `'error'` | 错误通知 | ✗ |

#### 使用示例

```javascript
GaoKao.notice.show('设置已保存');
GaoKao.notice.show('日期格式错误', 'error', 2000);
```

---

### snow.js - 雪花特效

**文件位置**: `scripts/snow.js`

**职责**: 实现雪花飘落动画效果。

#### SnowManager 类

| 属性 | 类型 | 说明 |
|------|------|------|
| `canvas` | HTMLCanvasElement | 画布元素 |
| `ctx` | CanvasRenderingContext2D | 画布上下文 |
| `width` | number | 画布宽度 |
| `height` | number | 画布高度 |
| `particles` | Object[] | 雪花粒子数组 |
| `animationId` | number | 动画帧 ID |
| `active` | boolean | 激活状态 |

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init()` | - | void | 初始化画布 |
| `resize()` | - | void | 调整画布尺寸 |
| `createParticles()` | - | void | 创建雪花粒子 |
| `start()` | - | void | 启动动画 |
| `stop()` | - | void | 停止动画 |
| `animate()` | - | void | 动画帧回调 |

#### 粒子属性

```javascript
{
    x: number,       // X 坐标
    y: number,       // Y 坐标
    radius: number,  // 半径 (1-4px)
    speedY: number,  // Y 方向速度 (0.5-1.5)
    speedX: number,  // X 方向速度 (-0.25-0.25)
    opacity: number  // 透明度 (0.3-0.8)
}
```

#### 性能优化

- 粒子数量根据屏幕宽度动态计算：`Math.floor(width * 0.15)`
- 使用 `requestAnimationFrame` 实现流畅动画
- 雪花超出边界时重置位置，避免内存泄漏

---

## CSS 模块

### base.css - 基础样式

**文件位置**: `styles/base.css`

**职责**: 定义 CSS 变量、全局重置和基础元素样式。

#### CSS 变量

```css
:root {
    /* 主色调 */
    --primary-color: #007aff;
    --secondary-color: #ff9500;
    
    /* 亮色主题 */
    --bg-light: #f5f5f7;
    --text-light: #1d1d1f;
    --glass-bg-light: rgba(255, 255, 255, 0.25);
    --glass-border-light: rgba(255, 255, 255, 0.35);
    
    /* 暗色主题 */
    --bg-dark: #000000;
    --text-dark: #f5f5f7;
    --glass-bg-dark: rgba(0, 0, 0, 0.4);
    --glass-border-dark: rgba(255, 255, 255, 0.15);
    
    /* 动态变量 */
    --bg-color: var(--bg-light);
    --text-color: var(--text-light);
    --glass-bg: var(--glass-bg-light);
    --glass-border: var(--glass-border-light);
    
    /* 字体 */
    --header-font: "Xingkai SC", "STXingkai", "KaiTi", "华文行楷", cursive;
}
```

#### 关键样式

| 选择器 | 说明 |
|--------|------|
| `*` | 全局重置（margin、padding、box-sizing） |
| `html` | 隐藏滚动条 |
| `body` | 背景渐变、文字阴影 |
| `#liquid-overlay` | 流光效果遮罩层 |
| `.hidden` | 隐藏元素工具类 |
| `body.no-animation` | 禁用动画状态 |

---

### layout.css - 布局样式

**文件位置**: `styles/layout.css`

**职责**: 定义页面整体布局结构。

#### 主要布局类

| 类名 | 说明 |
|------|------|
| `.app-container` | 主应用容器，Flexbox 居中布局 |
| `.main-content` | 主内容区域 |
| `.app-header` | 页面标题区域 |
| `#notice-container` | 通知容器（固定定位） |
| `#countdown-card` | 倒计时卡片 |
| `#quote-container` | 语录容器 |

#### 响应式断点

| 断点 | 调整内容 |
|------|----------|
| `≤767px` | 标题字号 3.5rem |
| `≤400px` | 标题字号 2.8rem |
| `≥2000px 或 ≥1000px(高度)` | 增加内边距 |

---

### components.css - 组件样式

**文件位置**: `styles/components.css`

**职责**: 定义可复用 UI 组件样式。

#### 组件列表

| 组件 | 说明 |
|------|------|
| `.settings-btn` | 设置按钮（右上角齿轮图标） |
| `.fullscreen-btn` | 全屏按钮 |
| `.switch` | 开关组件 |
| `.color-picker` | 颜色选择器 |
| `.theme-icons` | 主题图标按钮组 |
| `.setting-item` | 设置项容器 |
| `.checkbox-group` | 复选框组 |
| `.checkbox-label` | 复选框标签 |

#### 开关组件结构

```html
<label class="switch">
    <input type="checkbox">
    <span class="slider round"></span>
</label>
```

#### 颜色选择器结构

```html
<div class="color-picker">
    <input type="radio" name="bg-color" value="blue" id="bg-blue">
    <label for="bg-blue" class="color-option blue"></label>
    <!-- 更多颜色选项 -->
</div>
```

---

### themes.css - 主题样式

**文件位置**: `styles/themes.css`

**职责**: 定义深色/浅色主题变量。

#### 主题切换

通过 `data-theme` 属性切换：

```css
[data-theme="dark"] {
    --bg-color: var(--bg-dark);
    --text-color: var(--text-dark);
    --glass-bg: var(--glass-bg-dark);
    --glass-border: var(--glass-border-dark);
}

[data-theme="light"] {
    --bg-color: var(--bg-light);
    --text-color: var(--text-light);
    --glass-bg: var(--glass-bg-light);
    --glass-border: var(--glass-border-light);
}
```

---

### animations.css - 动画样式

**文件位置**: `styles/animations.css`

**职责**: 定义所有 CSS 动画关键帧。

#### 动画列表

| 动画名 | 说明 | 时长 |
|--------|------|------|
| `spin` | 旋转（时钟指针） | 1s/4s |
| `fadeIn` | 淡入 | - |
| `ripple` | 水波纹扩散 | 0.6s |
| `tick` | 数字跳动 | 0.2s |
| `cardSwitch` | 卡片切换 | 0.4s |
| `slideDown` | 向下滑入 | 0.3s |
| `slideUp` | 向上滑出 | 0.3s |
| `overlayShow` | 遮罩显示 | 0.4s |
| `overlayHide` | 遮罩隐藏 | 0.4s |
| `genieShow` | 精灵效果显示 | 0.4s |
| `genieHide` | 精灵效果隐藏 | 0.4s |
| `shimmer` | 闪烁 | - |
| `pulse` | 脉冲 | - |
| `float` | 浮动 | - |
| `glow` | 发光 | - |

---

### countdown.css - 倒计时卡片

**文件位置**: `styles/countdown.css`

**职责**: 定义倒计时卡片和时间显示样式。

#### 玻璃卡片效果

```css
.glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 20px;
    border: 1px solid var(--glass-border);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
}
```

#### 时间单位结构

```html
<div class="time-unit">
    <span class="time-value">--</span>
    <span class="time-label">天</span>
    <div class="time-bar"></div>
</div>
```

#### 状态样式

| 类名 | 说明 |
|------|------|
| `.urgent` | 紧急状态（<60天），红色高亮 |
| `.ended` | 已结束状态，蓝色高亮 |
| `.liquid-mode` | 流光模式，透明背景 |

#### 响应式布局

移动端采用两排布局：
- 第一排：天数（大字号）
- 第二排：时、分、秒、毫秒（小字号）

---

### modal.css - 弹窗样式

**文件位置**: `styles/modal.css`

**职责**: 定义设置弹窗样式。

#### 弹窗结构

```html
<div class="modal-overlay">
    <div class="modal-container">
        <div class="modal-header">...</div>
        <div class="modal-tabs">...</div>
        <div class="modal-content">...</div>
    </div>
</div>
```

#### 动画状态

| 类名 | 说明 |
|------|------|
| `.opening` | 打开动画 |
| `.closing` | 关闭动画 |
| `.no-animate` | 禁用动画 |

#### 标签页切换

```css
.tab-pane { display: none; }
.tab-pane.active { display: block; }
.tab-pane.active.animate-in { animation: fadeIn 0.3s; }
```

---

### notice.css - 通知样式

**文件位置**: `styles/notice.css`

**职责**: 定义通知气泡样式。

#### 通知结构

```html
<div class="notice-bubble">
    <span>✓ 消息内容</span>
    <button class="notice-close">&times;</button>
</div>
```

#### 类型样式

| 类名 | 说明 |
|------|------|
| `.notice-bubble` | 普通通知 |
| `.notice-bubble.error` | 错误通知（红色边框） |
| `.notice-bubble.liquid-mode` | 流光模式 |

---

### loading.css - 加载页样式

**文件位置**: `styles/loading.css`

**职责**: 定义加载页面样式。

#### 加载动画结构

```html
<div class="loading-container">
    <div class="loading-content">
        <div class="clock-icon">
            <div class="clock-hand hour"></div>
            <div class="clock-hand minute"></div>
        </div>
        <h1 class="handwritten-text">高考倒计时</h1>
    </div>
</div>
```

#### 时钟动画

- 时针：4秒一圈
- 分针：1秒一圈

---

## HTML 结构

**文件位置**: `index.html`

### 文档结构

```
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    - 元信息
    - 样式表链接
</head>
<body>
    - SVG 滤镜定义
    - 流光遮罩层
    - 加载页面
    - 主应用
        - 页头
        - 主内容
            - 倒计时卡片
            - 语录卡片
        - 全屏按钮
        - 设置按钮
    - 设置弹窗
    - 通知容器
    - 脚本引用
</body>
</html>
```

### SVG 滤镜

用于实现流光效果：

```html
<svg style="position: absolute; width: 0; height: 0;">
    <defs>
        <filter id="liquid-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" />
            <feGaussianBlur stdDeviation="2" />
            <feDisplacementMap scale="77" />
        </filter>
        <clipPath id="cards-clip">
            <!-- 由 JS 动态注入 -->
        </clipPath>
    </defs>
</svg>
```

---

## 数据流与状态管理

### 设置变更流程

```
用户操作
    ↓
saveHandler() 触发
    ↓
settingsManager.saveSettings()
    ├── 更新 settings 对象
    ├── 保存到 localStorage
    └── applySettings()
        └── 触发 settingsChanged 事件
            ↓
        window 监听器
            ├── 更新倒计时目标
            ├── 应用视觉设置
            └── 更新语录类型
```

### 倒计时更新流程

```
countdown.start()
    ↓
setInterval(countdown.tick, interval)
    ↓
tick() 计算时间差
    ↓
updateCallback(data)
    ↓
app.updateUI(data)
    ├── 更新 DOM 文本
    ├── 更新状态样式
    └── 触发数字动画
```

---

## 扩展指南

### 添加新的设置项

1. 在 `settings.js` 的 `DEFAULT_SETTINGS` 中添加默认值
2. 在 `index.html` 的设置弹窗中添加 UI 元素
3. 在 `main.js` 的 `syncSettingsUI()` 中同步 UI 状态
4. 在 `saveHandler()` 中收集新设置值
5. 在 `settingsChanged` 事件监听器中处理变更

### 添加新的动画效果

1. 在 `animations.css` 中定义 `@keyframes`
2. 在对应元素的 CSS 中引用动画
3. 在 `body.no-animation` 下添加禁用规则

### 添加新的语录类型

1. 在 `index.html` 的语录类型复选框组中添加选项
2. 参考 [Hitokoto API 文档](https://hitokoto.cn/) 获取类型代码

### 添加新的背景颜色

1. 在 `components.css` 的 `.color-option` 中添加新颜色类
2. 在 `main.js` 的 `colorMap` 对象中添加渐变定义

---

## 版本信息

- **项目版本**: 1.0.0
- **最后更新**: 2026年3月
- **兼容性**: Chrome 61+

---

*本文档由 AGENT 自动生成，如有疑问请参考源代码或联系开发者。*
