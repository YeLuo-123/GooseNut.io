(() => {
    // 更换歌曲时修改这里；歌名框会自动适应文字长度。
    const track = {
        title: 'Perfect',
        artist: 'Ed Sheeran',
        videoId: '2Vv-BfVoq4g'
    };
    const widget = document.querySelector('.music-widget');
    const toggle = document.getElementById('music-toggle');
    const panel = document.getElementById('music-panel');
    const embed = document.getElementById('music-embed');
    const closeButton = document.getElementById('music-close');
    const source = document.getElementById('music-source');
    if (!widget || !toggle || !panel || !embed || !closeButton || !source) return;

    const label = `${track.title} · ${track.artist}`;
    widget.querySelectorAll('[data-track-label]').forEach(element => {
        element.textContent = label;
    });
    source.href = `https://www.youtube.com/watch?v=${encodeURIComponent(track.videoId)}`;
    toggle.setAttribute('aria-label', `播放 ${label}`);

    const closePlayer = () => {
        // 移除 iframe，确保收起后音乐也停止。
        embed.replaceChildren();
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', `播放 ${label}`);
        toggle.focus({ preventScroll: true });
    };

    toggle.addEventListener('click', () => {
        if (!panel.hidden) {
            closePlayer();
            return;
        }

        const player = document.createElement('iframe');
        player.title = `${label} 官方音乐视频`;
        player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        player.allowFullscreen = true;
        player.referrerPolicy = 'strict-origin-when-cross-origin';
        player.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(track.videoId)}?autoplay=1&playsinline=1&rel=0`;
        embed.replaceChildren(player);
        panel.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', `关闭 ${label} 播放器`);
        closeButton.focus({ preventScroll: true });
    });

    closeButton.addEventListener('click', closePlayer);
    widget.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !panel.hidden) {
            event.stopPropagation();
            closePlayer();
        }
    });
})();
