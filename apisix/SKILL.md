---
name: apisix
description: Apache Apisix API 网关操作。用于：(1) 管理 Apisix 路由 (2) 配置上游和服务 (3) 管理插件 (4) 流量管理和灰度发布。环境变量：APISIX_URL, APISIX_ADMIN_KEY
---

# Apisix Skill

## 配置

```bash
# ~/.openclaw/workspace/.env
APISIX_URL=https://apisix.example.com
APISIX_ADMIN_KEY=
```

## 常用地址

- Admin API: `http://your-apisix:9180` (旧版) 或 `/apisix/admin` (新版)
- Gateway: `http://your-apisix:9080`

## 获取 Admin Key

1. 检查 `config.yaml` 中的 `apisix.admin_key`
2. 或通过环境变量 `APISIX_ADMIN_API_KEY`

## 操作示例

### 路由管理

```bash
# 列出路由
curl -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  "$APISIX_URL/apisix/admin/routes"

# 创建路由
curl -X POST -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  "$APISIX_URL/apisix/admin/routes" \
  -d '{
    "id": "route-1",
    "uri": "/example",
    "name": "example-route",
    "upstream": {
      "type": "roundrobin",
      "nodes": {
        "127.0.0.1:8080": 1
      }
    }
  }'

# 获取单个路由
curl -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  "$APISIX_URL/apisix/admin/routes/route-1"

# 更新路由
curl -X PUT -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  "$APISIX_URL/apisix/admin/routes/route-1" \
  -d '{
    "uri": "/example",
    "upstream": {
      "nodes": {"127.0.0.1:8080": 1}
    }
  }'

# 删除路由
curl -X DELETE -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  "$APISIX_URL/apisix/admin/routes/route-1"
```

### 上游管理

```bash
# 列出上游
curl -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  "$APISIX_URL/apisix/admin/upstreams"

# 创建上游
curl -X POST -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  "$APISIX_URL/apisix/admin/upstreams" \
  -d '{
    "id": "upstream-1",
    "type": "roundrobin",
    "nodes": [
      {"host": "127.0.0.1", "port": 8080, "weight": 1},
      {"host": "127.0.0.1", "port": 8081, "weight": 1}
    ]
  }'

# 健康检查
curl -X POST -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  "$APISIX_URL/apisix/admin/upstreams" \
  -d '{
    "id": "upstream-with-healthcheck",
    "type": "roundrobin",
    "nodes": {"127.0.0.1:8080": 1},
    "checks": {
      "active": {
        "type": "http",
        "http_path": "/health",
        "healthy": {"interval": 2, "successes": 1},
        "unhealthy": {"interval": 1, "http_failures": 2}
      }
    }
  }'
```

### 服务管理

```bash
# 列出服务
curl -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  "$APISIX_URL/apisix/admin/services"

# 创建服务
curl -X POST -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  "$APISIX_URL/apisix/admin/services" \
  -d '{
    "id": "service-1",
    "upstream_id": "upstream-1",
    "plugins": {
      "rate-limiting": {
        "rate": 100,
        "burst": 50,
        "key": "remote_addr"
      }
    }
  }'
```

### 插件配置

```bash
# 常用插件

# 限流
curl -X POST -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  "$APISIX_URL/apisix/admin/routes" \
  -d '{
    "uri": "/limited",
    "plugins": {
      "limit-req": {
        "rate": 100,
        "burst": 50,
        "key": "remote_addr"
      }
    },
    "upstream": {"nodes": {"127.0.0.1:8080": 1}}
  }'

# 认证 (JWT)
curl -X POST -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  "$APISIX_URL/apisix/admin/routes" \
  -d '{
    "uri": "/protected",
    "plugins": {
      "jwt-auth": {"key": "user-key", "secret": "my-secret"}
    },
    "upstream": {"nodes": {"127.0.0.1:8080": 1}}
  }'

# 请求改写
curl -X POST -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  "$APISIX_URL/apisix/admin/routes" \
  -d '{
    "uri": "/api/*",
    "plugins": {
      "proxy-rewrite": {
        "uri": "/$uri",
        "headers": {
          "X-Api-Version": "v2"
        }
      }
    },
    "upstream": {"nodes": {"127.0.0.1:8080": 1}}
  }'
```

## 常用场景

1. **路由配置**: 创建 API 路由
2. **负载均衡**: 配置上游和节点
3. **限流熔断**: 使用 limit-*, circuit-breaker 插件
4. **认证授权**: jwt-auth, key-auth 等
5. **流量管理**: 灰度/Canary 发布

## 使用场景

### 场景 1: 创建 API 路由

将外部请求路由到后端服务：
```bash
source ~/.openclaw/workspace/.env

curl -X POST -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  "$APISIX_URL/apisix/admin/routes" \
  -d '{
    "id": "my-api-route",
    "uri": "/my-api/*",
    "name": "my-api",
    "upstream": {
      "type": "roundrobin",
      "nodes": {
        "backend-service:8080": 1
      }
    }
  }'
```

### 场景 2: 配置限流保护

防止 API 被恶意请求打挂：
```bash
source ~/.openclaw/workspace/.env

curl -X POST -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  "$APISIX_URL/apisix/admin/routes" \
  -d '{
    "uri": "/limited-api/*",
    "plugins": {
      "limit-req": {
        "rate": 100,
        "burst": 50,
        "key": "remote_addr"
      },
      "limit-count": {
        "count": 100,
        "time_window": 60,
        "key": "remote_addr"
      }
    },
    "upstream": {"nodes": {"backend:8080": 1}}
  }'
```

### 场景 3: 灰度发布

部分流量切换到新版本：
```bash
source ~/.openclaw/workspace/.env

# 创建新版本路由（带权重）
curl -X POST -H "X-API-KEY: $APISIX_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  "$APISIX_URL/apisix/admin/routes" \
  -d '{
    "id": "gray-release",
    "uri": "/api/*",
    "name": "api-gray",
    "priority": 100,
    "vars": [["http_x_canary_release", "v2"]],
    "upstream": {
      "type": "roundrobin",
      "nodes": {"new-backend:8080": 1}
    }
  }'
```

## 常用 API 端点

| 端点 | 说明 |
|------|------|
| `/apisix/admin/routes` | 路由管理 |
| `/apisix/admin/upstreams` | 上游管理 |
| `/apisix/admin/services` | 服务管理 |
| `/apisix/admin/consumer` | 消费者管理 |
| `/apisix/admin/plugin` | 插件配置 |

## 注意事项

- Admin API 默认需要通过 9180 端口或内部路由访问
- 生产环境建议开启 SSL 和访问控制
- 插件配置需要在对应路由/服务上启用
