// 在线烧录应用主逻辑
// 直接以 ESM 方式从 unpkg 引入 esptool-js（固定版本，避免上游 break）
import { ESPLoader, Transport } from 'https://unpkg.com/esptool-js@0.6.0/bundle.js';

const $ = (id) => document.getElementById(id);

const state = {
  products: window.PRODUCTS || [],
  releasesUrl: (window.FLASH_CONFIG && window.FLASH_CONFIG.releasesUrl) || '#',
  currentProduct: null,
  currentVersion: null,
  localFiles: new Map(), // name -> File
  esploader: null,
  transport: null,
  running: false,
};

// ========== 终端日志 ==========
const terminal = (() => {
  const el = $('terminal');
  const write = (txt, cls) => {
    const line = document.createElement('span');
    if (cls) line.className = cls;
    line.textContent = txt + '\n';
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
  };
  return {
    clean() { el.innerHTML = ''; },
    write(txt) { write(txt); },
    writeLine(txt, cls) { write(txt, cls); },
    info(txt) { write(txt, 'info'); },
    ok(txt)   { write(txt, 'ok'); },
    err(txt)  { write(txt, 'err'); },
  };
})();

// ========== 初始化 UI ==========
function initUI() {
  $('releases-link').href = state.releasesUrl;

  // 浏览器检测
  if (!('serial' in navigator)) {
    $('browser-warn').classList.remove('hidden');
  }

  // 产品下拉
  const ps = $('product-sel');
  state.products.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    ps.appendChild(opt);
  });

  ps.addEventListener('change', () => selectProduct(ps.value));
  $('version-sel').addEventListener('change', () => selectVersion());
  $('baud-sel').addEventListener('change', () => {/* 实时读取即可 */});
  $('local-files').addEventListener('change', onPickLocalFiles);
  $('btn-connect').addEventListener('click', onFlashClick);

  // URL 参数预填：?product=xxx&version=xxx
  const params = new URLSearchParams(location.search);
  const initialProduct = params.get('product') || state.products[0]?.id;
  if (initialProduct) {
    ps.value = initialProduct;
  }
  selectProduct(ps.value);

  const initialVersion = params.get('version');
  if (initialVersion) {
    setTimeout(() => {
      const vs = $('version-sel');
      if ([...vs.options].some(o => o.value === initialVersion)) {
        vs.value = initialVersion;
        selectVersion();
      }
    }, 0);
  }
}

function selectProduct(pid) {
  const p = state.products.find(x => x.id === pid);
  if (!p) return;
  state.currentProduct = p;
  state.currentVersion = null;
  state.localFiles.clear();
  $('local-files').value = '';
  $('local-files-status').textContent = '';

  // 芯片信息
  $('product-info').innerHTML = `
    <div>芯片：<code>${p.chip}</code> · Flash 模式：<code>${p.flashMode}</code> ·
    Flash 频率：<code>${p.flashFreq}</code> · Flash 大小：<code>${p.flashSize}</code></div>
    <div>${p.description || ''}</div>
  `;

  // 版本下拉
  const vs = $('version-sel');
  vs.innerHTML = '';
  p.versions.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.tag;
    opt.textContent = v.note ? `${v.tag}  ·  ${v.note}` : v.tag;
    vs.appendChild(opt);
  });
  if (p.baudrate) {
    const baud = String(p.baudrate);
    if ([...$('baud-sel').options].some(o => o.value === baud)) {
      $('baud-sel').value = baud;
    }
  }
  selectVersion();
  updateConnectBtn();
}

function selectVersion() {
  if (!state.currentProduct) return;
  const tag = $('version-sel').value;
  const v = state.currentProduct.versions.find(x => x.tag === tag);
  state.currentVersion = v;
  if (!v) return;

  const totalSize = v.files.reduce((s, f) => s + estimateSize(f.url), 0);
  $('version-info').innerHTML = `
    <div>版本：<b>${v.tag}</b>${v.note ? ` · ${v.note}` : ''}</div>
    <div>共 ${v.files.length} 个 bin 文件
      · <a href="${v.releaseUrl}" target="_blank" rel="noopener">前往 GitHub Release 页面 →</a>
    </div>
  `;
  renderFiles();
}

