---
title: WebUI HTTP API 入口
---

# WebUI HTTP API 入口

本子目录覆盖 MaiBot WebUI 后端对外暴露的 HTTP / WebSocket API，面向部署运维和需要脚本化管理的使用者。如果你只是通过浏览器使用 WebUI 面板，无需阅读这些内容。

开始之前，先看完本页。它交代了整个 API 的骨架：服务器怎么跑起来的、你怎么登录、有哪些路由组、以及遇到具体场景该跳去哪篇。

## FastAPI 后端简介

WebUI 的后端是一个 FastAPI 应用，随 MaiBot 主进程一起启动。默认行为：

- **监听端口** — `8001`（WebUIConfig.port）
- **绑定地址** — `127.0.0.1` 和 `::1`（WebUIConfig.host）
- **运行模式** — `production`（WebUIConfig.mode），开发时可切 `development`

::: warning 安全警告
默认绑定回环地址，只能本机访问。**切勿将 host 改为 `0.0.0.0` 直接暴露在公网上**，WebUI 没有内置 TLS 终止和 WAF。如果必须远程访问，请通过反向代理（Nginx / Caddy）接入，并在 `webui.trusted_proxies` 中配置代理 IP。
:::

关键配置项一览：

- **`webui.enabled`** — `true` 启动 WebUI，`false` 完全禁用
- **`webui.host`** — 监听地址列表，可同时绑 IPv4 和 IPv6
- **`webui.port`** — 监听端口，默认 `8001`
- **`webui.allowed_ips`** — IP 白名单，逗号分隔
- **`webui.secure_cookie`** — 是否只在 HTTPS 下发送登录 Cookie
- **`webui.anti_crawler_mode`** — 防爬虫级别，默认 `basic`
- **`webui.trusted_proxies`** — 反向代理 IP 列表
- **`webui.trust_xff`** — 是否信任 `X-Forwarded-For` 头

