---
title: 多实例
---

# 多实例

一个工作区可以同时运行多只麦麦。每个 Bot 是独立进程和独立目录，配置、数据、插件互不影响，在 WebUI 里共用一个管理入口和登录。

## 启用第一个 Bot

MaiBot 的唯一启动入口是宿主（Host）。宿主启动时按工作区目录内容决定布局：

- 目录里已有 `config/bot_config.toml`，视为旧用户：把当前目录原地登记为一个 Bot，不移动、不复制任何数据。
- 否则视为新用户：在 `bots/<id>/` 下创建第一个 Bot。

工作区结构：

```
<工作区>/
  host/
    registry.sqlite3     Bot 登记表
    config.toml          宿主配置：监听地址、Cookie、公开地址
    model_catalog.toml   共享供应商、API Key、模型与联网服务
    webui.json           WebUI 登录凭据
    sessions.sqlite3     登录会话
    run.lock             宿主运行租约
    control.json         控制通道地址与凭据
  bots/<bot_id>/
    config/ data/ logs/ plugins/ temp/
```

## 管理 Bot

WebUI 侧栏底部的 Bot 切换入口用于选择当前 Bot。选中后，配置、聊天、插件和资源页面都读写该 Bot 的数据；所有 Bot 都停止时仍可在这里管理它们。

在 Bot 管理页可以新建、启动、停止、重启、重命名、克隆和归档：

- **重命名** 只改显示名称，不改 Bot ID、目录和人格昵称。
- **克隆** 复制源 Bot 的 `config/` 和 `plugins/`，新 Bot 使用新 ID、默认停止，不复制 `data/`、日志和临时文件。配置里的账号和密钥会一起复制，启动前要改掉，否则两个 Bot 会连同一个账号。
- **归档** 先停止进程，把整个目录移到 `host/archives/<bot_id>/instance`，再移除活动登记。原地登记的旧 Bot 和外部目录只停止并移除登记，目录留在原处。

「运行中」只表示 Bot 进程存活，不代表账号已登录或模型、适配器已就绪。

也可以用命令行管理：

::: code-group

```bash [宿主指令 ~vscode-icons:file-type-shell~]
maibot host list --directory <工作区>            # 列出已登记的 Bot
maibot host create-bot --directory <工作区> --name 工作助手
maibot host start --directory <工作区> --bot-id <bot_id>
maibot host stop --directory <工作区> --bot-id <bot_id>
maibot host restart --directory <工作区> --bot-id <bot_id>
maibot host status --directory <工作区>          # 查询运行中宿主内各 Bot 的状态
maibot host open-webui --directory <工作区>      # 取得 WebUI 的单次登录链接
maibot host plugin-deps --directory <工作区>     # 列出缺失依赖，加 --install 统一安装
maibot host shutdown --directory <工作区>        # 关闭宿主及全部 Bot，不改变期望状态
```

:::

`open-webui` 给出的一次性登录链接适合在远程机器上打开 WebUI，不用手动复制临时登录密码。

## 共用配置与独立配置

`host/config.toml` 管理唯一的宿主监听地址、登录 Cookie 和公开访问地址。`[webui].public_base_url` 是外部可访问的 HTTP(S) 地址，用于生成所有 Bot 的文件链接；留空时使用宿主本地监听地址。经过反向代理或供远程访问时应显式填写。

`host/model_catalog.toml` 是供应商、API Key、模型及联网服务定义的唯一来源，格式版本 `3.0.0`。各 Bot 的 `model_config.toml` 只保存任务模型与联网服务选择、任务参数等独立设置。

网络监听、公共访问地址、HTTPS 和访问防护在「麦麦设置 → 公共设置」中管理，写入 `host/config.toml`，重启宿主后生效。这个入口不要求 Bot 正在运行。

`bot_config.toml` 里的人格、聊天行为、权限、插件行为和终端输入开关仍由每个 Bot 独立管理。

## 接入适配器

适配器连接宿主同一个端口，用完整 Bot ID 指定目标：

::: fields
- **经典协议** — `ws://<宿主地址>:<宿主端口>/maim/<bot_id>/ws`，使用该 Bot 的 `maim_message.auth_token`。
- **新 API 协议** — `ws://<宿主地址>:<宿主端口>/maim/<bot_id>/api`，目标 Bot 还需开启 `enable_api_server`，使用 `api_server_allowed_api_keys`。
:::

连接始终归属路径里的 Bot。未知或未就绪的 Bot 会拒绝连接，不会改连其他 Bot。凭据列表为空时拒绝全部连接。Bot 不再监听独立 TCP 端口，旧的根路径 `/ws`、`/api` 和旧端口都不兼容，需要修改适配器地址。

