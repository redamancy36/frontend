# BettaFish Frontend

BettaFish 前端应用 - 基于 Vue 3 构建的现代化 Web 应用

## 📋 项目简介

BettaFish Frontend 是 BettaFish 智能目标管理系统的前端模块，采用 Vue 3 + Vite 构建，提供流畅的用户体验和现代化的界面设计。

## ✨ 特性

- 🚀 **Vue 3** - 使用 Composition API 构建
- ⚡ **Vite** - 极速的开发服务器和构建工具
- 🎯 **Vue Router** - 官方路由管理器
- 📦 **Pinia** - 轻量级状态管理
- 🔌 **Axios** - HTTP 客户端
- 🎨 **现代化 UI** - 响应式设计，支持多种设备

## 🛠️ 技术栈

- **Vue 3.4+** - 渐进式 JavaScript 框架
- **Vue Router 4** - 路由管理
- **Pinia 2** - 状态管理
- **Axios 1.6+** - HTTP 客户端
- **Vite 5** - 构建工具
- **KaTeX** - 数学公式渲染
- **OGL** - WebGL 库

## 📦 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

**注意**：将 `YOUR_USERNAME` 和 `YOUR_REPO_NAME` 替换为实际的仓库地址。

### 2. 环境要求

确保您的系统已安装：
- **Node.js**: 16.0 或更高版本
  - 下载地址：https://nodejs.org/
  - 验证安装：`node --version`
- **npm**: 8.0 或更高版本（Node.js 自带）
  - 验证安装：`npm --version`

**可选**：也可以使用 yarn 或 pnpm：
- Yarn: https://yarnpkg.com/
- pnpm: https://pnpm.io/

### 3. 安装依赖

```bash
npm install
```

或使用 yarn:

```bash
yarn install
```

或使用 pnpm:

```bash
pnpm install
```

**注意**：首次安装可能需要几分钟时间，取决于网络速度。

### 4. 启动开发服务器

```bash
npm run dev
```

启动成功后，打开浏览器访问：**http://localhost:5173**

### 5. 配置后端 API（如果需要）

如果您的后端 API 不在 `http://localhost:5000`，需要修改 `vite.config.js` 中的代理配置：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://your-backend-url:port',  // 修改这里
      changeOrigin: true
    }
  }
}
```

## 🚀 开发指南

### 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:5173` 启动。

**访问地址**：
- 本地访问：http://localhost:5173
- 局域网访问：http://YOUR_IP:5173（其他设备可以通过此地址访问）

### 开发环境特性

- ✅ **热模块替换 (HMR)**：修改代码后自动刷新
- ✅ **API 代理**：开发环境下自动将 `/api` 请求代理到后端
- ✅ **源码映射**：方便调试，可在浏览器中查看原始代码
- ✅ **错误提示**：清晰的错误信息和堆栈跟踪

### API 代理配置

开发环境下，所有 `/api` 请求会自动代理到后端服务器（默认：`http://localhost:5000`）。

如需修改后端地址，请编辑 `vite.config.js` 中的 `server.proxy` 配置。

