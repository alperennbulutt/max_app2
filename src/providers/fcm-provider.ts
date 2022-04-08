/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/********************************
 * Requires:                    *
 * - `@ionic-native/fcm` module *
 ********************************/

import { Injectable, isDevMode } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FCM } from '@ionic-native/fcm/ngx';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { ApiGateway } from './utilities/api/api-gateway';
import { Settings } from './utilities/app-settings';

@Injectable()
export class FCMProvider {
  public onNotification: Observable<any>;

  constructor(
    private platfrom: Platform,
    private fcm: FCM,
    private apiGateway: ApiGateway,
    private settings: Settings
  ) {
    this.platfrom.ready().then(() => {
      if (this.platfrom.is('cordova')) {
        // Subscribe to default channel
        this.fcm.subscribeToTopic('messages');
        // Subscribe to development channel when app is running in development mode
        if (isDevMode()) {
          this.fcm.subscribeToTopic('dev');
        }

        // FCM token handling
        this.updateToken();

        this.fcm.onTokenRefresh().subscribe((tokenString: any) => {
          this.uploadToken(tokenString);
        });

        // FCM notification observable
        this.onNotification = this.fcm.onNotification();
      }
    });
  }

  updateToken(): void {
    this.fcm
      .getToken()
      .then((tokenString: any) => {
        this.uploadToken(tokenString);
      })
      .catch((error: any) => {
        console.log('error', error);
      });
  }

  private async uploadToken(token: string) {
    // Only allow setting the token if user is logged in since the request is authorized
    if (localStorage.getItem('auth-token')) {
      const method: string = 'profile.setDeviceId';
      const data: any = {
        appid: this.settings.appId,
        deviceId: token,
      };
      const request: Observable<any> = await this.apiGateway.post(
        this.settings.apiEndpoint + method,
        null,
        data,
        true
      );

      request.subscribe(
        () => {
          // Token successfully updated
        },
        (error: any) => {
          console.log('error', error);
        }
      );
    }
  }

  public async scheduleNotification(
    notification: any,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    if (notification.id === -1) {
      return await this.scheduleNewNotification(notification.data, true);
    } else {
      return await this.updateNotification(
        notification.id,
        notification.data,
        true
      );
    }
  }

  public async updateNotification(
    id: number,
    data: any,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    return new Promise<Observable<any>>(async (observer: any) => {
      (await this.removeScheduledNotification(id)).subscribe(
        async (status: any) => {
          if (status.status === 'success') {
            (await this.scheduleNewNotification(data)).subscribe(
              (status: any) => {
                if (status.status === 'success') {
                  observer.next(status.message_id);
                } else {
                  observer.next(false);
                }
              }
            );
          } else {
            console.log('Verwijderen niet gelukt');
            observer.next(false);
          }
        }
      );
    });
  }

  public async scheduleNewNotification(
    data: any,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    const method: string = 'scheduler.addnotificationtoqueue';
    return await this.apiGateway.post(
      this.settings.apiEndpoint + method,
      {},
      data,
      hideLoader
    );
  }

  public removeScheduledNotification(
    id: number,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    const method: string = 'scheduler.removeNotificationFromQueue';
    return this.apiGateway.post(
      this.settings.apiEndpoint + method,
      {},
      { id: id },
      hideLoader
    );
  }

  public async cancelTodayLogreminder(
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    const method: string = 'scheduler.removeTodaysNotificationFromQueue';
    return this.apiGateway.post(
      this.settings.apiEndpoint + method,
      {},
      hideLoader
    );
  }
}
