---
title: Changelog
description: Feature updates, fixes, and configuration changes across MaiBot releases.
---

# Changelog

::: timeline 2026-10-19
### Main program [1.3.11]
* Message debouncing now has four fixed modes — Off, Fast, Natural, and Steady — with Natural as the default. Quiet and active chats, the same sender continuing, and a different sender each use their own wait time; a batch waits at most 8 seconds, and an @ mention or name mention enters processing within 1 second.
* Fixed model task statistics failing to write and query with newer SQLModel versions.

### WebUI [1.9.5]
* The Identity & Persona page adds a backup reply-style button next to the reply style, for editing the style used during random switching.
:::

::: timeline 2026-10-19
### Main program [1.3.10]
* Added unified web tools: define a service under `[web]` in `model_config.toml` to give the Planner search and page-reading tools, with support for DeepSeek, Tavily, and StepSearch MCP.
* Smarter reply quoting: group and private chats use different rules, and the quote frequency is configurable.
* Sticker images sent to the Planner and the regular Replyer are compressed to reduce multimodal request size.
* Fixed group replies being treated as private chats when the group name was empty, and send failures caused by a missing target ID.
* Reasoning logs are split: the terminal thinking box and saved reasoning records are controlled independently, and terminal reasoning is off by default.
* Faster sticker-system startup; expression-vector initialization moved to a worker thread so it no longer blocks the main program and plugin loading.
* Fixed a corrupted expression-learning review file blocking learning; jargon learning no longer picks up unrelated attributes.
* Self-update supports the CNB source.
* The experimental "Use stop() tool" switch is now "Optimize tool usage" with unchanged behavior; the "retry after lost reply reminder" option is removed.

### Plugins [1.3.10]
* Fixed the plugin market treating an empty installable-version list as a data error.
* An SDK version outside the declared range now only produces a warning, so the plugin can still load, install, update, and connect to its Runner.
* Plugin market settings open in an in-page dialog; the information source (official, CNB, or GitHub) and download source (CNB, GitHub, or custom) are selected independently.

### WebUI [1.9.4]
* The top bar shows an update card when a new version is available.
* Unified many WebUI components and styles to remove duplicates.
* The sticker page now matches the jargon and expression page layout; plugin market cards are restyled.
* Image and sticker caches share browsing, preview, and cleanup controls; the duplicate entry in Settings is removed.
* Task assignment shows recent call information for each selected model.
* Removed extra horizontal separators between persona, behavior, and expression fields.
* Chat routing exempts the WebUI and local console; improved the first-run onboarding flow.
:::

::: timeline 2026-10-15
### Main program [1.3.9]
* Fixed automatic sticker scanning and updates stopping when the registered count exactly reached the limit with full-capacity replacement enabled.
* Self-update supports Python package installations.
* Prompt loading reuses parsed shared metadata to reduce startup work; plugin prompt loading now runs on a worker thread so it cannot block the main loop and time out the plugin handshake.
* When a vision Planner is paired with a text-only Replyer, image descriptions are refreshed before generating the reply.

### Plugins [1.3.9]
* Reply extensions gain a `platforms` scope declaration with the same rules as Tools: parameters are filtered by the current chat platform and validated before execution, and can be combined with chat type and session scope.

### WebUI
* The learning page unifies expression and jargon entries; jargon can be browsed by chat, sharing group, or all chats, and the chat list is sorted by recent messages.
* Long-term memory unifies text records and person profiles under "Memory Query", with switchable query types and continuous detail viewing.
* The plugin market opens details from the whole card and preserves the browsing position; lists distinguish installed and updatable plugins, and Release plugins can be installed at a selected version.
* Plugin extensions are fully accessible on mobile, with switching between multiple pages of the same plugin.
* Settings, models, stickers, plugins, and data management support full-page scrolling on mobile; reasoning details expand with content, statistics details expand, and distribution charts show two per row.
* Security settings manage random and custom Tokens in one place, and logout moves to the security page.
:::

