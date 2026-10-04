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
`webui.json` 只负责自定义页面，**不是 manifest 字段**，也不需要写进 `capabilities`，绑定的 API 不要求 `public=True`。插件的 `config.toml` 及其自动生成的配置表单仍由「插件配置」页负责，两者互不影响。
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
- 操作参数按 `parameters` 从当前表单字段取值，可选且留空的字段不会发送。参数类型为 `string` / `integer` / `number` / `boolean`，可声明 `required`、`max_length`（最多 4000）、`minimum`、`maximum`、`choices`，**不做隐式类型转换**，未声明的参数会被拒绝
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
