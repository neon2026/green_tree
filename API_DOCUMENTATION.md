# 绿树电竞AI智能设计平台 - API文档

## 1. 概述

本文档描述了绿树电竞AI智能设计平台的所有API接口。所有API均通过tRPC框架实现，基于HTTP/WebSocket协议。

**基础URL**：`/api/trpc`  
**认证方式**：Manus OAuth + JWT令牌  
**响应格式**：JSON

## 2. 认证

### 2.1 登录流程
所有受保护的API调用都需要有效的JWT令牌。令牌通过Manus OAuth获取。

**获取登录URL**：
```typescript
import { getLoginUrl } from "@/const";
const loginUrl = getLoginUrl("/dashboard");
```

**处理OAuth回调**：
后端自动处理`/api/oauth/callback`，设置会话cookie。

### 2.2 检查认证状态
```typescript
const { user, loading } = useAuth();
```

## 3. 项目管理API

### 3.1 获取项目列表
**端点**：`projects.list`  
**方法**：GET  
**认证**：需要  
**参数**：无

**请求示例**：
```typescript
const { data: projects } = trpc.projects.list.useQuery();
```

**响应示例**：
```json
[
  {
    "id": 1,
    "name": "绿树电竞馆装修设计",
    "description": "2500㎡电竞馆，48个机位",
    "status": "in_progress",
    "createdAt": "2026-04-13T00:00:00Z",
    "updatedAt": "2026-04-13T12:00:00Z"
  }
]
```

### 3.2 创建项目
**端点**：`projects.create`  
**方法**：POST  
**认证**：需要  
**参数**：
- `name` (string, 必需) - 项目名称
- `description` (string, 可选) - 项目描述

**请求示例**：
```typescript
const { mutate: createProject } = trpc.projects.create.useMutation();
createProject({
  name: "新项目",
  description: "项目描述"
});
```

**响应示例**：
```json
{
  "id": 2,
  "name": "新项目",
  "description": "项目描述",
  "status": "draft",
  "createdAt": "2026-04-13T12:30:00Z"
}
```

### 3.3 获取项目详情
**端点**：`projects.get`  
**方法**：GET  
**认证**：需要  
**参数**：
- `projectId` (number, 必需) - 项目ID

**请求示例**：
```typescript
const { data: project } = trpc.projects.get.useQuery({ projectId: 1 });
```

**响应示例**：
```json
{
  "id": 1,
  "name": "绿树电竞馆装修设计",
  "description": "2500㎡电竞馆，48个机位",
  "status": "in_progress",
  "cadFileUrl": "https://s3.../cad-file.dxf",
  "cadParameters": {
    "totalArea": 2500,
    "machineCount": 48,
    "privateRoomCount": 8
  },
  "createdAt": "2026-04-13T00:00:00Z",
  "updatedAt": "2026-04-13T12:00:00Z"
}
```

### 3.4 更新项目
**端点**：`projects.update`  
**方法**：PUT  
**认证**：需要  
**参数**：
- `projectId` (number, 必需) - 项目ID
- `name` (string, 可选) - 新项目名称
- `description` (string, 可选) - 新项目描述
- `status` (string, 可选) - 新状态

**请求示例**：
```typescript
const { mutate: updateProject } = trpc.projects.update.useMutation();
updateProject({
  projectId: 1,
  name: "更新后的项目名",
  status: "completed"
});
```

### 3.5 删除项目
**端点**：`projects.delete`  
**方法**：DELETE  
**认证**：需要  
**参数**：
- `projectId` (number, 必需) - 项目ID

**请求示例**：
```typescript
const { mutate: deleteProject } = trpc.projects.delete.useMutation();
deleteProject({ projectId: 1 });
```

### 3.6 更新CAD参数
**端点**：`projects.updateCADParameters`  
**方法**：POST  
**认证**：需要  
**参数**：
- `projectId` (number, 必需) - 项目ID
- `cadFileUrl` (string, 可选) - CAD文件URL
- `cadParameters` (object, 必需) - CAD参数

**CAD参数结构**：
```typescript
{
  totalArea: number;           // 总面积（㎡）
  machineCount: number;        // 机位数
  privateRoomCount: number;    // 包间数
  barArea?: number;            // 吧台面积
  hallArea?: number;           // 大厅面积
  vipArea?: number;            // VIP区面积
}
```

**请求示例**：
```typescript
const { mutate: updateCAD } = trpc.projects.updateCADParameters.useMutation();
updateCAD({
  projectId: 1,
  cadFileUrl: "https://s3.../cad-file.dxf",
  cadParameters: {
    totalArea: 2500,
    machineCount: 48,
    privateRoomCount: 8
  }
});
```

