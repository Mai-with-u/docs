---
title: 提交与发布插件
---

# 提交与发布插件

插件发布到官方插件市场（`Mai-with-u/plugin-repo`）后，用户在 WebUI 的插件市场里能直接搜到、安装和升级。提交只要求一个公开 GitHub 仓库和一个 Release，版本更新走同一条自动化审核流水线。

## 提交插件

准备公开 GitHub 仓库，根目录放 `_manifest.json`（v2）、`plugin.py` 和 `LICENSE`，运行配置 `config.toml` 留在本地。先发布至少一个 GitHub Release，再用 [Add Plugin 模板](https://github.com/Mai-with-u/plugin-repo/issues/new/choose)提交插件 ID 和仓库地址。

## 发布新版本

更新 manifest 的三段式 `version`，保留插件 ID，创建同版本的 Tag 并发布 GitHub Release。修复已收录版本时，使用新版本号。

## 审核规则

首次提交由 CI 校验，维护者批准后上架。新版本在每日同步时校验并审核，低风险版本自动收录，有风险或结论不确定时交给维护者。首次提交校验失败，按 Issue 提示修复后评论 `/recheck`。完整要求见[官方贡献指南](https://github.com/Mai-with-u/plugin-repo/blob/main/CONTRIBUTING.md)。
