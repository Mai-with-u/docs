---
title: 手动构建桌宠安装包
---

# 手动构建桌宠安装包

用 `.github/workflows/publish-pet-clients.yml` 手动触发一次构建，得到 Windows x64 安装程序和已签名的 Android APK，并自动挂到当前的正式 Release 上。这个工作流独立于主程序发布流程，仅支持手动启动。

## 配置签名 secrets

在仓库 **Settings → Secrets and variables → Actions** 配置 Android 签名 secrets：

::: fields
- **`MAIBOT_ANDROID_KEYSTORE_BASE64`** — 已有正式签名 keystore 文件的 Base64 内容。
- **`MAIBOT_ANDROID_STORE_PASSWORD`** — keystore 密码。
- **`MAIBOT_ANDROID_KEY_ALIAS`** — 签名密钥别名。
- **`MAIBOT_ANDROID_KEY_PASSWORD`** — 密钥密码；与 keystore 密码相同可不配置。
:::

必须使用已有 Android 发布包的签名密钥，保证用户能够覆盖升级。不要把签名文件或密码提交进仓库。前三个 secret 缺失时构建直接报错并指出缺哪一项。

## 启动构建

把工作流合并到默认分支，进入 **Actions → Build Pet Clients (Manual) → Run workflow**，选择默认分支运行。

运行开始时查询 GitHub 最新正式 Release（排除草稿和预发布），锁定它的 tag 和源码提交。构建源码来自目标 Release，所以未进入该 tag 的本地或分支修改不会包含在安装包里；客户端版本号沿用该 tag 中各客户端自己的版本配置。

两个 Windows runner 分别构建 Windows x64 安装程序与签名 Android APK，互不等待；Android 同时执行 lint 和 APK 签名验证。工作流另有一个 `verify_android_only` 输入，只构建并校验 Android APK、不挂到 Release。

## 构建产物

构建结束后自动把安装包及各自的 `.sha256` 文件挂到锁定的 Release。期间即使发布了更新的 Release，也不会改变本次上传目标。

一个平台失败不会取消另一个平台，成功平台的包仍会上传；失败原因在 Actions 日志里查看。构建产物也作为 Actions artifacts 保留 30 天。

同名同内容附件会跳过，同名不同内容则明确报错，避免覆盖已发布安装包。需要发布变更时，提升对应客户端版本并使其进入目标 Release。

这个工作流不创建 Release、不修改发布说明，也不会触发或阻塞原有主程序发布工作流。

## 同步到 CNB

独立工作流 `.github/workflows/cnb-releases.yml`（**Sync Releases to CNB**）在桌宠构建或主程序发布工作流结束后运行，也支持 GitHub Release 发布 / 编辑事件和手动运行。桌宠只有一个平台成功时，已挂到 GitHub Release 的附件同样进入同步。

同步复用现有 `CNB_TOKEN`、`CNB_GROUP` 和可选的 `CNB_MAIBOT_REPO` 配置。`CNB_TOKEN` 除原有代码镜像权限外，还需目标仓库的 `repo-release:rw` 权限。工作流必须合并到默认分支才能接收 `workflow_run` 事件。

同步先复用代码镜像脚本准备分支、标签及 LFS，再扫描 GitHub 所有非草稿 Release，创建或更新 CNB 对应版本的标题、说明、预发布状态和 latest 标记，并补齐全部 Release 附件，包括桌宠 EXE、APK 和校验文件。扫描所有版本可避免并发发布时漏掉先前构建锁定的旧版本。GitHub Release 是唯一数据来源，不读取触发构建的 artifacts，始终执行默认分支上的同步代码。

附件按 SHA256 校验，同内容跳过，同名不同内容报错；不会删除 CNB 上已有版本或附件。上传使用 CNB 官方 OpenAPI 的预签名地址，完成后确认并校验，附件永久保存。

<Linkcard url="https://api.cnb.cool/" title="CNB OpenAPI" description="CNB 官方接口文档，Release 附件上传走这里的预签名地址" />

同步失败会在独立工作流和 `cnb-release-sync-status` artifact 中报告，不影响 GitHub 发布和桌宠构建结果。修复权限或网络问题后，手动运行 **Sync Releases to CNB** 补齐，不需要重新构建安装包。该流程与代码镜像共用并发锁，避免标签同步和 Release 创建互相竞争。

## 验证与排错

**验证**：手动运行一次 **Build Pet Clients (Manual)**，resolve 任务先锁定 tag，两个平台任务跑完后到目标 Release 的附件列表查看，应出现安装程序、APK 及各自的 `.sha256` 文件。

- **Android 步骤报缺少 secret** — 前三个 Android secret 必须齐全，`MAIBOT_ANDROID_KEY_PASSWORD` 才可以留空（与 keystore 密码相同时）。
- **安装包里没有最新提交** — 构建源码取自锁定的正式 Release tag，未进入该 tag 的修改不会参与构建；先把改动合并进目标 Release。
- **附件上传报「同名不同内容」** — 同名附件已存在且内容不同，工作流拒绝覆盖；提升客户端版本号后重新发布。
- **只有一个平台有包** — 平台之间互不取消，失败的那个平台到对应 job 日志里看原因，另一个平台的包不受影响。
- **CNB 上没有新版本或附件** — 确认 `CNB_TOKEN` 具备 `repo-release:rw`、`CNB_GROUP` 已设置、工作流已合并到默认分支；然后手动运行 **Sync Releases to CNB**。
- **CNB 同步失败但 GitHub 正常** — 两者互不影响，失败详情在同步工作流和 `cnb-release-sync-status` artifact 里，修好权限后重跑同步即可。
