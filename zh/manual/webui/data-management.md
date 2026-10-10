---
title: 数据管理
---

# 数据管理

用 WebUI 的**数据管理**页可以把 MaiBot 的配置、数据、插件和日志打包成一个 zip 压缩包下载来实现数据迁移。入口在侧边栏 **高级工具 → 数据管理**。

## 导出数据

- 左侧「导出数据」卡片用于生成压缩包，默认范围就是最常见的配置与数据，直接点 **开始导出** 即可：
- 导出是异步任务。点「开始导出」后，卡片内出现进度区：
- 一个导出任务运行期间「开始导出」按钮不可点击，即同时只能有一个导出任务
- 导出压缩包会临时保存在系统临时目录超时未下载会被自动清理
- 每次下载开始和完成时都会把保留期限重置为 24 小时

::: tip 压缩包文件名
压缩包名为 `maibot-data-<导出时间>.zip`（如 `maibot-data-20260709-123456.zip`）。
:::

## 导出内容

压缩包顶层固定包含一个 `manifest.json`，其余是按勾选范围打包的 `config/`、`data/`（以及可选的 `plugins/`、`logs/`）目录，包内路径与 MaiBot 目录内的相对路径一致。

`manifest.json` 记录数据包的元信息，导入时由后端校验：

::: code-group

```json [manifest.json ~vscode-icons:file-type-json~]
{
  "format": "maibot-data-archive",
  "format_version": 1,
  "created_at": "2026-07-09T12:34:56.789012+00:00",
  "maibot_version": "1.3.2",
  "included": ["config", "data"],
  "parts": {
    "config": { "file_count": 12, "total_bytes": 1048576 },
    "data": { "file_count": 3456, "total_bytes": 209715200 }
  }
}
```

:::

## 导入与恢复

右侧「导入数据」卡片用于从数据包恢复：

1. 点文件选择框，选中一个 `.zip` 数据包（只接受本功能导出的包）
2. 勾选要还原的分块：**配置（config）**、**数据（data）** 默认已勾选，**插件（plugins）**、**日志（logs）** 按需勾选；至少要选一个
3. 点 **开始导入**

::: warning 导入会覆盖现有文件
导入前先备份当前数据（可用本页再导出一份留底），并确认版本一致：`manifest.json` 里记录了导出时的 MaiBot 版本。导入完成后重启 MaiBot 再验证运行状态。
:::

## 相关文档

- [数据与迁移](/faq/backup-and-migration) — 迁移前要备份什么、手工整目录备份方法
- [配置管理](./config-management.md) — 在浏览器里改配置
- [数据与记忆 API](/develop/webui-api/data-and-memory-api) — `data-transfer` 相关端点的完整参考
