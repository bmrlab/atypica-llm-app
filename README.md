# atypica.LLM

atypica.LLM 是一个基于大语言模型的用户研究助手，它可以帮助研究者快速构建用户画像、进行用户访谈并生成研究报告。

## 主要功能

### 1. 品牌分析师

- 创建针对特定研究主题的AI分析师
- 分析师可以自主设计访谈问题，引导对话
- 支持多轮深度访谈，自动记录和总结对话内容

### 2. 用户画像库

- 基于社交媒体数据构建真实用户画像
- 每个画像包含性格特征、消费习惯等多维度信息
- 可作为访谈对象，提供真实的用户反馈

### 3. 用户发掘

- 根据研究需求，自动搜索和筛选目标用户
- 分析用户生成内容，提取关键特征
- 动态构建新的用户画像

## 技术实现

### 架构

- 前端：Next.js 13 (App Router)
- 数据库：Prisma + PostgreSQL
- AI模型：Claude 3 + GPT-4

### 核心模块

#### 1. 对话系统

对话系统采用多Agent架构：

- Interviewer Agent：控制访谈流程，设计问题
- Persona Agent：基于用户画像模拟真实用户回答

#### 2. 知识检索

集成小红书API，支持：

- 搜索相关内容
- 分析用户笔记
- 提取评论数据

#### 3. 工具函数

提供多个专用工具：

- reasoningThinking：辅助AI进行推理思考
- savePersona：保存新的用户画像
- saveInterviewConclusion：保存访谈总结

## 使用指南

1. 安装依赖

```bash
pnpm install
```

2. 配置环境变量

```bash
cp .env.example .env
```

3. 初始化数据库

```bash
npx prisma generate  # 生成必要的类型定义
npx prisma migrate deploy  # 执行数据库迁移
```

4. 启动开发服务器

```bash
pnpm dev
```

## 项目结构

```
src/
  ├── app/                   # Next.js 页面和API路由
  │   ├── analyst/           # 分析师话题页面
  │   ├── personas/          # 用户画像管理
  │   ├── interview/         # 用户访谈对话页面
  │   └── scout/             # 用户发掘
  ├── components/            # UI组件
  ├── data/                  # 数据对象类型
  ├── lib/                   # 工具函数和配置
  ├── tools/                 # AI工具函数
  └── prompt/                # 提示词模板
```

## 开发计划

- [ ] 支持更多数据源
- [ ] 优化访谈体验
- [ ] 添加数据可视化
- [ ] 改进报告生成

## 贡献指南

欢迎提交 Issue 和 PR
