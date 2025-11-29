# 🚀 快速开始指南

本指南将帮助您快速上手 BettaFish Frontend 项目。

## 第一步：克隆项目

```bash
# 使用 HTTPS（推荐）
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 或使用 SSH（如果您配置了 SSH 密钥）
git clone git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

克隆完成后，进入项目目录：

```bash
cd YOUR_REPO_NAME
```

## 第二步：检查环境

确保您已经安装了 Node.js：

```bash
# 检查 Node.js 版本（需要 16.0 或更高）
node --version

# 检查 npm 版本
npm --version
```

如果未安装 Node.js，请访问 https://nodejs.org/ 下载安装。

## 第三步：安装依赖

```bash
npm install
```

**安装过程**：
- 这会根据 `package.json` 安装所有必需的依赖包
- 首次安装可能需要 2-5 分钟（取决于网络速度）
- 安装完成后会生成 `node_modules` 目录

**如果安装很慢**，可以使用国内镜像：

```bash
# 设置 npm 镜像源
npm config set registry https://registry.npmmirror.com

# 然后重新安装
npm install
```

## 第四步：启动开发服务器

```bash
npm run dev
```

**启动成功标志**：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

## 第五步：访问应用

在浏览器中打开：**http://localhost:5173**

您应该能看到 BettaFish 前端应用界面。

## 📋 下一步

### 配置后端连接

如果您的后端 API 不在默认地址 `http://localhost:5000`，需要修改 `vite.config.js`：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://YOUR_BACKEND_URL:PORT',  // 修改这里
      changeOrigin: true
    }
  }
}
```

### 查看项目结构

主要文件说明：
- `src/main.js` - 应用入口文件
- `src/App.vue` - 根组件
- `src/router/` - 路由配置
- `src/views/` - 页面组件
- `src/components/` - 通用组件
- `src/stores/` - 状态管理（Pinia）
- `src/services/` - API 服务

### 运行构建

构建生产版本：

```bash
npm run build
```

构建完成后，生产文件会在 `dist/` 目录中。

### 预览生产构建

```bash
npm run preview
```

## 🆘 遇到问题？

1. **查看控制台错误**：打开浏览器开发者工具（F12）查看错误信息
2. **检查依赖安装**：确保 `npm install` 成功完成
3. **查看完整文档**：阅读 `README.md` 了解更多信息
4. **提交 Issue**：在 GitHub 上提交问题，我们会尽快回复

## 📚 推荐学习资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Vue Router 文档](https://router.vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)

---

祝您使用愉快！🎉

