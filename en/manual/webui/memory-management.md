---
title: View and Manage Memory
---

# View and Manage Memory

MaiBot stores what it learns from chats in long-term memory, just like human memory. The **长期记忆** (Long-term Memory) page (`/resource/knowledge-base`) under the "麦麦资源管理" (MaiBot Resource Management) sidebar group centralizes memory management: query, import, correct, delete, and tune — all in one place.

![Long-term memory](/images/webui/knowledge-base.webp)

## Memory Overview

Open the Long-term Memory page; the tab bar is organized by purpose:

- **记忆查询** (Memory query) - search memory content, further split into the "文字记录" (Text records) and "人物画像" (Person profiles) views
- **图片记忆** (Image memory) - view image assets, image cognition, and related memories; launch image search and historical backfill
- **记忆流** (Memory stream) - review memory changes per chat flow
- **导入导出** (Import & export) - import materials, and export and install shareable memory bundles
- **记忆检修** (Memory inspection) - maintain memory state and correct content
- **记忆抹除** (Memory purge) - bulk purge and history rollback

The "更多操作" (More actions) menu in the top-right corner also has **查看记忆状态** (View memory status) and **打开图谱** (Open graph); `tab=graph` in old links still opens the graph directly.

## Search Memory

In **记忆查询** (Memory query), enter keywords (e.g. "game", "food") and filter by time or by user to see memories from a period or from chats with a specific person.

