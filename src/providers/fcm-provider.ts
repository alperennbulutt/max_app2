/********************************
 * Requires:                    *
 * - `@ionic-native/fcm` module *
 ********************************/

import { Injectable, isDevMode } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FCM } from '@ionic-native/fcm';
import { Observable } from 'rxjs';
import moment from 'moment';

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

  /**
   * Upload the FCM token to the server
   * @param {string} token
   */
  private uploadToken(token: string): void {
    // Only allow setting the token if user is logged in since the request is authorized
    if (localStorage.getItem('auth-token')) {
      let method: string = 'profile.setDeviceId';
      let data: any = {
        appid: this.settings.appId,
        deviceId: token,
      };
      let request: Observable<any> = this.apiGateway.post(
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

  public scheduleNotification(
    notification: any,
    hideLoader?: boolean
  ): Observable<any> {
    if (notification.id === -1) {
      return this.scheduleNewNotification(notification.data, true);
    } else {
      return this.updateNotification(notification.id, notification.data, true);
    }
  }

  public updateNotification(
    id: number,
    data: any,
    hideLoader?: boolean
  ): Observable<any> {
    return new Observable((observer: any) => {
      this.removeScheduledNotification(id).subscribe((status: any) => {
        if (status.status === 'success') {
          this.scheduleNewNotification(data).subscribe((status: any) => {
            if (status.status === 'success') {
              observer.next(status.message_id);
            } else {
              observer.next(false);
            }
          });
        } else {
          console.log('Verwijderen niet gelukt');
          observer.next(false);
        }
      });
    });
  }

  public scheduleNewNotification(
    data: any,
    hideLoader?: boolean
  ): Observable<any> {
    let method: string = 'scheduler.addnotificationtoqueue';
    return this.apiGateway.post(
      this.settings.apiEndpoint + method,
      {},
      data,
      hideLoader
    );
  }

  public removeScheduledNotification(
    id: number,
    hideLoader?: boolean
  ): Observable<any> {
    let method: string = 'scheduler.removeNotificationFromQueue';
    return this.apiGateway.post(
      this.settings.apiEndpoint + method,
      {},
      { id: id },
      hideLoader
    );
  }

  public cancelTodayLogreminder(hideLoader?: boolean): Observable<any> {
    let method: string = 'scheduler.removeTodaysNotificationFromQueue';
    return this.apiGateway.post(
      this.settings.apiEndpoint + method,
      {},
      hideLoader
    );
  }
}
