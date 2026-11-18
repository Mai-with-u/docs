---
title: 人物身份合并与数据迁移
---

# 人物身份合并与数据迁移

把同一平台下一个用户 ID 的人物数据并入另一个 ID，用于 QQ 号、OpenID 这类已确认属于同一个人的身份切换。迁移完成后让适配器改用新 ID，后续消息才会落到目标身份。

## 什么时候用

同一个人换了标识时用它：QQ 号换成 OpenID、更换主用账号、废弃号并入常用号。

- 只支持同一平台内合并，QQ 号不能并进别的平台的身份。
- 来源身份必须先有人物资料，只有旧聊天记录不能启动迁移。
- 目标身份还没建档也能迁入，迁移会顺带建出目标的人物资料。
- 迁移不判断两个 ID 是否属于同一个人，这件事由你确认后再动手。

迁移只处理影响后续对话的部分，旧聊天记录仍归属原 ID。

## 迁移范围

会迁移的内容：

::: fields
- **人物资料** — 称呼、人工设置、记忆要点和群名片；同名字段冲突逐项确认。
- **画像** — 每个人最新一版画像及其刷新任务，历史画像版本保留原样。
- **事实与证据** — 有效的人物事实、证据和未过期的事实段落；原事实与证据保留，供历史画像和变更记录引用。
- **冲突事实** — 矛盾事实双方都保留，并标记为冲突。
- **当前长期记忆** — 只改归属，不重写记忆正文，也不重新计算向量。
- **身份别名** — 来源 ID 登记为目标别名，仅对后续消息生效。
:::

不迁移的内容：

- 历史消息、工具调用、旧私聊会话、统计。
- 表达、黑话、情景历史、删除记录与维护任务。
- 实例配置、插件配置、权限名单；名单里写死的用户 ID 需要照着新身份手工改。

