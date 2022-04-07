/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiGateway } from './utilities/api/api-gateway';

import { Settings } from './utilities/app-settings';
import { CacheRequest } from './utilities/cache-request';
import { StorageProvider } from './utilities/storage-provider';

export interface IUser {
  app?: string;
  id: number;
  email: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  reg_date: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  notification_daily: boolean;
  notification_others: boolean;
  gender: string;
  birthdate: string;
  custom_data: string;
  notification_hour: number;
}

export interface INotifications {
  notification_daily: boolean;
  notification_others: boolean;
  notification_hour: number;
  appid?: string;
}

@Injectable()
export class UserProvider {
  constructor(
    private apiGateway: ApiGateway,
    private settings: Settings,
    private cacheRequest: CacheRequest,
    private storageProvider: StorageProvider
  ) {}

  public fetch(fresh?: boolean, hideLoader?: boolean): Promise<IUser> {
    const method = 'profile.get';
    return this.cacheRequest.fetch(
      this.settings.apiEndpoint,
      method,
      { appid: this.settings.appId },
      !!fresh,
      hideLoader,
      30 * 60 // Cache for 30 minutes
    );
  }

  public update(data: any, hideLoader?: boolean): Observable<any> {
    const method = 'profile.update';
    data.appid = this.settings.appId;
    return this.apiGateway.post(
      this.settings.apiEndpoint + method,
      null,
      data,
      hideLoader
    );
  }

  public setNotification(
    data: INotifications,
    hideLoader?: boolean
  ): Observable<any> {
    const method = 'profile.setNotifications';
    data.appid = this.settings.appId;
    return this.apiGateway.post(
      this.settings.apiEndpoint + method,
      null,
      data,
      hideLoader
    );
  }

  public setRegistrationDate(dateInput?: string): void {
    if (dateInput) {
      this.storageProvider.setItem('registrationDate', dateInput);
    } else {
      this.fetch(true).then((data: any) => {
        const registrationDate: string = data.reg_date;
        this.storageProvider.setItem('registrationDate', registrationDate);
      });
    }
  }

  public getRegistrationDate(): Promise<any> {
    return new Promise((resolve: any) => {
      this.storageProvider.getItem('registrationDate').then((date: string) => {
        if (date) {
          resolve(date);
        } else {
          this.fetch(true).then((data: any) => {
            const registrationDate: string = data.reg_date;
            this.storageProvider.setItem('registrationDate', registrationDate);
            this.setRegistrationDate(registrationDate);
            resolve(registrationDate);
          });
        }
      });
    });
  }
}