function estimateSize() { return 0; } // 大小要等下载后才知道

function renderFiles() {
  const v = state.currentVersion;
  if (!v) return;
  const box = $('files-list');
  box.innerHTML = '';
  v.files.forEach(f => {
    const row = document.createElement('div');
    row.className = 'file-row';
    const local = state.localFiles.get(f.name);
    const status = local
      ? `<span class="fstatus ok">已选本地: ${(local.size/1024).toFixed(1)} KB</span>`
      : `<span class="fstatus pending">将从网络下载</span>`;
    row.innerHTML = `
      <span class="addr">0x${f.address.toString(16)}</span>
      <span class="fname">${f.name}.bin</span>
      <span class="furl">${f.url.split('/').pop()}</span>
      ${status}
    `;
    box.appendChild(row);
  });
}

function onPickLocalFiles(ev) {
  const files = ev.target.files;
  const v = state.currentVersion;
  if (!v || !files.length) return;
  let count = 0;
  for (const file of files) {
    // 通过文件名匹配到对应的 name（去掉 .bin 后缀）
    const base = file.name.replace(/\.bin$/i, '');
    if (v.files.some(f => f.name === base)) {
      state.localFiles.set(base, file);
      count++;
    }
  }
  $('local-files-status').textContent = count > 0
    ? `已加载 ${count} 个本地文件（其余仍从网络下载）`
    : '⚠️ 未匹配到对应 bin 文件名，请检查文件名是否一致';
  renderFiles();
}

function updateConnectBtn() {
  $('btn-connect').disabled = !state.currentVersion || state.running;
  $('btn-connect').textContent = state.running ? '⏳ 烧录中...' : '🔌 连接并烧录';
}

