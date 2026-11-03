# GooseNut · Memory Record

记录珍贵回忆的个人相册网站，使用 HTML、CSS 和 JavaScript 编写。

网站地址：https://yeluo-123.github.io/GooseNut.io/

## 编辑页面

- `时间轴1.html`：主要页面、内嵌样式、照片说明和左侧寄语。
- `index.html`：网站首页，自动进入 `时间轴1.html`，无需同步维护两份页面。
- `photos/`：照片和透镜背景图片。
- `assets/`：网页实际加载的 WebP 缩略图、按需加载的预览图及其他轻量图片，原图仍保留在原目录。
- `goose/`：鹅的行走及悬停图片。
- `opening-animation.js`：首次访问的开场动画。
- `pointer-lens.js`：方形透镜、局部畸变和 RGB 色散。
- `burn-edge.js`：纸面溶解边缘。
- `goose-footprints.js`：鹅的脚印。
- `music-player.js`：Perfect 官方 YouTube 播放器。
- `birds-background.js`：飞鸟初始化及低配置适配；`vendor/` 保存 Three.js、Vanta.js 及许可证。

浏览器可直接打开 `index.html` 预览。修改照片文字时搜索 `data-description`；修改寄语时搜索“左侧寄语”；透镜背景图片在 `.lens-photo` 的 `src` 中设置。

## 发布

GitHub Pages 使用 `main` 分支的根目录 `/`。提交并推送更新后自动重新发布。`.nojekyll` 让 GitHub 直接提供静态文件。

Three.js 和 Vanta.js 随网站提供，音乐播放器需要访问 YouTube。开场动画在同一浏览器中仅首次访问播放。

转盘尺寸同时受窗口宽度和高度限制。透镜最多以 30fps 绘制 200×200 像素的局部画布；飞鸟仅渲染右半屏，隐藏标签页后停止。圆盘使用轻量渐变代替大尺寸 GIF，溶解边缘保留静态轮廓以减少整屏重绘。

## 视觉参考

- [Codrops Seam Transitions](https://tympanus.net/Demos/SeamTransitions/)
- [Codrops Pointer Square Lens Distortion](https://tympanus.net/Tutorials/PointerSquareLensDistortion/)
- [Vanta Birds](https://www.vantajs.com/?effect=birds)

照片和文字为个人回忆素材，未授予转载许可。
