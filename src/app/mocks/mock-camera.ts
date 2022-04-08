/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-shadow */
//import { Camera, CameraOptions } from '@ionic-native/camera';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';

declare let cordova: any;

export class MockCamera extends Camera {
  public getPicture(options?: CameraOptions): Promise<any> {
    try {
      if (cordova) {
        return super.getPicture(options);
      }
    } catch (error) {
      return new Promise((resolve: any, reject: any) => {
        navigator.mediaDevices
          .getUserMedia({
            audio: false,
            video: true,
          })
          .then((stream) => {
            const recorder = new MediaSource();
            const source = new MediaSource();

            const elem = createVideoElem();

            const video: any = document.createElement('video');
            document.body.appendChild(video);
            video.style.position = 'absolute';
            video.style['z-index'] = '999';
            const canvas: any = document.createElement('canvas');
            document.body.appendChild(canvas);
            // eslint-disable-next-line @typescript-eslint/dot-notation
            canvas.style['position'] = 'absolute';
            canvas.style['z-index'] = '999';
            // video.src = window.URL.createObjectURL(stream);
            video.play();
            const context: any = canvas.getContext('2d');
            setTimeout(() => {
              canvas.setAttribute('width', video.videoWidth + 'px');
              canvas.setAttribute('height', video.videoHeight + 'px');
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const data: any = canvas.toDataURL('image/jpg');
              resolve(data);
              document.body.removeChild(video);
              document.body.removeChild(canvas);
              stream.getTracks().forEach((track: any) => {
                track.stop();
              });
            }, 1000);
            // eslint-disable-next-line @typescript-eslint/no-shadow
          })
          .catch((error) => {
            console.log('error', error);
            reject();
          });
      });
    }
  }
}
function createVideoElem() {
  const elem = document.createElement('video');
  elem.controls = true;
  elem.autoplay = true; // for chrome
  elem.play(); // for firefox
  document.body.appendChild(elem);
  return elem;
}
