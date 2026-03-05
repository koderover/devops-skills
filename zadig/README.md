# Zadig DevOps Platform Skill

Zadig 是面向云原生应用的 DevOps 平台。这个 Skill 提供了 Zadig OpenAPI 的完整客户端实现。

## 环境变量

在 `~/.openclaw/workspace/.env` 中配置：

```bash
# 必填
ZADIG_API_URL=https://your-zadig.example.com
ZADIG_API_KEY=your-jwt-token

# 可选
ZADIG_DEFAULT_PROJECT=your-project
ZADIG_DEFAULT_ENV=dev
```

## 获取 API Token

1. 登录 Zadig 平台
2. 点击右上角用户头像 → `账号设置`
3. 复制 API Token

## 核心功能

| 模块 | 功能 |
|------|------|
| 项目 | 列表/获取/创建/删除 |
| 工作流 | 列表/触发/查询/取消/重试/审批 |
| 环境 | 列表/获取/创建/更新/删除测试和生产环境 |
| 服务 | 列表/获取服务、更新镜像、扩缩容、重启 |
| 构建 | 列表/获取/创建/更新/删除 |
| 测试 | 触发测试、获取测试报告 |
| 代码扫描 | 触发扫描、获取扫描结果 |
| 发布 | 版本管理、发布计划 |
| 镜像仓库 | 列表/创建/更新仓库 |
| 用户 & 权限 | 用户管理、角色、角色绑定 |
| 统计 | 构建/部署/测试/发布统计 |
| 日志 | 容器日志、工作流日志 |

## 使用示例

```javascript
const zadig = require('./skills/zadig');

// 列出项目
const { projects } = await zadig.listProjects();

// 触发工作流
await zadig.triggerWorkflow({
  projectKey: 'yaml',
  workflowKey: 'build',
  inputs: [...]
});

// ===== 便捷方法 =====

// 获取服务状态（一步到位）
const status = await zadig.getServiceStatus({
  projectKey: 'yaml',
  envName: 'dev',
  serviceName: 'service1'
});
/* 返回:
{
  service_name: 'service1',
  env_name: 'dev',
  status: 'Running',
  image: 'koderover.tencentcloudcr.com/test/service1:xxx',
  pod_name: 'service1-xxx-xxx',
  node: '172.16.64.16',
  ip: '172.16.64.132',
  ports: [{ containerPort: 20221, protocol: 'TCP' }],
  service_endpoints: [{ name: 'service1', service_port: 20221, node_port: 31331 }]
}
*/

// 获取服务日志（同步返回文本）
const logs = await zadig.getServiceLogsSync({
  projectKey: 'yaml',
  envName: 'dev',
  serviceName: 'service1',
  tailLines: 100
});

// 获取工作流任务状态
const task = await zadig.getWorkflowTask({
  projectKey: 'yaml',
  workflowKey: 'dev-build',
  taskId: 67
});
```

## 主要 API 方法

### 项目
- `listProjects()` - 获取项目列表
- `getProject(projectKey)` - 获取项目详情
- `createProject(params)` - 创建项目
- `deleteProject(projectKey)` - 删除项目

### 工作流
- `listWorkflows(projectKey)` - 获取工作流列表
- `triggerWorkflow(params)` - 触发工作流
- `getWorkflowTask(params)` - 获取任务状态
- `cancelWorkflowTask(params)` - 取消任务
- `retryWorkflowTask(params)` - 重试任务
- `approveWorkflow(params)` - 审批任务

### 环境 & 服务
- `listEnvironments(projectKey)` - 获取测试环境列表
- `listProductionEnvironments(projectKey)` - 获取生产环境列表
- `getEnvironment(projectKey, envName)` - 获取环境详情
- `getServiceStatus(params)` - 获取服务状态（含 endpoint）
- `updateDeploymentImage(params)` - 更新部署镜像
- `restartService(params)` - 重启服务
- `scaleService(params)` - 扩缩容

### 日志
- `getServiceLogsSync(params)` - 获取服务日志（同步）
- `getContainerLogs(params)` - 获取容器日志
- `getWorkflowTaskLogs(params)` - 获取工作流任务日志

## 相关文档

- [SKILL.md](./SKILL.md) - Agent 使用说明
- [Zadig 官方文档](https://docs.koderover.com) - OpenAPI 规范
