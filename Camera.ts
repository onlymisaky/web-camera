class Camera {

  public video: HTMLVideoElement;
  public devicechange: Function = null;
  public mediaStream: MediaStream = null;
  private running: Boolean = false;

  constructor({ video, devicechange }: { video: HTMLVideoElement, devicechange?: Function }) {
    this.video = video;
    this.devicechange = devicechange;
    window.navigator.mediaDevices.addEventListener('devicechange', this.ondevicechange.bind(this))
  }

  private getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
    if (window.navigator.mediaDevices.getUserMedia) {
      return window.navigator.mediaDevices.getUserMedia(constraints);
    } else {
      return Promise.reject(new Error('无法打开摄像头！'));
    }
  }

  private stop(stream: MediaStream): void {
    stream.getVideoTracks()[0].stop();
  }

  private applyConstraints(stream: MediaStream, constraints: MediaTrackConstraints): Promise<Camera> {
    return stream.getVideoTracks()[0].applyConstraints(constraints).then(() => this).catch(err => err);
  }

  private ondevicechange(): Promise<void> {
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

  public getSettings(stream: MediaStream): MediaTrackSettings {
    return stream.getVideoTracks()[0].getSettings();
  }

  public getCameraList(): Promise<MediaDeviceInfo[]> {
    return window.navigator.mediaDevices.enumerateDevices()
      .then(list => list.filter(item => item.kind === 'videoinput'))
      .catch(err => err);
  }

  public open(constraints: MediaStreamConstraints = { video: {} }): Promise<Camera> {
    if (this.running) {
      return Promise.reject(this);
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
      this.video.srcObject = stream;
      this.video.play();
      return this;
    }).catch(err => err);
  }

  public close(): Camera {
    if (this.running) {
      this.stop(this.mediaStream);
    }
    this.running = false;
    this.mediaStream = null;
    return this;
  }

  public switch(deviceId: string): Promise<Camera> {
    if (this.running && deviceId === this.getSettings(this.mediaStream).deviceId) {
      return Promise.resolve(this);
    }
    return this.close().open({ video: { deviceId } });
  }

  public setResolution(width: number = 640, height: number = 480): Promise<Camera> {
    return this.applyConstraints(this.mediaStream, { width, height });
  }

  public kacha(): HTMLCanvasElement {
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