::: timeline 2026-10-14
### Main program [1.3.8]
* Retro replies compress images in multimodal input: the newest three images are capped at 640 px on the long edge and older images at 128 px, scaled proportionally without enlarging small images.
* Fixed the Planner not restoring its running state after a proactive task entered wait, which left the chat stream waiting and unable to respond to new messages after a model error.
* Self-update (experimental): Git deployments can check for and install updates from WebUI Settings → About, with automatic rollback when dependency sync fails.
* Package installation (experimental): `maibot init` creates a standalone instance and `maibot run` starts it.

### WebUI [1.9.2]
* Fixed production mode forcing secure cookies, which prevented login from persisting over HTTP after `secure_cookie` was disabled.
* Improved the long-term memory page layout and interaction.
* Fixed several mobile scrolling compatibility issues.
:::

::: timeline 2026-10-13
### Main program [1.3.7]
* A chat stream filtered out by the adapter allow/deny list is now unregistered immediately, so it no longer processes messages.
* Improved the reliability of LLM-based sentence splitting.

### Experimental features
* Added an "Optimized Planner prompt" switch that describes the bot in the second person and trims task instructions.
* Added the `subagent` tool so the bot can delegate self-contained research tasks; with "Advanced sub-agents" enabled they run in the background, the bot can keep chatting, and the result returns as a new message that wakes the Planner. `subagent_status` and `subagent_stop` are also provided.
* Oversized tool results are condensed into conclusions based on the Planner's current intent, reducing later context usage.
* Fixed "Attention drift" having no effect; removed the "Emotion trait" option.

### Plugins [1.3.7]
* Each Tool can declare a `platforms` scope: one platform, several platforms, or all platforms.
* Setting the plugin runtime's maximum restart count to 0 disables automatic restarts while keeping the explicitly configured value.

### WebUI [1.9.1]
* Reworked mobile interaction and improved onboarding.
* Narrowed the chat-stream sidebar in Mai Chat and reduced side padding in the Millennium style.
* Improved the flow for adding models and configuring embedding models.
* Plugin market details show the plugin ID with select-to-copy and wrapping for long IDs.
* Mai Observation adds an expandable sub-agent sidebar for the current chat stream's task list, per-round tool calls, and conclusions, with links from tool cards to the task.
* Fixed old data preventing Mai Observation from connecting; log file reads moved to a background thread so they no longer block other WebUI requests.
:::

::: timeline 2026-10-11
### Main program [1.3.6]
* Long-term memory vector rebuilds support resuming from the last checkpoint and retrying failed items; the model configuration page shows sync and rebuild progress.
* Fixed emoji emotion tags leaking into reply text.
* Added the plugin API `maisaka.context.resolve_image`, which reads chat images from the current context and resolves them by tool media index or short message number.
* Plugin updates can be cancelled; leaving the page stops the download, while an already-started version replacement finishes cleanly.
* Added the experimental Planner "Quick reaction mode": new messages received during thinking, output, or wait immediately join the round and trigger another reasoning pass; interrupted thinking and output remain visible in history.
* High-frequency word learning ignores platform notices and the bot's own messages, counts raw user text, merges duplicate terms, and corrects message coverage counts.
* The Docker image no longer bundles the NapCat adapter.
* Fixed delayed image sending when descriptions are long, and sentence-splitting calls still running with reply splitting disabled.
* Long-term memory fixes: mixed vectors when switching models during a rebuild, and mismatches after switching candidate models.
* Person facts fixes: facts disagreeing with evidence, incorrect confidence handling, mislabelled legacy migrations, and missing historical evidence.
* Text embedding requests slow down automatically when rate-limited; the model configuration page supports Bailian business-space domains and the Bailian thinking switch.
* Message routing supports `account_id` / `scope` ownership fields and receives messages using the bot identity declared by the gateway.
* Reasoning records use less memory at startup with many history entries; image-only messages no longer display as "empty message".
* Fixed adapter rules for chat streams displaying and editing across platforms, model edits lost when switching pages quickly, provider renames deleting related models and task assignments, and enabled MCP services showing as disabled.

### WebUI [1.9.0]
* The plugin market shows 7-day and 30-day download and like trend rankings, marks recently published or updated plugins, and reduces ranking and recommendation churn.
* Plugin WebUI supports preset declarative pages and custom HTML pages, plugin API calls, page navigation, and image uploads; it adapts to every UI style and light/dark theme, and workspace order is adjustable.
* Mai Observation improves the thinking flow, wait countdown, context trimming, and learning details, supports hovering over tool execution status, reduces scroll jitter, and fixes missed message updates on refresh, reconnect, and history replay.
:::

