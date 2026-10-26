# 常见问题 FAQ · 产品 A

## 烧录问题

### Q: 点击"连接"后串口列表里是空的？
请先安装 **CP210x USB 转串口驱动**：
- [Silicon Labs 官方驱动下载](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)
- 安装后重新插拔 USB 线，Windows 设备管理器里应能看到 "Silicon Labs CP210x" 端口

### Q: 一直显示 "Connecting..." 不动？
1. 按住 BOOT 键不放
2. 点一次 RST（EN）键
3. 再点"连接并烧录"，等看到"开始传输"后松开 BOOT

### Q: 烧录到一半失败 / timeout
- 把波特率从 460800 降到 **115200**
- 换一根短一点的 USB 数据线（手机原装线很多是能传数据的，便宜的充电线不行）
- 别用 USB 集线器，直接插电脑 USB 口
- 如果是台式机，用后置 USB 口

### Q: 提示文件下载失败？
因为 GitHub Releases 文件有跨域限制，部分网络环境下可能拉不到。
解决方法：到 [Releases 页面](https://github.com/your-name/your-firmware/releases) 把所有 bin 文件下载到本地一个文件夹里，
回到烧录页展开"查看/替换 bin 文件"，点"选择本地 bin 文件"把这几个 .bin 一次性选中即可。

## 使用问题

### Q: 连上 Wi-Fi 后怎么找到设备的 IP？
- 在路由器后台看设备列表（设备名类似 `espressif` / `switch-a-xxxx`）
- 或者串口 monitor 里会打印 IP 地址：`baud 115200`

### Q: 继电器接通时会"咔哒"响一声是正常的吗？
正常的，这是磁保持继电器动作的声音。如果接通后**连续哒哒哒**响，说明供电电流不够——换 5V/2A 电源。

### Q: HLW8032 读出来的功率不准？
固件 v1.2.0 已经在出厂时做过校准。如果换了电流采样电阻，需要在 Web 控制台「校准」页面手动输入校准系数。

### Q: 如何恢复出厂设置？
按住 USER 键上电，保持 5 秒直到 RGB 灯变红，松开即可。所有 Wi-Fi 配置和 MQTT 设置会被清空。
