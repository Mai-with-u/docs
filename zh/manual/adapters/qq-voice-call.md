---
title: QQ 语音通话适配器
---

# QQ 语音通话适配器

**为 QQ 增加实时语音通话入口（社区维护）。** QQ 语音通话适配器为 MaiBot 增加 QQ 实时语音通话入口：QQ 通话的媒体链路（来电、自动接听、音频设备）交给一个独立的 **NapCat AV 桥**处理，而人物身份、近期消息、记忆查询和模型路由都留在 MaiBot 插件 SDK 内——电话里的麦麦继续复用 MaiBot 的人设、记忆和模型体系。

::: info 连接方向
`QQ / NapCat ← 通话信令与原生音频 → NapCat AV 桥 ← HTTP（仅回环 + Bearer Token）→ MaiBot 插件`

适配器不直接连接 QQ：它轮询本机回环地址上的桥接状态接口，音频经 PulseAudio 虚拟设备进出。桥接只监听回环地址，并对状态与控制接口校验 Bearer Token。仓库不分发 QQ、NapCat 或 `libAVSDKPlugin.so`。
:::

适配器仓库（🌐 社区维护）：

<Linkcard url="https://github.com/ClaudiaGardner/maibot-qq-voice-call" title="maibot-qq-voice-call" description="ClaudiaGardner 维护的 QQ 语音通话适配器插件" />

## 1. 准备运行环境

### 环境要求

- **MaiBot** — `1.0.0` 及以上；`maibot-plugin-sdk` `2.5.4` 及以上、`3.0` 以下
- **Python** — 3.12+
- **系统** — Linux，PulseAudio（或 PipeWire 的 Pulse 兼容层），以及 `pactl`、`parec`、`pacat`、`xvfb-run`、`curl`
- **NapCat** — `4.14.0` 及以上，与包含 `libAVSDKPlugin.so` 的 Linux QQ
- **DashScope** — 实时 ASR 与实时克隆 TTS 权限
- **模型** — MaiBot 模型管理中可用的电话回复模型（默认使用 `utils` 任务的 `deepseek-v4-flash`）

以 Debian/Ubuntu 为例安装系统依赖：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
sudo apt-get install pulseaudio pulseaudio-utils xvfb curl
```

:::

### 准备凭证

密钥放在 MaiBot 进程环境中，不要写进仓库或 `config.toml`：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
export DASHSCOPE_API_KEY="..."
export MAIBOT_QQ_CALL_VOICE_ID="..."
```

:::

- **`DASHSCOPE_API_KEY`** — DashScope API Key，实时 ASR 与实时克隆 TTS 共用；这是默认环境变量名，可用 `asr.api_key_env` / `tts.api_key_env` 更改
- **`MAIBOT_QQ_CALL_VOICE_ID`** — Qwen3 实时克隆 TTS 的克隆音色 ID；也可以直接填进 `tts.voice_id`
- **`MAIBOT_QQ_CALL_BRIDGE_TOKEN`** — 桥接鉴权 Token；不设置时适配器读取 `bridge.token_file` 指向的 Token 文件（由安装器自动生成，权限 `0600`）

### 安装 QQ AV Bridge

先安装并确认 Linux QQ 与 NapCat 能正常登录，然后在适配器仓库根目录运行安装器——先 `--check` 自检路径与兼容性，再正式安装：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
./bridge/scripts/install.sh \
  --napcat-dir /path/to/QQ/resources/app/app_launcher/napcat \
  --qq-dir /path/to/QQ \
  --check

./bridge/scripts/install.sh \
  --napcat-dir /path/to/QQ/resources/app/app_launcher/napcat \
  --qq-dir /path/to/QQ
