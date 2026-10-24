# GoToTop

一个零依赖的回到顶部按钮插件，支持滚动进度环、呼吸灯/箭头双样式、拖拽放置、移动端适配。

## 快速开始

```html
<script src="gototop.min.js"></script>
```

## 特性

- **零依赖**：纯原生 JavaScript + CSS，无需任何第三方库
- **自动注入**：CSS 和 DOM 全部动态创建，引入即用
- **双样式**：呼吸灯模式 / 箭头模式，可自由切换
- **进度环**：滚动进度实时显示，实心圆环
- **拖拽放置**：支持拖拽到页面任意位置
- **移动端适配**：响应式尺寸，触摸友好
- **可配置**：颜色、尺寸、位置、透明度等均可自定义
- **可销毁**：支持完全移除按钮和事件

## 配置项

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `size` | `32` | 按钮直径（px） |
| `bottom` | `32` | 距底部距离（px） |
| `right` | `32` | 距右侧距离（px） |
| `color` | `'#ff5e62'` | 进度环颜色 |
| `trackColor` | `'rgba(255,255,255,.95)'` | 轨道背景色 |
| `borderColor` | `'rgba(17,24,39,.12)'` | 边框颜色 |
| `ringWidth` | `3.5` | 进度环宽度（px） |
| `threshold` | `120` | 显示阈值（滚动多少 px 后显示） |
| `zIndex` | `9999` | 层级 |
| `style` | `'breath'` | 样式：`'breath'` 呼吸灯 / `'arrow'` 箭头 |
| `breathColor` | `'#e6212a'` | 呼吸灯颜色 |
| `breathSize` | `6` | 呼吸灯直径（px） |
| `arrowColor` | `'#ffffff'` | 箭头颜色 |
| `label` | `'返回顶部'` | 无障碍标签 |

## 使用示例

### 默认配置（呼吸灯模式）

```javascript
// 引入后自动生效，无需调用
```

### 自定义配置

```javascript
GoToTop({
    style: 'breath',
    breathColor: '#3b82f6',
    breathSize: 8,
    color: '#3b82f6',
    size: 40
});
```

### 切换为箭头模式

```javascript
GoToTop({
    style: 'arrow',
    arrowColor: '#fff'
});
```

### 销毁按钮

```javascript
GoToTop.destroy();
```

## 样式说明

### 呼吸灯模式（默认）

中心显示一个呼吸灯圆点，透明度在 `0.38 ~ 0.9` 之间循环变化，带光晕效果。适合简洁、现代的设计风格。

### 箭头模式

中心显示 SVG 向上箭头，进度环围绕箭头填充。适合需要明确指示功能的场景。

## 浏览器支持

- Chrome ≥ 60
- Firefox ≥ 55
- Safari ≥ 12
- Edge ≥ 79
- iOS Safari ≥ 12
- Android Chrome ≥ 60

## License

MIT
