---
title: WebUI 页面
---

# WebUI 页面

从 1.3.2（WebUI 1.8.1）起，插件可以在自己的目录里放一个 `webui.json`，向 WebUI **声明**自定义页面——顶部工作区或侧边栏入口。页面由宿主统一渲染，你不需要安装 Node、打包前端或改动主程序；改完 `webui.json` 重载插件即可生效。

这套机制只描述「显示什么、绑定哪个 API」，页面只能调用**你自己的**插件 API，不能注入 HTML / JS / CSS，也不能请求任意地址。

## 最小可用示例

`webui.json` 放在插件目录下（与 `_manifest.json` 同级）。下面的例子声明一个顶部统计页和一个侧边设置页：

::: code-group

```json [webui.json ~vscode-icons:file-type-json~]
{
  "schema_version": 1,
  "workspace_title": "消息统计",
  "pages": [
    {
      "id": "overview",
      "title": "统计概览",
      "placement": "workspace",
      "icon": "chart",
      "queries": { "summary": { "api": "summary", "version": "1" } },
      "content": [
        { "type": "stat", "label": "今日消息", "value": { "source": "summary", "field": "count" } }
      ]
    },
    {
      "id": "settings",
      "title": "统计设置",
      "placement": "sidebar",
      "icon": "settings",
      "actions": {
        "save": {
          "api": "save_limit",
          "version": "1",
          "parameters": {
            "limit": { "type": "integer", "required": true, "minimum": 1, "maximum": 1000 }
          },
          "confirmation": "确认修改统计上限？"
        }
      },
      "content": [
        {
          "type": "card",
          "label": "统计范围",
          "children": [
            { "type": "input", "name": "limit", "label": "上限", "value": 100 },
            { "type": "button", "label": "保存", "action": "save" }
          ]
        }
      ]
    }
  ]
}
```

:::

页面绑定的 API 用 SDK 的 `@API` 装饰器静态注册，放在你的 `MaiBotPlugin` 子类里：

::: code-group

```python [plugin.py ~vscode-icons:file-type-python~]
from maibot_sdk import API, MaiBotPlugin


class MyPlugin(MaiBotPlugin):
    today_count = 0

    @API("summary", description="页面只读数据", version="1")
    async def summary(self):
        return {"count": self.today_count}

    @API("save_limit", description="保存统计上限", version="1")
    async def save_limit(self, limit: int):
        self.limit = limit
        return {"saved": True}
```

:::

## 页面放在哪里

- **`placement`** — `"sidebar"` 把页面放进麦麦工作区的「插件扩展」分组；`"workspace"` 放进插件自己的顶部工作区
- **`workspace_title`** — `workspace` 页面所在工作区的名称；同一插件可以有多个 `workspace` 页面，第一个是默认页，其余收进顶部的「更多」溢出菜单
- **`id` / `title` / `description`** — 页面标识、标题与说明。访问路径由宿主生成，形如 `/extensions/{plugin_id}/{page_id}`，插件不能自定义路由或覆盖内置入口
- **`icon`** — 只接受 `puzzle`、`chart`、`settings`、`database`、`list` 五个内置图标
- **入口排序** — 用户可以在「插件扩展」页（`/plugin-config`）最下方的「管理插件页面」区域调整入口顺序或隐藏整个插件的入口；该偏好只保存在当前浏览器，只影响展示，不是后端授权

::: tip 和「插件配置」是两条独立通道
`webui.json` 只负责自定义页面，**不是 manifest 字段**，页面声明本身不需要写进 `capabilities`，绑定的 API 不要求 `public=True`。上传领取等 SDK 接口仍需各自的 manifest 能力授权。插件的 `config.toml` 及其自动生成的配置表单仍由「插件配置」页负责，两者互不影响。
:::

官方示例插件 `hello_world_plugin` 内置了两页（顶部概览 `overview` 与侧边 `greeting`），可作为最小参考；完整声明见其 `webui.json`，页面路径形如 `/extensions/maibot-team.hello-world-plugin/overview`。

::: tip 本地调试
源码环境试用自定义页面时，先构建 `dashboard` 并在启动主程序前设置 `MAIBOT_WEBUI_USE_LOCAL_DASHBOARD=1`，让 WebUI 使用本地构建产物；前端开发服务固定使用 7999 端口，后端首次接入扩展路由需重启主程序。日常使用安装的 `maibot-dashboard` 不会随源码改动自动更新。
:::

