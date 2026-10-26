# esp-web-portal

一个零构建、直接部署到 GitHub Pages 的静态站点，包含：

1. **Docsify 文档站**（`docs/`）——放所有产品的教程
2. **独立网页烧录工具**（`flash/`）——基于 esptool-js，固件通过 GitHub Releases 外链分发，按"产品 → 版本"选择后一键烧录
3. **根入口**（`index.html`）——首页，通往文档站、烧录工具、GitHub Releases

## 快速开始

```bash
# 本地预览（二选一）
python3 -m http.server 8080
# 或
npx docsify serve docs
```

浏览器打开 `http://localhost:8080`。

## 目录结构

```
/
├── index.html                    # 站点首页
├── README.md                     # 本文件
├── docs/                         # Docsify 文档站（部署到 GitHub Pages 时把 docs/ 设为根）
│   ├── index.html                # Docsify 入口
│   ├── _sidebar.md               # 侧边栏（每个产品一组）
│   ├── _navbar.md                # 顶部导航
│   ├── README.md                 # 文档首页
│   ├── _coverpage.md             # 封面（可选）
│   ├── _media/                   # 放图片/示意图
│   ├── product-a/                # 产品 A 的教程目录
│   │   ├── README.md             # 产品 A 总览
│   │   ├── quickstart.md         # 快速开始
│   │   └── advanced.md           # 进阶教程
│   └── product-b/                # 产品 B 的教程目录
│       ├── README.md
│       └── quickstart.md
└── flash/                        # 网页烧录工具（独立子应用）
    ├── index.html                # 烧录页
    ├── config.js                 # ← 你唯一需要改的文件：产品/固件清单
    ├── app.js                    # 烧录逻辑（一般不用动）
    └── style.css                 # 烧录页样式
```

## 把它接到你的 GitHub 仓库

1. 把整个目录推到一个 GitHub 仓库，例如 `your-name/your-iot-site`
2. 仓库 Settings → Pages → Source 选 `Deploy from a branch`，Branch 选 `main`，folder 选 `/docs`
3. 但注意：默认 `/docs` 只能服务文档站。**推荐**把整个仓库作为 Pages 根目录：
   - 在仓库根放一个 `.nojekyll`（已经准备好了）
   - Pages 的 folder 选 `/ (root)`
   - 这样 `/`、`/docs/`、`/flash/` 都能直接访问
4. 文档站地址：`https://your-name.github.io/your-iot-site/docs/`
5. 烧录工具地址：`https://your-name.github.io/your-iot-site/flash/`
6. 首页地址：`https://your-name.github.io/your-iot-site/`

## 添加新产品 / 新固件

所有配置集中在 `flash/config.js`，改这一个文件即可：

```js
window.PRODUCTS = [
  {
    id: 'product-a',
    name: '产品 A',
    description: '一句话介绍',
    chip: 'ESP32-S3',
    flashMode: 'dio',
    flashFreq: '80m',
    flashSize: '8MB',
    versions: [
      {
        name: 'v1.2.0 (stable)',
        tag: 'product-a-v1.2.0',     // GitHub Release 的 tag
        releaseUrl: 'https://github.com/your-name/your-firmware/releases/tag/product-a-v1.2.0',
        files: [
          // 每个 bin 文件：烧录地址 + GitHub Release 里 asset 的直链
          { address: 0x0000, url: 'https://github.com/.../releases/download/.../bootloader.bin', name: 'bootloader' },
          { address: 0x8000, url: 'https://github.com/.../releases/download/.../partitions.bin', name: 'partitions' },
          { address: 0x10000, url: 'https://github.com/.../releases/download/.../firmware.bin', name: 'app' },
        ],
      },
    ],
  },
];
```

然后：
- 在 `docs/` 下新建 `产品名/` 目录写教程
- 在 `docs/_sidebar.md` 加对应链接即可

## 浏览器要求

烧录工具基于 Web Serial API，**必须使用 Chrome / Edge / Opera 等 Chromium 内核浏览器**，并通过 HTTPS 或 localhost 访问。
