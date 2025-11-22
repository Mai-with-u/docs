# 📦 Linux 部署

- 以下内容假设你对Linux系统有一定的了解，如果觉得难以理解，请用Docker部署[Docker部署指南](mmc_deploy_docker)或者使用Windows系统部署[Windows部署指南](mmc_deploy_windows)

::: info
本教程推荐使用 [uv](https://docs.astral.sh/uv/) 作为 Python 包管理器，它提供了更快的包安装速度和更好的依赖管理体验。当然，传统的 pip 和 conda 方式依然可用。
:::

## 📋 环境要求
- ⚙️ 最低系统配置：2 核 CPU / 2GB 内存 / 5GB 磁盘空间
- 🐧 本教程测试环境：Debian Server 12.0 64bit
- 🐍 Python >= 3.10
- 📦 uv >= 0.1.0 (推荐使用最新版本)

## 一、 克隆麦麦，获取必要的文件
1. 通过 git clone 将 [麦麦 repo](https://github.com/MaiM-with-u/MaiBot) clone 到本地

2. 通过 git clone 将 [MaiBot-Napcat-Adapter](https://github.com/MaiM-with-u/MaiBot-Napcat-Adapter) clone 到本地
```bash
# 创建一个文件夹
mkdir maimai
cd maimai
git clone https://github.com/MaiM-with-u/MaiBot.git
git clone https://github.com/MaiM-with-u/MaiBot-Napcat-Adapter.git
```

## 二、环境配置

### 确认Python版本

需确保Python版本为3.10及以上

```bash
python3 --version
```

如果版本低于3.10，请更新Python版本。

```bash
# 此处以 Python 3.12 为例
# Ubuntu/Debian
sudo apt update
sudo apt install python3.12 python3.12-venv
# 如执行了这一步，建议在执行时将python3指向python3.12
# 更新替代方案，设置 python3.12 为默认的 python3 版本:
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12
sudo update-alternatives --config python3
```


### 安装python3-dev

```bash
# 此处以 Python 3.12 为例
# Ubuntu/Debian
sudo apt update
sudo apt install python3-dev
```


### 安装 uv (推荐)

安装 uv 包管理器：
```bash
# 使用 pip 安装 uv
pip3 install uv --break-system-packages -i https://mirrors.huaweicloud.com/repository/pypi/simple/
grep -qF 'export PATH="$HOME/.local/bin:$PATH"' ~/.bashrc || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```
或者使用官方安装脚本：
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

::: tip
使用 uv 时需要先运行 `uv venv` 创建虚拟环境，然后使用 `uv pip install` 安装依赖，或者直接使用 `uv run` 命令来自动管理虚拟环境。
:::

### 传统方式环境配置

#### 方法1：使用venv
```bash
python3 -m venv MaiBot/venv      # 创建虚拟环境    
source MaiBot/venv/bin/activate  # 激活环境
```

#### 方法2：使用conda（需先安装Miniconda或Anaconda）
```bash
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
conda create -n MaiBotEnv python=3.12
conda activate MaiBotEnv
```

## 三、依赖安装

### 使用 uv 安装依赖 (推荐)

1. 进入MaiBot文件夹，创建虚拟环境并安装依赖
```bash
cd MaiBot
uv venv
uv pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple --upgrade
```
::: tip
`uv venv` 创建虚拟环境，`uv pip install` 在该环境中安装依赖。如果你在安装过程中发现`quick_algo`安装失败，请参考[LPMM知识库](/manual/configuration/lpmm)中安装quick-algo的部分
:::

2. 回到上一级文件夹，再进入MaiBot-Napcat-Adapter文件夹，安装依赖
```bash
cd ..
cd MaiBot-Napcat-Adapter
uv venv
uv pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple --upgrade
```

### 使用传统方式安装依赖

```bash
cd MaiBot
pip install uv -i https://mirrors.aliyun.com/pypi/simple
uv pip install -i https://mirrors.aliyun.com/pypi/simple -r requirements.txt --upgrade
```
::: tip
如果你在这里发现`quick_algo`安装失败，请参考[LPMM 使用说明](/manual/configuration/lpmm)中手动编译的部分
:::
回到上一级文件夹，再进入MaiBot-Napcat-Adapter文件夹，安装依赖
```bash
cd ..
cd MaiBot-Napcat-Adapter
uv pip install -i https://mirrors.aliyun.com/pypi/simple -r requirements.txt --upgrade
```
## 四、MaiBot Napcat Adapter 部署

在`MaiBot-Napcat-Adapter`文件夹中
```bash
# 复制并重命名文件
cp template/template_config.toml config.toml
```

<hr class="custom_hr"/>

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

## 五、NapCat配置

###  **安装NapCat框架**

- 请参考NapCatQQ文档：[Shell版](https://www.napcat.wiki/guide/boot/Shell)、[Framework版](https://www.napcat.wiki/guide/boot/Framework),任选一种即可

## 六、配置MaiBot和Adapter

### MaiBot配置

```bash
cd MaiBot
# 创建文件夹
mkdir config
# 复制并重命名配置文件
cp template/bot_config_template.toml config/bot_config.toml
cp template/model_config_template.toml config/model_config.toml
cp template/template.env .env
```
复制完成后打开`.env`并修改PORT为8000
随后前往[配置指南](/manual/configuration/index)完成配置

### MaiBot Napcat Adapter 配置

1. 在Napcat中新建`websocket客户端`并设置反向代理的url（这里以`ws://localhost:8095/`为例）
> [!IMPORTANT]
> 配置示例：
> ![](/images/napcat_websockets_client.png)
2. 打开`MaiBot-Napcat-Adapter`文件夹下的`config.toml`，配置`[Napcat_Server]`、`[MaiBot_Server]`、`[Napcat]`字段
    - `[Napcat_Server]`字段的port,应该与Napcat设置的反向代理的url相同（这里是8095）
    - `[Napcat_Server]`字段的heartbeat,应该与Napcat设置的反向代理的心跳间隔相同（注意，Napcat中的间隔为毫秒，填入时请转化为秒，这里是30）
    - `[MaiBot_Server]`字段的port,应该与麦麦本体的`.env`中的`PORT`相同（此处为8000）

```ini
HOST=127.0.0.1
PORT=8000
```
麦麦主程序.env文件中的这部分负责配置MaiBot监听的端口和地址。

```toml
[Napcat_Server] # Napcat连接的ws服务设置
host = "localhost" # Napcat设定的主机地址
port = 8095        # Napcat设定的端口
heartbeat = 30     # 与Napcat设置的心跳相同（按秒计）

[MaiBot_Server] # 连接麦麦的ws服务设置
platform_name = "qq" # 标识adapter的名称（必填）
host = "localhost"   # 麦麦在.env文件中设置的主机地址，即HOST字段
port = 8000          # 麦麦在.env文件中设置的端口，即PORT字段
```
3. 其余字段请参考 Napcat Adapter 的[配置指南](/manual/adapters/napcat)

## 启动麦麦

### 使用 uv 运行 (推荐)

#### 前台运行
启动麦麦核心：
```bash
cd MaiBot
uv run python3 bot.py
```

开一个新窗口或者终端启动Napcat适配器：
```bash
cd MaiBot-Napcat-Adapter
uv run python3 main.py
```

#### 后台运行
如需在后台运行请使用screen

启动麦麦核心：
```bash
cd MaiBot
# 启动一个screen
screen -S mmc
# 运行mmc
uv run python3 bot.py
```
> 等待程序运行至eula检查部分，输入`同意`或`confirmed`，代表已经阅读并确认同意更新后的EULA和隐私条款

> 按`Ctrl+a`, 再按`d`, 即可退出screen, 此时,程序仍在后台执行;  

启动麦麦的adapter：
```bash
cd ../MaiBot-Napcat-Adapter
screen -S mmc-adapter
# 运行adapter
uv run python3 main.py
```

### 传统方式运行

#### 前台运行
启动麦麦核心：
```bash
# 在MaiBot目录下操作
cd MaiBot
python3 bot.py
```
开一个新窗口或者终端到`MaiBot-Napcat-Adapter`运行`python main.py`
```bash
cd MaiBot-Napcat-Adapter
python3 main.py
```

#### 后台运行
如需在后台运行请使用screen
启动麦麦核心前运行`screen -S mmc`
```bash
cd MaiBot
# 启动一个screen
screen -S mmc
source ../MaiBot/venv/bin/activate  # 激活环境
# 运行mmc
python3 bot.py
```
> 等待程序运行至eula检查部分，输入`同意`或`confirmed`，代表已经阅读并确认同意更新后的EULA和隐私条款

> 按`Ctrl+a`, 再按`d`, 即可退出screen, 此时,程序仍在后台执行;  

启动麦麦的adapter
```bash
cd ../MaiBot-Napcat-Adapter
screen -S mmc-adapter
source ../MaiBot/venv/bin/activate
# 运行adapter
python3 main.py
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
wget https://github.com/kanfandelong/maimai_install/blob/main/maibot.sh
#运行管理脚本
bash maibot.sh
```

## 命令速查表

### uv 相关命令 (推荐)
| 命令 | 用途 |
|------|------|
| `uv venv` | 创建Python虚拟环境 |
| `uv pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple --upgrade` | 安装依赖包 |
| `uv run python3 bot.py` | 运行麦麦核心 |
| `uv run python3 main.py` | 运行Napcat适配器 |

### 传统方式命令
| 命令 | 用途 |
|------|------|
| `source MaiBot/venv/bin/activate` | 激活Python虚拟环境（使用venv） |
| `conda activate MaiBotEnv` | 激活Python虚拟环境（使用conda） |
| `python3 bot.py` | 启动麦麦核心 |
| `python3 main.py` | 启动Napcat适配器|

### 后台运行相关
| 命令 | 用途 |
|------|------|
| `screen -S mmc` | 创建一个名为mmc的screen会话运行麦麦核心 |
| `screen -S mmc-adapter` | 创建一个名为mmc-adapter的screen会话运行适配器 |
| `Ctrl+a d` | 退出当前screen会话(程序继续在后台运行) |
| `screen -r mmc` | 重新连接到mmc会话 |
| `screen -r mmc-adapter` | 重新连接到mmc-adapter会话 |
| `screen -ls` | 查看所有screen会话列表 |
