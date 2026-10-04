---
title: 认证与配置
---

# 认证与配置

本文覆盖 WebUI HTTP API 的认证体系和首次配置流程，面向需要脚本化管理 MaiBot 的运维人员。如果你刚打开[入口页](./index)，建议先读完路由结构和快速测连再回来。

文中所有端点都挂在 `/api/webui` 前缀下。

## Cookie Token 机制

MaiBot WebUI 用 HttpOnly Cookie 传递认证凭据，Cookie 名为 `maibot_session`。整个生命周期如下：

- **写入** — 调 `POST /api/webui/auth/verify` 传入有效 Token，服务端验证通过后在 `Set-Cookie` 中下发 Cookie，有效期 7 天，属性 `HttpOnly; SameSite=Lax; Path=/`。生产环境或配置 `webui.secure_cookie = true` 时会额外带 `Secure` 标志（仅 HTTPS 下发送）。
- **失效** — 7 天后浏览器自动清除；服务端调用 `POST /api/webui/auth/logout` 立即清除；调 `update` 或 `regenerate` 更换 Token 后旧 Cookie 也立即失效（因为旧 Token 不再有效）。
- **续期** — 没有内置的 silent refresh 机制。Cookie 到期后只能重新调 `/auth/verify` 登录。长期运行的脚本应捕获 401 响应并自动重登。

Cookie 存在 `data/webui.json` 同级目录下的 TokenManager 配置文件中，不依赖任何外部数据库。

## 认证端点详解

五个认证端点覆盖了从首次登录到日常维护的全部场景。

### `POST /api/webui/auth/verify` — 验证 Token 并登录

首次接触 WebUI 时唯一需要调用的端点。传入 Token（从启动日志或配置文件中获取），验证通过后拿到 Cookie，后续请求全部靠它。

**请求体：**

- **`token`** — 待验证的 Token 字符串，必填

**响应体：**

- **`valid`** — 是否通过验证（`true` / `false`）
- **`message`** — 验证结果的文字说明
- **`is_first_setup`** — 是否为首次配置（`true` / `false`）
- **`token_source`** — Token 来源，`temporary` 或 `configured`
- **`requires_custom_token`** — 是否提示需要设置自定义 Token（当 token_source 为 `temporary` 时为 `true`）

::: code-group

```http [curl 验证 Token ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "你的临时或固定Token"}'
```

:::

