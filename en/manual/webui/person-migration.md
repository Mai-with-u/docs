---
title: Merging Person Identities
---

# Merging Person Identities

Merge one user ID's person data into another ID on the same platform, for identity switches you have already confirmed — a QQ number turning into an OpenID, or an account replacement. Point the adapter at the new ID after the migration, and later messages land on the target identity.

## When to use it

Use it when one person changes identifier: QQ number to OpenID, a new main account, or retiring an old number into the usual one.

- Merging works only inside one platform; a QQ number cannot be folded into an identity on another platform.
- The source identity must already have person data. Old chat records alone cannot start a migration.
- The target does not need to exist yet; a migration creates the target's person data as it goes.
- The migration does not judge whether two IDs belong to the same person. You confirm that first.

Only the parts that affect later conversations move. Old chat records stay with the original ID.

## What moves

These move:

::: fields
- **Person data** — nicknames, manual settings, memory points and group card names; same-name field conflicts are confirmed one by one.
- **Profiles** — each person's latest profile version plus its refresh task; older profile versions stay untouched.
- **Facts and evidence** — active person facts and their evidence, and unexpired fact paragraphs; the original facts and evidence are kept for old profiles and change records to reference.
- **Conflicting facts** — both sides are kept and marked as conflicted.
- **Current long-term memory** — only the ownership changes; memory text is not rewritten and vectors are not recomputed.
- **Identity alias** — the source ID is registered as an alias of the target, and only affects later messages.
:::

These stay put:

- Historical messages, tool calls, old private-chat sessions and statistics.
- Expressions, jargon, episode history, deletion records and maintenance tasks.
- Instance config, plugin config and permission lists; hard-coded user IDs in those lists need adjusting by hand.

