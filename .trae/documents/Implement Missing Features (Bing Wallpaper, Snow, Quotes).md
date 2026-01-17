根据您的反馈和PRD文档，我制定了以下详细的补全计划，旨在完善缺失的功能并提升用户体验。

## 1. 背景与视觉增强 (Background & Visuals)
*   **Bing 每日壁纸支持**:
    *   在设置中添加“背景来源”选项（默认/Bing壁纸）。
    *   实现异步加载高质量风景壁纸（模拟 Bing 每日一图接口或使用无版权高清图源）。
    *   添加图片加载时的过渡动画，确保视觉平滑。
*   **下雪特效 (Snow Effect)**:
    *   创建 `scripts/snow.js` 模块，使用 HTML5 Canvas 实现高性能下雪动画。
    *   与设置中的“下雪特效”开关关联，支持实时开启/关闭。
*   **主题色切换**:
    *   在设置中增加“主题色”选择（蓝色/橙色）。
    *   修改 CSS 变量逻辑，允许动态切换主色调（不仅是黑白模式）。

## 2. 励志语录升级 (Quotes Upgrade)
*   **语录分类**:
    *   扩展 `scripts/inspire.js`，为语录添加分类标签（如：古诗、名言、二次元、高考加油）。
    *   在设置面板中添加“语录类型”多选或下拉菜单。
*   **逻辑优化**:
    *   根据用户选择的类型筛选显示的语录。

## 3. 交互与反馈 (Interaction & Feedback)
*   **通知提示 (Notice/Toast)**:
    *   在保存设置时调用 `NoticeManager` 弹出“设置已保存”的提示。
    *   在网络请求（如获取壁纸）失败时显示错误提示。
*   **细节打磨**:
    *   优化设置弹窗的“神奇效果”动画参数，使其更接近 macOS 风格。
    *   确保所有新增的设置项都能正确保存到 IndexedDB。

## 4. 文件结构变更
*   **新增**: `scripts/snow.js`
*   **修改**: `scripts/main.js`, `scripts/settings.js`, `scripts/inspire.js`, `styles/settings.css`, `styles/themes.css`, `index.html`

确认后，我将按照此计划依次执行代码编写。