// ========== 固件获取 ==========
async function fetchFileAsBuffer(file) {
  // 优先使用用户选中的本地文件
  const local = state.localFiles.get(file.name);
  if (local) {
    terminal.info(`[${file.name}] 使用本地文件`);
    const buf = await local.arrayBuffer();
    return { data: buf, name: file.name, address: file.address };
  }
  terminal.info(`[${file.name}] 正在下载 ${file.url}`);
  try {
    const resp = await fetch(file.url, { mode: 'cors' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const buf = await resp.arrayBuffer();
    terminal.ok(`[${file.name}] 下载完成 (${(buf.byteLength/1024).toFixed(1)} KB)`);
    return { data: buf, name: file.name, address: file.address };
  } catch (e) {
    terminal.err(`[${file.name}] 下载失败：${e.message}`);
    terminal.err(`   提示：请先手动下载该文件，然后在上方"选择本地 bin 文件"处导入。`);
    throw new Error(`文件 ${file.name}.bin 下载失败（可能是跨域限制或网络问题）。请先将所有 bin 文件下载到本地，再通过文件选择器导入后重试。`);
  }
}

// ========== 烧录主流程 ==========
async function onFlashClick() {
  const p = state.currentProduct;
  const v = state.currentVersion;
  if (!p || !v) return;

  if (state.running) return;
  state.running = true;
  updateConnectBtn();
  terminal.clean();
  setStatus('');
  hideProgress();
  terminal.info('====== 开始烧录流程 ======');

  try {
    // 1. 请求串口
    let port;
    try {
      port = await navigator.serial.requestPort();
    } catch (e) {
      if (e.name === 'NotFoundError') {
        terminal.err('用户取消了串口选择');
      } else {
        terminal.err('请求串口失败：' + e.message);
      }
      throw e;
    }

    // 2. 下载所有 bin
    terminal.info('');
    terminal.info('--- 准备固件文件 ---');
    setStatus('正在准备固件文件...');
    const flashItems = [];
    for (const f of v.files) {
      const item = await fetchFileAsBuffer(f);
      flashItems.push({
        data: item.data,
        address: item.address,
      });
    }

    // 3. 建立 Transport
    const transport = new Transport(port, true);
    state.transport = transport;

    const baud = parseInt($('baud-sel').value, 10);
    const loaderOpts = {
      transport,
      baudrate: baud,
      terminal,
      debugLogging: false,
    };
    const esploader = new ESPLoader(loaderOpts);
    state.esploader = esploader;

    // 4. 连接芯片
    setStatus('正在连接芯片...');
    terminal.info('');
    terminal.info('--- 连接芯片 ---');
    const chip = await esploader.main_fn();
    terminal.ok(`检测到芯片：${chip}`);

    // 5. 询问 flash size
    let flashSize = p.flashSize || 'keep';
    try {
      const detected = await esploader.getFlashSize();
      terminal.info(`Flash 大小：配置=${p.flashSize}，检测=${detected}`);
      if (p.flashSize === 'detect') flashSize = detected;
    } catch (e) {
      terminal.info('无法自动检测 flash 大小，使用配置值：' + flashSize);
    }

    // 6. 烧录
    setStatus('正在烧录...');
    terminal.info('');
    terminal.info('--- 开始烧录 ---');
    terminal.info(`波特率: ${baud}, flashMode: ${p.flashMode}, flashFreq: ${p.flashFreq}, flashSize: ${flashSize}, eraseAll: ${$('erase-all').checked}`);
    showProgress();
    setProgress(0);

    // 封装进度回调
    let totalBytes = flashItems.reduce((s, it) => s + it.data.byteLength, 0);
    let writtenBytes = 0;
    const fileProgress = new Map();

    const t0 = performance.now();
    await esploader.writeFlash({
      fileArray: flashItems,
      flashSize,
      flashMode: p.flashMode || 'dio',
      flashFreq: p.flashFreq || '80m',
      eraseAll: $('erase-all').checked,
      compress: true,
      reportProgress: (fileIndex, written, total) => {
        fileProgress.set(fileIndex, { written, total });
        let w = 0;
        for (let i = 0; i < fileIndex; i++) {
          w += flashItems[i].data.byteLength;
        }
        w += written;
        const pct = Math.min(100, Math.round(w / totalBytes * 100));
        setProgress(pct, `${pct}%  (${(w/1024).toFixed(0)} / ${(totalBytes/1024).toFixed(0)} KB)`);
      },
    });
    const t1 = performance.now();
    setProgress(100, '100%');

    // 7. 完成后重启
    terminal.ok('');
    terminal.ok('====== 烧录成功 ======');
    terminal.info(`耗时：${((t1-t0)/1000).toFixed(1)} 秒`);
    setStatus('✅ 烧录完成！开发板即将自动重启进入新固件。', 'success');
    terminal.info('即将硬复位开发板...');
    try { await esploader.hardReset(); } catch (e) { /* 忽略 */ }

  } catch (e) {
    terminal.err('');
    terminal.err('烧录失败：' + (e && e.message ? e.message : e));
    setStatus('❌ 烧录失败，请查看上方日志。', 'error');
  } finally {
    state.running = false;
    updateConnectBtn();
    try {
      if (state.transport) {
        await state.transport.disconnect();
        state.transport = null;
      }
    } catch (_) {}
    state.esploader = null;
  }
}

function setStatus(text, cls) {
  const el = $('status');
  el.textContent = text;
  el.className = 'status' + (cls ? ' ' + cls : '');
}
function showProgress() { $('progress-wrap').classList.remove('hidden'); }
function hideProgress() { $('progress-wrap').classList.add('hidden'); setProgress(0); }
function setProgress(pct, text) {
  $('progress-fill').style.width = pct + '%';
  $('progress-text').textContent = text || (pct + '%');
}

// ========== 启动 ==========
document.addEventListener('DOMContentLoaded', initUI);
