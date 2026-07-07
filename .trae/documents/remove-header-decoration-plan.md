# 删除 h1 标题下的杂色装饰线计划

## 1. 摘要 (Summary)
用户反馈之前修改为下划线的彩色渐变装饰线依然影响观感，要求将其完全删除。本计划将移除 HTML 中的装饰线节点以及对应的 CSS 样式。

## 2. 当前状态分析 (Current State Analysis)
- `index.html` 中存在 `<div class="header-decoration"></div>` 元素，位于 `h1` 标题之前。
- `styles/layout.css` 中存在 `.header-decoration` 的 CSS 样式规则，定义了该渐变线的表现。

## 3. 拟议更改 (Proposed Changes)

### 3.1 修改 `index.html`
**操作**：删除对应的 DOM 节点。
**位置**：`<header class="app-header">` 内部。
**移除代码**：
```html
<div class="header-decoration"></div>
```

### 3.2 修改 `styles/layout.css`
**操作**：删除对应的样式规则，保持样式表整洁。
**移除代码**：
```css
.header-decoration {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
    opacity: 0.3;
}
```

## 4. 验证步骤 (Verification steps)
1. 保存 `index.html` 和 `layout.css` 的修改。
2. 刷新页面，观察主界面上方。
3. 确认“高考倒计时”标题下方或中间不再有任何彩色线条。
4. 确认标题的排版和居中没有受到破坏。