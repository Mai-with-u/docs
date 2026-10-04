---
title: Auth & Configuration
---

# Auth & Configuration

This page covers the authentication system and first-time setup flow of the WebUI HTTP API, aimed at ops personnel who need scripted management of MaiBot. If you've just opened the [entry page](./index), it's recommended to read the route structure and quick connectivity test first, then come back.

All endpoints in this document are mounted under the `/api/webui` prefix.

## Cookie Token Mechanism

The MaiBot WebUI uses an HttpOnly Cookie to convey authentication credentials. The Cookie name is `maibot_session`. The full lifecycle:

- **Write** — Call `POST /api/webui/auth/verify` with a valid Token. After server-side verification succeeds, the Cookie is issued in `Set-Cookie`, valid for 7 days, with attributes `HttpOnly; SameSite=Lax; Path=/`. In production or when `webui.secure_cookie = true`, the `Secure` flag is added (sent only over HTTPS).
- **Invalidation** — Browser auto-clears after 7 days; server-side `POST /api/webui/auth/logout` clears immediately; calling `update` or `regenerate` to replace the Token also immediately invalidates the old Cookie (since the old Token is no longer valid).
- **Renewal** — There is no built-in silent refresh mechanism. Once the Cookie expires, you must call `/auth/verify` again to log in. Long-running scripts should catch 401 responses and auto re-login.

The Cookie is stored in the TokenManager config file in the same directory as `data/webui.json` and does not depend on any external database.

## Authentication Endpoints in Detail

Five authentication endpoints cover all scenarios from initial login to routine maintenance.

### `POST /api/webui/auth/verify` — Verify Token and Log In

The only endpoint you need to call when first contacting the WebUI. Pass in a Token (obtained from startup logs or config file). After verification passes, you get a Cookie; all subsequent requests rely on it.

**Request body:**

- **`token`** — The Token string to verify, required

**Response body:**

- **`valid`** — Whether verification passed (`true` / `false`)
- **`message`** — Text description of the verification result
- **`is_first_setup`** — Whether this is the first-time setup (`true` / `false`)
- **`token_source`** — Token source, `temporary` or `configured`
- **`requires_custom_token`** — Whether it's recommended to set a custom Token (`true` when token_source is `temporary`)

::: code-group

```http [curl Verify Token ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "你的临时或固定Token"}'
```

:::

