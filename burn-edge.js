// 为白色遮罩生成可循环的溶解纹理；深蓝色焦痕和透明轮廓使用同一份噪声。
(() => {
    const panel = document.querySelector('.mask');
    if (!panel) return;

    const width = 144;
    const height = 1024;
    const edgeColor = [13, 9, 53]; // #0d0935，与中心圆的深蓝色一致。
    const alphaCanvas = document.createElement('canvas');
    const colorCanvas = document.createElement('canvas');
    alphaCanvas.width = colorCanvas.width = width;
    alphaCanvas.height = colorCanvas.height = height;
    const alphaContext = alphaCanvas.getContext('2d');
    const colorContext = colorCanvas.getContext('2d');
    if (!alphaContext || !colorContext) return;

    const alphaImage = alphaContext.createImageData(width, height);
    const colorImage = colorContext.createImageData(width, height);
    const smooth = value => value * value * (3 - 2 * value);
    const hash = (x, y) => {
        const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        return value - Math.floor(value);
    };
    // Y 轴周期噪声保证纹理上下衔接，滚动到下一张纹理时不会跳变。
    const noise = (x, y, period) => {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const fx = smooth(x - ix);
        const fy = smooth(y - iy);
        const y0 = ((iy % period) + period) % period;
        const y1 = (y0 + 1) % period;
        const top = hash(ix, y0) * (1 - fx) + hash(ix + 1, y0) * fx;
        const bottom = hash(ix, y1) * (1 - fx) + hash(ix + 1, y1) * fx;
        return top * (1 - fy) + bottom * fy;
    };

    for (let y = 0; y < height; y++) {
        const boundary = width * 2 / 3
            + (noise(3.7, y / 128, 8) - 0.5) * 38
            + (noise(9.1, y / 32, 32) - 0.5) * 20
            + (noise(4.3, y / 8, 128) - 0.5) * 9;

        for (let x = 0; x < width; x++) {
            const coarse = noise(x / 13, y / 16, 64);
            const fine = noise(x / 4, y / 4, 256);
            const distance = boundary - x
                + (coarse - 0.5) * 18
                + (fine - 0.5) * 8
                + (hash(x, y) - 0.5) * 2.5;
            const coverage = smooth(Math.max(0, Math.min(1, (distance + 0.7) / 1.4)));
            const index = (y * width + x) * 4;
            alphaImage.data[index] = 255;
            alphaImage.data[index + 1] = 255;
            alphaImage.data[index + 2] = 255;
            alphaImage.data[index + 3] = Math.round(coverage * 255);

            // 深蓝色焦痕向白色遮罩内部淡出。
            const rim = Math.exp(-Math.max(0, distance) / 2.2);
            const char = Math.exp(-Math.max(0, distance) / 8) * 0.2;
            const tint = Math.min(1, (rim + char) * (0.8 + coarse * 0.2));
            colorImage.data[index] = Math.round(255 + (edgeColor[0] - 255) * tint);
            colorImage.data[index + 1] = Math.round(255 + (edgeColor[1] - 255) * tint);
            colorImage.data[index + 2] = Math.round(255 + (edgeColor[2] - 255) * tint);
            colorImage.data[index + 3] = 255;
        }
    }

    alphaContext.putImageData(alphaImage, 0, 0);
    colorContext.putImageData(colorImage, 0, 0);
    panel.style.setProperty('--burn-alpha', `url("${alphaCanvas.toDataURL()}")`);
    panel.style.setProperty('--burn-color', `url("${colorCanvas.toDataURL()}")`);
    panel.classList.add('has-burn-edge');
})();
