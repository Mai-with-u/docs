---
title: Adapter Development Guide
---

# Adapter Development Guide

MaiBot's adapter refers to the bridge component that connects external message platforms (like QQ, Discord, Telegram, etc.) with MaiBot core. This document introduces the Platform IO architecture and how to develop new platform adapters.

## Architecture Overview

MaiBot's platform IO layer (`src/platform_io/`) uses a **driver abstraction + routing table + broker manager** three-layer architecture:

```
External Platform Messages ──→ [Driver Driver] ──→ [Broker Manager] ──→ Core Processing Chain
                     │                    │
                     │  InboundMessage    │  Routing Lookup + Deduplication
                     │  Envelope          │
                     │                    │
Core Processing Chain ──→ [Broker Manager] ──→ [Driver Driver] ──→ External Platform
                     │
                     │  RouteKey Parsing
                     │  Multi-driver Broadcasting
```

Core Components:

- **PlatformIODriver**: Driver abstract base class, defines message sending/receiving contracts
- **PlatformIOManager**: Broker manager, uniformly coordinates routing, deduplication and state tracking
- **RouteTable**: Route binding table, maintains RouteKey to driver mapping
- **DriverRegistry**: Driver registry, manages registered driver instances

## maim-message Integration

MaiBot uses [maim-message](https://github.com/Mai-with-u/maim-message) as the unified message format standard. `MessageServer` is the message middleware provided by maim-message, responsible for passing messages between platform adapters and MaiBot.

### Message Segment (Seg)

The core message type in maim-message is `Seg` (message segment), each message consists of one or more `Seg`:

```python
from maim_message import Seg

# Text message segment
text_seg = Seg(type="text", data="Hello")

# Image message segment
image_seg = Seg(type="image", data={"file": "xxx.jpg"})
```

### Legacy Driver

MaiBot has built-in `LegacyPlatformDriver`, which encapsulates communication logic with maim-message MessageServer, serving as the default platform driver. When you configure platform connection information like QQ in `bot_config.toml`, Host will automatically create and register Legacy driver.

## How to Create New Adapter

### 1. Inherit PlatformIODriver

New adapters need to inherit `PlatformIODriver` abstract base class in `src/platform_io/drivers/base.py`:

```python
from src.platform_io.drivers.base import PlatformIODriver
from src.platform_io.types import DeliveryReceipt, DeliveryStatus, DriverDescriptor, DriverKind, RouteKey

class MyPlatformDriver(PlatformIODriver):
    async def send_message(self, message, route_key, metadata=None):
        # Implement message sending logic
        ...
        return DeliveryReceipt(
            internal_message_id=message.message_id,
            route_key=route_key,
            status=DeliveryStatus.SENT,
            driver_id=self.driver_id,
            driver_kind=self.descriptor.kind,
        )
```

### 2. Implement start/stop Lifecycle

```python
async def start(self) -> None:
    # Initialize connection, start listening, etc.
    await self._connect()

async def stop(self) -> None:
    # Disconnect, cleanup resources
    await self._disconnect()
```

### 3. Report Inbound Messages

When adapter receives external platform inbound messages, report to Broker through `emit_inbound` method:

```python
from src.platform_io.types import InboundMessageEnvelope, DriverKind

envelope = InboundMessageEnvelope(
    route_key=RouteKey(platform="my_platform", account_id="bot_001"),
    driver_id=self.driver_id,
    driver_kind=DriverKind.PLUGIN,
    external_message_id="msg_12345",
    session_message=session_msg,  # Normalized SessionMessage
)

accepted = await self.emit_inbound(envelope)
```

### 4. Register Driver

Register driver and bind routes through `PlatformIOManager`:

```python
from src.platform_io.manager import get_platform_io_manager
from src.platform_io.types import DriverDescriptor, DriverKind, RouteBinding

manager = get_platform_io_manager()

# Create driver description
descriptor = DriverDescriptor(
    driver_id="plugin.my_adapter.qq",
    kind=DriverKind.PLUGIN,
    platform="qq",
    account_id="123456",
    plugin_id="my_adapter",
)

# Create driver instance and register
driver = MyPlatformDriver(descriptor)
await manager.add_driver(driver)

# Bind routes
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

## Plugin Message Gateway Driver

For plugin developers, MaiBot provides `PluginPlatformDriver` (defined in `src/platform_io/drivers/plugin_driver.py`), which implements sending/receiving capabilities through IPC calls to plugin Runner's message gateway components, without needing to directly operate underlying driver APIs.

See [PlatformIO Driver](./platform-io.md) page for details.