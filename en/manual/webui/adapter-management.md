---
title: Adapter Management
---

# Adapter Management

Adapters bring messaging platforms such as QQ and Telegram into MaiBot. The **适配器设置** (Adapter Settings) page under "配置管理" (Configuration) in the sidebar (`/adapter-management`) lists installed adapters, shows the platform accounts they report, and writes group / private-chat allow rules into `config/adapter_policy.toml`.

![Adapter management](/images/webui/adapter-management.webp)

## Adapter list

The page groups adapters by runtime state, with the count next to each group title:

::: fields
- **Running** — loaded and connected to its platform.
- **Loading / Offline** — starting up, or the process has exited.
- **Failed to load** — expand the row to read the reason, update the version, or switch to another adapter from the marketplace.
- **Disabled / Not activated / Runtime not started** — not enabled, not connected to a platform, or the host has not launched it yet.
:::

The switch on each row starts and stops the adapter; the row's `⋮` menu holds "Update to vX" and "Uninstall adapter", and built-in adapters have no menu. "Add connection" in the top right lists only marketplace plugins with `plugin_type = adapter` that are compatible with this build and are not local sources; the standalone NapCat adapter is excluded too. Install one and configure it back in the list; the dialog warns when Git is missing.

## Platform accounts

Once an adapter connects, it reports the account identity it actually holds, and the page stores it as a **discovered account**:

::: fields
- **Account** — platform name plus account ID, for example `qq` and `2814567326`.
- **Online status** — whether the account was online at the last report.
- **Report source** — whether the last report came from the ready event or from an inbound message, plus the timestamp.
:::

The "平台账号" (Platform accounts) button opens the account panel: the upper half lists discovered accounts, where you can delete a record (the adapter rediscovers it on its next report); "已排除账号" (Excluded accounts) folds out with a "恢复身份" (Restore identity) action per row.

Accounts you type by hand live under "备用平台账号" (Fallback platform accounts). They are a fallback identity used only when an adapter reports no identity, and they are saved into `[bot]` of `bot_config.toml`:

::: fields
- **`platform`** — fallback primary platform, for example `qq`.
- **`qq_account`** — fallback QQ account ID.
- **`platforms`** — fallback accounts for other platforms, each written as `platform:account`.
:::

## Allow/Deny defaults

The card at the top of the page sets the global fallback rule: one switch each for group and private chats, "receive" or "don't receive". Any chat that matches no specific rule falls through to this, and it maps to `[defaults.group]` and `[defaults.private]` in `config/adapter_policy.toml`.

## Rules for one adapter

After you select an adapter, the "黑白名单规则" (Allow/Deny rules) column appears only on the config page of a plugin whose `plugin_type = adapter`. While the adapter is not connected to its platform, that column asks you to fix the connection first.

Rules are split into group and private blocks:

::: fields
- **Current account ID** — rules are stored per account ID. After signing in with a different account, the old account's entry stays in the config but no longer applies, and the page notes that the current account has no dedicated rule yet.
- **Default rule** — "receive all messages", "don't receive by default", or "match global settings". The last one means this layer says nothing and defers to the defaults at the top of the page.
- **Allow list / Deny list** — when messages are received by default you only fill the deny list; when they are not, you only fill the allow list. Both accept `*` to match everything.
:::

Every ID in a list has a switch: turning it off suspends that ID from matching but keeps the record, and turning it back on resumes it. Deny is checked before allow, and the backend rejects saving the same ID into both lists.

IDs must match the group ID or user ID the adapter reports exactly. Group lists render the group avatar and name so you can confirm the ID belongs to the group you mean.

Edits autosave 2 seconds after you stop typing, and the toolbar shows "已保存 HH:MM:SS" (saved) or "未保存的更改" (unsaved changes). Once the adapter disconnects, rule ownership can no longer be determined, so the draft is not submitted.

## Policy groups

Rules for one adapter can be kept as several groups and switched per scenario:

::: fields
- **Switch group** — saves and applies immediately, writing the current draft back to its original group first.
- **New group** — inherits the global settings with empty lists and needs a name that is not already taken; you switch to it yourself after creating it.
- **Copy current group** — copies every rule of the current group and leaves that group active.
- **Manage groups** — deletes groups. The active group cannot be deleted; switch away first.
:::

## Scope of effect

After saving, the file watcher re-reads `config/adapter_policy.toml`, and running sessions that the new rules now block are stopped and deregistered right away — no host restart needed.

The built-in chat room, the WebUI chat room, and the local console are exempt from adapter rules; no rule can block them.

For precedence between entries, all six identity fields, and `disabled`, see [Access Policy and Account Routing](/en/develop/adapters/policy).

## Verification and troubleshooting

**Verification**: send a message in an allowed test group and MaiBot replies; add that group to the deny list and the same message no longer triggers a reply.

- **The list is empty** — install an adapter through "Add connection"; if it is installed but missing, confirm its `plugin_type` is `adapter`.
- **No "Allow/Deny rules" column** — that column appears only when you open an adapter on `/adapter-management`, not on the plugin detail page.
- **The rules column asks you to connect first** — the adapter has not reported an account identity yet; fix the connection config and enable it.
- **A denied group still gets replies** — check the ID matches what the adapter reports exactly: matching is exact equality or `*`, never a prefix match. Then confirm that ID's switch is on.
- **Old rules stop applying after switching accounts** — expected: rules are stored per account ID, so configure the new account.

## Related docs

- [Connect platforms](../adapters/index.md) — choosing, installing and connecting adapters
- [Bot config](../configuration/bot-config.md) — platform account and other configuration items