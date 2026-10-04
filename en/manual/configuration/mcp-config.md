---
title: MCP Configuration
---
# MCP Configuration

MCP (Model Context Protocol) enables MaiBot to connect with external tools, transforming it from "just chatting" to "both speaking and acting" — checking weather, searching news, reading files, calling APIs, and more, all within reach. All of the configuration lives under the `[mcp]` section of `bot_config.toml`, covered below in the order "master switch → client capabilities → server list".

::: tip 💡 Understand the Concepts First
If you are not yet familiar with what MCP is, see the [MCP integration developer guide](/en/develop/mcp-integration) for its overall design.
:::

## Configuration Structure Overview

MCP configuration is located under the `[mcp]` section in `bot_config.toml`, divided into three levels:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[mcp]
enable = true                         # Master switch

[mcp.client]                          # Client host capabilities
client_name = "MaiBot"
client_version = "1.0.0"

[mcp.client.roots]                    # Roots capability (exposing local paths to the server)
enable = false

[mcp.client.sampling]                 # Sampling capability (allowing the server to call your model)
enable = false
task_name = "planner"

[mcp.client.elicitation]              # Elicitation capability (allowing the server to request users to fill out forms)
enable = false
allow_form = true
allow_url = false

[[mcp.servers]]                       # MCP server list (multiple allowed)
name = "my-server"
enabled = true
transport = "stdio"
command = "uvx"
args = ["some-mcp-server"]
env = { }
url = ""
headers = { }
http_timeout_seconds = 30.0
read_timeout_seconds = 300.0

[mcp.servers.authorization]
mode = "none"
bearer_token = ""
```

:::

---

## Master Switch

- **`enable`** — Whether to enable MCP. When set to `false`, no MCP servers will be connected. Enabled by default.

---

## Client Capabilities

This section configures MaiBot's capabilities when acting as an MCP **client**, declaring them to the server.

### Basic Information

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[mcp.client]
client_name = "MaiBot"
client_version = "1.0.0"
```

:::

Generally, no changes are needed unless you want the MCP server to see a different client identifier.

- **`client_name`** — The client implementation name. Default: `"MaiBot"`
- **`client_version`** — The client implementation version. Default: `"1.0.0"`

### Roots Capabilities

Roots allow you to expose local file system paths to the MCP server, enabling the server to read and write files within those paths.

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[mcp.client.roots]
enable = true

[[mcp.client.roots.items]]
enabled = true
uri = "file:///home/mai/data"
name = "MaiMai's Data Directory"
```

:::

- **`enable`** — Whether to expose Roots capabilities to the MCP server. Default: disabled
- **`items`** — The list of Roots. Default: empty

Each Root item:

- **`enabled`** — Whether to enable. Default: enabled
- **`uri`** — The Root URI, typically a `file://` path. Required when enabled. Default: empty
- **`name`** — The display name. Default: empty

::: tip 💡 What are Roots used for?
If connected to a file system MCP server (e.g., `@modelcontextprotocol/server-filesystem`), enabling Roots allows the server to know where your data directory is, thereby reading and writing files within that directory.
:::

### Sampling Capabilities

Sampling allows the MCP server to **request MaiBot to call a large language model** in reverse to complete certain tasks. This is an advanced bidirectional capability.

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[mcp.client.sampling]
enable = true
task_name = "planner"
include_context_support = false
tool_support = true
```

:::

- **`enable`** — Whether to enable the Sampling capability declaration. Default: disabled
- **`task_name`** — The main program model task name used when executing Sampling requests. Default: `"planner"`
- **`include_context_support`** — Whether to declare support for `includeContext` semantics other than `none`. Default: disabled
- **`tool_support`** — Whether to declare support for continuing to use tools within Sampling. Default: disabled

::: warning ⚠️ Sampling consumes Tokens
Enabling Sampling means the MCP server can trigger MaiBot's model calls, incurring additional API costs. Ensure `task_name` points to a configured model task.
:::

### Elicitation Capabilities

Elicitation allows the MCP server to request users to fill out forms or open URLs in a browser.

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[mcp.client.elicitation]
enable = true
allow_form = true
allow_url = false
```

:::

- **`enable`** — Whether to enable the Elicitation capability declaration. Default: disabled
- **`allow_form`** — Whether to allow form-mode Elicitation. Default: enabled
- **`allow_url`** — Whether to allow URL-mode Elicitation. Default: disabled

At least one mode (`allow_form` or `allow_url`) must be allowed when enabled.

---

## Server Configuration

This is the most commonly used section — configure the MCP servers you want to connect to. **Multiple servers can be configured**, with each `[[mcp.servers]]` block corresponding to one server.

### Common Fields

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[mcp.servers]]
name = "playwright"
enabled = true
transport = "stdio"           # or "streamable_http", "sse"
http_timeout_seconds = 30.0
read_timeout_seconds = 300.0
```

:::

- **`name`** — **Required**. Server name, must be unique within the same configuration. Defaults to empty.
- **`enabled`** — Whether to enable the current server. Defaults to enabled.
- **`transport`** — Transport method, `"stdio"` (default), `"streamable_http"`, `"sse"`
- **`http_timeout_seconds`** — HTTP request timeout (seconds). Defaults to 30.0
- **`read_timeout_seconds`** — Session read timeout (seconds). Defaults to 300.0

### stdio Mode

Runs the MCP server by launching a local subprocess, suitable for locally installed tools. Key fields:

- **`command`** — Startup command, such as `uvx`, `npx`, `python`
- **`args`** — List of command arguments
- **`env`** — Additional environment variables

#### Running via uvx (Recommended)

uvx is a runner tool included with [uv](https://docs.astral.sh/uv/) that automatically manages dependencies:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[mcp.servers]]
name = "playwright"
transport = "stdio"
command = "uvx"
args = ["@playwright/mcp"]
```

