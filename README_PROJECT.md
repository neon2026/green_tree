# 绿树电竞AI智能设计平台

## 项目概述

**绿树电竞AI智能设计平台**是一款革新性的AI辅助室内设计工具，专为电竞馆业主打造。通过智能化的CAD解析、多风格方案生成、聊天式实时迭代，帮助业主快速获得专业的装修设计方案和完整交付包，显著降低设计成本和时间。

### 核心价值
- 🤖 **智能化**：自动解析CAD平面图，识别关键空间参数
- 🎨 **多样化**：一键生成5-10种专业设计风格方案
- 💬 **高效化**：聊天式指令驱动的实时方案迭代修改
- 📦 **完整化**：输出效果图、施工图、材料清单、造价估算一站式交付

## 功能特性

### 1. CAD平面图智能解析
- 支持DWG和DXF两种CAD格式
- 自动识别总建筑面积、机位数量、包间数量
- 识别大厅、吧台、VIP区、游戏区等核心区域
- 参数可视化展示和手动调整

### 2. AI驱动的多风格方案生成
- 8种预定义设计风格（赛博朋克、未来科技、暗黑竞技等）
- 5种颜色主题选择（蓝色系、紫色系、绿色系、红色系、多彩）
- 3种预算等级（经济版、标准版、高端版）
- 3种RGB灯光密度选项
- 一键生成5-10种专业方案

### 3. 高质量室内效果图
- 4个核心区域的效果图（大厅、吧台、VIP包间、游戏区）
- AI驱动的图像生成，高保真度
- 支持多风格批量生成
- JPG/PNG格式输出

### 4. 聊天式实时迭代
- 自然语言指令理解
- 实时参数提取和更新
- 效果图动态重绘
- 完整的迭代历史记录

### 5. 完整交付包
- 效果图包（JPG/PNG）
- 施工图包（DWG + PDF）
- 材料清单（Excel/PDF）
- 造价估算表（PDF）
- 一键打包下载

### 6. 项目管理
- 多项目管理
- 版本控制
- 方案对比
- 历史追溯

### 7. 智能预算估算
- 自动材料清单生成
- 多档次材料库
- 实时造价计算
- 详细造价报表

## 技术栈

### 前端
- **框架**：React 19
- **样式**：Tailwind CSS 4
- **类型**：TypeScript
- **路由**：Wouter
- **通信**：tRPC
- **UI组件**：shadcn/ui + Lucide React

### 后端
- **框架**：Express 4
- **RPC**：tRPC 11
- **ORM**：Drizzle ORM
- **数据库**：MySQL/TiDB
- **运行时**：Node.js

### 第三方服务
- **认证**：Manus OAuth
- **LLM**：OpenAI API（用于指令理解）
- **图像生成**：Manus 图像生成API
- **存储**：S3

## 项目结构

```
lvshu-ai-design/
├── client/                          # 前端应用
│   ├── src/
│   │   ├── pages/                  # 页面组件
│   │   │   ├── Home.tsx            # 首页
│   │   │   ├── Dashboard.tsx       # 仪表板
│   │   │   ├── ProjectDetail.tsx   # 项目详情
│   │   │   ├── DesignGenerator.tsx # 方案生成
│   │   │   └── DesignDetail.tsx    # 方案详情+聊天
│   │   ├── components/             # 可复用组件
│   │   ├── lib/                    # 工具库
│   │   ├── App.tsx                 # 应用入口
│   │   └── index.css               # 全局样式
│   └── public/                     # 静态资源
│
├── server/                          # 后端应用
│   ├── services/                   # 业务服务
│   │   ├── cadParser.ts            # CAD解析
│   │   ├── designGenerator.ts      # 方案生成
│   │   ├── budgetCalculator.ts     # 预算计算
│   │   ├── llmIntegration.ts       # LLM集成
│   │   └── imageGeneration.ts      # 图像生成
│   ├── routers/                    # tRPC路由
│   │   ├── projects.ts             # 项目管理
│   │   ├── budget.ts               # 预算估算
│   │   └── chat.ts                 # 聊天迭代
│   ├── routers.ts                  # 主路由
│   ├── db.ts                       # 数据库助手
│   └── _core/                      # 核心框架
│
├── drizzle/                         # 数据库
│   ├── schema.ts                   # 表定义
│   └── migrations/                 # 迁移文件
│
├── shared/                          # 共享代码
├── storage/                         # S3存储助手
│
├── PRODUCT_REQUIREMENTS.md          # 产品需求文档
├── TECHNICAL_ARCHITECTURE.md        # 技术架构文档
├── API_DOCUMENTATION.md             # API文档
├── DEPLOYMENT_GUIDE.md              # 部署指南
├── todo.md                          # 项目TODO
└── package.json                     # 依赖配置
```

