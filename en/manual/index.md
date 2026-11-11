---
title: Quick Start
---

# Quick Start

MaiBot is an interactive agent built on large language models. Through adapters it connects to QQ, Telegram, email, iMessage, and other platforms — chatting in groups like a person, remembering, learning, and doubling as a desktop pet on your computer.

Getting it running takes four steps: install, open the WebUI, add a model, connect a chat platform.

## Requirements

A computer with internet access (Windows 10+ / Linux / macOS), at least 2GB of free memory, and an LLM API key.

## Running in five minutes

::: steps

1. **Install MaiBot** — Install the main program with uv, then generate config in the instance directory. The commands are the same on Windows, Linux, and macOS.

   ::: code-group

   ```bash [Install and initialize ~vscode-icons:file-type-python~]
   uv tool install --python 3.13 maibot
   mkdir my-maibot && cd my-maibot
   maibot init
   ```

   :::

   `maibot init` creates `config/` in the current directory plus `data`, `logs`, `plugins`, and `temp`; existing config is preserved. On success it prints `MaiBot 实例已初始化：<directory>`.

   Prefer not to use uv? See [Windows deployment](./deployment/windows), [Linux deployment](./deployment/linux), [Docker deployment](./deployment/docker), or the [one-click package](./deployment/windows).

2. **Start and open the WebUI** — Run `maibot run` in the instance directory. It starts the host and every bot in that workspace. Open `http://127.0.0.1:8001/` in a browser, log in with the temporary login password printed in the terminal, then set a fixed password in the wizard.

3. **Configure a model** — In **Model Management**, enter the provider URL, API key, and model names. In **Task Assignment**, map thinking, reply, and vision tasks to specific models. See [Model configuration](./configuration/model-config) for field meanings.

4. **Connect a chat platform** — QQ has two routes: the OneBot Adapter, installed from the plugin market, and the QQ Official Bot, which ships with the program. Telegram and WeChat ClawBot are built-in adapters as well. See [Connect platforms](./adapters/).

:::

Once that works, send MaiBot a message. A reply means both the model and the platform are wired correctly.

## Look things up

**[Deployment](./deployment/uv-tool.md)** — uv install, Windows / Linux source deployment, Docker, and the one-click package.

**[Configuration](./configuration/)** — Every field in `bot_config.toml` and `model_config.toml`, thinking-mode parameters, and memory engine tuning.

**[Connect platforms](./adapters/)** — Adapter selection and setup: QQ, Telegram, WeChat ClawBot, email, iMessage, voice calls.

**[WebUI](./webui/)** — Login, editing config, chat and observation, statistics, file management, data migration.

**[Plugins](./plugins/)** — Install, enable, and update plugins from the plugin market.

## Go further

**[Multiple bots](./multi-bot-host.md)** — Run several Mai instances in one workspace, each with its own config, data, and plugins.

**[Personality](./personality.md)** — Keep several profiles, import JSON, and hot-swap between them.

**[Chat scenes](./chat-scenes.md)** — Talk-rule groups, quick reaction, Focus, and reply templates.

**[Files](./files.md)** — Send, receive, save, and read chat attachments.

**[Desktop pet](./desktop-pet.md)** — Skin packs, remote connections, todos, images, and screen reading.

**[Internal chat](./internal-chat.md)** — The web chat room and desktop pet share one owner identity.

**[Mai help](./webui/ai-help.md)** — The built-in help agent that searches docs, finds plugins, and edits config.

## For developers

- [Development overview](/en/develop/) — Platform adapters and plugin development
- [Plugin development guide](/en/develop/plugin/) — Write plugins that extend MaiBot

## Troubleshooting

- Check the [FAQ](/en/faq/) first — deployment, connection, and most error questions are already answered there.
- Join the [community](/en/about/community) for technical help and friendly chat.
- Or ask on GitHub Discussions: <Linkcard url="https://github.com/Mai-with-u/docs/discussions" title="MaiBot Discussions" description="Ask questions, report doc issues, and join the discussion" />
