# 绿树电竞AI智能设计平台 - 技术架构文档

## 1. 系统架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                         前端应用层                               │
│  React 19 + Tailwind CSS 4 + TypeScript                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 页面组件                                                  │  │
│  │ - Home (首页)                                            │  │
│  │ - Dashboard (仪表板)                                     │  │
│  │ - ProjectDetail (项目详情)                               │  │
│  │ - DesignGenerator (方案生成)                             │  │
│  │ - DesignDetail (方案详情+聊天)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ tRPC
┌─────────────────────────────────────────────────────────────────┐
│                      API网关层 (/api/trpc)                       │
│  Express 4 + tRPC 11                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      业务逻辑层                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 核心服务模块                                              │  │
│  │ - cadParser (CAD解析)                                   │  │
│  │ - designGenerator (方案生成)                             │  │
│  │ - budgetCalculator (预算计算)                            │  │
│  │ - llmIntegration (LLM集成)                               │  │
│  │ - imageGeneration (图像生成)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ tRPC路由                                                 │  │
│  │ - projects (项目管理)                                    │  │
│  │ - designs (设计方案)                                     │  │
│  │ - budget (预算估算)                                      │  │
│  │ - chat (聊天迭代)                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      数据持久化层                                 │
│  Drizzle ORM + MySQL/TiDB                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 核心表                                                    │  │
│  │ - users (用户)                                           │  │
│  │ - projects (项目)                                        │  │
│  │ - designs (设计方案)                                     │  │
│  │ - renderings (效果图)                                    │  │
│  │ - iterations (迭代记录)                                  │  │
│  │ - materials (材料清单)                                   │  │
│  │ - constructions (施工图)                                 │  │
│  │ - material_library (材料库)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    第三方服务集成层                               │
│  - Manus OAuth (认证)                                           │
│  - LLM API (指令理解)                                            │
│  - 图像生成API (效果图)                                          │
│  - S3存储 (文件存储)                                             │
└─────────────────────────────────────────────────────────────────┘
```

## 2. 核心模块设计

### 2.1 CAD解析模块 (cadParser.ts)

**职责**：解析DWG/DXF格式的CAD文件，提取空间参数。

**关键函数**：
```typescript
// 解析CAD文件
parseCADFile(fileBuffer: Buffer, fileName: string): Promise<CADParameters>

// 验证参数合理性
validateCADParameters(params: CADParameters): ValidationResult

// 识别核心区域
identifyCoreAreas(params: CADParameters): CoreArea[]
```

**输出数据结构**：
```typescript
interface CADParameters {
  totalArea: number;           // 总面积（㎡）
  machineCount: number;        // 机位数
  privateRoomCount: number;    // 包间数
  barArea: number;             // 吧台面积
  hallArea: number;            // 大厅面积
  vipArea: number;             // VIP区面积
  coreAreas: string[];         // 核心区域列表
}
```

**实现方案**：
- 使用ezdxf库解析DXF文件
- 使用dwg库解析DWG文件
- 通过图形识别算法识别不同区域
- 提供参数手动调整接口

### 2.2 设计方案生成模块 (designGenerator.ts)

**职责**：基于CAD参数和用户选择，生成5-10种设计风格方案。

**关键函数**：
```typescript
// 生成设计方案
generateDesigns(input: DesignGenerationInput): Design[]

// 获取可用风格列表
getAvailableStyles(): StyleDefinition[]

// 生成图像提示词
generateImagePrompt(design: Design): string
```

**风格库结构**：
```typescript
interface StyleDefinition {
  id: string;
  name: string;
  theme: string;
  colorScheme: ColorScheme;
  description: string;
  features: string[];
  budgetRange: {
    economy: number;
    standard: number;
    premium: number;
  };
}
```

**生成算法**：
1. 从风格库中选择5-10种风格
2. 根据颜色主题调整配色方案
3. 根据预算等级调整材料档次
4. 根据RGB密度调整灯光配置
5. 计算预估造价
6. 生成图像生成提示词

### 2.3 预算估算模块 (budgetCalculator.ts)

**职责**：根据设计参数自动计算装修造价。

**关键函数**：
```typescript
// 生成材料清单
generateMaterialsList(
  totalArea: number,
  machineCount: number,
  privateRoomCount: number,
  budgetLevel: 'economy' | 'standard' | 'premium'
): BudgetEstimate

