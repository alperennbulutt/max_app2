/* eslint-disable @angular-eslint/no-output-on-prefix */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  IonSlides,
  Platform,
  ActionSheetOptions,
} from '@ionic/angular';
import normalizeUrl from 'normalize-url';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { FileProvider } from '../../providers/file-provider';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { MockCamera } from 'src/app/mocks/mock-camera';

@Component({
  selector: 'editor',
  templateUrl: 'editor.html',
})
export class Editor {
  public _options: any;
  public _data: any;
  public editorStep = 0;
  public activeImage: number;
  public _activeImage: string;
  public dirName: string;
  public isEditing = false;
  public initialSlide = 0;
  public showLoader = false;
  public editorResult: any = {
    id: '',
    text: '',
    image: '',
    imageStyle: '',
    imageName: '',
    relativePath: '',
  };

  public editorImages: string[] = [];

  public defaultImages: any = {
    motivators: [
      'assets/img/motivators/001.jpg',
      'assets/img/motivators/002.jpg',
      'assets/img/motivators/003.jpg',
      'assets/img/motivators/004.jpg',
      'assets/img/motivators/005.jpg',
      'assets/img/motivators/006.jpg',
      'assets/img/motivators/007.jpg',
      'assets/img/motivators/008.jpg',
      'assets/img/motivators/009.jpg',
      'assets/img/motivators/010.jpg',
      'assets/img/motivators/011.jpg',
    ],
    rewards: [
      'assets/img/rewards/001.jpg',
      'assets/img/rewards/002.jpg',
      'assets/img/rewards/003.jpg',
      'assets/img/rewards/004.jpg',
    ],
  };

  @ViewChild('slider') slider: IonSlides;
  @ViewChild('imagePicker') imagePicker: any;

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onFinish: any = new EventEmitter();
  @Output() onImageChange: any = new EventEmitter();
  @Output() onGoback: any = new EventEmitter();
  @Output() sectionChange: any = new EventEmitter();

  @Input()
  get defaultActiveImage(): string {
    return this._activeImage;
  }

  set defaultActiveImage(imageUrl: string) {
    this._activeImage = imageUrl || '';
  }

  @Input()
  get options(): string {
    return this._options;
  }

  set options(options: string) {
    this._options = options;
    setTimeout(() => {
      this.setDefaults();
    }, 100);
  }

  @Input()
  get data(): any {
    return this._data;
  }

  set data(data: any) {
    this._data = data || '';
    if (data) {
      this.setDefaults(true);
    }
  }

  @Input() pagination: boolean;

  constructor(
    public actionSheetController: ActionSheetController,
    public mockcamera: MockCamera,
    public camera: Camera,
    public file: File,
    public fileProvider: FileProvider,
    public elementRef: ElementRef,
    public alertController: AlertController,
    public platform: Platform,
    public sanitizer: DomSanitizer
  ) {}

  public updateStep(increase?: boolean): void {
    const prevClass: string = this._options[this.editorStep].type;
    this.elementRef.nativeElement.classList.remove(prevClass);
    if (increase) {
      this.editorStep++;
    } else {
      this.editorStep--;
    }
    if (this.editorStep < 0) {
      this.editorStep = 0;
      this.onGoback.emit();
    }
    if (this.editorStep === 1) {
      this.editorResult.text = this.editorResult.text.replace(/(\n)/g, '<br>');
    } else {
      this.editorResult.text = this.editorResult.text.replace(
        /(\<br\>)/g,
        '\n'
      );
    }
    const activeClass: string = this._options[this.editorStep].type;
    if (activeClass) {
      this.elementRef.nativeElement.classList.add(activeClass);
      this.sectionChange.emit(activeClass);
    }
  }

  public changeImage(image: string, imageIndex: number): void {
    this.editorResult.image = image;
    this.editorResult.imageStyle = this.fixURL(image);
    this.activeImage = imageIndex;
    this.onImageChange.emit(image);
  }

  // FixURL bypasses security for the background-image url used in the editor page.
  protected fixURL(url: string): string | SafeStyle {
    if (this.platform.is('cordova')) {
      const win: any = window;
      const fixedURL: any = win.Ionic.WebView.convertFileSrc(url);

      return this.sanitizer.bypassSecurityTrustStyle(`url(${fixedURL})`);
    } else {
      const test: any = normalizeUrl(url);
      return test;
    }
  }

  public setDefaults(isEditing?: boolean): void {
    // get default images
    const defaultImageKey: string =
      this._options.find((option: any) => option.type === 'imagePicker')
        .defaultImages || 'default';
    this.editorImages = this.defaultImages[defaultImageKey];

    const storageDir: string =
      this._options.find((option: any) => option.type === 'imagePicker')
        .storageImages || '';
    this.dirName = storageDir;
    if (this.defaultActiveImage) {
      this.activeImage = this.editorImages.indexOf(this.defaultActiveImage);
    } else {
      this.changeImage(this.defaultImages[defaultImageKey][0], 0);
    }
    this.fileProvider
      .getFromLibrary(storageDir)
      .then((data: any) => {
        if (data) {
          const images: any = data.map((image) => image.nativeURL);
          this.editorImages = this.editorImages.concat(images);
        }
      })
      .catch((err) => {
        console.log('ophalen van editor niet gelukt', err);
      });

    if (isEditing) {
      this.editorResult.id = this.data.id;
      this.editorResult.text = this.data.text.replace(/(\<br\>)/g, '\n');
      this.editorResult.image = this.data.image;
      this.activeImage = this.editorImages.indexOf(this.data.image);
      this.isEditing = true;
    } else {
      this.editorResult.image = this.editorImages[0];
      this.isEditing = false;
      if (this._options.find((option) => option.type === 'choose-text')) {
        this.editorResult.text = this._options[0].texts[0].text;
      }
    }
  }

