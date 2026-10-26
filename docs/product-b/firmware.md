# 固件说明 / 烧录 · 产品 B

## 👉 在线烧录（推荐）

<a href="/flash/?product=product-b" target="_blank" style="display:inline-block;padding:10px 22px;background:#0ea5e9;color:#fff;border-radius:8px;text-decoration:none;font-weight:500;">⚡ 打开在线烧录页</a>

## 固件版本

| 版本 | 说明 |
|------|------|
| v2.0.0 | 新增 MQTT、Home Assistant 自动发现、低功耗休眠 |

## 手动烧录

```bash
esptool.py --chip esp32c3 --port /dev/ttyUSB0 --baud 460800 \
  --before default_reset --after hard_reset write_flash -z \
  --flash_mode dio --flash_freq 80m --flash_size 4MB \
  0x0000  bootloader.bin \
  0x8000  partitions.bin \
  0x10000 firmware.bin
```
