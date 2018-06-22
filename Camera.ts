class Camera {

  private videoStream: MediaStream;

  private runnig: Boolean = false;

  video: HTMLVideoElement;

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  open() {
    const getUserMedia = window.navigator.getUserMedia;
    // || window.navigator.webkitGetUserMedia
    // || window.navigator.mozGetUserMedia
    // || window.navigator.msGetUserMedia;
    if (getUserMedia) {
      getUserMedia({ video: true }, (stream: MediaStream) => {
        this.runnig = true;
        this.videoStream = stream;
        this.video.src = window.URL.createObjectURL(this.videoStream);
      }, (err: MediaStreamError) => { this.runnig = false; throw err });
    }
  }

  kacha() {

  }

  close() {
    if (!this.videoStream) {
      this.runnig = false;
      return;
    }
    const track: MediaStreamTrack = this.videoStream.getVideoTracks()[0];
    track.stop();
    this.runnig = false;
    return this;
  }

}

const camera: Camera = new Camera(document.createElement('video'));