```

:::

安装器会完成以下操作：

- 把 `napcat-plugin-maibot-qq-voice-call` 安装到 NapCat 的独立 `plugins/` 目录；
- 在 `~/.local/share/maibot-qq-voice-call` 安装 AV Host 与运行脚本（可用 `--install-dir` 更改）；
- 创建权限为 `0600` 的 32 字节随机 Bridge Token；
- 备份 QQ 原始 Loader，再安装带 `MAIBOT_QQ_CALL_LOADER_HOOK_V1` 标记的最小可逆 Hook——普通 QQ 进程继续加载备份的原入口，只有第二个 AV Host 进程才加载 AVSDK。

::: warning 版本敏感
Loader Hook 与 AVSDK 属于 QQ/NapCat 版本敏感集成。QQ 或 NapCat 升级后，应先重新运行安装器和诊断，并用测试账号完成一次来电验证，再切回生产账号。
:::

### 启动机器人 QQ

安装完成后，把终端显示的 Token 文件路径填入适配器的 `bridge.token_file`，再用桥接脚本启动机器人 QQ（脚本会自动拉起隔离的 PulseAudio 服务与 AV Host）：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
MAIBOT_QQ_CALL_BOT_UIN="机器人QQ号" \
  ~/.local/share/maibot-qq-voice-call/scripts/run-napcat.sh
```

:::

脚本创建仅当前用户可访问的 PulseAudio socket，并提供三个虚拟设备，稍后填入适配器配置：

- `maibot_qq_speaker.monitor` — MaiBot 的 ASR 输入（QQ 对端声音）
- `maibot_qq_mic` — MaiBot 的 TTS 输出（QQ 麦克风）
- `maibot_qq_mic_source` — QQ 使用的默认麦克风 source

## 2. 配置适配器连接

启动 MaiBot 后，在 WebUI 的插件配置中填写；Runner 会根据配置生成 `config.toml`。下面是一份**完整可复制**的配置模板（默认值与仓库 `0.3.4` 一致），按注释修改即可：

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true            # 启用 QQ 语音通话插件
config_version = "0.3.4"  # 配置结构版本，一般不要改动
account_id = "你的机器人QQ号"  # 用于网关状态上报
scope = "primary"             # MaiBot 多账号路由作用域
log_transcripts = true        # 在日志中记录 ASR 文本与回复

[bridge]
base_url = "http://127.0.0.1:6110"  # NapCat AV 通话桥的 HTTP 地址
token_env = "MAIBOT_QQ_CALL_BRIDGE_TOKEN"  # 桥接 Token 环境变量名
token_file = "/安装目录/runtime/control.token"  # 桥接 Token 文件，优先级低于环境变量
poll_interval_seconds = 0.25  # 通话状态轮询间隔（秒）
request_timeout_seconds = 5.0 # 桥接请求超时（秒）

[audio]
pulse_server = "unix:/安装目录/runtime/pulse/native"  # PulseAudio 地址，留空时继承进程环境
capture_device = "maibot_qq_speaker.monitor"  # ASR 输入（QQ 对端声音）
playback_device = "maibot_qq_mic"             # TTS 输出（QQ 麦克风）
sample_rate = 16000       # ASR 输入采样率
frame_ms = 30             # 语音活动检测帧长（毫秒）
end_of_speech_frames = 18 # 判定说完所需静音帧数
barge_in_speech_frames = 18  # 打断 TTS 所需语音帧数
min_utterance_seconds = 0.7  # 最短语音片段（秒）
min_speech_seconds = 0.45    # 片段内最短有效语音（秒）

[asr]
backend = "dashscope-realtime"  # dashscope-realtime / maibot
api_key_env = "DASHSCOPE_API_KEY"
model = "qwen3-asr-flash-realtime"
websocket_base_url = "wss://dashscope.aliyuncs.com/api-ws/v1/realtime"
final_timeout_seconds = 1.5  # 句尾结果等待超时（秒）

[chat]
task_name = "utils"       # MaiBot 模型任务名，utils 默认用 deepseek-v4-flash
temperature = 0.2         # 通话回复温度
max_tokens = 128          # 通话回复最大 Token 数
max_reply_chars = 80      # TTS 前的最大回复字数
history_messages = 8      # 通话内保留的历史消息数
context_recent_messages = 4  # 读取的近期 QQ 消息数
context_message_chars = 120  # 每条近期消息最大长度
context_memory_chars = 1000  # 人物记忆最大长度
context_prompt_chars = 2400  # 来电者上下文最大长度
contextual_greeting_enabled = true  # 有上下文时由模型生成开场白
greeting_timeout_seconds = 2.5  # 开场白生成超时（秒）
greeting = ""             # 无上下文、生成失败或超时时的接通问候语
system_prompt = ""        # 电话模式系统提示（模型可用 [WAIT] 放弃不可靠输入）

