---
title: 头像接口
---

# 头像接口

适配器插件通过公开 API `adapter.avatar.get` 提供用户和群头像，Host 负责下载、校验与缓存。插件通过 SDK 查询头像，WebUI 通过独立图片端点读取；消息与聊天流数据不携带头像图片字节或 base64。

## 适配器协议

在现有适配器插件类上声明 `version="1"`、`public=True` 的 API 方法。下面展示方法签名与返回结构，`url` 应替换为目标在平台上的实际头像地址：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from typing import Any, Dict

from maibot_sdk import API


@API("adapter.avatar.get", version="1", public=True)
async def get_avatar(
    self,
    platform: str,
    target_id: str,
    target_type: str = "user",
    account_id: str = "",
    scope: str = "",
) -> Dict[str, Any]:
    return {
        "status": "available",
        "url": "https://example.com/avatar.png",
        "expires_in": 86400,
    }
```

:::

::: fields
- **`platform`** — 目标所属平台。
- **`target_id`** — 平台上的用户 ID 或群 ID。
- **`target_type`** — `user` 或 `group`，默认 `user`。
- **`account_id`** — 账号路由标识，默认空字符串。
- **`scope`** — 连接或作用域路由标识，默认空字符串。
:::

Host 按 Platform IO 的 `platform`、`account_id`、`scope` 路由找到适配器插件，再按该插件 ID 调用 API。同名 API 不会跨插件随机选取；多账号或多连接部署应传入对应路由。没有平台级发送绑定时，也允许仅接收的适配器提供头像；候选包含多个插件且无法确定归属时会报错，需要补充 `account_id` 和 `scope`。

返回的字典使用以下状态：

::: fields
- **`available`** — 可以获取头像。`url` 必填；`expires_in` 为正数秒数，省略时为 `86400`，Host 最多缓存 24 小时。
- **`unsupported`** — 平台或目标类型不支持头像，无需返回 `url`。
- **`missing`** — 支持查询，但该目标没有头像，无需返回 `url`。
:::

没有可用的适配器插件，或插件没有声明版本 `1` 的公开 API 时，Host 返回 `unsupported`。查询异常、下载失败和协议错误应暴露为错误，不返回旧头像或改用其他平台的头像。

`url` 必须是 Host 可直接读取的 HTTP(S) 图片地址，不含凭据，不需要 Cookie 或重定向。本地文件路径和图片 base64 不属于此协议。图片上限为 5 MB（`5 * 1024 * 1024` 字节），支持 JPG、PNG、WebP、GIF、BMP；Host 下载后校验图片格式与完整性。

## SDK 调用

调用方在 `_manifest.json` 的 `capabilities` 数组中加入 `chat.get_avatar`，保留插件原有的其他能力声明。字段说明见 [Manifest](/plugin/manifest)。

::: code-group

```python [Python ~vscode-icons:file-type-python~]
avatar = await self.ctx.chat.get_avatar(
    platform="qq",
    target_id="1026294844",
    target_type="user",
    account_id="",
    scope="",
    force_refresh=False,
)
if avatar["status"] == "available":
    url = avatar["url"]
    expires_at = avatar["expires_at"]
```

:::

::: fields
- **`status`** — `available`、`unsupported` 或 `missing`，含义与适配器协议一致。
- **`url`** — `available` 时为适配器提供的 HTTP(S) 头像源地址，可独立下载；其他状态为 `None`。结果不包含图片字节或 Host 文件路径。
- **`expires_at`** — Host 缓存到期的 Unix 时间戳，单位为秒。
:::

SDK 与 WebUI 共用 Host 头像服务、图片缓存和过期规则。`force_refresh=True` 跳过现有缓存并重新查询、下载；同一目标已有刷新任务时复用该任务。查询、协议校验或下载失败时，异常通过能力调用暴露。调用参考见 [SDK 头像查询](/plugin/api-reference#chat-avatar)。

## WebUI 图片入口

`GET /api/webui/avatar` 需要 WebUI 登录认证。必填 `platform`，并且必须且只能提供一个非空的 `user_id` 或 `group_id`。可选参数为 `account_id`、`scope`（默认空字符串）和 `force_refresh`（默认 `false`，强制刷新时传 `true`）。

远程头像由统一服务按路由查询适配器，下载校验后返回缓存图片。响应含义如下：

::: fields
- **`200`** — 图片文件，`Content-Type` 对应图片格式。
- **`400`** — 目标参数不合法，例如同时指定或同时遗漏 `user_id` 和 `group_id`。
- **`404`** — 远程结果为 `unsupported` 或 `missing`，JSON 响应分别为 `{"detail":{"status":"unsupported"}}` 或 `{"detail":{"status":"missing"}}`，由界面显示默认头像。
- **`502`** — 路由、适配器调用、协议校验或下载失败，`detail` 包含错误信息。
:::

`platform=webui` 读取本地上传头像，未上传时返回 404 和文字错误信息。本地头像是持久资源，不应用远程缓存过期规则，响应使用 `Cache-Control: private, no-cache`；上传接口见 [WebUI 头像 API](/develop/webui-api/data-and-memory-api#avatar-api)。

## 缓存与刷新

- **成功结果** — 有效期取适配器的 `expires_in`，最多 24 小时；到期后在下一次请求时重新查询并下载。
- **无头像结果** — `unsupported` / `missing` 在 Host 缓存 5 分钟。
- **失败结果** — 错误不缓存，失败请求不使用过期图片兜底。
- **缓存隔离** — 缓存键包含平台、账号、连接或作用域、目标类型和目标 ID。同一键的并发刷新请求合并；图片文件与 JSON 元数据分别原子替换，格式变化或头像消失时删除旧图片。
- **存储目录** — 远程缓存位于 `data/avatar/remote/`。旧的 `data/avatar/qq/` 无有效期缓存不再读取。
- **浏览器中的成功图片** — 使用 `private, max-age=...`，最多缓存 5 分钟，且不超过 Host 缓存剩余有效期；强制刷新成功响应使用 `private, no-store`。
- **浏览器中的无头像响应** — `unsupported` / `missing` 的 404 响应使用 `private, max-age=300`，强制刷新得到这两种状态时也一样。

已经打开的页面不会定时重载头像图片；缓存过期在下一次图片请求时生效。

## 验证与排错

登录 WebUI 后，请求 `/api/webui/avatar?platform=qq&user_id=1026294844&force_refresh=true`，将平台和 ID 换成当前适配器支持的目标；多账号部署同时传入 `account_id`、`scope`。支持且存在头像时应返回 200 和图片。

- **返回 `unsupported`** — 检查路由是否指向预期插件，以及插件是否公开注册了版本 `1` 的 `adapter.avatar.get`，再确认目标类型是否受支持。
- **返回 `missing`** — 适配器已支持查询，但目标没有头像；界面应显示默认头像。
- **返回 502** — 根据 `detail` 检查路由歧义、适配器异常、URL 可达性、重定向、图片大小和格式。
- **更新后仍显示旧图** — 发起新的图片请求并加 `force_refresh=true`；检查返回的缓存头，已打开页面不会自动重载。
