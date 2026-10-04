---
title: Privacy Policy
---

# MaiBot User Privacy Policy

**Version: V1.2**  
**Updated: May 29, 2026**  
**Effective: May 29, 2026**  
**Applicable MaiBot versions: All versions**

::: info Translation notice
This English page is a convenience translation of the Chinese policy distributed with MaiBot. If the translations differ, refer to the [Chinese policy](/en/about/PRIVACY).
:::

The MaiBot project team respects and protects user privacy. By using MaiBot, you agree that the project may process your input and output as follows.

**1.1** The project collects input and output content and sends it to third-party APIs to generate new output. That content is therefore governed by both this policy and the third party's privacy policy.

**1.2** The project collects input and output content to build MaiBot-specific knowledge and memory stores held in the database used by your deployment, improving response accuracy and continuity.

**1.3** The project uses input and output content to produce logs stored on the device where MaiBot is deployed or used. These logs are not uploaded automatically. When you report an issue, the project team may ask you to provide logs for support.

**1.4** When telemetry is enabled, the project may send limited runtime and usage statistics to the project team's telemetry service for version distribution, stability analysis, capacity planning, and feature improvement. Telemetry is not intended to reconstruct chat content or identify chat participants.

Heartbeat telemetry may include:

- Client UUID;
- MaiBot version, operating-system type, and Python version.

Statistical telemetry may include:

- Client UUID;
- Statistics time window and whether it was truncated by the maximum lookback window;
- Actual online time, total window duration, and online coverage;
- Message counts aggregated by platform, private/group chat, direction, and reply-frequency range;
- Model-task and model-alias lists;
- Model request counts and input, output, and total tokens aggregated by task and model alias.

Telemetry statistics should not include:

- Message text, images, voice, or other chat content;
- Group names or IDs, user IDs or nicknames, or group-member information;
- API keys, base URLs, complete model configuration, or third-party credentials;
- Per-message details.

Client UUID, time window, platform, and model aliases may be associated with a deployment, so this telemetry should not be considered fully anonymous. Personal, organization, or other sensitive information placed in a model alias may be uploaded with telemetry.

You can disable telemetry without affecting core chat:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[telemetry]
enable = false
```

:::

Telemetry is retained for a reasonable period needed for the purposes above, then deleted or anonymized. The project team does not sell raw telemetry records to third parties.

**1.5 Third-party plugins**

- MaiBot can load plugins developed by third parties;
- A third-party plugin may collect, process, store, or transmit data under the plugin developer's control;
- The project team cannot monitor or control that processing and cannot guarantee a plugin's privacy or security;
- The plugin developer is responsible for its privacy policy, and users should ask that developer about its data handling;
- Users must assess and accept the privacy risks of third-party plugins themselves.

**1.6** You are responsible for adverse consequences when disclosure, acquisition, use, or transfer of private information results from your own conduct, force majeure, or third-party plugins, to the extent stated by the governing Chinese policy.

**1.7** The project team may update this policy in the future without an obligation to notify you. If you disagree with an updated policy, stop using the project immediately.

Also read the [MaiBot End User License Agreement](./EULA).
