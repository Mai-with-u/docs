# MaiBot GoCQ Adapter 文档

比较老的框架，部分账号可能在这个框架上拥有更低的风控概率

## GoCQ 配置

### 安装 GoCQ

首先，你需要安装 GoCQ 本身，以下列出了一些不同的GoCQ版本：
[AstralGocq](https://github.com/ProtocolScience/AstralGocq)
[gocq-http(New)](https://github.com/LagrangeDev/go-cqhttp)
在这些项目中的release页面下载对应的版本，这里只提供Windows版本的安装教程。

### 配置GoCQ

下载完成后，将可执行文件解压到一个文件夹中。

双击打开GoCQ本体，会弹出一个提示框，要求你生成安全启动脚本，点"确认"生成启动脚本。

关闭GoCQ本体，使用安全启动脚本启动GoCQ，此时会要求选择连接方式，选择 `反向WebSocket`。待生成config.yml配置后，关闭窗口。

打开 `config.yml`，修改以下配置：

```yaml
# 连接服务列表
servers:
  # 添加方式，同一连接方式可添加多个，具体配置说明请查看文档
  #- http: # http 通信
  #- ws:   # 正向 Websocket
  #- ws-reverse: # 反向 Websocket
  #- pprof: #性能分析服务器
  # 反向WS设置
  - ws-reverse:
      # 反向WS Universal 地址
      # 注意 设置了此项地址后下面两项将会被忽略
      universal: ws://127.0.0.1:8095
      # 反向WS API 地址
      api: ws://your_websocket_api.server
      # 反向WS Event 地址
      event: ws://your_websocket_event.server
      # 重连间隔 单位毫秒
      reconnect-interval: 3000
      middlewares:
        <<: *default # 引用默认中间件
```

使用启动脚本启动GoCQ，进行扫码登录。

如果要求验证，请使用浏览器打开提供的链接，然后按下F12，打开网络(或Network)选项卡，正常进行验证，验证完成后等待几秒，会弹出验证成功的消息，这时看到你的开发人员工具，点击最下面那个请求，打开响应，复制 `ticket`字段的值，粘贴到gocq的输入框中，按回车完成验证。

## GoCQ Adapter 配置

### 安装 GoCQ Adapter

从GitHub上克隆[repo](https://github.com/LOGIC-SC/MaiBot-Gocq-Adapter.git)，安装依赖，然后使用相应的环境启动。

```bash
git clone https://github.com/LOGIC-SC/MaiBot-Gocq-Adapter.git
pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple --upgrade
python main.py
```

### 配置 GoCQ Adapter

此 Go-CQ Adapter基于 Napcat Adapter 二次修改的，配置与其类似，这里就不再赘述。
警告：与Napcat Adapter不同的是，这里的Napcat_server项在跟进Napcat Adapter的更新后，被替换为了gocq_server项，从旧版本升级到新版本时，一定要注意修改配置。
