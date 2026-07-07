# 修复 h1 标题被装饰线穿过的问题

## 1. 当前状态分析
用户反馈首页的 `h1` 标题（“高考倒计时”）被一条杂色线穿过。
经过排查，在 `styles/layout.css` 中，`.header-decoration` 是一个高度为 2px 的渐变彩色线条，其定位使用了 `top: 50%; transform: translate(-50%, -50%);`，这导致它正好处于 `.app-header` 的垂直居中位置。
虽然在之前的修复中，通过 `position: relative` 将 `h1` 的层级提升到了装饰线之上，但由于文字本身存在间隙（尤其是行楷等手写体），位于文字背后的 2px 细线依然会透过文字的间隙显露出来，在视觉上形成“一条线穿过文字”的错误效果（类似于删除线）。

## 2. 拟议更改 (Proposed Changes)
为了解决这个问题，同时保留装饰线的美观作用，最佳方案是将该装饰线从“居中穿过”改为“标题下方的下划线装饰”。

### 目标文件：`styles/layout.css`
**修改 `.header-decoration` 的 CSS 定位：**
将 `top: 50%;` 和 `transform: translate(-50%, -50%);` 修改为底部定位，使其作为下划线显示在标题下方。

**具体修改：**
```css
.header-decoration {
    position: absolute;
    bottom: 0; /* 将定位从 top: 50% 移到底部 */
    left: 50%;
    transform: translateX(-50%); /* 仅保留水平居中 */
    width: 200px;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
    opacity: 0.3;
}
```
*(注：由于 `.app-header h1` 已经有 `margin-bottom: 10px;`，将装饰线设置在 `bottom: 0;` 会让它刚好位于文字下方 10px 处，形成一条完美的装饰性下划线)*

## 3. 假设与决策
- **决策**：将线移到下方作为下划线，而不是直接删除它。这样可以保留原有的设计元素（渐变装饰），同时彻底解决穿模和遮挡问题。

## 4. 验证步骤
1. 保存 `layout.css` 的修改。
2. 刷新页面，观察主界面上方的“高考倒计时”标题。
3. 确认原本穿过文字中间的彩色细线已经移动到文字下方，成为一条下划线装饰。
4. 确认文字本身不再被任何线条穿过，视觉清爽。