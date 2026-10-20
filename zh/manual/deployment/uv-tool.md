---
title: uv 安装
---

# uv 安装

**用 uv 安装 MaiBot，再创建一个保存配置和数据的实例目录，即可通过 WebUI 与麦麦聊天。** 这套方式适用于 Windows、Linux 和 macOS，WebUI 和 Python 依赖会一起安装。想修改主程序代码，可以继续使用[Windows 源码部署](./windows)或[Linux 源码部署](./linux)；启动器仍可按[一键包教程](./windows)使用。

## 安装 uv

先安装 uv，再重新打开终端。其他安装方式见 [uv 官方安装指南](https://docs.astral.sh/uv/getting-started/installation/)。

::: code-group

```powershell [Windows PowerShell ~vscode-icons:file-type-shell~]
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

```bash [Linux / macOS ~vscode-icons:file-type-shell~]
curl -LsSf https://astral.sh/uv/install.sh | sh
```

:::

## 安装 MaiBot

以下命令安装 PyPI 上的正式版。MaiBot 要求 Python 3.12+，这里使用 Python 3.13；缺少对应 Python 时，uv 会自动下载。

::: code-group

```bash [uv ~vscode-icons:file-type-python~]
uv tool install --python 3.13 maibot
maibot --version
```

:::

如果提示找不到 `maibot`，执行 `uv tool update-shell`，然后重新打开终端。

## 创建实例

在你希望保存配置和聊天数据的位置打开终端，创建实例目录：

::: code-group

```bash [初始化 ~vscode-icons:file-type-shell~]
mkdir my-maibot
cd my-maibot
maibot init
```

:::

`maibot init` 默认使用当前目录，创建 `config`、`data`、`logs`、`plugins` 和 `temp`。重复执行会保留已有配置。

编辑 `config/model_config.toml`，填写模型服务商、API Key、模型名称及任务分配，具体示例见[模型配置](/manual/configuration/model-config)。麦麦的昵称、人格及监听端口在 `config/bot_config.toml` 中设置。

## 启动和登录

在实例目录启动：

::: code-group

```bash [启动 ~vscode-icons:file-type-shell~]
maibot run
```

:::

首次启动按提示阅读并确认协议。浏览器打开 `http://127.0.0.1:8001/`，输入终端显示的临时 Token，设置固定访问密码并完成首次设置。打开「麦麦聊天」，发一句「你好，请告诉我一加一等于几」，确认能收到回复。登录操作见[WebUI 登录与设置](/manual/webui/)。

接入 QQ 等平台时，继续按照[接入平台](/manual/adapters/)安装适配器。第三方插件保存在实例目录的 `plugins` 中。

从其他目录启动时，指定实例路径。下面两条命令要在 `my-maibot` 的上一级目录执行：

::: code-group

```bash [指定实例目录 ~vscode-icons:file-type-shell~]
maibot init --directory "./my-maibot"
maibot run --directory "./my-maibot"
```

:::

## 数据和升级

配置、数据库、日志、第三方插件及自定义提示词都保存在实例目录；升级或卸载工具不会删除这个目录。备份时，先停止实例，再复制整个实例目录。

升级前停止所有使用这个 uv 工具环境的实例并做好备份，再执行：

::: code-group

```bash [升级 ~vscode-icons:file-type-python~]
uv tool upgrade maibot
```

:::

升级后，在原实例目录重新执行 `maibot run`。多个实例共用同一个工具环境时，主程序版本会一起更新。安装版通过 uv 升级，WebUI 的 Git 自更新用于源码部署。

需要固定某个正式版时，可以指定版本号：

::: code-group

```bash [固定版本 ~vscode-icons:file-type-python~]
uv tool install --force --python 3.13 "maibot==1.3.8"
```

:::

固定版本后，普通升级命令会保留该版本约束。要恢复跟随正式版，执行 `uv tool install --force --python 3.13 maibot`。程序降级时，数据库不保证能供旧版本使用，应同时恢复升级前的备份。

## 使用原来的数据

停止原源码实例并备份整个目录，可以直接将原仓库目录作为安装版的实例目录。将下面路径替换成原目录的实际路径：

::: code-group

```bash [复用原实例 ~vscode-icons:file-type-shell~]
maibot init --directory "/path/to/existing/MaiBot"
maibot run --directory "/path/to/existing/MaiBot"
```

:::

`init` 只生成缺失的配置，原来的 `config`、`data` 和 `plugins` 会保留；正常启动会检查配置及数据库版本，并执行已有的升级流程。也可以把原实例文件复制到新目录再启动。不要同时用源码和安装版运行同一个数据目录，第三方插件需兼容当前 MaiBot 版本。

## 验证与排错

**验证**：`maibot --version` 能显示版本号；启动后 WebUI 首页显示主程序和 WebUI 版本，「麦麦聊天」能收到实际模型回复。

- **命令找不到**：执行 `uv tool update-shell` 并重开终端；安装方法见 [uv 工具指南](https://docs.astral.sh/uv/guides/tools/)。
- **提示实例未初始化**：在实例目录执行 `maibot init`；从其他目录启动时加 `--directory` 指向同一个目录。
- **端口被占用**：在实例的 `config/bot_config.toml` 中，将 `webui.port` 改成空闲端口，例如 `18001`；若消息服务的 `8000` 端口也被占用，将 `maim_message.ws_server_port` 改成 `18000`，重启后用新 WebUI 端口访问。
- **Windows 后台启动报没有控制台**：在实例配置的 `[debug]` 部分将 `enable_console_input` 设置为 `false`，重启后通过 WebUI 聊天。
- **能登录但不回复**：查看实例目录的 `logs`，检查模型的 API Key、模型标识及任务分配，按[模型配置](/manual/configuration/model-config)修正。
