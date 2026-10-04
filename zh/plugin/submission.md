---
title: 发布插件
---

# 发布插件

写完插件并验证本地运行正常后，就可以把它提交到麦麦官方插件中心，让所有用户都能通过 WebUI 插件市场搜索、安装你的作品。

## 插件中心是什么

插件中心（[plugins.maibot.chat](https://plugins.maibot.chat/)）由官方仓库 [Mai-with-u/plugin-repo](https://github.com/Mai-with-u/plugin-repo) 驱动。插件本身以**独立的公开 GitHub 仓库**形式存在，插件中心只维护索引文件——`plugins.json` 描述插件元信息，`plugin_versions.json` 记录每个插件的发布版本与兼容区间——通过自动化工作流验证每一个提交。

提交插件**完全开源免费**，不需要任何费用或邀请。审核通过后，你的插件会出现在插件市场的搜索结果中。

## 提交前：插件仓库要求

你的插件必须是一个**公开的 GitHub 仓库**，且根目录包含以下文件：

**`_manifest.json`** — 插件清单，使用 **manifest v2** 结构，字段规范见 [Manifest 系统](./manifest.md)

**`plugin.py`** — 插件入口文件，包含 `create_plugin()` 工厂函数

**`LICENSE`** — 许可证文件，类型应与 `_manifest.json` 中的 `license` 字段一致

**`README.md`** — 建议包含功能介绍、安装方式、配置说明和使用示例

::: tip 什么是插件仓库
插件仓库是**独立于 MaiBot 主仓库**的你的个人/项目仓库（例如 `https://github.com/you/my-plugin`），不是 MaiBot 的 `plugins/` 目录。插件中心通过 `_manifest.json` 的 `urls.repository` 字段定位它。
:::

## 发布 Release 版本：Tag 必须与 manifest 一致

插件市场的安装对话框按**发布版本**工作：官方索引同步工具会扫描你仓库的 Git Release，为每个 Tag 生成一条版本记录。任何一条对不上，该版本会被打回 `rejected_releases`，用户在插件详情页只能看到「有 N 个发布版本未通过校验」，装不了它。

发布新版本时逐条对齐：

- **Git Tag 与 `_manifest.json` 的 `version` 完全一致** — Tag 写 `1.4.2` 或 `v1.4.2`，manifest 的 `version` 就必须是 `1.4.2`
- **`version` 用严格三段式** — `x.y.z`，不带 `-rc1`、`+build` 之类后缀；预发布请用 GitHub 的 Prerelease 标记，而不是改版本号格式
- **插件 `id` 不能变** — 一个发布版本如果把 `id` 从 `com.you.plugin` 改成别的，会被判定为"发布版本改变了插件 ID"而驳回
- **`manifest_version` 保持受支持的协议版本** — 当前固定为 `2`
- **该 Tag 的 commit 里必须能读到 `_manifest.json`** — 改写历史、删过 manifest 的 Tag 会被驳回

::: tip 建议固定流程
改代码 → 更新 `_manifest.json` 的 `version` → 提交推送 → 用同一个版本号打 Tag 并推送 → 在 GitHub 上基于该 Tag 创建 Release（需要时勾选 Prerelease）。Tag、manifest、Release 三者版本号一致，索引一次同步就能收录。
:::

## 提交方式：Issue 提交（推荐）

通过 Issue 模板提交，**无需 Fork、无需本地 Git 操作**，也能避免多人同时修改 `plugins.json` 带来的合并冲突。

1. 打开 [plugin-repo 仓库](https://github.com/Mai-with-u/plugin-repo) 的 [New Issue](https://github.com/Mai-with-u/plugin-repo/issues/new/choose) 页面，选择 **「Add Plugin / 添加插件」** 模板。
2. 填写信息：
   - **插件 ID**：建议与 `_manifest.json` 中的 `id` 保持一致。
   - **仓库地址**：填写完整的公开 GitHub HTTPS URL，例如 `https://github.com/username/my-plugin`。
3. 提交 Issue 后，CI 会自动读取你插件仓库根目录的 `_manifest.json` 并校验，结果会评论在 Issue 中。
4. 验证通过后，维护者会审核并使用 `/approve` 批准，你的插件就会被加入插件中心。

### 状态标签

**`pending-validation`** — 等待自动验证

**`validated`** — 验证通过，等待维护者批准

**`validation-failed`** — 验证失败，请根据提示修复

**`approved`** — 已批准并添加到插件中心

**`rejected`** — 被维护者拒绝

### 验证失败怎么办

1. 根据 Issue 中的错误提示修改你的插件仓库。
2. 修改完成后，在 Issue 中评论 `/recheck`。
3. CI 会重新验证，结果会再次评论在 Issue 中。

## 提交流程全览

```mermaid
flowchart TD
    A[插件仓库根目录有 _manifest.json v2 + plugin.py + LICENSE] --> B[在 plugin-repo 创建 Issue<br/>选择 Add Plugin 模板]
    B --> C{CI 自动验证}
    C -->|成功| D[等待维护者 /approve]
    C -->|失败| E[按提示修改仓库]
    E --> F[Issue 评论 /recheck]
    F --> C
    D --> G[插件进入插件中心<br/>WebUI 插件市场可见]
```

## 提交清单

提交前对照检查一遍：

- [ ] 插件仓库是**公开**的 GitHub 仓库
- [ ] 根目录包含 `_manifest.json`（`manifest_version: 2`）、`plugin.py`、`LICENSE`
- [ ] `id` 稳定唯一，无空格、无路径字符
- [ ] 所有版本号都是三段式（`x.y.z`）
- [ ] 每个 Git Release 的 Tag 与 manifest `version` 一致，且 `id` 未改动（否则该版本进不了市场）
- [ ] `host_application` / `sdk` 的上界不要锁死在小版本（例如写到 `999.999.999`），只认真约束 `min_version`
- [ ] `author` 是 `{ name, url }` 对象
- [ ] `urls.repository` 是公开 HTTPS 地址，无 `.git` 后缀
- [ ] `capabilities` 只声明实际需要的能力
- [ ] 本地已用真实 MaiBot 验证过插件能正常加载运行

## 更多信息

- [插件市场](https://plugins.maibot.chat/) — 浏览所有已收录插件
- [plugin-repo 仓库](https://github.com/Mai-with-u/plugin-repo) — 插件索引与贡献指南
- [Manifest 系统](./manifest.md) — `_manifest.json` 完整字段定义
- [开发指南](./) — 从零开始编写插件