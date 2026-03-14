# Linux 常见问题

本页汇总在 Linux 系统上部署 MaiBot 时可能遇到的常见问题及解决方法。若遇到其他问题，欢迎在 Issue 或群组中反馈。

---

## 1. 部署前的准备

**Q：我对 Linux 系统不熟悉，觉得部署步骤太难怎么办？**

如果您对 Linux 命令和系统管理不太熟悉，建议优先选择以下更简单的部署方式：

- **Docker 部署**：提供容器化的一键运行方案，详见 [Docker 部署指南](../deployment/mmc_deploy_docker.md)。
- **Windows 部署**：在 Windows 系统上通过图形界面操作，详见 [安装指南](../deployment/installation.md)。

---

## 2. 虚拟环境问题

**Q：传统 venv 和 uv 虚拟环境可以混用吗？**

**不可以**。传统 `venv`（通过 `python -m venv` 创建）和现代 `uv`（通过 `uv venv` 创建）是两种不同的虚拟环境机制，**绝对不能混合使用**。

- 如果选择了 `uv`，请全程使用 `uv` 命令（`uv pip install`、`uv run` 等）。
- 如果选择了传统 `venv`，请全程使用 `venv` 的 `activate` 脚本激活环境后再执行操作。
- 混合使用会导致依赖安装位置混乱，引发 `ModuleNotFoundError` 等异常。

**Q：使用传统 venv 时，每次都要手动激活吗？**

是的。使用传统 `venv` 时，**每次打开新的终端窗口或标签页都需要手动激活虚拟环境**，否则将使用系统全局 Python 环境，导致依赖找不到。

激活命令（在 MaiBot 项目根目录下）：
```bash
source venv/bin/activate
```

激活后终端提示符前会显示 `(venv)` 标识。

**Q：启动时提示“命令未找到”或“模块不存在”？**

请检查：

1. **虚拟环境是否激活**：确认终端提示符前有 `(venv)` 或已使用 `uv run`。
2. **启动方式是否与安装方式匹配**：如果用传统 `venv` 安装依赖，启动时也应使用 `source venv/bin/activate && python bot.py`；如果用 `uv` 安装，启动时应使用 `uv run python bot.py`。
3. **当前路径是否正确**：确保在 MaiBot 项目根目录下执行启动命令。

---

## 3. 依赖安装问题

**Q：安装依赖时 `quick_algo` 编译失败怎么办？**

`quick_algo` 是 LPMM（语言模型内存管理）模块的底层依赖，需要编译 C/C++ 扩展。若安装失败：

1. **安装编译工具链**：确保系统已安装 `gcc`、`g++`、`make` 等编译工具。
   ```bash
   # Debian/Ubuntu
   sudo apt update && sudo apt install build-essential
   # CentOS/RHEL
   sudo yum groupinstall "Development Tools"
   ```
2. **参考 LPMM 文档**：详细安装和手动编译步骤请参考 [LPMM 使用说明](/manual/configuration/lpmm/lpmm) 中“手动编译”部分。
3. **临时跳过**：若仅用于测试，可尝试注释掉 `requirements.txt` 中 `quick_algo` 相关行（但不推荐长期使用）。

---

## 4. 运行与连接问题

**Q：Napcat 连接不上怎么办？**

1. 确认 Napcat 已正常启动，并在 Napcat 中创建了 **WebSocket 客户端**（反向代理）。
2. 检查 `MaiBot-Napcat-Adapter/config.toml` 中 `[Napcat_Server]` 的 `host` 和 `port` 是否与 Napcat 设置一致。
3. 确保 MaiBot 本体的 `.env` 中 `PORT` 与 `[MaiBot_Server]` 的 `port` 一致。
4. 检查防火墙是否阻止了本地回环（`127.0.0.1`）端口通信：
   ```bash
   sudo ufw status  # 查看防火墙状态
   ```

**Q：启动时报“端口已被占用”错误？**

修改 `.env` 文件中的 `PORT` 值为其他未被占用的端口（如 8001、8080 等），并同步更新 Adapter 配置中的 `[MaiBot_Server].port`。

---

如以上内容未解决您的问题，请参考 [通用 FAQ](../faq/index.md) 或前往 [麦麦社群](/manual/other/group) 寻求帮助。