::: timeline 2026-10-07
### Main program [1.3.5]
* Fixed the bot being wrongly reported as the recipient when a reply quotes the bot's own message.
* Fixed the dynamic trigger mode counting stale backlog messages as recent activity, which kept group chats from starting the Planner for a long time.
* Model task assignment: when chat recall (`mid_memory`) is left empty it now falls back to `fast_model` and then `utils`; the decision to replace an old sticker with a new one goes to the `emoji` task first, and to `planner` when unconfigured.
* Reply splitting is cleaner: extra trailing commas at segment ends are omitted when segments are sent individually and restored when they are merged.
* Improved plugin loading logic to reduce inconsistent states.
* Installing / updating a plugin no longer blocks on dependency version conflicts with other installed plugins; these now surface as a "plugin dependency reminder".
* New **reply extension** component for plugins: plugins can register their own parameters for the `reply` tool, add requirements before generation, and transform the whole message group before sending (requires plugin SDK 2.10.0+).

### WebUI [1.8.4]
* Adapter allow/deny lists now support **multiple policy groups**: create, copy, and delete multiple group/private rule sets per adapter and switch between them; existing rules are kept as the "default group", and the active group cannot be deleted.
* The model task list shows advanced tasks that already have models configured by default — no need to open "advanced settings" to see them.
* The plugin market supports search by author; released versions show their update date and the detail stats area shows the latest update time.
* Plugin reviews support an editable username and anonymous submission.
* MaiBot Observation: images and stickers support a large preview and one-click switching between "recognized text / original file"; tool-returned images are shown as thumbnails, and tool cards show the actual model name used.
* Chat monitor performance: per-session detail subscriptions with incremental message updates; Planner now uses incremental transfer with trimmed payloads and rebuilds the snapshot baseline on reconnect, saving bandwidth for remote viewing.
:::
::: timeline 2026-10-06

### Main program [1.3.4]

* Rich replies are no longer experimental: replies can carry pictures directly; a new "@-mention users in replies" switch is on by default; and stickers gain a new sending mode (the thinking model looks at the stickers and picks one), off by default — leave it off to keep the old behavior.

* Added the **fast model** `fast_model`: small jobs that need an answer right away, such as picking expressions and splitting replies into sentences, go to it. Give it a quick model; if you leave it empty, `utils` is used.

* Learning rules are easier to follow: just "global default", "platform default", and "a specific chat", with no more wildcard syntax.

* Fixed MCP holding on to the CPU when a connection goes wrong.

* Fixed a timed-out request being re-sent many times and wasting tokens.

* Compatible with newer openai SDK releases; fixed providers with non-Bearer auth failing at startup with Missing credentials.

* Improved caching for typo generation, so replies flow more smoothly.

### WebUI [1.8.3]

* Sections you use often in MaiBot Settings can be pinned to the top, one click away.

* WebUI Settings now lives only on its standalone page, opened from the gear in the top bar; the old address redirects.

* Removed the persona generator.

* Built-in search is smarter and finds the official docs more easily.

* Remote access to the WebUI uses less bandwidth.

* The plugin market shows and recommends plugins more sensibly.

* Better on phones, plus a batch of display and functional fixes.

### Configuration changes

* `model_config.toml`: `[model_task_config.expression_use]` is renamed to `[model_task_config.fast_model]`. If you had models listed there, enter them again under `fast_model` after upgrading; if not, nothing to do.

* `model_config.toml`: `max_retry` now means **total requests** (the first one included). The default 3 means up to 2 more tries after a failure; 0 or 1 means no retry.

* `bot_config.toml`: `[experimental].enable_rich_reply` is removed; `[chat].enable_reply_at` (default `true`) and `[emoji].use_new_send_logic` (default `false`) are added.

* `bot_config.toml`: `learning_list` no longer accepts `"*"`; it is rewritten to empty on upgrade.

:::

::: timeline 2026-10-05

### Main program [1.3.3]

* Fixed errors when a request with images saved a failure snapshot or produced a reply result.

* Fixed MaiBot restarting unexpectedly while a plugin was being updated.

