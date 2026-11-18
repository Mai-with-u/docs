---
title: Migrating Chat Streams
---

# Migrating Chat Streams

Copy-merge one chat stream's history, configuration and learned results into another, so context survives a group change, a new account, or merging similar conversations. The entry point is WebUI **数据管理 → 聊天迁移** (Data management → Chat migration).

## What it does

Pick an existing source and target chat stream, preview the data, resolve each conflict, then execute. No platform, account, group/private combination is restricted — source and target may be different kinds of chat stream.

The migration is a copy-merge: the source is neither deleted nor redirected to the target. The target keeps its own sending identity, and historical messages keep their original platform, sender and content.

Only both sides' inbound handling, chat instances and matching memory tasks pause during the migration; other chat streams keep running. Queued inbound messages resume once the pause lifts, and an existing manual pause is left unchanged.

## What moves

These are migrated:

::: fields
- **Chat records** — messages, tool records, usage, observation and reply evaluation records, attachment bindings.
- **Learned results** — expressions, jargon, learned commands, word frequency.
- **Statistics and relations** — chat usage summaries and [sharing group](/en/manual/webui/sharing-groups) membership.
- **Chat configuration** — rules matched exactly by source platform, target and chat type.
- **Long-term memory** — paragraph ownership, facts and evidence, episodes, image references and summary checkpoints inside the target chat's scope.
:::

These are not:

- Attachment contents reuse the files already in the instance; nothing is copied.
- Global resources and plugin-private storage are not copied.
- Global config, adapter accounts and send/receive allowlists do not change with the chat migration.
- Instance-wide message, tool and model totals counted from real events do not grow through copying.

Long-term memory overwrites the target chat's scope: memory from the source, other chat streams, global scope and persons is preserved, and vectors and image assets shared by content hash are not regenerated. An empty source clears the target's matching scope, which you must confirm explicitly before executing.

## Previewing and resolving conflicts

Choose the source and target under **数据管理 → 聊天迁移**, then preview. The preview shows change counts per data class and lists pending items grouped as configuration, expression, jargon and command.

::: fields
- **Configuration conflicts** — a target with no custom config or still on defaults adopts the source config automatically and says so in the preview; differences in customised config need a per-item choice.
- **Other conflicts** — both sides are shown by readable field, with buttons to keep either one.
- **Unmigrated records** — records the source already processed still get per-item expression, jargon and command checks; they are not skipped.
:::

Submission is allowed only once every pending item has a decision. A jargon entry already linked to both sides is skipped without a conflict; the same jargon text in different records still gets per-item handling, and choosing the source only drops the old target link without touching other chat streams.

Data and configuration are re-checked before execution. If either changed since the preview, preview again rather than reusing the old result.

## Executing and recovering

Execute after confirming the target's long-term memory will be overwritten. The job continues in the background on the server and leaving the page does not cancel it; reopen progress from **迁移记录** (Migration records).

Stage records across databases, configuration and memory drive failure recovery: configuration and memory already changed are restored before the main database commits, and caches are refreshed after it commits. If the process exits unexpectedly, click **恢复迁移任务** (Recover migration job) in the migration records, then create a new preview once recovery finishes.

Re-running a migration only appends new data or new contributions: ordinary records are de-duplicated by source chat stream plus source record ID, so totals are never double-counted, and circular migrations do not accumulate repeatedly.

## Verification and troubleshooting

**Verify**: after the migration, open the target chat stream under **聊天管理** (Chat management) — history should match the source and messages should still show their original senders. Then mention something the source talked about and long-term memory should retrieve it.

- **Preview unavailable** — pick both source and target, and they must not be the same chat stream.
- **Preview reported stale** — data or configuration changed between preview and execution; preview again.
- **Pending items remain** — every conflict needs a choice before submission; check whether a filter is hiding unresolved items.
- **Target long-term memory wiped** — an empty source scope clears the target's scope; this is an explicit confirmation in the preview, so read the counts first.
- **Job seems to vanish after leaving the page** — it keeps running on the server; check its status under **迁移记录** rather than re-executing.
- **Recovery reports later modifications** — recovery never silently overwrites newer data and keeps both sides paused; resolve the reported items, then recover.
- **Undeclared table reported** — a table with a chat ownership field has no migration rule, so the migration is blocked and names the table; add the rule before migrating.
