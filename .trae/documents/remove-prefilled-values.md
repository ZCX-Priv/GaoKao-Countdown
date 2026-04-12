# 计划：移除"目标"表单的预填充值

## 需求分析

用户希望"目标"标签页中的输入框不显示预填充的值，只保留 placeholder 提示文字。

**当前行为：**
- 事件名称：默认显示 "高考"
- 目标时间：默认显示 "09:00"

**期望行为：**
- 事件名称：输入框为空，显示 placeholder "高考"
- 目标时间：输入框为空，显示 placeholder "时:分 或 时-分"
- 当用户不输入任何值时，系统仍使用默认高考时间（6月7日 9:00）

## 实现步骤

### 步骤 1：修改 index.html
**文件**: `index.html` 第279行

移除目标时间输入框的 `value="09:00"` 属性：
```html
<!-- 修改前 -->
<input type="text" id="target-time" value="09:00" placeholder="时:分 或 时-分" spellcheck="false">

<!-- 修改后 -->
<input type="text" id="target-time" placeholder="时:分 或 时-分" spellcheck="false">
```

### 步骤 2：修改 settings.js 默认值
**文件**: `scripts/settings.js` 第11-13行

将默认值改为空字符串：
```javascript
// 修改前
eventName: '高考',
targetDate: null,
targetTime: '09:00',

// 修改后
eventName: '',
targetDate: null,
targetTime: '',
```

### 步骤 3：修改 main.js syncSettingsUI 方法
**文件**: `scripts/main.js` 第385-387行

修改输入框的值设置逻辑，当值为空时不填充：
```javascript
// 修改前
this.dom.eventName.value = settings.eventName;
this.dom.targetDate.value = settings.targetDate || '';
this.dom.targetTime.value = settings.targetTime || '09:00';

// 修改后
this.dom.eventName.value = settings.eventName || '';
this.dom.targetDate.value = settings.targetDate || '';
this.dom.targetTime.value = settings.targetTime || '';
```

## 验证逻辑保持不变

`SETTING_CONFIGS` 中的验证逻辑已经正确处理空值情况：
- `eventName` 为空时，验证返回默认值 `'高考'`
- `targetTime` 为空时，验证返回默认值 `'09:00'`

这意味着用户不输入任何值时，系统会自动使用默认的高考时间。

## 影响范围

- 仅影响"目标"标签页的表单显示
- 不影响倒计时核心逻辑
- 不影响已保存的用户设置（localStorage 中的数据）
