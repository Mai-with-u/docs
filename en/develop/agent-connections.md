---
title: External Agent Connections
---

# External Agent Connections

MaiBot can hand work to an external Agent (such as dsh) over ACP. Two uses share the same connection settings: an external Agent running in parallel with normal chat, and letting the Planner of selected chat streams use the external Agent for decisions. Models, credentials, and ACP sessions are all managed by the external program.

The external program needs ACP v1 and HTTP MCP support; restoring saved sessions additionally requires `session/resume`.

## Local dsh CLI

The CLI mode needs no bridge plugin. First confirm `dsh --profile acp` starts in the same user environment that runs MaiBot, then configure:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[agent]
enabled = true        # Enable the external Agent alongside normal chat
connection = "dsh"    # dsh CLI appends --profile acp automatically
acp_command = "dsh"   # On Windows use dsh.cmd or the program's absolute path
```

:::

`acp_command` takes the program only — arguments go into `acp_args` (used by `custom` mode only), and `acp_env` overrides the child process environment, including the `PATH` used to locate the program.

## Letting Specific Chats Use the External Planner

You can skip `enabled` entirely: turn on `planner_enabled` and put the `session_id` of the chats to take over into `planner_sessions`; the main Planner of those chats goes through ACP.

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[agent]
planner_enabled = true               # Experimental master switch; the list is kept when off
planner_sessions = ["qq:123456789"]  # Real chat stream session_id values; an empty list means nothing
connection = "dsh"
```

:::

Each chat stream keeps a persistent session with incremental context sync — restored after a restart, reset when the chat is cleared. Tools still execute in the original chat runtime; a failed connection raises an error instead of falling back to the built-in Planner. Tools the external Agent brings itself follow its own configuration.

## Reaching a Remote dsh CLI over SSH

With MaiBot on host A and dsh on host B, two directions must connect: A calls B's ACP over the SSH standard streams, and B reaches A's MCP tool service through an SSH reverse forward.

Set up SSH keys and confirmed host keys for the user running MaiBot, and create the session directory on B. The example assumes B is Linux with `dsh` at `/usr/local/bin/dsh`:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[agent]
enabled = true
connection = "custom"
acp_command = "ssh"
acp_args = [
    "-T",
    "-o", "BatchMode=yes",
    "-o", "ExitOnForwardFailure=yes",
    "-o", "ServerAliveInterval=15",
    "-o", "ServerAliveCountMax=3",
    "-R", "127.0.0.1:{mcp_port}:127.0.0.1:{mcp_port}",
    "user@server-b",
    "/usr/local/bin/dsh", "--profile", "acp",
]
acp_cwd = ""                          # Directory on A where SSH starts; empty = MaiBot creates one
acp_remote_cwd = "/srv/maibot-agent"  # Existing absolute directory on B, passed to the session as-is
mcp_port = 0                          # 0 = auto-assign a local loopback port
```

:::

`acp_remote_cwd` is never created or expanded on A — do not fill in `~` or relative paths; if the SSH command itself must change directories first, do it explicitly in the remote command.

MaiBot starts the tool service first and then replaces `{mcp_port}` in `acp_args` with the actual port, leaving other braces untouched. The ports must match on both sides so the `http://127.0.0.1:<port>/mcp` handed to dsh tunnels back to MaiBot. The SSH server must allow TCP forwarding; when the remote port is taken, the connection fails immediately with the reason and the task is not retried.

The external Planner creates a tool service per connection, so keeping `mcp_port = 0` avoids local port conflicts. After changing the remote working directory the original session cannot be restored — clear the corresponding chat to start a new session. Before switching hosts, save each instance's session state separately; never reuse one Agent's session ID on another Host.

The remote dsh filesystem is separate from MaiBot's. Tools execute on the MaiBot host, and `agent_talk` image paths must stay inside MaiBot's allowed local directories; sync files explicitly instead of treating a path on B as one on A.

## dsh Desktop

