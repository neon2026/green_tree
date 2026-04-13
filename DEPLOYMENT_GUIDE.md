# 绿树电竞AI智能设计平台 - 部署和使用指南

## 1. 快速开始

### 1.1 开发环境设置

**前置要求**：
- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL 8.0+ 或 TiDB

**安装依赖**：
```bash
cd /home/ubuntu/lvshu-ai-design
pnpm install
```

**配置环境变量**：
```bash
# 复制示例环境文件
cp .env.example .env.local

# 编辑 .env.local，配置以下变量：
# DATABASE_URL=mysql://user:password@localhost:3306/lvshu_design
# VITE_APP_ID=your_app_id
# OAUTH_SERVER_URL=https://api.manus.im
# VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
```

**初始化数据库**：
```bash
# 生成迁移文件
pnpm drizzle-kit generate

# 执行迁移
pnpm drizzle-kit migrate
```

**启动开发服务器**：
```bash
# 启动前端和后端
pnpm dev

# 访问 http://localhost:3000
```

### 1.2 构建生产版本

```bash
# 构建应用
pnpm build

# 启动生产服务器
pnpm start
```

## 2. 功能使用指南

### 2.1 创建新项目

1. 登录平台
2. 点击"我的项目"进入仪表板
3. 点击"新建项目"按钮
4. 输入项目名称和描述
5. 点击"创建"

### 2.2 上传CAD平面图

1. 进入项目详情页面
2. 点击"上传CAD平面图"
3. 选择本地DWG或DXF文件
4. 系统自动解析并显示参数
5. 可手动调整参数（面积、机位数、包间数等）
6. 点击"确认参数"

**支持的文件格式**：
- DWG（AutoCAD绘图文件）
- DXF（绘图交换格式）

**文件大小限制**：
- 最大10MB

### 2.3 生成设计方案

1. 进入项目详情页面，点击"生成设计方案"
2. 选择颜色主题：
   - 蓝色系 - 科技感强
   - 紫色系 - 神秘感
   - 绿色系 - 清爽感
   - 红色系 - 热烈感
   - 多彩 - 丰富多样
3. 选择预算等级：
   - 经济版 - 基础配置，成本控制
   - 标准版 - 性价比最优（推荐）
   - 高端版 - 顶级材料，豪华配置
4. 选择RGB灯光密度：
   - 低密度 - 简约灯光
   - 中密度 - 均衡搭配（推荐）
   - 高密度 - 炫彩灯带
5. 点击"生成5-10种方案"
6. 等待方案生成完成

**预期生成时间**：
- 方案生成：30秒
- 效果图渲染：60秒/个

### 2.4 查看和对比方案

1. 生成完成后，点击方案卡片查看详情
2. 可查看该方案的：
   - 效果图（大厅、吧台、VIP包间、游戏区）
   - 设计参数
   - 预估造价
   - 材料清单
3. 点击"对比"按钮可并排对比不同方案

### 2.5 聊天式方案迭代

1. 进入方案详情页面
2. 在右侧聊天框输入修改指令，例如：
   - "把吧台改大一点"
   - "加更多RGB灯带"
   - "改成紫色主题"
   - "增加VIP包间数量"
   - "降低预算"
3. 按Enter发送指令
4. AI理解指令并更新方案
5. 查看更新后的效果图
6. 重复迭代直到满意

**支持的指令类型**：
- 尺寸调整：增大/减小某个区域
- 颜色变更：改变主题颜色
- 灯光调整：增加/减少RGB灯带
- 风格切换：改成某种风格
- 预算调整：提高/降低预算

### 2.6 查看预算和材料清单

1. 进入方案详情页面
2. 点击"预算估算"标签
3. 可查看：
   - 材料清单（按分类展示）
   - 材料费用
   - 人工费用
   - 预留费用
   - 总造价
   - 单位面积造价
4. 点击"下载报表"可导出PDF格式

### 2.7 下载交付包

1. 进入已完成的方案详情
2. 点击"下载交付包"按钮
3. 选择要下载的文件类型：
   - ☑ 效果图（JPG/PNG）
   - ☑ 施工图（DWG/PDF）
   - ☑ 材料清单（Excel/PDF）
   - ☑ 造价报表（PDF）
4. 点击"打包下载"
5. 文件将自动打包为ZIP文件

**打包内容**：
```
项目名_风格名_日期.zip
├── renderings/
│   ├── hall.jpg
│   ├── bar.jpg
│   ├── vip.jpg
│   └── gaming.jpg
├── constructions/
│   ├── plan.dwg
│   └── plan.pdf
├── materials.xlsx
└── budget_report.pdf
```

## 3. 管理员功能

### 3.1 用户管理

**查看用户列表**：
- 进入管理后台
- 点击"用户管理"
- 可查看所有用户的信息和活动记录

**禁用/启用用户**：
- 在用户列表中选择用户
- 点击"禁用"或"启用"按钮

