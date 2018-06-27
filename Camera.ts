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

  public kacha(cut: 'a4' | 'card'): HTMLCanvasElement {
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

  private cutBlack(canvas: HTMLCanvasElement): ImageData {
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

  private getCooLen(data: Uint8ClampedArray, tolerances: number = 7): { coordinate: number, length: number } {
    const len = data.length;
    let coordinate, n, length, arr;

    arr = []; // 该数组用来存放已经查找出符合要求的坐标点，这些坐标点必须是连续的,若果不连续，立刻重置该数组
    for (var i = 0; i < len; i += 4) {
      if (!this.isBlack(data[i], data[i + 1], data[i + 2], data[i + 3])) {

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
          break;
        }

      }
    }

    arr = [];
    for (var i = len - 1; i >= 0; i -= 4) {
      if (!this.isBlack(data[i - 3], data[i - 2], data[i - 1], data[i])) {

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
          break;
        }

      }
    }

    return { coordinate, length: n - coordinate };
  }

  private isBlack(r: number, g: number, b: number, a: number): Boolean {
    return r < 150 && g < 150 && b < 150;
  }

}