第三方插件的数据只有明确登记了迁移扩展才参与处理，见下文[让插件数据一起迁移](#让插件数据一起迁移)。

## 预览迁移计划

下文以 `maibot` 开头，源码部署用对应的 CLI 入口跑同一套子命令和参数。`--directory` 指向单个 Bot 实例目录，不是包含多个 Bot 的工作区目录。

::: code-group

```powershell [预览 ~vscode-icons:file-type-powershell~]
maibot person-migrate --directory C:/Bots/mai preview --platform qq --source 123456789 --target 987654321 --output C:/Temp/person-plan.json
```

:::

命令写出两份文件：

::: fields
- **`person-plan.json`** — 完整计划，执行时传给 `execute`，不要手工编辑。
- **`person-plan.review.json`** — 各库各表的变更数量和逐字段冲突，供你核对。
:::

预览是只读的，此时不写任何数据库。来源、目标 ID 填 QQ 号或 OpenID 都可以。

## 确认冲突

两边的同名字段值不一样时，预览把它们列进 `review.json` 的 `conflicts`。为每个冲突创建一个 `decisions.json`，以冲突的 `id` 为键，取值为 `source` 或 `target`：

::: code-group

```json [decisions.json ~vscode-icons:file-type-json~]
{
  "从 review 复制的冲突 ID": "source",
  "另一个冲突 ID": "target"
}
```

:::

键名照抄 `review.json` 里的 `id`，不要自己拼。带选择重新预览，直到输出「全部确认: True」：

::: code-group

```powershell [带选择预览 ~vscode-icons:file-type-powershell~]
maibot person-migrate --directory C:/Bots/mai preview --platform qq --source 123456789 --target 987654321 --decisions C:/Temp/decisions.json --output C:/Temp/person-plan.json
```

:::

没有冲突时预览直接就是「全部确认: True」，可以跳到下一步。

改完决定要重新预览，不要改完整计划。配置、身份别名或冲突内容在预览后发生变化，执行时会要求重新确认。

## 执行迁移

迁移在线进行，不停止也不重启 Bot。`execute` 在参与数据库的写事务内重新生成计划，把预览后新增的数据一并纳入；写入异常回滚当前事务，身份别名与主库数据一同提交。

::: code-group

```powershell [执行 ~vscode-icons:file-type-powershell~]
maibot person-migrate --directory C:/Bots/mai execute --plan C:/Temp/person-plan.json
```

:::

成功时输出执行记录目录 `data/person-migrations/20261118-143022-xxxx/`。同一份计划重复执行会被拒绝。

## 让适配器改用新 ID

迁移只搬数据，不会改适配器用哪个 ID 收发。这一步不做，后续消息仍会落到旧 ID 上：

- **OneBot** — 在 `bot_config.toml` 里把 `[bot].qq_account` 改成新号，见[本地客户端](../adapters/qq-local-client.md)。
- **QQ 官方适配器** — 打开 `[qq_official].enable_mapping`，已关联的用户才用 QQ 号参与后续消息，见[官方机器人](../adapters/qq-official.md)。开启前确认目标别名和来源资料都已迁完，否则同一个人会显示成两个用户。

长期记忆会检查当前实例配置的 `a_memorix.storage.data_dir`，以及默认目录和旧版数据目录。即使记忆功能没开，只要数据库存在就会被迁移。以下两种情况会明确报错，需要先处理再迁移：

- 记忆库位于实例目录之外。
- 还有涉及来源身份、尚未完成的记忆写入任务。

## 恢复中断的任务

进程意外退出后，用执行记录目录核对任务提交状态：

::: code-group

```powershell [恢复 ~vscode-icons:file-type-powershell~]
maibot person-migrate --directory C:/Bots/mai recover --job C:/Bots/mai/data/person-migrations/20261118-143022-xxxx
```

:::

`recover` 按每个参与库的提交标记更新任务记录，不会用旧数据覆盖在线数据。SQLite 的多个 WAL 数据库在断电时不保证跨库原子性，提交状态不一致时会明确报错，需要按任务记录修复。

## 让插件数据一起迁移

插件自带 SQLite 库时，可以登记一个迁移扩展，让它的数据进入同一份预览、冲突确认、过期检查、事务和任务记录。扩展是运行在迁移调用进程里的模块，不需要做成 SDK 插件。

::: code-group

```python [my_module.py ~vscode-icons:file-type-python~]
from pathlib import Path
from typing import Any, Dict


def build(plan, context: Dict[str, Any]) -> None:
    """按平台把来源用户 ID 换成目标 ID，写回迁移计划。"""
    def transform(row: Dict[str, Any]) -> Dict[str, Any]:
        if row["platform"] == context["platform"]:
            row["user_id"] = context["user_map"].get(row["user_id"], row["user_id"])
        return row

    plan.transform("my_user_records", transform)


def create_extension(root: Path):
    """返回迁移扩展：名称、扩展库路径、计划生成函数。"""
    return MigrationExtension("my-plugin", root / "data/plugins/my-plugin/records.db", build)
```

:::

`DatabasePlan` 和 `MigrationExtension` 由迁移进程在调用时注入，扩展模块不需要也不要 import 主程序内部模块——插件代码只能用 SDK，这一点和普通插件一致。上面两个名字只是运行时对象，签名由迁移进程校验。

预览时用 `--extension my_module:create_extension` 加载，可以重复指定多个扩展。

::: fields
- **扩展工厂** — 接收实例目录，返回 `MigrationExtension`：名称、扩展库路径、计划生成函数。
- **库的位置** — 必须位于实例目录内，且不能和其他扩展重复登记。
- **冲突与合并** — 计数或唯一键的合并语义用 `plan.transform(..., merge=...)` 显式实现，不要直接写数据库。
:::

## 验证与排错

**验证**：执行后到 WebUI 的人物信息页确认来源 ID 已并入目标；让麦麦在任意聊天里回答一个依赖目标人物资料的问题，事实与画像应能取到迁移后的内容。

- **提示「来源身份没有人物资料」** — 来源 ID 只有聊天记录，没有建档；先在人物信息里确认来源的 person 记录，再重试。
- **提示冲突未确认** — `decisions.json` 缺少冲突，或键名与 `review.json` 的 `id` 不一致；补齐后重新预览，执行阶段不能补。
- **提示计划被修改或已过期** — 直接编辑了 `person-plan.json`，或预览后数据、配置、别名有变动；重新生成预览。
- **提示同一计划重复执行** — 该计划已经提交过；换新预览再执行，不要复用旧文件。
- **提示记忆库在实例外** — 先停止 MaiBot，把整个旧记忆目录**复制**到实例目录内，再修改 `a_memorix.storage.data_dir` 指向新位置。直接改路径会从空库重新开始，旧记忆留在原处不会自动搬过去，见 [A_Memorix 配置](../configuration/amemorix-config#存储)。
- **提示还有未完成的记忆写入** — 等记忆队列处理完再迁移，迁移期间暂停写入会造成漏迁。
- **迁移后旧消息作者变了** — 历史消息不迁移，旧会话和消息仍归属原 ID，这是预期结果。
