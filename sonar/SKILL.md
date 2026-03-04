---
name: sonar
description: SonarQube 代码质量平台操作。用于：(1) 查询代码质量报告 (2) 分析项目质量 gate 状态 (3) 管理质量规则 (4) 查看代码热点和漏洞
---

# SonarQube Skill

## 配置

```bash
# ~/.openclaw/workspace/.env
SONAR_URL=http://sonar.example.com:9000
SONAR_TOKEN=your-sonar-token
```

## 获取 Token

1. 登录 SonarQube
2. 点击右上角头像 → "My Account"
3. 左侧选择 "Security"
4. 在 "Generate Tokens" 部分输入名称生成
5. 复制生成的 token

**注意：** SonarQube 9.0+ 使用 token 作为用户名，密码为空：
```bash
# 认证方式: username=token, password为空
curl -u "$SONAR_TOKEN:" "$SONAR_URL/api/projects/search"
```

## 操作示例

```bash
source ~/.openclaw/workspace/.env
```

### 项目操作

```bash
source ~/.openclaw/workspace/.env

# 获取项目列表
curl -s -u "$SONAR_TOKEN:" \
  "$SONAR_URL/api/projects/search?projects=PROJECT_KEY"

# 获取项目质量数据
curl -s -u "$SONAR_TOKEN:" \
  "$SONAR_URL/api/measures/component?component=PROJECT_KEY&metricKeys=bugs,vulnerabilities,code_smells,coverage"
```

### 代码质量 Gate

```bash
source ~/.openclaw/workspace/.env

# 获取项目的 Quality Gate 状态
curl -s -u "$SONAR_TOKEN:" \
  "$SONAR_URL/api/qualitygates/project_status?project=PROJECT_KEY"

# 响应示例
# {
#   "projectStatus": {
#     "status": "OK",  // 或 "ERROR", "WARN"
#     "conditions": [
#       {"metric": "new_bugs", "status": "OK", "threshold": "0"},
#       {"metric": "new_vulnerabilities", "status": "ERROR", ...}
#     ]
#   }
# }
```

### 代码问题

```bash
source ~/.openclaw/workspace/.env

# 获取 Issues
curl -s -u "$SONAR_TOKEN:" \
  "$SONAR_URL/api/issues/search?projects=PROJECT_KEY&status=OPEN&types=BUG"

# 获取代码热点（Hotspots）
curl -s -u "$SONAR_TOKEN:" \
  "$SONAR_URL/api/hotspots/search?project=PROJECT_KEY"
```

### 代码度量

```bash
source ~/.openclaw/workspace/.env

# 获取所有度量指标
curl -s -u "$SONAR_TOKEN:" \
  "$SONAR_URL/api/metrics/search"

# 获取代码行数
curl -s -u "$SONAR_TOKEN:" \
  "$SONAR_URL/api/measures/component?component=PROJECT_KEY&metricKeys=ncloc,lines"
```

### 触发扫描

```bash
source ~/.openclaw/workspace/.env

# 通过 Sonar Scanner 触发扫描
sonar-scanner \
  -Dsonar.projectKey=PROJECT_KEY \
  -Dsonar.sources=./src \
  -Dsonar.host.url=$SONAR_URL \
  -Dsonar.token=$SONAR_TOKEN
```

### Webhooks

```bash
source ~/.openclaw/workspace/.env

# 创建 Webhook（管理员）
curl -X POST -u "$SONAR_TOKEN:" \
  -H "Content-Type: application/json" \
  "$SONAR_URL/api/webhooks/create" \
  -d '{
    "name": "CI Webhook",
    "url": "https://your-callback.com/sonar",
    "secret": "optional-secret"
  }'
```

## 常用场景

1. **质量检查**: 查看项目是否通过质量 gate
2. **Bug 追踪**: 列出代码中的 bug 和漏洞
3. **代码覆盖**: 查看测试覆盖率
4. **热点审查**: 识别安全热点

## 使用场景

### 场景 1: CI/CD 质量门禁

在部署前检查代码质量是否达标：
```bash
source ~/.openclaw/workspace/.env

# 获取质量 gate 状态
GATE_STATUS=$(curl -s -u "$SONAR_TOKEN:" \
  "$SONAR_URL/api/qualitygates/project_status?project=my-app" | \
  jq -r '.projectStatus.status')

if [ "$GATE_STATUS" != "OK" ]; then
  echo "质量门禁未通过！"
  # 获取失败原因
  curl -s -u "$SONAR_TOKEN:" \
    "$SONAR_URL/api/qualitygates/project_status?project=my-app" | \
    jq '.projectStatus.conditions[] | select(.status != "OK")'
  exit 1
fi
echo "质量检查通过，可以部署"
```

### 场景 2: 统计代码质量趋势

获取项目代码度量：
```bash
source ~/.openclaw/workspace/.env

# 获取关键指标
curl -s -u "$SONAR_TOKEN:" \
  "$SONAR_URL/api/measures/component?component=my-app&metricKeys=bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density" | \
  jq '.component.measures[] | {metric: .metric, value: .value}'
```

### 场景 3: 自动修复问题

获取需要修复的问题列表：
```bash
source ~/.openclaw/workspace/.env

# 获取新出现的 Bug
curl -s -u "$SONAR_TOKEN:" \
  "$SONAR_URL/api/issues/search?projects=my-app&types=BUG&status=OPEN&sinceLeakPeriod=true" | \
  jq '.issues[] | {key: .key, message: .message, file: .component}'
```

## 常用 API

| API | 说明 |
|-----|------|
| `/api/projects/search` | 项目列表 |
| `/api/qualitygates/project_status` | 质量 gate 状态 |
| `/api/issues/search` | 问题列表 |
| `/api/measures/component` | 代码度量 |
| `/api/hotspots/search` | 安全热点 |

## 注意事项

- Token 需要有对应项目权限
- 新版 SonarQube (10.0+) API 可能有变化
- 某些 API 需要管理员权限
