<div align="center">

  ![高考倒计时 Logo](logo.svg)

  <h1 style="font-size: 3em; font-weight: bold; margin: 20px 0; color: #f5f5f7; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">高考倒计时</h1>

  <p style="font-size: 1.2em; color: #f5f5f7; text-shadow: 0 2px 5px rgba(0,0,0,0.5); max-width: 600px; margin: 0 auto;">一款专为高三学生设计的倒计时工具，帮助用户直观地感知距离高考的时间，提供励志语录和个性化设置，营造专注备考的氛围。</p>


![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/html5-orange.svg)
![CSS3](https://img.shields.io/badge/css3-blue.svg)
![JavaScript](https://img.shields.io/badge/javascript-yellow.svg)

[主要特性](#主要特性) · [技术实现](#技术实现) · [项目结构](#项目结构) · [功能详解](#功能详解) · [使用方法](#使用方法) · [浏览器兼容性](#浏览器兼容性) · [开发说明](#开发说明) · [核心模块说明](#核心模块说明) · [许可证](#许可证) · [致谢](#致谢)

</div>

### 主要特性

- **精准倒计时**：显示距离高考的天、时、分、秒，可选择显示毫秒
- **智能时间逻辑**：根据当前时间自动调整倒计时目标（考前/考试中/考后）
- **励志语录**：集成一言 API，每 30 秒自动更换一条励志语录
- **个性化设置**：主题模式、背景切换、特效开关，满足不同用户的审美需求
- **响应式设计**：完美适配各种屏幕尺寸，无论手机还是电脑都能获得优质体验
- **视觉特效**：液态玻璃卡片效果营造现代感，下雪粒子效果增添浪漫氛围
- **每日壁纸**：支持 Bing 每日一图，每天都有新鲜的视觉体验
- **数据持久化**：用户设置自动保存，下次打开依然保持个性化配置

## 技术实现

### 核心技术

- **HTML5**：构建页面结构和内容
- **CSS3**：实现现代化视觉效果和响应式布局
- **JavaScript (ES6+)**：处理业务逻辑和交互
- **本地存储**：使用 localStorage 持久化用户设置
- **无外部依赖**：完全原生实现，不依赖任何第三方库或框架

### 设计亮点

项目采用了现代 Web 设计趋势，注重用户体验和视觉美感：

1. **玻璃拟态 (Glassmorphism)**：通过 backdrop-filter 实现毛玻璃效果
2. **液态玻璃效果**：利用 SVG 滤镜创造独特的液体扭曲质感
3. **CSS 动画**：平滑的过渡和交互动画，提升使用体验
4. **自适应主题**：智能识别系统颜色模式，自动切换深色/浅色主题
5. **响应式布局**：灵活运用 Flexbox，适应不同屏幕尺寸

## 项目结构

```
高考倒计时/
├── index.html              # 入口页面
├── styles/
│   ├── main.css           # 全局样式和加载动画
│   ├── card.css           # 卡片样式和倒计时布局
│   ├── settings.css       # 设置弹窗样式
│   └── notice.css         # 通知提示样式
├── scripts/
│   ├── main.js            # 主程序逻辑
│   ├── loading.js         # 加载页面管理
│   ├── time.js            # 倒计时核心逻辑
│   ├── inspire.js         # 励志语录管理
│   ├── settings.js        # 用户设置管理
│   └── snow.js            # 下雪特效
├── liquid-glass/          # 液态玻璃效果演示
└── .trae/                 # Trae IDE 配置
```

## 功能详解

### 倒计时核心功能

#### 智能时间判断

根据当前时间与高考时间的对比，智能调整倒计时目标：

- **考试前** (6月7日前)：倒计时显示距离考试开始的时间
- **考试期间** (6月7日-9日)：倒计时显示距离考试结束的时间
- **考试后** (6月9日后)：自动切换到下一年高考的倒计时

#### 自定义目标

用户可以设置个性化的时间和事件：

- 自定义事件名称（如"高考"、"中考"等）
- 自定义目标日期
- 自定义目标时间

### 设置面板

#### 主题模式

- **跟随系统**：根据系统设置自动切换深色/浅色模式
- **白天模式**：始终使用浅色主题
- **夜间模式**：始终使用深色主题

#### 背景设置

- **默认渐变**：使用内置的渐变色背景
- **纯色背景**：提供多种预设渐变色可选（蓝色、橙色、紫色、绿色）
- **每日一图**：自动获取 Bing 每日壁纸

#### 语录类型

支持多种类型的励志语录：

- 动画、漫画、游戏、文学
- 诗词、网易云音乐热评、哲学、抖机灵

#### 特效开关

- **毫秒显示**：高精度倒计时（10ms 更新一次）
- **下雪特效**：浪漫的雪花飘落动画
- **液态玻璃**：独特的液体扭曲视觉效果
- **开启动画**：全局动画开关

### 视觉特效

#### 液态玻璃效果

使用 SVG 滤镜实现流体的扭曲效果，代码位于 [index.html](index.html#L15-L22)：

```html
<filter id="liquid-filter">
    <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="10"/>
</filter>
```

#### 下雪粒子系统

基于 Canvas 的粒子系统，代码位于 [scripts/snow.js](scripts/snow.js)：

- 粒子数量根据屏幕宽度动态调整
- 模拟真实的雪花飘落轨迹
- 粒子透明度和大小随机变化
- 使用 requestAnimationFrame 实现流畅动画

#### Mac OS 精灵效果

设置弹窗的显示/隐藏动画，代码位于 [styles/settings.css](styles/settings.css#L41-L76)：

- 使用 clip-path 实现裁剪动画
- 配合 transform 和 opacity
- 流畅的展开/收起效果

## 使用方法

### 本地运行

1. 克隆或下载项目到本地
2. 直接用浏览器打开 `index.html`
3. 或使用本地服务器（如 Live Server、python -m http.server）

### 在线部署

项目可直接部署到任何静态托管服务：

- GitHub Pages
- Vercel
- Netlify
- 阿里云 OSS
- 腾讯云 COS
- ......

### 自定义配置

在设置面板中可以个性化：

1. 点击右上角设置按钮
2. 选择"偏好"或"目标"标签
3. 根据需要调整各项设置
4. 设置会自动保存

## 浏览器兼容性

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 61+      |
| Firefox | 55+     |
| Safari | 11+      |
| Edge | 79+       |

### 已知限制

- 部分 CSS 属性需要较新的浏览器版本
- 下雪特效在低性能设备上可能有轻微卡顿
- 液态玻璃效果需要 SVG 滤镜支持

## 开发说明

### 代码规范

- 使用 IIFE 避免全局污染
- ES6+ 语法，Chrome 61+ 完全支持
- CSS 优先使用 Flexbox 布局
- HTML 结构语义化

### 性能优化

- CSS 放在头部，JS 放在 body 底部
- 使用事件委托减少 DOM 操作
- 动画使用 CSS3 硬件加速
- 图片使用现代格式

### 扩展开发

如需添加新功能：

1. 在 `scripts/` 目录创建新的模块
2. 使用 IIFE 模式封装
3. 通过 `GaoKao` 命名空间导出
4. 在 `main.js` 中初始化

## 核心模块说明

### LoadingManager ([scripts/loading.js](scripts/loading.js))

负责加载页面的显示和隐藏，采用渐进式加载策略：

- 管理加载资源的状态
- 控制加载页面的淡出动画
- 确保所有资源加载完成后才显示主界面

### Countdown ([scripts/time.js](scripts/time.js))

倒计时的核心计算模块：

- 精确计算时间差
- 智能判断当前考试阶段
- 支持毫秒级高精度显示
- 提供回调函数更新 UI

### SettingsManager ([scripts/settings.js](scripts/settings.js))

用户设置的管理器：

- 加载和保存设置到 localStorage
- 应用主题到页面
- 触发设置变更事件

### QuoteManager ([scripts/inspire.js](scripts/inspire.js))

励志语录的管理模块：

- 调用一言 API 获取语录
- 支持按类型筛选语录
- 自动轮换语录（每 30 秒）
- 本地备用语录库

### SnowManager ([scripts/snow.js](scripts/snow.js))

下雪特效的粒子系统：

- 动态创建雪花粒子
- 模拟物理飘落效果
- 响应窗口大小变化
- 性能优化的动画循环

### NoticeManager ([scripts/notice.js](scripts/notice.js))

通知提示的管理器：

- 显示临时通知气泡
- 自动消失或手动关闭
- 滑动收起动画效果

## 许可证

本项目采用 [MIT License](LICENSE) 开源，欢迎贡献者参与项目开发。

## 致谢

- [Bing](https://www.bing.com) - 每日壁纸 API
- [Hitokoto](https://hitokoto.cn) - 一言语录 API
- [Trae IDE](https://trae.ai) - 智能开发环境

---

<div align="center">
  祝所有考生金榜题名！
</div>
