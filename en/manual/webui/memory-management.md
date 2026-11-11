---
title: Viewing and Managing Memory
---

# Viewing and Managing Memory

Long-term memory lives in the local data directory, and the **长期记忆** (Long-term memory) page in the WebUI (`/resource/knowledge-base`) puts search, writing, correction, erasure and tuning in one place. For the memory system's own parameters see [A_Memorix configuration](../configuration/amemorix-config.md).

![Long-term memory](/images/webui/knowledge-base.webp)

## The six tabs

The tabs come in two rows:

::: fields
- **记忆查询** (Memory search) — search text records, related content and person profiles; it has two inner views, "文字记录" (Text records) and "人物画像" (Person profiles).
- **图片记忆** (Image memory) — image assets, image observations, visual similarity search and historical backfill.
- **记忆流** (Memory stream) — check memory additions, updates and deletions per chat stream.
- **导入导出** (Import/export) — create import tasks, import and export memory bundles, add facts by hand.
- **记忆检修** (Memory inspection) — content correction, state maintenance, retrieval tuning, episodes, profile maintenance, feedback history.
- **记忆抹除** (Memory erasure) — erase by source in bulk and roll a deletion back.
:::

The "更多操作" (More actions) menu on the right of the tab row holds "查看记忆状态" (View memory status) and "打开图谱" (Open graph). When the vector store and the current embedding model fingerprint disagree, a red "重建向量" (Rebuild vectors) button appears in the same row.

## Searching memory

The search box under "记忆查询 → 文字记录" matches content, names, relations, facts, episodes and IDs at once. The adjacent "记录类型" (Record type) selector narrows results to paragraphs, entities, relations, facts or episodes, and the "显示停用" (Show inactive) switch also lists records that are no longer active.

Select several results and use "修正所选" (Correct selected) to batch-correct paragraphs and relations; facts are edited one at a time and entities are changed in the graph.

The "人物画像" inner view either locates a person exactly by platform plus user account, or searches fuzzily by name, group nickname or person_id.

![Memory search](/images/webui/knowledge-query.webp)

## Knowledge graph

"打开图谱" (Open graph) shows entities, relations and their evidence chains, and can jump straight to a node by paragraph hash. The graph only lets you inspect and delete wrong nodes, relations or evidence paragraphs; content correction goes through "记忆检修 → 内容修正".

![Long-term memory graph](/images/webui/knowledge-graph.webp)

## Image memory

