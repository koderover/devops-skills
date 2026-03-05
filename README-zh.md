[English](./README.md) | [简体中文](./README-zh.md)

# DevOps Skills

> DevOps 工具技能市场 - 拿来即用

让开发者能够快速获取主流 DevOps 工具的最佳实践，降低工具使用门槛，提升工作效率。

## 🎯 目标用户

- DevOps 工程师
- SRE
- 平台工程师
- 开发者

## 📦 技能列表

### 🔧 代码管理

| 技能 | 描述 |
|------|------|
| [GitLab](./gitlab/) | GitLab 仓库管理、MR、Pipeline |
| [GitHub](./github/) | GitHub 仓库管理、PR、Actions、Issue |

### ⚙️ 持续集成

| 技能 | 描述 |
|------|------|
| [Jenkins](./jenkins/) | Jenkins CI/CD 自动化 |
| [Zadig](./zadig/) | Zadig 一站式 DevOps 平台 |

### 📡 配置中心

| 技能 | 描述 |
|------|------|
| [Nacos](./nacos/) | Nacos 配置管理 |
| Apollo | Apollo 配置中心（开发中） |

### 📊 监控告警

| 技能 | 描述 |
|------|------|
| [Grafana](./grafana/) | Grafana 可视化监控 |
| [SonarQube](./sonar/) | SonarQube 代码质量 |

### 🌐 API 网关

| 技能 | 描述 |
|------|------|
| [APISIX](./apisix/) | Apache APISIX API 网关 |

## 🚀 快速开始

### 1. 安装技能

```bash
# 克隆仓库
git clone https://github.com/koderover/devops-skills.git

# 复制到 OpenClaw 工作空间
cp -r devops-skills/* ~/.openclaw/workspace/skills/
```

### 2. 配置凭证

在 `~/.openclaw/workspace/.env` 中配置所需的环境变量：

```bash
# GitHub
GITHUB_TOKEN=your-token
GITHUB_OWNER=your-org

# GitLab
GITLAB_URL=https://gitlab.com
GITLAB_TOKEN=your-token

# Jenkins
JENKINS_URL=https://jenkins.example.com
JENKINS_USER=admin
JENKINS_TOKEN=your-api-token

# Zadig
ZADIG_API_URL=https://your-zadig.example.com
ZADIG_API_KEY=your-jwt-token
```

### 3. 开始使用

直接和 OpenClaw 对话即可调用技能：

```
帮我列出 GitHub 仓库
帮我触发 Jenkins 构建
帮我查看 Zadig 项目状态
```

## 🤝 贡献指南

欢迎贡献！请阅读 [CONTRIBUTING-zh.md](./CONTRIBUTING-zh.md) 了解如何贡献技能。

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE)

## 📱 联系我们

- 问题反馈：GitHub Issues
- 微信群：扫码加入讨论

![联系我们](./contact.png)