如果 Token 无效，响应会返回 `"valid": false`，并在剩余尝试次数 ≤ 2 时附带提醒。连续 5 次失败会触发 IP 封禁（详见 [Rate-Limit 安全建议](#rate-limit-安全建议)）。

### `GET /api/webui/auth/check` — 检查登录状态

前端页面加载时检查 Cookie 是否仍然有效。此端点不强制要求认证（Cookie 缺失只返回 `authenticated: false`，不抛 401）。

**响应体：**

- **`authenticated`** — 当前是否已登录（`true` / `false`）
- **`token_source`** — Token 来源（仅登录时返回）
- **`requires_custom_token`** — 是否需要更换 Token（仅登录时返回）

::: code-group

```http [curl 检查认证状态 ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/auth/check \
  -H "Cookie: maibot_session=你的Token"
```

:::

### `POST /api/webui/auth/update` — 更换为自定义 Token

要求当前已登录（Cookie 中携带有效 Token）。传入一个强度合规的新 Token，系统将其写入配置文件并将 `token_source` 标记为 `configured`。**操作完成后会清除当前 Cookie**，需要拿新 Token 重新登录。适用于首次配置中将临时 Token 替换为固定 Token。

**请求体：**

- **`new_token`** — 自定义 Token，至少 10 位，必须包含大写字母、小写字母和特殊符号（`!@#$%^&*()_+-=[]{}|;:,.<>?/`）

**响应体：**

- **`success`** — 是否更新成功
- **`message`** — 结果说明

::: code-group

```http [curl 更换 Token ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/auth/update \
  -H "Content-Type: application/json" \
  -H "Cookie: maibot_session=你的旧Token" \
  -d '{"new_token": "MyStr0ng!Token2024"}'
```

:::

### `POST /api/webui/auth/regenerate` — 重新生成随机 Token

要求当前已登录。系统生成一个新的 64 位十六进制随机 Token，写入配置文件，`token_source` 标记为 `configured`。**同样会清除当前 Cookie**，需要拿新 Token 重新登录。适合定期轮换 Token。

**响应体：**

- **`success`** — 是否生成成功
- **`token`** — 新生成的 Token 明文（**仅此一次可见，请立即保存**）
- **`message`** — 结果说明

::: code-group

```http [curl 重新生成 Token ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/auth/regenerate \
  -H "Cookie: maibot_session=你的当前Token"
```

:::

### `POST /api/webui/auth/logout` — 登出

清除 `maibot_session` Cookie，无需请求体也不需要事先登录（未登录调用也不会报错）。

**响应体：**

- **`success`** — 固定为 `true`
- **`message`** — `"已成功登出"`

## Rate-Limit 安全建议

`/auth/verify` 端点内置了针对 IP 的失败次数追踪，行为如下：

- **窗口** — 5 分钟滑动窗口
- **阈值** — 同一 IP 连续 5 次验证失败
- **处罚** — 触发后该 IP 被封禁 10 分钟，返回 HTTP 429
- **重置** — 成功后失败计数自动清零

五条强化建议供参考：

- **自定义 Token 长度** — 建议至少 32 位乱码，不要用字典词
- **不要裸奔在公网** — 默认 `host: ["127.0.0.1", "::1"]`，若需远程访问请走反向代理并在 `webui.trusted_proxies` 中配置代理 IP
- **HTTPS 必须开** — 生产模式下自动启用 Secure Cookie。若走反向代理，确认 `X-Forwarded-Proto` 头已正确传递
- **定期轮换** — 建议每 30\~90 天调一次 `/auth/regenerate`，旧 Token 立即失效
- **`webui.allowed_ips`** — 设置 IP 白名单，进一步缩小攻击面

## First-Setup 完整流程

MaiBot 首次启动时，TokenManager 检测到 `data/webui.json` 不存在，会自动生成一个临时 Token 并打印在终端日志中。WebUI 前端识别 `token_source === "temporary"` 后进入首次配置引导。

以下是以 API 调用完成整个首次配置的顺序：

### Step 1: 确认 WebUI 已启用

先调一次健康检查确认后端在线：

::: code-group

```http [curl 健康检查 ~vscode-icons:file-type-http~]
curl http://127.0.0.1:8001/api/webui/health
```

:::

预期返回 `{"status": "healthy", "service": "MaiBot WebUI"}`。如果无响应，检查 `webui.enabled` 是否为 `true`。

### Step 2: 用临时 Token 登录

从 MaiBot 启动日志中找到类似 `临时Token: a1b2c3d4...` 的输出，或者直接读取 `data/webui.json` 中的 `access_token` 字段：

::: code-group

```http [curl 用临时 Token 登录 ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "从启动日志中复制的临时Token"}'
```

:::

响应中的 `is_first_setup` 应为 `true`，`token_source` 应为 `temporary`。

### Step 3: 更换为固定 Token

调 `/auth/update` 将临时 Token 替换为你自己的强密码。注意 `update` 和 `regenerate` 都会清除 Cookie，所以这一步之后需要用新 Token 重新调 `/auth/verify` 拿新 Cookie。

### Step 4: 完成其他基础配置

通过 `/config/*`、`/person/*`、`/model/*` 等端点完成模型、人物、适配器等基本设置。这部分的具体端点见各自的子篇。

### Step 5: 标记配置完成

调 `/setup/complete` 将 `first_setup_completed` 写为 `true`，前端退出向导模式。之后调 `/auth/verify` 不会再出现 `is_first_setup: true`。

::: code-group

```http [curl 标记配置完成 ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/setup/complete \
  -H "Cookie: maibot_session=你的Token"
```

:::

另外两个辅助端点：

- **`GET /api/webui/setup/status`** — 查询当前首次配置状态（需认证），返回 `is_first_setup`、`token_source`、`requires_custom_token`
- **`POST /api/webui/setup/reset`** — 重置首次配置状态（需认证），允许重新进入配置向导。迁移或调试时使用

## First-Run 自动化脚本

以下 Bash 脚本模拟完整的首次配置流程，适合批量部署或 CI 场景。脚本假设 WebUI 监听在 `http://127.0.0.1:8001`。

将脚本保存为 `mai_first_setup.sh`，赋予执行权限后运行：

::: code-group

```bash [mai_first_setup.sh ~vscode-icons:file-type-shell~]
#!/usr/bin/env bash
set -euo pipefail

BASE="http://127.0.0.1:8001/api/webui"
CUSTOM_TOKEN="${1:-}"

echo "=== Step 0: 健康检查 ==="
curl -sf "${BASE}/health"

echo "=== Step 1: 读临时 Token ==="
TMP_TOKEN=$(python3 -c "import json; print(json.load(open('data/webui.json'))['access_token'])")
echo "临时Token: ${TMP_TOKEN:0:8}..."

echo "=== Step 2: 登录拿 Cookie ==="
RESP=$(curl -sX POST "${BASE}/auth/verify" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"${TMP_TOKEN}\"}")
echo "$RESP" | python3 -m json.tool

if echo "$RESP" | grep -q '"valid": true'; then
  echo "登录成功"
else
  echo "登录失败"; exit 1
fi

if [ -z "$CUSTOM_TOKEN" ]; then
  echo "=== Step 3: 重新生成固定 Token ==="
  NEW_RESP=$(curl -sX POST "${BASE}/auth/regenerate" \
    -H "Cookie: maibot_session=${TMP_TOKEN}")
  FIXED_TOKEN=$(echo "$NEW_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
  echo "新Token: ${FIXED_TOKEN:0:8}..."
  echo "完整Token（请妥善保存）: $FIXED_TOKEN"
else
  echo "=== Step 3: 使用指定的自定义 Token ==="
  FIXED_TOKEN="$CUSTOM_TOKEN"
  curl -sX POST "${BASE}/auth/update" \
    -H "Content-Type: application/json" \
    -H "Cookie: maibot_session=${TMP_TOKEN}" \
    -d "{\"new_token\": \"${CUSTOM_TOKEN}\"}"
fi

echo "=== Step 4: 用固定 Token 重新登录 ==="
curl -sX POST "${BASE}/auth/verify" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"${FIXED_TOKEN}\"}"

echo "=== Step 5: 标记首次配置完成 ==="
curl -sX POST "${BASE}/setup/complete" \
  -H "Cookie: maibot_session=${FIXED_TOKEN}"

echo "=== 完成 ==="
curl -s "${BASE}/setup/status" \
  -H "Cookie: maibot_session=${FIXED_TOKEN}" \
  | python3 -m json.tool
```

:::

## Token 轮换示例

Token 应定期更换。以下两个示例展示了 `update` 和 `regenerate` 两种轮换方式，以及轮换后重新登录的完整步骤。

### 方式 A: 用自定义 Token 替换

适合有密码管理器的场景（如 Bitwarden、1Password 生成的强密码），可以跨多台机器共享同一个 Token。

::: code-group

```http [curl Token 轮换（自定义） ~vscode-icons:file-type-http~]
# Step 1: 更换 Token（旧 Cookie 立即失效）
curl -X POST http://127.0.0.1:8001/api/webui/auth/update \
  -H "Content-Type: application/json" \
  -H "Cookie: maibot_session=旧Token" \
  -d '{"new_token": "NewP@ssphrase!2026"}'

# Step 2: 拿新 Token 重新登录
curl -X POST http://127.0.0.1:8001/api/webui/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "NewP@ssphrase!2026"}'
```

:::

### 方式 B: 让系统重新生成

适合不想自己编 Token 的场景，系统生成 64 位十六进制随机串。**注意新 Token 只在响应中出现一次，务必立即保存。**

::: code-group

```http [curl Token 轮换（系统生成） ~vscode-icons:file-type-http~]
# Step 1: 重新生成（旧 Cookie 立即失效，响应中返回新 Token）
curl -X POST http://127.0.0.1:8001/api/webui/auth/regenerate \
  -H "Cookie: maibot_session=当前Token"

# Step 2: 提取响应中的 token 字段，用它重新登录
curl -X POST http://127.0.0.1:8001/api/webui/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "上一步返回的新Token"}'
```

:::

## 临时 WebSocket Token

浏览器端 WebSocket 连接不能携带自定义 HTTP Header，也无法可靠携带 Cookie。MaiBot 为 WebSocket 握手设计了一个临时 Token 机制，作为 Cookie 认证和 WS 连接之间的桥梁。

**工作流程：**

1. 浏览器通过 Cookie 调 `GET /api/webui/ws-token`
2. 服务端验证 Cookie 有效后，生成一个 `secrets.token_urlsafe(32)` 的临时 Token，有效期 60 秒
3. 浏览器将临时 Token 作为 WebSocket URL 的查询参数（`?token=...`）发起连接
4. 服务端验证临时 Token 后立即将其消费（**一次性使用**），并同时校验关联的原始 session Token 是否仍有效
5. 如果原始 session 在 60 秒内已失效，临时 Token 也会被拒绝

**端点行为：**

- **`GET /api/webui/ws-token`** — 从 Cookie 读取当前 session，无需额外鉴权参数。Cookie 缺失时返回 `success: false`（状态码 200，不会触发前端 401 刷新），正常时返回：

> **`success`** — 是否获取成功
> **`token`** — 临时 WS Token（`success: true` 时存在）
> **`expires_in`** — 有效秒数（固定 60）
> **`message`** — 错误说明（`success: false` 时存在）

::: code-group

```http [curl 获取 WS 临时 Token ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/ws-token \
  -H "Cookie: maibot_session=你的Token"
```

:::

**安全特性：**

- 临时 Token 为 `token_urlsafe(32)` 随机串，不可预测
- 60 秒超时自动过期，过期 Token 从内存中清理
- 一次性使用，消费后立即从存储中删除，杜绝重放
- 验证时同时校验原始 session 的有效性，防止 session 已失效但临时 Token 仍可用的窗口期

这个机制是 [实时通道与统计](./realtime-and-stats) 文档的前置知识。WebSocket 统一通道、日志流、插件进度推送等端点都需要先通过这个临时 Token 完成握手。

## 接下来

- 完成认证后，按场景跳转：**[系统控制](./system-control)**、**[插件生命周期 API](./plugin-lifecycle-api)**、**[数据与记忆 API](./data-and-memory-api)**、**[实时通道与统计](./realtime-and-stats)**
- 如果只想确认 API 骨架，回到 **[WebUI HTTP API 入口](./index)**
