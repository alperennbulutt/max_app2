import { Injectable } from '@angular/core';
import { StorageProvider } from './utilities/storage-provider';
import { Settings } from './utilities/app-settings';
import { Observable } from 'rxjs';
import { ApiGateway } from './utilities/api/api-gateway';
import * as moment from 'moment';

@Injectable()
export class DiaryProvider {
  private storageKey = 'drinks-log';
  private logs: any;

  constructor(
    private storage: StorageProvider,
    private settings: Settings,
    private apiGateway: ApiGateway
  ) {}

  public async getDiaryData(hideLoader?: boolean): Promise<Observable<any>> {
    const diaryCache: any = {
      fetchedOn: moment().startOf('day').format(),
    };
    localStorage.setItem('diaryCache', JSON.stringify(diaryCache));
    const method = 'diary.getAllDataArray';
    return await this.apiGateway.post(
      this.settings.apiEndpoint + method,
      {},
      hideLoader
    );
  }

  public async saveDiaryData(
    data: any,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    const method = 'diary.save';

    return await this.apiGateway.post(
      this.settings.apiEndpoint + method,
      {},
      data,
      hideLoader
    );
  }

  public getLogs(fresh?: boolean): Promise<any> {
    const cache = JSON.parse(localStorage.getItem('diaryCache'));
    return new Promise((resolve: any) => {
      if (fresh) {
        this.buildDiaryData().then((data) => resolve(data));
      } else {
        if (
          !cache ||
          moment().isAfter(moment(cache.fetchedOn).add(1, 'days'))
        ) {
          this.buildDiaryData().then((data) => resolve(data));
        } else {
          if (this.logs) {
            resolve(this.logs);
          } else {
            this.storage.getItem(this.storageKey).then((storageData: any[]) => {
              if (storageData) {
                this.logs = storageData;
                resolve(storageData);
              } else {
                this.buildDiaryData().then((data) => resolve(data));
              }
            });
          }
        }
      }
    });
  }

  private buildDiaryData(): Promise<any> {
    return new Promise(async (resolve: any) => {
      (await this.getDiaryData()).subscribe((data: any) => {
        if (data) {
          const logs: any = [];
          // eslint-disable-next-line guard-for-in
          for (const key in data.data) {
            logs.push(JSON.parse(data.data[key].custom));
          }
          logs.sort(
            (a: any, b: any) =>
              // eslint-disable-next-line radix
              parseInt(moment(a.date).format('X')) -
              // eslint-disable-next-line radix
              parseInt(moment(b.date).format('X'))
          );
          this.storage.setItem(this.storageKey, logs);
          this.logs = logs;
          resolve(logs);
        }
      });
    });
  }
}
