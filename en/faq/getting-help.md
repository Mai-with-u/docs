---
title: Getting Help
---

# Getting Help

This page shows how to get help efficiently: what to check before asking, what to include in an issue, which community channels exist, and how to export logs. Read it in order before asking—your problem will be solved faster.

## Self-Check Before Asking

Before asking for help, take 2 minutes to do the following checks — most problems can be resolved on your own:

**`📖 1. Consult the Official Documentation`**
: Your problem has likely already been answered in various scenarios of this document. Search through it first — it saves time and effort.

**`🔍 2. Check the Error Logs`**
: The logs will specify the specific error cause and stack trace — this is the primary clue for locating the problem. Don't know how to export them? See "How to Get Logs" below.

**`⚙️ 3. Review Recent Changes`**
: Think back to what configuration you recently changed, what plugins you installed, or what versions you updated. Try reverting to the last working state to confirm if something was changed incorrectly.

**`🌐 4. Search Known Issues`**
: Use error keywords to search [GitHub Issues](https://github.com/Mai-with-u/docs/issues) or search engines to see if others have encountered the same problem.

## Information Checklist for Submitting an Issue

When submitting an Issue on GitHub, please be sure to include the following information. Issues missing key information may be delayed:

**`🖥️ System and Environment`**
: Operating system type and version, deployment method (source/Docker), Python version (for source deployment)

**`🔢 MaiBot Version`**
: Run `git log --oneline -1` to view the current commit, or get the version number from the bottom of WebUI

**`📄 Complete Error Logs`**
: Log snippets containing the stack trace (traceback) — don't just screenshot a small portion. See "How to Get Logs" below

**`⚙️ Related Configuration`**
: Configuration content related to the problem (be sure to redact sensitive information like API Keys)

**`🎯 Reproduction Steps`**
: Specific steps from startup to error occurrence — the more detailed, the better

## Community Support Channels

**`💬 QQ Group`**
: Join the MaiBot user community to exchange experiences with other users. Group numbers and what each group is for: see [Community Groups](/en/about/community)

**`🐱 GitHub Issues`**
: If you've confirmed it's a bug or feature suggestion, please submit at [GitHub Issues](https://github.com/Mai-with-u/docs/issues). Remember to search first to avoid duplicates

**`📖 Official Documentation Site`**
: For the latest and most comprehensive documentation, visit [MaiBot Documentation Site](https://docs.mai-mai.org/)

**`💬 GitHub Discussions`**
: For feature discussions and technical questions, visit [GitHub Discussions](https://github.com/Mai-with-u/docs/discussions) to join the community conversation

## How to Get Logs

Depending on your deployment method, the way to get logs differs:

**`🐍 Source Deployment`**
: The terminal output where MaiBot is running is the most direct log. If the terminal has been closed, check the log files as follows:

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# View the latest log file (JSONL format, one entry per line)
cat logs/$(ls -t logs/app_*.log.jsonl | head -1)
```

:::

If you need more detailed logs, enable DEBUG level in `config/bot_config.toml`:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[log]
log_level = "DEBUG"
```

:::

**`🐳 Docker Deployment`**
: Use the `docker logs` command to view container logs:

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# View all logs
docker logs maibot

# Continuously follow log output
docker logs -f maibot

# View only the last 100 lines
docker logs --tail 100 maibot
```

:::

**`🪟 Windows Deployment`**
: Log files are located in the `logs\` directory by default:

::: code-group

```powershell [PowerShell ~vscode-icons:file-type-powershell~]
# View the latest log file (JSONL format, one entry per line)
type logs\app_*.log.jsonl

# Or using PowerShell
Get-ChildItem logs\app_*.log.jsonl | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content
```

:::

> 💡 **Tip**: After getting the logs, wrap them in a ` ``` ` code block and paste them into the Issue. If the logs are very long, only include the section from the last startup to the error — don't paste thousands of lines of complete logs.

## Related

- [Error Troubleshooting Overview](/en/faq/error-troubleshooting) — error code quick reference, keyword index, and the troubleshooting flowchart.
- [Startup and Access Troubleshooting](/en/faq/troubleshooting-startup) — configuration files, MCP, ports, and WebUI access or login.
- [Model and Rule Troubleshooting](/en/faq/troubleshooting-model) — API keys, network timeouts, regular expressions, and keyword rules.
- [Runtime and Data Troubleshooting](/en/faq/troubleshooting-runtime) — missing replies, databases, emojis, memory, disk space, and data anomalies.
- [Plugin and Adapter Troubleshooting](/en/faq/troubleshooting-plugins-adapters) — plugin loading failures, adapter connections, and reconnects.