* Fixed a false "recovered" report after the plugin process restarted itself: a missing plugin is now retried on its own without disturbing plugins that run fine, and plugins you disabled or uninstalled are not brought back.

* More natural behavior when the bot's group nickname or QQ name differs from the configured name.

### WebUI [1.8.2]

* Plugins can be installed straight from a ZIP archive: Plugin Extensions → "更多操作" (More actions) → "从 ZIP 安装插件" (Install plugin from ZIP).

* The plugin market uses a new default source and loads faster; when a statistics request fails the page no longer errors out, and the plugins already loaded stay visible.

* The sections of MaiBot Settings are now a dropdown list next to the title holding every section, with no more expanded/collapsed split.

* The Millennium style lets you change pixel fonts for clearer text.

* Fixed AI search failing to find the official docs.

:::

::: timeline 2026-10-04

### Main program

* Added the **dynamic** chat trigger mode, more precise than necessity-based replies: it estimates the reply likelihood of each message batch and adjusts the threshold dynamically so the reply count stays close to the configured reply frequency.

* Added avatar-query interfaces for adapters and the SDK; the WebUI now uses a unified avatar service.

* Improved the emoji-sending logic for rich replies.

* Improved config hot reload, greatly speeding up saving some settings.

* Plugin dependency installation now falls back source by source using the main program's uv indexes (non-default sources first); any source succeeding is enough, and a full failure summarizes each source's reason, improving install reliability on flaky networks.

* Fixed preview images still occupying disk after reasoning records were auto-evicted or cleared in the WebUI without being referenced by other records; the reasoning image cache is now checked at startup and hourly, cleaning up unreferenced leftovers.

* Fixed Windows WebUI data export misreading the memory module run lock and failing, and export errors now show the specific file path.

### WebUI [1.8.1]

* Plugins can declare custom tab pages.

* When long-term memory needs a vector rebuild, a rebuild button now appears on the right of the top tab bar.

* Refactored the editing location of some config items.

* The adapter allow/deny panel now shows group avatars and known group names after the group number.

* Improved and enriched command management.

* Improved the usability of MaiBot data export.

* Fixed the WebUI realtime connection needing a page refresh to recover after a disconnect.

* Added a new WebUI page style (Millennium style).

* Avatars now come uniformly from the adapter avatar interface; a placeholder avatar is shown when an adapter does not implement it, and the old `data/avatar/qq/` cache is no longer read.

### Configuration changes

* `bot_config.toml`: `reply_necessity` (necessity trigger) in `[chat.reply_timing].reply_trigger_mode` has been replaced by `dynamic`, migrated automatically on upgrade.

* `bot_config.toml`: expression config refactor — `expression_selection_mode` is replaced by the boolean `use_vector_expression` (on by default); `expression_checked_only` now defaults to `false` and means "use only curated expressions".

* `bot_config.toml`: `[visual]` drops `planner_mode` / `replyer_mode`; `max_image_num` defaults to 64, `wait_image_recognize_max_time` to 32 seconds, and `max_image_size_mb` to 16; `[debug]` drops `enable_clear_context_command`.

* `bot_config.toml`: `[plugin]` adds `silent_permission_denied` (silently block unauthorized commands) and `disabled_commands` (disable built-in/plugin commands); `[webui].webui_style` adds value `2` (Millennium style).

:::

::: timeline 2026-09-28

### Webui [1.8.0]

* Mai Observation now shows thinking and tool-execution status as soon as the Planner returns, and updates results in place when a tool finishes; fixed new rounds overwriting old cards after a restart; `tool_search` now shows the search terms and activated tool list separately.

* Mai Settings moves manual save, shared-group settings, and source-file editing into an ellipsis menu, keeping detailed settings and command management at the top; shared-group settings replace core settings, and the sidebar chat-management entry is removed.

* In Mai Chat, the local user identity box moves to the right of the input area, with avatar and nickname editable in the same box; chat-stream browsing is removed from chat management and unified in the Mai Chat page, while chat management keeps shared-group management.

* Improved the mobile experience and chat-stream reading in Mai Chat with related fixes, refreshed the login page styling, and removed unused feature code.

* Fixed being unable to change the embedding model in the WebUI.

### Main program

