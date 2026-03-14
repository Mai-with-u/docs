# ☸ Kubernetes 部署

我们开发了麦麦的 Helm Chart，来帮助你将麦麦优雅地部署到 Kubernetes 中。

本文档默认你熟悉 Kubernetes 和 Helm，因此不会详细说明每一部分的作用。

此 Helm Chart 使用 [MaiBot-Napcat-Adapter](https://github.com/Mai-with-u/MaiBot-Napcat-Adapter) 作为唯一适配器。

## 📋 环境要求

- ✅ 已部署 Kubernetes（可以是单节点集群）
- ⚙️ 已安装 Helm v3.8.0 及以上版本
- 💾 Kubernetes 集群中部署有可用的 Storage Class
- 🌎 （非必须）有一个解析到集群入口的域名，且集群中部署有可用的 Ingress Class

## 🛠️ 部署步骤

### 🔍 一、查看 Helm Chart 信息

麦麦的 Helm Chart 发布在`oci://reg.mikumikumi.xyz/maibot/maibot`。

部署麦麦之前请先确认你要部署的版本。

你可以在 MaiBot 代码仓库的 [helm-chart 分支](https://github.com/Mai-with-u/MaiBot/tree/helm-chart/helm-chart) 中查看所有可用的 Helm Chart 版本以及对应的麦麦版本。

本文档后续以`<CHART_VERSION>`等字样作为 Helm Chart 版本的占位符，请将其替换为你需要安装的实际版本。若省略`--version`标志，则默认安装最新的正式版本。

如果你想查看 Chart 的信息：
```shell
helm show chart oci://reg.mikumikumi.xyz/maibot/maibot --version <CHART_VERSION>
```

### 📝 二、获取并修改 Chart 的 values 文件

将 Chart 的 values 文件输出到 `maibot.yaml` 中：
```shell
helm show values oci://reg.mikumikumi.xyz/maibot/maibot --version <CHART_VERSION> > maibot.yaml
```

编辑 `maibot.yaml` 文件，按需配置选项。

#### Values项说明

`values.yaml`分为几个大部分。

1. `EULA` & `PRIVACY`: 用户必须同意这里的协议才能成功部署麦麦。

2. `pre_processor`: 部署之前的预处理Job的配置。

3. `adapter`: 麦麦的Adapter的部署配置。

4. `core`: 麦麦本体的部署配置。

5. `statistics_dashboard`: 麦麦的运行统计看板部署配置。

   麦麦每隔一段时间会自动输出html格式的运行统计报告，此统计报告可以部署为看板。

   出于隐私考虑，默认禁用。

6. `napcat`: Napcat的部署配置。

   考虑到复用外部Napcat实例的情况，Napcat部署已被解耦。用户可选是否要部署Napcat。

   默认会捆绑部署Napcat。

7. `sqlite_web`: sqlite-web的部署配置。

   通过sqlite-web可以在网页上操作麦麦的数据库，方便调试。不部署对麦麦的运行无影响。

   此服务如果暴露在公网会十分危险，默认不会部署。

8. `config`: 这里填写麦麦各部分组件的运行配置。

   这里填写的配置仅会在初次部署时或用户指定时覆盖实际配置文件，且需要严格遵守yaml文件的缩进格式。

   **如果你觉得填写这里的配置过于麻烦，可以不用填写这一部分，在部署成功后通过WebUI在图形界面中配置。**

   - `override_*_config`: 指定本次部署/升级是否用以下配置覆盖实际配置文件。默认不覆盖。

   - `adapter_config`: 对应adapter的`config.toml`。详见 [Adapter 文档](https://docs.mai-mai.org/manual/adapters/napcat.html)。

   - `core_model_config`: 对应core的`model_config.toml`。详见[模型配置指南](https://docs.mai-mai.org/manual/configuration/configuration_model_standard)。

   - `core_bot_config`: 对应core的`bot_config.toml`。详见[配置指南](https://docs.mai-mai.org/manual/configuration/configuration_standard)。

::: tip
编辑完毕后，请妥善保存此 values 文件。
:::

### 🏠️ 三、创建 Kubernetes 命名空间

在 Kubernetes 中为麦麦创建一个命名空间，例如 `bot`：
```shell
kubectl create ns bot
```

### 📥 四、部署麦麦实例

根据刚才编辑好的 `maibot.yaml`，将麦麦部署到 `bot` 命名空间中。为此安装实例取一个名字，例如 `maimai`。

```shell
helm install maimai oci://reg.mikumikumi.xyz/maibot/maibot --namespace bot --version <CHART_VERSION> --values maibot.yaml
```

首次部署时，为了适配 k8s 架构，预处理任务会覆写一些关键配置。这需要一些时间，因此部署进程可能比较慢，且部分Pod可能会无法启动，等待一分钟左右即可。

::: tip
预处理任务是通过 Helm Chart 的 Post-Install Hook 实现的，仅会在每次 `helm install/upgrade/rollback` 时触发。
:::

::: tip
你可以在集群内部署多个麦麦的安装实例，只要这些实例的名字不同即可。
:::

### ⚡ 五、配置 napcat 连接麦麦

打开 napcat 的控制台。

- 如果捆绑部署了 napcat，且配置了 Ingress，那么可以在浏览器中打开类似 `https://napcat.example.com/` 的网址（values 中配置的域名），抵达控制台。

- 如果捆绑部署了 napcat，但未配置 Ingress，那么需要查看 napcat 的 Service，通过端口转发（默认为6099）或 NodePort 访问控制台的端口。

- 如果未捆绑部署，决定使用外部 napcat 实例，请打开外部 napcat 的控制台。

进入控制台后，登录麦麦使用的 QQ，随后立即修改控制台密码。

连接麦麦的步骤：

1. 进入`网络配置`，新建`Websocket客户端`。

2. 启用配置，为此连接起一个名字，例如`MaiMai`。

3. 填写麦麦的 adapter 的 Websocket 地址。

   - 如果捆绑部署了 napcat，此处应当填写的 URL 为：
     ```text
     ws://<RELEASE_NAME>-maibot-adapter:<ADAPTER_SVC_PORT>/
     
     # RELEASE_NAME 为麦麦的安装实例名，如 maimai
     # ADAPTER_SVC_PORT 为 adapter 的服务端口，默认为8095
     
     # 一个示例：
     ws://maimai-maibot-adapter:8095/
     ```

     ::: tip
     k8s 的集群内 DNS 名称规则：[Service 与 Pod 的 DNS](https://kubernetes.io/zh-cn/docs/concepts/services-networking/dns-pod-service/)。
     :::
     
   - 如果未捆绑部署 napcat，决定使用外部 napcat 实例，此处应当填写 adapter 的 Websocket 服务的 URL。

     你可以根据 adapter 的 Service 的 ClusterIP + Port 来填写，也可以根据节点的 IP + NodePort 来填写，也可以自行实现端口穿透来填写。

4. 心跳间隔与 values 中的 `config.adapter_config.napcat_server.heartbeat_interval`保持一致（默认一致，不需要修改）。

5. 为了提升安全性，可以为 adapter 与 Napcat 之间的连接设置 Token。Token 需要与 values 中的 `config.adapter_config.napcat_server.token`保持一致。默认不启用 Token。

6. 点击保存，观察 adapter 和 core 的日志，查看是否成功连接。

### 🎉 六、测试麦麦

现在可以发消息给麦麦，测试是否可用。

## ⏫ 升级麦麦

Helm Chart 的开发通常会滞后主版本一段时间。当麦麦有了新的 Release，对应的 Helm Chart 可能晚几天才会发布，在这期间请耐心等待。

当新版本的 Helm Chart 可用后，请按此步骤更新麦麦的安装实例。

1. 如果你不通过 Helm Chart 管理配置，则首先需要备份你的实际配置文件。
   ```shell
   kubectl cp -n bot maimai-maibot-adapter-0:/adapters/config.toml adapter_config.toml
   kubectl cp -n bot maimai-maibot-core-0:/MaiMBot/config/bot_config.toml core_bot_config.toml
   kubectl cp -n bot maimai-maibot-core-0:/MaiMBot/config/model_config.toml core_model_config.toml
   ```

2. 备份麦麦的各个组件的存储卷。

   这不是必须的，但是是推荐做法，用于在升级出现问题时回滚。根据你的存储底层的不同实现，会有不同的备份方法。

   在备份之前，需要首先关闭`core`和`adapter`组件：
   ```shell
   kubectl scale -n bot statefulset maimai-maibot-adapter --replicas 0
   kubectl scale -n bot statefulset maimai-maibot-core --replicas 0
   # 等待Pod完全终止再进行备份
   ```

3. 重命名旧版的 values 文件：
   ```shell
   mv maibot.yaml maibot-old.yaml
   ```

4. 获取新版的 values 文件：
   ```shell
   helm show values oci://reg.mikumikumi.xyz/maibot/maibot --version <NEW_VERSION> > maibot.yaml
   ```

5. 需要特别说明的是，配置文件无法自动升级到新版本，因此必须手动处理配置文件升级。

   参照旧版本的 values 文件（如果你不通过 Helm Chart 管理配置，那么还需要参照刚才备份出来的的实际配置文件），按需填写新版本的 values 文件。

   通常 values 文件主体不会有大变动，而 config 部分会有较多变动，需要特别关注。

   **如果你觉得填写`config`部分太麻烦，也可以不填写，而是在升级完毕后通过 WebUI 在图形界面上从零开始配置。但是这样的工作量可能会比较大。**

6. 升级麦麦实例：
   ```shell
   helm upgrade maimai oci://reg.mikumikumi.xyz/maibot/maibot \
       --namespace bot \
       --version <NEW_VERSION> \
       --values maibot.yaml \
       --set config.override_adapter_config=true \
       --set config.override_core_bot_config=true \
       --set config.override_core_model_config=true
   ```
   
   注意需要使用`--set config.override_*_config=true`选项，指定使用新版配置文件强制覆盖原来的旧版配置文件，否则新版组件无法识别旧版配置。

## ✏️ 修改麦麦配置

麦麦的配置文件存储于存储卷内。具体来说：

- `adapter`的配置文件存储于`<RELEASE_NAME>-maibot-adapter-config`PVC 绑定的存储卷内，对应容器内的`/adapters/`路径。
- `core`的配置文件存储于`<RELEASE_NAME>-maibot-core-config`PVC 绑定的存储卷内，对应容器内的`/MaiMBot/config/`路径。

通常来说，修改麦麦的配置文件有三种方式：

1. 通过 WebUI 配置（推荐）。
2. 进入容器或存储卷，直接修改配置文件。
3. 完全不使用上述两种方案，只通过 Helm Chart 的`config`项来管理配置文件（这需要配置`config.override_*_config`恒为`true`）。
   然后通过`helm upgrade`命令来更新实例，同时更新配置文件：
   ```shell
   helm upgrade maimai oci://reg.mikumikumi.xyz/maibot/maibot --namespace bot --version <CURRENT_VERSION> --values maibot.yaml
   ```

## ↩ 回滚麦麦

如果希望回退到以前部署过的版本，可以使用`helm rollback`命令回滚部署配置：
```shell
helm history maimai --namespace bot  # 查看麦麦的所有部署版本历史
helm rollback maimai --namespace bot  # 回到麦麦的上一个版本
helm rollback maimai <HISTORY_INDEX> --namespace bot  # 回到麦麦的指定版本
```

**注意，这种方法回滚的只是麦麦的 k8s 部署配置（如镜像版本），各个组件的配置文件和实际数据无法直接回滚（需要手动恢复之前的备份），请谨慎操作。**

## 🗑 卸载麦麦

使用以下命令可以移除麦麦的安装实例：
```shell
helm uninstall maimai -n bot
```

卸载后，部署麦麦所需的 values 将无法找回，建议保存好 values 文件。

卸载后，麦麦的存储卷数据是否会被删除取决于存储类配置，可能需要集群管理员手动处理。

## ❓ 其他注意事项

### 📥 操作前备份麦麦数据

不同版本的麦麦进行升级/降级操作，可能会导致麦麦的数据发生异常。

回滚麦麦的部署配置，也可能导致麦麦的数据异常。

在进行这些操作之前，推荐提前备份麦麦的存储卷数据。

### ⚡ 旧版配置迁移

`0.11.6-beta`之前的版本将配置存储于 k8s 的 ConfigMap 资源中。随着版本迭代，麦麦对配置文件的操作复杂性增加，k8s 的适配复杂度也同步增加，且 WebUI 可以直接修改配置文件，因此自`0.11.6-beta`版本开始，各组件的配置不再存储于 k8s 的 ConfigMap 中，而是直接存储于存储卷的实际文件中。

从旧版本升级的用户，旧的 ConfigMap 的配置会由预处理任务自动迁移到新的存储卷的配置文件中。

### 🔄 部署时自动重置的配置

adapter 的配置中的`napcat_server`和`maibot_server`的`host`和`port`字段，会在每次部署/更新 Helm 安装实例时被自动重置。
core 的配置中的`webui`和`maim_message`的部分字段也会在每次部署/更新 Helm 安装实例时被自动重置。

自动重置的原因：

- core 的 Service 的 DNS 名称是动态的（由安装实例名拼接），无法在 adapter 的配置文件中提前确定。
- 为了使 adapter 监听所有地址以及保持 Helm Chart 中配置的端口号，需要在 adapter 的配置文件中覆盖这些配置。
- core 的 WebUI 启停需要由 Helm Chart 控制，以便正常创建 Service 和 Ingress 资源。
- core 的 maim_message 的 api server 现在可以作为 k8s 服务暴露出来。监听的 IP 和端口需要由 Helm Chart 控制，以便 Service 正确映射。

首次部署时，预处理任务会负责重置这些配置。这会需要一些时间，因此部署进程可能比较慢，且部分Pod可能会无法启动，等待一分钟左右即可。

### 🗙 跨节点PVC挂载问题

麦麦的一些组件会挂载同一 PVC，这主要是为了同步数据或修改配置。

如果 k8s 集群有多个节点，且共享相同 PVC 的 Pod 未调度到同一节点，那么就需要此 PVC 访问模式具备`ReadWriteMany`访问模式。

不是所有存储控制器都支持`ReadWriteMany`访问模式。

如果你的存储控制器无法支持`ReadWriteMany`访问模式，你可以通过`nodeSelector`配置将彼此之间共享相同 PVC 的 Pod 调度到同一节点来避免问题。

会共享 PVC 的组件列表：
- `core`和`adapter`：共享`adapter-config`，用于为`core`的 WebUI 提供修改 adapter 的配置文件的能力。
- `core`和`statistics-dashboard`：共享`statistics-dashboard`，用于同步统计数据的 html 文件。
- `core`和`sqlite-web`：共享`maibot-core`，用于为`sqlite-web`提供操作 MaiBot 数据库的能力。
- 部署时的预处理任务`preprocessor`和`adapter`、`core`：共享`adapter-config`和`core-config`，用于初始化`core`和`adapter`的配置文件。