## 数据与操作

每个页面用 `queries`（只读查询）和 `actions`（写操作）声明要调用的 API：

- API 名写**本插件 API 的短名**，`version` 省略时默认 `"1"`，必须与 `@API` 注册的版本精确匹配
- `queries` 在页面打开和刷新时**依次执行**；`actions` 成功后会自动重新执行查询刷新数据
- API 必须属于当前插件、处于启用状态；跨插件调用、动态 API、任意请求地址都不支持（`public=True` 不会自动对 WebUI 开放）
- 操作参数按 `parameters` 从当前表单字段取值，可选且留空的字段不会发送。参数类型为 `string` / `integer` / `number` / `boolean`，可声明 `required`、`max_length`（默认 4000，上限 65536）、`minimum`、`maximum`、`choices`，**不做隐式类型转换**，未声明的参数会被拒绝
- **危险操作必须写确认文案 `confirmation`**（`variant: "danger"` 的按钮也必须有），宿主会弹确认框。确认只是防误触，不是独立的授权或业务校验

::: tip queries 请保持只读
宿主无法判断 Python 方法是否有副作用，只能按声明区分。把有副作用的调用放进 `actions`，否则每次刷新页面都会重复触发写操作。
:::

## 组件

页面由 `content` 里的组件树组成。所有颜色、间距、字体、暗色模式与 dashboard 风格都由宿主控制，组件**不接受** `className`、`style` 或 HTML 插槽：

- **`stack`** — 纵向排列，属性 `label`、`children`
- **`grid`** — 网格排列，属性 `label`、`columns`（1–4 列，移动端自动单列）、`children`
- **`card`** — 宿主卡片容器，属性 `label`、`children`
- **`tabs`** — 标签页，每个子节点必须有 `label`
- **`text`** — 纯文本，属性 `label`、`value`；HTML 不会被执行
- **`stat`** — 统计卡片，属性 `label`、`value`
- **`table`** — 表格，属性 `label`、`value`、`columns`。`columns` 形如 `[{ "field": "name", "label": "名称" }]`，绑定对象数组，每页 50 行
- **`chart`** — 折线或柱状图，属性 `label`、`value`、`chart_type`（`line` / `bar`）、`x`、`y`。绑定对象数组，x 为字符串或数字，y 为数字，最多 2000 行
- **`input`** — 文本或数字输入，属性 `name`、`label`、`value`；数字默认值会渲染成数字输入框
- **`date`** — 日期输入，属性 `name`、`label`、`value`
- **`select`** — 下拉选择，属性 `name`、`label`、`value`、`options`。`options` 形如 `[{ "label": "一周", "value": "week" }]`，`value` 必须是非空字符串
- **`switch`** — 开关，属性 `name`、`label`、`value`；`value` 必须是布尔值
- **`button`** — 按钮，属性 `label`、`action`、`variant`（`primary` / `danger` / `muted`）

**`value` 可以是标量，也可以是数据引用** `{ "source": "查询别名", "field": "totals.count" }`：`source` 必须是本页 `queries` 里声明的别名，`field` 留空表示取查询的完整返回值。表格和图表必须使用数据引用，不支持计算表达式或脚本。

**渲染前的数据校验**（由前端做，不满足时整页显示 `invalidData` 错误而不是静默截断）：

- `table` 绑定对象数组，每页固定 50 行
- `chart` 绑定对象数组，最多 2000 行；`x` 必须是字符串或数字，`y` 必须是数字；`chart_type` 为 `line` / `bar`
- `switch` 的 `value` 必须是布尔值

## 上传与交互能力

使用上传或新版交互组件时，在 `webui.json` 顶层声明 `required_capabilities`。`file_upload` 表示支持文件上传，`interactive_controls` 表示支持新版交互；这是功能兼容检查，不是权限授权。名称不带版本后缀。旧声明可省略此字段；缺少所需能力时，升级宿主及其 dashboard，仅升级 Python SDK 不会增加前端组件。

