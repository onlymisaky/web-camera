import { cameraAuth, setStatus } from './utils'

export class Camera {
  /**
   * 当前正在使用的设备id
   */
  deviceId: string;

  /**
   * 可用相机列表
   */
  cameraList: MediaDeviceInfo[];

  /**
   * 当前相机捕获到的媒体流
   */
  mediaStream: MediaStream | null;

  status: 'init' | 'failure' | 'ready' | 'busy' | 'destroyed';

  /**
   * video标签，用于显示画面
   */
  video: HTMLVideoElement;

  constructor(video: HTMLVideoElement) {
    this.video = video;
    this.deviceId = '';
    this.cameraList = [];
    this.mediaStream = null;
    this.status = 'init';
    window.navigator.mediaDevices.addEventListener('devicechange', this.onDeviceChange);
  }

  /**
   * 销毁相机，清空所有数据
   */
  @setStatus('destroyed')
  destroy() {
    this.deviceId = '';
    this.cameraList = [];
    this.close();
    window.navigator.mediaDevices.removeEventListener('devicechange', this.onDeviceChange);
  }

  /**
  * @name 当媒体设备发生变化时，重新获取摄像头
  */
  private onDeviceChange() {
    this.getCameraList();
  }

  @cameraAuth('enumerateDevices')
  getCameraList(): Promise<MediaDeviceInfo[]> {
    this.cameraList = [];
    return window
      .navigator
      .mediaDevices
      .enumerateDevices().then((mediaDeviceList) => {
        this.cameraList = mediaDeviceList.filter(md => md.kind === 'videoinput');
        return this.cameraList;
      });
  }

  @setStatus('ready')
  @cameraAuth('getUserMedia')
  open(constraints: MediaStreamConstraints, force: boolean = false): Promise<MediaStream> {
    if (force) {
      this.close();
    }
    this.deviceId = ((constraints.video as MediaTrackConstraints).deviceId as string) || '';
    return window
      .navigator
      .mediaDevices
      .getUserMedia(constraints)
      .then((mediaStream) => {
        this.mediaStream = mediaStream;
        this.video.srcObject = this.mediaStream;
        this.video.play();
        return this.mediaStream;
      });
  }

  @setStatus('destroyed')
  close() {
    if (this.mediaStream) {
      this.mediaStream.getVideoTracks()[0].stop();
    }
    this.mediaStream = null;
  }

  @setStatus('ready')
  @setStatus('busy', 'before')
  md2Canvas(): HTMLCanvasElement {
    const settings = (this.mediaStream as MediaStream).getVideoTracks()[0].getSettings();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const sx = 0;
    const sy = 0;
    const sWidth = settings.width || 0;
    const sHeight = settings.height || 0;
    const dx = 0;
    const dy = 0;
    const dWidth = settings.width || 0;
    const dHeight = settings.height || 0;
    canvas.width = dWidth || 0;
    canvas.height = dHeight || 0;
    (<CanvasRenderingContext2D>ctx).drawImage(
      this.video, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight,
    );
    return canvas;
  }
}
