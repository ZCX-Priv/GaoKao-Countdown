# 高考倒计时项目动画重构规范

## Why

当前项目的CSS文件混合了样式和动画，且存在23处`!important`使用，导致：
- 样式难以维护和复用
- 动画逻辑与样式强耦合
- `!important`滥用影响样式优先级管理

## What Changes

### 1. CSS文件拆分
将现有的4个CSS文件拆分为更细粒度的模块化结构：
- `base.css` - 重置样式和CSS变量
- `layout.css` - 布局相关样式（容器、flex、grid）
- `components.css` - 通用组件样式（按钮、开关、输入框等）
- `animations.css` - 纯动画定义（keyframes）
- `themes.css` - 主题相关（深色/浅色模式）
- 保留功能模块样式：`countdown.css`、`modal.css`、`notice.css`、`loading.css`

### 2. 动画独立化
- 所有`@keyframes`定义移入`animations.css`
- 动画类名统一前缀（如`.animate-fade-in`）
- 使用`body.no-animation`类控制动画启用/禁用，不再使用`!important`

### 3. 移除`!important`
- 使用CSS优先级规则替代（如增加选择器特异性）
- 拆分样式文件后通过正确的层叠顺序解决冲突

## Impact

- **受影响文件**: `styles/*.css`
- **影响范围**: 样式组织、动画控制方式

## ADDED Requirements

### Requirement: 模块化CSS架构
系统应提供独立的CSS模块文件，每个文件职责单一

#### Scenario: 加载CSS
- **WHEN** 页面加载
- **THEN** 按照base → layout → components → themes → features顺序加载

### Requirement: 动画可控性
动画应可通过CSS类完全控制，无需`!important`

#### Scenario: 禁用动画
- **WHEN** `body`添加`no-animation`类
- **THEN** 所有动画停止/不执行，使用静态显示

## MODIFIED Requirements

### Requirement: 隐藏元素
`.hidden`类不再使用`!important`，改用高优先级选择器

### Requirement: 响应式覆盖
媒体查询中的尺寸设置不再使用`!important`，改用CSS优先级自然覆盖

## REMOVED Requirements

### Requirement: 无障碍动画
移除所有动画相关的`!important`声明（保留合理的无障碍考虑）
