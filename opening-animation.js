// 首次开场约 3 秒；清除这个存储项后可重新预览开场。
(() => {
    const storageKey = 'memory-record:intro-seen:v2';
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const readSeen = () => {
        for (const name of ['localStorage', 'sessionStorage']) {
            try { if (window[name].getItem(storageKey) === '1') return true; } catch (_) {}
        }
        return false;
    };
    const remember = () => {
        for (const name of ['localStorage', 'sessionStorage']) {
            try { window[name].setItem(storageKey, '1'); return; } catch (_) {}
        }
    };
    if (readSeen() || reducedMotion.matches) {
        remember();
        return;
    }

    root.classList.add('intro-pending');
    const animations = [];
    let finished = false;
    let started = false;
    let fallback;
    const finish = () => {
        if (finished) return;
        finished = true;
        clearTimeout(fallback);
        root.classList.remove('intro-pending', 'intro-running');
        animations.forEach(animation => animation.cancel());
        reducedMotion.removeEventListener('change', onMotionChange);
        remember();
    };
    const onMotionChange = () => { if (reducedMotion.matches) finish(); };
    reducedMotion.addEventListener('change', onMotionChange);
    // 即使其他脚本异常，也不会一直隐藏页面。
    fallback = setTimeout(finish, 2500);

    window.memoryOpening = {
        start() {
            if (started || finished) return;
            started = true;
            clearTimeout(fallback);
            fallback = setTimeout(finish, 4000);
            const animate = (selector, frames, delay, duration) => {
                const element = document.querySelector(selector);
                if (!element) return;
                animations.push(element.animate(frames, {
                    delay, duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both'
                }));
            };
            try {
                // 0–1500ms：纸面从左向右展开，露出原有深蓝色溶解边缘。
                animate('.mask', [
                    { opacity: 1, clipPath: 'inset(0 100% 0 0)' },
                    { opacity: 1, clipPath: 'inset(0 0% 0 0)' }
                ], 0, 1500);
                // 900–1800ms：标题淡入；1400–2400ms：圆盘、圆心、指针淡入。
                animate('.side-title', [{ opacity: 0 }, { opacity: 1 }], 900, 900);
                animate('.memory-note', [{ opacity: 0 }, { opacity: 1 }], 1100, 900);
                for (const selector of ['.crop', '.center-circle', '.needle']) {
                    animate(selector, [{ opacity: 0 }, { opacity: 1 }], 1400, 1000);
                }
                // 2200–3000ms：移动走道叠层入场，保留鹅原本的行走动画进度。
                animate('.goose-lane', [
                    { opacity: 0, transform: 'translateX(30vw)' },
                    { opacity: 1, transform: 'translateX(0)' }
                ], 2200, 800);
                root.classList.add('intro-running');
                root.classList.remove('intro-pending');
                Promise.all(animations.map(animation => animation.finished)).then(finish, finish);
            } catch (_) {
                finish();
            }
        }
    };
})();
