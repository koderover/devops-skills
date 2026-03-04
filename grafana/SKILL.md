---
name: grafana
description: Grafana 可视化和监控操作。用于：(1) 查询 Grafana 指标数据 (2) 管理仪表盘和数据源 (3) 创建和编辑图表 (4) 告警配置
---

# Grafana Skill

## 配置

```bash
# ~/.openclaw/workspace/.env
GRAFANA_URL=http://grafana.example.com:3000
GRAFANA_API_KEY=your-grafana-api-key
```

## 获取 API Key

1. 登录 Grafana
2. 点击左侧 "Configuration" → "API keys"
3. 点击 "Add API key"
4. 填写名称，选择 "Admin" 角色
5. 复制生成的 key

## 操作示例

```bash
source ~/.openclaw/workspace/.env
```

### 仪表盘操作

```bash
source ~/.openclaw/workspace/.env

# 获取所有仪表盘
curl -s -H "Authorization: Bearer $GRAFANA_API_KEY" \
  "$GRAFANA_URL/api/dashboards/uid/metrics"

# 获取仪表盘 by UID
curl -s -H "Authorization: Bearer $GRAFANA_API_KEY" \
  "$GRAFANA_URL/api/dashboards/uid/ DASHBOARD_UID"

# 创建仪表盘
curl -X POST -H "Authorization: Bearer $GRAFANA_API_KEY" \
  -H "Content-Type: application/json" \
  "$GRAFANA_URL/api/dashboards/db" \
  -d '{
    "dashboard": {
      "title": "My Dashboard",
      "panels": []
    },
    "folderId": 0,
    "overwrite": false
  }'
```

### 数据源操作

```bash
source ~/.openclaw/workspace/.env

# 列出数据源
curl -s -H "Authorization: Bearer $GRAFANA_API_KEY" \
  "$GRAFANA_URL/api/datasources"

# 查询数据源健康状态
curl -s -H "Authorization: Bearer $GRAFANA_API_KEY" \
  "$GRAFANA_URL/api/datasources/ UID/health"
```

### 告警操作

```bash
source ~/.openclaw/workspace/.env

# 列出告警规则
curl -s -H "Authorization: Bearer $GRAFANA_API_KEY" \
  "$GRAFANA_URL/api/ruler/grafana/api/rules"

# 创建告警规则
curl -X POST -H "Authorization: Bearer $GRAFANA_API_KEY" \
  -H "Content-Type: application/json" \
  "$GRAFANA_URL/api/ruler/grafana/api/rules/NAMESPACE" \
  -d '{
    "name": "Alert Rule",
    "interval": "1m",
    "conditions": [...]
  }'
```

### 查询指标

```bash
source ~/.openclaw/workspace/.env

# 通过 Prometheus 数据源查询
curl -X POST -H "Authorization: Bearer $GRAFANA_API_KEY" \
  -H "Content-Type: application/json" \
  "$GRAFANA_URL/api/ds/query" \
  -d '{
    "queries": [{
      "refId": "A",
      "expr": "up",
      "datasourceId": 1
    }],
    "from": "now-1h",
    "to": "now"
  }'
```

## 常用场景

1. **查看仪表盘**: 获取监控视图
2. **查询指标**: 通过 PromQL 查询数据
3. **创建告警**: 设置告警规则通知
4. **管理数据源**: 配置 Prometheus/InfluxDB 等

## 使用场景

### 场景 1: 获取监控仪表盘数据

查看服务健康状态：
```bash
source ~/.openclaw/workspace/.env

# 获取仪表盘 UID
DASHBOARD_UID=$(curl -s -H "Authorization: Bearer $GRAFANA_API_KEY" \
  "$GRAFANA_URL/api/search?type=dashboards&query=service-health" | \
  jq -r '.[0].uid')

# 获取仪表盘数据
curl -s -H "Authorization: Bearer $GRAFANA_API_KEY" \
  "$GRAFANA_URL/api/dashboards/uid/$DASHBOARD_UID" | \
  jq '.dashboard.panels[] | {title, type, id}'
```

### 场景 2: 查询实时指标

通过 Prometheus 查询当前 QPS：
```bash
source ~/.openclaw/workspace/.env

curl -X POST -H "Authorization: Bearer $GRAFANA_API_KEY" \
  -H "Content-Type: application/json" \
  "$GRAFANA_URL/api/ds/query" \
  -d '{
    "queries": [{
      "refId": "A",
      "expr": "rate(http_requests_total[5m])",
      "datasourceId": 1,
      "queryType": ""
    }],
    "from": "now-5m",
    "to": "now"
  }' | jq '.results.A.frames[0].data.values'
```

### 场景 3: 创建服务告警

当错误率超过阈值时发送告警：
```bash
source ~/.openclaw/workspace/.env

curl -X POST -H "Authorization: Bearer $GRAFANA_API_KEY" \
  -H "Content-Type: application/json" \
  "$GRAFANA_URL/api/ruler/grafana/api/rules/production" \
  -d '{
    "name": "Service Alerts",
    "interval": "1m",
    "rules": [
      {
        "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) > 0.05",
        "alert": "High Error Rate",
        "for": "2m",
        "labels": {"severity": "critical"},
        "annotations": {
          "summary": "错误率超过 5%",
          "description": "当前错误率: {{ $value }}"
        }
      }
    ]
  }'
```

## 常用 API 端点

| 端点 | 说明 |
|------|------|
| `/api/dashboards` | 仪表盘管理 |
| `/api/datasources` | 数据源管理 |
| `/api/search` | 搜索资源 |
| `/api/alerts` | 告警列表 |
| `/api/ruler/` | 告警规则 |

## 注意事项

- Grafana API 需要 Admin 权限才能创建/修改
- 部分 API 需要 Grafana 10.0+ 版本
- Query API 需要知道数据源 ID