  public removeImage(img: string, imgIndex: number): void {
    const alert = this.alertController.create({
      title: 'Afbeelding verwijderen',
      message: 'Weet je zeker dat je deze afbeelding wilt verwijderen?',
      buttons: [
        {
          text: 'Ja',
          handler: () => {
            const imgToDelete: string =
              img.split('/')[img.split('/').length - 1];
            this.fileProvider.removeFile(this.dirName, imgToDelete).then(() => {
              this.editorImages = this.editorImages.filter(
                (image: string) => image !== img
              );
              this.changeImage(this.editorImages[0], 0);
            });
          },
        },
        { text: 'Nee, terug', role: 'cancel' },
      ],
    });
    alert.present();
  }

  public addNewImage(): void {
    const actionSheet: ActionSheetController =
      this.actionSheetController.create({
        title: 'Afbeelding toevoegen',
        buttons: [
          {
            text: 'Maak een foto',
            handler: () => {
              this.addImage(true);
            },
          },
          {
            text: 'Kies bestaande foto',
            handler: () => {
              this.addImage();
            },
          },
        ],
      });
    actionSheet.present();
  }

  private addImage(makePhoto?: boolean): void {
    const options = {
      quality: 100,
      // eslint-disable-next-line max-len
      destinationType: this.camera.DestinationType.FILE_URI, //return a path to the image on the device sourceType: 1, //use the camera to grab the image
      encodingType: 0, //return the image in jpeg format
      cameraDirection: 0, //front facing camera
      saveToPhotoAlbum: false, //save a copy to the users photo album as well
      sourceType: makePhoto ? 1 : 0,
      correctOrientation: true,
      targetWidth: 750,
      targetHeight: 1334,
    };

    this.mockcamera
      .getPicture(options)
      .then((imageUrl: string) => {
        this.showLoader = true;
        const fileName: string =
          imageUrl.split('/')[imageUrl.split('/').length - 1];
        this.fileProvider
          .saveToLibrary(this.dirName, fileName)
          .then((image: any) => {
            // let imageName: string = image.name;
            // image = image.nativeURL.replace('file://', '');
            const imageName: string = image.name;
            this.editorImages.push(image.nativeURL);
            this.changeImage(image.nativeURL, this.editorImages.length - 1);
            this.editorResult.relativePath = imageName;
            //Tmeout for scrolling to element
            setTimeout(() => {
              const scrollPosition: number =
                this.imagePicker.nativeElement.scrollWidth;
              //Scrolwidth plus one element width
              this.imagePicker.nativeElement.scrollLeft = scrollPosition;
              this.showLoader = false;
            }, 200);

            //this.onImageChange.emit(image);
          })
          .catch((err) => {
            console.log('1', err);

            const alert: AlertController = this.alertController.create({
              title: 'Oeps',
              message:
                'Er is iets verkeerd gegaan tijdens het opslaan van de foto. Probeer het later opnieuw',
              buttons: [{ text: 'Sluiten', role: 'cancel' }],
            });
            alert.present();
            this.showLoader = false;
          });
      })
      .catch((err: any) => {
        console.log('2', err);
        const alert: AlertController = this.alertController.create({
          title: 'Oeps',
          message:
            'Er is iets verkeerd gegaan tijdens het opslaan van de foto. Probeer het later opnieuw',
          buttons: [{ text: 'Sluiten', role: 'cancel' }],
        });
        this.showLoader = false;
        alert.present();
      });

    setTimeout(() => {
      if (this.showLoader) {
        const alert: AlertController = this.alertController.create({
          title: 'Oeps',
          message: 'Het uploaden is niet gelukt. Probeer het later opnieuw',
          buttons: [{ text: 'Sluiten', role: 'cancel' }],
        });
        this.showLoader = false;
        alert.present();
      }
    }, 15000);
  }

  public sliderChanged(step: number): void {
    let index: Promise<number> = this.slider.getActiveIndex();
    this.initialSlide = Number(index);
    if (index > this.slider.length()) {
      index = this.slider.length();
    }

    if (this.slider.isEnd()) {
      if (
        this._options[step].texts.find(
          (text: any) => text.text === this.editorResult.text
        )
      ) {
        this.editorResult.text = '';
      }
    } else {
      this.editorResult.text = this._options[step].texts[Number(index)].text;
    }
  }

  public save(): void {
    this.onFinish.emit(this.editorResult);
  }
}
