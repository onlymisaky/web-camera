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
   * @returns {HTMLCanvasElement}
   */
  kacha() {
    if (this.running) {
      const settings = this.getSettings(this.mediaStream);
      const canvas = document.createElement('canvas');
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
      canvas.getContext('2d').drawImage(this.video, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      return canvas;
    } else {
      throw new Error('请先打开摄像头！');
    }
  }

}