## 🏗️ 构建

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
frontend/
├── index.html          # HTML 入口文件
├── vite.config.js      # Vite 配置文件
├── package.json        # 项目配置和依赖
├── src/
│   ├── main.js        # 应用入口
│   ├── App.vue        # 根组件
│   ├── style.css      # 全局样式
│   ├── router/        # 路由配置
│   ├── stores/        # Pinia 状态管理
│   ├── services/      # API 服务
│   ├── views/         # 页面组件
│   └── components/    # 通用组件
└── dist/              # 构建输出目录（生产环境）
```

## 🎯 主要功能

- ✅ 用户认证（登录/注册）
- ✅ 目标管理（创建、查看、删除）
- ✅ 计划查看（多阶段计划展示）
- ✅ 自检功能
- ✅ 进度监控
- ✅ 用户画像展示
- ✅ 调试控制台

## 📝 主要组件

### 页面组件（views/）
- `Login.vue` - 登录/注册页面
- `Home.vue` - 主页面（目标管理）
- `AdventurePlan.vue` - 计划查看页面
- `CalendarView.vue` - 日历视图
- `DebugConsole.vue` - 调试控制台

### 通用组件（components/）
- `Header.vue` - 页面头部
- `CreateGoalCard.vue` - 创建目标卡片
- `GoalListCard.vue` - 目标列表卡片
- `ViewPlanModal.vue` - 查看计划模态框
- `PlanStage.vue` - 计划阶段组件
- `PlanNode.vue` - 计划节点组件
- `TaskItem.vue` - 任务项组件
- `SelfCheckModal.vue` - 自检模态框
- `ProgressModal.vue` - 进度监控模态框

## 🔧 配置说明

### 环境变量

如果需要配置环境变量，可以在项目根目录创建 `.env.local` 文件：

```env
# 后端 API 基础 URL（可选，默认使用 vite.config.js 中的代理配置）
VITE_API_BASE_URL=http://localhost:5000
```

**注意**：`.env.local` 文件不会被提交到 Git（已在 .gitignore 中忽略）。

### Vite 配置

主要配置项位于 `vite.config.js`：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| **开发服务器端口** | 本地开发服务器端口 | 5173 |
| **API 代理** | 开发环境 API 代理地址 | `/api` -> `http://localhost:5000` |
| **构建输出目录** | 生产构建输出目录 | `dist/` |
| **路径别名** | `@` 指向 `src` 目录 | 已配置 |

## ❓ 常见问题

### 1. 安装依赖失败

**问题**：`npm install` 失败或很慢

**解决方案**：
- 使用国内镜像源：
  ```bash
  npm config set registry https://registry.npmmirror.com
  ```
- 或使用 cnpm：
  ```bash
  npm install -g cnpm --registry=https://registry.npmmirror.com
  cnpm install
  ```

### 2. 端口被占用

**问题**：`Error: Port 5173 is already in use`

**解决方案**：
- 修改 `vite.config.js` 中的端口：
  ```javascript
  server: {
    port: 5174,  // 改为其他端口
  }
  ```
- 或关闭占用 5173 端口的程序

### 3. 无法连接到后端 API

**问题**：API 请求失败，显示网络错误

**解决方案**：
- 确认后端服务已启动
- 检查 `vite.config.js` 中的代理配置是否正确
- 检查后端服务地址和端口是否正确

### 4. 页面显示空白

**问题**：打开页面后显示空白

**解决方案**：
- 打开浏览器开发者工具（F12）查看控制台错误
- 检查是否有 JavaScript 错误
- 确认所有依赖都已正确安装：`npm install`

### 5. 样式不生效

**问题**：页面样式显示异常

**解决方案**：
- 清除浏览器缓存
- 重启开发服务器：`Ctrl+C` 停止，然后 `npm run dev` 重新启动
- 检查 `src/style.css` 是否正确导入

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用与原项目相同的许可证。

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Vue Router 文档](https://router.vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)

## 📚 更多文档

- [快速开始指南](./GETTING_STARTED.md) - 详细的安装和使用步骤
- [GitHub 上传指南](./FRONTEND_GITHUB_GUIDE.md) - 如何将项目上传到 GitHub

## 📞 获取帮助

### 遇到问题？

1. **查看文档**：先查看 [快速开始指南](./GETTING_STARTED.md) 和本 README
2. **搜索 Issues**：在 GitHub Issues 中搜索是否有相同问题
3. **提交 Issue**：如果问题仍未解决，请提交新的 Issue，包含：
   - 问题描述
   - 复现步骤
   - 错误信息截图
   - 环境信息（Node.js 版本、操作系统等）

### 贡献代码

欢迎贡献代码！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支：`git checkout -b feature/your-feature-name`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature-name`
5. 提交 Pull Request

## 📄 许可证

本项目采用与原项目相同的许可证。

---

**祝您使用愉快！** 🎉

