---
title: Avatar API
---

# Avatar API

Adapter plugins provide user and group avatars through the public API `adapter.avatar.get`; the Host downloads, validates, and caches the images. Plugins query avatars through the SDK, and the WebUI reads them through a separate image endpoint. Messages and chat stream data carry no avatar image bytes or base64.

## Adapter Protocol

Declare an API method with `version="1"` and `public=True` on your existing adapter plugin class. The following example shows the method signature and response structure; replace `url` with the target's actual avatar address on the platform:

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
- **`platform`** — The target's platform.
- **`target_id`** — The user ID or group ID on that platform.
- **`target_type`** — `user` or `group`, defaulting to `user`.
- **`account_id`** — Account routing identifier, defaulting to an empty string.
- **`scope`** — Connection or scope routing identifier, defaulting to an empty string.
:::

The Host resolves the adapter plugin through the Platform IO route for `platform`, `account_id`, and `scope`, then calls the API by that plugin's ID. It does not randomly pick another plugin with the same API name. Supply the appropriate route in deployments with multiple accounts or connections. When no platform-level send binding exists, a receive-only adapter may also provide avatars; ambiguous candidates from multiple plugins raise an error and require `account_id` and `scope` to identify the route.

The returned dictionary uses these statuses:

::: fields
- **`available`** — An avatar is available. `url` is required; `expires_in` is a positive number of seconds, defaulting to `86400` when omitted. The Host caches it for at most 24 hours.
- **`unsupported`** — The platform or target type does not support avatars. No `url` is required.
- **`missing`** — Avatar queries are supported, but this target has no avatar. No `url` is required.
:::

The Host returns `unsupported` when no suitable adapter plugin is available or the plugin has not declared a public version `1` API. Query exceptions, download failures, and protocol errors must surface as errors, without returning an old avatar or an avatar from another platform.

The `url` must be an HTTP(S) image address that the Host can read directly, without embedded credentials, cookies, or redirects. Local file paths and base64 images are outside this protocol. Images are limited to 5 MB (`5 * 1024 * 1024` bytes), with JPG, PNG, WebP, GIF, and BMP supported. The Host validates the image format and integrity after downloading.

## SDK Calls

Add `chat.get_avatar` to the calling plugin's `capabilities` array in `_manifest.json`, keeping its other capability declarations. See [Manifest](/en/plugin/manifest) for the field definition.

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
- **`status`** — `available`, `unsupported`, or `missing`, with the same meanings as in the adapter protocol.
- **`url`** — For `available`, the adapter's HTTP(S) avatar source address, which can be downloaded independently; `None` for the other statuses. The result contains no image bytes or Host file path.
- **`expires_at`** — A Unix timestamp in seconds indicating when the Host cache expires.
:::

The SDK and WebUI share the Host avatar service, image cache, and expiry rules. `force_refresh=True` skips the existing cache and queries and downloads again; an ongoing refresh for the same target is reused. Query, protocol validation, and download failures surface through the capability call. See [SDK Avatar Queries](/en/plugin/api-reference#chat-avatar) for the calling reference.

## WebUI Image Endpoint

`GET /api/webui/avatar` requires WebUI login authentication. Supply `platform` and exactly one non-empty `user_id` or `group_id`. Optional parameters are `account_id`, `scope` (both default to empty strings), and `force_refresh` (defaults to `false`; use `true` to force a refresh).

For remote avatars, the shared service queries the routed adapter, downloads and validates the image, and returns the cached file. Responses have these meanings:

::: fields
- **`200`** — An image file with the corresponding image `Content-Type`.
- **`400`** — Invalid target parameters, such as supplying both or neither of `user_id` and `group_id`.
- **`404`** — The remote result is `unsupported` or `missing`. The JSON response is respectively `{"detail":{"status":"unsupported"}}` or `{"detail":{"status":"missing"}}`; the UI displays a default avatar.
- **`502`** — Routing, adapter invocation, protocol validation, or download failed. `detail` contains the error information.
:::

`platform=webui` reads a locally uploaded avatar, returning 404 with a text error detail when none exists. Local avatars are persistent resources, are exempt from remote cache expiry, and use `Cache-Control: private, no-cache`. See the [WebUI Avatar API](/en/develop/webui-api/data-and-memory-api#avatar-api) for the upload endpoint.

## Caching and Refresh

- **Successful results** — Cached for the adapter's `expires_in`, capped at 24 hours. The next request after expiry queries and downloads again.
- **No-avatar results** — The Host caches `unsupported` / `missing` for 5 minutes.
- **Failures** — Errors are not cached, and failed requests do not fall back to expired images.
- **Cache isolation** — The key includes platform, account, connection or scope, target type, and target ID. Concurrent refreshes for the same key are combined. Image files and JSON metadata are each replaced atomically; old images are removed when the format changes or the avatar disappears.
- **Storage** — Remote caches live in `data/avatar/remote/`. Old caches under `data/avatar/qq/` without expiry metadata are no longer read.
- **Successful images in the browser** — Use `private, max-age=...` for at most 5 minutes, capped by the remaining Host cache lifetime. Successful forced refresh responses use `private, no-store`.
- **No-avatar responses in the browser** — The 404 responses for `unsupported` / `missing` use `private, max-age=300`, including when a forced refresh returns either status.

Already open pages do not reload avatar images on a timer; cache expiry takes effect on the next image request.

## Verify and Troubleshoot

After logging in to the WebUI, request `/api/webui/avatar?platform=qq&user_id=1026294844&force_refresh=true`, replacing the platform and ID with a target supported by your current adapter. Include `account_id` and `scope` for deployments with multiple accounts. An existing, supported avatar should return 200 and an image.

- **`unsupported`** — Check that the route selects the intended plugin, that it publicly registers version `1` of `adapter.avatar.get`, and that it supports the target type.
- **`missing`** — The adapter supports the query, but the target has no avatar; the UI should display a default avatar.
- **502** — Use `detail` to check for ambiguous routing, adapter errors, URL reachability, redirects, image size, and image format.
- **An old image remains after an update** — Make a new image request with `force_refresh=true` and inspect the cache headers. An already open page does not reload automatically.
