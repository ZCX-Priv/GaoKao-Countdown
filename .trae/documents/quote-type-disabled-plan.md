# 实施计划：语录类型获取失败时变灰

## 需求分析

当从 API 获取励志语录失败时（网络错误、超时等），系统会回退到本地语录。此时"语录类型"设置项应该变成灰色禁用状态，因为本地语录不区分类型。

## 实施步骤

### 1. 修改 `scripts/inspire.js`

**添加功能：**
- 添加状态属性 `isOnline` 追踪是否成功获取在线语录
- 添加方法 `setQuoteTypeDisabled(disabled)` 控制语录类型设置项的禁用状态
- 在 `fetchQuote()` 成功获取在线数据时，设置 `isOnline = true` 并启用语录类型
- 在 `showLocalQuote()` 回退到本地语录时，设置 `isOnline = false` 并禁用语录类型

**具体修改：**
```javascript
// constructor 中添加
this.isOnline = true;
this.quoteTypeSetting = document.querySelector('#quote-type-group').closest('.setting-item');

// 新增方法
setQuoteTypeDisabled(disabled) {
    if (this.quoteTypeSetting) {
        if (disabled) {
            this.quoteTypeSetting.classList.add('disabled');
        } else {
            this.quoteTypeSetting.classList.remove('disabled');
        }
    }
}

// fetchQuote 成功时调用
this.setQuoteTypeDisabled(false);

// showLocalQuote 中调用
this.setQuoteTypeDisabled(true);
```

### 2. 验证 CSS 样式

**已有样式：**
`components.css` 第329-342行已存在 `.setting-item.disabled` 样式：
```css
.setting-item.disabled {
    opacity: 0.4;
    pointer-events: none;
}

.setting-item.disabled label:first-child {
    color: #999;
}
```

此样式已满足需求，无需修改 CSS。

## 文件修改清单

| 文件 | 修改内容 |
|------|----------|
| `scripts/inspire.js` | 添加状态追踪和禁用控制逻辑 |

## 测试要点

1. 正常获取在线语录时，语录类型设置项可正常使用
2. 网络断开或 API 超时时，语录类型设置项变灰禁用
3. 恢复网络后重新获取成功，语录类型设置项恢复正常