* No more fallback for vision embedding models: when an image embedding model is unavailable, MaiBot no longer silently switches to another model.

:::

::: timeline 2026-09-26

### Main program

* Fixed punctuation-less long text caused by reply splitting; sentence separators are restored when segments are joined.

* Fixed a memory anomaly caused by the statistics task.

* Fixed incorrect Prompt cache statistics; cache price now defaults to the same value as the input price, so existing configs may need a manual cache-price update.

* The plugin market now supports installing different versions of a plugin.

* Improved compatibility with adapter plugins; adapter plugins can use MaiBot's built-in allow/deny lists directly.

* The SnowLuma adapter must be updated to the latest version: the new adapter has merged the NapCat adapter, and the allow/deny lists must be re-configured after upgrading.

### Webui [1.7.5]

* Category statistics add a "By task group" view that aggregates call count, tokens, cost, cache, and latency by the actual model task config.

* Greatly improved WebUI plugin-market loading speed.

* Improved the long-term memory interaction experience; the long-term memory page adds image-memory management for viewing image assets, cognitions, and related memories, with confirmation, correction, and record deletion.

* Improved the Mai Observation page, adding "Find previous"; it shows context segment ratios, session cumulative tokens, and average cache hit rate, and chat-stream settings can be opened directly from the chat view.

### Memory

* Added image memory, which requires configuring an image embedding model (the `image_embedding` task); a dedicated image vector pool supports image search and other query paths.

* Added `.amembundle` export, validation, and LLM-free installation, supporting LPMM-equivalent knowledge packages and full packages that include person profiles, Episodes, the fact ledger, external references, and lifecycle state.

### Models

* Improved the model testing flow.

* Image embedding models now automatically support Bailian, SiliconFlow, and Volcano models.

* Model pricing supports per-time-of-day periods that combine input, output, and cache-hit unit prices.

* The thinking switch on the model config page now adapts to provider templates: the general switch covers Zhipu/Kimi/MiniMax/Doubao (`thinking.type`), Bailian/SiliconFlow (`enable_thinking`), StepFun/OpenAI/xAI; Doubao and Qwen support a thinking budget; DeepSeek keeps a dedicated switch (including the Responses client and web search). Added provider templates for Zhipu Coding Plan (GLM Coding Plan), StepFun Step Plan, and Volcano Ark Coding Plan.

### Debugging

* Added a "Force plugin compatibility" debug switch.

* Fixed Fake-IP resolution in the plugin market.

### Configuration changes

* `model_config.toml`: the per-task `slow_threshold` (slow-request warning threshold) has been removed; the field is ignored and cleaned up when loading old configs.

* `model_config.toml`: the model `cache` field no longer affects billing logic; whether cache hits are billed is now decided by `cache_price_in`, and whether a provider returns cache usage is auto-detected from the response.

* `bot_config.toml`: new options for image memory, the retro reply prompt, splitting mode, the event-loop lag watchdog, and forced plugin compatibility. See the updated configuration docs under the manual.

:::

::: timeline 2026-09-15
### Maisaka [1.2.5]
* Long-term memory time search now supports both `YYYY/MM/DD` and `YYYY-MM-DD` date formats.
* Enhanced reply formatting now appends a space after `@` mention components to cleanly separate mentions from surrounding text.
* Fixed occasional tool invocation failures.

### Webui [1.7.4]
* Fixed an issue preventing saving or editing providers when the model list was empty; providers can now be saved before models are added.
* Added a settings entry for live chat streams in Mai Chat to directly open stream management details.
* Operator permission matching no longer converts `user_id` to lowercase.

### Plugin SDK/API
* Fixed an issue where the plugin LLM interface mistook model names for task names; task and model name can now be specified separately.

:::

