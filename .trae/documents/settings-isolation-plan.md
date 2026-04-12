# 设置项隔离保存方案

## 目标
将每个设置项的保存与应用操作隔离，每个设置项使用独立操作和独立的toast通知，单个设置项因错误无法保存不影响其他设置项。

## 当前问题分析

### 现有架构
- `saveHandler` 函数（main.js 第552行）统一处理所有设置项的保存
- 所有设置项验证通过后才执行保存
- 单个设置项验证失败会中止整个保存流程
- 只有一个统一的 toast 通知 "设置已保存"

### 设置项清单
| 设置项 | 类型 | 验证需求 | 备注 |
|--------|------|----------|------|
| themeMode | 选择 | 无 | 主题模式 |
| showMs | 开关 | 无 | 显示毫秒 |
| snowEffect | 开关 | 无 | 下雪动效 |
| liquidEffect | 开关 | 无 | 流光效果 |
| enableAnimation | 开关 | 无 | 开启动画 |
| eventName | 文本 | 可选验证 | 事件名称 |
| targetDate | 文本 | 日期格式验证 | 目标日期 |
| targetTime | 文本 | 时间格式验证 | 目标时间 |
| bgSource | 选择 | 无 | 背景来源 |
| bgColor | 选择 | 无 | 背景颜色 |
| quoteType | 多选 | 至少选一个 | 语录类型 |
| textColor | 选择 | 无 | 文字颜色 |
| timeFormat | 选择 | 无 | 时间制式 |

## 实施步骤

### 步骤1：创建设置项配置对象
在 `main.js` 中创建 `SETTING_CONFIGS` 配置对象，定义每个设置项的：
- 名称（用于toast通知）
- 验证函数
- 获取值的函数
- 应用函数

### 步骤2：创建独立的保存处理器
为每个设置项创建独立的保存函数 `createSettingHandler(key, config)`：
- 独立验证
- 独立保存到 localStorage
- 独立应用设置
- 独立显示 toast 通知（成功/失败）

### 步骤3：重构事件绑定
修改 `bindEvents` 方法中的事件绑定：
- 移除统一的 `saveHandler`
- 为每个设置项绑定独立的保存处理器
- 保持原有的交互逻辑（如语录类型联动）

### 步骤4：修改 SettingsManager
调整 `settings.js` 中的 `saveSettings` 方法：
- 添加 `saveSingleSetting(key, value)` 方法用于保存单个设置项
- 保持 `saveSettings` 方法兼容性（用于初始化）

### 步骤5：更新 NoticeManager
确保 `NoticeManager` 支持：
- 成功通知（默认样式）
- 错误通知（error样式）
- 已有支持，无需修改

## 详细代码修改

### 1. settings.js 修改

```javascript
// 新增方法：保存单个设置项
saveSingleSetting(key, value) {
    try {
        this.settings[key] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        this.applySingleSetting(key, value);
        return { success: true };
    } catch (e) {
        console.warn(`Failed to save setting ${key}:`, e);
        return { success: false, error: e.message };
    }
}

// 新增方法：应用单个设置项
applySingleSetting(key, value) {
    // 根据key应用对应的设置
    switch(key) {
        case 'themeMode':
            this.applyThemeMode(value);
            break;
        // ... 其他设置项
    }
    window.dispatchEvent(new CustomEvent('settingChanged', { 
        detail: { key, value, settings: this.settings } 
    }));
}
```

### 2. main.js 修改

#### 2.1 设置项配置对象
```javascript
const SETTING_CONFIGS = {
    themeMode: {
        name: '主题模式',
        getValue: function() {
            const activeBtn = this.dom.themeMode.querySelector('.theme-icon-btn.active');
            return activeBtn ? activeBtn.dataset.value : 'system';
        },
        validate: null // 无需验证
    },
    showMs: {
        name: '毫秒显示',
        getValue: function() { return this.dom.showMs.checked; },
        validate: null
    },
    // ... 其他设置项配置
    targetDate: {
        name: '目标日期',
        getValue: function() { return this.dom.targetDate.value.trim(); },
        validate: function(value) {
            // 日期验证逻辑
            // 返回 { valid: true, normalizedValue: '...' } 或 { valid: false, error: '...' }
        }
    }
    // ...
};
```

#### 2.2 独立保存处理器
```javascript
createSettingHandler(settingKey) {
    return () => {
        if (this.isInitializing) return;
        
        const config = SETTING_CONFIGS[settingKey];
        const rawValue = config.getValue.call(this);
        
        // 验证
        if (config.validate) {
            const result = config.validate.call(this, rawValue);
            if (!result.valid) {
                this.noticeManager.show(result.error, 'error');
                return;
            }
            // 使用规范化后的值
            const saveResult = this.settingsManager.saveSingleSetting(settingKey, result.normalizedValue);
            if (saveResult.success) {
                this.noticeManager.show(`${config.name}已保存`);
            } else {
                this.noticeManager.show(`${config.name}保存失败`, 'error');
            }
        } else {
            // 无需验证，直接保存
            const saveResult = this.settingsManager.saveSingleSetting(settingKey, rawValue);
            if (saveResult.success) {
                this.noticeManager.show(`${config.name}已保存`);
            } else {
                this.noticeManager.show(`${config.name}保存失败`, 'error');
            }
        }
    };
}
```

#### 2.3 重构事件绑定
```javascript
// 主题模式按钮
const themeBtns = this.dom.themeMode.querySelectorAll('.theme-icon-btn');
themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.createSettingHandler('themeMode')();
    });
});

// 显示毫秒开关
this.dom.showMs.addEventListener('change', this.createSettingHandler('showMs'));

// ... 其他设置项
```

### 3. 设置变更事件处理
修改 `settingsChanged` 事件监听器，改为监听 `settingChanged` 单个设置变更事件：
```javascript
window.addEventListener('settingChanged', (e) => {
    const { key, value, settings } = e.detail;
    // 根据key更新对应的UI和功能
    this.applySingleSettingChange(key, value, settings);
});
```

## 特殊处理

### 语录类型联动逻辑
语录类型有特殊的联动逻辑（"全部"与其他选项互斥），需要保持：
```javascript
// 保持原有的联动逻辑，但在变更后触发独立保存
this.dom.quoteTypeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        // 原有联动逻辑...
        // 然后触发独立保存
        this.createSettingHandler('quoteType')();
    });
});
```

### 流光效果与主题模式联动
流光效果开启时禁用主题模式切换，需要保持：
```javascript
this.dom.liquidEffect.addEventListener('change', () => {
    this.updateThemeModeState(this.dom.liquidEffect.checked);
    this.createSettingHandler('liquidEffect')();
});
```

## 文件修改清单

| 文件 | 修改内容 |
|------|----------|
| scripts/settings.js | 添加 `saveSingleSetting` 和 `applySingleSetting` 方法 |
| scripts/main.js | 添加 `SETTING_CONFIGS` 配置、`createSettingHandler` 方法、重构事件绑定 |

## 测试要点

1. 每个设置项独立保存，修改后显示对应的toast通知
2. 日期/时间格式错误时，只显示错误通知，不影响其他设置
3. 语录类型联动逻辑正常工作
4. 流光效果与主题模式联动正常
5. 页面刷新后设置正确恢复