If the Token is invalid, the response returns `"valid": false` and includes a reminder when remaining attempts ≤ 2. After 5 consecutive failures, the IP is banned (see [Rate-Limit Security Recommendations](#rate-limit-security-recommendations)).

### `GET /api/webui/auth/check` — Check Login Status

Called on page load by the frontend to check whether the Cookie is still valid. This endpoint does not strictly require authentication (missing Cookie returns only `authenticated: false`, not a 401).

**Response body:**

- **`authenticated`** — Whether currently logged in (`true` / `false`)
- **`token_source`** — Token source (returned only when logged in)
- **`requires_custom_token`** — Whether Token replacement is needed (returned only when logged in)

::: code-group

```http [curl Check Auth Status ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/auth/check \
  -H "Cookie: maibot_session=你的Token"
```

:::

### `POST /api/webui/auth/update` — Replace with Custom Token

Requires current login (valid Token in Cookie). Pass in a new Token that meets strength requirements; the system writes it to the config file and marks `token_source` as `configured`. **After this operation completes, the current Cookie is cleared** — you must re-login with the new Token. Used during first-time setup to replace a temporary Token with a permanent one.

**Request body:**

- **`new_token`** — Custom Token, at least 10 characters, must contain uppercase letters, lowercase letters, and special characters (`!@#$%^&*()_+-=[]{}|;:,.<>?/`)

**Response body:**

- **`success`** — Whether the update succeeded
- **`message`** — Result description

::: code-group

```http [curl Replace Token ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/auth/update \
  -H "Content-Type: application/json" \
  -H "Cookie: maibot_session=你的旧Token" \
  -d '{"new_token": "MyStr0ng!Token2024"}'
```

:::

### `POST /api/webui/auth/regenerate` — Regenerate Random Token

Requires current login. The system generates a new 64-character hex random Token, writes it to the config file, and marks `token_source` as `configured`. **Also clears the current Cookie** — you must re-login with the new Token. Suitable for periodic Token rotation.

**Response body:**

- **`success`** — Whether generation succeeded
- **`token`** — The newly generated Token in plaintext (**visible only this once — save it immediately**)
- **`message`** — Result description

::: code-group

```http [curl Regenerate Token ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/auth/regenerate \
  -H "Cookie: maibot_session=你的当前Token"
```

:::

### `POST /api/webui/auth/logout` — Log Out

Clears the `maibot_session` Cookie. No request body required and no prior login needed (calling while not logged in will not error).

**Response body:**

- **`success`** — Always `true`
- **`message`** — `"已成功登出"`

## Rate-Limit Security Recommendations

The `/auth/verify` endpoint has built-in per-IP failure tracking, with the following behavior:

- **Window** — 5-minute sliding window
- **Threshold** — 5 consecutive failed verifications from the same IP
- **Penalty** — The IP is banned for 10 minutes upon triggering, returning HTTP 429
- **Reset** — Failure count auto-clears on success

Five hardening suggestions:

- **Custom Token length** — Recommend at least 32 random characters, avoid dictionary words
- **Don't expose directly on the public internet** — Default `host: ["127.0.0.1", "::1"]`. If remote access is needed, go through a reverse proxy and configure the proxy IP in `webui.trusted_proxies`
- **HTTPS is mandatory** — Secure Cookie auto-enabled in production mode. If using a reverse proxy, confirm the `X-Forwarded-Proto` header is correctly forwarded
- **Rotate periodically** — Recommend calling `/auth/regenerate` every 30–90 days; old Token becomes invalid immediately
- **`webui.allowed_ips`** — Set an IP whitelist to further reduce attack surface

## First-Setup Complete Flow

On first startup, when TokenManager detects `data/webui.json` does not exist, it auto-generates a temporary Token and prints it in the terminal log. The WebUI frontend detects `token_source === "temporary"` and enters the first-time setup wizard.

Below is the sequence for completing the entire first-time setup via API calls:

### Step 1: Confirm WebUI is Enabled

Start with a health check to confirm the backend is online:

::: code-group

```http [curl Health Check ~vscode-icons:file-type-http~]
curl http://127.0.0.1:8001/api/webui/health
```

:::

Expected response: `{"status": "healthy", "service": "MaiBot WebUI"}`. If there's no response, check whether `webui.enabled` is `true`.

### Step 2: Log In with Temporary Token

Find the temporary Token from the MaiBot startup log — something like `临时Token: a1b2c3d4...` — or directly read the `access_token` field from `data/webui.json`:

::: code-group

```http [curl Login with Temp Token ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "从启动日志中复制的临时Token"}'
```

:::

In the response, `is_first_setup` should be `true` and `token_source` should be `temporary`.

### Step 3: Replace with Permanent Token

Call `/auth/update` to replace the temporary Token with your own strong password. Note that both `update` and `regenerate` clear the Cookie, so after this step you need to call `/auth/verify` again with the new Token to get a new Cookie.

### Step 4: Complete Other Basic Configuration

Use endpoints like `/config/*`, `/person/*`, `/model/*` to finish basic settings (model, persona, adapter, etc.). Specific endpoints for these are covered in their respective sub-pages.

### Step 5: Mark Setup Complete

Call `/setup/complete` to write `first_setup_completed` as `true`. The frontend will exit wizard mode. Subsequent calls to `/auth/verify` will no longer return `is_first_setup: true`.

::: code-group

```http [curl Mark Setup Complete ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/setup/complete \
  -H "Cookie: maibot_session=你的Token"
```

:::

Two additional helper endpoints:

- **`GET /api/webui/setup/status`** — Query current first-setup state (auth required). Returns `is_first_setup`, `token_source`, `requires_custom_token`
- **`POST /api/webui/setup/reset`** — Reset the first-setup state (auth required), allowing re-entry into the setup wizard. Use during migration or debugging

## First-Run Automation Script

The following Bash script simulates the complete first-time setup flow, suitable for batch deployment or CI scenarios. The script assumes the WebUI is listening on `http://127.0.0.1:8001`.

Save the script as `mai_first_setup.sh`, make it executable, then run:

::: code-group

```bash [mai_first_setup.sh ~vscode-icons:file-type-shell~]
#!/usr/bin/env bash
set -euo pipefail

BASE="http://127.0.0.1:8001/api/webui"
CUSTOM_TOKEN="${1:-}"

echo "=== Step 0: Health Check ==="
curl -sf "${BASE}/health"

echo "=== Step 1: Read Temporary Token ==="
TMP_TOKEN=$(python3 -c "import json; print(json.load(open('data/webui.json'))['access_token'])")
echo "Temp Token: ${TMP_TOKEN:0:8}..."

echo "=== Step 2: Login to Get Cookie ==="
RESP=$(curl -sX POST "${BASE}/auth/verify" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"${TMP_TOKEN}\"}")
echo "$RESP" | python3 -m json.tool

if echo "$RESP" | grep -q '"valid": true'; then
  echo "Login successful"
else
  echo "Login failed"; exit 1
fi

if [ -z "$CUSTOM_TOKEN" ]; then
  echo "=== Step 3: Regenerate Permanent Token ==="
  NEW_RESP=$(curl -sX POST "${BASE}/auth/regenerate" \
    -H "Cookie: maibot_session=${TMP_TOKEN}")
  FIXED_TOKEN=$(echo "$NEW_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
  echo "New Token: ${FIXED_TOKEN:0:8}..."
  echo "Full Token (save it securely): $FIXED_TOKEN"
else
  echo "=== Step 3: Use Specified Custom Token ==="
  FIXED_TOKEN="$CUSTOM_TOKEN"
  curl -sX POST "${BASE}/auth/update" \
    -H "Content-Type: application/json" \
    -H "Cookie: maibot_session=${TMP_TOKEN}" \
    -d "{\"new_token\": \"${CUSTOM_TOKEN}\"}"
fi

echo "=== Step 4: Re-login with Permanent Token ==="
curl -sX POST "${BASE}/auth/verify" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"${FIXED_TOKEN}\"}"

echo "=== Step 5: Mark First Setup Complete ==="
curl -sX POST "${BASE}/setup/complete" \
  -H "Cookie: maibot_session=${FIXED_TOKEN}"

echo "=== Done ==="
curl -s "${BASE}/setup/status" \
  -H "Cookie: maibot_session=${FIXED_TOKEN}" \
  | python3 -m json.tool
```

:::

## Token Rotation Examples

Tokens should be rotated periodically. The two examples below demonstrate both rotation methods (`update` and `regenerate`), plus the complete re-login steps after rotation.

### Method A: Replace with Custom Token

Suitable when you use a password manager (e.g., strong passwords generated by Bitwarden or 1Password) and want to share the same Token across multiple machines.

::: code-group

```http [curl Token Rotation (Custom) ~vscode-icons:file-type-http~]
# Step 1: Replace Token (old Cookie is immediately invalidated)
curl -X POST http://127.0.0.1:8001/api/webui/auth/update \
  -H "Content-Type: application/json" \
  -H "Cookie: maibot_session=旧Token" \
  -d '{"new_token": "NewP@ssphrase!2026"}'

# Step 2: Re-login with new Token
curl -X POST http://127.0.0.1:8001/api/webui/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "NewP@ssphrase!2026"}'
```

:::

### Method B: Let the System Regenerate

Suitable when you don't want to invent a Token yourself. The system generates a 64-character hex random string. **Note: the new Token appears in the response only once — save it immediately.**

::: code-group

```http [curl Token Rotation (System Generated) ~vscode-icons:file-type-http~]
# Step 1: Regenerate (old Cookie is immediately invalidated, new Token returned in response)
curl -X POST http://127.0.0.1:8001/api/webui/auth/regenerate \
  -H "Cookie: maibot_session=当前Token"

# Step 2: Extract the token field from the response and use it to re-login
curl -X POST http://127.0.0.1:8001/api/webui/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "上一步返回的新Token"}'
```

:::

## Temporary WebSocket Token

Browser-side WebSocket connections cannot carry custom HTTP Headers and cannot reliably carry Cookies. MaiBot provides a temporary Token mechanism specifically for WebSocket handshakes, acting as a bridge between Cookie authentication and WS connections.

**Workflow:**

1. The browser calls `GET /api/webui/ws-token` with the Cookie
2. After verifying the Cookie is valid, the server generates a `secrets.token_urlsafe(32)` temporary Token, valid for 60 seconds
3. The browser uses this temporary Token as the WebSocket URL query parameter (`?token=...`) to establish the connection
4. The server verifies the temporary Token and **immediately consumes it** (one-time use), and simultaneously checks whether the associated original session Token is still valid
5. If the original session has expired within those 60 seconds, the temporary Token is also rejected

**Endpoint behavior:**

- **`GET /api/webui/ws-token`** — Reads the current session from the Cookie; no additional auth parameters needed. Returns `success: false` (status 200, won't trigger a frontend 401 refresh) when Cookie is missing. On success, returns:

> **`success`** — Whether retrieval succeeded
> **`token`** — Temporary WS Token (present when `success: true`)
> **`expires_in`** — Valid seconds (fixed at 60)
> **`message`** — Error description (present when `success: false`)

::: code-group

```http [curl Get WS Temp Token ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/ws-token \
  -H "Cookie: maibot_session=你的Token"
```

:::

**Security features:**

- Temporary Token is a `token_urlsafe(32)` random string, unpredictable
- 60-second timeout auto-expiry; expired Tokens are cleaned from memory
- One-time use only: consumed and immediately deleted from storage after use, preventing replay
- Simultaneously validates the original session's validity during verification, preventing the window where the session has expired but the temporary Token is still usable

This mechanism is prerequisite knowledge for the [Realtime and Stats](./realtime-and-stats) documentation. WebSocket unified channel, log stream, and plugin progress push endpoints all require completing the handshake via this temporary Token.

## Next Steps

- After authentication, jump by scenario: **[System Control](./system-control)**, **[Plugin Lifecycle API](./plugin-lifecycle-api)**, **[Data and Memory API](./data-and-memory-api)**, **[Realtime and Stats](./realtime-and-stats)**
- If you just want to confirm the API skeleton, go back to **[WebUI HTTP API Entry](./index)**