::: timeline 2026-09-01
- [1.2.4] Plugin tools can request ending the Planner after execution; models can stop sending the temperature parameter; WebUI [1.7.3] merges Mai Observation into the chat workspace and streamlines memory management
- Maisaka: when a plugin tool returns `stop_after_execution: true` successfully, the Planner ends after the current tool batch finishes and waits for new messages
- Models: model advanced settings add a "Send temperature parameter" switch (`send_temperature`, on by default); when off, MaiBot no longer sends any MaiBot-managed temperature — model-level, task-level, or from extra parameters — for compatibility with models that reject this parameter
- WebUI [1.7.3]: the standalone "Mai Observation" page merges into the chat workspace; the sidebar now shows chattable sessions and read-only chat streams (marked with an "Observing" badge) in one place, and clicking a chat stream opens its reasoning timeline inline
- WebUI [1.7.3]: long-term memory run status moves into the "More actions" menu, simplifying the top of the memory management page; tuning parameters and import common/advanced parameters collapse into dialogs; the audit timeline layout is adjusted — the audit scope now spans the full row and change summaries merge into the event list
- WebUI [1.7.3]: emoji keyword-recognition prompts integrate into the "Prompt Management" page, with per-language editing, custom versions, and hot reload
- Long-term memory: multiple fixes for person profile refresh, authoritative fact and alias maintenance, and memory import/audit flows; no config changes
:::

::: timeline 2026-08-23
- [1.2.3] Expression config compatibility fix and Maisaka orphan tool message fix
- Expressions: fixed startup failures when an old config still used the `vector` selection mode; after upgrading, the first launch auto-migrates it to `vector_intent` (Super Fine) and writes the config back
- Maisaka: fixed orphan tool messages
:::

::: timeline 2026-08-23
- [1.2.2] Expression selection performance and accuracy improved; WebUI resource management and model config experience comprehensively upgraded
- Expressions: MMR diversity reranking rewritten with vectorized implementation, significantly faster on large candidate pools; adjusted vector similarity weight mix, removed lexical overlap scoring to avoid false interference on short texts and CJK content; removed `vector` selection mode, existing configs auto-upgrade to `vector_intent`
- WebUI [1.7.2]: model provider form adds custom request headers and a collapsible advanced config panel; task config adds hard timeouts for text and vision tasks, auto-falling back to the next model on timeout; adding a model now defaults to the currently filtered provider; model test image replaced with a standard PNG for broader vision model compatibility
- WebUI resource management: curated expression management refactored — "review/approve" unified as "curate", top tabs replaced by dropdown menu, detail and edit dialogs merged, pagination now supports per-page count selection; jargon list pagination and layout restructured, status filter changed from tabs to dropdown, added prompt template entry; emoji filter and sort unified into the filter card, status switch changed from tabs to dropdown, sort split into field selector + asc/desc toggle, default sorted by registration time (newest first)
- WebUI misc: login page now supports `redirect` query parameter — embedded pages return to their original location after login; prompt version management adds delete endpoint, auto-restoring the default prompt when the active version is deleted; expression and jargon lists use unified transparent background styling in the retro theme
- Models: temporarily compatible with V4V-class vision model image formats — animated GIF/WebP frames are converted to PNG (first frame only) before submission
- Plugins: "allow/deny" wording in plugin config unified as "read/do not read", more semantically accurate to the actual functionality
- Maisaka: adjusted person reference wording in planning prompts
- Engineering: PyPI index config now supports multi-source fallback (Tsinghua → Aliyun → official), improving install reliability in mainland China
:::

::: timeline 2026-08-19
- [1.2.1] Fixed MCP long-running calls being wrongly timed out, Maisaka final-message compatibility and own-message identification; WebUI now applies saved model config immediately and displays offline adapters correctly
- MCP: fixed Streamable HTTP long-running tool calls wrongly using the HTTP request timeout; reading responses now follows the session read timeout
- Maisaka: fixed compatibility of the final assistant message, now ending with a user message; own messages are now always marked to reduce the model mistaking message sources (removed the `self_message_special_mark` config option)
- WebUI [1.7.1]: model config is now synced to the runtime immediately after saving, avoiding configs not applying in Docker; fixed chat page monitoring state (errors and thinking order); offline adapters are now displayed correctly
- Adapters: deleting a group chat now also cleans up the explicit allow/deny rules in the adapter policy
- Config: fixed WebUI saving configuration potentially producing invalid TOML
:::

