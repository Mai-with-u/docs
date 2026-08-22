# Changelog

For dev and detailed changelogs, see [GitHub Releases](https://github.com/MaiM-with-u/MaiBot/releases).

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

::: timeline 2026-06-12
- [1.0.0] **Systematic upgrade!** Maisaka inference engine refactored with Planner-Replyer deep integration
- Thinking effort mechanism: dynamically controls reply time and length
- A-Memorix Memory Engine v1.0: knowledge graphs, character profiles, chat summaries
- Feedback correction system: automatically corrects outdated memories
- MCP built-in plugin; global memory configuration added
- WebUI: Model preset marketplace, comprehensive security hardening, frontend auth refactoring
- For a more complete illustrated explanation, see the [MaiBot 1.0.0 Update Feature](./v1-0-0.md)
:::

::: timeline 2026-01-11
- [0.12.2] Optimized private chat wait logic, force quote reply on timeout
- Fixed disconnection issues with some adapters, optimized memory retrieval logic
:::

::: timeline 2025-12-31
- [0.12.1] Year-end summary feature (WebUI), optional LLM judgment for quote replies
- Expression optimization: automatic and manual evaluation support
- Reply and planning records viewable in WebUI
- Global memory blacklist: exclude specific group chats from global memory
:::

::: timeline 2025-12-21
- [0.12.0] Thinking effort mechanism: dynamic reply time and length control
- Planner and Replyer integration, new private chat system
- MaiMai dreaming feature, MCP plugin as built-in
- Global memory configuration added
:::

## Earlier Versions

For changelog of earlier versions, see [GitHub Releases](https://github.com/Mai-with-u/MaiBot/releases).
