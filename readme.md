# Camera

对 `window.navigator.mediaDevices` 简单封装。

## 用法

1. 需要 `http ` 支持，或者 `file` 协议
2. 同时需要用户同意打开摄像头

如果想看立刻到运行效果有，可以克隆本仓库代码，然后用 `chrome` 打开 `index.html` 文件即可。

## API

函数 | 参数 | 返回值 | 说明
--- | --- | --- | ---
open | [constraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints) | `Promise<this>` |打开相机
close | `无` | `实例`  | 关闭相机 |
switch | `deviceId`: 媒体设备id | `Promise<this>` | 切换摄像头，可以通过 `getCameraList` 获取所有摄像头
setResolution | `width`: 照片宽度<br>`height`:照片高度 |  `Promise<this>` |设置拍出来的照片实际分辨率
kacha | `无` | `HTMLCanvasElement` | 拍照，返回一个 `canvas` dom对象
getCameraList | `无` | Promise<[MediaDeviceInfo](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDeviceInfo)[]> | 获取可用摄像头列表
getSettings | `stream` | [MediaTrackSettings](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints) | 获取当前正在使用的摄像头的媒体流设置信息，参数 `stream` 可通过 `实例.mediaStream` 获取

## 提示

如果希望在生产环境中使用，请用打包工具(如：[webpack](https://webpack.js.org/)、[rollup](https://rollupjs.org/guide/en)、[gulp](https://gulpjs.com/))编译为 `ES5` 语法在使用。
