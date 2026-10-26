# 固件说明 / 烧录 · 产品 A

## 👉 在线烧录（推荐）

<a href="/flash/?product=product-a" target="_blank" style="display:inline-block;padding:10px 22px;background:#0ea5e9;color:#fff;border-radius:8px;text-decoration:none;font-weight:500;">⚡ 打开在线烧录页</a>

无需安装 Arduino IDE、Python、esptool。只要 Chrome/Edge 浏览器 + 一根 USB 数据线，点上面的按钮即可。

## 固件版本

| 版本 | 发布日期 | 主要变化 |
|------|---------|---------|
| v1.2.0 | 2025-xx-xx | 稳定版，推荐。修复继电器粘连问题，新增 MQTT 自动发现 |
| v1.1.0 | 2025-xx-xx | 增加功率校准；Web UI 英文/中文切换 |

完整发布记录见 [GitHub Releases](https://github.com/your-name/your-firmware/releases)。

## 手动烧录（如果你想本地操作）

如果你不用在线烧录，可以用 `esptool.py` 手动刷：

```bash
# 安装 esptool
pip install esptool

# 擦除整片 flash
esptool.py --chip esp32s3 --port /dev/ttyUSB0 erase_flash

# 烧录（地址与在线烧录一致）
esptool.py --chip esp32s3 --port /dev/ttyUSB0 --baud 460800 \
  --before default_reset --after hard_reset write_flash -z \
  --flash_mode dio --flash_freq 80m --flash_size 8MB \
  0x0000  bootloader.bin \
  0x8000  partitions.bin \
  0xe000  boot_app0.bin \
  0x10000 firmware.bin
```

Windows 用户把 `/dev/ttyUSB0` 换成 `COM3` 之类的端口号。

## 烧录失败怎么办？

1. **串口找不到**：装 CP210x 驱动（板子用的是 CP2102 USB 转串口芯片）
2. **连不上芯片**：按住 BOOT 键不松，点"连接并烧录"，等开始传输时再松开
3. **中途失败**：把波特率降到 115200 重试；换一根 USB 线（尽量短、带数据）
4. **跨域下载失败**：在线烧录页里把 bin 下载到本地，点"选择本地 bin 文件"导入后再烧录
5. 更多问题看 [常见问题 FAQ](product-a/faq)
