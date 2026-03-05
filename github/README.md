# GitHub Skill

GitHub 操作技能：仓库管理、Pull Request、Actions、Issue 和文件操作。

让开发者能够通过自然语言与 GitHub API 交互，快速完成日常开发任务。

## 环境变量

在 `~/.openclaw/workspace/.env` 中配置：

```bash
# 必填
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_OWNER=koderover  # 组织名或用户名
```

## 获取 Token

1. 打开 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 填写 Note（如 "OpenClaw"）
4. 勾选权限：
   - `repo` - 完整仓库访问
   - `workflow` - Actions 权限
   - `read:org` - 读取组织
5. 点击 "Generate token"
6. 复制并配置到 `.env`

## 核心功能

| 模块 | 功能 |
|------|------|
| 仓库 | 列出、创建、管理仓库 |
| Pull Request | 创建、审查、合并 PR |
| Issue | 创建、标签、分配 Issue |
| Actions | 触发、监控工作流 |
| 文件 | 读取、更新仓库文件 |

## 快速开始

### 1. 配置 Token

```bash
# ~/.openclaw/workspace/.env
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_OWNER=your-org
```

### 2. 基本操作示例

```bash
# 列出仓库
gh repo list

# 创建 PR
gh pr create --title "Feature: 新功能" --body "描述"

# 触发 Actions
gh run list
```

## 使用场景

### 自动创建 Pull Request

当分支开发完成后自动创建 PR：

```bash
# 创建 PR 并获取链接
PR_URL=$(curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"title":"Feature: 新功能","body":"实现 xxx 功能","head":"feature-xxx","base":"main"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/pulls" | \
  jq -r '.html_url')

echo "PR created: $PR_URL"
```

### 触发 Actions 并等待完成

触发部署流水线并等待结果：

```bash
# 触发 Workflow
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"ref":"main"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/actions/workflows/deploy.yml/dispatches"

# 等待完成
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

### 批量更新多个仓库

批量修改多个仓库的配置文件：

```bash
REPOS=("repo1" "repo2" "repo3")

for REPO in "${REPOS[@]}"; do
  SHA=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GITHUB_OWNER/$REPO/contents/ci.yml" | \
    jq -r '.sha')
  
  curl -s -X PUT -H "Authorization: token $GITHUB_TOKEN" \
    -d '{"message":"Update CI","content":"'$(base64 -w0 ci.yml)'","sha":"'$SHA'","branch":"main"}' \
    "https://api.github.com/repos/$GITHUB_OWNER/$REPO/contents/ci.yml"
done
```

## 使用 gh CLI

```bash
# 安装
brew install gh

# 登录
gh auth login

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

# Actions 操作
gh run list
gh run view RUN_ID
```

## 相关文档

- [SKILL.md](./SKILL.md) - Agent 使用说明（含完整 API 示例）
- [GitHub REST API 文档](https://docs.github.com/en/rest)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