## 生命周期

注册表为每个 Bot 记录期望状态 `desired_state`（running / stopped）。宿主启动时按期望状态逐个启动，前一个就绪或失败后再启动下一个，避免多个大数据量 Bot 同时迁移。

::: fields
- **starting** — 进程已启动，尚未就绪。
- **migrating** — Worker 正在执行数据迁移，附带进度。
- **running** — Worker 报告就绪，HTTP 可用。
- **stopping / stopped** — 正在停止 / 已按请求停止。
- **failed** — 启动失败或异常退出。
- **crash_loop** — 就绪后反复崩溃，已停止自动重启。
:::

就绪后异常退出会按指数退避自动重启（1 秒起，最长 5 分钟）；10 分钟内崩溃 5 次进入 `crash_loop`。就绪前失败（配置错误、迁移失败）直接标记 `failed`，不自动重试。

## 迁入旧实例

旧数据永不自动迁移，需要手动执行：

::: code-group

```bash [迁入旧实例 ~vscode-icons:file-type-shell~]
# 只登记路径，目录原地保留
maibot host adopt --directory <工作区> --from <旧实例目录> --mode register

# 同一文件系统内移动到 bots/<id>/，跨盘会被拒绝
maibot host adopt --directory <工作区> --from <旧实例目录> --mode move

# 撤销登记或撤回移动
maibot host adopt --directory <工作区> --undo <bot_id>
```

:::

`register` 零成本，宿主永不删除、移动或改写这类目录，只负责启动它。`move` 需要取得旧实例的实例锁，步骤记录在 `host/migrations/<bot_id>.json`，中断后重新执行同一命令即可续上；完成后旧位置留下 `MOVED_TO_WORKSPACE.txt`。两种模式都不做数据格式转换，格式迁移在 Bot 首次启动时照常执行。

## 终端输入

交互终端启动宿主时，只有一个 Bot 开启终端输入则自动选中；多个 Bot 开启时用 `/bots` 查看名称、ID 和状态，再用 `/use 名称或ID前缀` 选择目标。

目标 Bot 必须已就绪并开启 `debug.enable_console_input`。`/host-help` 查看宿主指令，`/help` 查看 Bot 指令，`exit()` 或 EOF 只关闭输入，Bot 继续运行，Ctrl+C 关闭宿主。

## 插件依赖

所有 Bot 共用一个 Python 环境。启动前宿主读取所有已初始化 Bot 的已启用插件依赖，运行中安装或启用插件时由 Worker 提交准备请求，宿主统一执行维护，Worker 不导入缺依赖的插件，也不直接修改环境。

声明与已安装版本不兼容时直接报告；有缺失包时把完整声明、主程序依赖和当前环境版本一起交给安装器做 dry-run 联合解析，通过后才停止 Bot、重读声明并安装，完成后按期望状态恢复。安装器固定已安装版本，不自动升级或降级共享库。

## 数据导入与导出

数据传输由宿主提供，目标 Bot 停止时仍可使用。任务记录、下载文件和临时目录按 Bot ID 隔离，切换 Bot 不会沿用前一个 Bot 的任务。

导入只覆盖所选分类中包内提供的文件，不删除目标实例的其他普通文件。导入前会把被覆盖的文件备份到目标 Bot 的 `temp/data-import/<事务 ID>/backup/`，失败按事务日志回滚。导出配置包含当前 Bot 使用的模型、供应商和联网服务定义，导入旧配置时合入公共模型目录。

## 验证与排错

**验证**：执行 `maibot host list --directory <工作区>` 能看到登记的 Bot；WebUI 侧栏底部的 Bot 切换列表里能选中并启动目标 Bot，聊天能收到回复。

- **新 Bot 建好但连不上平台** — 克隆出来的 Bot 带着源 Bot 的账号密钥，先改配置再启动，否则两边抢同一个账号连接。
- **适配器连不上** — 地址要带 Bot ID 与协议两段（`/maim/<bot_id>/ws` 或 `/maim/<bot_id>/api`）。宿主只在 Bot 就绪后转发：1008 表示路径里的 Bot ID 或协议名不合法，1013 表示该 Bot 不存在、未启动、尚未就绪或没开消息协议。
- **旧实例启动后数据不见了** — 用 `adopt --mode move` 移动过的目录会留下 `MOVED_TO_WORKSPACE.txt`，在原位置启动会被拒绝并提示新位置。
- **更新被阻止** — 有未提交的代码修改、分支分叉或同一 Python 环境里有其他运行中的工作区时，宿主会拒绝更新。
- **插件依赖缺失** — 在插件页检查并按提示统一安装，安装期间所有 Bot 会暂停，完成后按原运行状态恢复。
