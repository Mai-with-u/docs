---
title: Email Adapter
---

# Email Adapter

**Connect a dedicated bot mailbox to MaiBot (community-maintained).** The Email Adapter connects a **dedicated bot mailbox** to MaiBot: people send mail to the bot's address, the adapter fetches it over **IMAP**, and MaiBot opens a private chat per sender; Mai's replies go back over **SMTP** and stay in the same MIME thread via `In-Reply-To` / `References` / `Re:` headers. Inbound mail, Reply-All extra recipients, and the proactive send tool are all governed by the same address/domain access lists.

::: info Connection direction
`Sender → mail server (IMAP inbound) → Email Adapter → MaiBot plugin message gateway`
`MaiBot reply → Email Adapter → mail server (SMTP outbound) → recipient`

No webhook is needed on the mailbox side: the adapter prefers IMAP IDLE push and falls back to interval polling when the server does not support IDLE.
:::

Adapter repository (🌐 community-maintained):

<Linkcard url="https://github.com/yufei-pan/maibot-email-adapter" title="maibot-email-adapter" description="yufei-pan's email adapter plugin" />

## 1. Prepare the bot mailbox

Prepare a **dedicated, empty mailbox** for the bot—do not use your personal everyday inbox. The password field expects an **app password / authorization code**, not the web-mail login password.

::: info Requirements
The adapter depends on `aioimaplib` (>= 1.2.0) and `aiosmtplib` (>= 3.0.0), and requires `maibot-plugin-sdk >= 2.5.1`; all of these are declared in `_manifest.json` and handled automatically by MaiBot.
:::

### Gmail: app password

1. Sign in to Google with the bot mailbox and turn on [2-Step Verification](https://myaccount.google.com/signinoptions/twosv);
2. Open [App passwords](https://myaccount.google.com/apppasswords), pick any name (e.g. `maibot`), and create one;
3. Paste the generated 16-character password into the plugin's "App password / authorization code" field—when Google shows it as `xxxx xxxx xxxx xxxx`, you can paste it with the spaces; the plugin strips whitespace automatically;
4. Do **not** use your Google web login password.

If you cannot find the app-password page, common reasons are: 2-Step Verification is not on, 2-Step Verification only allows security keys, Advanced Protection is enabled, or this is a work/school Workspace account whose admin disabled app passwords.

### Provider presets

`mailbox.provider` defaults to `gmail`. Choosing a preset makes the plugin fill in the matching IMAP/SMTP host, port, and TLS mode (only `custom` requires manual entry):

- **Gmail** — IMAP `imap.gmail.com:993` (ssl), SMTP `smtp.gmail.com:587` (starttls); authenticate with an app password
- **Outlook** — IMAP `outlook.office365.com:993` (ssl), SMTP `smtp.office365.com:587` (starttls); personal accounts use an app password
- **QQ Mail** — IMAP `imap.qq.com:993` (ssl), SMTP `smtp.qq.com:465` (ssl); authenticate with an **authorization code**, not the QQ login password

::: warning
Outlook personal mailboxes work with an app password; Microsoft 365 tenants that have disabled basic IMAP authentication cannot be used at this time.
:::

### Custom IMAP/SMTP

With `provider = "custom"` the plugin never overwrites the hosts you entered—configure the IMAP/SMTP host, port, and TLS mode (`ssl` or `starttls`) yourself. For custom IMAP, prefer `ssl` (port 993).

## 2. Configure the MaiBot bot account

In the Host's **Bot settings → Other platforms**, add `email:your-bot-mailbox` (the same address as in the adapter). Without it you can still receive mail, but the Host will report "platform email has no bot account configured" when replying.

::: tip
Host 1.2.0 and later automatically register the mail account reported by the adapter, so there is no need to write it into "Other platforms" (only an info log is recorded).
:::

## 3. Configure the adapter connection

Runtime configuration is edited in the WebUI plugin settings and written to `config.toml` in the plugin directory (it contains the password—do not commit it to version control). Here is a **complete, copy-ready** config template—edit the values per the comments:

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true                # Adapter switch; false = stay idle, do not connect IMAP/SMTP
enable_send_email_tool = false  # proactive send_email tool; when true, Mai can email allowlisted addresses

[mailbox]
provider = "gmail"            # preset: gmail / outlook / qq / custom
address = "mai@example.com"   # full bot mailbox address; also the SMTP sender
password = "app password or authorization code"  # pasted whitespace is stripped automatically
imap_host = "imap.gmail.com"  # only filled manually for custom
imap_port = 993               # default 993
imap_tls = "ssl"              # ssl / starttls
smtp_host = "smtp.gmail.com"  # only filled manually for custom
smtp_port = 587               # default 587
smtp_tls = "starttls"         # ssl / starttls

[access]
mode = "allowlist"            # allowlist (empty list denies everyone) / denylist
allow_addresses = ["you@example.com"]  # allowed full email addresses
allow_domains = []            # allowed domains
deny_addresses = []           # always-rejected addresses
deny_domains = []             # always-rejected domains

[receive]
folder = "INBOX"              # the single IMAP folder to watch
prefer_idle = true            # prefer IMAP IDLE; falls back to polling
poll_interval_sec = 30        # poll interval (sec), range 5–3600
mark_seen_on_inject = true    # mark \Seen only after the Host accepts the mail
max_part_bytes = 10485760     # max bytes per MIME part (10 MiB); oversized attachments are not injected

[send]
reply_all = false             # Cc the original To/Cc recipients when replying
```

:::

After saving, the adapter drops the old connection and reconnects with the new settings—usually no MaiBot restart is needed.

::: tip Access list rules
- Address rules take precedence over domain rules: an address on the allow list passes even if its domain is on the deny list
- Domains match exactly only (`alice@mail.example.com` does not match a listed `example.com`)
- The bot's own address is always skipped to avoid self-loops
- The same lists govern inbound mail, Reply-All extra recipients, and the `send_email` tool
:::

## Verify and troubleshoot

**Confirm the connection** — With `plugin.enabled` set to `true` and complete settings, the adapter connects SMTP first, then IMAP; success means the log shows a connection and the gateway reports ready. Send a mail from an allowlisted address to the bot mailbox—a new private chat should appear in MaiBot.

**Log says "staying idle"** — If the log says the adapter stays idle because the plugin or config is not enabled, `plugin.enabled` is still off; if address, password, or hosts are missing, the log warns about each missing field.

**Login failed** — The log warns "IMAP/SMTP login failed, check the app password or authorization code": make sure you used an app password / authorization code, not the web login password; Gmail requires 2-Step Verification first.

**Receives but cannot reply** — The Host has not registered the mail account. Add `email:your-bot-mailbox` under "Other platforms" in bot settings (Host 1.2.0+ registers it automatically).

**No inbound mail** — The default whitelist mode with an empty list rejects everyone; add the sender to `allow_addresses` first. Also confirm the mail actually lands in the folder watched by `receive.folder` (only `INBOX` by default).

**Connection errors and reconnects** — After a drop, the adapter reconnects with 5 / 10 / 20 / 40 / 300-second backoff; if `starttls` fails on a custom server, try `ssl` with port 993.

**UIDVALIDITY changed** — The warning "IMAP UIDVALIDITY changed, UID cursor reset" is normal (the server rebuilt the folder); the adapter re-fetches unprocessed mail.