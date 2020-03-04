export declare class Camera {
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
    constructor(video: HTMLVideoElement);
    /**
     * 销毁相机，清空所有数据
     */
    destroy(): void;
    /**
    * @name 当媒体设备发生变化时，重新获取摄像头
    */
    private onDeviceChange;
    getCameraList(): Promise<MediaDeviceInfo[]>;
    open(constraints: MediaStreamConstraints, force?: boolean): Promise<MediaStream>;
    close(): void;
    md2Canvas(): HTMLCanvasElement;
}
export default Camera;
