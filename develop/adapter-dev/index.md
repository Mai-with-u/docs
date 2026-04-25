---
title: 适配器开发指南
---

# 适配器开发指南

MaiBot 的适配器（Adapter）是指连接外部消息平台（如 QQ、Discord、Telegram 等）与 MaiBot 核心的桥接组件。本文档介绍 Platform IO 架构以及如何开发新的平台适配器。

## 架构概览

MaiBot 的平台 IO 层（`src/platform_io/`）采用**驱动抽象 + 路由表 + Broker 管理器**的三层架构：

```
外部平台消息 ──→ [驱动 Driver] ──→ [Broker Manager] ──→ 核心处理链
                    │                    │
                    │  InboundMessage    │  路由查找 + 去重
                    │  Envelope          │
                    │                    │
核心处理链 ──→ [Broker Manager] ──→ [驱动 Driver] ──→ 外部平台
                    │
                    │  RouteKey 解析
                    │  多驱动广播
```

核心组件：

- **PlatformIODriver**：驱动抽象基类，定义收发消息的契约
- **PlatformIOManager**：Broker 管理器，统一协调路由、去重与状态跟踪
- **RouteTable**：路由绑定表，维护 RouteKey 到驱动的映射
- **DriverRegistry**：驱动注册表，管理已注册的驱动实例

## maim-message 集成

MaiBot 使用 [maim-message](https://github.com/Mai-with-u/maim-message) 作为统一消息格式标准。`MessageServer` 是 maim-message 提供的消息中间件，负责在平台适配器与 MaiBot 之间传递消息。

### 消息段（Seg）

maim-message 中的核心消息类型是 `Seg`（消息段），每条消息由一个或多个 `Seg` 组成：

```python
from maim_message import Seg

# 文本消息段
text_seg = Seg(type="text", data="你好")

# 图片消息段
image_seg = Seg(type="image", data={"file": "xxx.jpg"})
```

### Legacy 驱动

MaiBot 内置了 `LegacyPlatformDriver`，它封装了与 maim-message MessageServer 的通信逻辑，作为默认的平台驱动。当你通过 `bot_config.toml` 配置了 QQ 等平台连接信息后，Host 会自动创建并注册 Legacy 驱动。

## 如何创建新适配器

### 1. 继承 PlatformIODriver

新的适配器需要继承 `src/platform_io/drivers/base.py` 中的 `PlatformIODriver` 抽象基类：

```python
from src.platform_io.drivers.base import PlatformIODriver
from src.platform_io.types import DeliveryReceipt, DeliveryStatus, DriverDescriptor, DriverKind, RouteKey

class MyPlatformDriver(PlatformIODriver):
    async def send_message(self, message, route_key, metadata=None):
        # 实现消息发送逻辑
        ...
        return DeliveryReceipt(
            internal_message_id=message.message_id,
            route_key=route_key,
            status=DeliveryStatus.SENT,
            driver_id=self.driver_id,
            driver_kind=self.descriptor.kind,
        )
```

### 2. 实现 start/stop 生命周期

```python
async def start(self) -> None:
    # 初始化连接、启动监听等
    await self._connect()

async def stop(self) -> None:
    # 断开连接、清理资源
    await self._disconnect()
```

### 3. 上报入站消息

当适配器收到外部平台的入站消息时，通过 `emit_inbound` 方法上报给 Broker：

```python
from src.platform_io.types import InboundMessageEnvelope, DriverKind

envelope = InboundMessageEnvelope(
    route_key=RouteKey(platform="my_platform", account_id="bot_001"),
    driver_id=self.driver_id,
    driver_kind=DriverKind.PLUGIN,
    external_message_id="msg_12345",
    session_message=session_msg,  # 已规范化的 SessionMessage
)

accepted = await self.emit_inbound(envelope)
```

### 4. 注册驱动

通过 `PlatformIOManager` 注册驱动并绑定路由：

```python
from src.platform_io.manager import get_platform_io_manager
from src.platform_io.types import DriverDescriptor, DriverKind, RouteBinding

manager = get_platform_io_manager()

# 创建驱动描述
descriptor = DriverDescriptor(
    driver_id="plugin.my_adapter.qq",
    kind=DriverKind.PLUGIN,
    platform="qq",
    account_id="123456",
    plugin_id="my_adapter",
)

# 创建驱动实例并注册
driver = MyPlatformDriver(descriptor)
await manager.add_driver(driver)

# 绑定路由
manager.bind_send_route(RouteBinding(
    route_key=descriptor.route_key,
    driver_id=driver.driver_id,
    driver_kind=DriverKind.PLUGIN,
))
manager.bind_receive_route(RouteBinding(
    route_key=descriptor.route_key,
    driver_id=driver.driver_id,
    driver_kind=DriverKind.PLUGIN,
))
```

## 插件消息网关驱动

对于插件开发者，MaiBot 提供了 `PluginPlatformDriver`（定义在 `src/platform_io/drivers/plugin_driver.py`），它通过 IPC 调用插件 Runner 中的消息网关组件来实现收发能力，无需直接操作底层驱动 API。

详见 [PlatformIO 驱动](./platform-io.md) 页面。
