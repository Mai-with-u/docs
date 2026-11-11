---
title: 部署与启动
---

# 部署与启动

这页解决部署与启动问题：起不来、端口被占用、WebUI 打不开、Docker 挂载不持久、多实例冲突。

## MaiBot 启动失败怎么办？

先看启动日志里的第一条真实错误，不要看最后一行。常见原因：Python 或依赖版本不对、配置文件缺失或语法错误、模型配置不完整、端口被占用、目录权限不足。

确认原因前不要反复重装。配置和端口问题见[启动与访问错误排查](./troubleshooting-startup.md)，模型问题见[模型与规则错误排查](./troubleshooting-model.md#api-key-错误-余额不足)。

## 配置文件在哪里？

源码部署和 uv 安装都在工作区的 `config/` 下：

- **`config/bot_config.toml`** — 机器人身份、人设、聊天行为、记忆、日志、插件。
- **`config/model_config.toml`** — 任务模型选择与任务参数。供应商、API Key 和模型定义在 `host/model_catalog.toml`，由所有 Bot 共用。
- **`host/config.toml`** — 宿主对外监听地址、Cookie 和公开访问地址。

首次启动时自动生成。要改配置优先用 WebUI，它保存前会做完整校验。手改 TOML 时注意：字符串加引号、数字不加引号、布尔值写小写 `true` / `false`。

## 端口被占用怎么办？

先按日志确认是哪个服务：

- **WebUI 与文件传输** — 由 `host/config.toml` 的 `[webui].port` 控制，默认 `8001`。
- **Docker 里的 NapCat** — 默认映射 `6099`。
- **NapCat 的正向 WebSocket** — 常见 `3001`，以适配器配置为准。

找到占用进程后关掉它，或者同时改掉服务端和客户端的端口。命令见[端口占用排查](./troubleshooting-startup.md#端口被占用)。

改 `[webui].port` 需要重启宿主才生效。

## WebUI 打不开怎么办？

本地部署默认访问 `http://127.0.0.1:8001`。依次确认：

1. 启动日志里 WebUI 服务已经启动成功。
2. `host/config.toml` 的 `[webui].enabled = true`。
3. `[webui].hosts` 包含你访问用的地址。默认只监听 `127.0.0.1` 和 `::1`，远程访问要加服务器 IP 或 `0.0.0.0`。
4. `[webui].allowed_ips` 没有把来源 IP 挡掉。

更多排查见[WebUI 页面打不开](./troubleshooting-startup.md#webui-页面打不开)。Docker 还要检查端口映射和监听地址，见[Docker 部署](../manual/deployment/docker.md)。

## Docker 启动时提示挂载目录未持久化怎么办？

宿主把注册表、对外地址和 WebUI 登录凭据写在容器的 `/MaiMBot/host`。容器启动脚本会检查这个路径是否真的落到了宿主磁盘，落在 tmpfs 或 ramfs 上就直接拒绝启动，并打印当前缺哪个挂载。

处理方式：下载与镜像版本对应的新版 `docker-compose.yml`，补齐这三条挂载后重建容器：

::: code-group

```yaml [docker-compose.yml ~vscode-icons:file-type-yaml~]
volumes:
  - ./data/MaiMBot-host:/MaiMBot/host                # 宿主注册表与 WebUI 凭据
  - ./data/MaiMBot-bots:/MaiMBot/bots                # WebUI 中新建的 Bot
  - ./data/MaiMBot-plugin-data:/MaiMBot/data/plugins # 插件持久数据
```

:::

如果已经用旧挂载跑过，先从旧容器里把 `/MaiMBot/host` 备份出来，恢复到新的宿主机目录后再 `docker compose up -d core`。挂载没补齐就重建，会丢掉 WebUI 登录凭据和 Bot 登记信息。

## 多实例部署要注意什么？

一个工作区里可以有多个 Bot，但有几条硬约束：

- **共享环境** — 所有 Bot 共用一个 Python 环境，插件依赖统一解析，不能给单个 Bot 装独立版本。
- **账号不能重复** — 克隆出来的 Bot 会复制原 Bot 的配置，启动前必须改掉平台账号，否则两个进程连同一个 QQ。
- **端口只有一个** — 浏览器访问的监听地址和端口由宿主统一管理，按 Bot 分开配置无处可改。
- **迁移要显式执行** — 旧实例不会自动迁入工作区，用 `maibot host adopt` 手动登记或移动。

完整说明见[多实例](../manual/multi-bot-host.md)。

## WebUI 里找不到某个配置项怎么办？

先看页面有没有「高级」开关，再确认当前版本。配置项可能被移动、改名或由别的字段取代。不要照着旧截图往 TOML 里加不存在的字段：配置类禁止未声明字段，加了会在启动时报错或被自动清理。