:::

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[mcp.servers]]
name = "mcp-sse"
transport = "stdio"
command = "uvx"
args = ["mcp-sse-server", "--port", "8080"]
```

:::

#### Running via npx

Node.js must be installed first:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[mcp.servers]]
name = "github"
transport = "stdio"
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]
env = { GITHUB_TOKEN = "ghp_your_token_here" }
```

:::

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[mcp.servers]]
name = "filesystem"
transport = "stdio"
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]
```

:::

#### Running via Python

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[mcp.servers]]
name = "my-python-mcp"
transport = "stdio"
command = "python"
args = ["-m", "my_mcp_server"]
env = { PYTHONUNBUFFERED = "1" }
```

:::

### streamable_http Mode

Connects to remote MCP services (HTTP endpoints), suitable for cloud services or tools deployed by others. Key fields:

- **`url`** — MCP endpoint address, required
- **`headers`** — Additional HTTP request headers
- **`authorization`** — HTTP authentication configuration

#### Remote Service Without Authentication

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[mcp.servers]]
name = "public-weather-mcp"
transport = "streamable_http"
url = "https://mcp.example.com/weather"

[mcp.servers.authorization]
mode = "none"
```

:::

#### Remote Service With Bearer Token

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[mcp.servers]]
name = "private-api-mcp"
transport = "streamable_http"
url = "https://api.example.com/mcp"
headers = { "X-Custom-Header" = "custom-value" }

[mcp.servers.authorization]
mode = "bearer"
bearer_token = "sk-your-bearer-token"
```

:::

#### Remote Service With Custom Request Headers

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[mcp.servers]]
name = "enterprise-mcp"
transport = "streamable_http"
url = "https://internal.example.com/mcp/v1"
headers = {
    "X-API-Key" = "your-api-key",
    "X-Tenant-ID" = "tenant-001",
}
```

:::

---

## Complete Example

### Basic Configuration: Connect to a Single Service

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[mcp]
enable = true

[[mcp.servers]]
name = "playwright"
transport = "stdio"
command = "uvx"
args = ["@playwright/mcp"]
```

:::

This is the simplest configuration — just one line `enable = true` plus a single service, with everything else using default values.

### Daily Use Configuration: Two Services + Basic Capabilities

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[mcp]
enable = true

[mcp.client]
client_name = "MaiBot"
client_version = "1.0.0"

# Connect to Playwright (browser automation)
[[mcp.servers]]
name = "playwright"
transport = "stdio"
command = "uvx"
args = ["@playwright/mcp"]

# Connect to the filesystem server
[[mcp.servers]]
name = "filesystem"
transport = "stdio"
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
```

:::

### Advanced Configuration: Enable Sampling + Roots

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[mcp]
enable = true

[mcp.client]
client_name = "MaiBot"
client_version = "1.0.0"

[mcp.client.roots]
enable = true

[[mcp.client.roots.items]]
enabled = true
uri = "file:///home/mai/data"
name = "Data Directory"

[mcp.client.sampling]
enable = true
task_name = "planner"
tool_support = true

# Local service
[[mcp.servers]]
name = "playwright"
transport = "stdio"
command = "uvx"
args = ["@playwright/mcp"]

# Remote service
[[mcp.servers]]
name = "weather-api"
transport = "streamable_http"
url = "https://mcp.example.com/weather"
```

:::

---

## Frequently Asked Questions

### Q: Configuration changes are not taking effect?

After saving the configuration, you **must restart MaiBot** for the changes to take effect. The startup logs will display the connection result:

```
✓ MCP server 'playwright' connected (Tools 12 / Prompts 0 / Resources 0 / Templates 0)
```

If the connection fails, a warning log will appear:

```
⚠️ MCP server 'playwright' connection failed: ...
```

### Q: How many services can be configured?

There is no hard limit, but each service consumes resources. It is recommended to configure only the services you actually need.

### Q: How to find MCP services online?

- Search for projects under the `modelcontextprotocol` organization on GitHub
- Search for `@modelcontextprotocol` packages on npm
- The Python community has server implementations within the `mcp` ecosystem

### Q: How to choose between stdio, streamable_http, and sse?

- **stdio**: Locally installed tools with low latency and no network requirement. Suitable for file operations, local computations, etc.
- **streamable_http**: Remote HTTP services requiring network access. Suitable for cloud APIs and services deployed by others.
- **sse**: Remote SSE (Server-Sent Events) services, suitable for scenarios requiring server-side event pushing.

### Q: Where to obtain the API Token?

It depends on the service you are connecting to. For GitHub MCP, go to GitHub Settings → Developer settings → Personal access tokens to generate one. For other third-party services, obtain the token from the management console of the respective service.

---

## Next Steps

- To learn about MCP's overall design → [MCP integration developer guide](/en/develop/mcp-integration)
- To view all configuration options → [Bot Configuration](./bot-config.md)
