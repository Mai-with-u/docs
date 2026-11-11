---
title: 桌宠
---

# 桌宠

桌宠把麦麦放到你的桌面上：一个会走路、会说话、会记待办的窗口，聊天走的是和网页聊天室同一个主人会话。它内置在主程序里，不需要单独安装插件。

## 开启与运行模式

在 WebUI「麦麦设置 → 桌宠」打开「启用桌宠」（`desktop_pet.enabled`，默认关闭）。运行模式两项：

::: fields
- **`local`** — 本机窗口，由主程序启动并回收。仅 Windows。
- **`remote`** — 等待独立客户端连接，服务器可以是 Linux。
:::

「远端」只表示由独立客户端连接，不要求宿主在另一台电脑；连接本机时也填本机宿主地址，例如 `http://127.0.0.1:8001`，端口以实际部署为准。模式显式选择，断线不会自动切换。

配置支持热重载。每个 Bot 同时接入一个桌宠。

## 连接到独立客户端

用对应系统的分发包时不需要安装 Python、Node.js、Rust 或完整 MaiBot。Windows 需要 WebView2 Runtime（安装器在缺少时在线安装），macOS 使用系统 WKWebView，Linux 使用 WebKitGTK 4.1。

::: steps

1. 在目标 Bot 的 WebUI「桌宠」启用桌宠，把运行模式设为「远端连接」。服务器不需要图形桌面。
2. 在客户端填写宿主 WebUI 地址，点「通过 WebUI 连接」，在打开的页面完成首次登录；有多个机器人时再按名称选择目标。
3. 公网部署使用 HTTPS/WSS。反向代理需要支持 WebSocket Upgrade 并允许长连接；客户端自带心跳和自动重连。

:::

桌宠没有独立密码框，也不把密码写入本地配置。宿主登录会话有效期 8 小时，有效期内再次连接可复用；过期或撤销后重新显示 WebUI 登录页。宿主需要提供 `/api/host/desktop-pet/session`，该页面复用宿主会话校验，未经认证返回 401。

如果 Nginx 等反向代理启用了 HTTP Basic Auth，原生 WebView 可能另行要求代理账号密码，且不保证永久免输。托盘菜单提供「打开 WebUI 登录」与「更换连接 / 屏幕授权」。

## 皮肤包

在「桌宠 → 当前皮肤」选择皮肤、试播预览、导入 ZIP；保存配置后热切换。`desktop_pet.skin_id` 默认 `builtin`。预览不会打断桌宠；切换先校验并解码所有资源，失败时保留原形象并报告错误。

皮肤从三个位置发现：程序自带的 `src/desktop_pet/presets/<目录>/skin.json`、实例的 `data/desktop_pet/skins/<目录>/skin.json`、插件的 `plugins/<插件目录>/skins/<目录>/skin.json`。来源之间 ID 重复会明确报错，导入不覆盖已有皮肤。

包内只有 JSON 和静态 PNG/WebP，不执行脚本。ZIP 可以直接包含 `skin.json`，也可以套一层目录。每包最多 32 MiB、512 个文件，单张图最多 1600 万像素，单动画最多 240 帧、30 秒。

::: code-group

```json [skin.json ~vscode-icons:file-type-json~]
{
  "schema_version": 1,
  "id": "author.pet",
  "name": "我的桌宠",
  "version": "1.0.0",
  "canvas": {
    "width": 160, "height": 160,
    "anchor": [80, 160], "bubble_anchor": [80, 0],
    "hitbox": [10, 10, 140, 150]
  },
  "animations": {
    "idle": {"file": "idle.png", "frames": 1, "fps": 1, "motion": "bob"}
  },
  "states": {"idle": "idle", "thinking": "idle", "talking": "idle", "dragging": "idle"},
  "events": {"greeting": "idle"}
}
```

:::

::: fields
- **画布** — 宽度 64～220、高度 64～240（CSS 像素）；落脚锚点在底部 4 像素内，切换时保持屏幕落脚点不动。
- **`hitbox`** — 画布内 `[x, y, width, height]`。
- **`bubble_anchor`** — 控制气泡垂直位置，气泡水平居中。
- **精灵图** — 填 `file`、`frame_width`、`frame_height`、`frames`、`fps`，从左到右、从上到下取帧。
- **图片帧** — 改用 `sequence` 数组，每帧 `{"file":"atlas.png","rect":[0,0,256,256],"duration_ms":125}`；省略 `rect` 用整张图。
- **`motion`** — `none`、`bob`、`sway`、`hop`、`shake`、`pulse`。
- **状态映射** — `idle`、`thinking`、`talking`、`dragging` 四种必须全部显式映射，可复用动画；可选事件 `click`、`happy`、`error`、`greeting`。
:::

