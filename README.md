# GooseNut · Memory Record

记录珍贵回忆的个人相册网站，使用 HTML、CSS 和 JavaScript 编写。

网站地址：https://yeluo-123.github.io/GooseNut.io/

## 编辑页面

- `时间轴1.html`：主要页面、内嵌样式、照片说明和左侧寄语。
- `index.html`：网站首页，自动进入 `时间轴1.html`，无需同步维护两份页面。
- `photos/`：照片和透镜背景图片。
- `goose/`：鹅的行走及悬停图片。
- `opening-animation.js`：首次访问的开场动画。
- `pointer-lens.js`：方形透镜、局部畸变和 RGB 色散。
- `burn-edge.js`：纸面溶解边缘。
- `goose-footprints.js`：鹅的脚印。
- `music-player.js`：Perfect 官方 YouTube 播放器。

浏览器可直接打开 `index.html` 预览。修改照片文字时搜索 `data-description`；修改寄语时搜索“左侧寄语”；透镜背景图片在 `.pointer-lens` 的 `data-image` 中设置。

## 发布

GitHub Pages 使用 `main` 分支的根目录 `/`。提交并推送更新后自动重新发布。`.nojekyll` 让 GitHub 直接提供静态文件。

飞鸟动画依赖在线 Three.js 和 Vanta.js，音乐播放器需要访问 YouTube。开场动画在同一浏览器中仅首次访问播放。

## 视觉参考

- [Codrops Seam Transitions](https://tympanus.net/Demos/SeamTransitions/)
- [Codrops Pointer Square Lens Distortion](https://tympanus.net/Tutorials/PointerSquareLensDistortion/)
- [Vanta Birds](https://www.vantajs.com/?effect=birds)

照片和文字为个人回忆素材，未授予转载许可。
