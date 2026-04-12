# 夜间模式渐变背景色优化计划

## 需求分析
夜间模式下，渐变背景色应该为深色系，与整体暗色主题保持一致。

## 当前问题
在 `main.js` 第 331-336 行定义的渐变背景色都是浅色/亮色：
```javascript
const colorMap = {
    'blue': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'orange': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'purple': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'green': 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
};
```

这些渐变在夜间模式下仍然使用，与深色主题不协调。

## 实现方案

### 方案：定义深色渐变色映射

在 `main.js` 中新增深色渐变色映射，并在应用背景时根据当前主题模式选择对应的渐变色。

**深色渐变色设计：**
- blue → 深蓝和深粉色渐变
- orange → 深橙红渐变  
- purple → 深紫罗兰渐变
- green → 深青绿渐变

## 修改文件
- `scripts/main.js`：添加深色渐变色映射，修改 `applyVisualSettings` 方法

## 实现步骤
1. 在 `applyVisualSettings` 方法中定义深色渐变色映射 `darkColorMap`
2. 检测当前主题模式（通过 `document.documentElement.getAttribute('data-theme')`）
3. 根据主题模式选择使用 `colorMap`（浅色）或 `darkColorMap`（深色）
