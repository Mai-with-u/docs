# 📱 Android 部署指南

### 一、安装 ZeroTermux 环境

前往 [ZeroTermux-Github](https://github.com/hanxinhao000/ZeroTermux/releases/tag/release) 下载ZeroTermux安装包并安装。

**注意：安装其他版本或者选择Termux会导致以下教程出现部分的不适用，不建议这样做**

进入ZeroTermux软件界面，提示完整阅读协议时记得要把文字内容拉到最底下。

双击屏幕左侧边缘（部分ZT版本是按音量上/下键），下滑并点击"切换源"，随意选择，推荐选择`清华源`，等待脚本运行完成。

> 如无特殊说明，当出现 `(Y/I/N/O/D/Z)[default=?]` 或 `[Y/N]` 时，直接点击回车，选择默认选项即可。面向有一定Linux基础的用户，使用ZeroTermux搭建基于MaiBot的QQ机器人。

开始之前，**强烈建议阅读 [MaiBot文档中心-安装指南](../installation.md) 和 [如何高效提问](/manual/other/smart-question-guide)**，这对了解大致流程和提问来说很有帮助。

::: info
本教程推荐使用 [uv](https://docs.astral.sh/uv/) 作为 Python 包管理器，它提供了更快的包安装速度和更好的依赖管理体验。当然，传统的 pip 方式依然可用。
:::

::: warning
**本教程为部署到QQ平台的教程，不代表其他平台的部署方式相同**
:::

## 📋 环境要求
- 📱 Android 7.0+ 系统
- 💾 至少 2GB 可用存储空间
- 🐍 Python >= 3.10
- 📦 uv >= 0.1.0 (推荐使用最新版本)

## 1. 安装 ZeroTermux 环境

前往[ZeroTermux-Github](https://github.com/hanxinhao000/ZeroTermux/releases/tag/release)下载ZeroTermux安装包并安装。

**注意：安装其他版本或者选择Termux会导致以下教程出现部分的不适用，文档作者不建议这样做**

进入ZeroTermux软件界面，提示完整阅读协议时记得要把文字内容拉到最底下。

双击屏幕左侧边缘（部分ZT版本是按音量上/下键），下滑并点击“切换源”，随意选择，作者推荐选择`清华源`，等待脚本运行完成。

> 如无特殊说明，当出现 `(Y/I/N/O/D/Z)[default=?]` 或 `[Y/N]` 时，直接点击回车，选择默认选项即可。

## 二、安装 proot 和 Ubuntu

运行（逐行粘贴并回车）如下命令安装 `proot`, `Ubuntu`：
```bash
pkg install proot-distro      # 安装proot
proot-distro install ubuntu   # 安装Ubuntu
proot-distro login ubuntu     # 登录Ubuntu
```

随后运行如下命令安装必要软件：

```bash
apt update
apt install sudo vim git python3-dev python3.12-venv build-essential screen curl python3-pip
```

### 用户账户配置 (可选但推荐)

::: details 创建非root用户 (推荐)
直接使用root用户操作所有命令可能有巨大的安全风险（**尤其是新手！**），建议创建一个普通用户账户。

替换 `<username>` 为你的用户名，输入两次密码后可以全部按回车留空。**密码输入后不显示是正常的。**
```bash
adduser <username>           # 创建账户
usermod -aG sudo <username>  # 添加运行sudo的权限
```

然后登入新创建的账户：
```bash
su <username>                # 登入账户
```
:::

## 三、获取必要的文件

创建文件夹并从Github上拉取源码：

```bash
cd ~              # 进入home目录（~）
mkdir maimai      # 创建maimai文件夹
cd maimai         # 进入maimai文件夹
git clone https://github.com/MaiM-with-u/MaiBot.git
git clone https://github.com/MaiM-with-u/MaiBot-Napcat-Adapter.git
```

## 四、环境配置

### 确认Python版本

确保Python版本为3.10及以上：

```bash
python3 --version
```

### 安装 uv (推荐)

安装 uv 包管理器：
```bash
# 使用 pip 安装 uv
pip3 install uv --break-system-packages -i https://mirrors.huaweicloud.com/repository/pypi/simple/
grep -qF 'export PATH="$HOME/.local/bin:$PATH"' ~/.bashrc || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

::: tip
使用 uv 时需要先运行 `uv venv` 创建虚拟环境，然后使用 `uv pip install` 安装依赖，或者直接使用 `uv run` 命令来自动管理虚拟环境。
:::

### 传统方式环境配置

如果不使用uv，可以使用传统的venv方式：

```bash
python3 -m venv MaiBot/venv      # 创建虚拟环境    
source MaiBot/venv/bin/activate  # 激活环境
```

::: tip
使用传统方式时，每次使用如未显示`(venv)`，都需要重新激活环境
:::

## 五、依赖安装

### 使用 uv 安装依赖 (推荐)

1. 进入MaiBot文件夹，创建虚拟环境并安装依赖：
```bash
cd MaiBot
uv venv
uv pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple --upgrade
```

::: tip
如果你在这里发现`quick_algo`安装失败，请参考[LPMM知识库](/manual/configuration/lpmm/lpmm)中安装`quick-algo`的部分
:::

2. 回到上一级文件夹，进入MaiBot-Napcat-Adapter文件夹，安装依赖：
```bash
cd ..
cd MaiBot-Napcat-Adapter
uv venv
uv pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple --upgrade
# 复制并重命名配置文件
cp template/template_config.toml config.toml
```

### 使用传统方式安装依赖

```bash
cd MaiBot
pip3 install -r requirements.txt
```

::: tip
如果你在这里发现`quick_algo`安装失败，请参考[LPMM知识库](/manual/configuration/lpmm/lpmm)中安装`quick-algo`的部分
:::

回到上一级文件夹，再进入MaiBot-Napcat-Adapter文件夹，安装依赖：
```bash
cd ..
cd MaiBot-Napcat-Adapter
pip3 install -r requirements.txt
# 复制并重命名配置文件
cp template/template_config.toml config.toml
```

最终的文件夹结构应该类似这样：
```
maimai
├── MaiBot
│   ├── changelogs
│   ├── config
│   ├── data
│   ├── depends-data
│   ├── src
│   │   └── ...
│   └── template
└── MaiBot-Napcat-Adapter
    ├── config.toml
    └── template
```

## 六、NapCat 部署

### 安装 NapCat

```bash
# 安装NapCat
curl -o napcat.sh https://nclatest.znin.net/NapNeko/NapCat-Installer/main/script/install.sh
sudo bash napcat.sh --docker n --cli y

# 打开NapCat
sudo napcat
```

之后使用方向键和回车依次选择
```
配置Napcat
配置服务
输入QQ号码
保存
配置服务
4  WebSocket客户端
```
名称任意填，Url将“8082”修改为“8095”，其他保持默认

然后继续选择
```
OK
enable（使用空格选中）
OK
退出
启动Napcat
启动账号：xxxxxxxxx
```
之后截屏二维码，发送/投屏到另一个设备 **（直接从相册导入二维码实测无法登录）**，用登录该QQ号的手机QQ扫码。随后退出即可。

## 七、配置 MaiBot 和 Adapter

```bash
cd ../MaiBot
# 创建文件夹
mkdir config
# 复制并重命名配置文件
cp template/bot_config_template.toml config/bot_config.toml
cp template/model_config_template.toml config/model_config.toml
cp template/template.env .env
vim .env
#修改.env，开头的port改成8000
```

**随后前往 [MaiBot文档中心配置指南](/manual/configuration/index.md)完成配置**
**大部分的问题都是在这一步发生的，上述文档有看不懂的内容欢迎找群友沟通**

然后配置MaiBot-Napcat-Adapter

使用vim打开MaiBot-Napcat-Adapter文件夹下的config.toml，配置`Napcat_Server`、`MaiBot_Server`字段
```toml
[Napcat_Server] # Napcat连接的ws服务设置
host = "localhost" # Napcat设定的主机地址
port = 8095        # Napcat设定的端口
heartbeat = 30     # 与Napcat设置的心跳相同（按秒计）

[MaiBot_Server] # 连接麦麦的ws服务设置
host = "localhost"   # 麦麦在.env文件中设置的主机地址，即HOST字段
port = 8000          # 麦麦在.env文件中设置的端口，即PORT字段
```
`Napcat_Serve`字段的`port`,应该与Napcat设置的反向代理的url相同（这里是8095）

`Napcat_Server`字段的`heartbeat`,应该与Napcat设置的反向代理的心跳间隔相同（注意，Napcat中的间隔为毫秒，填入时请转化为秒，这里是30）

`MaiBot_Server`字段的`port`,应该与麦麦本体的.env中的`PORT`相同（此处为8000）

其余字段参考[MaiBot文档中心-Adapter配置](/manual/adapters/napcat.html)

**记得在这里配置群组或私聊的白名单！否则无法回复消息**

## 八、启动 MaiBot

*恭喜你已经完成了大部分步骤！胜利的曙光就在眼前！*

### 使用 uv 运行 (推荐)

1. 首先启动 NapCat（如果还没有启动）

2. 启动 MaiBot 核心：
```bash
screen -R mmc
# 窗口会清空，别慌
cd ~/maimai/MaiBot
uv run python3 bot.py
# 按 Ctrl+A 然后按 D 退出screen
```

3. 启动 MaiBot-Napcat-Adapter：
```bash
screen -R mmc-adapter
cd ~/maimai/MaiBot-Napcat-Adapter
uv run python3 main.py
# 按 Ctrl+A 然后按 D 退出screen
```

### 使用传统方式运行

1. 首先启动 NapCat（如果还没有启动）

2. 启动 MaiBot 核心：
```bash
screen -R mmc
# 窗口会清空，别慌
cd ~/maimai/MaiBot
source venv/bin/activate  # 激活虚拟环境
python3 bot.py
# 按 Ctrl+A 然后按 D 退出screen
```

3. 启动 MaiBot-Napcat-Adapter：
```bash
screen -R mmc-adapter
cd ~/maimai/MaiBot-Napcat-Adapter
source ../MaiBot/venv/bin/activate  # 激活虚拟环境
python3 main.py
# 按 Ctrl+A 然后按 D 退出screen
```

### 使用社区管理脚本启动
作者：kanfandelong

脚本放置位置参考

```
../
├── MaiBot/
├── MaiBot-Napcat-Adapter/
├── maibot.sh
└── ...
```
#### 获取脚本并运行
```bash [apt]
#安装unbuffer和wget
sudo apt install expect wget
#下载管理脚本
wget https://github.com/kanfandelong/maimai_install/raw/main/maibot.sh
#运行管理脚本
bash maibot.sh
```

## 九、命令速查表

### 基础命令

| 命令 | 作用 |
|---|---|
| `cd xxx` | 进入xxx目录（若xxx为..则返回上一级目录） |
| `vim xxx` | 使用vim编辑器编辑文件 |
| `ESC` + `:wq` | 退出vim并保存 | 

### uv 相关命令 (推荐)

| 命令 | 作用 |
|---|---|
| `uv venv` | 创建Python虚拟环境 |
| `uv pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple --upgrade` | 安装依赖包 |
| `uv run python3 bot.py` | 运行麦麦核心 |
| `uv run python3 main.py` | 运行Napcat适配器 |

### Screen 会话管理

| 命令 | 作用 |
|---|---|
| `screen -r xxx` / `screen -R xxx` | 进入xxx session （后者当没有该session时会创建一个） |
| `Ctrl` + `A` + `D` | 退出session |
| `screen -ls` | 列出所有session |

### 传统方式命令

| 命令 | 作用 |
|---|---|
| `source ~/maimai/MaiBot/venv/bin/activate` | 激活Python虚拟环境 |
| `python3 bot.py` | 启动麦麦核心 |
| `python3 main.py` | 启动Napcat适配器 |

## 十、常态化启动

### 使用 uv 方式

```bash
# 进入Ubuntu环境
proot-distro login ubuntu
su <username>  # 如果使用root用户完成整个流程请跳过这步

# 启动适配器
screen -r mmc-adapter
cd ~/maimai/MaiBot-Napcat-Adapter
uv run python3 main.py
# 按 Ctrl+A 然后按 D 退出

# 启动麦麦核心
screen -r mmc
cd ~/maimai/MaiBot
uv run python3 bot.py
# 按 Ctrl+A 然后按 D 退出
```

### 使用传统方式

```bash
# 进入Ubuntu环境
proot-distro login ubuntu
su <username>  # 如果使用root用户完成整个流程请跳过这步

# 启动适配器
screen -r mmc-adapter
cd ~/maimai/MaiBot-Napcat-Adapter
source ../MaiBot/venv/bin/activate
python3 main.py
# 按 Ctrl+A 然后按 D 退出

# 启动麦麦核心
screen -r mmc
cd ~/maimai/MaiBot
source venv/bin/activate
python3 bot.py
# 按 Ctrl+A 然后按 D 退出
```

---

**🎉 恭喜你完成了Android上的MaiBot部署！**
