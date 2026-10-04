---
title: Memory and Learning
---

# Memory and Learning

## How do I enable long-term memory?

Enable A_Memorix in the WebUI and configure a working embedding model. In configuration, the master switch is `enabled` under `[a_memorix.plugin]`. See [A_Memorix Configuration](../manual/configuration/amemorix-config.md).

If you also want **image memory** (search-by-image and similar-image recall), you must configure the separate image embedding task `[model_task_config.image_embedding]`. With only a text embedding configured, images are still stored but cannot be searched.

## Why does the WebUI say relation vectors are disabled?

Normal memory vectors and relation vectors are separate features. Relation vectors are supported but disabled by default; this message does not mean all long-term memory is broken.

The enable, backfill, and import-write behavior is controlled under `a_memorix.retrieval.relation_vectorization`. Historical backfill can generate additional embedding requests.

## Why are there embedding requests when relation vectors are disabled?

Embeddings are also used for paragraphs, entities, and long-term memory retrieval. Disabling relation vectors only stops vector behavior for relation records, not the entire memory vector system.

## Can I leave the embedding model unconfigured?

Features that depend on vector retrieval, including long-term memory and knowledge import, require an embedding model. It can be omitted only when those features are not used; otherwise calls will be skipped or fail.

## Does image memory need an extra model?

Yes, and it is a **separate** model task. Text embeddings (`embedding`) and image embeddings (`image_embedding`) are not interchangeable: with only a text embedding configured, images are still stored with their cognitions, but the retrieval state shows the model as unavailable.

## Why does it say the image embedding model is unavailable?

Check these in order:

1. Whether `[model_task_config.image_embedding]`'s `model_list` actually contains a model (leaving it empty does **not** fall back to the text embedding)
2. Whether that model supports an "image input to vector" protocol rather than text only
3. Whether the provider address uses HTTPS and the key is valid
4. Open **Long-term memory → Image memory → Job diagnostics** to see the last error and retry count

When the model is unavailable, MaiBot retries at `[a_memorix.image_memory].probe_retry_seconds` rather than silently switching to another model.

## Is a similar image the same image?

Not necessarily. Results distinguish **exact hash matches** (identical content) from **visually similar** candidates (close in vector space). Similarity only means visual closeness, so it never proves two photos show the same object; the right approach is to hand the candidate image and its associated discussion to the model.

## Can image memory leak across chats?

Image retrieval and text retrieval **share the same chat-stream scope resolution**: by default only the current chat stream is searched, global sharing follows the global rules when enabled, and configured sharing groups see each other. Chat streams that do not share memory cannot see each other's images, matching the boundary for text memory.

## Are emoji remembered?

Not by default. Image memory handles ordinary static image components in messages; emoji have their own recognition and sending logic and are not included automatically.

## Why does a memory reverse people or subject and object?

Inspect the source message for ambiguity, then review extraction and write-back logs. If the source is clear but extraction is wrong, test another memory-task model and correct or remove the stored item in the WebUI. A single failure is not enough to declare a specific model permanently unusable.

## How many examples are required to learn jargon?

There is no guaranteed fixed count. Sample consistency, context, and the learning model all affect the result. More consistent examples improve reliability, but learned meanings should still be reviewed and corrected in the WebUI when necessary.

## How can several chats share expressions or jargon?

Place the desired chat streams in the same expression or jargon sharing group. See [Bot Configuration](../manual/configuration/bot-config.md) for wildcard rules. Use global wildcards only when every chat should share learning results.

