// 方形透镜：淡灰照片底图 + 局部凸透镜畸变 + 径向 RGB 色散。
// 交互参考：https://tympanus.net/Tutorials/PointerSquareLensDistortion/
// 使用 Canvas 2D 绘制，不读取照片像素，直接双击 HTML 打开也能运行。
(() => {
    const canvas = document.querySelector('.pointer-lens');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 可调整：背景照片浓度、透镜浓度、放大倍数、畸变和色散强度。
    const settings = { backgroundOpacity: 0.085, lensOpacity: 0.58, zoom: 1.12, distortion: 0.52, rgbShift: 0.035 };
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const image = new Image();
    const makeLayer = () => {
        const element = document.createElement('canvas');
        return { canvas: element, ctx: element.getContext('2d') };
    };
    const gray = makeLayer();
    const channels = ['#ff0000', '#00ff00', '#0000ff'].map(color => ({ ...makeLayer(), color }));
    const lens = makeLayer();
    if (!gray.ctx || !lens.ctx || channels.some(layer => !layer.ctx)) return;

    let width = 1, height = 1, size = 180;
    let ready = false, frame = 0, lastTime = 0;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let visibility = 0, targetVisibility = 0;
    let lensOpacity = settings.lensOpacity;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    const cover = context => {
        const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const w = image.naturalWidth * scale;
        const h = image.naturalHeight * scale;
        context.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
    };
    const resize = () => {
        if (!ready) return;
        const rect = canvas.getBoundingClientRect();
        width = Math.max(1, Math.round(rect.width));
        height = Math.max(1, Math.round(rect.height));
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        size = Math.max(1, Math.floor(Math.min(220, width * 0.44, height * 0.44)));
        lens.canvas.width = lens.canvas.height = size;
        for (const layer of [gray, ...channels]) {
            layer.canvas.width = width;
            layer.canvas.height = height;
            if (layer === gray) layer.ctx.filter = 'grayscale(1)';
            cover(layer.ctx);
            layer.ctx.filter = 'none';
            if (layer.color) {
                layer.ctx.globalCompositeOperation = 'multiply';
                layer.ctx.fillStyle = layer.color;
                layer.ctx.fillRect(0, 0, width, height);
                layer.ctx.globalCompositeOperation = 'source-over';
            }
        }
        x = targetX = clamp(targetX || width / 2, 0, width);
        y = targetY = clamp(targetY || height / 2, 0, height);
        wake();
    };

    function drawLens() {
        const half = size / 2;
        const lc = lens.ctx;
        lc.globalCompositeOperation = 'source-over';
        lc.fillStyle = '#000';
        lc.fillRect(0, 0, size, size);
        lc.globalCompositeOperation = 'screen';
        // 按水平扫描线重采样；各行缩放不同，产生凸透镜曲率。
        // 三个颜色通道使用不同缩放，色散从镜头中心向外逐渐增强。
        channels.forEach((channel, index) => {
            const shift = (index - 1) * settings.rgbShift;
            for (let row = 0; row < size; row++) {
                const ny = (row + 0.5 - half) / half;
                const curve = Math.max(0, 1 - ny * ny);
                const zoomX = settings.zoom + settings.distortion * curve + shift;
                const zoomY = settings.zoom + settings.distortion * curve * 0.35 + shift;
                const sw = Math.min(width, size / zoomX);
                const sh = Math.min(height, 1 / zoomY);
                const sx = clamp(x - sw / 2, 0, width - sw);
                const sy = clamp(y + (row - half) / zoomY, 0, height - sh);
                lc.drawImage(channel.canvas, sx, sy, sw, sh, 0, row, size, 1);
            }
        });
        lc.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = visibility * lensOpacity;
        ctx.drawImage(lens.canvas, x - half, y - half, size, size);
        ctx.globalAlpha = visibility * 0.35;
        ctx.strokeStyle = '#829bbd';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - half + 0.5, y - half + 0.5, size - 1, size - 1);
        ctx.globalAlpha = 1;
    }

    function render(time) {
        frame = 0;
        if (!ready || document.hidden) return;
        const dt = lastTime ? Math.min(64, time - lastTime) : 16;
        lastTime = time;
        const ease = 1 - Math.exp(-dt / 95);
        x += (targetX - x) * ease;
        y += (targetY - y) * ease;
        visibility += (targetVisibility - visibility) * ease;
        if (motion.matches) visibility = targetVisibility = 0;
        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = settings.backgroundOpacity;
        ctx.drawImage(gray.canvas, 0, 0);
        ctx.globalAlpha = 1;
        if (visibility > 0.005) drawLens();
        // 静止或离开后停止绘制，避免和右侧飞鸟长期争用渲染资源。
        if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.1
            || Math.abs(targetVisibility - visibility) > 0.005) wake();
    }
    function wake() {
        if (!frame && ready && !document.hidden) frame = requestAnimationFrame(render);
    }
    const hide = () => { targetVisibility = 0; wake(); };
    const move = event => {
        if (!ready || motion.matches) return;
        const rect = canvas.getBoundingClientRect();
        const px = event.clientX - rect.left;
        const py = event.clientY - rect.top;
        if (px < 0 || px > rect.width || py < 0 || py > rect.height
            || event.target.closest?.('dialog, .music-widget, .center-circle')) {
            hide();
            return;
        }
        targetX = px;
        targetY = py;
        if (visibility < 0.005) { x = px; y = py; }
        targetVisibility = 1;
        // 正文下方的彩色更淡，确保阅读清晰。
        lensOpacity = event.target.closest?.('.memory-note') ? 0.24 : settings.lensOpacity;
        wake();
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', move, { passive: true });
    window.addEventListener('pointerup', event => { if (event.pointerType === 'touch') hide(); });
    window.addEventListener('pointercancel', hide);
    window.addEventListener('blur', hide);
    document.documentElement.addEventListener('pointerleave', hide);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { cancelAnimationFrame(frame); frame = 0; targetVisibility = 0; }
        else { lastTime = 0; wake(); }
    });
    motion.addEventListener('change', hide);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    image.onload = () => { ready = true; resize(); };
    // 加载失败时只保留原有纸面，不影响卡片、鹅或开场。
    image.onerror = () => { canvas.hidden = true; observer.disconnect(); };
    image.src = canvas.dataset.image;
})();
