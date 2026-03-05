---
name: github
description: GitHub 操作。用于：(1) 管理 GitHub 仓库 (2) 操作 Pull Request (3) 触发 Actions (4) 管理文件和代码 (5) 管理 Issue
---

# GitHub Skill

GitHub 操作技能：仓库管理、Pull Request、Actions、Issue 和文件操作。

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| GITHUB_TOKEN | 是 | GitHub Personal Access Token |
| GITHUB_OWNER | 是 | 组织名或用户名 |

## 获取 Token

1. 打开 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 填写 Note（如 "OpenClaw"）
4. 勾选权限：
   - `repo` - 完整仓库访问
   - `workflow` - Actions 权限
   - `read:org` - 读取组织
5. 点击 "Generate token"
6. 复制生成的 token

## 核心功能

1. **仓库管理** - 列出、创建、管理仓库
2. **Pull Request** - 创建、审查、合并 PR
3. **Actions** - 触发和监控工作流
4. **Issue** - 创建、标签、分配 Issue
5. **文件操作** - 读取和更新仓库文件

## 快速开始

### 配置 Token

```bash
# ~/.openclaw/workspace/.env
GITHUB_TOKEN=your-token
GITHUB_OWNER=your-org
```

### 基本操作

```bash
source ~/.openclaw/workspace/.env
```

### 仓库操作

```bash
# 列出用户仓库
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/user/repos?per_page=100" | jq '.[].name'

# 列出组织仓库
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/orgs/$GITHUB_OWNER/repos?per_page=100" | jq '.[].name'

# 获取仓库详情
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO_NAME"

# 创建仓库
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"name":"new-repo","private":false}' \
  "https://api.github.com/user/repos"
```

### Pull Request 操作

```bash
# 列出 PR
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/pulls?state=open"

# 创建 PR
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"title":"Feature XXX","body":"功能描述","head":"feature-branch","base":"main"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/pulls"

# 获取 PR 详情
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/pulls/PR_NUMBER"

# 合并 PR
curl -s -X PUT -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"merge_method":"squash"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/pulls/PR_NUMBER/merge"

# 添加 Reviewer
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"reviewers":["username"]}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/pulls/PR_NUMBER/requested_reviewers"
```

### Issue 操作

```bash
# 列出 Issue
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/issues?state=open"

# 创建 Issue
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"title":"Bug: 问题描述","body":"详细信息"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/issues"

# 添加标签
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"labels":["bug","help-wanted"]}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/issues/ISSUE_NUMBER"

# 分配用户
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"assignees":["username"]}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/issues/ISSUE_NUMBER"

# 关闭 Issue
curl -s -X PATCH -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"state":"closed"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/issues/ISSUE_NUMBER"
```

### Actions 操作

```bash
# 列出 Workflow
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/actions/workflows"

# 触发 Workflow
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"ref":"main"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/actions/workflows/WORKFLOW_ID/dispatches"

# 触发指定 Workflow（通过文件名）
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"ref":"main","inputs":{"env":"production"}}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/actions/workflows/ci.yml/dispatches"

# 列出最近运行
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/actions/runs"

# 获取运行详情
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/actions/runs/RUN_ID"

# 取消运行
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/actions/runs/RUN_ID/cancel"

# 重新运行
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/actions/runs/RUN_ID/rerun"
```

### 文件操作

```bash
# 获取文件内容
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/contents/PATH?ref=BRANCH"

# 获取文件内容（Base64 解码）
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/contents/PATH" | \
  jq -r '.content' | base64 -d

# 创建/更新文件
curl -s -X PUT -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"message":"Update config","content":"'$(base64 -w0 file.txt)'","branch":"main"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/contents/PATH"

# 删除文件
curl -s -X DELETE -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"message":"Delete file","sha":"FILE_SHA","branch":"main"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/contents/PATH"
```

### 使用 gh CLI

```bash
# 安装: brew install gh
# 配置: gh auth login

# 仓库操作
gh repo list
gh repo create new-repo --public

# PR 操作
gh pr list
gh pr create --title "Feature" --body "描述"
gh pr merge --admin --squash

# Issue 操作
gh issue list
gh issue create --title "Bug" --body "描述"
gh issue close #1

# Actions 操作
gh run list
gh run view RUN_ID
gh run rerun RUN_ID
```

## 常用场景

### 场景 1: 自动创建 Pull Request

当分支开发完成后自动创建 PR：

```bash
source ~/.openclaw/workspace/.env

# 创建 PR
PR_URL=$(curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{
    "title":"Feature: 新功能",
    "body":"实现 xxx 功能\n\nCloses #123",
    "head":"feature-xxx",
    "base":"main"
  }' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/pulls" | \
  jq -r '.html_url')

echo "PR created: $PR_URL"
```

### 场景 2: 触发 Actions 并等待完成

触发部署流水线并等待结果：

```bash
source ~/.openclaw/workspace/.env

# 触发 Workflow
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"ref":"main"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/actions/workflows/deploy.yml/dispatches"

# 等待 Run 完成
RUN_ID=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/actions/runs?status=in_progress" | \
  jq -r '.workflow_runs[0].id')

while true; do
  STATUS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GITHUB_OWNER/REPO/actions/runs/$RUN_ID" | \
    jq -r '.conclusion')
  [[ "$STATUS" == "success" || "$STATUS" == "failure" ]] && break
  sleep 15
done
echo "Run $STATUS"
```

### 场景 3: 批量更新多个仓库配置

批量修改多个仓库的配置文件：

```bash
source ~/.openclaw/workspace/.env

REPOS=("repo1" "repo2" "repo3")

for REPO in "${REPOS[@]}"; do
  # 获取当前文件 SHA
  SHA=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GITHUB_OWNER/$REPO/contents/.github/workflows/ci.yml" | \
    jq -r '.sha')
  
  # 更新文件
  curl -s -X PUT -H "Authorization: token $GITHUB_TOKEN" \
    -d '{"message":"Update CI","content":"'$(base64 -w0 ci.yml)'","sha":"'$SHA'","branch":"main"}' \
    "https://api.github.com/repos/$GITHUB_OWNER/$REPO/contents/.github/workflows/ci.yml"
  
  echo "Updated $REPO"
done
```

### 场景 4: Issue 自动化处理

新 Issue 创建时自动分配标签和负责人：

```bash
source ~/.openclaw/workspace/.env

# 添加标签
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"labels":["needs-review"]}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/issues/ISSUE_NUMBER"

# 分配用户
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"assignees":["username"]}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/issues/ISSUE_NUMBER"
```

### 场景 5: 创建 Release

```bash
source ~/.openclaw/workspace/.env

# 创建 Release
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{
    "tag_name":"v1.0.0",
    "target_commitish":"main",
    "name":"Release v1.0.0",
    "body":"版本说明",
    "draft":false,
    "prerelease":false
  }' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/releases"
```

## 常见问题

### Q: Token 权限不足怎么办？
A: 确保 Token 勾选了 `repo`（仓库权限）和 `workflow`（Actions 权限）。

### Q: API 请求频率限制？
A: 未认证请求每小时 60 次，认证后每小时 5000 次。使用 `Authorization` header 可以提高限制。

### Q: 如何查看剩余 API 配额？
```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/rate_limit" | jq '.rate'
```

### Q: gh CLI 如何配置？
```bash
gh auth login
# 选择 GitHub.com
# 选择 HTTPS
# 登录认证
```
