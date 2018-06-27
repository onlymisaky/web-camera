class Camera {

  /**
   * @param {{ video: HTMLVideoElement, devicechange?: Function }} { video, devicechange }
   */
  constructor({ video, devicechange }) {
    if (video instanceof HTMLVideoElement) {
      this.video = video;
      this.devicechange = devicechange || null;
      this.running = false;
      this.mediaStream = null;
      window.navigator.mediaDevices.addEventListener('devicechange', this.ondevicechange.bind(this));
    } else {
      throw new Error('没有显示器！');
    }
  }

  //#region 封装基础方法，方便调用，只考虑单个情况

  /**
   * @name 获取用户媒体流
   * @param {MediaStreamConstraints} constraints
   * @returns {Promise<MediaStream>}
   */
  getUserMedia(constraints) {
    if (window.navigator.mediaDevices.getUserMedia) {
      return window.navigator.mediaDevices.getUserMedia(constraints);
    }
    return Promise.reject(new Error('无法打开摄像头！'));
  }

  /**
   * @name 关闭媒体流
   * @param {MediaStream} stream
   * @returns {void}
   */
  stop(stream) {
    stream.getVideoTracks()[0].stop();
  }

  /**
   * @name 修改媒体流
   * @param {MediaStream} stream
   * @param {MediaTrackConstraints} constraints
   * @returns {Promise<Camera>}
   */
  applyConstraints(stream, constraints) {
    return stream.getVideoTracks()[0].applyConstraints(constraints).then(() => this).catch(err => err);
  }

  /**
   * @name 监听设备变化状态，如果当前使用的摄像机被移除，则关闭摄像机
   * @returns {void}
   */
  ondevicechange() {
    return this.getCameraList().then(cameraList => {
      if (this.running) {
        var flag = false;
        for (const camera of cameraList) {
          if (camera.deviceId === this.getSettings(this.mediaStream).deviceId) {
            flag = true;
            break;
          }
        }
        if (!flag) {
          this.close();
        }
      }
      if (this.devicechange) {
        this.devicechange();
      }
    }).catch(err => { throw err; })
  }

  /**
   * @name 获取媒体流的信息
   * @param {MediaStream} stream
   * @returns {MediaTrackSettings}
   */
  getSettings(stream) {
    return stream.getVideoTracks()[0].getSettings();
  }

  /**
   * @name 获取摄像头列表
   * @returns {Promise<MediaDeviceInfo[]>}
   */
  getCameraList() {
    return window.navigator.mediaDevices.enumerateDevices()
      .then(list => list.filter(item => item.kind === 'videoinput'))
      .catch(err => err);
  }

  //#endregion

  /**
   * @name 打开摄像机 
   * @param {MediaStreamConstraints} [constraints={ video: {} }]
   * @returns {Promise<Camera>}
   */
  open(constraints = { video: {} }) {
    if (this.running) {
      return Promise.resolve(this);
    }
    return this.getCameraList().then(cameraList => {
      if (constraints instanceof Event) {
        constraints = { video: {} };
      }
      return cameraList.length
        ? this.getUserMedia(constraints)
        : Promise.reject(new Error('没有摄像头！'));
    }).then(stream => {
      this.running = true;
      this.mediaStream = stream;
      this.video.srcObject = this.mediaStream;
      this.video.play();
      return this;
    }).catch(err => err);
  }

  /**
  * @name 关闭相机
  * @returns {Camera}
  */
  close() {
    if (this.running) {
      this.stop(this.mediaStream);
    }
    this.running = false;
    this.mediaStream = null;
    return this;
  }

  /**
   * @name 切换相机
   * @param {string} deviceId
   * @returns {Promise<Camera>}
   */
  switch(deviceId) {
    if (this.running && deviceId === this.getSettings(this.mediaStream).deviceId) {
      return Promise.resolve(this);
    }
    return this.close().open({ video: { deviceId } });
  }

  /**
   * @name 修改分辨率
   * @param {number} [width=640]
   * @param {number} [height=480]
   * @returns {Promise<Camera>}
   */
  setResolution(width = 640, height = 480) {
    return this.applyConstraints(this.mediaStream, { width, height });
  }

  /**
   * @name 拍照
   * @param {"a4" | "card"} cut 要裁剪的照片类型
   * @returns {HTMLCanvasElement}
   */
  kacha(cut) {
    if (this.running) {
      const settings = this.getSettings(this.mediaStream);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let sx = 0;
      let sy = 0;
      let sWidth = settings.width;
      let sHeight = settings.height;
      let dx = 0;
      let dy = 0;
      let dWidth = settings.width;
      let dHeight = settings.height;
      canvas.width = dWidth;
      canvas.height = dHeight;
      ctx.drawImage(this.video, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      if (cut === "a4" || cut === "card") {
        var imageData = this.cutBlack(canvas);
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.clearRect(0, 0, dWidth, dHeight);
        ctx.putImageData(imageData, 0, 0);
        imageData = null;
      }
      return canvas;
    } else {
      throw new Error('请先打开摄像头！');
    }
  }

  /**
   * @name 将画布黑色边框去除
   * @param {HTMLCanvasElement} canvas
   * @returns {ImageData}
   */
  cutBlack(canvas) {
    var { width, height } = canvas;
    var ctx = canvas.getContext('2d');

    var rowData = ctx.getImageData(0, height / 2, width, 1).data;
    var row = this.getCooLen(rowData);

    var colData = ctx.getImageData(width / 2, 0, 1, height).data;
    var col = this.getCooLen(colData);

    var imageData = ctx.getImageData(row.coordinate, col.coordinate, row.length, col.length);

    width = null;
    height = null;
    ctx = null;
    rowData = null;
    row = null;
    colData = null;
    col = null;

    return imageData;
  }

  /**
   * @name 根据给定的data以黑色为边界，来获取该方向的坐标点和该方向的长度
   * @description 注意：imageData的宽度或高度必须是1,该函数需要优化，优化点：极值情况，从内向外查找，继续向里查找保证结果
   * @param {Uint8ClampedArray} data
   * @param {number} [tolerances=7]
   * @returns {{ coordinate: number, length: number }}
   */
  getCooLen(data, tolerances = 7) {
    const len = data.length;
    let coordinate, n, length, arr;

    arr = []; // 该数组用来存放已经查找出符合要求的坐标点，这些坐标点必须是连续的,若果不连续，立刻重置该数组
    for (var i = 0; i < len; i += 4) {
      if (!this.isBlack(data[i], data[i + 1], data[i + 2])) {

        coordinate = i / 4;

        if (arr.length === 0) {
          arr.push(coordinate);
        }

        else {
          if (arr[arr.length - 1] + 1 === coordinate) {
            arr.push(coordinate);
          } else {
            arr = [];
          }
        }

        if (arr.length === tolerances) {
          coordinate = arr[0];
          console.log(arr);
          arr.forEach((index, val) => {
            index = index * 4;
            console.log(data[index], data[index + 1], data[index + 2], data[index + 3]);
          });
          break;
        }

      }
    }

    arr = [];
    for (var i = len - 1; i >= 0; i -= 4) {
      if (!this.isBlack(data[i - 3], data[i - 2], data[i - 1])) {

        n = (i - 3) / 4;

        if (arr.length === 0) {
          arr.push(n);
        }

        else {
          if (arr[arr.length - 1] - 1 === n) {
            arr.push(n);
          } else {
            arr = [];
          }
        }

        if (arr.length === tolerances) {
          n = arr[0];
          console.log(arr);
          arr.forEach((index, val) => {
            index = index * 4;
            console.log(data[index], data[index + 1], data[index + 2], data[index + 3]);
          });
          break;
        }

      }
    }

    return { coordinate, length: n - coordinate };
  }

  /**
   * @name 是否为黑色
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @param {number} a
   * @returns {Boolean}
   */
  isBlack(r, g, b, a) {
    return r < 150 && g < 150 && b < 150;
  }

}
