# GitHub

GitHub operations: repository management, Pull Request, Actions, Issues, and file operations.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| GITHUB_TOKEN | Yes | GitHub Personal Access Token |
| GITHUB_OWNER | Yes | Organization or username |

## Core Features

1. **Repository Management** - List, create, and manage repositories
2. **Pull Request** - Create, review, and merge PRs
3. **Actions** - Trigger and monitor workflows
4. **Issues** - Create, label, and assign issues
5. **File Operations** - Read and update repository files

## Usage Example

### Configure Token

1. Go to https://github.com/settings/tokens
2. Generate new token (classic) with `repo` and `workflow` scopes
3. Add to `.env`:

```bash
GITHUB_TOKEN=your-token
GITHUB_OWNER=your-org
```

### List Repositories

```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/user/repos?per_page=100" | jq '.[].name'
```

### Create Pull Request

```bash
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"title":"Feature XXX","body":"Description","head":"feature-branch","base":"main"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/pulls"
```

### Trigger Actions

```bash
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"ref":"main"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/actions/workflows/WORKFLOW_ID/dispatches"
```

### Using gh CLI

```bash
# Install: brew install gh
# Config: gh auth login

gh repo list
gh pr list
gh run list
```

## Common Scenarios

### Auto-create Pull Request

```bash
source ~/.openclaw/workspace/.env

PR_URL=$(curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"title":"Feature: New Feature","body":"Description","head":"feature-xxx","base":"main"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/pulls" | \
  jq -r '.html_url')

echo "PR created: $PR_URL"
```

### Trigger and Wait for Actions

```bash
source ~/.openclaw/workspace/.env

# Trigger workflow
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"ref":"main"}' \
  "https://api.github.com/repos/$GITHUB_OWNER/REPO/actions/workflows/deploy.yml/dispatches"

# Wait for completion
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

### Batch Update Multiple Repositories

```bash
source ~/.openclaw/workspace/.env

REPOS=("repo1" "repo2" "repo3")

for REPO in "${REPOS[@]}"; do
  SHA=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GITHUB_OWNER/$REPO/contents/.github/workflows/ci.yml" | \
    jq -r '.sha')
  
  curl -s -X PUT -H "Authorization: token $GITHUB_TOKEN" \
    -d '{"message":"Update CI","content":"'$(base64 -w0 ci.yml)'","sha":"'$SHA'","branch":"main"}' \
    "https://api.github.com/repos/$GITHUB_OWNER/$REPO/contents/.github/workflows/ci.yml"
done
```
