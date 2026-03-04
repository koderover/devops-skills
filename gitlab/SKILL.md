---
name: gitlab
description: GitLab 操作。用于：(1) 管理 GitLab 项目和仓库 (2) 操作 Merge Request (3) 触发 CI/CD Pipeline (4) 管理文件和代码 (5) 管理用户和权限
---

# GitLab Skill

## 配置

```bash
# ~/.openclaw/workspace/.env
GITLAB_URL=https://gitlab.example.com
GITLAB_TOKEN=your-gitlab-private-token
```

## 获取 Token

1. 登录 GitLab → 点击头像 → Preferences
2. 左侧菜单选择 "Access Tokens"
3. 填写 Name，勾选 `api` 或需要的权限
4. 点击 "Create personal access token"
5. 复制生成的 token

## 操作示例

```bash
source ~/.openclaw/workspace/.env
```

### 项目操作

```bash
source ~/.openclaw/workspace/.env

# 列出用户项目
curl -s -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "$GITLAB_URL/api/v4/projects?membership=true&owned=true" | jq '.[].name'

# 获取项目详情
curl -s -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "$GITLAB_URL/api/v4/projects/ PROJECT_ID"

# 获取项目文件
curl -s -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "$GITLAB_URL/api/v4/projects/ PROJECT_ID/repository/files/PATH?ref=BRANCH"
```

### Merge Request 操作

```bash
source ~/.openclaw/workspace/.env

# 列出 MR
curl -s -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "$GITLAB_URL/api/v4/projects/ PROJECT_ID/merge_requests?state=opened"

# 创建 MR
curl -s -X POST -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  --data-urlencode "source_branch=feature-xxx" \
  --data-urlencode "target_branch=main" \
  --data-urlencode "title=Feature XXX" \
  "$GITLAB_URL/api/v4/projects/ PROJECT_ID/merge_requests"

# 接受 MR
curl -s -X PUT -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "$GITLAB_URL/api/v4/projects/ PROJECT_ID/merge_requests/ IID/merge"
```

### Pipeline 操作

```bash
source ~/.openclaw/workspace/.env

# 触发 Pipeline
curl -s -X POST -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  --data-urlencode "ref=main" \
  "$GITLAB_URL/api/v4/projects/ PROJECT_ID/pipeline"

# Pipeline 状态
curl -s -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "$GITLAB_URL/api/v4/projects/ PROJECT_ID/pipelines"

# 获取 Pipeline 日志
curl -s -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "$GITLAB_URL/api/v4/projects/ PROJECT_ID/pipelines/ PIPELINE_ID/jobs"
```

### 使用 glab CLI

```bash
# 安装: brew install glab
# 配置: glab auth login

glab repo list
glab mr list
glab mr create --source-branch feature --target-branch main --title "Feature"
glab pipeline run
```

## 常用场景

1. **创建 MR**: 代码合并请求
2. **触发构建**: 启动 CI/CD Pipeline
3. **查看状态**: 检查 MR/Pipeline 状态
4. **管理文件**: 读取/修改仓库文件

## 使用场景

### 场景 1: 自动创建 Merge Request

当分支开发完成后自动创建 MR：
```bash
source ~/.openclaw/workspace/.env

# 创建 MR
MR_IID=$(curl -s -X POST -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  --data-urlencode "source_branch=feature-user-auth" \
  --data-urlencode "target_branch=main" \
  --data-urlencode "title=Feature: 用户认证模块" \
  --data-urlencode "description=实现用户登录注册功能\n\nCloses #123" \
  "$GITLAB_URL/api/v4/projects/$PROJECT_ID/merge_requests" | \
  jq -r '.iid')

echo "MR created: !$MR_IID"
```

### 场景 2: 触发 Pipeline 并等待完成

触发部署流水线并等待结果：
```bash
source ~/.openclaw/workspace/.env

# 触发 Pipeline
PIPELINE_ID=$(curl -s -X POST -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  --data-urlencode "ref=main" \
  --data-urlencode "variables[0][key]=DEPLOY_ENV&variables[0][value]=production" \
  "$GITLAB_URL/api/v4/projects/$PROJECT_ID/pipeline" | \
  jq -r '.id')

# 等待完成
while true; do
  STATUS=$(curl -s -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
    "$GITLAB_URL/api/v4/projects/$PROJECT_ID/pipelines/$PIPELINE_ID" | \
    jq -r '.status')
  [[ "$STATUS" == "success" || "$STATUS" == "failed" ]] && break
  sleep 15
done
echo "Pipeline $STATUS"
```

### 场景 3: 批量更新文件

批量修改多个仓库的配置：
```bash
source ~/.openclaw/workspace/.env

# 更新 .gitlab-ci.yml
curl -X PUT -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"branch": "main", "author_email": "ci@gitlab.com", "content": "'$(base64 -w0 .gitlab-ci.yml)'", "commit_message": "Update CI config"}' \
  "$GITLAB_URL/api/v4/projects/$PROJECT_ID/repository/files/.gitlab-ci.yml"
```
