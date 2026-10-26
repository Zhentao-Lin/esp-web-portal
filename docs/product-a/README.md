# 产品 A · 智能开关

> ESP32-S3 智能开关开发板 · 支持 Wi-Fi / BLE · 继电器控制 · 电流采样

本产品是一款基于 ESP32-S3 的智能开关开发板，适用于智能家居照明、插座开关、小功率电器控制等场景。

- **主控芯片**：ESP32-S3-WROOM-1-N8R8（8MB Flash + 8MB PSRAM）
- **继电器通道**：2 路，最大 10A / 250VAC
- **采样**：HLW8032 电流/电压/功率计量芯片
- **供电**：Type-C 5V 或 3.3V 排针
- **板载按键**：BOOT、RST、USER 各 1
- **板载 LED**：WS2812 RGB × 1，电源指示 × 1

## 文档目录

- [快速上手](product-a/quickstart) — 5 分钟点亮你的第一盏灯
- [接线说明](product-a/wiring) — 继电器与强电接线注意事项
- [固件说明 / 烧录](product-a/firmware) — 各版本固件介绍 + 在线烧录入口
- [常见问题](product-a/faq) — 烧录失败、连不上 Wi-Fi、继电器异响等
- [进阶使用](product-a/advanced) — Home Assistant / MQTT 对接、二次开发
