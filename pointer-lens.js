// Render only the small lens; keep the grayscale backdrop as a static image.
(() => {
    const canvas = document.querySelector('.pointer-lens');
    const background = document.querySelector('.lens-background');
    const image = document.querySelector('.lens-photo');
    if (!canvas || !background || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const settings = { lensOpacity: 0.58, zoom: 1.12, distortion: 0.52, rgbShift: 0.035 };
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const channels = ['#ff0000', '#00ff00', '#0000ff'].map(color => {
        const element = document.createElement('canvas');
        return { canvas: element, ctx: element.getContext('2d'), color };
    });
    if (channels.some(layer => !layer.ctx)) return;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    let rect, width = 1, height = 1, size = 1, textureScale = 1;
    let ready = false, frame = 0, lastTime = 0;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let visibility = 0, targetVisibility = 0, opacity = settings.lensOpacity;

    function resize() {
        if (!image.complete || !image.naturalWidth) return;
        rect = background.getBoundingClientRect();
        width = Math.max(1, Math.round(rect.width));
        height = Math.max(1, Math.round(rect.height));
        size = Math.max(1, Math.floor(Math.min(200, width * 0.44, height * 0.44)));
        canvas.width = canvas.height = size;
        canvas.style.width = canvas.style.height = size + 'px';
        textureScale = Math.min(1, 960 / Math.max(width, height));
        const coverScale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const iw = image.naturalWidth * coverScale;
        const ih = image.naturalHeight * coverScale;
        for (const layer of channels) {
            layer.canvas.width = Math.ceil(width * textureScale);
            layer.canvas.height = Math.ceil(height * textureScale);
            layer.ctx.setTransform(textureScale, 0, 0, textureScale, 0, 0);
            layer.ctx.drawImage(image, (width - iw) / 2, (height - ih) / 2, iw, ih);
            layer.ctx.globalCompositeOperation = 'multiply';
            layer.ctx.fillStyle = layer.color;
            layer.ctx.fillRect(0, 0, width, height);
            layer.ctx.globalCompositeOperation = 'source-over';
        }
        x = targetX = clamp(targetX || width / 2, 0, width);
        y = targetY = clamp(targetY || height / 2, 0, height);
        ready = true;
        wake();
    }
    function drawLens() {
        const half = size / 2;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, size, size);
        ctx.globalCompositeOperation = 'screen';
        channels.forEach((channel, index) => {
            const shift = (index - 1) * settings.rgbShift;
            for (let row = 0; row < size; row += 3) {
                const stripe = Math.min(3, size - row);
                const ny = (row + stripe / 2 - half) / half;
                const curve = Math.max(0, 1 - ny * ny);
                const zoomX = settings.zoom + settings.distortion * curve + shift;
                const zoomY = settings.zoom + settings.distortion * curve * 0.35 + shift;
                const sw = Math.min(width, size / zoomX);
                const sh = Math.min(height, stripe / zoomY);
                const sx = clamp(x - sw / 2, 0, width - sw);
                const sy = clamp(y + (row - half) / zoomY, 0, height - sh);
                ctx.drawImage(channel.canvas, sx * textureScale, sy * textureScale,
                    sw * textureScale, sh * textureScale, 0, row, size, stripe);
            }
        });
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(130,155,189,0.6)';
        ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
        canvas.style.transform = `translate(${x - half}px, ${y - half}px)`;
    }
    function render(time) {
        frame = 0;
        if (!ready || document.hidden) return;
        if (lastTime && time - lastTime < 1000 / 30) { wake(); return; }
        const dt = lastTime ? Math.min(80, time - lastTime) : 33;
        lastTime = time;
        const ease = 1 - Math.exp(-dt / 95);
        x += (targetX - x) * ease;
        y += (targetY - y) * ease;
        visibility += (targetVisibility - visibility) * ease;
        if (motion.matches) visibility = targetVisibility = 0;
        canvas.style.opacity = visibility > 0.005 ? visibility * opacity : 0;
        if (visibility > 0.005) drawLens();
        if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.1
            || Math.abs(targetVisibility - visibility) > 0.005) wake();
    }
    function wake() {
        if (!frame && ready && !document.hidden) frame = requestAnimationFrame(render);
    }
    const hide = () => { targetVisibility = 0; wake(); };
    const move = event => {
        if (!ready || motion.matches) return;
        const px = event.clientX - rect.left, py = event.clientY - rect.top;
        if (px < 0 || px > width || py < 0 || py > height
            || event.target.closest?.('dialog, .music-widget, .center-circle')) { hide(); return; }
        targetX = px; targetY = py;
        if (visibility < 0.005) { x = px; y = py; }
        targetVisibility = 1;
        opacity = event.target.closest?.('.memory-note') ? 0.24 : settings.lensOpacity;
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
    new ResizeObserver(resize).observe(background);
    image.addEventListener('load', resize);
    if (image.complete) resize();
})();
