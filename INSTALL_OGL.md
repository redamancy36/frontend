# 安装 ogl 库以启用 Aurora 极光特效

## 当前状态

由于 `ogl` 库未正确安装，目前使用纯 CSS 渐变背景作为临时方案。

## 安装 ogl 库

### 方法 1: 使用 npm（推荐）

在 `frontend` 目录下执行：

```bash
cd frontend
npm install ogl@^1.0.11
```

### 方法 2: 如果方法 1 失败，尝试清理后重新安装

```bash
cd frontend
rm -rf node_modules package-lock.json  # Windows: 手动删除这两个文件夹
npm install
```

### 方法 3: 使用 yarn（如果已安装 yarn）

```bash
cd frontend
yarn add ogl@^1.0.11
```

## 验证安装

安装成功后，检查 `frontend/node_modules` 目录下是否有 `ogl` 文件夹。

## 启用 Aurora 特效

安装成功后，在 `frontend/src/components/Home.vue` 中：

1. 取消注释 `AuroraBackground` 组件
2. 注释掉 `GradientBackground` 组件

```vue
<!-- 注释掉渐变背景 -->
<!-- <GradientBackground 
  :colors="['#667eea', '#764ba2', '#667eea']"
  :speed="15"
/> -->

<!-- 启用极光特效 -->
<AuroraBackground 
  :color-stops="['#667eea', '#764ba2', '#667eea']"
  :amplitude="1.2"
  :blend="0.6"
  :speed="1.0"
  :intensity="1.0"
/>
```

## 重启开发服务器

安装完成后，需要重启 Vite 开发服务器：

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

## 故障排除

如果仍然无法安装：

1. **检查网络连接**：确保能访问 npm  registry
2. **检查 npm 版本**：`npm --version`（建议 >= 8.0）
3. **清除 npm 缓存**：`npm cache clean --force`
4. **使用国内镜像**（如果在中国）：
   ```bash
   npm config set registry https://registry.npmmirror.com
   npm install ogl
   ```

## 临时方案

如果暂时无法安装 ogl，当前的 `GradientBackground` 组件已经提供了美观的渐变背景效果，可以正常使用。