Memory query is further split into the "文字记录" (Text records) and "人物画像" (Person profiles) views: the former queries authoritative records such as paragraphs, the latter person dossiers (see [Person Profiles](#person-profiles)).

![Memory query](/images/webui/knowledge-query.webp)

## Knowledge Graph

The graph shows relations between concepts like a mind map, with the entry in the top-right "更多操作 → 打开图谱" (More actions → Open graph) menu; `tab=graph` in old links also opens it directly:

- Each node is a concept (e.g. "Genshin")
- Edges represent relations (e.g. "Genshin-game")
- Click a node for details

The standalone **长期记忆图谱** (Long-term Memory Graph) page (`/resource/knowledge-graph`) provides full-screen visualization:

![Long-term memory graph](/images/webui/knowledge-graph.webp)

## Image Memory

The **图片记忆** (Image memory) tab manages the images Mai has "seen". It needs an image embedding model configured first (`[model_task_config.image_embedding]` in `model_config.toml`); without one, images and cognition are still saved normally, but the page will show retrieval as unavailable. Related parameters: [A_Memorix Config → Image Memory](../configuration/amemorix-config.md#image-memory).

What this tab can do:

- **View image assets and occurrence records** - thumbnails, source chat flow, cognition (user description, model description, manual corrections), and their related paragraphs, entities, relations, and Episodes
- **Search by image** - pick an image in the store to launch a similar search, with an adjustable similarity threshold. Results distinguish **exact same image** and **visually similar**, and show the score, real chat name, cognition, related knowledge, and per-stage timing
- **Historical backfill** - click "预览历史回填" (Preview historical backfill) to scan historical messages by category (processable, already processed, missing source, missing chat flow, missing file, invalid image, write failed) before confirming execution; execution ignores messages that arrive after the preview
- **Task diagnostics** - view the image embedding job and description-compensation job lists, filter by status, see retry counts, last error, lease deadline, and index progress under the current model fingerprint
- **Cognition confirmation and correction, record deletion** - confirm or correct image cognition, delete wrong relations or occurrence records

**Troubleshooting tips**:

- Image search keeps showing "等待构建" (Pending build) → confirm the `image_embedding` task has a working image embedding model configured
- Showing "模型不可用" (Model unavailable) → model probing failed; check whether the provider supports image input or whether the key is valid; failures retry automatically at `probe_retry_seconds`
- Lots of "文件缺失" (Missing file) during historical backfill → historical image binaries have been cleaned up, which is normal and does not affect new images entering the store

## Memory Stream

Review memory changes for each chat flow:

![Audit timeline](/images/webui/knowledge-timeline.webp)

- Memory audit events (add, update, delete, etc.) paginated in reverse chronological order
- Filter by chat flow and event type
- Change summaries are merged directly into the event list

## Import & Memory Bundles

The **导入导出** (Import & export) tab lets you teach MaiBot new knowledge manually, and also packs up existing memories to take away:

![Import memory](/images/webui/knowledge-import.webp)

1. Choose an import kind: **资料导入** (material import: text, file, or folder), LPMM OpenIE, or LPMM conversion
2. Paste text or upload files
3. Optionally set common and advanced parameters in the "导入参数" (Import parameters) dialog
4. Start the import; the task list shows progress in real time

**Memory bundles (`.amembundle`)** are used to migrate or share memories between one MaiBot and another:

- **Export** - choose the memory scope to export, with a preview of the paragraphs, entities, relations, images, and uncompressed size it will contain; images can be multi-selected, and you can check "携带直接关联知识" (Carry directly associated knowledge)
- **Install** - first upload the bundle for a preview check (size, image count, resource check, vector compatibility), then execute the install; installed content and retrieval capability are shown separately
- **Image vector reuse** - when the installing instance's image embedding model matches the source, package vectors are reused directly; when the model differs, vectors are missing, or the model is temporarily unavailable, content installation still completes, the image status shows "等待构建" (Pending build), and vectors are built later with the local model
- **Uninstall** - uninstalling a memory bundle cleans up resources exclusive to the bundle; shared images still referenced by local chats or other bundles are kept

**What is inside a bundle** - a memory bundle is a ZIP, packed according to its content level:

- **`knowledge`** - paragraphs, entities, relations, and their vectors, equivalent to an LPMM same-semantics knowledge pack; suited to migrating "knowledge" without person profiles
- **`full`** - everything in `knowledge` plus person profiles, Episodes, the fact ledger, external references, and lifecycle state; suited to whole-machine migration or a complete backup

Members include `manifest.json`, `knowledge.json`, an optional `state.json`, paragraph and relation vectors, and for image memory `images.json`, `images/assets/` (original images), and an optional `vectors/images.npz` (image vectors).

**Capacity and compatibility**: a bundle holds at most 4096 members, a single member may not exceed 256 MiB uncompressed, and total uncompressed size may not exceed 1 GiB (the old 32-member limit has been relaxed). Legacy-format (v1) text-only bundles can still be installed directly. Installation **calls no LLM at all**: package vectors are reused when usable, and when missing or unusable only the image vector index is rebuilt — no extraction is redone.

## Correct Memory

When a profile or relation is inaccurate, correct it via **记忆检修 → 内容修正** (Memory inspection → Content correction):

1. Set or remove manual overrides in person profiles
2. Adjust nodes, relations, or weights in the knowledge graph
3. Use feedback correction, delete-and-restore, or re-import to handle outdated content

Plain paragraph text currently has no arbitrary text editing entry; to correct it, delete the wrong source and re-import, or use the feedback correction mechanism.

## Purge Memory

Don't want to remember something? The **记忆抹除** (Memory purge) tab supports:

![Delete memory](/images/webui/knowledge-delete.webp)

- Single delete: find the memory and click "删除" (Delete)
- Bulk delete: select multiple items and delete together
- Delete by source: delete all memories of a chat flow

⚠️ **Note**: deleted items go to the recycle bin and can be restored

Feedback and rollback records can be viewed in **记忆检修** (Memory inspection):

![Correction history](/images/webui/knowledge-feedback.webp)

## Person Profiles

MaiBot builds a "profile" for every user:

- Personality traits (outgoing, introverted, etc.)
- Interests and hobbies (games, anime, etc.)
- Chatting habits (sticker usage, speaking style, etc.)

In the **人物画像** (Person profiles) tab or the **人物信息管理** (Person Info Management) page (`/resource/person`) you can:

![Person info management](/images/webui/person.webp)

- View profiles
- Correct inaccurate descriptions
- Add notes for friends

## Retrieval Tuning

If MaiBot's memory is poor, run a tuning task to optimize retrieval (**记忆检修 → 检索调优**, Memory inspection → Retrieval tuning):

![Retrieval tuning](/images/webui/knowledge-tuning.webp)

- The page keeps only the description and the start button
- Tuning parameters live in the "调优参数" (Tuning parameters) dialog; they only affect the next tuning task, and defaults are usually fine
- After a task completes, review the evaluation result and apply the recommendation with one click if it passes validation

## Runtime Maintenance

**记忆检修 → 状态维护** (Memory inspection → State maintenance) provides runtime self-checks, the auto-save switch, vector rebuild, paragraph vector backfill, image asset reconciliation, import tasks, and delete operation records. The "更多操作 → 查看记忆状态" (More actions → View memory status) dialog in the top-right corner centralizes the runtime status (including vector rebuild and data refresh).

![State maintenance](/images/webui/knowledge-maintenance.webp)

## Usage Recommendations

### Daily Maintenance

- Review memory regularly and delete useless content
- Correct errors as soon as they are found
- Manually reinforce important information

### Improve Effectiveness

- Teach the bot domain knowledge to make it smarter
- Refine person profiles for more considerate conversations
- Set memory capacity appropriately to balance performance and effect

## Verification & Troubleshooting

**Verify**: import a piece of text; after the task completes, the content should be searchable in **记忆查询** (Memory query).

**Import tasks stuck in queue or failing?**

- Confirm a working model provider is configured (import needs models for extraction and vectorization)
- Check the failure reason in the task details

**Memory query finds nothing?**

- Confirm the import task completed (status "已完成")
- Check whether vectors are built; rebuild them in "状态维护" (State maintenance) if necessary

**Images not searchable or stuck at "等待构建" (Pending build)?**

- Confirm `[model_task_config.image_embedding]` in `model_config.toml` has an embedding model that supports image input configured
- Check the failure reason and retry counts under "图片记忆 → 任务诊断" (Image memory → Task diagnostics); when the model is unavailable the page says so explicitly instead of faking a wait

**How long are memories kept?**

Kept long-term by default. Memory evolution gradually decays old relation weights, and low-weight content may be marked for pruning; the exact behavior is controlled by A_Memorix's memory evolution configuration.

**Do memories leak privacy?**

Memory data is stored in local directories by default. Generating summaries, profiles, corrections, or vectors may call the model services you configured; confirm the data boundary according to your deployment and model provider.

## Related Docs

- [A_Memorix Config](../configuration/amemorix-config.md) — memory system parameters, including [Image Memory](../configuration/amemorix-config.md#image-memory)
- [Model Config](../configuration/model-config.md) — configure the `image_embedding` image embedding task
- [Chat & Statistics](./chat-stats.md) — chat logs, stickers, and expression styles
