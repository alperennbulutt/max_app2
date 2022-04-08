/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

import { ApiGateway } from './utilities/api/api-gateway';
import { StorageProvider } from './utilities/storage-provider';
import { CacheRequest } from './utilities/cache-request';
import { Settings } from './utilities/app-settings';
import * as moment from 'moment';

export interface ISituation {
  id?: number;
  who?: string;
  strategies: any;
  description: string;
  notificationAt?: string;
  date: string;
  note?: string;
  rating?: number;
  inTheFuture: boolean;
  notificationId?: number;
}

@Injectable()
export class StrategyProvider {
  public strategies: any;
  public situationData: ISituation[];
  public situations: any = new ReplaySubject<any>(1);
  public expiredSituations: any[] = [];

  constructor(
    public settings: Settings,
    public apiGateway: ApiGateway,
    public cacheRequest: CacheRequest,
    public storageProvider: StorageProvider
  ) {
    this.getStrategies().then((data: any) => {
      this.strategies = data.data;
    });

    this.getSituations();
  }

  public getStrategies(): Promise<any> {
    return new Promise((resolve: any): any => {
      if (this.strategies) {
        resolve(this.strategies);
      } else {
        this.fetch().then((data: any) => {
          if (data) {
            this.strategies = data.data;
            resolve(this.strategies);
          }
        });
      }
    });
  }

  public getSituations(): void {
    this.storageProvider.getItem('situations').then((situations: any) => {
      this.situationData = situations || '';
      this.situations.next(this.situationData);
    });
  }

  public getExpiredSituations(): Observable<any> {
    return new Observable((observer: any) => {
      this.situations.subscribe((situations: any) => {
        if (situations) {
          situations.forEach((situation: any) => {
            if (
              moment(situation.date).isBefore(moment()) &&
              situation.inTheFuture
            ) {
              this.expiredSituations.push(situation);
              situation.inTheFuture = false;
              this.saveSituation(situation, true);
            }
          });
          observer.next(this.expiredSituations);
        } else {
          observer.next(false);
        }
      });
    });
  }

  public resetExpiredSituations(): void {
    this.expiredSituations = [];
  }

  public saveSituation(
    situation: ISituation,
    dontUpdateSubscribers?: boolean
  ): void {
    dontUpdateSubscribers = dontUpdateSubscribers || false;
    if (situation.hasOwnProperty('id')) {
      const situationIndex: any = this.situationData.findIndex(
        (singleSituation: any) => singleSituation.id === situation.id
      );
      this.situationData[situationIndex] = situation;
    } else {
      if (this.situationData && this.situationData.length > 0) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        situation['id'] = this.generateId();
        this.situationData.push(situation);
      } else {
        situation.id = 1;
        this.situationData = [situation];
      }
    }
    this.storageProvider.setItem('situations', this.situationData);
    if (!dontUpdateSubscribers) {
      this.situations.next(this.situationData);
    }
  }

  public deleteSituation(situation: ISituation): void {
    const situationIndex: any = this.situationData.findIndex(
      (singleSituation: any) => singleSituation.id === situation.id
    );
    this.situationData.splice(situationIndex, 1);
    this.storageProvider.setItem('situations', this.situationData);
    this.situations.next(this.situationData);
  }

  private generateId(): number {
    return this.situationData[this.situationData.length - 1].id + 1;
  }

  // Direct API calls
  public async getData(hideLoader?: boolean): Promise<Observable<any>> {
    const method = 'maxx.getStrategies';
    return await this.apiGateway.get(
      this.settings.apiEndpoint + method,
      {},
      !!hideLoader
    );
  }

  // Cache API calls
  public fetch(): Promise<any> {
    return new Promise((resolve: any, reject: any): any => {
      const method = 'maxx.getStrategies';
      this.cacheRequest
        .fetch(this.settings.apiEndpoint, method, false)
        .then((data: any) => {
          if (data) {
            resolve(data);
          } else {
            reject();
          }
        });
    });
  }
}
