# macOS 常见问题

本页汇总在 macOS 系统上部署 MaiBot 时可能遇到的常见问题及解决方法。若遇到其他问题，欢迎在 Issue 或群组中反馈。

---

## 1. 编译与依赖问题

**Q：`quick_algo` 编译失败怎么办？**

`quick_algo` 是 LPMM（语言模型内存管理）模块的底层依赖，需要在本地编译 C/C++ 扩展。若编译失败，请检查以下条件：

1. **Xcode Command Line Tools**：确保已安装 Xcode Command Line Tools。
   ```bash
   xcode-select --install
   ```
   安装完成后验证：
   ```bash
   xcode-select -p
   ```

2. **Python 版本**：确认 Python 版本 ≥ 3.10。
   ```bash
   python3 --version
   ```

3. **虚拟环境**：确保在虚拟环境中操作，避免系统 Python 环境冲突。

4. **参考 LPMM 文档**：若仍失败，请参考 [LPMM 使用说明](/manual/configuration/lpmm/lpmm) 中的手动编译指南。

---

## 2. 系统安全与权限

**Q：运行时提示“无法打开”或“来自不受信任的开发者”怎么办？**

macOS 对未签名的应用会显示安全警告。若运行 MaiBot 或相关脚本时遇到此类提示：

1. 在“系统偏好设置” → “安全性与隐私” → “通用”中，查看是否有“允许来自...”的按钮，点击允许。
2. 如果未显示按钮，可尝试在终端中为脚本添加执行权限：
   ```bash
   chmod +x script_name.sh
   ```
3. 若仍被阻止，可临时禁用 Gatekeeper（仅限测试环境，不推荐长期使用）：
   ```bash
   sudo spctl --master-disable
   ```
   **注意**：完成后请重新启用：
   ```bash
   sudo spctl --master-enable
   ```

---

## 3. 端口与网络

**Q：启动时报“端口已被占用”错误？**

默认端口 8000 可能被其他应用占用。解决方法：

1. **修改端口**：编辑 `.env` 文件，将 `PORT` 改为其他值（如 8001、8080 等），并同步更新 Adapter 配置中的 `[MaiBot_Server].port`。
2. **查看占用进程**：
   ```bash
   lsof -i :8000
   ```
   找到占用端口的 PID，然后终止：
   ```bash
   kill -9 <PID>
   ```
3. **检查防火墙**：确保 macOS 防火墙未阻止本地端口通信（系统偏好设置 → 安全性与隐私 → 防火墙）。

---

## 4. 虚拟环境问题

**Q：虚拟环境激活失败或命令找不到？**

macOS 上虚拟环境的激活命令与 Windows 不同，请注意区分：

- **正确激活命令**（在项目根目录下）：
  ```bash
  source .venv/bin/activate
  ```
  激活后终端提示符前会显示 `(.venv)` 或类似标识。

- **不要使用 Windows 命令**：如 `.\venv\Scripts\activate` 在 macOS 上无效。

- **使用 uv 的情况**：如果使用 `uv` 管理虚拟环境，可直接使用 `uv run python bot.py`，无需手动激活。

---

## 5. 其他常见问题

**Q：Napcat 连接不上怎么办？**

1. 确认 Napcat 已正常启动，并在 Napcat 中创建了 **WebSocket 客户端**（反向代理）。
2. 检查 `MaiBot-Napcat-Adapter/config.toml` 中 `[Napcat_Server]` 的 `host` 和 `port` 是否与 Napcat 设置一致。
3. 确保 MaiBot 本体的 `.env` 中 `PORT` 与 `[MaiBot_Server]` 的 `port` 一致。
4. 尝试关闭 macOS 防火墙临时测试。

---

如以上内容未解决您的问题，请参考 [通用 FAQ](../faq/index.md) 或前往 [麦麦社群](/manual/other/group) 寻求帮助。