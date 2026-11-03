// 飞鸟只绘制右半屏；小屏/低配置设备使用更少的鸟和更低的分辨率。
(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let effect = null;
    function update() {
        if (document.hidden || motion.matches) {
            if (effect) effect.destroy();
            effect = null;
            return;
        }
        if (effect || !window.VANTA?.BIRDS) return;
        const light = window.matchMedia('(pointer: coarse)').matches
            || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
        try {
            effect = VANTA.BIRDS({
                el: '#vanta-bg', mouseControls: true, touchControls: true, gyroControls: false,
                minHeight: 100, minWidth: 100, scale: light ? 2.5 : 2, scaleMobile: 2.5,
                backgroundAlpha: 1, backgroundColor: 0x110921,
                color1: 0x0f60e0, color2: 0x76ffca, colorMode: 'varianceGradient',
                birdSize: 2.6, wingSpan: 23, speedLimit: 5, separation: 73,
                alignment: 10, cohesion: 20, quantity: light ? 2 : 3
            });
        } catch (error) {
            console.warn('飞鸟动画未能启动，保留静态背景。', error);
        }
    }
    document.addEventListener('visibilitychange', update);
    motion.addEventListener('change', update);
    if ('requestIdleCallback' in window) window.requestIdleCallback(update, { timeout: 1800 });
    else window.setTimeout(update, 300);
})();
