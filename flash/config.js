/**
 * ============================================================
 *  产品 / 固件清单 —— 这是你唯一需要修改的配置文件
 * ============================================================
 *
 *  字段说明：
 *    id          产品标识（用英文/连字符，用于 URL 参数）
 *    name        显示名
 *    description 一句话描述
 *    chip        目标芯片型号，如 "ESP32" / "ESP32-S3" / "ESP32-C3" / "ESP8266"
 *    flashMode   dout / dio / qout / qio
 *    flashFreq   40m / 80m / 26m / 20m
 *    flashSize   detect / 1MB / 2MB / 4MB / 8MB / 16MB ...
 *    baudrate    默认 460800，不稳定可降到 115200
 *    versions[]  固件版本列表，最新的放最前面
 *      tag         版本号（用于显示 + URL 参数）
 *      releaseUrl  对应 GitHub Release 页面
 *      files[]     要烧录的 bin 文件
 *        address   烧录起始地址，十六进制数字（不用加引号）
 *        url       bin 文件下载地址（GitHub Release asset 直链）
 *        name      文件标签（显示用）
 *        sha256    可选，填了会在下载后做完整性校验
 */

window.PRODUCTS = [
  {
    id: 'product-a',
    name: '产品 A（示例：智能开关）',
    description: 'ESP32-S3 智能开关开发板',
    chip: 'ESP32-S3',
    flashMode: 'dio',
    flashFreq: '80m',
    flashSize: '8MB',
    baudrate: 460800,
    versions: [
      {
        tag: 'v1.2.0',
        note: '稳定版，推荐',
        releaseUrl: 'https://github.com/your-name/your-firmware/releases/tag/product-a-v1.2.0',
        files: [
          { address: 0x0000,  url: 'https://github.com/your-name/your-firmware/releases/download/product-a-v1.2.0/bootloader.bin', name: 'bootloader' },
          { address: 0x8000,  url: 'https://github.com/your-name/your-firmware/releases/download/product-a-v1.2.0/partitions.bin', name: 'partitions' },
          { address: 0xe000,  url: 'https://github.com/your-name/your-firmware/releases/download/product-a-v1.2.0/boot_app0.bin', name: 'boot_app0' },
          { address: 0x10000, url: 'https://github.com/your-name/your-firmware/releases/download/product-a-v1.2.0/firmware.bin', name: 'firmware' },
        ],
      },
      {
        tag: 'v1.1.0',
        note: '旧稳定版',
        releaseUrl: 'https://github.com/your-name/your-firmware/releases/tag/product-a-v1.1.0',
        files: [
          { address: 0x0000,  url: 'https://github.com/your-name/your-firmware/releases/download/product-a-v1.1.0/bootloader.bin', name: 'bootloader' },
          { address: 0x8000,  url: 'https://github.com/your-name/your-firmware/releases/download/product-a-v1.1.0/partitions.bin', name: 'partitions' },
          { address: 0xe000,  url: 'https://github.com/your-name/your-firmware/releases/download/product-a-v1.1.0/boot_app0.bin', name: 'boot_app0' },
          { address: 0x10000, url: 'https://github.com/your-name/your-firmware/releases/download/product-a-v1.1.0/firmware.bin', name: 'firmware' },
        ],
      },
    ],
  },
  {
    id: 'product-b',
    name: '产品 B（示例：环境传感器）',
    description: 'ESP32-C3 温湿度+光照节点',
    chip: 'ESP32-C3',
    flashMode: 'dio',
    flashFreq: '80m',
    flashSize: '4MB',
    baudrate: 460800,
    versions: [
      {
        tag: 'v2.0.0',
        note: '最新版（含 MQTT 支持）',
        releaseUrl: 'https://github.com/your-name/your-firmware/releases/tag/product-b-v2.0.0',
        files: [
          { address: 0x0000,  url: 'https://github.com/your-name/your-firmware/releases/download/product-b-v2.0.0/bootloader.bin', name: 'bootloader' },
          { address: 0x8000,  url: 'https://github.com/your-name/your-firmware/releases/download/product-b-v2.0.0/partitions.bin', name: 'partitions' },
          { address: 0x10000, url: 'https://github.com/your-name/your-firmware/releases/download/product-b-v2.0.0/firmware.bin', name: 'firmware' },
        ],
      },
    ],
  },
];

/**
 * 全局配置
 */
window.FLASH_CONFIG = {
  releasesUrl: 'https://github.com/your-name/your-firmware/releases',
  docsBase:    '../docs/',   // 从 flash/ 跳回文档站的相对路径
};
