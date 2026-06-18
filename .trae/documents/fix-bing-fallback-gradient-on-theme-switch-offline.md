# 修复：断网时切换主题，Bing fallback 渐变背景不更新

## 摘要

在断网情况下（Bing 图片加载失败，背景显示 fallback 渐变），用户在设置中切换白/夜主题时，fallback 渐变背景不会跟随主题变化。根因是 `settingChanged` 事件的 switch 语句缺少 `themeMode` case，导致主题切换时 `applyVisualSettings` 不被调用。

## 当前状态分析

### 调用链路

1. 用户点击主题按钮 → [main.js:765](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/scripts/main.js#L765) `this.createSettingHandler('themeMode')()`
2. → [main.js:560](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/scripts/main.js#L560) `saveSingleSetting('themeMode', value)`
3. → [settings.js:82](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/scripts/settings.js#L82) `applySingleSetting('themeMode', value)`
4. → [settings.js:94-101](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/scripts/settings.js#L94-L101) 设置 `data-theme` 属性
5. → [settings.js:104-106](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/scripts/settings.js#L104-L106) 派发 `settingChanged` 事件
6. → [main.js:791-819](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/scripts/main.js#L791-L819) 事件监听器的 switch 语句

### 根因

[main.js:794-816](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/scripts/main.js#L794-L816) 的 switch 语句中，调用 `applyVisualSettings` 的 case 列表为：

```javascript
case 'snowEffect':
case 'liquidEffect':
case 'bgSource':
case 'bgColor':
case 'textColor':
    this.applyVisualSettings(settings);
    break;
```

**缺少 `themeMode`**。因此切换主题时：
- `data-theme` 属性已更新（CSS 变量切换生效）
- 但 `applyVisualSettings` 不被调用
- Bing fallback 渐变背景保持旧主题的渐变

### 之前修复的遗留问题

上一轮修复（缺陷 1）在 [main.js:512-519](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/scripts/main.js#L512-L519) 添加了 `else if (themeChanged && !this.bingLoaded)` 分支来处理"主题改变但 Bing 未加载"的情况。但该分支只有在 `applyVisualSettings` 被调用时才会执行——而主题切换根本不调用 `applyVisualSettings`，所以这个分支对主题切换场景形同虚设。

### 场景验证

| 场景 | 当前行为 | 期望行为 |
|------|---------|---------|
| 联网 + Bing 已加载 + 切换主题 | 保持 Bing 图片（正确） | 保持 Bing 图片 |
| 联网 + Bing 未加载 + 切换主题 | fallback 渐变不变（错误） | fallback 渐变跟随主题 |
| **断网 + 切换主题** | **fallback 渐变不变（错误）** | **fallback 渐变跟随主题** |

## 修改方案

### 修改 1：在 switch case 中添加 `themeMode`

**文件**：`c:\Users\赵晨旭\Desktop\GaoKao-Countdown\scripts\main.js`

**位置**：[main.js:809-815](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/scripts/main.js#L809-L815)

**修改前**：
```javascript
case 'snowEffect':
case 'liquidEffect':
case 'bgSource':
case 'bgColor':
case 'textColor':
    this.applyVisualSettings(settings);
    break;
```

**修改后**：
```javascript
case 'snowEffect':
case 'liquidEffect':
case 'bgSource':
case 'bgColor':
case 'textColor':
case 'themeMode':
    this.applyVisualSettings(settings);
    break;
```

**原理**：让主题切换触发 `applyVisualSettings`，进入已有的 `else if (themeChanged && !this.bingLoaded)` 分支（[main.js:512](file:///c:/Users/赵晨旭/Desktop/GaoKao-Countdown/scripts/main.js#L512)），更新 fallback 渐变。

### 逻辑验证（修改后）

切换主题时 `applyVisualSettings(settings)` 被调用，此时：
- `this.currentSettings` 还是旧主题（在第 818 行才更新）
- `settings` 是新主题
- `themeChanged = this.currentSettings.themeMode !== settings.themeMode` → `true` ✓
- `isDark` 读取已更新的 `data-theme` → 新主题值 ✓
- `defaultGradient` 基于新 `isDark` 计算 → 正确的渐变 ✓

进入 Bing 分支后的行为：
- **断网 / Bing 未加载**（`bingLoaded=false`）：进入 `else if (themeChanged && !this.bingLoaded)` 分支，更新为新主题的 `defaultGradient` ✓
- **联网 + Bing 已加载**（`bingLoaded=true`）：不进入任何分支，保持 Bing 图片（Bing 图片与主题无关）✓

## 假设与决策

1. **假设**：`applyVisualSettings` 内部已有的 `else if (themeChanged && !this.bingLoaded)` 分支逻辑正确，无需修改。本次只需补上调用入口。

2. **决策**：采用最小改动原则，仅在 switch case 中添加一行 `case 'themeMode':`，不重构其他逻辑。

3. **不修改 `applySingleSetting`**：主题切换的 `data-theme` 设置已在 settings.js 中完成，main.js 只需响应事件更新背景。

## 验证步骤

1. **断网 + 切换主题**：
   - 打开 DevTools → Network → Offline
   - 刷新页面，等待 Bing 加载超时（5秒），确认背景显示 fallback 渐变
   - 打开设置，切换到另一主题
   - 预期：fallback 渐变立即跟随主题变化（白→粉蓝渐变，夜→深蓝紫红渐变）

2. **联网 + Bing 已加载 + 切换主题**：
   - 联网状态，等待 Bing 图片加载完成
   - 切换主题
   - 预期：背景保持 Bing 图片不变

3. **联网 + Bing 加载中 + 切换主题**：
   - 联网状态，Bing 加载中（未完成）
   - 切换主题
   - 预期：fallback 渐变跟随主题变化，Bing 加载完成后显示 Bing 图片