## 图文聊天

在聊天框粘贴剪贴板图片，可以预览、移除，并和文字一次发送；也支持纯图片。每次最多 4 张，每张不超过 8 MiB、2500 万像素。Enter 发送，Shift+Enter 换行，发送失败保留草稿并显示原因。

## 待办

在「桌宠」开启后即可使用待办。事项分两类：

::: fields
- **`bot`** — Bot 自身待办，到期向主人真实聊天流投递内部任务并唤醒。
- **`user`** — 用户提醒，到期显示桌宠窗口及提醒消息。
:::

::: fields
- **`due_at`** — ISO 8601 绝对日期时间，建议带时区；不带时区按服务器本地时间。
- **`delay_seconds`** — 从保存时起多少秒后触发，与 `due_at` 不能同时填写。
- **省略时间** — 保持原计划；`due_at: null` 取消定时。
- **内容** — 最多 200 字。
:::

待办面板可以新增、编辑内容、类型和时间，支持绝对时间或多少分钟以后。默认定位到底部并展示最后 5 条，长内容最多两行，悬停或键盘聚焦时自动往返滚动。修改过的事项下方显示橙色细线，悬停可看修改时间；时间以界面本地时区显示。

到期事项保留在列表，显示待触发、触发中、已触发或失败；勾选后归档到已完成列表，不再定时或条件触发。「已触发」只表示提醒已显示或任务已入队，不代表执行完成。失败详情保留，重新设置未来时间即可重试。

Bot 待办需要先建立主人聊天流——在桌宠或网页聊一句即可。计时由主程序每秒检查，隐藏桌宠不停止计时。本机模式下关闭桌宠、退出主程序或休眠期间不能准时提醒，恢复运行后补触发；远端模式下客户端离线时 Bot 定时待办继续执行，用户提醒留到客户端连接后显示。

备忘支持图片附件：在待办输入区按 Ctrl+V 粘贴剪贴板图片，每项最多 4 张、每张最多 8 MiB。仅粘贴图片也可以保存为「图片备忘」。附件保存在待办数据目录的 `todo_images/`，待办 JSON 只记录图片标识。

## 条件待办

「应用打开」是独立的程序检测模式：填写 `code`、`Code.exe`、`记事本` 这类进程名或窗口标题关键字。忽略大小写、全半角与末尾 `.exe`，做包含匹配，不做语义猜测。桌宠运行时每 5 秒检查，已运行的应用也算成立。不会执行你填写的字符串，不需要开启截图。

自然语言条件由 Bot 判断，例如「当桌面出现 VS Code 时」。主人内部私聊每轮构建模型请求时重新读取完整待办快照，保留真实 ID、版本、条件、时间和状态，桌宠关闭时也能看到已保存内容。

条件满足后由 Bot 调用 `trigger`，携带真实 ID、当前 `revision` 和具体 `evidence`。存储层原子领取，已触发或版本过期的事项会拒绝重复触发。条件修改后重新等待触发，不是循环提醒。

## 定期主动思考

开启「定期主动思考」（`desktop_pet.proactive_wake_enabled`，默认关闭）后，每过一个间隔向已存在的主人聊天流投递一次内部思考事件，复用正常 Planner、人格、上下文和可用工具。

::: fields
- **`proactive_wake_interval_minutes`** — 间隔分钟数，默认 `30`，范围 1～1440。
- **前置条件** — 先在桌宠或网页聊一句，建立主人会话。
- **计时** — 本机模式在桌宠就绪后开始计时，退出桌宠时取消；远端模式由服务器计时，客户端离线不取消。
:::

提示词可在提示词管理中编辑「桌宠定期主动思考」（`desktop_pet_proactive_wake`）。一次投递失败会记录完整日志和桌宠错误状态，下一周期再尝试。

## 查看桌面与持续阅读

在「桌宠」开启「允许读取桌面」（`screen_read_enabled`，默认关闭）。本机模式读取 Windows 主屏；独立客户端读取客户端电脑的主屏，并遵守客户端授权与系统权限。桌面读取不控制鼠标键盘。

截图会发给当前聊天模型，可能包含屏幕上可见的私人信息；模型需要支持图片理解。

