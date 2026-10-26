# 进阶使用 · 产品 A

## MQTT 接入 Home Assistant

v1.2.0 起支持 MQTT Discovery，接入 HA 非常简单：

1. 打开设备 Web 控制台 → 设置 → MQTT
2. 填入你的 MQTT Broker 地址（通常是 HA 地址 + 1883）、用户名密码
3. 勾选「启用 Home Assistant 自动发现」
4. 保存后，HA 的 "设备与服务" → "MQTT" 里会自动出现 2 个开关 + 3 个传感器

### MQTT 主题约定（手动接入时）

| 主题 | 方向 | 说明 |
|------|------|------|
| `switch-a/{id}/relay/1/set` | HA → 设备 | 下发 `ON` / `OFF` |
| `switch-a/{id}/relay/1/state` | 设备 → HA | 上报当前状态 |
| `switch-a/{id}/sensor/power` | 设备 → HA | 功率 (W) |
| `switch-a/{id}/sensor/voltage` | 设备 → HA | 电压 (V) |
| `switch-a/{id}/sensor/current` | 设备 → HA | 电流 (A) |

## OTA 升级

烧录完 v1.2.0 以后，可以直接在 Web 控制台上传新固件进行 OTA 升级（无需再按 BOOT）。
也可以通过 MQTT 下发固件 URL 触发远程升级（见后续 MQTT API 文档）。

## 二次开发

源码位于 `product-a/` 固件仓库主分支，基于 ESP-IDF 5.1 + Arduino 组件（通过 PlatformIO）：

```bash
git clone https://github.com/your-name/your-firmware.git
cd your-firmware/product-a
pio run -e esp32s3_release
pio run -e esp32s3_release -t upload
```

如果用 Arduino IDE，需要安装 ESP32 开发板包（v3.x 以上），参考源码里的 README。

## REST API

设备提供简单的 HTTP API，方便接入自己的自动化系统：

```bash
# 查询状态
curl http://<device-ip>/api/status

# 控制继电器
curl -X POST http://<device-ip>/api/relay/1 -d '{"state":"ON"}'

# 查询功率采样
curl http://<device-ip>/api/sensor
```