上传领取需要 SDK 2.11.0+ 和本次支持上传的宿主（MaiBot 1.3.6 开发版）。SDK 2.11.0 尚未发布时，本地开发可用 `MAIBOT_PLUGIN_SDK_PATH` 指向 SDK 源码。插件在 `_manifest.json` 的 `capabilities` 中另外声明 `webui.claim_upload`，这是调用领取接口的权限，与页面兼容标识分开。

下面的页面将文件选择和身份选择放在同一弹窗，点击“开始上传”后才发送文件：

::: code-group

```json [webui.json ~vscode-icons:file-type-json~]
{
  "schema_version": 1,
  "required_capabilities": [
    "file_upload",
    "interactive_controls"
  ],
  "pages": [
    {
      "id": "images",
      "title": "图片库",
      "actions": {
        "add": {
          "api": "add_image",
          "parameters": {
            "upload_id": {
              "type": "string",
              "required": true
            },
            "identity": {
              "type": "string",
              "required": true,
              "choices": [
                "self",
                "other"
              ]
            }
          }
        }
      },
      "content": [
        {
          "type": "button",
          "label": "上传图片",
          "detail": "upload"
        },
        {
          "type": "dialog",
          "label": "上传图片",
          "children": [
            {
              "type": "select",
              "name": "identity",
              "label": "图片身份",
              "value": "self",
              "options": [
                {
                  "label": "是Bot",
                  "value": "self"
                },
                {
                  "label": "不是Bot",
                  "value": "other"
                }
              ],
              "presentation": "buttons"
            },
            {
              "type": "upload",
              "label": "选择图片",
              "action": "add",
              "manual_upload": true,
              "image_max_edge": 4000
            }
          ],
          "name": "upload"
        }
      ]
    }
  ]
}
```

```python [plugin.py ~vscode-icons:file-type-python~]
from maibot_sdk import API, MaiBotPlugin


class MyPlugin(MaiBotPlugin):
    @API("add_image", version="1")
    async def add_image(self, upload_id: str, identity: str):
        claimed = await self.ctx.webui.claim_upload(upload_id)
        # claimed["path"] 在本插件的数据目录内。
        # 在此校验身份、执行去重并保存标注；阻塞处理应交给工作线程。
        return {"received": True, "identity": identity}
```

:::

宿主使用已登录的 multipart 接口逐文件接收内容；普通 JSON/RPC 只传 `upload_id` 和标量参数，不携带文件内容。宿主暂存后发放所属插件的凭证，一小时过期、只能领取一次，不能跨插件领取。领取后由插件管理文件的保存或删除。上传 action 必须接收必填字符串 `upload_id`，不能声明 `confirmation`；身份等额外参数仍按普通参数校验。

接受 JPEG、PNG、静态 WebP，不接受动画或压缩包。宿主限制单文件20MiB、解码4000万像素。`image_max_edge: 4000` 让网页在上传前等比例缩小超大图片；超过20MiB的文件转JPEG压缩，透明区域补白，本地原文件保留。此边长是组件配置，宿主仍核验实际上传文件。

**`upload`** — 支持多文件、逐文件进度和错误，可取消上传和重试失败及未发送文件。重试沿用原批参数；关闭弹窗取消未完成请求，服务器已接收文件保留。`manual_upload: true` 提供拖入、预览、移除及手动开始，整批参数在开始时冻结；省略时选择文件立即上传。`submit_label` 可改为“开始识别”等文案。

**上传弹窗** — 复用普通 `button` 和顶层 `dialog`：按钮的 `detail` 引用弹窗的 `name`；弹窗内放 `select` 和 `upload`。按钮只能在 `action` 与 `detail` 中选择一个。

**`select.presentation`** — 默认 `dropdown` 显示下拉框；`buttons` 用选项按钮展示同一套 `name`、`value`、`options`。需要弹窗选择时，将 `select` 放进普通 `dialog`。

**`progress`** — `value` 为0至100的有限数值或数据引用，显示百分比及进度条。

**不可用操作** — 输入、按钮和上传组件可声明 `disabled_when`，条件格式与 `when` 相同，命中时禁用；按钮配合 `disabled_reason` 显示原因。使用禁用保留入口，`when` 仍用于控制是否展示。

**上传提示** — 插件返回标量字符串 `message` 作为逐文件提示；宿主不解读“重复图片”等插件业务字段。多选计数使用通用“项”。

