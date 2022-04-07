import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiGateway } from './utilities/api/api-gateway';
import { CacheRequest } from './utilities/cache-request';
import { Settings } from './utilities/app-settings';
import { StorageProvider } from './utilities/storage-provider';
import { normalizeURL, Platform } from '@ionic/angular';
import { FileProvider } from './file-provider';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

export interface IMotivator {
  id: number;
  image: string;
  imageStyle?: string | SafeStyle;
  text: string;
  friend?: string;
  custom?: boolean;
}

export interface IMotivatorRating {
  isFavorite: boolean;
  likeStatus: number;
}

@Injectable()
export class MotivatorsProvider {
  public motivatorRatings: any;
  public motivators: IMotivator[];
  public motivatorData: any;
  public defaultMotivators: IMotivator[] = [
    {
      id: 1,
      image: 'example-7.png',
      text: 'you don’t have to be great to start, but you have to start to be great',
    },
    {
      id: 2,
      image: 'example-7.png',
      text: 'you don’t have to be great to start, but you have to start to be great',
    },
  ];

  constructor(
    public settings: Settings,
    public apiGateway: ApiGateway,
    public cacheRequest: CacheRequest,
    public storage: StorageProvider,
    public fileProvider: FileProvider,
    public platform: Platform,
    public sanitizer: DomSanitizer
  ) {}

  public getMotivators(hideLoader?: boolean): Observable<any> {
    return new Observable((observer: any) => {
      Promise.all([
        this.getCustomMotivators(),
        this.get(),
        this.getRatings(),
      ]).then((data: any) => {
        if (data[0]) {
          let customMotivators = data[0];
          customMotivators.forEach((customMotivator: any) => {
            let customMotivatorIndex: number = this.motivators.findIndex(
              (singeMotivator: any) => singeMotivator.id === customMotivator.id
            );
            if (customMotivatorIndex > -1) {
              this.motivators[customMotivatorIndex] = customMotivator;
            } else {
              this.motivators.unshift(customMotivator);
            }
          });
        }
        let motivatorsData: any = {};
        if (this.motivators.length > 0) {
          this.motivators.forEach((motivator: IMotivator) => {
            motivator.imageStyle = this.fixURL(motivator.image);
            if (!this.motivatorRatings.hasOwnProperty(motivator.id)) {
              this.motivatorRatings[motivator.id] = {
                likeStatus: 0,
                isFavorite: false,
              };
            }
            motivatorsData['ratings'] = this.motivatorRatings;
            motivatorsData['motivators'] = this.motivators;
            this.storage.setItem('motivatorsRatings', this.motivatorRatings);
          });
          observer.next(motivatorsData);
        } else {
          motivatorsData = false;
          observer.next(motivatorsData);
        }
      });
    });
  }

  public get(): Promise<any> {
    return new Promise((resolve: any) => {
      if (this.motivators) {
        resolve();
      } else {
        this.storage.getItem('motivators').then((motivators: any) => {
          if (motivators) {
            this.motivators = motivators;
            resolve();
          } else {
            this.fetchMotivators().subscribe((motivators: any) => {
              this.motivators = motivators.motivators;
              resolve();
            });
          }
        });
      }
    });
  }

  public reorderMotivators(): void {
    let favoriteMotivators: IMotivator[] = this.motivators.filter(
      (motivator: IMotivator, index: number) =>
        this.motivatorRatings[motivator.id].isFavorite
    );
    let orderedMotivators: any[] = this.motivators.filter(
      (motivator: IMotivator, index: number) =>
        !this.motivatorRatings[motivator.id].isFavorite
    );
    let deletedItems: number = 0;
    let allRated: boolean;
    for (let key in this.motivatorRatings) {
      if (this.motivatorRatings[key].likeStatus === 0) {
        allRated = false;
        break;
      } else {
        allRated = true;
      }
    }

    if (!allRated) {
      //If not all motivator are rated, put the unrated ones in the front
      orderedMotivators.forEach((motivator: any, index: number) => {
        if (this.motivatorRatings[motivator.id].likeStatus === 0) {
          orderedMotivators.splice(index, 1);
          orderedMotivators.unshift(motivator);
          deletedItems++;
        }
      });
    }

    //order likes before dislikes
    // orderedMotivators = orderedMotivators.sort((a: any, b: any) => {
    // 	if (this.motivatorRatings[a.id].likeStatus < this.motivatorRatings[b.id].likeStatus) {
    // 		return -1;
    // 	} else if (this.motivatorRatings[a.id].likeStatus > this.motivatorRatings[b.id].likeStatus) {
    // 		return 1;
    // 	}
    // 	return 0;
    // });

    // Delete all dislikes
    orderedMotivators = orderedMotivators.filter((motivator: any) => {
      return this.motivatorRatings[motivator.id].likeStatus < 2;
    });
    //randomize Favorites and add them in the beginning of the array
    orderedMotivators = favoriteMotivators
      .sort((a: any, b: any) => 0.5 - Math.random())
      .concat(orderedMotivators);
    this.motivators = orderedMotivators;
    this.storage.setItem('motivators', orderedMotivators);
  }

