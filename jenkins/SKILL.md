---
name: jenkins
description: Jenkins CI/CD 操作。用于：(1) 触发 Jenkins 任务构建 (2) 查询任务状态和构建历史 (3) 获取构建日志 (4) 操作 Jenkins 节点和配置
---

# Jenkins Skill

## 配置

```bash
# ~/.openclaw/workspace/.env
JENKINS_URL=http://jenkins.example.com:8080
JENKINS_USER=admin
JENKINS_TOKEN=your-api-token
```

## 获取 Token

1. 登录 Jenkins
2. 点击右上角用户名 → Configure
3. 在 "API Token" 部分点击 "Add new Token"
4. 复制生成的 token

## 操作示例

```bash
source ~/.openclaw/workspace/.env
```

### 触发构建

```bash
source ~/.openclaw/workspace/.env

# 带参数构建
curl -X POST "$JENKINS_URL/job/JOB_NAME/buildWithParameters" \
  -u "$JENKINS_USER:$JENKINS_TOKEN" \
  -d "PARAM1=value1&PARAM2=value2"

# 普通构建
curl -X POST "$JENKINS_URL/job/JOB_NAME/build" \
  -u "$JENKINS_USER:$JENKINS_TOKEN"
```

### 查询任务状态

```bash
source ~/.openclaw/workspace/.env

# 获取任务列表
curl -s "$JENKINS_URL/api/json?tree=jobs[name,url,color]" \
  -u "$JENKINS_USER:$JENKINS_TOKEN" | jq '.jobs[]'

# 获取任务详情
curl -s "$JENKINS_URL/job/JOB_NAME/api/json" \
  -u "$JENKINS_USER:$JENKINS_TOKEN"

# 获取最后一次构建状态
curl -s "$JENKINS_URL/job/JOB_NAME/lastBuild/api/json" \
  -u "$JENKINS_USER:$JENKINS_TOKEN"
```

### 获取构建日志

```bash
source ~/.openclaw/workspace/.env

# 控制台输出
curl -s "$JENKINS_URL/job/JOB_NAME/BUILD_NUMBER/consoleText" \
  -u "$JENKINS_USER:$JENKINS_TOKEN"

# JSON 格式日志
curl -s "$JENKINS_URL/job/JOB_NAME/BUILD_NUMBER/logText/progressiveText" \
  -u "$JENKINS_USER:$JENKINS_TOKEN"
```

### 停止/重启构建

```bash
source ~/.openclaw/workspace/.env

# 停止构建
curl -X POST "$JENKINS_URL/job/JOB_NAME/BUILD_NUMBER/stop" \
  -u "$JENKINS_USER:$JENKINS_TOKEN"

# 禁用任务
curl -X POST "$JENKINS_URL/job/JOB_NAME/disable" \
  -u "$JENKINS_USER:$JENKINS_TOKEN"

# 启用任务
curl -X POST "$JENKINS_URL/job/JOB_NAME/enable" \
  -u "$JENKINS_USER:$JENKINS_TOKEN"
```

## 常用场景

1. **触发构建**: 传入参数启动构建任务
2. **查看状态**: 检查构建是否成功
3. **获取日志**: 查看构建失败原因
4. **查询历史**: 查看历史构建记录

## 使用场景

### 场景 1: 触发构建并等待结果

触发 CI 流水线并等待完成：
```bash
source ~/.openclaw/workspace/.env

# 触发构建
BUILD_URL=$(curl -s -X POST "$JENKINS_URL/job/deploy-prod/buildWithParameters" \
  -u "$JENKINS_USER:$JENKINS_TOKEN" \
  -d "VERSION=1.0.0&ENV=prod" -w "%{url}")

# 等待构建完成
while true; do
  STATUS=$(curl -s "$BUILD_URL/api/json" -u "$JENKINS_USER:$JENKINS_TOKEN" | \
    jq -r '.result')
  if [[ "$STATUS" != "null" ]]; then
    echo "Build $STATUS"
    break
  fi
  sleep 10
done
```

### 场景 2: 回滚到上一个稳定版本

查询历史构建，找到上一个成功版本：
```bash
source ~/.openclaw/workspace/.env

# 获取最近成功构建号
LAST_SUCCESS=$(curl -s "$JENKINS_URL/job/my-app/api/json" \
  -u "$JENKINS_USER:$JENKINS_TOKEN" | \
  jq -r '.builds[].number | select(.result == "SUCCESS") | .number' | head -1)

# 触发回滚
curl -X POST "$JENKINS_URL/job/my-app/$LAST_SUCCESS/replay" \
  -u "$JENKINS_USER:$JENKINS_TOKEN"
```

### 场景 3: 批量操作多个任务

触发多个项目同时构建：
```bash
source ~/.openclaw/workspace/.env

# 项目列表
PROJECTS=("frontend" "backend" "api-gateway")

for proj in "${PROJECTS[@]}"; do
  echo "Building $proj..."
  curl -s -X POST "$JENKINS_URL/job/$proj/build" \
    -u "$JENKINS_USER:$JENKINS_TOKEN" &
done
wait
echo "All builds triggered"
```