## 4. 设计方案API

### 4.1 获取设计方案列表
**端点**：`designs.list`  
**方法**：GET  
**认证**：需要  
**参数**：
- `projectId` (number, 必需) - 项目ID

**请求示例**：
```typescript
const { data: designs } = trpc.designs.list.useQuery({ projectId: 1 });
```

**响应示例**：
```json
[
  {
    "id": 1,
    "projectId": 1,
    "styleId": "cyberpunk",
    "styleName": "赛博朋克",
    "colorTheme": "blue",
    "budgetRange": "standard",
    "rgbDensity": "high",
    "estimatedBudget": 450000,
    "status": "completed",
    "createdAt": "2026-04-13T12:00:00Z"
  }
]
```

### 4.2 获取设计方案详情
**端点**：`designs.get`  
**方法**：GET  
**认证**：需要  
**参数**：
- `designId` (number, 必需) - 设计方案ID

**请求示例**：
```typescript
const { data: design } = trpc.designs.get.useQuery({ designId: 1 });
```

**响应示例**：
```json
{
  "id": 1,
  "projectId": 1,
  "styleId": "cyberpunk",
  "styleName": "赛博朋克",
  "colorTheme": "blue",
  "budgetRange": "standard",
  "rgbDensity": "high",
  "parameters": {
    "totalArea": 2500,
    "machineCount": 48,
    "privateRoomCount": 8
  },
  "estimatedBudget": 450000,
  "status": "completed",
  "createdAt": "2026-04-13T12:00:00Z"
}
```

### 4.3 生成设计方案
**端点**：`designs.generate`  
**方法**：POST  
**认证**：需要  
**参数**：
- `projectId` (number, 必需) - 项目ID
- `colorTheme` (string, 必需) - 颜色主题（blue/purple/green/red/multi）
- `budgetRange` (string, 必需) - 预算等级（economy/standard/premium）
- `rgbDensity` (string, 必需) - RGB密度（low/medium/high）

**请求示例**：
```typescript
const { mutate: generateDesigns } = trpc.designs.generate.useMutation();
generateDesigns({
  projectId: 1,
  colorTheme: "blue",
  budgetRange: "standard",
  rgbDensity: "medium"
});
```

**响应示例**：
```json
[
  {
    "id": 1,
    "projectId": 1,
    "styleId": "cyberpunk",
    "styleName": "赛博朋克",
    "colorTheme": "blue",
    "budgetRange": "standard",
    "rgbDensity": "medium",
    "estimatedBudget": 450000,
    "status": "generating"
  },
  {
    "id": 2,
    "projectId": 1,
    "styleId": "futuristic",
    "styleName": "未来科技",
    "colorTheme": "blue",
    "budgetRange": "standard",
    "rgbDensity": "medium",
    "estimatedBudget": 480000,
    "status": "generating"
  }
]
```

### 4.4 删除设计方案
**端点**：`designs.delete`  
**方法**：DELETE  
**认证**：需要  
**参数**：
- `designId` (number, 必需) - 设计方案ID

**请求示例**：
```typescript
const { mutate: deleteDesign } = trpc.designs.delete.useMutation();
deleteDesign({ designId: 1 });
```

## 5. 预算估算API

### 5.1 计算预算
**端点**：`budget.calculate`  
**方法**：GET  
**认证**：需要  
**参数**：
- `designId` (number, 必需) - 设计方案ID

**请求示例**：
```typescript
const { data: budgetData } = trpc.budget.calculate.useQuery({ designId: 1 });
```

**响应示例**：
```json
{
  "estimate": {
    "totalMaterials": 350000,
    "laborCost": 105000,
    "contingency": 35000,
    "totalCost": 490000,
    "costPerSqm": 196,
    "materials": [
      {
        "id": "floor_1",
        "name": "防滑地板",
        "category": "地面",
        "quantity": 2500,
        "unit": "㎡",
        "unitPrice": 120,
        "totalPrice": 300000
      }
    ]
  },
  "report": "造价报表文本..."
}
```

### 5.2 获取材料清单
**端点**：`budget.getMaterials`  
**方法**：GET  
**认证**：需要  
**参数**：
- `designId` (number, 必需) - 设计方案ID

**请求示例**：
```typescript
const { data: materials } = trpc.budget.getMaterials.useQuery({ designId: 1 });
```

