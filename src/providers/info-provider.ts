/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { CacheRequest } from './utilities/cache-request';
import 'rxjs/add/operator/switchMap';

import { ApiGateway } from './utilities/api/api-gateway';
import { Settings } from './utilities/app-settings';
import { StorageProvider } from './utilities/storage-provider';

@Injectable()
export class InfoProvider {
  public infoContent: any;
  public textInfo = new ReplaySubject<any>(1);

  constructor(
    private settings: Settings,
    private apiGateway: ApiGateway,
    private cacheRequest: CacheRequest,
    private storage: StorageProvider
  ) {
    this.getTextInfo(true);
  }

  public getInfo(pageCode): Observable<any> {
    return new Observable((observer: any) => {
      this.textInfo.subscribe((data: any) => {
        if (data) {
          const info: any = data.find((info: any) => info.code === pageCode);
          observer.next(info);
        }
      });
    });
  }

  public getTextInfo(fresh?: boolean): void {
    this.storage.getItem('textInfo').then(async (info: any) => {
      if (info && !fresh) {
        this.textInfo.next(info);
      } else {
        const method = 'info.getAll';

        (
          await this.apiGateway.get(this.settings.apiEndpoint + method, {
            appid: this.settings.appId,
          })
        ).subscribe(
          (data: any) => {
            if (data && data.status === 'success') {
              this.storage.setItem('textInfo', data.data);
              this.textInfo.next(data.data);
            }
          },
          (error) => {
            if (info) {
              this.textInfo.next(info);
            }
          }
        );
      }
    });
  }

  public async getFaq(hideLoader?: boolean): Promise<Observable<any>> {
    const method: string = 'faq.get';
    return await this.apiGateway.get(
      this.settings.apiEndpoint + method,
      { appid: this.settings.appId },
      hideLoader
    );
  }
}