**`button.value`** — 可绑定动态按钮文字；`label` 仍必填。

**`image` / `gallery`** — `image` 显示一张图片，不显示排列选择；`gallery` 显示图片列表。预览使用有界的 JPEG/PNG/WebP base64 data URL，不接受文件路径、远程图片URL或SVG。单图前端上限24000字符，整页仍受512KiB响应限制。

**`repeat` / `card`** — `repeat` 绑定数组，用 `name` 声明当前项；内部数据引用使用 `scope: "item"`。`card` 可设置 `compact: true`，用于紧凑的图片及操作卡片。

**`multi_select` / `checkbox`** — `multi_select` 绑定当前页图片行（每行有字符串 `id`），用 `selection` 声明多选组；`checkbox` 在重复卡片中引用同组并绑定图片ID。提供全选本页、取消本页和清空选择，跨页保留，最多1000项，离开页面后清空。action 的 `arguments` 可绑定 `{ "scope": "selection", "source": "batch", "field": "ids" }`，取得逗号分隔ID；插件需验证数量、格式和存在性。`clear_selection: "batch"` 在成功操作后清空，失败保留。删除全部须由插件提供全库操作，不能仅删除当前页。

**`dialog` / `collapsible` / `pagination`** — 分别提供详情弹窗、折叠技术信息和分页；分页 `name` 对应查询页码参数，`value` 绑定包含 `page`、`pages` 的对象。

action返回 `{"navigate_page":"images","navigate_params":{"job_id":"任务编号"}}` 可打开同一插件已声明的页面，适用于报告和错判列表；不接受任意URL或跨插件跳转。`navigate_params` 仅接受目标页面查询已声明的标量参数，保存在当前页面URL，不写插件全局设置；多个标签页各自保存选择。长任务应立即返回编号，在后台执行。页面设置 `poll_interval_seconds: 5` 后每5秒查询进度（允许3至60秒，默认0关闭），离开页面停止，操作时跳过；轮询成功不会清除操作失败提示，也不禁用操作按钮；开始操作会取消未完成的后台查询，避免旧结果覆盖新数据。

## 限制与生命周期

- 声明文件 `webui.json` 最大 128 KiB，Host 注册载荷最大 512 KiB；不接受越界路径或符号链接文件
- 每个插件最多 20 个页面；每页最多 200 个组件、8 层嵌套、10 个查询、20 个操作
- 每个绑定最多 30 个标量参数；每个插件最多两个进行中的 WebUI 请求，因此一页的 `queries` 会**顺序执行**，全部成功后才用新快照替换页面数据
- API 调用超时 10 秒，响应最大 512 KiB、12 层嵌套、20000 个元素。**超时不代表写操作没有生效**，需要幂等请在自己的 API 里实现
- 声明无效或引用了未注册的 API 时，该插件本次注册失败并在日志里说明原因；没有 `webui.json` 的插件不受影响
- 页面与入口随插件卸载或禁用同步下线；浏览器导航最多 30 秒更新，也可以手动刷新

## 验证与排错

**验证** — 把 `webui.json` 放进插件目录并重载插件，侧边栏「插件扩展」或顶部工作区出现入口；打开页面能看到数据，说明 API 绑定正确。

**看不到入口？**

- 确认插件已加载且启用，日志里没有该插件 WebUI 声明注册失败的记录
- `workspace` 页面在插件自己的顶部工作区里，别只在侧边栏找

**页面报错或数据为空？**

- 检查 `queries` / `actions` 里的 API 短名与 `version` 是否和 `@API` 注册的完全一致
- 检查 `value` 的数据引用 `source` 是否为本页声明的查询别名、`field` 路径是否存在于返回值里

**按钮点了没反应？**

- 检查 `action` 是否指向本页 `actions` 里的别名、参数是否满足 `parameters` 的类型与范围
- 危险操作必须声明 `confirmation`，否则声明注册会失败

**上传或新组件不支持？**

- 核对 `required_capabilities` 使用 `file_upload` / `interactive_controls`，并部署匹配的宿主与前端构建
- 上传领取确认 SDK 支持 `ctx.webui.claim_upload()`，manifest 已声明 `webui.claim_upload`；过期或已领取的凭证需重新上传
