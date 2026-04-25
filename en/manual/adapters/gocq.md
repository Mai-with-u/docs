# MaiBot GoCQ Adapter Documentation

An older framework where some accounts may have lower risk control probability on this framework.

## GoCQ Configuration

### Install GoCQ

First, you need to install GoCQ itself. Here are some different GoCQ versions:
[AstralGocq](https://github.com/ProtocolScience/AstralGocq)
[gocq-http(New)](https://github.com/LagrangeDev/go-cqhttp)
Download the corresponding version from the release pages of these projects. This tutorial only provides installation instructions for the Windows version.

### Configure GoCQ

After downloading, extract the executable file to a folder.

Double-click to open the GoCQ main program. A prompt will appear asking you to generate a secure startup script. Click "Confirm" to generate the startup script.

Close the GoCQ main program, then use the secure startup script to start GoCQ. You'll be asked to select a connection method. Choose `Reverse WebSocket`. Wait for the config.yml configuration to be generated, then close the window.

Open `config.yml` and modify the following configuration:

```yaml
# Connection service list
servers:
  # Add methods, multiple can be added for the same connection method. See documentation for specific configuration details
  #- http: # http communication
  #- ws:   # Forward Websocket
  #- ws-reverse: # Reverse Websocket
  #- pprof: # Performance analysis server
  # Reverse WS settings
  - ws-reverse:
      # Reverse WS Universal address
      # Note: After setting this address, the following two items will be ignored
      universal: ws://127.0.0.1:8095
      # Reverse WS API address
      api: ws://your_websocket_api.server
      # Reverse WS Event address
      event: ws://your_websocket_event.server
      # Reconnection interval in milliseconds
      reconnect-interval: 3000
      middlewares:
        <<: *default # Reference default middleware
```

Use the startup script to start GoCQ and scan the QR code to log in.

If verification is required, open the provided link in a browser, then press F12 to open the Network tab. Proceed with normal verification. After verification completes, wait a few seconds for a verification success message to appear. Then look at your developer tools, click on the bottommost request, open the response, copy the value of the `ticket` field, paste it into the gocq input box, and press Enter to complete verification.

## GoCQ Adapter Configuration

### Install GoCQ Adapter

Clone the [repository](https://github.com/LOGIC-SC/MaiBot-Gocq-Adapter.git) from GitHub, install dependencies, then start it with the appropriate environment.

```bash
git clone https://github.com/LOGIC-SC/MaiBot-Gocq-Adapter.git
pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple --upgrade
python main.py
```

### Configure GoCQ Adapter

This Go-CQ Adapter is based on a modified version of the Napcat Adapter, with similar configuration, so it won't be detailed here again.
Warning: Unlike the Napcat Adapter, the Napcat_server item here has been replaced with gocq_server item after following Napcat Adapter updates. When upgrading from an old version to a new version, be sure to modify the configuration.