Third-party plugin data joins only when the plugin registers a migration extension — see [Migrating plugin data](#migrating-plugin-data).

## Previewing the plan

Examples below start with `maibot`; a source checkout runs the same subcommands and flags through its own CLI entry point. `--directory` takes a single Bot instance directory, not a workspace directory holding several Bots.

::: code-group

```powershell [Preview ~vscode-icons:file-type-powershell~]
maibot person-migrate --directory C:/Bots/mai preview --platform qq --source 123456789 --target 987654321 --output C:/Temp/person-plan.json
```

:::

The command writes two files:

::: fields
- **`person-plan.json`** — the full plan, passed to `execute`. Do not edit it.
- **`person-plan.review.json`** — change counts per database and table, plus field-level conflicts, for you to check.
:::

The preview is read-only; nothing is written to any database at this point. Source and target IDs take either QQ numbers or OpenIDs.

## Resolving conflicts

When both sides hold different values for the same field, the preview lists them under `conflicts` in `review.json`. Create a `decisions.json` covering every conflict, keyed by the conflict `id`, with the value `source` or `target`:

::: code-group

```json [decisions.json ~vscode-icons:file-type-json~]
{
  "conflict ID copied from review": "source",
  "another conflict ID": "target"
}
```

:::

Copy keys verbatim from the `id` fields in `review.json`; do not assemble them yourself. Preview again with the decisions until the output reads "全部确认: True" (all confirmed):

::: code-group

```powershell [Preview with decisions ~vscode-icons:file-type-powershell~]
maibot person-migrate --directory C:/Bots/mai preview --platform qq --source 123456789 --target 987654321 --decisions C:/Temp/decisions.json --output C:/Temp/person-plan.json
```

:::

Without conflicts the preview is already all-confirmed, and you can skip to the next section.

Change a decision by previewing again, never by editing the full plan. If config, identity aliases or conflicting content change after the preview, execution asks you to confirm again.

## Running the migration

The migration runs online; the Bot is neither stopped nor restarted. `execute` rebuilds the plan inside one write transaction across the participating databases, folding in data added since the preview. A write error rolls the whole transaction back, and the identity alias commits together with the main database data.

::: code-group

```powershell [Execute ~vscode-icons:file-type-powershell~]
maibot person-migrate --directory C:/Bots/mai execute --plan C:/Temp/person-plan.json
```

:::

On success it prints the job directory `data/person-migrations/20261118-143022-xxxx/`. Running the same plan twice is rejected.

## Point the adapter at the new ID

The migration only moves data; it does not change which ID an adapter sends and receives with. Skip this step and later messages keep landing on the old ID:

- **OneBot** — change `[bot].qq_account` in `bot_config.toml` to the new number, see [local client](/en/manual/adapters/qq-local-client).
- **QQ official adapter** — turn on `[qq_official].enable_mapping` so linked users use their QQ number in later messages, see [official bot](/en/manual/adapters/qq-official). Confirm target aliases and source profiles have migrated first, or the same person shows up as two users.

Long-term memory is checked at the instance's own `a_memorix.storage.data_dir`, plus the default and legacy data directories. A memory database is migrated whenever it exists, even with the memory feature switched off. Two situations abort with an explicit error and need fixing first:

- A memory database sits outside the instance directory.
- A memory write task involving the source identity has not finished.

## Recovering an interrupted job

If the process exits unexpectedly, check commit status from the job directory:

::: code-group

```powershell [Recover ~vscode-icons:file-type-powershell~]
maibot person-migrate --directory C:/Bots/mai recover --job C:/Bots/mai/data/person-migrations/<job-id>
```

:::

`recover` updates the job record from each participating database's commit markers; it never overwrites live data with an old copy. Several WAL-mode SQLite databases are not guaranteed to commit atomically across databases on power loss, so an inconsistent commit state aborts with an explicit error and needs repairing from the job record.

## Migrating plugin data

A plugin with its own SQLite database can register a migration extension so its data joins the same preview, conflict confirmation, staleness check, transaction and job record. The extension is a module that runs in the migrating process; it does not have to be an SDK plugin.

::: code-group

```python [my_module.py ~vscode-icons:file-type-python~]
from pathlib import Path
from typing import Any, Dict


def build(plan, context: Dict[str, Any]) -> None:
    """Remap the source user ID to the target ID per platform, into the plan."""
    def transform(row: Dict[str, Any]) -> Dict[str, Any]:
        if row["platform"] == context["platform"]:
            row["user_id"] = context["user_map"].get(row["user_id"], row["user_id"])
        return row

    plan.transform("my_user_records", transform)


def create_extension(root: Path):
    """Return the extension: name, database path, plan-building function."""
    return MigrationExtension("my-plugin", root / "data/plugins/my-plugin/records.db", build)
```

:::

`DatabasePlan` and `MigrationExtension` are injected by the migrating process; the extension module must not import core internals—plugin code uses only the SDK, as with any plugin. Those two names are runtime objects whose signatures the migrating process verifies.

Load it during preview with `--extension my_module:create_extension`, repeated for several extensions.

::: fields
- **Factory** — receives the instance directory and returns a `MigrationExtension`: a name, the extension database path, and a plan-building function.
- **Database location** — must sit inside the instance directory and must not duplicate another extension.
- **Conflicts and merging** — express counting or unique-key merge semantics through `plan.transform(..., merge=...)`; never write to the database directly.
:::

## Verification and troubleshooting

**Verify**: after execution, check the person page in the WebUI to confirm the source ID was folded into the target; then ask Mai about something that depends on the target person's data in any chat — facts and profiles should resolve to the migrated content.

- **"Source identity has no person data"** — the source ID has chats but no person record; confirm the source person record on the person page, then retry.
- **Conflicts reported as unconfirmed** — `decisions.json` misses a conflict or uses a key that differs from the `id` in `review.json`; fix it and preview again. Execution cannot fill the gap.
- **Plan edited or stale** — the full plan was edited by hand, or data, config or aliases changed after the preview; generate a fresh preview.
- **Same plan rejected as already run** — that plan was committed before; preview and execute a new one instead of reusing the file.
- **Memory database outside the instance** — stop MaiBot first, **copy** the whole legacy memory directory into the instance directory, then point `a_memorix.storage.data_dir` at the new location. Changing the path alone starts from an empty database and leaves the old memory where it was; see [A_Memorix configuration](/en/manual/configuration/amemorix-config).
- **Pending memory writes reported** — wait for the memory queue to drain; pausing writes during the migration loses records.
- **Old messages changed author** — historical messages do not migrate, and old sessions and messages still belong to the original ID. This is expected.