::: timeline 2026-08-18
- [1.2.0] Maisaka: Replyer now uses different reply modes per scenario for more diverse replies; improved Replyer organization
- Reply effect evaluation upgraded (currently v6): responsiveness no longer considers reply speed, removed the raw total score without clear semantics, records without related info are marked "completed / no info", records that didn't finish the observation window are marked "incomplete" and excluded from scoring; score distribution is now a per-sample scatter plot; supports deleting / clearing score records
- Models: official support for the Response endpoint; model context and output upgraded to a flat Item-first structure, keeping body, reasoning, function calls, tool results and provider-native activities separate
- Expression: fixed repeated abnormal restarts after expression vector index corruption; optimized online index maintenance (incremental assignment, k-means++, lock-free atomic writes)
- Adapters: bot platform accounts now persist the identity reported by the adapter, so multiple accounts on one instance are reliably recognized; adapters can auto-discover their ID; access policy adds independent group and private default actions (allow by default, switchable to deny)
- WebUI [1.7.0]: new dedicated adapter management and unified command management pages; improved model configuration layout; fixed local model testing bug; settings page shows discovered adapter accounts with online status and soft disable / restore; group frequency can be set per mode (with wildcard and default config); reasoning logs now show input, output and total tokens
- Messages: nested forwarded messages can now be viewed
- Plugin SDK: `send.text`, `send.emoji`, `send.image`, `send.forward`, `send.hybrid`, `send.command` and `send.custom` support `return_details=True` to get the platform-confirmed final message ID
- Improved startup onboarding
:::

::: timeline 2026-08-04
- [1.1.4] Models: added support for the OpenAI Responses API (text, images, structured output, function tools, native tools, streaming events and usage stats); added native web search for DeepSeek v4 flash with related parameters
- Maisaka: Responses native web search summaries (query, action, status and source count for the round) shown in the monitor and regular logs
- WebUI [1.6.3]: new native detailed statistics page (keeps the old HTML report, interactive filtering by model/module/request type/chat flow, trends and performance metrics)
- Plugin management: shows conflicting directories of duplicate plugins with explicit load failure reasons; refreshes runtime state immediately after enabling a plugin; cleans up empty plugin root directories on startup
- Fixed being unable to add a new model provider when both model and provider lists are empty; improved plugin market card layout
:::

::: timeline 2026-07-28
- [1.1.3] WebUI: optimized sidebar hover behavior, page colors and layout, new storage management page
- Maisaka: fixed Planner native reasoning incorrectly passed as body to Replyer; added typo correction message references
- [1.1.2] WebUI: optimized homepage cards
- [1.1.1] Main program: statistics charts split into customizable cards, fixed memory growth from full model call detail loading
- WebUI: LLM request error classification in reasoning view, global AI search upgraded to draggable multi-turn Agent overlay
- Chat: fixed session teardown on page switch, default nickname "Human", user avatar and emoji support
- Plugin list now layered by load status; homepage version and card layout streamlined
- Maisaka: added `reply.before_post_process` Hook for per-reply text post-processing control
- MCP: process-level shared server connections with hot reload, improved WebUI MCP configuration
:::

::: timeline 2026-07-22
- [1.1.0] Main program: optional interactive terminal input with `/clear`, `/pm`, `/offline`, `/online` commands for chat and adapter management
- A_Memorix: long-term memory lifecycle (decay/freeze/restore/protect/recycle bin), improved retrieval quality and character profiles
- Legacy memory migration fixes: orphaned associations, timeline selection, entity renaming issues
- Maisaka: separated behavior style from persona, fixed cross-day time reminder interrupting tool chains
- WebUI: fixed frequency display precision, QQ number config, model rename, and homepage animation issues
- Plugins: automatic compatibility check after host update, tightened Host version range
:::

::: timeline 2026-07-09
- [1.0.12] Improved Planner-to-Replyer information transfer and reduced duplicate replies
- WebUI: more reliable offline observation records, custom API model lists, multiple model configurations, data import/export, and upgrade announcements
- Initial setup now guides users to replace the temporary startup Token with a persistent Token
- Messaging: the host can control adapter admission; fixed handling of oversized emoji images
:::

::: timeline 2026-07-04
- [1.0.11] Attempted fix for the self-reply issue
- Improved the logic of necessity-triggered mode
- Continued work on the planner reasoning without replying issue
- Fixed the WebUI embedding model test
- Improved the `send_image` tool
- Fixed an error when the prompt manager compares against defaults
:::