**响应示例**：
```json
[
  {
    "id": "floor_1",
    "name": "防滑地板",
    "category": "地面",
    "quantity": 2500,
    "unit": "㎡",
    "unitPrice": 120,
    "totalPrice": 300000
  },
  {
    "id": "lighting_1",
    "name": "RGB LED灯带",
    "category": "灯光",
    "quantity": 2000,
    "unit": "米",
    "unitPrice": 35,
    "totalPrice": 70000
  }
]
```

### 5.3 生成造价报表
**端点**：`budget.generateReport`  
**方法**：GET  
**认证**：需要  
**参数**：
- `designId` (number, 必需) - 设计方案ID

**请求示例**：
```typescript
const { data: report } = trpc.budget.generateReport.useQuery({ designId: 1 });
```

**响应示例**：
```
============================================================
电竞馆装修设计 - 造价估算报表
============================================================

材料清单
------------------------------------------------------------

地面
  防滑地板              2500.00 ㎡ @      120.00 =    300000.00

灯光
  RGB LED灯带           2000.00 米 @       35.00 =     70000.00

...

------------------------------------------------------------
材料费用总计:                          350000.00
人工费用 (30%):                        105000.00
预留费用 (10%):                         35000.00
------------------------------------------------------------
总造价:                                490000.00
单位面积造价:                          196.00/㎡
============================================================
```

## 6. 聊天迭代API

### 6.1 发送聊天消息
**端点**：`chat.sendMessage`  
**方法**：POST  
**认证**：需要  
**参数**：
- `designId` (number, 必需) - 设计方案ID
- `message` (string, 必需) - 用户消息

**请求示例**：
```typescript
const { mutate: sendMessage } = trpc.chat.sendMessage.useMutation();
sendMessage({
  designId: 1,
  message: "把吧台改大一点"
});
```

**响应示例**：
```json
{
  "userMessage": {
    "id": "msg_1",
    "role": "user",
    "content": "把吧台改大一点",
    "timestamp": "2026-04-13T12:30:00Z"
  },
  "assistantMessage": {
    "id": "msg_2",
    "role": "assistant",
    "content": "已理解您的指令。我将吧台面积从120㎡增加到150㎡，并重新调整周边布局。正在生成新的效果图...",
    "timestamp": "2026-04-13T12:30:05Z"
  },
  "newDesignId": 2,
  "status": "processing"
}
```

### 6.2 获取聊天历史
**端点**：`chat.getHistory`  
**方法**：GET  
**认证**：需要  
**参数**：
- `designId` (number, 必需) - 设计方案ID

**请求示例**：
```typescript
const { data: history } = trpc.chat.getHistory.useQuery({ designId: 1 });
```

**响应示例**：
```json
[
  {
    "id": "msg_1",
    "role": "user",
    "content": "把吧台改大一点",
    "timestamp": "2026-04-13T12:30:00Z"
  },
  {
    "id": "msg_2",
    "role": "assistant",
    "content": "已理解您的指令...",
    "timestamp": "2026-04-13T12:30:05Z"
  }
]
```

## 7. 认证API

### 7.1 获取当前用户信息
**端点**：`auth.me`  
**方法**：GET  
**认证**：不需要（返回null如果未登录）

**请求示例**：
```typescript
const { data: user } = trpc.auth.me.useQuery();
```

**响应示例**：
```json
{
  "id": 1,
  "openId": "user_123",
  "name": "张三",
  "email": "zhangsan@example.com",
  "role": "user",
  "createdAt": "2026-04-13T00:00:00Z"
}
```

### 7.2 登出
**端点**：`auth.logout`  
**方法**：POST  
**认证**：不需要

**请求示例**：
```typescript
const { mutate: logout } = trpc.auth.logout.useMutation();
logout();
```

**响应示例**：
```json
{
  "success": true
}
```

## 8. 错误处理

### 8.1 错误响应格式
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "未授权的访问"
  }
}
```

### 8.2 常见错误码
- `UNAUTHORIZED` - 未授权（需要登录）
- `FORBIDDEN` - 禁止访问（权限不足）
- `NOT_FOUND` - 资源不存在
- `BAD_REQUEST` - 请求参数错误
- `INTERNAL_SERVER_ERROR` - 服务器内部错误

## 9. 速率限制

- 认证用户：100请求/分钟
- 未认证用户：10请求/分钟
- 文件上传：10MB/请求

## 10. 版本控制

**当前版本**：v1.0  
**发布日期**：2026年4月13日

---

**最后更新**：2026年4月13日
