"""最小可用的 MaiBot 适配器骨架。

用法：把 PlatformBridge 里三个方法的 TODO 换成你平台的 SDK 调用，
其余代码不需要改动。运行前先 `pip install maim_message`。

    python adapter.py
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

from maim_message import MessageClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("my-adapter")

# ---- 只改这一段 ----------------------------------------------------------
PLATFORM = "myplatform"  # 平台名：全局唯一，不要用 webui / bot_console
MAIBOT_WS_URL = "ws://127.0.0.1:8000/ws"  # 对应 maim_message.ws_server_host / port
MAIBOT_TOKEN = ""  # 与 maim_message.auth_token 中的某一项完全一致
SELF_ID = "bot_1"  # 本适配器实例的账号标识，用于多账号路由
# --------------------------------------------------------------------------


# region bridge
class PlatformBridge:
    """平台侧收发封装。接一个新平台，只需要实现这三个方法。"""

    async def send_text(self, target: str, text: str) -> str:
        """给 target 发一条文本，返回平台侧的消息 ID。"""
        raise NotImplementedError

    async def send_image(self, target: str, image_base64: str) -> str:
        """给 target 发一张图片（base64），返回平台侧的消息 ID。"""
        raise NotImplementedError

    async def poll_events(self) -> list[dict[str, Any]]:
        """阻塞收取平台事件，返回归一化后的事件列表。

        每个事件的字段约定见 build_inbound()。
        """
        raise NotImplementedError


# endregion bridge


# region inbound
class Adapter:
    def __init__(self, bridge: PlatformBridge) -> None:
        self.bridge = bridge
        self.client = MessageClient()
        self.client.register_message_handler(self.on_outbound)
        self.client.register_custom_message_handler("message_id_echo", self.on_echo)

    # ---- 入站：平台 → MaiBot ---------------------------------------------
    def build_inbound(self, event: dict[str, Any]) -> dict[str, Any]:
        """把平台事件拼成 MaiBot 的统一消息格式。"""
        is_group = event.get("group_id") is not None
        message_info: dict[str, Any] = {
            "platform": PLATFORM,
            "message_id": str(event["message_id"]),
            "time": float(event.get("time") or time.time()),
            "user_info": {
                "platform": PLATFORM,
                "user_id": str(event["user_id"]),
                "user_nickname": str(event.get("user_name") or event["user_id"]),
            },
            # 这三个字段让出站回复能找到回来的路
            "additional_config": {
                "platform_io_account_id": SELF_ID,
                "platform_io_target_user_id": str(event["user_id"]),
            },
        }
        if is_group:
            message_info["group_info"] = {
                "platform": PLATFORM,
                "group_id": str(event["group_id"]),
                "group_name": str(event.get("group_name") or event["group_id"]),
            }
        return {
            "message_info": message_info,
            "message_segment": {"type": "text", "data": str(event["text"])},
        }

    async def poll_loop(self) -> None:
        while True:
            try:
                events = await self.bridge.poll_events()
            except Exception:
                logger.exception("收取平台事件失败，2 秒后重试")
                await asyncio.sleep(2)
                continue
            for event in events:
                await self.client.send_message(self.build_inbound(event))

    # endregion inbound

    # region outbound
    # ---- 出站：MaiBot → 平台 ---------------------------------------------
    async def on_outbound(self, message: dict[str, Any]) -> None:
        info = message["message_info"]
        segment = message["message_segment"]
        target = self.resolve_target(info)
        message_id = str(info["message_id"])

        for seg in self.iter_segments(segment):
            actual_id = ""
            if seg["type"] == "text":
                actual_id = await self.bridge.send_text(target, seg["data"])
            elif seg["type"] == "image":
                actual_id = await self.bridge.send_image(target, seg["data"])
            elif seg["type"] == "at":
                actual_id = await self.bridge.send_text(target, f"@{seg['data']} ")
            else:
                logger.warning("暂不支持的分段类型：%s", seg["type"])
                continue
            if actual_id:
                # 把平台真实消息 ID 回填给 MaiBot
                await self.client.send_custom_message(
                    "message_id_echo",
                    {"type": "echo", "echo": message_id, "actual_id": actual_id},
                )

    @staticmethod
    def iter_segments(segment: dict[str, Any]):
        """出站正文通常是 seglist，这里统一成可迭代的分段。"""
        if segment["type"] == "seglist":
            yield from segment["data"]
        else:
            yield segment

    @staticmethod
    def resolve_target(info: dict[str, Any]) -> str:
        """群消息发到群，私聊发到人。"""
        group_info = info.get("group_info")
        if group_info:
            return str(group_info["group_id"])
        return str(info["additional_config"]["platform_io_target_user_id"])

    # endregion outbound

    async def on_echo(self, payload: dict[str, Any]) -> None:
        logger.debug("回执：%s -> %s", payload.get("echo"), payload.get("actual_id"))

    # ---- 生命周期 --------------------------------------------------------
    async def run(self) -> None:
        await self.client.connect(
            url=MAIBOT_WS_URL, platform=PLATFORM, token=MAIBOT_TOKEN or None
        )
        logger.info("已连接 MaiBot：%s（platform=%s）", MAIBOT_WS_URL, PLATFORM)
        await asyncio.gather(self.poll_loop(), self.client.run())


if __name__ == "__main__":
    asyncio.run(Adapter(PlatformBridge()).run())