// 生成造价报表
generateBudgetReport(estimate: BudgetEstimate): string
```

**造价计算公式**：
```
材料费 = Σ(材料单价 × 数量)
人工费 = 材料费 × 30%
预留费 = 材料费 × 10%
总造价 = 材料费 + 人工费 + 预留费
单位面积造价 = 总造价 / 总面积
```

**材料库**：
- 地面材料（防滑地板、地胶垫等）
- 墙面材料（隔音吸音板、装饰墙纸等）
- 灯光系统（RGB灯带、LED筒灯等）
- 家具（电竞椅、游戏桌、沙发等）
- 显示设备（显示器、大屏幕等）
- 空调通风系统
- 其他辅料和施工费

### 2.4 LLM集成模块 (llmIntegration.ts)

**职责**：集成LLM服务，实现指令理解和参数提取。

**关键函数**：
```typescript
// 理解用户指令
understandUserInstruction(
  instruction: string,
  currentDesign: Design
): InstructionParsing

// 提取参数变化
extractParameterChanges(
  instruction: string,
  currentParams: DesignParameters
): ParameterChanges
```

**指令理解流程**：
1. 用户输入修改指令
2. 调用LLM分析指令意图
3. 提取参数变化（面积、颜色、灯光等）
4. 验证参数合理性
5. 返回参数变化结果

**支持的指令类型**：
- 尺寸调整：增大/减小某个区域
- 颜色变更：改变主题颜色
- 灯光调整：增加/减少RGB灯带
- 风格切换：改成某种风格
- 预算调整：提高/降低预算

### 2.5 图像生成模块 (imageGeneration.ts)

**职责**：调用图像生成API，为设计方案生成效果图。

**关键函数**：
```typescript
// 生成效果图
generateRenderingImage(
  design: Design,
  area: 'hall' | 'bar' | 'vip' | 'gaming'
): Promise<RenderingImage>

// 批量生成效果图
generateRenderingsBatch(
  designs: Design[]
): Promise<RenderingImage[]>
```

**效果图生成流程**：
1. 根据设计参数生成详细提示词
2. 调用图像生成API
3. 获取生成的图像URL
4. 存储到S3
5. 保存到数据库

**提示词模板**：
```
A professional esports lounge interior design, {totalArea}㎡ space with {machineCount} gaming stations, 
{styleTheme} style, {colorScheme} color scheme, {rgbDensity} RGB lighting, 
high-quality rendering, 4K resolution, professional photography, 
featuring {coreAreas}, modern furniture, gaming setup, atmospheric lighting
```

## 3. 数据库设计

### 3.1 表结构

**users表**：
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**projects表**：
```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('draft', 'in_progress', 'completed', 'archived') DEFAULT 'draft',
  cadFileUrl VARCHAR(512),
  cadParameters JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

**designs表**：
```sql
CREATE TABLE designs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL,
  styleId VARCHAR(64),
  styleName VARCHAR(255),
  colorTheme VARCHAR(64),
  budgetRange ENUM('economy', 'standard', 'premium'),
  rgbDensity VARCHAR(64),
  parameters JSON,
  estimatedBudget DECIMAL(12, 2),
  status ENUM('draft', 'generating', 'completed', 'archived') DEFAULT 'draft',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id)
);
```

**renderings表**：
```sql
CREATE TABLE renderings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  designId INT NOT NULL,
  area VARCHAR(64),
  imageUrl VARCHAR(512),
  imageKey VARCHAR(255),
  status ENUM('pending', 'generating', 'completed', 'failed') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (designId) REFERENCES designs(id)
);
```

**iterations表**：
```sql
CREATE TABLE iterations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  designId INT NOT NULL,
  userInstruction TEXT,
  parameterChanges JSON,
  newDesignId INT,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (designId) REFERENCES designs(id),
  FOREIGN KEY (newDesignId) REFERENCES designs(id)
);
```

**materials表**：
```sql
CREATE TABLE materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  designId INT NOT NULL,
  name VARCHAR(255),
  category VARCHAR(64),
  quantity DECIMAL(10, 2),
  unit VARCHAR(32),
  unitPrice DECIMAL(10, 2),
  totalPrice DECIMAL(12, 2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (designId) REFERENCES designs(id)
);
```

### 3.2 索引优化

