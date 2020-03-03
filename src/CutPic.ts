type CooLen = {
  /**
   * 坐标
   */
  coordinate: number,
  /**
   * 长度
   */
  length: number
}

export class CutPic {
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  cutBlack(): HTMLCanvasElement {
    let imageData: ImageData | null = this.getImageData();
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.putImageData(imageData, 0, 0);
    imageData = null;
    return this.canvas;
  }

  /**
   * 将画布黑色边框去除，并返回ImageData
   * @param canvas
   */
  private getImageData(): ImageData {
    const { width, height } = this.canvas;
    const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    /**
     * 坐标说明
     * 左上角坐标为 (0, 0)
     * 右下角坐标为 (canvas.width, canvas.height)
     */

    /**
    * 从左侧中间开始，高度1，到最右侧
    * (0, canvas.height/2)      (canvas.width, canvas.height/2)
    * (0, canvas.height/2 + 1)  (canvas.width, canvas.height/2 + 1)
    * 描述了一个一维数组，包含以 RGBA 顺序的数据，数据使用  0 至 255（包含）的整数表示。
    */
    const rowData: Uint8ClampedArray = ctx.getImageData(0, height / 2, width, 1).data;
    const row: CooLen = this.getCooLen(rowData);

    /**
    * 从顶部中间开始，宽度1，到最底部
    * (canvas.width/2, 0)               (canvas.width/2 + 1, 0)
    * (canvas.width/2, canvas.height)   (canvas.width/2 + 1, canvas.height)
    */
    const colData: Uint8ClampedArray = ctx.getImageData(width / 2, 0, 1, height).data;
    const col: CooLen = this.getCooLen(colData);

    const imageData: ImageData = ctx.getImageData(row.coordinate, col.coordinate, row.length, col.length);
    return imageData;
  }

  /**
   * 根据给定的data以黑色为边界，来获取该方向的坐标点和该方向的长度
   * @param data
   */
  private getCooLen(data: Uint8ClampedArray): CooLen {
    // 误差 连续7个表标点不是“黑色”
    const tolerances = 7;
    const len = data.length;
    let coordinate: number = 0;
    let n: number = len / 4;
    // 该数组用来存放已经查找出符合要求的坐标点，这些坐标点必须是连续的,若果不连续，立刻重置该数组
    let arr: number[] = [];

    // 从头找
    for (let i = 0; i < len; i += 4) {
      const [r, g, b, a] = data.slice(i, i + 4);
      if (!this.isBlack(r, g, b, a)) {
        coordinate = i / 4;
        arr.push(coordinate);
        if (arr.length === tolerances) {
          coordinate = arr[0];
          break;
        }
      } else {
        arr = [];
      }
    }

    arr = [];
    // 从尾找
    for (let i = len - 1; i >= 0; i -= 4) {
      const [r, g, b, a] = data.slice(i - 3, i + 1);
      if (!this.isBlack(r, g, b, a)) {
        n = (i - 3) / 4;
        arr.push(n);
        if (arr.length === tolerances) {
          n = arr[arr.length - 1];
          break;
        }
      } else {
        arr = [];
      }
    }

    return { coordinate, length: n - coordinate };
  }

  private isBlack(r: number, g: number, b: number, a: number = 255): boolean {
    return r < 150 && g < 150 && b < 150;
  }
}