  private getCustomMotivators(): Promise<any> {
    let fileData: any;
    let customMotivators: any;
    return new Promise((resolve: any) => {
      if (!this.platform.is('cordova')) {
        this.storage.getItem('customMotivators').then((data: any) => {
          resolve(data);
        });
      } else {
        Promise.all([
          this.fileProvider.getFromLibrary('motivators'),
          this.storage.getItem('customMotivators'),
        ]).then((data: any) => {
          customMotivators = data[1] || '';
          if (data[0] && data[1]) {
            fileData = data[0];
            customMotivators.forEach((customMotivator: any) => {
              const fileName: string =
                customMotivator.image.split('/')[
                  customMotivator.image.split('/').length - 1
                ];
              const motivatorFromFile: any = fileData.find(
                (file: any) => file.name === fileName
              );
              if (motivatorFromFile) {
                customMotivator.image = motivatorFromFile.nativeURL;
                customMotivator.imageStyle = this.fixURL(
                  motivatorFromFile.nativeURL
                );
              }
              resolve(customMotivators);
            });
          } else {
            resolve(customMotivators);
          }
        });
      }
    });
  }

  // FixURL bypasses security for the background-image url used in the hold-on page.
  protected fixURL(url: string): string | SafeStyle {
    if (this.platform.is('cordova')) {
      const win: any = window;
      const fixedURL: any = win.Ionic.WebView.convertFileSrc(url);

      return this.sanitizer.bypassSecurityTrustStyle(`url(${fixedURL})`);
    } else {
      const test: any = normalizeURL(url);
      return test;
    }
  }

  public deleteMotivator(id: number): void {
    let customMotivators: IMotivator[] = this.motivators.filter(
      (motivator: IMotivator) => motivator.custom
    );
    let motivatorIndex: number = this.motivators.findIndex(
      (motivator: IMotivator) => motivator.id === id
    );
    customMotivators.splice(motivatorIndex, 1);
    this.storage.setItem('customMotivators', customMotivators);
  }

  public saveMotivator(motivator: IMotivator): void {
    // edit motivator
    if (motivator.hasOwnProperty('id')) {
      let index: number = this.motivators.findIndex(
        (singeMotivator: any) => singeMotivator.id === motivator.id
      );
      this.motivators[index] = motivator;
      this.storage.setItem('motivators', this.motivators);
    } else {
      // new motivator
      let id: number = 1;
      while (this.motivatorRatings.hasOwnProperty(id)) {
        id++;
      }
      motivator['id'] = id;
      let rating: IMotivatorRating = {
        likeStatus: 1,
        isFavorite: true,
      };
      this.motivatorRatings[id] = rating;
      this.storage.setItem('motivatorsRatings', this.motivatorRatings);
      this.motivators.unshift(motivator);
      let customMotivators: IMotivator[] = this.motivators.filter(
        (motivator: IMotivator) => motivator.custom
      );
    }
    let customMotivators: IMotivator[] = this.motivators.filter(
      (motivator: IMotivator) => motivator.custom
    );
    this.storage.setItem('customMotivators', customMotivators);
  }

  public rateMotivation(id: number, status: any): void {
    this.motivatorRatings[id] = status;
    this.storage.setItem('motivatorsRatings', this.motivatorRatings);
  }

  public getRatings(): Promise<any> {
    return new Promise((resolve: any) => {
      this.storage.getItem('motivatorsRatings').then((data: any) => {
        this.motivatorRatings = data || {};
        resolve();
      });
    });
  }

  // Direct API calls
  public fetchMotivators(hideLoader?: boolean): Observable<any> {
    let method: string = 'maxx.getMotivators';
    return this.apiGateway.get(
      this.settings.apiEndpoint + method,
      {},
      !!hideLoader
    );
  }
}
