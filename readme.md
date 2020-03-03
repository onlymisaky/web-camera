# Camera

网页版相机

# TODO

- [ ] 打包
- [ ] 在线用例
- [ ] 完整的 README

## 用法

1. 需要 `https` 支持，或者 `file` 协议
2. 同时需要用户同意打开摄像头

```javascript
const camera = new Camera(document.querySelector('video'));

(async () => {
  try {
    const cameraList = await camera.getCameraList();
    if (cameraList) {
      await camera.open({ video: { deviceId: cameraList[0].deviceId } });
      const canvas = await camera.md2Canvas();
      document.querySelector('img').src = canvas.toDataURL('Image/jpeg', 1)
    }
  } catch (err) {
    throw err
  }
})();
```

## API

函数 | 参数 | 返回值 | 说明
--- | --- | --- | ---
getCameraList | --- | Promise<MediaDeviceInfo[]> | 获取摄像头列表
open | constraints:MediaStreamConstraints, force: boolean | MediaStream  | 打开相机, force 默认为 false， 传 true 表示重新打开 |
close | -- | void| 关闭相机
md2Canvas | -- |  HTMLCanvasElement | 截取图片 |
destroy | -- | void | 销毁