[tts]
backend = "dashscope-realtime"
api_key_env = "DASHSCOPE_API_KEY"
model = "qwen3-tts-vc-realtime-2026-01-15"  # 实时克隆 TTS 模型
voice_id = "你的克隆音色ID"  # 留空时从环境变量读取
voice_id_env = "MAIBOT_QQ_CALL_VOICE_ID"
websocket_base_url = "wss://dashscope.aliyuncs.com/api-ws/v1/realtime"
sample_rate = 24000       # TTS 输出采样率
playback_latency_ms = 80  # PulseAudio 播放缓冲时长，过低会卡顿
gain_db = 8.0             # 播放增益，过高会爆音
speech_rate = 1.08        # 语速倍率

[memory]
enabled = true            # 挂断后整理并写回 MaiBot 私聊记忆
summary_task_name = "utils"  # 生成摘要和人物事实所用的模型任务名
summary_temperature = 0.2    # 摘要模型温度
summary_max_tokens = 320     # 摘要最大 Token 数
min_turns = 1                # 触发归档所需的最少有效对话轮数
max_turns = 24               # 单次归档保留的最大有效对话轮数
max_transcript_chars = 6000  # 有效对话文本最大字符数
max_summary_chars = 240      # 通话摘要最大字符数
max_facts = 6                # 最多写回的关键人物事实数
include_transcript = true    # 归档中包含清洗后的有效对话
persist_private_session = true  # 持久化到来电者的 MaiBot 私聊历史
append_maisaka_context = true   # 追加到当前 Maisaka 上下文
write_timeout_seconds = 20.0    # 单次挂断归档超时（秒）
```

:::

保存后插件会热重启运行时，通常无需重启 MaiBot。完整示例见仓库的 [`examples/config.example.toml`](https://github.com/ClaudiaGardner/maibot-qq-voice-call/blob/main/examples/config.example.toml)。

## 验证与排错

启动机器人 QQ 与 MaiBot 后，运行桥接诊断脚本，逐项检查依赖命令、文件、Loader Hook 标记、NapCat 插件启用状态、隔离 PulseAudio、AV Host 健康端点与带鉴权的桥接端点：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
~/.local/share/maibot-qq-voice-call/scripts/doctor.sh
```

:::

全部通过时输出 `all bridge checks passed`。

**验证运行时就绪** — 调用插件 API `github.claudiagardner.maibot-qq-voice-call.get_call_status`，返回通话状态、最近 ASR/LLM/TTS 耗时及最后一次记忆写回结果；`ready` 为 `true` 表示链路就绪。

**真实来电验证** — 用测试账号向机器人 QQ 发起语音通话：桥应自动接听，`plugin.log_transcripts = true` 时 MaiBot 日志出现 ASR 转写与回复；挂断后来电者私聊中出现以 `[QQ语音通话记录]` 开头的归档消息，且不会额外向 QQ 发送文字回复。

**桥接端点鉴权失败** — 核对 `bridge.token_file` 指向安装器输出的 Token 文件，或设置 `MAIBOT_QQ_CALL_BRIDGE_TOKEN` 环境变量；与桥不一致时诊断中的「authenticated NapCat bridge endpoint」会失败。

**没有声音或听不到对方** — 确认 `audio.pulse_server` 指向安装目录 `runtime/pulse/native` 的 Unix socket，且 `capture_device` / `playback_device` 分别是 `maibot_qq_speaker.monitor` 与 `maibot_qq_mic`；TTS 卡顿可适当调高 `tts.playback_latency_ms`。

**安装器拒绝叠加 Hook** — 说明 QQ Loader 已被旧的 AV Host 集成改写；找到升级前保存的干净 Loader，用 `--original-loader /path/to/clean-loader.js` 明确指定后再安装。

**QQ / NapCat 升级后** — Loader Hook 与 AVSDK 是版本敏感集成：重新运行安装器与 `doctor.sh`，并用测试账号完成一次来电、接通、双向音频和挂断测试，不要未经验证直接替换正在运行的生产链路。

**卸载** — 运行 `~/.local/share/maibot-qq-voice-call/scripts/uninstall.sh`，默认保留运行目录与 Token 便于恢复，加 `--purge` 才一并删除；卸载只在 Loader 标记仍匹配时恢复备份，不会覆盖 QQ 升级后的新文件。