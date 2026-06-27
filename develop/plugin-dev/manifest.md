---
title: Manifest
---

# Manifest 系统

每个 MaiBot 插件必须在其根目录下包含一个 `_manifest.json` 文件，用于声明插件的元信息、版本兼容性、依赖关系和能力需求。Host 侧的 `ManifestValidator` 会在加载前严格校验此文件。

::: tip _manifest.json 与 config.toml 的区别
- `_manifest.json`：插件**元信息**（ID、版本、依赖等），由 Host 校验和管理
- `config.toml`：插件**运行时配置**（功能开关、参数等），由插件自身读取

两者用途完全不同，不要混淆。
:::

## _manifest.json 结构

以下是一个完整的 Manifest 示例：

```json
{
  "$schema": "../_manifest.schema.json",
  "manifest_version": 2,
  "id": "com.example.my-plugin",
  "version": "1.0.0",
  "name": "我的插件",
  "description": "一个示例插件",
  "author": {
    "name": "开发者",
    "url": "https://github.com/developer"
  },
  "license": "MIT",
  "urls": {
    "repository": "https://github.com/developer/my-plugin",
    "homepage": "https://example.com",
    "documentation": "https://docs.example.com",
    "issues": "https://github.com/developer/my-plugin/issues"
  },
  "host_application": {
    "min_version": "1.0.0",
    "max_version": "1.99.99"
  },
  "sdk": {
    "min_version": "1.0.0",
    "max_version": "2.99.99"
  },
  "dependencies": [],
  "plugin_type": "tool",
  "display": {
    "icon": {
      "type": "lucide",
      "value": "wrench"
    }
  },
  "capabilities": ["send_message"],
  "i18n": {
    "default_locale": "zh-CN",
    "locales_path": "i18n",
    "supported_locales": ["zh-CN", "en-US"]
  }
}
```

## 使用 Manifest Schema

MaiBot 仓库在 `plugins/_manifest.schema.json` 提供了 `_manifest.json` 的 JSON Schema，用于编辑器自动补全、字段说明和格式检查。

插件位于 `plugins/<plugin-name>/_manifest.json` 时，在文件顶层加入：

```json
{
  "$schema": "../_manifest.schema.json",
  "manifest_version": 2
}
```

`../_manifest.schema.json` 会指向 MaiBot 内置的 `plugins/_manifest.schema.json`。支持 JSON Schema 的编辑器会自动读取它并提示字段、类型和格式错误；Host 运行时会忽略 `$schema` 字段，不影响插件加载。

## 必填字段

- **`manifest_version`** `2` — Manifest 协议版本，当前固定为 `2`
- **`id`** `string` — 插件唯一标识符，格式为小写字母/数字，以点号或横线分隔（如 `com.author.plugin`）
- **`version`** `string` — 插件版本号，必须为严格三段式语义版本（如 `1.0.0`）
- **`name`** `string` — 插件展示名称
- **`description`** `string` — 插件描述
- **`author`** `object` — 插件作者信息，包含 `name`（作者名）和 `url`（作者主页，必须为 HTTP/HTTPS URL）
- **`license`** `string` — 插件许可证
- **`urls`** `object` — 插件相关链接集合（见下文）
- **`host_application`** `object` — Host 兼容区间（见下文）
- **`sdk`** `object` — SDK 兼容区间（见下文）
- **`capabilities`** `string[]` — 插件声明的能力请求列表，不允许包含空值
- **`i18n`** `object` — 国际化配置（见下文）

## 可选字段

### plugin_type 插件类型

`plugin_type` 用于声明插件的主要角色，供 WebUI 展示、筛选和默认图标选择使用。该字段为可选字段，不需要升级 `manifest_version`；缺省时按 `extension` 处理。

可选值：

- `adapter` — 消息平台或协议适配器
- `tool` — 工具、命令或模型可调用能力
- `provider` — LLM、TTS、API 等服务提供方
- `management` — 管理、权限、群管或后台类插件
- `data` — 统计、记忆、知识库、导入导出等数据类插件
- `media` — 图片、语音、视频、表情等媒体处理
- `game` — 游戏或娱乐互动
- `integration` — 外部平台、搜索、Webhook 等集成
- `extension` — 通用扩展
- `other` — 其他

### display 展示元信息

`display.icon` 用于声明插件图标。该字段只影响 WebUI 展示，不参与插件运行时行为。

```json
{
  "display": {
    "icon": {
      "type": "local",
      "value": "assets/icon.png",
      "fallback": "package",
      "background": "#1f2937"
    }
  }
}
```

- `type`: `lucide`、`emoji` 或 `local`
- `value`: 图标值。`lucide` 使用图标名，`emoji` 使用单个表情或短文本，`local` 使用插件目录内相对路径
- `fallback`: 可选，图标加载失败时使用的 lucide 图标名
- `background`: 可选，图标背景色，格式为 `#RRGGBB`

