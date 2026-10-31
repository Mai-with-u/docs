---
title: 桌宠
---

# 桌宠

桌宠把麦麦放到你的 Windows 桌面上：它会动、会说话，也能和你聊天、记待办。桌宠内置在主程序里，不需要另外安装插件。

**前提**：Windows 10 及以上，并已安装 WebView2 Runtime（Win11 自带）。桌宠使用独立子进程渲染界面，不会拖慢聊天和网页。

## 开启与关闭

在 WebUI 的主程序配置里找到「桌宠」，打开「启用桌宠」；或者直接改配置文件：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[desktop_pet]
enabled = true               # 启用后立即出现窗口
chat_tools_enabled = false   # 允许主人聊天查询其他聊天流并传话
skin_id = "builtin"          # 当前皮肤；builtin 是内置麦麦
```

:::

保存后热重载，关闭开关窗口立即退出；主程序退出时窗口也会被回收，不会残留。

## 和麦麦聊天

桌宠和网页聊天室用的是同一条内部聊天：平台固定为 `internal`，用户固定为 `owner`，所以两边看到的是同一段对话、同一个昵称。在网页输入框旁改昵称，桌宠下次说话就用新昵称。

聊天框支持粘贴剪贴板图片，可以预览、移除，也能只发图片。每次最多 4 张，每张不超过 8 MiB、2500 万像素；Enter 发送，Shift+Enter 换行，发送失败会保留草稿并提示原因。

**聊天流工具** — 打开 `chat_tools_enabled` 后，这条主人聊天里的麦麦可以查询你所有真实聊天流，并向指定聊天传话、唤醒那边的麦麦。它只作用于桌宠和网页共用的会话，普通群聊不会获得这两个工具，发图片也不受这个开关影响。

## 待办

麦麦可以自己维护一份待办：查看、新增、修改、删除。待办直接保存在桌宠窗口进程里，改完立刻刷新桌面列表。完成一项按原设计删除，不保留完成列表，每条最多 200 字。

待办文件与旧版桌宠插件共用 `data/plugins/sengokucola.desktop-pet/todos.json`，已有待办不用迁移。

## 皮肤

「桌宠 → 当前皮肤」可以选皮肤、试播预览、导入 ZIP 包，保存配置后热切换。预览不会打断正在播放的动作；切换会先校验并解码全部资源，失败时保留原形象并报错。

皮肤包是纯静态资源：JSON 描述加 PNG/WebP 图片，不执行任何脚本。ZIP 可以直接放 `skin.json`，也可以套一层目录；每个包最多 32 MiB、512 个文件，单张图最多 1600 万像素，单段动画最多 240 帧、30 秒。

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
    "idle": { "file": "idle.png", "frames": 1, "fps": 1, "motion": "bob" }
  },
  "states": { "idle": "idle", "thinking": "idle", "talking": "idle", "dragging": "idle" },
  "events": { "greeting": "idle" }
}
```

:::

- **`canvas`** — 画布宽 64~220、高 64~240 CSS 像素；`anchor` 是落脚点，需落在底部 4 像素内
- **`animations`** — 精灵图填 `file`、`frame_width`、`frame_height`、`frames`、`fps`；也可以用 `sequence` 逐帧写 `{"file": "atlas.png", "rect": [0,0,256,256], "duration_ms": 125}`
- **`motion`** — 主程序提供的有限位移/缩放效果：`none`、`bob`、`sway`、`hop`、`shake`、`pulse`
- **`states`** — 四种持续状态必须全部显式映射，允许复用同一个动画
- **`events`** — 可选 `click`、`happy`、`error`、`greeting`

插件也可以自带静态皮肤：把 `skin.json` 放进 `plugins/<插件目录>/skins/<目录>/`，是否运行插件代码与皮肤选择互不影响。插件不能自动切换你的皮肤。

## 插件扩展

插件可以在桌宠的拼图图标「插件扩展」菜单里加按钮，每个插件最多 10 个。按钮只接受 ID、文字、内置图标和顺序，不能注入 HTML 或脚本；点击时 Host 会先校验按钮归属、可见和禁用状态。

桌宠还会向插件广播事件：窗口就绪、退出、被点击、开始与结束拖动、可见性变化、皮肤切换。这些 Hook 只做观察，不能拦截或修改桌宠操作。接口细节见[插件 API 参考](/plugin/api-reference)。

## 验证与排错

**验证** — 打开开关后桌面出现麦麦窗口，点击它会有反应；在网页聊天室发一句话，桌宠会同步显示麦麦的回复。

**窗口没出现** — 确认系统是 Windows 且装了 WebView2 Runtime；看日志里桌宠子进程的报错。非 Windows 平台会明确报告不支持。

**窗口在但不动** — 关闭其他占用同名皮肤资源的程序后重启主程序；导入的皮肤若校验失败，会保留原形象并在界面提示原因。

**待办不刷新** — 待办来自窗口进程里的同一份数据，确认桌宠处于运行且就绪状态；窗口未就绪时工具会直接返回错误。

**插件按钮不出现** — 插件需声明对应的 `desktop_pet.*` 能力并在清单里授权；停用或卸载插件后按钮会随注册表清理，窗口重启时重新同步。