### 3.2 项目管理

**查看所有项目**：
- 进入管理后台
- 点击"项目管理"
- 可查看所有用户的项目

**删除项目**：
- 选择项目
- 点击"删除"按钮
- 项目将被软删除（可恢复）

### 3.3 系统设置

**配置材料库**：
- 进入管理后台
- 点击"系统设置"
- 点击"材料库管理"
- 可添加、编辑、删除材料

**配置风格库**：
- 进入管理后台
- 点击"系统设置"
- 点击"风格库管理"
- 可添加、编辑、删除风格

## 4. 故障排查

### 4.1 常见问题

**Q: 上传CAD文件失败**
A: 
- 检查文件格式是否为DWG或DXF
- 检查文件大小是否超过10MB
- 尝试用AutoCAD重新保存文件

**Q: 方案生成很慢**
A:
- 检查网络连接
- 检查服务器资源使用情况
- 尝试减少生成方案数量

**Q: 效果图质量不好**
A:
- 检查CAD参数是否正确
- 尝试调整RGB灯光密度
- 尝试选择不同的颜色主题

**Q: 聊天指令没有被理解**
A:
- 使用更清晰的指令表述
- 参考提供的指令示例
- 尝试直接编辑参数而不是使用自然语言

### 4.2 错误日志

**查看错误日志**：
```bash
# 查看开发服务器日志
tail -f .manus-logs/devserver.log

# 查看浏览器控制台日志
tail -f .manus-logs/browserConsole.log

# 查看网络请求日志
tail -f .manus-logs/networkRequests.log
```

**常见错误**：
- `UNAUTHORIZED` - 需要重新登录
- `NOT_FOUND` - 资源不存在，检查项目ID或方案ID
- `BAD_REQUEST` - 请求参数错误，检查参数格式
- `INTERNAL_SERVER_ERROR` - 服务器错误，查看服务器日志

## 5. 性能优化

### 5.1 前端优化

**启用缓存**：
```typescript
// 使用React Query缓存
const { data } = trpc.projects.list.useQuery(undefined, {
  staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
});
```

**代码分割**：
```typescript
// 使用React.lazy进行路由级代码分割
const DesignDetail = React.lazy(() => import('./pages/DesignDetail'));
```

### 5.2 后端优化

**数据库查询优化**：
```typescript
// 使用索引
CREATE INDEX idx_projects_userId ON projects(userId);

// 使用分页
const projects = await db.query(
  'SELECT * FROM projects WHERE userId = ? LIMIT 10 OFFSET ?',
  [userId, offset]
);
```

**缓存策略**：
```typescript
// 使用Redis缓存热点数据
const cachedDesigns = await redis.get(`designs:${projectId}`);
if (!cachedDesigns) {
  const designs = await db.query(...);
  await redis.set(`designs:${projectId}`, JSON.stringify(designs), 'EX', 3600);
}
```

## 6. 安全建议

### 6.1 数据安全

- 定期备份数据库
- 启用数据库加密
- 使用强密码
- 启用两因素认证

### 6.2 API安全

- 启用HTTPS
- 配置CORS
- 实施速率限制
- 验证所有输入

### 6.3 用户隐私

- 遵守GDPR和其他隐私法规
- 加密敏感数据
- 提供数据导出功能
- 提供账户删除功能

## 7. 备份和恢复

### 7.1 备份数据库

```bash
# MySQL备份
mysqldump -u user -p database_name > backup.sql

# 恢复备份
mysql -u user -p database_name < backup.sql
```

### 7.2 备份文件存储

```bash
# 备份S3存储的文件
aws s3 sync s3://bucket-name ./backup/

# 恢复备份
aws s3 sync ./backup/ s3://bucket-name
```

## 8. 监控和告警

### 8.1 应用监控

- 监控API响应时间
- 监控错误率
- 监控用户活动
- 监控资源使用情况

### 8.2 告警规则

- 响应时间 > 5秒
- 错误率 > 1%
- CPU使用率 > 80%
- 内存使用率 > 80%
- 磁盘使用率 > 90%

## 9. 升级和维护

### 9.1 升级依赖

```bash
# 检查过期依赖
pnpm outdated

# 更新依赖
pnpm update

# 更新主要版本
pnpm update --latest
```

### 9.2 数据库迁移

```bash
# 生成新的迁移文件
pnpm drizzle-kit generate

# 查看待执行的迁移
pnpm drizzle-kit migrate --dry-run

# 执行迁移
pnpm drizzle-kit migrate
```

## 10. 支持和反馈

### 10.1 获取帮助

- 查看在线文档：https://docs.example.com
- 联系技术支持：support@example.com
- 提交问题：https://github.com/example/issues

### 10.2 反馈和建议

- 功能建议：feedback@example.com
- 报告bug：bugs@example.com
- 安全问题：security@example.com

---

**文档版本**：v1.0  
**最后更新**：2026年4月13日
