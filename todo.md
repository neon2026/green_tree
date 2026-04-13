# 绿树电竞AI智能设计平台 - 项目TODO

## 核心功能模块

### 1. CAD平面图解析模块
- [x] DWG/DXF文件上传接口（ProjectDetail页面）
- [x] CAD文件解析引擎（cadParser服务）
- [x] 空间参数提取与验证
- [x] 解析结果可视化展示
- [x] 参数手动调整功能（updateCADParameters接口）
- [x] 路由参数验证修复（修复项目详情页面NaN错误）

### 2. 智能风格方案生成模块
- [x] 风格库定义（8种风格：赛博朋克、未来科技、暗黑竞技等）
- [x] 基于参数的方案生成算法（designGenerator服务）
- [x] 颜色主题选择器（DesignGenerator页面）
- [x] 预算区间配置
- [x] 5-10种方案自动生成

### 3. 室内效果图渲染模块
- [ ] 效果图生成API集成（待集成LLM）
- [x] 多区域效果图框架（DesignDetail页面）
- [ ] RGB灯带、吧台、包间、大厅等核心区域渲染（待实现）
- [ ] 批量生成多风格效果图（待实现）
- [ ] JPG/PNG格式输出（待实现）

### 4. 聊天式方案迭代模块
- [x] 聊天界面UI组件（DesignDetail页面）
- [ ] 用户指令解析与理解（待集成LLM）
- [ ] 局部修改重绘逻辑（待实现）
- [ ] 实时效果图更新（待实现）
- [x] 修改历史记录（iterations表）

### 5. 交付包输出模块
- [ ] 效果图导出（JPG/PNG）（待实现）
- [ ] 施工图生成（DWG格式）（待实现）
- [ ] 施工图导出（PDF格式）（待实现）
- [x] 材料清单生成（budgetCalculator服务）
- [x] 造价估算表生成（generateBudgetReport函数）
- [ ] 打包下载功能（待实现）

### 6. 项目管理功能
- [x] 项目创建与保存（projects路由）
- [x] 项目列表展示（Dashboard页面）
- [x] 历史版本管理（designs表）
- [ ] 方案对比功能（待实现）
- [x] 项目删除与恢复（deleteProject接口）

### 7. 预算估算模块
- [x] 材料库建立（budgetCalculator服务）
- [x] 材料档次配置（economy/standard/premium）
- [x] 自动造价计算（generateMaterialsList函数）
- [x] 造价调整与预览（budget路由）
- [x] 造价报表生成（generateBudgetReport函数）

### 8. 用户认证与授权
- [x] OAuth登录流程实现（Manus内置）
- [ ] 用户信息管理（资料查看/编辑）（待实现）
- [x] 权限控制（所有业务路由使用protectedProcedure）

### 9. 前端UI与交互
- [x] 优雅精致的设计系统（深色主题+翠绿点缀）
- [x] 响应式布局（所有页面）
- [x] 加载状态与反馈
- [x] 错误处理与提示

### 10. 数据库与存储
- [x] 用户表设计（users）
- [x] 项目表设计（projects）
- [x] 方案表设计（designs）
- [x] 效果图存储（renderings表）
- [x] 施工图存储（constructions表）
- [x] 材料清单存储（materials表）
- [x] 材料库存储（material_library表）
- [x] 迭代记录存储（iterations表）

## 技术集成
- [ ] LLM集成（方案生成、指令理解）（待实现）
- [ ] 图像生成API集成（效果图渲染）（待实现）
- [x] CAD解析库框架（cadParser服务框架）
- [x] S3存储集成（模板已提供）
- [ ] 支付/计费模块（可选）

## 测试与质量保证
- [x] 单元测试编写（18个测试用例）
  - [x] designGenerator.test.ts（7个测试）
  - [x] budgetCalculator.test.ts（10个测试）
  - [x] auth.logout.test.ts（1个测试）
- [ ] 集成测试编写（待实现）
- [ ] 功能测试（待实现）
- [ ] 性能测试（待实现）
- [ ] 安全测试（待实现）

## 文档与交付
- [ ] 产品需求文档（PRD）（待编写）
- [ ] 技术架构文档（待编写）
- [ ] API文档（待编写）
- [ ] 用户使用手册（待编写）
- [ ] 部署指南（待编写）

## 已完成的关键里程碑
✅ 数据库架构设计和迁移
✅ 后端核心服务实现（CAD解析、设计生成、预算计算）
✅ tRPC路由完整实现
✅ 前端页面框架（首页、仪表板、项目详情、设计生成、设计详情）
✅ 单元测试编写和通过
✅ UI/UX设计（优雅精致的深色主题）

## 待实现的关键功能
⏳ LLM集成（聊天式迭代、指令理解）
⏳ 图像生成API集成（效果图渲染）
⏳ 文件导出功能（DWG、PDF、JPG等）
⏳ 方案对比功能
⏳ 用户资料管理

## Bug修复与功能增强

### CAD文件格式支持扩展
- [x] 支持JPG/PNG格式的平面图上传（ProjectDetail页面）
- [x] 图片格式平面图的OCR识别框架（parseImageFloorPlan函数）
- [x] 图片转换为可编辑参数的逻辑（不同格式调用不同的解析器）
- [x] 前端上传组件支持多格式（accept=.dwg,.dxf,.jpg,.jpeg,.png）
- [x] 后端文件类型验证更新（parseCADFile根据文件扩展名判断）