```sql
CREATE INDEX idx_projects_userId ON projects(userId);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_designs_projectId ON designs(projectId);
CREATE INDEX idx_designs_status ON designs(status);
CREATE INDEX idx_renderings_designId ON renderings(designId);
CREATE INDEX idx_iterations_designId ON iterations(designId);
CREATE INDEX idx_materials_designId ON materials(designId);
```

## 4. API设计

### 4.1 tRPC路由结构

```typescript
appRouter = {
  // 项目管理
  projects: {
    list: publicProcedure,
    create: protectedProcedure,
    get: protectedProcedure,
    update: protectedProcedure,
    delete: protectedProcedure,
    updateCADParameters: protectedProcedure,
  },
  
  // 设计方案
  designs: {
    list: protectedProcedure,
    get: protectedProcedure,
    create: protectedProcedure,
    generate: protectedProcedure,
    delete: protectedProcedure,
  },
  
  // 预算估算
  budget: {
    calculate: protectedProcedure,
    getMaterials: protectedProcedure,
    generateReport: protectedProcedure,
  },
  
  // 聊天迭代
  chat: {
    sendMessage: protectedProcedure,
    getHistory: protectedProcedure,
  },
  
  // 认证
  auth: {
    me: publicProcedure,
    logout: publicProcedure,
  },
}
```

### 4.2 API调用示例

**创建项目**：
```typescript
const project = await trpc.projects.create.useMutation({
  name: "绿树电竞馆装修设计",
  description: "2500㎡电竞馆，48个机位"
});
```

**上传CAD文件**：
```typescript
const result = await trpc.projects.updateCADParameters.useMutation({
  projectId: 1,
  cadFileUrl: "https://s3.../cad-file.dxf",
  cadParameters: {
    totalArea: 2500,
    machineCount: 48,
    privateRoomCount: 8
  }
});
```

**生成设计方案**：
```typescript
const designs = await trpc.designs.generate.useMutation({
  projectId: 1,
  colorTheme: "blue",
  budgetRange: "standard",
  rgbDensity: "medium"
});
```

**发送聊天消息**：
```typescript
const response = await trpc.chat.sendMessage.useMutation({
  designId: 1,
  message: "把吧台改大一点"
});
```

## 5. 前端架构

### 5.1 页面结构

```
App.tsx
├── Home.tsx (首页)
├── Dashboard.tsx (仪表板)
├── ProjectDetail.tsx (项目详情)
├── DesignGenerator.tsx (方案生成)
└── DesignDetail.tsx (方案详情+聊天)
```

### 5.2 组件组织

```
components/
├── ui/ (shadcn/ui组件)
├── DashboardLayout.tsx (仪表板布局)
├── AIChatBox.tsx (聊天组件)
├── Map.tsx (地图组件)
└── ...
```

### 5.3 状态管理

- 使用React Context管理全局状态
- 使用tRPC hooks管理服务器状态
- 使用React Query进行缓存和同步

## 6. 部署架构

### 6.1 开发环境
- 本地Node.js开发服务器
- 本地MySQL/SQLite数据库
- Vite热模块替换

### 6.2 生产环境
- Docker容器化部署
- Kubernetes编排
- CDN加速静态资源
- 数据库主从复制
- Redis缓存层

## 7. 安全设计

### 7.1 认证与授权
- 使用Manus OAuth进行用户认证
- JWT令牌管理会话
- protectedProcedure确保业务接口的权限控制

### 7.2 数据安全
- 所有敏感数据加密存储
- HTTPS传输加密
- SQL注入防护（使用参数化查询）
- XSS防护（React自动转义）

### 7.3 API安全
- 速率限制防止滥用
- 输入验证和清理
- CORS配置
- API密钥管理

## 8. 性能优化

### 8.1 前端优化
- 代码分割和懒加载
- 图片压缩和优化
- 缓存策略
- CDN加速

### 8.2 后端优化
- 数据库查询优化
- 缓存策略（Redis）
- 异步处理（Job Queue）
- 负载均衡

### 8.3 监控和日志
- 应用性能监控（APM）
- 错误追踪和报警
- 日志聚合分析
- 用户行为分析

## 9. 扩展性设计

### 9.1 模块化架构
- 服务模块独立部署
- 微服务化改造路径
- API版本管理

### 9.2 可扩展的数据模型
- 预留字段扩展空间
- JSON字段存储灵活数据
- 版本化API设计

---

**文档版本**：v1.0  
**最后更新**：2026年4月13日
