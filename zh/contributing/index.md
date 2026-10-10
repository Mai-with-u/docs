---
title: 参与文档站
---

# 参与文档站

**这个站是 VitePress 站点，中文是权威内容源，英文是镜像。** 改文档只要动 Markdown，不用碰主题；但有几条硬规则必须遵守，否则 CI 的构建检查会直接失败。

## 仓库结构

- **`zh/`** — 中文文档（权威）。改内容先改这里。
- **`en/`** — 英文镜像，目录结构与 `zh/` 一一对应。
- **`.vitepress/`** — 站点配置：`config.mts`（导航与插件）、`sidebar/`（侧边栏）、`theme/`（主题与组件）、`markdown/`（自定义 Markdown 插件）。
- **`public/`** — 静态资源：`images/`、`title_img/`、`avatars/`。

内容分区：

- **`manual/`** — 用户手册：部署、适配器、配置、插件安装、WebUI。
- **`develop/`** — 接入文档：适配器、插件接入、程序化对接（WebUI API）、数据统计；模型与 MCP 的配置说明归 `manual/configuration/`。
- **`plugin/`** — 插件开发文档（权威统一入口）。
- **`contributing/`** — 本页所在的文档站协作规范。
- **`faq/` `changelog/` `about/`** — 常见问题、更新日志、项目元信息。

## 本地预览与构建

::: code-group

```bash [pnpm ~vscode-icons:file-type-pnpm~]
pnpm install
pnpm docs:dev      # 本地预览，改文件即时刷新
```

```bash [构建 ~vscode-icons:file-type-shell~]
pnpm docs:build    # 构建整站，同时生成 llms.txt
```

:::

提交前**必须**跑一次 `pnpm docs:build`：它不只是打包，还会校验死链、容器语法和代码片段导入路径。

## 硬规则

::: steps
1. **中文先行，英文同步** — 改了 `zh/` 的内容页，同一个 PR 里要同步 `en/` 镜像。术语、代码、文件名保持一致，散文可以重写。

2. **新页面必须注册导航** — 同时改 `.vitepress/sidebar/zh.ts` 与 `.vitepress/sidebar/en.ts`（英文侧链接带 `/en/` 前缀），需要时再改 `config.mts` 的顶部导航。

3. **图片放 `public/images/`**，正文用 `/images/xxx.png` 引用；头像与标题图放 `public/avatars/`、`public/title_img/`。

4. **写法三禁** — 内容页不用 Markdown 表格（改用定义列表）、独立外链不用裸链接（改用 `<Linkcard>`）、独立代码块不裸写（包进 `::: code-group` 并显式给图标）。细则见[文档编写特性](./markdown-features)。
:::

## 写作规范

- 表达层怎么写（先结论、步骤可照做、排错收尾）→ [文档风格指南](./style-guide)
- 语法层怎么写（代码组、图标、Mermaid、自定义容器、组件）→ [文档编写特性](./markdown-features)

## 验证与排错

**验收动作** — `pnpm docs:build` 无报错，且你新增的页面能从侧边栏点进去。

- **构建报"死链"** — 链接路径写错，或页面被移动后没更新引用；注意英文页要用 `/en/` 前缀。
- **构建报容器未闭合** — `:::` 数量不配对；自定义容器支持嵌套，但每一层都要有自己的收尾。
- **构建报代码片段路径不存在** — `<<< @/...` 里的路径是**相对站点根目录**的，不是相对当前文件。
- **页面渲染了但侧边栏没有** — 新页面没注册到侧边栏，或注册到了错误的路径分组下。
- **中英不对称被review打回** — `zh/` 与 `en/` 的页面、侧边栏条目、代码块结构必须一一对应。
