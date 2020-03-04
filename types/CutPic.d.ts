export declare class CutPic {
    canvas: HTMLCanvasElement;
    constructor(canvas: HTMLCanvasElement);
    cutBlack(): HTMLCanvasElement;
    /**
     * 将画布黑色边框去除，并返回ImageData
     * @param canvas
     */
    private getImageData;
    /**
     * 根据给定的data以黑色为边界，来获取该方向的坐标点和该方向的长度
     * @param data
     */
    private getCooLen;
    private isBlack;
}