Image memory first needs a model that maps image input to vectors, configured under `[model_task_config.image_embedding]` in `model_config.toml`. Without one, images and observations are still stored; only retrieval is unavailable. The parameters are documented under [A_Memorix configuration → Image memory](../configuration/amemorix-config.md#image-memory).

After selecting a stored image, the "相似图片" (Similar images) panel searches by a similarity threshold, labels results as "同一图片" (Same image) or "相似图片" (Similar image), and expands the chats, observations and related memories behind each hit.

"查看历史图片回填" (View historical backfill) opens the "图片记忆高级维护" (Advanced image memory maintenance) dialog, whose "图片维护" (Image maintenance) panel holds four collapsible sections:

::: fields
- **入库失败任务** (Failed ingestion jobs) — the first ingestion attempt retries automatically; after the retry limit the error is kept and the whole batch can be requeued once the cause is fixed.
- **历史图片回填** (Historical image backfill) — preview first to scan and classify old messages (recoverable, already backfilled, missing file, missing chat stream, missing source, unsupported or corrupt image, write failed), then execute. Execution re-validates and ignores messages that arrived after the preview.
- **索引状态与任务诊断** (Index status and job diagnostics) — process the index queue and inspect queued jobs and failure reasons.
- **模型指纹与启动恢复记录** (Model fingerprint and startup recovery) — the current image vector generation and what recovery did at startup.
:::

"文件缺失" (Missing file) during backfill means the historical image binary has already been cleaned up, which does not affect new images. If the panel keeps showing "waiting to build", confirm the image embedding model is usable first.

## Memory stream

"记忆流" lists memory changes per chat stream and event type: paragraphs, episodes, person profiles, feedback corrections, delete/restore and maintenance actions, over the last 24 hours, 7 days or 30 days.

![Audit timeline](/images/webui/knowledge-timeline.webp)

## Importing material

"导入导出 → 导入任务" (Import/export → Import tasks) feeds outside material into memory. The `⋮` in the card header switches between three task types:

::: fields
- **资料导入** (Document import) — upload text, files or a folder.
- **LPMM OpenIE** — read LPMM data and extract relations.
- **LPMM 转换** (LPMM conversion) — convert LPMM data into the target directory.
:::

Pick a content category before importing; it decides how text is chunked and extracted. Narrative material is split into scenes and then a sliding window (default 1600 characters with 400 overlap), factual material is chunked by structure (default 1200 characters, never splitting lists or definitions), quotes and short lines are kept whole without relation extraction, and chat logs are chunked on message boundaries.

The common and advanced parameters under "导入参数" (Import parameters) decide how new tasks chunk and extract; they are not written back to any config file. Limits and concurrency are documented under [A_Memorix configuration → Import center](../configuration/amemorix-config.md#import-center).

![Import memory](/images/webui/knowledge-import.webp)

## Memory bundles

"记忆包导入导出" (Memory bundle import/export) moves memory between two MaiBot instances or produces a shareable `.amembundle` file.

Pick a content level and a scope when exporting:

::: fields
- **知识** (Knowledge) — paragraphs, entities, relations and their vectors, equivalent to an LPMM knowledge package with the same semantics.
- **完整** (Full) — knowledge plus person profiles, episodes, the fact ledger, external references and lifecycle state; suited to whole-machine migration or a full backup.
- **导出范围** (Export scope) — all memory, a given chat stream, a given source, a given import task, an installed knowledge package, or hand-picked images.
- **携带兼容向量** (Carry compatible vectors) — bundle vectors to speed up installation under the same embedding configuration; without it the installing side builds them.
:::

Inspect the file before installing: the page reports its size, image counts, missing resources and whether the vectors are compatible. Installation scope is either "所有聊天可用" (usable in all chats) or "指定聊天流" (a given chat stream), and the install mode is either "合并安装" (merge) or "空库恢复" (restore into an empty store, for moving a whole store).

Bundle members include `manifest.json`, `knowledge.json`, an optional `state.json`, paragraph and relation vectors, plus `images.json`, `images/assets/` (original images) and an optional `vectors/images.npz` (image vectors) for image memory. Limits are 4096 members per bundle, 256 MiB per member after decompression and 1 GiB total after decompression; bundles without the image extension install just the same, they simply carry no image memory.

Installation only moves existing content and fills in missing vectors; it does not extract anything again. Image vectors are reused when the fingerprint matches the local model, and content is installed anyway when they do not match, are missing, or the model is temporarily unavailable — image retrieval then shows as waiting to build and is filled in locally later. Uninstalling a bundle removes the resources it exclusively owns; shared images still referenced by other chat streams or bundles are kept.

## Correcting memory

"记忆检修 → 内容修正" takes a natural-language description of what to change and an optional correction scope (for example one person profile), produces a change plan with a cascade preview, and executes it after confirmation. Executed plans can be rolled back from "修正计划" (Correction plans), and "纠错历史" (Feedback history) records retrieval corrections and rollbacks.

"记忆检修 → 画像维护" (Profile maintenance) maintains one person's supporting evidence, aliases and field overrides; select a person under "记忆查询 → 人物画像" first.

"记忆检修 → 情景记忆" (Episodes) manages episode generation state and filters by waiting to rebuild, running, completed or failed source.

![Feedback history](/images/webui/knowledge-feedback.webp)

## Erasing and restoring

"记忆抹除" has two halves:

::: fields
- **按来源抹除** (Erase by source) — select sources and preview the deletion, which shows how many entities, relations and paragraphs it touches before moving them to the recycle bin.
- **删除记录** (Deletion records) — search past operations by mode, status or keyword, and restore an executed deletion as a whole.
:::

Deleted relations stay in "记忆检修 → 状态维护 → 记忆回收站" (Memory recycle bin) and can be restored row by row. Deletion is not immediate physical removal and leaves shared data that is still referenced elsewhere untouched.

![Delete memory](/images/webui/knowledge-delete.webp)

## Person profiles

Person profiles record personality, interests and chat habits. View them under "记忆查询 → 人物画像", or open `/resource/person` (the person info page) to manage them centrally: search by name, filter by whether the person is known and by platform, edit the person name, nickname, naming reason and personal impression, and select several people to delete in bulk.

![Person info](/images/webui/person.webp)

## Retrieval tuning

Run tuning when MaiBot keeps forgetting things. "记忆检修 → 检索调优" samples questions from real memory, evaluates candidate retrieval parameters against an objective (precision first, balanced, or recall first) and an intensity (quick, standard, deep), and reports a composite score plus an independent-sample validation verdict.

Tuning parameters only affect the next task, so keeping the defaults is usually right. Apply a result only when it is marked "推荐" (recommended): applying merges it into the running configuration, and "同时保存为默认设置" (Also save as default) writes it back to the config file.

![Retrieval tuning](/images/webui/knowledge-tuning.webp)

## State maintenance

"记忆检修 → 状态维护" works on the lifecycle of individual relations:

::: fields
- **维护操作** (Maintenance actions) — reinforce, freeze, protect or restore a relation matched by relation hash or by query text; protection can be time-limited, and leaving the duration empty protects it permanently.
- **记忆回收站** (Memory recycle bin) — lists deleted relations and restores them row by row.
:::

Protected or pinned relations are exempt from memory-evolution decay and pruning.

![State maintenance](/images/webui/knowledge-maintenance.webp)

## Verification and troubleshooting

**Verification**: import a piece of text, wait for the task to reach "已完成" (completed), and the content should be searchable under "记忆查询".

- **Import tasks stay queued or fail** — make sure a usable model provider is configured (import needs extraction and embedding), then read the failure reason in the task detail.
- **Just-imported content cannot be found** — confirm the task state is "已完成", then check whether vectors were built; if "重建向量" appears at the top of the page, rebuild first.
- **Image retrieval keeps showing waiting to build** — confirm `[model_task_config.image_embedding]` has an embedding model that accepts image input; while the model is unavailable the page shows the matching error.
- **Lots of "文件缺失" during backfill** — the historical image binaries were cleaned up, which is expected and does not affect new images.
- **How long is memory kept** — by default indefinitely. Memory evolution only decays relations; weak relations are frozen, archived and end up in the recycle bin, with a strength of 1.0 dropping below 0.1 in about 3.3 days by default.
- **Does memory leak privacy** — memory data stays in the local directory; summaries, profiles, corrections and embeddings call the model services you configured, so the data boundary depends on your deployment and provider.

## Related docs

- [A_Memorix configuration](../configuration/amemorix-config.md) — memory system parameters, including [image memory](../configuration/amemorix-config.md#image-memory)
- [Model configuration](../configuration/model-config.md) — configuring the `image_embedding` task
- [Chat management](./chat-management.md) — per-session settings and observing chat streams