Desktop mode requires the `dsh-maibot-bridge` plugin installed on the Desktop side; once started it generates `~/.dsh/maibot-desktop.json`. Choose `connection = "dsh_desktop"` on the MaiBot side, leave `desktop_manifest` empty to use that default file, or point it at an absolute path.

<Linkcard url="https://github.com/SengokuCola/dsh-maibot-bridge/releases/download/v0.1.1/dsh-maibot-bridge-0.1.1.tgz" title="dsh-maibot-bridge" description="The MaiBot bridge plugin for dsh Desktop, publicly downloadable without a GitHub login" />

The main program does not bundle this plugin; install it with Desktop's own dsh command and restart Desktop, or pick the local source directory in Desktop's plugin install dialog.

::: code-group

```powershell [PowerShell ~vscode-icons:file-type-powershell~]
dsh plugin --profile desktop add https://github.com/SengokuCola/dsh-maibot-bridge/releases/download/v0.1.1/dsh-maibot-bridge-0.1.1.tgz
```

:::

The bridge and the MaiBot tool service listen on loopback only; a remote Desktop connects through an SSH tunnel and never needs a public listener:

::: steps
1. On the MaiBot side, set `acp_remote_cwd` to an absolute directory on the Desktop host and fix `mcp_port` to a free port (for example `48123`). A fixed port suits a single connection — do not share it across several external Planners.
2. Assuming the bridge port in the Desktop manifest is `51234`, keep this tunnel running on the MaiBot host:

   ::: code-group

   ```sh [Bash ~vscode-icons:file-type-shell~]
   ssh -N -T -o ExitOnForwardFailure=yes -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -L 127.0.0.1:48124:127.0.0.1:51234 -R 127.0.0.1:48123:127.0.0.1:48123 user@desktop-host
   ```

   :::

3. Copy the Desktop manifest safely to the MaiBot host, keep `version` and `token`, set `host` to `127.0.0.1` and `port` to the local forward `48124`, and point `desktop_manifest` at the copy.
:::

After a Desktop restart the bridge port and token may change — update the tunnel and the manifest copy accordingly. Never share the manifest or its token. Closing MaiBot only disconnects the bridge; Desktop keeps running.

## Replies, Identity, and Pausing

The external Agent's text is streamed through `session/update` into the execution record shown on the dedicated Agent page of the WebUI; the final `session/prompt` receipt carries only a stop reason, not the full reply body. Handing a task to a normal chat requires calling `agent_talk` with a real session ID — a receipt only means the task is queued, not that a message was sent in the IM.

The normal stop reason is `end_turn`. Other reasons (such as `refusal` or `max_tokens`) and model request errors returned by dsh keep whatever output arrived, clear the in-flight marker, and report a single-round failure without pausing the queue; the source chat receives an internal notification with the task number and the original error. Switching models does not trigger a retry — send "continue" or a new request to re-enter the same session.

Pauses survive restarts. Fault pauses recorded by older versions can be lifted by a new user request or from the WebUI; system input never clears them. Manual pauses always require recovery in the WebUI, and receipts for hand-offs during a pause state clearly that the task was only queued.

## Verification and Troubleshooting

**Verify** — after starting, the Agent page in the WebUI shows the session being established, and sending a task produces streaming output. In external Planner mode, new replies in the target chat come from the external Agent.

**Connection timeout** — `ACP stderr:` in the log shows the external process's diagnostics in real time, and timeouts attach the last 20 stderr lines. Check SSH authentication, port forwarding, dsh model credentials, and the remote directory first.

**Protocol parsing failure** — ACP stdout may contain JSON-RPC protocol lines only; debug output from launch scripts must go to stderr, and SSH must not allocate a pseudo-terminal.

**Remote port occupied** — the connection fails immediately with the reason and is not retried. Pick a free port and update both sides of the forward.

**Task not resent** — disconnections, timeouts, and connection misconfigurations pause the queue; send a new request or recover in the WebUI after fixing. Tasks with unknown results are never resent automatically.
