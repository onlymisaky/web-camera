class Camera {

  /**
   * @param {HTMLVideoElement} video
   */
  constructor(video) {
    if (video instanceof HTMLVideoElement) {
      this.video = video;
      this.runnig = false;
      this.mediaStream = null;
      this.deviceId = '';
      // todo 需要自动适配
      this.constraints = {
        video: {
          // 比例最好和摄像机一样
          // 面的比例是按照A4纸大小设定的
          height: 2097,
          width: 1470,
          frameRate: {
            max: 120,
            min: 15,
            ideal: 60,
          }
        }
      }
      window.navigator.mediaDevices.addEventListener('devicechange', this.ondevicechange.bind(this));
    } else {
      throw new Error('NO Video Element!!');
    }
  }

  /**
   * @name 打开摄像机 
   * @returns {Promise<Camera>}
   */
  open() {
    if (this.runnig) {
      return Promise.resolve(this);
    }
    const getUserMedia = window.navigator.mediaDevices.getUserMedia;
    if (getUserMedia) {
      return window.navigator.mediaDevices.getUserMedia(this.constraints).then(stream => {
        this.runnig = true;
        this.mediaStream = stream;
        this.deviceId = stream.getVideoTracks()[0].getSettings().deviceId;
        this.video.srcObject = this.mediaStream;
        this.video.play();
        return this;
      }).catch(err => err);
    } else {
      return Promise.reject('无法打开摄像头！');
    }

  }

  /**
   * @name 缩放
   * @param {MediaStream} stream
   * @param {MediaTrackConstraints} constraints
   * @returns {Promise<Camera>}
   */
  zoom(stream, constraints) {
    if (this.runnig) {
      return stream.getVideoTracks()[0].applyConstraints().then(() => this).catch(err => err);
    } else {
      throw new Error('请先打开摄像头！');
    }
  }

  /**
   * @name 拍照
   *
   */
  kacha() {
    if (this.runnig) {
      const canvas = document.createElement('canvas');
      const vWidth = this.video.width;
      const vHeight = this.video.height;
      const { aspectRatio } = this.mediaStream.getVideoTracks()[0].getSettings()

      // ??? 我怎么这么傻 ???
      // let sx, sy, sWidth, sHeight;
      // let dx = 0;
      // let dy = 0;
      // let dWidth = this.constraints.video.width;
      // let dHeight = this.constraints.video.height;
      // if (vWidth / vHeight < aspectRatio) {
      //   sHeight = vHeight;
      //   sWidth = vHeight * aspectRatio;
      //   sx = (vWidth - sWidth) / 2;
      //   sy = 0;
      // } else {
      //   sWidth = vWidth;
      //   sHeight = v / aspectRatio;
      //   sx = 0;
      //   sy = (vHeight - sHeight) / 2;
      // }

      let sx = 0;
      let sy = 0;
      let sWidth = this.constraints.video.width;
      let sHeight = this.constraints.video.height;
      let dx = 0; let dy = 0;
      let dWidth = this.constraints.video.width;
      let dHeight = this.constraints.video.height;
      canvas.width = dWidth;
      canvas.height = dHeight;
      canvas.getContext('2d').drawImage(this.video, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      document.body.appendChild(canvas);
      return canvas;
    } else {
      throw new Error('请先打开摄像头！');
    }
  }

  /**
   * @name 关闭相机
   * @returns {Camera}
   */
  close() {
    if (this.runnig) {
      const mediaStreamTracks = this.mediaStream.getVideoTracks();
      for (const track of mediaStreamTracks) {
        track.stop();
      }
      this.mediaStream = null;
      this.deviceId = '';
      this.runnig = false;
    }
    return this;
  }

  /**
   * @name 监听设备变化状态，如果当前使用的摄像机被移除，则关闭摄像机
   * @returns {void}
   */
  ondevicechange() {
    if (this.runnig) {
      window.navigator.mediaDevices.enumerateDevices().then(devices => {
        var flag = false;
        for (const device of devices) {
          if (device.deviceId === this.deviceId) {
            flag = true;
            break;
          }
        }
        if (!flag) {
          console.log('哦！');
          this.close();
        }
      });
    }
    console.log('啊！');
  }

}
