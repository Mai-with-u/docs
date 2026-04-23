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
  "capabilities": ["send_message"],
  "i18n": {
    "default_locale": "zh-CN",
    "locales_path": "i18n",
    "supported_locales": ["zh-CN", "en-US"]
  }
}
```

## 必填字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `manifest_version` | `2` | Manifest 协议版本，当前固定为 `2` |
| `id` | string | 插件唯一标识符，格式为小写字母/数字，以点号或横线分隔（如 `com.author.plugin`） |
| `version` | string | 插件版本号，必须为严格三段式语义版本（如 `1.0.0`） |
| `name` | string | 插件展示名称 |
| `description` | string | 插件描述 |
| `author` | object | 插件作者信息，包含 `name`（作者名）和 `url`（作者主页，必须为 HTTP/HTTPS URL） |
| `license` | string | 插件许可证 |
| `urls` | object | 插件相关链接集合（见下文） |
| `host_application` | object | Host 兼容区间（见下文） |
| `sdk` | object | SDK 兼容区间（见下文） |
| `capabilities` | string[] | 插件声明的能力请求列表，不允许包含空值 |
| `i18n` | object | 国际化配置（见下文） |

## 可选字段

### urls 链接集合

| 字段 | 必填 | 说明 |
|------|------|------|
| `repository` | 是 | 插件仓库地址，必须为 HTTP/HTTPS URL |
| `homepage` | 否 | 插件主页地址 |
| `documentation` | 否 | 插件文档地址 |
| `issues` | 否 | 插件问题反馈地址 |

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

| 字段 | 必填 | 说明 |
|------|------|------|
| `default_locale` | 是 | 默认语言代码（如 `zh-CN`） |
| `locales_path` | 否 | 语言资源文件目录路径 |
| `supported_locales` | 否 | 支持的语言列表，不可包含空值和重复项。若非空，则 `default_locale` 必须存在于该列表中 |

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
