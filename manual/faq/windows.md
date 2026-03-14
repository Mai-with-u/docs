# Windows 常见问题

本页汇总在 Windows 系统上部署 MaiBot 时可能遇到的常见问题及解决方法。若遇到其他问题，欢迎在 Issue 或群组中反馈。

---

## 1. 依赖安装问题

**Q：在安装依赖时 `quick_algo` 安装失败怎么办？**

如果在使用 `uv pip install` 或 `pip install` 安装依赖时遇到 `quick_algo` 编译/安装失败，请参考以下步骤：

1. **确认编译环境**：确保已安装 Visual C++ 构建工具或 MinGW 等 C/C++ 编译环境。
2. **参考 LPMM 文档**：`quick_algo` 是 LPMM（语言模型内存管理）模块的底层依赖，其安装方法详见 [LPMM 知识库](/manual/configuration/lpmm/lpmm) 中“安装 quick-algo”或“手动编译”部分。
3. **临时跳过**：若仅用于测试，可尝试注释掉 `requirements.txt` 中 `quick_algo` 相关行（但不推荐长期使用）。

**注意**：该问题在使用 `uv` 或传统 `pip` 安装时均可能出现，解决方法相同。

---

## 2. 虚拟环境问题

**Q：使用 uv 和传统 venv 有什么注意事项？**

- `uv venv` 创建的虚拟环境与 `python -m venv` 创建的虚拟环境机制不同，**不要混合使用**。
- 使用 `uv` 时，推荐全程使用 `uv run` 命令运行脚本，它会自动管理虚拟环境。
- 使用传统 venv 时，每次运行前需手动激活：`.\venv\Scripts\activate`（PowerShell）或 `venv\Scripts\activate.bat`（CMD）。

---

## 3. 其他常见问题

**Q：Napcat 连接不上怎么办？**

1. 确认 Napcat 已正常启动，并在 Napcat 中创建了 **WebSocket 客户端**（反向代理）。
2. 检查 `MaiBot-Napcat-Adapter/config.toml` 中 `[Napcat_Server]` 的 `host` 和 `port` 是否与 Napcat 设置一致。
3. 确保 MaiBot 本体的 `.env` 中 `PORT` 与 `[MaiBot_Server]` 的 `port` 一致。
4. 防火墙可能阻止本地端口通信，可临时关闭防火墙测试。

**Q：启动时报“端口已被占用”错误？**

修改 `.env` 文件中的 `PORT` 值为其他未被占用的端口（如 8001、8080 等），并同步更新 Adapter 配置中的 `[MaiBot_Server].port`。

---

如以上内容未解决您的问题，请参考 [通用 FAQ](../faq/index.md) 或前往 [麦麦社群](/manual/other/group) 寻求帮助。