这些字段定义在 `src/config/official_configs.py` 的 `WebUIConfig` 类中，全部可通过 [WebUI 配置界面](/manual/webui/) 或 [`/api/config/raw`](#兼容路由) 读写。

## 认证模型：三种方式

WebUI API 的绝大多数端点要求认证。MaiBot 提供了三种认证方式，覆盖浏览器、脚本工具和 WebSocket 三类场景。

### 1. Cookie Token（浏览器主模式）

这是 WebUI 前端的默认认证路径。流程：

1. 从 MaiBot 启动日志中获取临时 Token（初次启动时自动生成，打印在终端里）
2. 调 `POST /api/webui/auth/verify` 传入这个 Token
3. 服务端验证通过后，在 `Set-Cookie` 头中下发 HttpOnly Cookie（`maibot_session`），有效期 7 天
4. 后续请求自动携带该 Cookie，不再需要每次传 Token

**`/auth/verify` 请求示例：**

::: code-group

```bash [curl 验证 Token ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "你的临时或固定Token"}'
```
:::

**相关端点：**

- **`POST /api/webui/auth/verify`** — 验证 Token 并设置 Cookie（有频率限制：5 次/5 分钟，触发后封禁 10 分钟）
- **`GET /api/webui/auth/check`** — 检查当前 Cookie 是否仍然有效
- **`POST /api/webui/auth/logout`** — 清除 Cookie，登出
- **`POST /api/webui/auth/update`** — 更换为自定义 Token（需已登录）
- **`POST /api/webui/auth/regenerate`** — 让系统重新生成一个随机 Token（需已登录）

**`/auth/check` 查询示例：**

::: code-group

```bash [curl 检查认证状态 ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/auth/check \
  -H "Cookie: maibot_session=你的Token"
```
:::

### 2. api_server_allowed_api_keys（脚本/外部调用）

当要从脚本、CI 流水线或其他外部服务调用 WebUI API 时，可以走 MaimMessage 配置中的 `api_server_allowed_api_keys` 白名单。这些 API Key 在 MaiBot 的 message server 校验，适合不与浏览器 Cookie 绑定的自动化场景。

通过 API Key 调用时，将 Key 值填入 `maibot_session` Cookie 即可绕过 WebUI 自身 Token 验证（前提是该 Key 已在消息服务白名单中且映射到合法 token）。

### 3. WebSocket 临时 Token

浏览器端 WebSocket 不能携带自定义 HTTP Header，也无法可靠携带 Cookie。为此 MaiBot 提供了一个临时 Token 机制：

1. 前端先通过 Cookie 认证后调 `GET /api/webui/ws-token`
2. 服务端生成一次性临时 Token，有效期 **60 秒**，用完即删
3. 前端用该临时 Token 作为 WebSocket URL 的 `?token=` 查询参数完成握手

::: code-group

```bash [curl 获取 WS Token ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/ws-token \
  -H "Cookie: maibot_session=你的Token"
```
:::

## 路由结构与 base path

整个 API 的组织分两层：主路由挂在 `/api/webui` 下，三条兼容路由独立注册。

### 主路由：`/api/webui/*`

`src/webui/routes.py` 中创建的 `APIRouter(prefix="/api/webui")` 是核心。它聚合了以下子路由模块（全部挂载在 `/api/webui/` 之下）：

- **`/health`** — 健康检查（无需认证）
- **`/auth/*`** — 认证相关
- **`/setup/*`** — 首次配置引导
- **`/config/*`** — 运行配置读写（TOML 格式）
- **`/person/*`** — 人物信息管理
- **`/model/*`** — 模型列表与连通性验证
- **`/plugin/*`** — 插件生命周期管理
- **`/system/*`** — 系统控制与数据迁移
- **`/memory/*`** — 长期记忆图谱
- **`/emoji/*`** — 表情包管理
- **`/expression/*`**、**`/jargon/*`**、**`/behavior/*`** — 表达方式、黑话、行为
- **`/statistics/*`** — 统计数据
- **`/avatar/*`** — 头像
- **`/ws-token`** — WebSocket 临时 Token
- WebSocket 端点（`unified` 统一通道、`logs` 日志流、`plugin/progress` 插件进度）

### 兼容路由（Compat Routers）

为了兼容旧版前端和一些外部集成，以下三条路由不走 `/api/webui` 前缀，而是独立注册：

**`/api/config/*`**（模块 `src/webui/routers/config.py`） — TOML 配置的结构化读写。路径如 `/api/config/schema`（获取配置表单 schema）、`/api/config/raw`（读写完整 TOML 内容）。

**`/api/*`**（模块 `src/webui/routers/memory.py`） — Amemorix 记忆图谱的完整 REST 接口。路径如 `/api/graph`（知识图谱查询）、`/api/episodes`（记忆片段）、`/api/import`（数据导入）、`/api/retrieval_tuning`（检索调优）。

**`/api/chat/*`**（模块 `src/webui/routers/chat/`） — 本地聊天室。WebUI 中的"与麦麦直接对话"功能通过这些端点实现。

**使用时机：** 如果你在写自动化脚本，推荐优先走 `/api/webui/*` 主路由（路径统一、认证一致）。兼容路由仅当脚本已有对旧路径的依赖、或者针对记忆图谱做大规模数据操作时再使用。

## 快速测连

最简单的健康检查无需认证，一个 curl 就能确认后端是否在跑：

::: code-group

```bash [curl 健康检查 ~vscode-icons:file-type-http~]
curl http://127.0.0.1:8001/api/webui/health
```
:::

预期返回：

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{"status": "healthy", "service": "MaiBot WebUI"}
```

:::

## First Run Setup 流程

MaiBot 初次启动时，TokenManager 会生成一个临时 Token 并打印在终端日志里。WebUI 前端检测到 `token_source` 为 `temporary` 后进入首次配置引导。

关键端点只有两个：

1. **`GET /api/webui/setup/status`**（需认证）— 查询是否处于首次配置状态
2. **`POST /api/webui/setup/complete`**（需认证）— 标记配置完成

完整流程：

1. 调 `/auth/verify` 用临时 Token 换取 Cookie
2. 调 `/setup/status` 确认 `is_first_setup: true`
3. 在 WebUI 中完成基础设置（模型、人物等）
4. 调 `POST /auth/update` 更换为固定的自定义 Token
5. 调 `POST /setup/complete` 标记完成

此外还有 `POST /api/webui/setup/reset`，用于清空配置状态重建引导流程。通常在迁移或重置时使用。

## 路线图

你需要做什么，就去对应的子篇：

- **［本页］WebUI HTTP API 入口** — API 骨架、认证、路由结构、健康检查、首次配置
- **[认证与配置](./auth-and-setup)** — 完整的 Token 替换/重生成/登出流程，First Run Setup 的自动化脚本
- **[系统控制](./system-control)** — 重启、关闭、日志查看、运行状态查询等运维端点
- **[插件生命周期 API](./plugin-lifecycle-api)** — 安装、卸载、启用、禁用插件的 HTTP 接口
- **[数据与记忆 API](./data-and-memory-api)** — Amemorix 记忆图谱的增删改查、数据导入导出、检索调优
- **[实时通道与统计](./realtime-and-stats)** — WebSocket（统一通道、日志流、插件进度）与统计数据查询

## 接下来

如果准备写脚本对接 WebUI API，建议按顺序：

1. 先拿 `/health` 确保后端在线
2. 走 `/auth/verify` 登录拿 Cookie
3. 对照路线图找到需要的场景篇，按其中的端点示例编写逻辑

所有端点（除 `/health` 外）都需要认证。Cookies 的有效期是 7 天，长期运行的脚本记得处理 Cookie 过期后的重新登录。