## 快速开始

### 环境要求
- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL 8.0+ 或 TiDB

### 安装和运行

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 配置数据库和API密钥

# 3. 初始化数据库
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# 4. 启动开发服务器
pnpm dev

# 5. 访问应用
# 打开浏览器访问 http://localhost:3000
```

### 构建生产版本

```bash
# 构建应用
pnpm build

# 启动生产服务器
pnpm start
```

## 核心功能流程

### 用户使用流程

```
1. 用户登录
   ↓
2. 创建新项目
   ↓
3. 上传CAD平面图
   ↓
4. 系统自动解析参数
   ↓
5. 选择颜色、预算、灯光配置
   ↓
6. 生成5-10种设计方案
   ↓
7. 查看方案效果图和造价
   ↓
8. 通过聊天指令迭代修改
   ↓
9. 确认最终方案
   ↓
10. 下载完整交付包
```

## 数据库表设计

| 表名 | 说明 | 关键字段 |
|------|------|--------|
| users | 用户表 | id, openId, name, email, role |
| projects | 项目表 | id, userId, name, status, cadParameters |
| designs | 设计方案表 | id, projectId, styleId, budgetRange, parameters |
| renderings | 效果图表 | id, designId, area, imageUrl |
| iterations | 迭代记录表 | id, designId, userInstruction, parameterChanges |
| materials | 材料清单表 | id, designId, name, quantity, unitPrice |
| constructions | 施工图表 | id, designId, dwgUrl, pdfUrl |
| material_library | 材料库表 | id, name, category, economyPrice, standardPrice, premiumPrice |

## API接口

### 主要接口
- `projects.list` - 获取项目列表
- `projects.create` - 创建项目
- `projects.updateCADParameters` - 更新CAD参数
- `designs.generate` - 生成设计方案
- `designs.get` - 获取设计详情
- `budget.calculate` - 计算预算
- `chat.sendMessage` - 发送聊天消息

详见 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 单元测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test designGenerator.test.ts

# 监听模式
pnpm test --watch
```

**测试覆盖**：
- ✅ 设计方案生成（7个测试）
- ✅ 预算计算（10个测试）
- ✅ 认证流程（1个测试）

## 文档

- [产品需求文档 (PRD)](./PRODUCT_REQUIREMENTS.md) - 详细的功能需求和用户流程
- [技术架构文档](./TECHNICAL_ARCHITECTURE.md) - 系统架构、数据库设计、API设计
- [API文档](./API_DOCUMENTATION.md) - 所有API接口的详细说明
- [部署指南](./DEPLOYMENT_GUIDE.md) - 安装、配置、部署、故障排查

## 项目进度

### 已完成（第一阶段）
- ✅ 数据库架构设计和迁移
- ✅ 后端核心服务实现
- ✅ tRPC路由完整实现
- ✅ 前端页面框架
- ✅ 单元测试编写
- ✅ 文档编写

### 进行中（第二阶段）
- ⏳ LLM集成（聊天式迭代）
- ⏳ 图像生成API集成
- ⏳ 效果图渲染实现
- ⏳ 文件导出功能

### 计划中（第三阶段）
- 📅 施工图自动生成
- 📅 3D漫游功能
- 📅 方案对比功能
- 📅 性能优化

## 设计理念

### 用户体验
- **直观易用**：无需培训即可上手
- **高效迭代**：聊天式交互，快速修改
- **专业输出**：完整的交付包，开箱即用

### 技术设计
- **模块化**：清晰的服务划分，易于维护
- **可扩展**：灵活的架构，支持功能扩展
- **高可用**：完善的错误处理和日志记录

### 视觉设计
- **优雅精致**：深色主题+翠绿点缀
- **专业感**：高端配色，精细细节
- **易读性**：清晰的信息层级，舒适的排版

## 常见问题

**Q: 支持哪些CAD格式？**
A: 目前支持DWG和DXF两种格式。

**Q: 效果图生成需要多长时间？**
A: 通常需要30-60秒，取决于服务器负载。

**Q: 可以修改生成的方案吗？**
A: 可以，通过聊天框输入修改指令，支持多轮迭代。

**Q: 交付包包含什么？**
A: 包含效果图、施工图、材料清单、造价报表四部分。

**Q: 如何保证数据安全？**
A: 采用加密存储、HTTPS传输、定期备份等措施。

## 许可证

MIT License

## 联系方式

- 技术支持：support@example.com
- 功能建议：feedback@example.com
- 安全问题：security@example.com

## 致谢

感谢所有贡献者和用户的支持！

---

**项目版本**：v1.0.0  
**最后更新**：2026年4月13日  
**维护者**：Manus AI Design Team