::: fields
- **单次查看** — 主人聊天可调用 `desktop_pet_screen`，得到当前截图、捕获时间和尺寸。普通群聊无法使用。
- **`screen_sample_interval_seconds`** — 采样与比较画面的频率，默认 `2`，范围 0.5～30。
- **`screen_read_interval_seconds`** — 投递变化时间线的间隔，默认 `10`，范围 2～3600。
- **`screen_change_threshold`** — 明显变化的像素比例阈值，默认 `0.015`（1.5%）。
:::

差异检测在 320×180 缩略图上比较亮度，忽略低于 20/255 的单像素变化。每次最多拼接 6 帧，按从左到右、从上到下排列，标注序号及 UTC 捕获时间，每格 960×572 像素。小面积文字变化也可能被过滤，可以降低阈值提高敏感度。

截图或投递失败会停止持续阅读并显示原因，修复后手动重新开始。关闭读取权限、关闭桌宠或主程序退出会停止，重启后不会自动恢复。

## 显示桌宠手中事

开启「显示桌宠手中事」（`desktop_pet.show_current_task`，默认关闭）后，主人内部聊天的阶段变化会调用 `fast_model` 生成简短摘要，显示在桌宠底部。

这个开关只在 `fast_model` 已单独分配有效模型时可用，不借用其他模型。摘要限时 2 秒，不等待主推理、不重试；阶段切换时恢复占位并取消旧请求，超时或空摘要保留占位。

## 插件能做什么

插件通过 SDK 控制桌宠，需要在 manifest 声明对应能力：

::: code-group

```json [_manifest.json ~vscode-icons:file-type-json~]
{
  "capabilities": [
    "desktop_pet.status", "desktop_pet.show", "desktop_pet.hide",
    "desktop_pet.say", "desktop_pet.set_thinking"
  ]
}
```

```python [plugin.py ~vscode-icons:file-type-python~]
state = await self.ctx.desktop_pet.status()
if state["ready"]:
    await self.ctx.desktop_pet.show()
    await self.ctx.desktop_pet.set_thinking(True)
    try:
        await self.ctx.desktop_pet.say("待办已经整理好了")
    finally:
        await self.ctx.desktop_pet.set_thinking(False)
```

:::

::: fields
- **`status()`** — 返回 `enabled`、`supported`、`running`、`ready`、`visible`、`error`。
- **`show()` / `hide()`** — 显示或隐藏已启动的窗口；隐藏不退出进程。
- **`say(text)`** — 显示 1～2000 字符纯文本气泡，不加入聊天记录、学习或记忆。
- **`set_thinking(active)`** — 开启或结束思考动画；聊天回复也会控制动画。
:::

所有控制接口返回当前状态，窗口回执成功后才返回；未就绪、窗口执行失败、通信超时会抛错。`status()` 在关闭或不支持的平台上也可调用。启动中的窗口可能 `running=True` 而 `ready=False`，插件应跳过本次提示或稍后查询。

插件不能注入 JavaScript、HTML 或原生窗口代码。`show()` 不会绕过启用开关，隐藏状态下的 `say()` 也不会擅自显示窗口。

插件按钮统一出现在桌宠的拼图图标「插件扩展」菜单中，每个插件最多 10 个按钮。

## 验证与排错

**验证**：启用桌宠并在本机模式重启 Bot，桌宠窗口出现；在网页聊天里说一句话，桌宠会显示回复。切换到「远端连接」后，客户端填写宿主地址并登录，能看到同一个桌宠。

- **桌宠窗口没出现** — 确认 `desktop_pet.enabled` 已打开；本机模式只支持 Windows，其他系统用远端客户端。
- **远端客户端连不上** — 检查运行模式是否设成「远端连接」、地址端口是否可达、反向代理是否支持 WebSocket Upgrade 且允许长连接。
- **登录页反复弹出** — 宿主会话有效期 8 小时，过期或宿主认证状态变化会失效；重新登录即可。
- **待办到点没提醒** — 本机模式在桌宠关闭或电脑休眠期间不会准时触发，恢复后补触发；Bot 待办需要先建立主人聊天流。
- **皮肤切换失败** — 切换会先校验并解码全部资源，失败时保留原形象；检查 `skin.json` 是否缺四种状态映射，或来源之间是否 ID 重复。
- **持续阅读自动停止** — 截图或投递失败会停止并显示原因，修复后手动重新开始；关闭读取权限或重启不会自动恢复。
