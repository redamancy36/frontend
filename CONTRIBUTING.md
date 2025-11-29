# 贡献指南

感谢您对 BettaFish Frontend 项目的关注！本文档将指导您如何参与项目贡献。

## 🚀 快速开始

### 1. Fork 项目

在 GitHub 上 Fork 本项目到您的账号。

### 2. 克隆到本地

```bash
# 克隆您 Fork 的仓库
git clone https://github.com/YOUR_USERNAME/bettafish-frontend.git
cd bettafish-frontend

# 添加上游仓库（原项目）
git remote add upstream https://github.com/ORIGINAL_OWNER/bettafish-frontend.git
```

### 3. 创建分支

```bash
# 从 main 分支创建新分支
git checkout -b feature/your-feature-name

# 或修复 bug
git checkout -b fix/your-bug-fix
```

### 4. 开发

- 修改代码
- 添加新功能
- 修复 bug
- 确保代码符合项目规范

### 5. 提交更改

```bash
# 添加更改的文件
git add .

# 提交（请使用清晰的提交信息）
git commit -m "feat: 添加新功能描述"

# 或
git commit -m "fix: 修复某个 bug"
```

**提交信息规范**：
- `feat:` - 新功能
- `fix:` - 修复 bug
- `docs:` - 文档更新
- `style:` - 代码格式调整（不影响功能）
- `refactor:` - 代码重构
- `test:` - 测试相关
- `chore:` - 构建/工具相关

### 6. 推送到您的 Fork

```bash
git push origin feature/your-feature-name
```

### 7. 创建 Pull Request

1. 访问您的 GitHub Fork 页面
2. 点击 "New Pull Request"
3. 选择您的分支
4. 填写 PR 描述，说明您的更改
5. 提交 PR

## 📝 代码规范

### 文件命名

- Vue 组件：使用 PascalCase，如 `UserProfile.vue`
- JavaScript 文件：使用 camelCase，如 `apiService.js`
- 目录：使用 kebab-case，如 `user-profile/`

### 代码风格

- 使用 2 个空格缩进
- 使用单引号（JavaScript/Vue）
- 组件 props 应该明确定义类型
- 使用 Composition API（`<script setup>`）

### 提交前检查

```bash
# 确保代码可以正常运行
npm run dev

# 确保可以正常构建
npm run build
```

## 🐛 报告问题

如果您发现了 bug，请：

1. 检查 Issues 中是否已有相同问题
2. 如果没有，创建新的 Issue
3. 提供详细信息：
   - 问题描述
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息（浏览器、Node.js 版本等）
   - 错误截图（如果有）

## 💡 功能建议

如果您有功能建议，请：

1. 检查 Issues 中是否已有类似建议
2. 创建新的 Issue，类型选择 "Feature Request"
3. 详细描述：
   - 功能描述
   - 使用场景
   - 预期效果

## ✅ Pull Request 检查清单

在提交 PR 前，请确认：

- [ ] 代码可以正常运行
- [ ] 代码可以正常构建
- [ ] 没有引入新的错误或警告
- [ ] 遵循了项目的代码风格
- [ ] 更新了相关文档（如果需要）
- [ ] 提交信息清晰明确
- [ ] PR 描述详细说明了更改内容

## 🙏 感谢

感谢您对项目的贡献！您的每一个 PR 和 Issue 都是对我们的支持。

