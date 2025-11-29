# 动画组件使用说明

本项目集成了来自 vue-bits 的精美动画特效，用于提升用户体验。

## 已集成的动画组件

### 1. CountUp - 数字递增动画
**位置**: `InfoUpdateCard.vue` - 未读数量显示

**特性**:
- 弹簧物理动画
- 平滑的数字递增效果
- 自动触发

**使用示例**:
```vue
<CountUp :to="100" :duration="1.5" />
```

### 2. ClickSpark - 点击火花效果
**位置**: 
- `InfoUpdateCard.vue` - 通知项点击
- `CreateGoalCard.vue` - 创建按钮点击

**特性**:
- Canvas 绘制的火花动画
- 可自定义颜色、数量、大小
- 点击时从点击位置发射火花

**使用示例**:
```vue
<ClickSpark spark-color="#667eea" :spark-count="12">
  <button>点击我</button>
</ClickSpark>
```

### 3. GlareHover - 悬停光晕效果
**位置**:
- `CreateGoalCard.vue` - 创建按钮
- `GoalListCard.vue` - 目标卡片

**特性**:
- 鼠标悬停时的光晕扫过效果
- 可自定义颜色、透明度、角度
- 流畅的过渡动画

**使用示例**:
```vue
<GlareHover glare-color="#667eea" :glare-opacity="0.4">
  <div>悬停我</div>
</GlareHover>
```

### 4. GradientText - 渐变文字动画
**位置**: `Header.vue` - 页面标题

**特性**:
- 渐变色文字
- 自动循环的渐变动画
- 可自定义颜色和速度

**使用示例**:
```vue
<GradientText 
  text="我的目标" 
  :colors="['#667eea', '#764ba2', '#667eea']"
  :animation-speed="6"
/>
```

### 5. AnimatedBackground - 动画背景
**位置**: `Home.vue` - 主页背景

**特性**:
- 渐变背景动画
- 可切换不同类型（gradient/particles/waves）
- 固定定位，不干扰内容

**使用示例**:
```vue
<AnimatedBackground 
  type="gradient" 
  :colors="['#667eea', '#764ba2']" 
/>
```

## 组件位置

所有动画组件位于: `frontend/src/components/animations/`

- `CountUp.vue` - 数字递增
- `ClickSpark.vue` - 点击火花
- `GlareHover.vue` - 悬停光晕
- `GradientText.vue` - 渐变文字
- `AnimatedBackground.vue` - 动画背景

## 性能优化

- 所有动画使用 `requestAnimationFrame` 优化性能
- Canvas 动画在组件卸载时自动清理
- 背景动画使用 CSS 动画（GPU 加速）

## 未来可扩展

可以从 `frontend/animate_lib/vue-bits` 中继续集成更多特效：
- BounceCards - 弹跳卡片
- SpotlightCard - 聚光灯卡片
- ScrollReveal - 滚动显示
- 等等...