::: timeline 2026-07-03
- [1.0.10] Maisaka: fewer cases of reasoning without replying; added the experimental "rich reply capability" feature
- Memory: added a global shared-memory switch and memory sharing groups, and improved memory-related settings
- WebUI: home page cards can be sorted, removed, and resized
- Plugins: custom home page cards can be added
:::

::: timeline 2026-07-02
- [1.0.9] Memory: the memory system was updated with a large performance boost and a better long-term memory WebUI experience
- WebUI: added model testing, improved expression and jargon configuration, and faster plugin management updates
- Fixes: @ now works when the bot's actual nickname differs, fixed the Docker WebUI address issue, and more
- Plugins: a unified persistent data API for plugins, plus statistics-related plugin APIs
:::

::: timeline 2026-06-25
- [1.0.8] Maisaka: reply frequency logic changed, with fewer empty tool calls and errors
- Learning upgrade: expressions gained "fine/super fine" modes, improving accuracy 3x
- Better jargon learning quality, with cluster browsing in the WebUI
- WebUI: improved the Mai observation experience, fixed leftover plugin downloads, and added multi-host binding
- **Note: this version has significant changes; see the notes below**
:::

::: timeline 2026-06-19
- [1.0.7] WebUI: improved Mai observation real-time behavior and avatar display, added a chat management tab
- Mai reasoning replay is now available, making debugging easier
- Better config editing: sticky header and a denser information layout
- Faster jargon management loading, plus font size adjustment support
:::

::: timeline 2026-06-16
- [1.0.6] Maisaka: fixed some APIs not supporting the `tool_choice` parameter, improved planner and Telegram calls
- [1.0.5] WebUI: completed configuration item name descriptions, removed the startup page animation for low-performance devices
- Storage optimization: greatly reduced database size bloat, with automatic background cleanup of redundant data
:::

::: timeline 2026-06-15
- [1.0.4] Fixes: Docker playwright issue, adjusted the default WebUI log column width
- Storage optimization: greatly reduced database bloat, with automatic background cleanup
:::

::: timeline 2026-06-14
- [1.0.3] Maisaka: special marking of its own messages, improved mid-term memory and context handling
- Behavior learning improvements: scenario matching, feedback consolidation, use-it-or-lose-it, and similar-behavior merging
- WebUI: avatar cache display, reasoning process filtering enhancements, and structured prompt display
:::

::: timeline 2026-06-13
- [1.0.2] Maisaka: multiple expression selection no longer breaks the cache
- [1.0.1] WebUI: more complete plugin installation progress display, improved configuration page and model vendor list
- Plugin compatibility: minor versions within the same major version load compatibly, relaxed manifest validation
- Stability: statistics output interval slowed to 15 minutes, reducing log spam
:::

::: timeline 2026-06-12
- [1.0.0] **Major release!** Maisaka's core reply mechanism is upgraded to agent-style work
- A_Memorix memory system becomes the mainline: paragraphs, entities, relationships, sources, vectors, and graphs are stored in a unified way
- WebUI/Dashboard completes a new interface system upgrade: chat, configuration, plugins, memory, and other core capabilities are integrated
- The plugin system is refactored into an independent `plugin_runtime`, supporting independent start/stop, reload, and runtime status tracking
- For dev builds and more detailed changelogs, see [GitHub Releases](https://github.com/Mai-with-u/MaiBot/releases).
- For a more complete illustrated explanation, see the [MaiBot 1.0.0 Update Feature](./v1-0-0.md)
:::

::: timeline 2026-01-11
- [0.12.2] Optimized private chat wait logic, force quote reply on timeout
- Fixed disconnection issues with some adapters, optimized memory retrieval logic
- Updated the README
:::

::: timeline 2025-12-31
- [0.12.1] Year-end summary feature (WebUI), optional LLM judgment for quote replies
- Expression optimization: automatic and manual evaluation support
- Reply and planning records viewable in WebUI
:::

::: timeline 2025-12-21
- [0.12.0] Thinking effort mechanism: dynamic reply time and length control
- Planner and Replyer integration for better reply logic
- New private chat system that absorbs PFC mechanisms
- Mai dreaming feature; MCP plugin as a built-in plugin (disabled by default)
- WebUI major update: model preset marketplace released, comprehensive security hardening, frontend auth refactoring
:::
