// 脚印留在走道上，不随鹅移动；每次换脚留下一个渐变圆。
(() => {
    const lane = document.querySelector('.goose-lane');
    const goose = document.querySelector('.goose');
    const trail = document.querySelector('.goose-trail');
    if (!lane || !goose || !trail) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let previousX = null;
    let leftFoot = false;

    const clearTrail = () => {
        trail.replaceChildren();
        previousX = null;
    };
    window.addEventListener('resize', clearTrail);
    reducedMotion.addEventListener('change', clearTrail);

    window.setInterval(() => {
        if (document.hidden || reducedMotion.matches || goose.matches(':hover')
            || document.documentElement.classList.contains('intro-pending')
            || document.documentElement.classList.contains('intro-running')) {
            previousX = null;
            return;
        }

        const laneRect = lane.getBoundingClientRect();
        const gooseRect = goose.getBoundingClientRect();
        const x = gooseRect.left - laneRect.left;
        const movingLeft = previousX !== null && x < previousX - 0.5;
        previousX = x;
        // 暂停或从走道右侧重新入场的瞬间，不留下重复脚印。
        if (!movingLeft) return;

        const footX = x + gooseRect.width * (leftFoot ? 0.60 : 0.76);
        if (footX < 0 || footX > laneRect.width) return;
        const footY = gooseRect.bottom - laneRect.top
            - Math.max(8, gooseRect.height * 0.045) + (leftFoot ? -3 : 3);

        const footprint = document.createElement('span');
        footprint.className = 'goose-footprint';
        footprint.style.left = `${footX}px`;
        footprint.style.top = `${footY}px`;
        footprint.addEventListener('animationend', () => footprint.remove(), { once: true });
        trail.append(footprint);
        leftFoot = !leftFoot;
    }, 280);
})();