不允许使用在线 URL 作为插件图标。本地图标仅支持 `.png`、`.jpg`、`.jpeg`、`.webp`、`.svg`，路径必须位于插件目录内，不能使用绝对路径、`..` 或符号链接。

### urls 链接集合

- **`repository`** · 必填 — 插件仓库地址，必须为 HTTP/HTTPS URL
- **`homepage`** · 可选 — 插件主页地址
- **`documentation`** · 可选 — 插件文档地址
- **`issues`** · 可选 — 插件问题反馈地址

### host_application / sdk 版本区间

两者结构相同，为闭区间声明：

```json
{
  "min_version": "1.0.0",
  "max_version": "1.99.99"
}
```

- `min_version`：允许的最低版本（闭区间）
- `max_version`：允许的最高版本（闭区间）
- 两者均必须为严格三段式语义版本号（`X.Y.Z`）
- `min_version` 不能大于 `max_version`

Host 在握手阶段会校验当前版本是否落在声明区间内。若不兼容，插件将被阻止加载。

### i18n 国际化配置

- **`default_locale`** · 必填 — 默认语言代码（如 `zh-CN`）
- **`locales_path`** · 可选 — 语言资源文件目录路径
- **`supported_locales`** · 可选 — 支持的语言列表，不可包含空值和重复项。若非空，则 `default_locale` 必须存在于该列表中

### llm_providers LLM Provider 声明

声明插件提供的 LLM Provider 能力，供其他插件通过 `ctx.llm` 代理调用。

- **`client_type`** · 必填 — Provider 唯一标识符，必须与 `@LLMProvider` 装饰器中声明的值完全一致
- **`name`** · 必填 — Provider 展示名称
- **`description`** · 可选 — Provider 功能描述
- **`version`** · 可选 · 默认 `"1.0.0"` — Provider 版本号

::: warning 双重声明要求
`llm_providers` 字段与 `@LLMProvider` 装饰器必须同时声明，且 `client_type` 必须完全匹配。若仅在一处声明，另一处缺失或不一致，插件将被阻止加载。
:::

::: danger 冲突加载策略
若两个插件声明了相同的 `client_type`，则**两个插件均被禁止加载**。请在设计 Provider 时使用唯一的前缀（如 `com.example.my-provider`）避免冲突。
:::

```json
{
  "llm_providers": [
    {
      "client_type": "my_custom_llm",
      "name": "My Custom LLM",
      "description": "A custom LLM provider",
      "version": "1.0.0"
    }
  ]
}
```

## 依赖声明

`dependencies` 数组支持两种类型的依赖，通过 `type` 字段区分：

### 插件级依赖

```json
{
  "type": "plugin",
  "id": "com.example.other-plugin",
  "version_spec": ">=1.0.0,<2.0.0"
}
```

- `id`：依赖插件的 ID，遵循与插件 ID 相同的格式规则
- `version_spec`：版本约束表达式，使用 PEP 440 风格（如 `>=1.0.0`、`~=1.0`）
- 不允许循环依赖或依赖自身
- 不允许重复声明同一个插件依赖

### Python 包依赖

```json
{
  "type": "python_package",
  "name": "httpx",
  "version_spec": ">=0.24.0"
}
```

- `name`：Python 包名，仅允许字母、数字、点号、下划线和横线
- `version_spec`：版本约束表达式

### 依赖解析流程

`PluginDependencyPipeline` 在 Host 侧统一执行依赖分析：

1. **扫描**：收集所有插件的 `_manifest.json`
2. **检测 Host 冲突**：若插件的 Python 包依赖与主程序的依赖约束无交集，则阻止加载
3. **检测插件间冲突**：若多个插件对同一 Python 包的版本约束互斥，则全部阻止加载
4. **自动安装**：对可加载插件缺失的 Python 依赖，优先使用 `uv pip install`，回退到 `pip install`
5. **拓扑排序**：根据跨 Supervisor 依赖关系决定 Runner 启动顺序，循环依赖将被拒绝

## 校验规则

Manifest 校验器（`ManifestValidator`）采用 Pydantic 严格模式，主要校验规则包括：

- **禁止多余字段**：不允许出现 `_manifest.json` 未声明的字段
- **ID 格式**：必须匹配 `^[a-z0-9]+(?:[.-][a-z0-9]+)+$`（如 `com.example.my-plugin`）
- **版本号格式**：必须为 `X.Y.Z` 三段式
- **URL 格式**：必须以 `http://` 或 `https://` 开头
- **不允许自依赖**：`dependencies` 中不能依赖自身
- **不允许重复依赖**：同一插件/包名只能声明一次
